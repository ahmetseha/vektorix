import type { Archetype, LegacyVektorDNA, VektorDNA, VisualDNA } from "../schemas/dna";
import { legacyVektorDnaSchema, vektorDnaSchema } from "../schemas/dna";
import type { GestureSummary } from "./gesture";
import { EMPTY_GESTURE } from "./gesture";
import { getPalette, type PaletteId } from "./palettes";
import { clamp, createRandom, randomBetween } from "./random";
import { deriveBehavioralDNA } from "./behavioral-dna";

const archetypeBias: Record<
  Archetype,
  { speed: number; turbulence: number; pulse: number; orbit: number }
> = {
  calm: { speed: 0.24, turbulence: 0.18, pulse: 0.35, orbit: 0.68 },
  chaotic: { speed: 0.78, turbulence: 0.92, pulse: 0.58, orbit: 0.28 },
  electric: { speed: 0.9, turbulence: 0.72, pulse: 0.86, orbit: 0.42 },
  organic: { speed: 0.42, turbulence: 0.48, pulse: 0.64, orbit: 0.74 },
};

function createVisualDNA({
  seed,
  archetype,
  paletteId,
  gesture,
  audioEnabled,
}: {
  seed: string;
  archetype: Archetype;
  paletteId: PaletteId;
  gesture: GestureSummary;
  audioEnabled: boolean;
}): VisualDNA {
  const random = createRandom(`${seed}:${archetype}:${gesture.signature.join("")}`);
  const palette = getPalette(paletteId);
  const bias = archetypeBias[archetype];
  const jitter = (center: number, amount = 0.12) =>
    clamp(center + randomBetween(random, -amount, amount));

  return {
    archetype,
    palette: {
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      background: palette.background,
    },
    form: {
      symmetry: jitter(0.35 + gesture.averageCurvature * 0.55),
      density: jitter(0.42 + gesture.intensity * 0.46),
      radius: randomBetween(random, 0.92, 1.18),
      elongation: jitter(0.24 + (1 - gesture.averageCurvature) * 0.55),
      shellThickness: randomBetween(random, 0.15, 0.68),
      coreSize: randomBetween(random, 0.82, 1.18),
    },
    motion: {
      speed: jitter((bias.speed + gesture.averageSpeed) / 2),
      turbulence: jitter((bias.turbulence + gesture.averageCurvature) / 2),
      pulse: jitter((bias.pulse + gesture.intensity) / 2),
      orbitStrength: jitter((bias.orbit + gesture.averageCurvature) / 2),
      flowScale: randomBetween(random, 0.72, 1.72),
      flowStrength: jitter(0.28 + gesture.averageSpeed * 0.62),
      elasticity: randomBetween(random, 0.3, 0.85),
    },
    surface: {
      roughness:
        archetype === "electric"
          ? randomBetween(random, 0.14, 0.36)
          : randomBetween(random, 0.28, 0.72),
      metallic:
        archetype === "electric"
          ? randomBetween(random, 0.45, 0.82)
          : randomBetween(random, 0.08, 0.48),
      fresnelStrength: randomBetween(random, 0.55, 0.95),
      glowStrength: jitter(0.45 + gesture.intensity * 0.44),
      opacity: 1,
    },
    particles: {
      countTier: "medium",
      spread: jitter(0.32 + Math.max(0, gesture.radialBias) * 0.5),
      trailLength: jitter(0.28 + gesture.averageSpeed * 0.6),
      attraction: jitter(0.52 + Math.max(0, -gesture.radialBias) * 0.35),
      repulsion: jitter(0.2 + Math.max(0, gesture.radialBias) * 0.55),
    },
    audio: {
      enabled: audioEnabled,
      sensitivity: 0.6,
      bassResponse: randomBetween(random, 0.55, 0.9),
      midResponse: randomBetween(random, 0.45, 0.85),
      trebleResponse: randomBetween(random, 0.5, 0.95),
    },
    gesture,
  };
}

export function createDNA({
  seed,
  archetype = "organic",
  paletteId = "void-orchid",
  gesture = EMPTY_GESTURE,
  audioEnabled = false,
}: {
  seed: string;
  archetype?: Archetype;
  paletteId?: PaletteId;
  gesture?: GestureSummary;
  audioEnabled?: boolean;
}): VektorDNA {
  const visual = createVisualDNA({
    seed,
    archetype,
    paletteId,
    gesture,
    audioEnabled,
  });
  return vektorDnaSchema.parse({
    version: 2,
    seed,
    visual,
    behavioral: deriveBehavioralDNA(seed, visual),
  });
}

function migrateLegacyDNA(legacy: LegacyVektorDNA): VektorDNA {
  const signatureVariety =
    legacy.gesture.signature.filter((value) => value >= 0.16).length /
    legacy.gesture.signature.length;
  const visual: VisualDNA = {
    archetype: legacy.archetype,
    palette: legacy.palette,
    form: legacy.form,
    motion: legacy.motion,
    surface: legacy.surface,
    particles: legacy.particles,
    audio: legacy.audio,
    gesture: {
      ...legacy.gesture,
      radialBias: legacy.gesture.directionBias,
      variety: signatureVariety,
    },
  };
  return vektorDnaSchema.parse({
    version: 2,
    seed: legacy.seed,
    visual,
    behavioral: deriveBehavioralDNA(legacy.seed, visual),
    ancestry: legacy.ancestry,
  });
}

export function parseVektorDNA(value: unknown): VektorDNA {
  const current = vektorDnaSchema.safeParse(value);
  if (current.success) return current.data;
  const legacy = legacyVektorDnaSchema.safeParse(value);
  if (legacy.success) return migrateLegacyDNA(legacy.data);
  throw current.error;
}

export function encodeDNA(dna: VektorDNA): string {
  const json = JSON.stringify(parseVektorDNA(dna));
  if (typeof window !== "undefined") {
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  }
  return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeDNA(value: string): VektorDNA {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  let json: string;
  if (typeof window !== "undefined") {
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    json = new TextDecoder().decode(bytes);
  } else {
    json = Buffer.from(value, "base64url").toString("utf8");
  }
  return parseVektorDNA(JSON.parse(json));
}
