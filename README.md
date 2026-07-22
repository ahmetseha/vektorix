# Vektorix

Vektorix is a production-oriented e-commerce analytics and campaign management dashboard built with Next.js, React, PostgreSQL, Prisma, Clerk, Upstash Redis, BullMQ, Stripe, Tailwind CSS, Radix UI, and Recharts.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill in the services you want to enable.
3. Point `DATABASE_URL` to PostgreSQL, then run `npm run db:push` and `npm run db:seed`.
4. Start the app with `npm run dev`.

Without external service keys, the UI and analytics API stay usable in demo mode. Clerk authentication, Redis caching, Stripe billing, and the BullMQ queue activate when their environment variables are present.

## Service setup

- Clerk: configure `/api/webhooks/clerk` for `user.created`, `user.updated`, and `user.deleted`; set `CLERK_WEBHOOK_SECRET`.
- Stripe: configure `/api/webhooks/stripe` for subscription create/update/delete events; include `workspaceId` in subscription metadata.
- Upstash: set the REST URL/token for analytics caching and invalidation.
- BullMQ: set a standard Redis `REDIS_URL`; Upstash REST is intentionally not reused as the BullMQ transport.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

The design tokens live in `src/app/globals.css`; layout, type, color, radius, and component spacing can be changed centrally.
