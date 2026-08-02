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

## Planned stack

Next.js 15 · React 19 · TypeScript (strict) · Tailwind · shadcn/ui · Framer Motion ·
Prisma · Supabase Postgres · Auth.js · TanStack Query · React Hook Form · Zod ·
Recharts · date-fns · UploadThing · Vercel

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
