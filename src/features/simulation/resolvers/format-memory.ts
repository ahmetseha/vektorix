import type { VektorMemory } from "../schemas/memory";

export function formatMemory(memory: VektorMemory): string {
  return memory.description;
}
