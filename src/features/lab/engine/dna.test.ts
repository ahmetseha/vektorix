import { describe, expect, it } from "vitest";
import { createDNA, decodeDNA, encodeDNA } from "./dna";
import { summarizeGesture } from "./gesture";
import { selectQuality } from "./quality";
import { fuseDNA, mutateDNA } from "@/features/remix/engine/remix";

describe("deterministic organism engine", () => {
  const gesture = summarizeGesture([
    { x: -0.5, y: 0, time: 0, pressure: 0.2 },
    { x: 0, y: 0.5, time: 16, pressure: 0.4 },
    { x: 0.5, y: 0, time: 32, pressure: 0.6 },
    { x: 0, y: -0.5, time: 48, pressure: 0.8 },
  ]);

  it("returns identical DNA for identical inputs", () => {
    expect(createDNA({ seed: "ion-moth", archetype: "electric", gesture })).toEqual(
      createDNA({ seed: "ion-moth", archetype: "electric", gesture }),
    );
  });

  it("round trips DNA without loss", () => {
    const dna = createDNA({ seed: "pale-signal", gesture });
    expect(decodeDNA(encodeDNA(dna))).toEqual(dna);
  });

  it("keeps mutation bounded and deterministic", () => {
    const parent = createDNA({ seed: "parent", gesture });
    expect(mutateDNA(parent, "child")).toEqual(mutateDNA(parent, "child"));
    expect(mutateDNA(parent, "child").visual.motion.turbulence).toBeGreaterThanOrEqual(0);
  });

  it("fuses the same parents reproducibly", () => {
    const left = createDNA({ seed: "left", archetype: "calm" });
    const right = createDNA({ seed: "right", archetype: "chaotic" });
    expect(fuseDNA(left, right, "fusion")).toEqual(fuseDNA(left, right, "fusion"));
  });

  it("selects conservative quality for reduced motion", () => {
    expect(
      selectQuality({
        width: 1200,
        height: 800,
        dpr: 2,
        cores: 12,
        memory: 16,
        reducedMotion: true,
      }),
    ).toBe("low");
  });
});
