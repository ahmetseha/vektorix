# Vektorix Critical Flow Test Plan

## Application Overview

Vektorix lets anonymous visitors shape deterministic 3D organisms through pointer, touch, keyboard, optional local audio analysis, palette and energy choices; then publish, share, explore and remix them without AI services.

## Test Scenarios

### 1. Landing and rendering

**Seed:** `e2e/seed.spec.ts`

#### 1.1. landing-renders-live-canvas

**File:** `e2e/landing-renders-live-canvas.spec.ts`

**Steps:**
  1. Open the landing page.
    - expect: the product statement is visible.
    - expect: a WebGL canvas produces a non-empty screenshot.

#### 1.2. landing-enters-lab

**File:** `e2e/landing-enters-lab.spec.ts`

**Steps:**
  1. Activate Enter the Lab.
    - expect: navigation reaches `/lab`.
    - expect: the Awaken stage is announced.

### 2. Anonymous creation

**Seed:** `e2e/seed.spec.ts`

#### 2.1. pointer-awakens-organism

**File:** `e2e/pointer-awakens-organism.spec.ts`

**Steps:**
  1. Move and release the pointer over the lab canvas.
    - expect: the lab advances to Shape.

#### 2.2. keyboard-shapes-organism

**File:** `e2e/keyboard-shapes-organism.spec.ts`

**Steps:**
  1. Use arrow keys and Space in the lab.
    - expect: keyboard controls remain operable and Enter advances the stage.

#### 2.3. create-without-microphone

**File:** `e2e/create-without-microphone.spec.ts`

**Steps:**
  1. Complete Charge, Color, Sound, Stabilize and Name without enabling audio.
    - expect: publishing opens a public Vektor URL.
    - expect: the chosen name is visible.

#### 2.4. local-recovery-survives-reload

**File:** `e2e/local-recovery-survives-reload.spec.ts`

**Steps:**
  1. Advance the lab and reload.
    - expect: an unfinished Vektor recovery notice appears.

#### 2.5. network-failure-preserves-dna

**File:** `e2e/network-failure-preserves-dna.spec.ts`

**Steps:**
  1. Abort publishing and submit a valid name.
    - expect: the user is told the DNA is safe on this device.

### 3. Discovery and lineage

**Seed:** `e2e/seed.spec.ts`

#### 3.1. public-detail-is-shareable

**File:** `e2e/public-detail-is-shareable.spec.ts`

**Steps:**
  1. Open a seeded public Vektor.
    - expect: its live canvas, traits, share and remix actions are present.

#### 3.2. explore-uses-low-cost-previews

**File:** `e2e/explore-uses-low-cost-previews.spec.ts`

**Steps:**
  1. Open Explore and choose Electric.
    - expect: only electric specimens remain.
    - expect: no Three.js canvas is created in the card grid.

#### 3.3. remix-preserves-lineage

**File:** `e2e/remix-preserves-lineage.spec.ts`

**Steps:**
  1. Open Remix, switch to Fusion and generate a variation.
    - expect: generation, parent lineage and mutation rate are visible.

### 4. Resilience

**Seed:** `e2e/seed.spec.ts`

#### 4.1. mobile-flow-remains-operable

**File:** `e2e/mobile-flow-remains-operable.spec.ts`

**Steps:**
  1. Open the lab at a mobile viewport and move through stages.
    - expect: the canvas and 44px primary controls remain visible.

#### 4.2. reduced-motion-remains-functional

**File:** `e2e/reduced-motion-remains-functional.spec.ts`

**Steps:**
  1. Emulate reduced motion and open the lab.
    - expect: the canvas and pause control remain functional.

#### 4.3. critical-pages-have-no-console-errors

**File:** `e2e/critical-pages-have-no-console-errors.spec.ts`

**Steps:**
  1. Visit landing, lab, explore and a detail page.
    - expect: no unexpected console error is emitted.
