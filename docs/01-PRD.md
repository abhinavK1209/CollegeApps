# 01 — Product Requirements Document

**Product:** **Sequence** — the admissions operating system.
**One-liner:** Sequence turns 14 months of chaos into one ranked list of what to do today.
**Status:** Design — awaiting approval.

---

## 1. Problem Statement

A college applicant runs a 14-month, multi-vendor program with ~340 discrete deliverables,
hard external deadlines, legal-ish compliance rules, a document supply chain they don't
control, and a five-figure financial decision at the end — using a spreadsheet they made
in August and abandoned in October.

The existing toolset is either **static** (spreadsheets, Notion), **generic** (Trello,
Linear), or **owned by someone else** (Naviance, Scoir, Common App). None of them can
answer the only question that matters on a Tuesday night in November:

> **"What should I be working on right now, and what am I about to miss?"**

## 2. Product Thesis

Encode the domain. Everything else follows.

Because Sequence knows what a *college*, a *round*, a *requirement*, and a *dependency*
are, it can **derive** the student's entire workload from ~6 inputs per school, keep it
current, enforce the rules, and rank it. The student never builds a tracker. They open the
app and do the top item.

**Three moats over every competitor:**

1. **Requirement Engine** — seeded reference data (college × round → requirements,
   deadlines, prompts) auto-generates a verified checklist. (P-02, P-04)
2. **Rule Engine** — a compliance checker for binding rounds, REA exclusivity, QuestBridge
   overlap, and Common App form ordering. Nothing else on the market does this. (P-11)
3. **Essay Graph** — essays are entities mapped many-to-many onto prompts, with real
   version history and reuse suggestions scored by prompt similarity and word-limit fit.
   (P-01, P-05, P-06)

## 3. Goals & Non-Goals

### Goals
- G1. **Zero missed hard deadlines.** The system must make missing one require ignoring it.
- G2. **Time-to-clarity < 5 seconds.** Open the app → know today's work without a click.
- G3. **No manual tracker construction.** Adding a school is one search + one round pick.
- G4. **Complete lifecycle coverage**, exploration → enrollment deposit. (P-14)
- G5. **Reduce felt stress**, measurably: show *this week*, not the backlog.
- G6. **Premium craft.** Linear's speed, Stripe's density, Apple's restraint.

### Non-Goals (v1)
- ❌ AI essay writing or scoring. Sequence manages the process; it does not ghostwrite.
  (Also: an ethical and integrity landmine.)
- ❌ Chancing / admit-probability prediction. Pseudoscience, and it raises anxiety.
- ❌ Auto-submitting to Common App or scraping portals. Fragile, ToS-hostile, credential
  liability. Sequence **tracks** portals; it never logs into them.
- ❌ Counselor/school-admin multi-tenant product. (v2 — see Future Features.)
- ❌ Social feed / peer comparison. Actively harmful. (P-13)

## 4. Success Metrics

| Metric | Target |
|---|---|
| Hard deadlines missed per active user | **0** |
| D30 retention (senior fall cohort) | > 70% |
| Median time from signup → 5 schools with full checklists | < 6 min |
| Requirements auto-derived vs. manually added | > 85% |
| % users still active in **February** (post-submit cliff) | > 55% |
| Self-reported "in control of the process" (in-app, 5-pt) | +2.0 vs. baseline |
| p75 route transition | < 150 ms |

## 5. User Personas

### P1 — **Maya, 17.** The Overwhelmed Achiever *(primary)*
14 schools, 3 platforms (Common App + UC + one Coalition), 22 essays, ED1 somewhere,
needs aid. Uses Notion for everything and it's already falling apart. Anxious, capable,
allergic to friction.
**Needs:** one ranked queue, essay reuse that actually works, proof her recs got submitted.
**Fails today because:** she's tracking work instead of doing it.
**Success:** opens Sequence, sees 3 things, does them, closes it.

### P2 — **Darius, 17.** First-Gen, QuestBridge Finalist
No family playbook. Doesn't know CSS Profile exists until November. Parents divorced →
noncustodial Profile required. QB rankings due Oct 15, binding.
**Needs:** to be *told* what exists — fee waivers, IDOC, noncustodial, deadlines.
**Fails today because:** nobody told him. Naviance assumed he already knew.
**Success:** the app surfaces the unknown-unknowns before they're late. (P-08, P-11)

### P3 — **Priya, 16.** The Early Planner (junior spring)
Building a list, planning testing, will ask teachers for recs in May.
**Needs:** a non-punishing on-ramp; a place to accumulate a list; a spring-of-junior-year
timeline that doesn't scream at her.
**Success:** senior fall starts with recs already secured.

### P4 — **Jenn, 48.** The Parent *(read-mostly, invited)*
Wants to know if things are on track without asking every night.
**Needs:** a scoped read-only view — status, deadlines, aid tasks she owns (FAFSA, CSS,
tax docs). Explicitly **cannot** read essay drafts or private notes.
**Success:** stops asking. (P-15)

### P5 — **Mr. Alvarez.** The Counselor / Consultant *(v1: comment-only guest)*
Reviews essays, confirms forms sent.
**Needs:** a share link scoped to one essay or one application, with commenting.
**Success:** comments land in-app instead of in a Google Doc that gets lost.

## 6. Feature Requirements

Legend: **M** = must (v1) · **S** = should (v1 if time) · **C** = could (v1.1+)

### 6.1 Onboarding & Profile
| | Feature |
|---|---|
| M | 90-second onboarding: grad year → intended majors → aid needed? → add first 3 schools |
| M | Profile: HS, GPA (W/UW), rank, test scores, residency, citizenship, first-gen, fee-waiver eligibility |
| M | Flags that unlock modules: `needsAid` → aid module, `questBridge` → QB timeline, `divorcedParents` → noncustodial Profile requirement |
| S | Import from a CSV/Sheet of an existing tracker |

### 6.2 College List & Applications
| | Feature |
|---|---|
| M | Search 2,000+ seeded colleges (name, alias, state); add in one keystroke |
| M | Tier: Reach / Target / Likely, with balance warnings |
| M | Round selection per school with **live rule validation** |
| M | Platform auto-detected (Common App / Coalition / UC / ApplyTexas / Direct) |
| M | Application status: Researching → Planning → In Progress → Submitted → Under Review → Interview → Decided → Withdrawn → Committed |
| M | Portal URL + username stored; **never passwords** |
| M | Decision recording: Accepted / Denied / Deferred / Waitlisted / Matched, with date |
| S | Cost of attendance + net price calculator link per school |

### 6.3 Requirement Engine ⭐
| | Feature |
|---|---|
| M | On adding college+round, auto-generate: deadlines, essay prompts, rec requirements, test policy, forms, aid requirements |
| M | Every derived item carries **provenance**: `SEEDED` / `DERIVED` / `USER` + `verifiedAt` + confidence |
| M | User can override any derived item; overrides survive reference-data updates |
| M | **Portal Verification**: each requirement tracks `submitted` *and* `receivedConfirmed` (P-03) |
| M | Weekly **Portal Sweep** ritual — one screen, every portal, mark received |
| S | Reference-data drift notice: "Brown's CSS deadline changed — review" |

### 6.4 Rule Engine ⭐
| | Feature |
|---|---|
| M | Detect: >1 binding ED; REA/SCEA exclusivity violations; QB ranking ⊗ ED conflict; ED2 after ED1 acceptance |
| M | Post-ED-acceptance: auto-generate "withdraw other applications" task set |
| M | Common App form ordering guard (Final Report locks Mid-Year/Counselor Rec) |
| M | Non-blocking, explanatory warnings with a citation and a "this is intentional" dismissal |
| S | Timeline feasibility: "3 ED-round essays due in 6 days at your current pace" |

### 6.5 Task System
| | Feature |
|---|---|
| M | Priority (P0–P3), labels, due date, start date, estimate, sub-tasks |
| M | **Dependencies** (blocked-by), with blocked tasks hidden from Today |
| M | Recurring tasks (RRULE): weekly portal sweep, scholarship search |
| M | Views: List, **Kanban** (drag & drop), Calendar, Today |
| M | Auto-generated tasks are labeled and idempotent (`generatorKey`) |
| M | Command-palette quick add with natural-language dates ("why us essay fri 5pm p1") |
| S | Workload smoothing — flag overloaded weeks, suggest redistribution (P-13) |

### 6.6 Essay System ⭐
| | Feature |
|---|---|
| M | Essay entity: title, prompt, word/char limit, status, tags |
| M | **Versions** with immutable snapshots, labels, restore, and side-by-side **diff** |
| M | Live word/char count vs. limit, reading time, over-limit warning |
| M | **Assignments**: one essay → many prompts (application or scholarship) |
| M | **Reuse suggestions** scored by prompt-type match, word-limit fit, and topic tags — with an explicit warning that UC PIQs are not reducible Common App essays |
| M | **Wrong-school-name detector** — scans an assigned draft for other colleges' names (P-06) |
| M | Comments anchored to text ranges; resolvable; share link for reviewers |
| M | Records **which version was submitted** to which school |
| S | Focus mode (distraction-free composer) |
| C | Autosave-to-version cadence tuning |

### 6.7 Recommendations
| | Feature |
|---|---|
| M | Recommenders as reusable entities (teacher/counselor/other) |
| M | Per-application status pipeline: Not Asked → Asked → Agreed → **FERPA waived** → Invited → Submitted → Thanked |
| M | Per-college requirement counts (2 teachers + counselor, etc.); UC = none |
| M | Auto-tasks: ask by date X, send brag sheet, nudge at T-14, thank-you |
| M | Aggregate view: one recommender across all schools |

### 6.8 Financial Aid
| | Feature |
|---|---|
| M | FAFSA tracker: submitted, FSA ID, SAI, per-school receipt, verification |
| M | CSS Profile tracker: per-school deadlines (round-aware), fee waiver |
| M | **Noncustodial Profile** requirement auto-raised when profile flag set (P-08) |
| M | IDOC document checklist + upload |
| M | **Award comparison table**: COA, gift aid, net price, loans shown separately (P-09) |
| M | Net price computed correctly — loans/work-study never subtracted |
| S | Appeal tracker |

### 6.9 Scholarships
| | Feature |
|---|---|
| M | Manual add with deadline, amount, effort estimate, requirements |
| M | **Expected-value ranking**: amount ÷ effort × (local? boost) — fights fatigue (P-10) |
| M | Status pipeline + awarded amount roll-up |
| M | Essay assignment from the same Essay Graph |
| C | Curated seed list of national scholarships |

### 6.10 Interviews, Visits, Documents, Notes
| | Feature |
|---|---|
| M | Interview: type, evaluative flag, request-by vs. complete-by dates, interviewer, prep notes, thank-you |
| M | Visits log — doubles as demonstrated-interest record |
| M | Documents via UploadThing; typed; linked to applications/scholarships |
| M | Notes: rich text, linkable to college/application, pinnable |

### 6.11 Dashboard, Calendar, Timeline, Analytics, Search
See §7 and the wireframes doc. All **M**.

### 6.12 Notifications
| | Feature |
|---|---|
| M | In-app inbox |
| M | Email digest (daily/weekly, user-scheduled, timezone-correct) |
| M | Escalating deadline reminders: T-30, T-14, T-7, T-3, T-1, day-of |
| S | Web push |
| C | SMS |

### 6.13 Collaboration
| | Feature |
|---|---|
| S | Parent invite — read-only, essays & private notes excluded (P-15) |
| S | Per-essay reviewer share link with commenting, expiring |

## 7. The Dashboard Spec

The dashboard's job: **answer "what now?" in under 5 seconds, then get out of the way.**

Ordered by screen position, top to bottom:

1. **Greeting + season context** — "Good evening, Maya. 12 days to your ED deadline."
2. **⚡ Next Best Action** — *one* card. The single highest-scored actionable item, with a
   one-click start. Scoring function in `03-DATA-MODEL.md §7`.
3. **🔴 Late** — only rendered if non-empty. Never a zero-state; nobody needs a red box
   telling them they have zero problems.
4. **Today** — ≤ 5 items. Overflow collapses to "+7 more."
5. **Progress rings** — Applications / Essays / Recommendations / Financial Aid, animated,
   each drilling into its module.
6. **Countdown widgets** — next 3 hard deadlines with day counts and round badges.
7. **Application funnel** — Researching → Planning → In Progress → Submitted → Decided.
8. **Deadline heatmap** — 16-week density grid; the workload-smoothing surface.
9. **Decision tracker** — appears only after the first decision lands; accept/deny/defer/WL.
10. **Aid + scholarship progress** — FAFSA/CSS/IDOC state, $ applied vs. $ won.
11. **Recently edited** — resume-where-you-left-off.
12. **Quick add** — new application / task / essay / scholarship / note.

**Adaptive by season.** The dashboard reorders itself: junior spring emphasizes list
building and rec asks; November emphasizes essays and portal sweeps; February emphasizes
mid-year reports and aid; April emphasizes award comparison and the May 1 countdown.

## 8. Core User Flows

### F1 — Add a college *(the flagship flow — target: 8 seconds)*
```
⌘K → type "brow" → ↵ Brown University
  → round picker (rule-validated: "⚠ You already hold an ED1 at Duke")
  → pick ED2 → ↵
SYSTEM DERIVES:
  • Deadline Jan 1 (application), Feb 1 (CSS Profile, ED2), Feb 1 (FAFSA)
  • 3 supplemental prompts (200/250/250 w)
  • 2 teacher recs + counselor rec + School Report
  • Mid-Year Report requirement, due when S1 grades post
  • Portal placeholder, awaiting URL after submission
  • 11 tasks, dependency-linked, back-scheduled from Jan 1
→ Toast: "Brown added — 11 tasks, 3 essays, 4 deadlines." [Review]
```

### F2 — Write & reuse an essay
```
Essays → "Why Brown (250w)" → composer
Sidebar: "Your Michigan 'Why Us' (400w) shares 3 topic tags → adapt?"
→ Adapt → forks a new version, preserving lineage
→ Autosave; explicit "Save version" for milestones
→ Pre-submit check: ⚠ "This draft contains the word 'Michigan'"
→ Mark Submitted → version frozen + stamped to Brown
```

### F3 — Secure a recommendation
```
Recommendations → Add Recommender (Ms. Chen, AP Bio)
→ Assign to 9 applications
→ System: FERPA not yet waived → blocks "Invite" tasks, raises P0 "Sign FERPA waiver"
→ Ask (in person) → Agreed → Invited → [T-14 nudge if not Submitted] → Submitted
→ Auto-task: "Thank Ms. Chen" (P2, due +3d)
```

### F4 — The weekly portal sweep *(the "nothing silently broke" ritual)*
```
Sunday 6pm notification → Portal Sweep
One row per submitted application, portal link, last-checked date
Per row, checkboxes for outstanding items: [Transcript] [Rec: Chen] [SAT] [CSS]
Anything unchecked >14 days after submission → auto P1 "Follow up with Brown admissions"
```

### F5 — Decision → deferral → LOCI
```
Dec 14: record Duke ED1 = Deferred
SYSTEM:
  • Moves Duke into the RD pool, recomputes its timeline
  • Creates P1 "Write LOCI to Duke" due Dec 28 (2-week window)
  • Releases the ED lock → ED2 now legal, surfaces eligible ED2 schools
  • Timeline event + gentle framing copy
```

### F6 — Compare offers
```
April: Financial Aid → Compare
Normalized table, one row per admitted school:
  COA · Grants · Scholarships · = NET PRICE · | · Loans · Work-study (excluded from net)
Sorted by net price. 4-year projection. May 1 countdown pinned.
```

## 9. Information Architecture

```
/                          → redirect (→ /dashboard or /welcome)
/login  /signup  /forgot-password  /reset-password  /verify-email
/onboarding                → 4-step wizard

/dashboard                 ⌘1   Today, everything, adaptive
/applications              ⌘2   Board · Table · Timeline views
  /applications/[id]              Overview
    /checklist  /deadlines  /essays  /recommendations
    /documents  /financial-aid  /interview  /notes  /portal  /activity
/colleges                  ⌘3   Explore + saved list + compare
  /colleges/[slug]
/calendar                  ⌘4   Month · Week · Day · Agenda
/timeline                  ⌘5   Season-scale horizontal timeline
/tasks                     ⌘6   List · Board · Calendar
/essays                    ⌘7   Library + reuse graph
  /essays/[id]                    Composer
  /essays/[id]/versions           History & diff
/scholarships              ⌘8
/financial-aid             ⌘9   FAFSA · CSS · IDOC · Awards · Compare
/recommendations
/documents
/notes
/analytics
/profile
/settings                  ⌘,   Account · Appearance · Notifications · Sharing · Data
/search                          Full-page results (⌘K is the primary surface)
```

**Global surfaces:** command palette (⌘K), quick-add (⌘N), notification inbox (⌘I),
help (?), theme toggle (⌘⇧L).

## 10. Keyboard Shortcuts

| Key | Action | | Key | Action |
|---|---|---|---|---|
| `⌘K` | Command palette | | `G` then `D` | Go to Dashboard |
| `⌘N` | Quick add | | `G` `A` | Applications |
| `⌘/` | Shortcut cheatsheet | | `G` `E` | Essays |
| `⌘⇧L` | Toggle theme | | `G` `T` | Tasks |
| `⌘S` | Save essay version | | `G` `C` | Calendar |
| `J`/`K` | Move selection | | `E` | Edit focused |
| `X` | Select | | `C` | Complete focused task |
| `⌘↵` | Submit form | | `?` | Help |
| `Esc` | Close / deselect | | `1–4` | Switch view within a page |

## 11. Constraints & Assumptions

- Single-student accounts. Parents/reviewers are **invited guests**, not tenants.
- Reference data (deadlines, prompts) is **seeded and versioned per cycle**, always shown
  with a "verify on the college's site" affordance. We never claim authority we don't have.
- No credential storage for third-party portals. Ever. Usernames only, passwords never.
- Timezone correctness is non-negotiable — deadlines are usually **11:59pm local to the
  college**, which is not the student's timezone. Store UTC + IANA zone, render both.
- FERPA/privacy: essays and notes are private by default; parent scope is enforced
  server-side, not by hiding UI.
