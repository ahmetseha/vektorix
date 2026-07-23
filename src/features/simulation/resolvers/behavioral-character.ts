import type { BehavioralDNA } from "@/features/lab/schemas/dna";

function band(value: number, low: string, medium: string, high: string): string {
  if (value < 0.34) return low;
  if (value < 0.68) return medium;
  return high;
}

export function formatBehavioralCharacter(behavioral: BehavioralDNA) {
  return [
    {
      label: "Curiosity",
      value: band(behavioral.curiosity, "Still", "Searching", "Restless"),
    },
    {
      label: "Sociability",
      value: band(behavioral.sociability, "Reserved", "Receptive", "Open"),
    },
    {
      label: "Stability",
      value: band(behavioral.stability, "Volatile", "Balanced", "Steady"),
    },
    {
      label: "Adaptability",
      value: band(behavioral.adaptability, "Rooted", "Responsive", "High"),
    },
    {
      label: "Resonance",
      value: band(behavioral.resonanceFrequency, "Low", "Layered", "Deep"),
    },
  ] as const;
}
