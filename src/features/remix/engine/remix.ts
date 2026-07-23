import type { VektorDNA, VisualDNA } from "@/features/lab/schemas/dna";
import { vektorDnaSchema } from "@/features/lab/schemas/dna";
import { deriveBehavioralDNA } from "@/features/lab/engine/behavioral-dna";
import { clamp, createRandom } from "@/features/lab/engine/random";

function blend(a: number, b: number, weight: number) {
  return a * (1 - weight) + b * weight;
}

function blendHex(a: string, b: string, weight: number) {
  const values = [1, 3, 5].map((offset) =>
    Math.round(
      blend(
        parseInt(a.slice(offset, offset + 2), 16),
        parseInt(b.slice(offset, offset + 2), 16),
        weight,
      ),
    ),
  );
  return `#${values.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export function mutateDNA(parent: VektorDNA, seed: string, rate = 0.06): VektorDNA {
  const random = createRandom(`${parent.seed}:mutation:${seed}`);
  const mutationRate = clamp(rate, 0.03, 0.12);
  const mutate = (value: number) => clamp(value + (random() * 2 - 1) * mutationRate);
  const visual: VisualDNA = {
    ...parent.visual,
    form: {
      ...parent.visual.form,
      symmetry: mutate(parent.visual.form.symmetry),
      density: mutate(parent.visual.form.density),
      elongation: mutate(parent.visual.form.elongation),
    },
    motion: {
      ...parent.visual.motion,
      speed: mutate(parent.visual.motion.speed),
      turbulence: mutate(parent.visual.motion.turbulence),
      pulse: mutate(parent.visual.motion.pulse),
      orbitStrength: mutate(parent.visual.motion.orbitStrength),
    },
    particles: {
      ...parent.visual.particles,
      spread: mutate(parent.visual.particles.spread),
      trailLength: mutate(parent.visual.particles.trailLength),
      attraction: mutate(parent.visual.particles.attraction),
      repulsion: mutate(parent.visual.particles.repulsion),
    },
  };
  return vektorDnaSchema.parse({
    version: 2,
    seed,
    visual,
    behavioral: deriveBehavioralDNA(seed, visual),
    ancestry: {
      generation: (parent.ancestry?.generation ?? 1) + 1,
      parentIds: [parent.seed],
      mutationRate,
    },
  });
}

export function fuseDNA(first: VektorDNA, second: VektorDNA, seed: string): VektorDNA {
  const [left, right] =
    first.seed.localeCompare(second.seed) <= 0 ? [first, second] : [second, first];
  const random = createRandom(`${left.seed}:${right.seed}:${seed}`);
  const weight = 0.35 + random() * 0.3;
  const pick = <T>(a: T, b: T) => (random() > 0.5 ? a : b);
  const mutationRate = 0.03 + random() * 0.09;
  const mix = (a: number, b: number) =>
    clamp(blend(a, b, weight) + (random() * 2 - 1) * mutationRate);
  const leftVisual = left.visual;
  const rightVisual = right.visual;
  const visual: VisualDNA = {
    archetype: pick(leftVisual.archetype, rightVisual.archetype),
    palette: {
      primary: blendHex(leftVisual.palette.primary, rightVisual.palette.primary, weight),
      secondary: blendHex(leftVisual.palette.secondary, rightVisual.palette.secondary, weight),
      accent: blendHex(leftVisual.palette.accent, rightVisual.palette.accent, weight),
      background: blendHex(leftVisual.palette.background, rightVisual.palette.background, weight),
    },
    form: {
      symmetry: mix(leftVisual.form.symmetry, rightVisual.form.symmetry),
      density: mix(leftVisual.form.density, rightVisual.form.density),
      radius: blend(leftVisual.form.radius, rightVisual.form.radius, weight),
      elongation: mix(leftVisual.form.elongation, rightVisual.form.elongation),
      shellThickness: mix(leftVisual.form.shellThickness, rightVisual.form.shellThickness),
      coreSize: blend(leftVisual.form.coreSize, rightVisual.form.coreSize, weight),
    },
    motion: {
      speed: mix(leftVisual.motion.speed, rightVisual.motion.speed),
      turbulence: mix(leftVisual.motion.turbulence, rightVisual.motion.turbulence),
      pulse: mix(leftVisual.motion.pulse, rightVisual.motion.pulse),
      orbitStrength: mix(leftVisual.motion.orbitStrength, rightVisual.motion.orbitStrength),
      flowScale: blend(leftVisual.motion.flowScale, rightVisual.motion.flowScale, weight),
      flowStrength: mix(leftVisual.motion.flowStrength, rightVisual.motion.flowStrength),
      elasticity: mix(leftVisual.motion.elasticity, rightVisual.motion.elasticity),
    },
    surface: {
      roughness: mix(leftVisual.surface.roughness, rightVisual.surface.roughness),
      metallic: mix(leftVisual.surface.metallic, rightVisual.surface.metallic),
      fresnelStrength: mix(leftVisual.surface.fresnelStrength, rightVisual.surface.fresnelStrength),
      glowStrength: mix(leftVisual.surface.glowStrength, rightVisual.surface.glowStrength),
      opacity: mix(leftVisual.surface.opacity, rightVisual.surface.opacity),
    },
    particles: {
      countTier: pick(leftVisual.particles.countTier, rightVisual.particles.countTier),
      spread: mix(leftVisual.particles.spread, rightVisual.particles.spread),
      trailLength: mix(leftVisual.particles.trailLength, rightVisual.particles.trailLength),
      attraction: mix(leftVisual.particles.attraction, rightVisual.particles.attraction),
      repulsion: mix(leftVisual.particles.repulsion, rightVisual.particles.repulsion),
    },
    audio: {
      enabled: leftVisual.audio.enabled || rightVisual.audio.enabled,
      sensitivity: mix(leftVisual.audio.sensitivity, rightVisual.audio.sensitivity),
      bassResponse: mix(leftVisual.audio.bassResponse, rightVisual.audio.bassResponse),
      midResponse: mix(leftVisual.audio.midResponse, rightVisual.audio.midResponse),
      trebleResponse: mix(leftVisual.audio.trebleResponse, rightVisual.audio.trebleResponse),
    },
    gesture: {
      signature: leftVisual.gesture.signature.map((value, index) =>
        clamp(blend(value, rightVisual.gesture.signature[index], 0.25)),
      ) as VisualDNA["gesture"]["signature"],
      averageSpeed: blend(leftVisual.gesture.averageSpeed, rightVisual.gesture.averageSpeed, 0.25),
      averageCurvature: blend(
        leftVisual.gesture.averageCurvature,
        rightVisual.gesture.averageCurvature,
        0.25,
      ),
      directionBias: blend(
        leftVisual.gesture.directionBias,
        rightVisual.gesture.directionBias,
        0.25,
      ),
      radialBias: blend(leftVisual.gesture.radialBias, rightVisual.gesture.radialBias, 0.25),
      variety: blend(leftVisual.gesture.variety, rightVisual.gesture.variety, 0.25),
      intensity: blend(leftVisual.gesture.intensity, rightVisual.gesture.intensity, 0.25),
    },
  };

  return vektorDnaSchema.parse({
    version: 2,
    seed,
    visual,
    behavioral: deriveBehavioralDNA(seed, visual),
    ancestry: {
      generation: Math.max(left.ancestry?.generation ?? 1, right.ancestry?.generation ?? 1) + 1,
      parentIds: [left.seed, right.seed],
      mutationRate,
    },
  });
}
