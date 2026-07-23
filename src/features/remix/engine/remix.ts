import type { VektorDNA } from "@/features/lab/schemas/dna";
import { vektorDnaSchema } from "@/features/lab/schemas/dna";
import { clamp, createRandom } from "@/features/lab/engine/random";

function blend(a: number, b: number, weight: number) {
  return a * (1 - weight) + b * weight;
}

function blendHex(a: string, b: string, weight: number) {
  const values = [1, 3, 5].map((offset) => Math.round(blend(parseInt(a.slice(offset, offset + 2), 16), parseInt(b.slice(offset, offset + 2), 16), weight)));
  return `#${values.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export function mutateDNA(parent: VektorDNA, seed: string, rate = 0.06): VektorDNA {
  const random = createRandom(`${parent.seed}:mutation:${seed}`);
  const mutationRate = clamp(rate, 0.03, 0.12);
  const mutate = (value: number) => clamp(value + (random() * 2 - 1) * mutationRate);
  return vektorDnaSchema.parse({
    ...parent,
    seed,
    form: { ...parent.form, symmetry: mutate(parent.form.symmetry), density: mutate(parent.form.density), elongation: mutate(parent.form.elongation) },
    motion: { ...parent.motion, speed: mutate(parent.motion.speed), turbulence: mutate(parent.motion.turbulence), pulse: mutate(parent.motion.pulse), orbitStrength: mutate(parent.motion.orbitStrength) },
    particles: { ...parent.particles, spread: mutate(parent.particles.spread), trailLength: mutate(parent.particles.trailLength), attraction: mutate(parent.particles.attraction), repulsion: mutate(parent.particles.repulsion) },
    ancestry: { generation: (parent.ancestry?.generation ?? 1) + 1, parentIds: [parent.seed], mutationRate },
  });
}

export function fuseDNA(left: VektorDNA, right: VektorDNA, seed: string): VektorDNA {
  const random = createRandom(`${left.seed}:${right.seed}:${seed}`);
  const weight = 0.35 + random() * 0.3;
  const pick = <T,>(a: T, b: T) => (random() > 0.5 ? a : b);
  const mutationRate = 0.03 + random() * 0.09;
  const mixRecord = <T extends Record<string, number>>(a: T, b: T) => Object.fromEntries(Object.keys(a).map((key) => [key, clamp(blend(a[key], b[key], weight) + (random() * 2 - 1) * mutationRate)]));

  return vektorDnaSchema.parse({
    ...left,
    seed,
    archetype: pick(left.archetype, right.archetype),
    palette: {
      primary: blendHex(left.palette.primary, right.palette.primary, weight),
      secondary: blendHex(left.palette.secondary, right.palette.secondary, weight),
      accent: blendHex(left.palette.accent, right.palette.accent, weight),
      background: blendHex(left.palette.background, right.palette.background, weight),
    },
    form: { ...left.form, ...mixRecord(left.form, right.form), radius: blend(left.form.radius, right.form.radius, weight), coreSize: blend(left.form.coreSize, right.form.coreSize, weight) },
    motion: { ...left.motion, ...mixRecord(left.motion, right.motion), flowScale: blend(left.motion.flowScale, right.motion.flowScale, weight) },
    surface: mixRecord(left.surface, right.surface),
    particles: { ...left.particles, ...mixRecord({ spread: left.particles.spread, trailLength: left.particles.trailLength, attraction: left.particles.attraction, repulsion: left.particles.repulsion }, { spread: right.particles.spread, trailLength: right.particles.trailLength, attraction: right.particles.attraction, repulsion: right.particles.repulsion }), countTier: pick(left.particles.countTier, right.particles.countTier) },
    audio: { ...left.audio, enabled: left.audio.enabled || right.audio.enabled, ...mixRecord({ sensitivity: left.audio.sensitivity, bassResponse: left.audio.bassResponse, midResponse: left.audio.midResponse, trebleResponse: left.audio.trebleResponse }, { sensitivity: right.audio.sensitivity, bassResponse: right.audio.bassResponse, midResponse: right.audio.midResponse, trebleResponse: right.audio.trebleResponse }) },
    gesture: { signature: left.gesture.signature.map((value, index) => clamp(blend(value, right.gesture.signature[index], 0.25))) as VektorDNA["gesture"]["signature"], averageSpeed: blend(left.gesture.averageSpeed, right.gesture.averageSpeed, 0.25), averageCurvature: blend(left.gesture.averageCurvature, right.gesture.averageCurvature, 0.25), directionBias: blend(left.gesture.directionBias, right.gesture.directionBias, 0.25), intensity: blend(left.gesture.intensity, right.gesture.intensity, 0.25) },
    ancestry: { generation: Math.max(left.ancestry?.generation ?? 1, right.ancestry?.generation ?? 1) + 1, parentIds: [left.seed, right.seed], mutationRate },
  });
}
