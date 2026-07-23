export type QualityTier = "low" | "medium" | "high";

export type CapabilitySignals = {
  memory?: number;
  cores?: number;
  width: number;
  height: number;
  dpr: number;
  reducedMotion: boolean;
};

export function selectQuality(signals: CapabilitySignals): QualityTier {
  if (signals.reducedMotion) return "low";
  const pixels = signals.width * signals.height * Math.min(signals.dpr, 2);
  const weakMemory = signals.memory !== undefined && signals.memory <= 4;
  const weakCpu = signals.cores !== undefined && signals.cores <= 4;
  if (weakMemory || weakCpu || pixels > 5_500_000) return "low";
  if ((signals.memory ?? 8) >= 8 && (signals.cores ?? 8) >= 8 && pixels < 3_800_000) return "high";
  return "medium";
}

export const qualityConfig: Record<QualityTier, { particles: number; dpr: [number, number]; post: boolean; membrane: boolean }> = {
  low: { particles: 4_500, dpr: [0.75, 1], post: false, membrane: false },
  medium: { particles: 12_000, dpr: [1, 1.5], post: true, membrane: true },
  high: { particles: 24_000, dpr: [1, 2], post: true, membrane: true },
};
