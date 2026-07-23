import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { sampleVektors } from "@/features/vektors/samples";
import type { PublishVektorInput } from "@/features/lab/schemas/dna";
import { parseVektorDNA } from "@/features/lab/engine/dna";
import type { VektorRecord } from "@/features/vektors/types";
import {
  createInitialVektorState,
  createReleaseMemories,
} from "@/features/simulation/engine/initial-state";
import { getBiomeDefinition } from "@/features/simulation/registries/biomes";
import { simulateVektorState } from "@/features/simulation/engine/simulate-vektor-state";
import { memoryService } from "./memory-service";
import type { BiomeType } from "@/features/simulation/schemas/biome";

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

export const vektorRepository = {
  list() {
    return Array.from(state.records.values())
      .map(normalizeRecord)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  get(slug: string) {
    const record = state.records.get(slug);
    return record ? normalizeRecord(record) : undefined;
  },
  create(input: PublishVektorInput): VektorRecord {
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
  },
  simulate(slug: string, elapsedTime: number, seed: string) {
    const record = state.records.get(slug);
    if (!record) return null;
    const result = simulateVektorState({
      dna: record.dna,
      state: record.state,
      biome: getBiomeDefinition(record.state.currentBiome),
      elapsedTime,
      seed,
    });
    record.state = result.nextState;
    memoryService.append(record.memories, result.generatedMemories);
    return { record, events: result.triggeredEvents };
  },
  travel(slug: string, destination: BiomeType) {
    const record = state.records.get(slug);
    if (!record) return null;
    const origin = record.state.currentBiome;
    if (origin === destination) return record;
    const now = new Date().toISOString();
    const originDefinition = getBiomeDefinition(origin);
    const destinationDefinition = getBiomeDefinition(destination);
    record.state = {
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
    };
    memoryService.append(record.memories, [
      {
        vektorId: record.id,
        type: "left-biome",
        title: `Left ${originDefinition.name}`,
        description: `Left the ${originDefinition.name} and followed a new signal.`,
        metadata: { version: 1, biome: origin },
        importance: 0.56,
        createdAt: now,
      },
      {
        vektorId: record.id,
        type: "entered-biome",
        title: `Entered ${destinationDefinition.name}`,
        description: `Entered the ${destinationDefinition.name}.`,
        metadata: { version: 1, biome: destination },
        importance: 0.78,
        createdAt: now,
      },
    ]);
    return record;
  },
  toggleReaction(slug: string, sessionId: string) {
    const record = state.records.get(slug);
    if (!record) return null;
    const key = `${slug}:${sessionId}`;
    const active = !state.reactions.has(key);
    if (active) state.reactions.add(key);
    else state.reactions.delete(key);
    record.reactionCount = Math.max(0, record.reactionCount + (active ? 1 : -1));
    return { active, count: record.reactionCount };
  },
  report(slug: string, sessionId: string) {
    if (!state.records.has(slug)) return false;
    state.reports.add(`${slug}:${sessionId}`);
    return true;
  },
};
