# Sequence

**An admissions operating system.** It turns 14 months of chaos into one ranked list of
what to do today.

Built to replace the spreadsheet — by encoding what a *college*, a *round*, a
*requirement*, and a *deadline* actually are, so the app can derive your workload instead
of asking you to maintain it.

---

## Status

🎨 **Design complete. Implementation not started.**

Full design documents live in [`docs/`](./docs) — start with
[`docs/README.md`](./docs/README.md).

## What makes it not a spreadsheet

1. **Requirement Engine** — pick a college and a round; the system derives the deadlines,
   supplemental prompts, recommendation requirements, school forms, and aid deadlines.
   You never build a tracker.
2. **Rule Engine** — catches the mistakes that actually cost people admission: two binding
   Early Decision applications, Restrictive Early Action violations, QuestBridge ranking
   conflicts, and the Common App rule where submitting the Final Report permanently locks
   the Mid-Year Report.
3. **Essay Graph** — essays are entities mapped many-to-many onto prompts, with real
   version history, per-school submitted-version stamping, reuse scored on prompt kind and
   word-limit fit, and a wrong-school-name check before you submit.

One opinion is encoded directly in the math: **"Submitted" caps an application at 90%.**
The last 10% is confirming the college actually received everything — which is where
applications actually fail.

## Stack

Next.js 15 · React 19 · TypeScript (strict) · Tailwind v4 · shadcn/ui · Framer Motion ·
Prisma · Neon Postgres · TanStack Query · React Hook Form · Zod · Recharts ·
date-fns · Vercel

Authentication is deliberately deferred — the app runs single-user for now. Every model
and service is still scoped by `userId`, so auth drops in later with no migration.

## Running locally

```bash
pnpm install
cp .env.example .env.local
pnpm db:up        # local Postgres in Docker (only needed once the schema lands)
pnpm dev          # → http://localhost:3000
```

## Deploying to Vercel

**1. Create the database.** At [neon.tech](https://neon.tech), create a project. Copy both
connection strings from the dashboard:

| Vercel env var | Which Neon string |
|---|---|
| `DATABASE_URL` | the **pooled** one (host contains `-pooler`) |
| `DIRECT_URL` | the **direct** one (no `-pooler`) |

Prisma runs queries through the pooler but migrations must bypass it, which is why both
are needed.

**2. Import the repo.** At [vercel.com/new](https://vercel.com/new), import
`abhinavK1209/CollegeApps`. Framework preset is detected automatically; no build settings
need changing.

**3. Add the two environment variables** under Settings → Environment Variables, for all
environments.

**4. Deploy.** Every push to `main` ships to production; every PR gets a preview URL.

Vercel's Hobby tier and Neon's free tier both cover a single-user personal project.

## Documents

| Document | Contents |
|---|---|
| [00-RESEARCH](./docs/00-RESEARCH.md) | Platform mechanics, round rules, aid systems, 16 student pain points |
| [01-PRD](./docs/01-PRD.md) | Personas, features, user flows, information architecture |
| [02-DATA-MODEL](./docs/02-DATA-MODEL.md) | Schema, ER diagram, scoring and scheduling logic |
| [03-ARCHITECTURE](./docs/03-ARCHITECTURE.md) | API design, folder structure, component tree |
| [04-DESIGN-SYSTEM](./docs/04-DESIGN-SYSTEM.md) | Color, typography, motion, wireframes |
| [05-ROADMAP](./docs/05-ROADMAP.md) | Roadmap, build order, risks, future features |

## Non-goals

No AI essay writing. No admit-probability predictions. No peer comparison feeds.
No third-party portal passwords — there is deliberately no field for them in the schema.
