# Vektorix — Digital Life Lab

Vektorix is an anonymous-first procedural 3D laboratory. Pointer, touch, keyboard, palette, archetype, and optional local microphone analysis are reduced into a compact versioned DNA payload that reconstructs the same organism from the same inputs. The product deliberately contains no AI, blockchain, token, NFT, or wallet features.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. No external service is required for the local creation, publish, share, explore, and remix flows.

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
- Drizzle PostgreSQL schema for users, sessions, profiles, Vektors, parents, reactions, and reports.
- Playwright coverage for rendered canvas pixels, anonymous creation, persistence recovery, network failure, share, remix, mobile, reduced motion, and console errors.

The implementation plan is in [`docs/implementation-plan.md`](docs/implementation-plan.md), and the critical flow specification is in [`specs/vektorix.plan.md`](specs/vektorix.plan.md).

## Deployment boundary

The checked-in local repository is intentionally self-contained. Its API uses a process-local repository and deterministic encoded share URLs, so records survive client navigation but not a server restart. Before a multi-instance deployment, connect the existing Drizzle schema to PostgreSQL, configure Better Auth with a real email or social provider, and upload preview files to R2/S3 instead of storing their data URLs in process memory. Copy `.env.example` and supply deployment-owned credentials; never commit them.
