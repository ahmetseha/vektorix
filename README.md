# Vektorix — Digital Life Lab

Vektorix is an anonymous-first procedural 3D laboratory. Pointer, touch, keyboard, palette, archetype, and optional local microphone analysis are reduced into a compact versioned DNA payload that reconstructs the same organism from the same inputs. The product deliberately contains no AI, blockchain, token, NFT, or wallet features.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. No external service is required for local development: without `DATABASE_URL`, the API uses its process-local fallback. To verify durable state and memories, configure PostgreSQL and apply the checked-in Drizzle migrations before starting the app.

```bash
pnpm db:migrate
```

## Verify

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e --project=chromium
```

## Architecture

- Next.js App Router and React Server Components for routes and metadata.
- React Three Fiber with GLSL shader modules, a single buffer-based particle field, stable uniforms, adaptive DPR and quality tiers.
- Zustand for the recoverable lab draft; TanStack Query for public server state; URL state for Explore filters.
- Zod for strict versioned DNA and server input validation.
- Deterministic seeded mutation and fusion with recorded ancestry.
- Drizzle PostgreSQL runtime persistence for Vektors, their single active state, memories, biome travel, reactions and reports; the release transaction writes the Vektor, state and first memories atomically.
- Playwright coverage for rendered canvas pixels, anonymous creation, persistence recovery, network failure, share, remix, mobile, reduced motion, and console errors.

The implementation plan is in [`docs/implementation-plan.md`](docs/implementation-plan.md), and the critical flow specification is in [`specs/vektorix.plan.md`](specs/vektorix.plan.md).

A complete Turkish product and architecture explanation is available in [`docs/vektorix-nasil-calisir.md`](docs/vektorix-nasil-calisir.md).

## Deployment boundary

The checked-in local repository remains self-contained through a process-local development fallback. With `DATABASE_URL`, the API uses PostgreSQL and backfills missing lifecycle state and release memories for legacy records. Before a multi-instance deployment, apply the Drizzle migrations, configure Better Auth with a real email or social provider, and upload preview files to R2/S3 instead of storing large preview data URLs in PostgreSQL. Copy `.env.example` and supply deployment-owned credentials; never commit them.
