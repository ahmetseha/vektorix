import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { sampleVektors } from "@/features/vektors/samples";
import type { PublishVektorInput } from "@/features/lab/schemas/dna";
import type { VektorRecord } from "@/features/vektors/types";

type RepositoryState = { records: Map<string, VektorRecord>; reactions: Set<string>; reports: Set<string> };

const root = globalThis as typeof globalThis & { __vektorixRepository?: RepositoryState };
const state = root.__vektorixRepository ?? {
  records: new Map(sampleVektors.map((record) => [record.slug, record])),
  reactions: new Set<string>(),
  reports: new Set<string>(),
};
root.__vektorixRepository = state;

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "unnamed-vektor";
}

function sanitizeText(value: string) {
  return value.replace(/[<>\u0000-\u001f]/g, "").trim();
}

export const vektorRepository = {
  list() {
    return Array.from(state.records.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  get(slug: string) {
    return state.records.get(slug);
  },
  create(input: PublishVektorInput): VektorRecord {
    const base = slugify(input.name);
    const suffix = createHash("sha256").update(`${input.dna.seed}:${Date.now()}`).digest("hex").slice(0, 6);
    const slug = state.records.has(base) ? `${base}-${suffix}` : base;
    const record: VektorRecord = {
      id: randomUUID(),
      slug,
      name: sanitizeText(input.name),
      description: sanitizeText(input.description),
      creator: "Anonymous researcher",
      dna: input.dna,
      previewImageUrl: input.previewImageUrl,
      createdAt: new Date().toISOString(),
      reactionCount: 0,
      remixCount: 0,
      generation: input.dna.ancestry?.generation ?? 1,
    };
    state.records.set(slug, record);
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
