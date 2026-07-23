# Vektorix repository rules

- Vektorix is a deterministic procedural 3D product. Do not add AI, LLM, generative APIs, blockchain, NFTs or wallets.
- Load the `vektorix-experience` skill for all product, design and Three.js work.
- Load relevant R3F skills before changing scene architecture, shaders, materials, post-processing or interactions.
- Never update React or Zustand state every animation frame. Use refs, typed arrays and stable shader uniforms.
- Verify all Three.js and R3F APIs against installed package versions.
- Maintain mobile quality fallbacks and `prefers-reduced-motion` support.
- New visual effects require performance verification.
- New user-facing flows require Playwright verification.
- Do not call work complete while build, typecheck, lint or relevant tests are failing.
- Do not replace the product with a generic SaaS dashboard or template.
