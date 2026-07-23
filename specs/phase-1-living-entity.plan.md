# Phase 1 — Living entity release

## Goal

Verify that the existing Lab can create a deterministic Vektor, select a biome,
release it into the Field, and expose its state, behavioral character and memories
without console errors.

## Scenarios

1. Complete the Lab without microphone permission, choose Silent Ocean and release.
   Confirm the biome route, current energy and released memory.
2. Open a public Vektor detail record. Confirm human-readable behavioral character,
   journey action and memory timeline.
3. Repeat the release flow at a 390 × 844 mobile viewport.
4. Visit landing, Lab, Explore, detail, biome Field and memories routes while
   collecting console and page errors.
5. Abort the publish API and confirm the local DNA recovery message remains visible.

## Accessibility and performance assertions

- Use semantic labels and roles for release, state and memory controls.
- Keep the 3D organism central; contextual state UI must not become a dashboard.
- Nearby Vektors use low-poly silhouettes instead of full organism shaders.
- Release remains functional with reduced motion.
