# Sequence — Design Documents

> **Sequence** is an admissions operating system. It turns 14 months of chaos into one
> ranked list of what to do today.
>
> **Status: design complete, awaiting approval. No application code written yet.**

## The 17 requested deliverables

| # | Deliverable | Where |
|---|---|---|
| 1 | Product Requirements Document | [`01-PRD.md`](./01-PRD.md) |
| 2 | User Personas | [`01-PRD.md` §5](./01-PRD.md) |
| 3 | User Flows | [`01-PRD.md` §8](./01-PRD.md) |
| 4 | Information Architecture | [`01-PRD.md` §9](./01-PRD.md) |
| 5 | Database Schema | [`02-DATA-MODEL.md`](./02-DATA-MODEL.md) |
| 6 | ER Diagram | [`02-DATA-MODEL.md` §ER](./02-DATA-MODEL.md) |
| 7 | API Design | [`03-ARCHITECTURE.md` §2](./03-ARCHITECTURE.md) |
| 8 | Component Tree | [`03-ARCHITECTURE.md` §4](./03-ARCHITECTURE.md) |
| 9 | Folder Structure | [`03-ARCHITECTURE.md` §3](./03-ARCHITECTURE.md) |
| 10 | Design System | [`04-DESIGN-SYSTEM.md`](./04-DESIGN-SYSTEM.md) |
| 11 | Color Palette | [`04-DESIGN-SYSTEM.md` §2](./04-DESIGN-SYSTEM.md) |
| 12 | Typography | [`04-DESIGN-SYSTEM.md` §3](./04-DESIGN-SYSTEM.md) |
| 13 | Wireframes | [`04-DESIGN-SYSTEM.md` §7](./04-DESIGN-SYSTEM.md) |
| 14 | Feature Roadmap | [`05-ROADMAP.md` §1](./05-ROADMAP.md) |
| 15 | Build Order | [`05-ROADMAP.md` §2](./05-ROADMAP.md) |
| 16 | Risk Analysis | [`05-ROADMAP.md` §3](./05-ROADMAP.md) |
| 17 | Future Features | [`05-ROADMAP.md` §4](./05-ROADMAP.md) |

Plus the research this is all built on: [`00-RESEARCH.md`](./00-RESEARCH.md) —
platform mechanics, round rules, aid systems, and 16 numbered student pain points
(`P-01`…`P-16`) that every feature traces back to.

## Read in this order

1. **[00-RESEARCH](./00-RESEARCH.md)** — why the product is shaped this way
2. **[01-PRD](./01-PRD.md)** — what we're building and for whom
3. **[02-DATA-MODEL](./02-DATA-MODEL.md)** — the schema and the derived logic
4. **[03-ARCHITECTURE](./03-ARCHITECTURE.md)** — how it's assembled
5. **[04-DESIGN-SYSTEM](./04-DESIGN-SYSTEM.md)** — how it looks and feels
6. **[05-ROADMAP](./05-ROADMAP.md)** — the order of construction

## The three ideas that make this not-a-spreadsheet

1. **Requirement Engine** — you pick a college and a round; the system derives the
   deadlines, prompts, forms, recs, and aid requirements. You never build a tracker.
2. **Rule Engine** — nothing on the market checks whether you're about to violate ED
   exclusivity, REA restrictions, or a QuestBridge ranking commitment. This does.
3. **Essay Graph** — essays are entities mapped many-to-many onto prompts, with real
   version history, per-school submitted-version stamping, and reuse scored by prompt
   kind, topic overlap, and word-limit fit.

And one opinion, encoded in the math: **"Submitted" caps an application at 90%.**
The last 10% is confirming the college actually received everything — which is where
applications actually fail.
