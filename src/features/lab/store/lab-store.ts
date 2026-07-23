"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Archetype, VektorDNA } from "../schemas/dna";
import type { GestureSummary } from "../engine/gesture";
import { EMPTY_GESTURE } from "../engine/gesture";
import { createDNA, parseVektorDNA } from "../engine/dna";
import type { PaletteId } from "../engine/palettes";
import type { BiomeType } from "@/features/simulation/schemas/biome";

export const labStages = [
  "Awaken",
  "Shape",
  "Charge",
  "Color",
  "Sound",
  "Stabilize",
  "Name",
  "Destination",
] as const;

type LabState = {
  stage: number;
  seed: string;
  archetype: Archetype;
  paletteId: PaletteId;
  dna: VektorDNA;
  name: string;
  description: string;
  paused: boolean;
  audioEnabled: boolean;
  destination: BiomeType;
  lastUpdated: number;
  hasHydrated: boolean;
  setStage: (stage: number) => void;
  next: () => void;
  previous: () => void;
  setArchetype: (archetype: Archetype) => void;
  setPalette: (paletteId: PaletteId) => void;
  applyGesture: (gesture: GestureSummary) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setDestination: (destination: BiomeType) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  togglePaused: () => void;
  loadDNA: (dna: VektorDNA) => void;
  startOver: () => void;
  markHydrated: () => void;
};

function newSeed() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `vektor-${Date.now()}`;
}

function initial(seed = newSeed()) {
  return {
    stage: 0,
    seed,
    archetype: "organic" as Archetype,
    paletteId: "void-orchid" as PaletteId,
    dna: createDNA({ seed, gesture: EMPTY_GESTURE }),
    name: "",
    description: "",
    paused: false,
    audioEnabled: false,
    destination: "void-garden" as BiomeType,
    lastUpdated: Date.now(),
  };
}

export const useLabStore = create<LabState>()(
  persist(
    (set, get) => ({
      ...initial(),
      hasHydrated: false,
      setStage: (stage) =>
        set({ stage: Math.max(0, Math.min(labStages.length - 1, stage)), lastUpdated: Date.now() }),
      next: () => get().setStage(get().stage + 1),
      previous: () => get().setStage(get().stage - 1),
      setArchetype: (archetype) =>
        set((state) => {
          const dna = createDNA({
            seed: state.seed,
            archetype,
            paletteId: state.paletteId,
            gesture: state.dna.visual.gesture,
            audioEnabled: state.audioEnabled,
          });
          return {
            archetype,
            dna,
            destination: dna.behavioral.preferredBiome,
            lastUpdated: Date.now(),
          };
        }),
      setPalette: (paletteId) =>
        set((state) => ({
          paletteId,
          dna: createDNA({
            seed: state.seed,
            archetype: state.archetype,
            paletteId,
            gesture: state.dna.visual.gesture,
            audioEnabled: state.audioEnabled,
          }),
          lastUpdated: Date.now(),
        })),
      applyGesture: (gesture) =>
        set((state) => {
          const dna = createDNA({
            seed: state.seed,
            archetype: state.archetype,
            paletteId: state.paletteId,
            gesture,
            audioEnabled: state.audioEnabled,
          });
          return { dna, destination: dna.behavioral.preferredBiome, lastUpdated: Date.now() };
        }),
      setAudioEnabled: (audioEnabled) =>
        set((state) => ({
          audioEnabled,
          dna: {
            ...state.dna,
            visual: {
              ...state.dna.visual,
              audio: { ...state.dna.visual.audio, enabled: audioEnabled },
            },
          },
          lastUpdated: Date.now(),
        })),
      setDestination: (destination) => set({ destination, lastUpdated: Date.now() }),
      setName: (name) => set({ name, lastUpdated: Date.now() }),
      setDescription: (description) => set({ description, lastUpdated: Date.now() }),
      togglePaused: () => set((state) => ({ paused: !state.paused })),
      loadDNA: (dna) =>
        set({
          dna,
          seed: dna.seed,
          archetype: dna.visual.archetype,
          destination: dna.behavioral.preferredBiome,
          stage: 1,
          lastUpdated: Date.now(),
        }),
      startOver: () => set({ ...initial(), hasHydrated: true }),
      markHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "vektorix-lab-draft-v1",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const persisted = persistedState as Partial<LabState> & { dna?: unknown };
        const fallback = initial(persisted.seed);
        let dna = fallback.dna;
        try {
          if (persisted.dna) dna = parseVektorDNA(persisted.dna);
        } catch {
          // Invalid local drafts safely return to a fresh deterministic organism.
        }
        return {
          ...fallback,
          ...persisted,
          dna,
          seed: dna.seed,
          archetype: dna.visual.archetype,
          destination: persisted.destination ?? dna.behavioral.preferredBiome,
          hasHydrated: false,
        } as LabState;
      },
      partialize: (state) => {
        const { hasHydrated, ...persisted } = state;
        void hasHydrated;
        return persisted;
      },
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);
