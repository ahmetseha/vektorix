import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { parseVektorDNA } from "@/features/lab/engine/dna";
import type { PublishVektorInput } from "@/features/lab/schemas/dna";
import {
  createInitialVektorState,
  createReleaseMemories,
} from "@/features/simulation/engine/initial-state";
import { simulateVektorState } from "@/features/simulation/engine/simulate-vektor-state";
import { getBiomeDefinition } from "@/features/simulation/registries/biomes";
import type { BiomeType } from "@/features/simulation/schemas/biome";
import { vektorMemorySchema } from "@/features/simulation/schemas/memory";
import { vektorStateSchema } from "@/features/simulation/schemas/state";
import { sampleVektors } from "@/features/vektors/samples";
import type { VektorRecord } from "@/features/vektors/types";
import { database } from "@/server/db/client";
import {
  reports,
  vektorMemories,
  vektorReactions,
  vektors,
  vektorStates,
} from "@/server/db/schema";
import { memoryService } from "./memory-service";

type RepositoryState = {
  records: Map<string, VektorRecord>;
  reactions: Set<string>;
  reports: Set<string>;
};

const root = globalThis as typeof globalThis & {
  __vektorixRepository?: RepositoryState;
};
const state = root.__vektorixRepository ?? {
  records: new Map(sampleVektors.map((record) => [record.slug, record])),
  reactions: new Set<string>(),
  reports: new Set<string>(),
};
root.__vektorixRepository = state;

function normalizeRecord(record: VektorRecord): VektorRecord {
  const dna = parseVektorDNA(record.dna);
  const releasedAt = record.releasedAt ?? record.createdAt;
  const lifecycleState =
    record.state ??
    createInitialVektorState({
      vektorId: record.id,
      dna,
      biome: dna.behavioral.preferredBiome,
      releasedAt,
    });
  const memories =
    record.memories ??
    createReleaseMemories({
      vektorId: record.id,
      biome: lifecycleState.currentBiome,
      createdAt: releasedAt,
    })
      .map((memory) => memoryService.materialize(memory))
      .reverse();
  return { ...record, dna, releasedAt, state: lifecycleState, memories };
}

for (const [slug, record] of state.records) {
  state.records.set(slug, normalizeRecord(record));
}

function slugify(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "unnamed-vektor"
  );
}

function sanitizeText(value: string) {
  return value.replace(/[<>\u0000-\u001f]/g, "").trim();
}

function stateValues(recordState: VektorRecord["state"]) {
  return {
    vektorId: recordState.vektorId,
    currentBiome: recordState.currentBiome,
    energy: recordState.energy,
    stability: recordState.stability,
    evolutionPath: recordState.evolutionPath,
    evolutionStage: recordState.evolutionStage,
    activeMutationId: recordState.activeMutationId,
    status: recordState.status,
    lastSimulationAt: new Date(recordState.lastSimulationAt),
    updatedAt: new Date(recordState.updatedAt),
  };
}

function memoryValues(memory: VektorRecord["memories"][number]) {
  return {
    id: memory.id,
    vektorId: memory.vektorId,
    type: memory.type,
    title: memory.title,
    description: memory.description,
    metadata: memory.metadata,
    importance: memory.importance,
    createdAt: new Date(memory.createdAt),
  };
}

async function getPersistentRecord(slug: string): Promise<VektorRecord | undefined> {
  if (!database) return undefined;
  const [row] = await database.select().from(vektors).where(eq(vektors.slug, slug)).limit(1);
  if (!row) return undefined;

  const dna = parseVektorDNA(row.dna);
  const releasedAt = (row.publishedAt ?? row.createdAt).toISOString();
  let [stateRow] = await database
    .select()
    .from(vektorStates)
    .where(eq(vektorStates.vektorId, row.id))
    .limit(1);
  let memoryRows = await database
    .select()
    .from(vektorMemories)
    .where(eq(vektorMemories.vektorId, row.id))
    .orderBy(desc(vektorMemories.createdAt), desc(vektorMemories.importance));

  if (!stateRow || memoryRows.length === 0) {
    const lifecycleState = createInitialVektorState({
      vektorId: row.id,
      dna,
      biome: dna.behavioral.preferredBiome,
      releasedAt,
    });
    const releaseMemories = createReleaseMemories({
      vektorId: row.id,
      biome: lifecycleState.currentBiome,
      createdAt: releasedAt,
    }).map((memory) => memoryService.materialize(memory));
    await database.transaction(async (transaction) => {
      if (!stateRow) {
        await transaction
          .insert(vektorStates)
          .values(stateValues({ ...lifecycleState, vektorId: row.id }))
          .onConflictDoNothing();
      }
      if (memoryRows.length === 0) {
        await transaction.insert(vektorMemories).values(releaseMemories.map(memoryValues));
      }
    });
    [stateRow] = await database
      .select()
      .from(vektorStates)
      .where(eq(vektorStates.vektorId, row.id))
      .limit(1);
    memoryRows = await database
      .select()
      .from(vektorMemories)
      .where(eq(vektorMemories.vektorId, row.id))
      .orderBy(desc(vektorMemories.createdAt), desc(vektorMemories.importance));
  }

  if (!stateRow) return undefined;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    creator: "Anonymous researcher",
    dna,
    previewImageUrl: row.previewImageUrl ?? undefined,
    createdAt: row.createdAt.toISOString(),
    releasedAt,
    reactionCount: row.reactionCount,
    remixCount: row.remixCount,
    generation: row.generation,
    state: vektorStateSchema.parse({
      vektorId: stateRow.vektorId,
      currentBiome: stateRow.currentBiome,
      energy: stateRow.energy,
      stability: stateRow.stability,
      evolutionPath: stateRow.evolutionPath,
      evolutionStage: stateRow.evolutionStage,
      activeMutationId: stateRow.activeMutationId,
      status: stateRow.status,
      lastSimulationAt: stateRow.lastSimulationAt.toISOString(),
      updatedAt: stateRow.updatedAt.toISOString(),
    }),
    memories: memoryRows.map((memory) =>
      vektorMemorySchema.parse({
        ...memory,
        createdAt: memory.createdAt.toISOString(),
      }),
    ),
  };
}

async function createPersistentRecord(input: PublishVektorInput): Promise<VektorRecord> {
  if (!database) throw new Error("Persistent database is unavailable.");
  const base = slugify(input.name);
  const suffix = createHash("sha256")
    .update(`${input.dna.seed}:${Date.now()}`)
    .digest("hex")
    .slice(0, 6);
  const existing = await database
    .select({ id: vektors.id })
    .from(vektors)
    .where(eq(vektors.slug, base))
    .limit(1);
  const slug = existing.length ? `${base}-${suffix}` : base;
  const id = randomUUID();
  const releasedAt = new Date().toISOString();
  const lifecycleState = createInitialVektorState({
    vektorId: id,
    dna: input.dna,
    biome: input.initialBiome,
    releasedAt,
  });
  const memories = createReleaseMemories({
    vektorId: id,
    biome: input.initialBiome,
    createdAt: releasedAt,
  })
    .map((memory) => memoryService.materialize(memory))
    .reverse();
  const record: VektorRecord = {
    id,
    slug,
    name: sanitizeText(input.name),
    description: sanitizeText(input.description),
    creator: "Anonymous researcher",
    dna: input.dna,
    previewImageUrl: input.previewImageUrl,
    createdAt: releasedAt,
    releasedAt,
    reactionCount: 0,
    remixCount: 0,
    generation: input.dna.ancestry?.generation ?? 1,
    state: lifecycleState,
    memories,
  };
  await database.transaction(async (transaction) => {
    await transaction.insert(vektors).values({
      id,
      slug,
      name: record.name,
      description: record.description,
      archetype: input.dna.visual.archetype,
      dnaVersion: input.dna.version,
      dna: input.dna,
      previewImageUrl: input.previewImageUrl,
      visibility: "public",
      status: "published",
      generation: record.generation,
      createdAt: new Date(releasedAt),
      updatedAt: new Date(releasedAt),
      publishedAt: new Date(releasedAt),
    });
    await transaction.insert(vektorStates).values(stateValues(lifecycleState));
    await transaction.insert(vektorMemories).values(memories.map(memoryValues));
  });
  return record;
}

function createMemoryRecord(input: PublishVektorInput): VektorRecord {
  const base = slugify(input.name);
  const suffix = createHash("sha256")
    .update(`${input.dna.seed}:${Date.now()}`)
    .digest("hex")
    .slice(0, 6);
  const slug = state.records.has(base) ? `${base}-${suffix}` : base;
  const id = randomUUID();
  const releasedAt = new Date().toISOString();
  const lifecycleState = createInitialVektorState({
    vektorId: id,
    dna: input.dna,
    biome: input.initialBiome,
    releasedAt,
  });
  const memories = createReleaseMemories({
    vektorId: id,
    biome: input.initialBiome,
    createdAt: releasedAt,
  })
    .map((memory) => memoryService.materialize(memory))
    .reverse();
  const record: VektorRecord = {
    id,
    slug,
    name: sanitizeText(input.name),
    description: sanitizeText(input.description),
    creator: "Anonymous researcher",
    dna: input.dna,
    previewImageUrl: input.previewImageUrl,
    createdAt: releasedAt,
    releasedAt,
    reactionCount: 0,
    remixCount: 0,
    generation: input.dna.ancestry?.generation ?? 1,
    state: lifecycleState,
    memories,
  };
  state.records.set(slug, record);
  return record;
}

export const vektorRepository = {
  async list() {
    const localRecords = Array.from(state.records.values()).map(normalizeRecord);
    if (!database) {
      return localRecords.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const rows = await database
      .select({ slug: vektors.slug })
      .from(vektors)
      .where(eq(vektors.status, "published"))
      .orderBy(desc(vektors.publishedAt));
    const persistentRecords = (
      await Promise.all(rows.map(({ slug }) => getPersistentRecord(slug)))
    ).filter((record): record is VektorRecord => Boolean(record));
    const persistentSlugs = new Set(persistentRecords.map((record) => record.slug));
    return [
      ...persistentRecords,
      ...localRecords.filter((record) => !persistentSlugs.has(record.slug)),
    ];
  },

  async get(slug: string) {
    return (
      (await getPersistentRecord(slug)) ??
      (state.records.has(slug) ? normalizeRecord(state.records.get(slug)!) : undefined)
    );
  },

  async create(input: PublishVektorInput): Promise<VektorRecord> {
    return database ? createPersistentRecord(input) : createMemoryRecord(input);
  },

  async simulate(slug: string, elapsedTime: number, seed: string) {
    const record = await this.get(slug);
    if (!record) return null;
    const result = simulateVektorState({
      dna: record.dna,
      state: record.state,
      biome: getBiomeDefinition(record.state.currentBiome),
      elapsedTime,
      seed,
    });
    const generated = result.generatedMemories.map((memory) =>
      memoryService.materialize(memory),
    );
    record.state = result.nextState;
    record.memories.push(...generated);
    memoryService.sort(record.memories);
    if (database && !state.records.has(slug)) {
      await database.transaction(async (transaction) => {
        await transaction
          .update(vektorStates)
          .set(stateValues(result.nextState))
          .where(eq(vektorStates.vektorId, record.id));
        if (generated.length) {
          await transaction.insert(vektorMemories).values(generated.map(memoryValues));
        }
      });
    }
    return { record, events: result.triggeredEvents };
  },

  async travel(slug: string, destination: BiomeType) {
    const record = await this.get(slug);
    if (!record) return null;
    const origin = record.state.currentBiome;
    if (origin === destination) return record;
    const now = new Date().toISOString();
    const originDefinition = getBiomeDefinition(origin);
    const destinationDefinition = getBiomeDefinition(destination);
    record.state = vektorStateSchema.parse({
      ...record.state,
      currentBiome: destination,
      status: "active",
      energy: Math.max(0, Math.min(1, record.state.energy - 0.025)),
      stability: Math.max(
        0,
        Math.min(
          1,
          record.state.stability +
            (destination === record.dna.behavioral.preferredBiome ? 0.03 : -0.015),
        ),
      ),
      updatedAt: now,
      lastSimulationAt: now,
    });
    const generated = [
      memoryService.materialize({
        vektorId: record.id,
        type: "left-biome",
        title: `Left ${originDefinition.name}`,
        description: `Left the ${originDefinition.name} and followed a new signal.`,
        metadata: { version: 1, biome: origin },
        importance: 0.56,
        createdAt: now,
      }),
      memoryService.materialize({
        vektorId: record.id,
        type: "entered-biome",
        title: `Entered ${destinationDefinition.name}`,
        description: `Entered the ${destinationDefinition.name}.`,
        metadata: { version: 1, biome: destination },
        importance: 0.78,
        createdAt: now,
      }),
    ];
    record.memories.push(...generated);
    memoryService.sort(record.memories);
    if (database && !state.records.has(slug)) {
      await database.transaction(async (transaction) => {
        await transaction
          .update(vektorStates)
          .set(stateValues(record.state))
          .where(eq(vektorStates.vektorId, record.id));
        await transaction.insert(vektorMemories).values(generated.map(memoryValues));
      });
    } else {
      state.records.set(slug, record);
    }
    return record;
  },

  async toggleReaction(slug: string, sessionId: string) {
    const record = await this.get(slug);
    if (!record) return null;
    if (!database || state.records.has(slug)) {
      const key = `${slug}:${sessionId}`;
      const active = !state.reactions.has(key);
      if (active) state.reactions.add(key);
      else state.reactions.delete(key);
      record.reactionCount = Math.max(0, record.reactionCount + (active ? 1 : -1));
      state.records.set(slug, record);
      return { active, count: record.reactionCount };
    }
    const [existing] = await database
      .select({ id: vektorReactions.id })
      .from(vektorReactions)
      .where(
        and(
          eq(vektorReactions.vektorId, record.id),
          eq(vektorReactions.anonymousSessionId, sessionId),
        ),
      )
      .limit(1);
    const active = !existing;
    const [updated] = await database.transaction(async (transaction) => {
      if (existing) {
        await transaction.delete(vektorReactions).where(eq(vektorReactions.id, existing.id));
      } else {
        await transaction.insert(vektorReactions).values({
          vektorId: record.id,
          anonymousSessionId: sessionId,
          type: "pulse",
        });
      }
      return transaction
        .update(vektors)
        .set({
          reactionCount: sql`greatest(0, ${vektors.reactionCount} + ${active ? 1 : -1})`,
          updatedAt: new Date(),
        })
        .where(eq(vektors.id, record.id))
        .returning({ count: vektors.reactionCount });
    });
    return { active, count: updated.count };
  },

  async report(slug: string, sessionId: string) {
    const record = await this.get(slug);
    if (!record) return false;
    if (!database || state.records.has(slug)) {
      state.reports.add(`${slug}:${sessionId}`);
      return true;
    }
    await database.insert(reports).values({
      vektorId: record.id,
      reason: "other",
      details: `anonymous-session:${sessionId}`,
      status: "open",
    });
    return true;
  },
};
