import "server-only";

import { randomUUID } from "node:crypto";
import type { GeneratedMemory, VektorMemory } from "@/features/simulation/schemas/memory";
import { vektorMemorySchema } from "@/features/simulation/schemas/memory";

export const memoryService = {
  materialize(memory: GeneratedMemory): VektorMemory {
    return vektorMemorySchema.parse({ ...memory, id: randomUUID() });
  },
  append(target: VektorMemory[], generated: GeneratedMemory[]): VektorMemory[] {
    const memories = generated.map((memory) => this.materialize(memory));
    target.push(...memories);
    this.sort(target);
    return memories;
  },
  sort(target: VektorMemory[]) {
    target.sort(
      (left, right) =>
        right.createdAt.localeCompare(left.createdAt) ||
        right.importance - left.importance,
    );
    return target;
  },
};
