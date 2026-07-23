import { describe, expect, it } from "vitest";
import { createDNA, parseVektorDNA } from "@/features/lab/engine/dna";
import { summarizeGesture } from "@/features/lab/engine/gesture";
import { createInitialVektorState } from "../engine/initial-state";
import { simulateVektorState } from "../engine/simulate-vektor-state";
import { biomeList, getBiomeDefinition } from "../registries/biomes";
import { formatMemory } from "../resolvers/format-memory";
import { vektorStateSchema } from "../schemas/state";
import { vektorMemorySchema } from "../schemas/memory";

const gesture = summarizeGesture([
  { x: -0.7, y: 0, time: 0, pressure: 0.2 },
  { x: 0, y: 0.8, time: 40, pressure: 0.5 },
  { x: 0.7, y: 0, time: 80, pressure: 0.7 },
  { x: 0, y: -0.8, time: 120, pressure: 0.4 },
  { x: -0.7, y: 0, time: 160, pressure: 0.6 },
]);

describe("living entity foundation", () => {
  it("derives deterministic normalized behavioral DNA", () => {
    const left = createDNA({ seed: "behavior-seed", archetype: "calm", gesture });
    const right = createDNA({ seed: "behavior-seed", archetype: "calm", gesture });
    expect(left.behavioral).toEqual(right.behavioral);
    for (const value of Object.values(left.behavioral)) {
      if (typeof value === "number") {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });

  it("rejects state values outside their boundaries", () => {
    const dna = createDNA({ seed: "bounded-state" });
    const state = createInitialVektorState({
      vektorId: "bounded-state",
      dna,
      biome: "void-garden",
      releasedAt: "2026-07-23T10:00:00.000Z",
    });
    expect(() => vektorStateSchema.parse({ ...state, energy: 1.01 })).toThrow();
    expect(() => vektorStateSchema.parse({ ...state, stability: -0.01 })).toThrow();
  });

  it("keeps the four-biome registry valid and complete", () => {
    expect(biomeList.map((biome) => biome.id)).toEqual([
      "void-garden",
      "electric-storm",
      "silent-ocean",
      "crystal-rift",
    ]);
    for (const biome of biomeList) {
      expect(biome.possibleTraits.length).toBeGreaterThan(0);
      expect(biome.environmentalRules.evolutionPerHour).toBeGreaterThan(0);
    }
  });

  it("simulates the same input reproducibly", () => {
    const dna = createDNA({ seed: "simulation-seed", gesture });
    const state = createInitialVektorState({
      vektorId: "simulation-record",
      dna,
      biome: "electric-storm",
      releasedAt: "2026-07-23T10:00:00.000Z",
    });
    const input = {
      dna,
      state,
      biome: getBiomeDefinition("electric-storm"),
      elapsedTime: 6 * 60 * 60 * 1000,
      seed: "clock-tick-01",
    };
    expect(simulateVektorState(input)).toEqual(simulateVektorState(input));
  });

  it("formats memories without exposing metadata", () => {
    const memory = vektorMemorySchema.parse({
      id: "memory-1",
      vektorId: "vektor-1",
      type: "released",
      title: "Released",
      description: "Released into the Silent Ocean.",
      metadata: { hidden: "raw-value" },
      importance: 1,
      createdAt: "2026-07-23T10:00:00.000Z",
    });
    expect(formatMemory(memory)).toBe("Released into the Silent Ocean.");
    expect(formatMemory(memory)).not.toContain("raw-value");
  });

  it("migrates legacy visual DNA into version 2", () => {
    const current = createDNA({ seed: "legacy-source", gesture });
    const legacy = {
      version: 1 as const,
      seed: current.seed,
      archetype: current.visual.archetype,
      palette: current.visual.palette,
      form: current.visual.form,
      motion: current.visual.motion,
      surface: current.visual.surface,
      particles: current.visual.particles,
      audio: current.visual.audio,
      gesture: {
        signature: current.visual.gesture.signature,
        averageSpeed: current.visual.gesture.averageSpeed,
        averageCurvature: current.visual.gesture.averageCurvature,
        directionBias: current.visual.gesture.directionBias,
        intensity: current.visual.gesture.intensity,
      },
    };
    const migrated = parseVektorDNA(legacy);
    expect(migrated.version).toBe(2);
    expect(migrated.visual.motion).toEqual(current.visual.motion);
    expect(migrated.behavioral.preferredBiome).toBeTruthy();
  });
});
