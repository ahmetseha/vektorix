"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Archetype, VektorDNA } from "../schemas/dna";
import type { GestureSummary } from "../engine/gesture";
import { EMPTY_GESTURE } from "../engine/gesture";
import { createDNA } from "../engine/dna";
import type { PaletteId } from "../engine/palettes";

export const labStages = ["Awaken", "Shape", "Charge", "Color", "Sound", "Stabilize", "Name"] as const;

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
  lastUpdated: number;
  hasHydrated: boolean;
  setStage: (stage: number) => void;
  next: () => void;
  previous: () => void;
  setArchetype: (archetype: Archetype) => void;
  setPalette: (paletteId: PaletteId) => void;
  applyGesture: (gesture: GestureSummary) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  togglePaused: () => void;
  loadDNA: (dna: VektorDNA) => void;
  startOver: () => void;
  markHydrated: () => void;
};

function newSeed() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `vektor-${Date.now()}`;
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
    lastUpdated: Date.now(),
  };
}

export const useLabStore = create<LabState>()(
  persist(
    (set, get) => ({
      ...initial(),
      hasHydrated: false,
      setStage: (stage) => set({ stage: Math.max(0, Math.min(labStages.length - 1, stage)), lastUpdated: Date.now() }),
      next: () => get().setStage(get().stage + 1),
      previous: () => get().setStage(get().stage - 1),
      setArchetype: (archetype) => set((state) => ({ archetype, dna: createDNA({ seed: state.seed, archetype, paletteId: state.paletteId, gesture: state.dna.gesture, audioEnabled: state.audioEnabled }), lastUpdated: Date.now() })),
      setPalette: (paletteId) => set((state) => ({ paletteId, dna: createDNA({ seed: state.seed, archetype: state.archetype, paletteId, gesture: state.dna.gesture, audioEnabled: state.audioEnabled }), lastUpdated: Date.now() })),
      applyGesture: (gesture) => set((state) => ({ dna: createDNA({ seed: state.seed, archetype: state.archetype, paletteId: state.paletteId, gesture, audioEnabled: state.audioEnabled }), lastUpdated: Date.now() })),
      setAudioEnabled: (audioEnabled) => set((state) => ({ audioEnabled, dna: { ...state.dna, audio: { ...state.dna.audio, enabled: audioEnabled } }, lastUpdated: Date.now() })),
      setName: (name) => set({ name, lastUpdated: Date.now() }),
      setDescription: (description) => set({ description, lastUpdated: Date.now() }),
      togglePaused: () => set((state) => ({ paused: !state.paused })),
      loadDNA: (dna) => set({ dna, seed: dna.seed, archetype: dna.archetype, stage: 1, lastUpdated: Date.now() }),
      startOver: () => set({ ...initial(), hasHydrated: true }),
      markHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "vektorix-lab-draft-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { hasHydrated, ...persisted } = state;
        void hasHydrated;
        return persisted;
      },
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);
