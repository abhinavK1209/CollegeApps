# 00 — Domain Research & Pain Point Analysis

> Everything in this document was gathered before any product decisions were made.
> Every feature in the PRD traces back to a numbered pain point here (`P-##`).

---

## 1. The Application Platforms

The single most important structural fact: **there is no one application.** A typical
student touches 2–4 incompatible systems, each with its own account, its own essays, its
own recommender model, and its own deadline semantics. This is the root cause of most
tracking failure.

### 1.1 Common App

- Seven core sections: **Profile, Family, Education, Testing, Activities & Experiences,
  Writing, Courses & Grades**, plus per-college supplements.
- Personal essay: 7 prompts, **250–650 words**, unchanged for 2025–26.
- **Additional Information** — optional free-text.
- **Challenges & Circumstances** — 300 words, replaced the old "Community Disruption"
  section in 2025–26.
- Per-college **Writing Supplements** vary enormously: 0 to 8+ essays, wildly different
  word limits for functionally the same question ("Why us?" at 100 / 150 / 250 / 400 words).
- Recommender model: student **invites** recommenders by email from within Common App.
  Counselor forms are a separate track from teacher recommendations.
- **FERPA waiver** must be signed before recommenders can be invited — this is a hard
  gate that blocks the entire recommendation pipeline and students routinely hit it late.

**Counselor / school forms** are their own dependency graph:

| Form | Required? | When |
|---|---|---|
| School Report | Usually, with initial submission | At application submission |
| Counselor Recommendation | College-dependent | At application submission |
| Mid-Year Report | College-dependent | As soon as Q2/S1 grades are final (Jan–Feb) |
| Optional Report | Never | Ad hoc updates |
| **Final Report** | **Mandatory for all** | After all decisions, post-commitment |

Critical ordering rule: **once the Final Report is submitted, the Counselor
Recommendation, Mid-Year Report, and Optional Report can no longer be sent.** A tracker
that doesn't model this ordering can actively cause harm.

### 1.2 UC Application

Structurally alien to the Common App and therefore the #1 source of duplicated effort:

- **4 Personal Insight Questions**, chosen from 8, **350 words each, hard limit**.
- The same 4 PIQs go to **every** UC campus. No campus-specific essays.
- **No letters of recommendation.** No alumni interviews. No personal statement.
- Consensus from every source consulted: PIQs are **not** a shortened Common App essay.
  Common App rewards reflective narrative; UC rewards front-loaded, action-and-outcome,
  directly responsive prose. Naive reuse produces bad essays.
- Single submission window, typically Oct 1 – Dec 2, one fee per campus.

### 1.3 Coalition / Scoir

- Now delivered through **Scoir**; Scoir↔Common App integration rolled out for many high
  schools in 2025–26.
- Essay prompts overlap heavily with Common App prompts (near-identical wording on
  several) — a genuine, high-value reuse opportunity, unlike UC.
- Used by a shrinking but non-trivial set of member colleges.

### 1.4 ApplyTexas

- Opens ~Aug 1. Deadlines are **per-campus and per-major** — UT Austin and Texas A&M
  commonly Dec 1, but major-level variation is real (and honors/BHP-type programs have
  their own earlier deadlines and extra essays).
- Separate essay prompt set (Topics A/B/C style).

### 1.5 Institution-Specific Portals

Post-submission, every college hands the student a **separate portal** with its own
login, its own checklist, and its own "missing items" list. Consensus advice across
every counseling source: **check every portal weekly until every item reads "received."**

This is where applications actually die — not at submission, but in the two weeks after,
when a test score, a school report, or a counselor rec silently fails to arrive.

---

## 2. Application Rounds — The Rules Are Adversarial

This is a compliance problem disguised as a scheduling problem.

| Round | Binding | Typical deadline | Typical decision |
|---|---|---|---|
| Early Decision I (ED1) | **Yes** | Nov 1 / Nov 15 | Mid-Dec |
| Early Decision II (ED2) | **Yes** | Jan 1 / Jan 15 | Mid-Feb |
| Early Action (EA) | No | Nov 1 / Nov 15 | Dec–Jan |
| Restrictive EA / Single-Choice EA (REA/SCEA) | No, but **exclusive** | Nov 1 | Mid-Dec |
| Regular Decision (RD) | No | Jan 1 – Feb 1 | Mid-March – Apr 1 |
| Rolling | No | Ongoing | 2–8 weeks after submit |
| QuestBridge Match | **Yes, if matched** | Oct 1 (app) / Oct 15 (rankings) | Finalist late Oct, Match early Dec |
| Priority / Honors / Scholarship | No | Often **earlier** than RD | Varies |

**Hard constraints a student can violate without realizing:**

1. Only **one** binding ED application may be live at a time (ED1 and ED2 are both fully
   binding; you may hold only one).
2. **REA/SCEA is exclusive** — e.g. a Harvard/Yale/Princeton/Stanford REA applicant may
   generally not file any other private-college early application. Non-binding
   applications to **public** universities (and often foreign universities) are the
   standard carve-out, and rules differ school to school.
3. **QuestBridge Match rankings are binding.** Ranking a college commits you. Overlaying
   QB rankings with an ED application is a genuine conflict.
4. If admitted ED, you must **withdraw all other applications** — a real post-decision
   task list nobody tracks.
5. Some schools offer both EA and ED2 and forbid switching between them.

> **Nothing on the market checks these rules.** A spreadsheet certainly doesn't.

### 2.1 Deferral / Waitlist

- Deferred (early → RD pool) and waitlisted students should send a **Letter of Continued
  Interest (LOCI)**, ideally **within ~2 weeks** of the decision.
- LOCI content = renewed interest + concrete new achievements since submission.
- This spawns an entire second application season most students are emotionally and
  logistically unprepared for.

---

## 3. Financial Aid — Two Parallel Systems + a Document Pipeline

### 3.1 FAFSA
- Federal/state aid. Free. Produces the **SAI**.
- Federal deadline is late, but **state and institutional priority deadlines are the ones
  that matter** and are much earlier.

### 3.2 CSS Profile
- Institutional aid at ~250 colleges. Opens **Oct 1**. Has a fee (often waivable).
- **No single deadline.** ED/EA commonly **Nov 1 or Nov 15**; RD ranges Jan–March.
  (Rice: Jan 4. Brown: Mar 1.) Per-college, per-round.
- **Noncustodial Profile**: if parents are divorced/separated, most CSS schools require a
  *second, separate* Profile, and the noncustodial parent must create **their own College
  Board account with their own information** — a step that fails constantly.

### 3.3 IDOC
- After Profile submission, College Board's IDOC collects tax returns, W-2s, and
  supporting documents for the student **and all parents**, then distributes to all IDOC
  schools. Its own deadlines, its own upload tracker.

### 3.4 Award Letters
- **No standardized format.** Terminology is inconsistent. Nearly a third of award
  letters don't state cost of attendance at all; many that do omit costs.
- The only correct comparison: **Net Price = Cost of Attendance − gift aid
  (grants + scholarships).** Loans and work-study are **not** aid reductions.
- Students have weeks between decisions and the **May 1** reply date to do this
  comparison, usually with no tooling.

---

## 4. Scholarships

- **3 in 4 students won zero scholarships** in a 12-month period despite averaging
  ~9 hours searching and applying (Sallie "Scholarship Search Fatigue" data).
- Students track scholarships across "sticky notes, browser bookmarks, notes apps, and
  memory" — the failure is organizational, not eligibility.
- **Local scholarships have dramatically better odds** and are the ones most often
  missed, because they're distributed through counselor emails, community orgs, and
  employer networks rather than national databases.
- Reuse is the leverage point, and it's dangerous: many students submit one generic essay
  everywhere, which fails prompts that ask something specific.

---

## 5. Recommendations

- Teachers cap how many letters they'll write; asks must be **early** (spring junior
  year / early fall senior year is the repeated advice).
- Pipeline: **Ask in person → teacher agrees → FERPA waiver signed → invite via platform
  → teacher submits → thank-you note.** Each step is a separate state, and students
  conflate "I asked" with "it's handled."
- Students must supply a brag sheet/resume to recommenders — an invisible sub-task.
- UC needs none. Some schools require exactly 2 teachers + counselor; some cap at 1;
  some allow supplemental/arts letters. Per-college requirements vary.

---

## 6. Interviews

- Usually alumni-conducted; **initiated by the college after submission**, typically
  contacting the student within ~2 weeks.
- "Optional" is a trap: some optional interviews are informational, others (Tufts,
  Northwestern, Rice) are effectively expected.
- Real scheduling deadlines exist and are easy to miss (e.g. last day to *request* an
  interview vs. last day to *have* the interview are different dates).
- ED interview windows cluster in November; RD in December–mid-February.

---

## 7. What Students Actually Complain About

Synthesized from r/ApplyingToCollege, College Confidential threads, counseling blogs,
and consultant marketing (which sells directly against these fears).

| ID | Pain point | Evidence |
|---|---|---|
| **P-01** | Volume shock: 11 colleges → **20+ essays**; similar prompts at different word counts force full rewrites, not trims. | CC thread: "applied to 11 colleges… wrote more than 20 essays" |
| **P-02** | No single source of truth. Deadlines live in email, portals, counselor handouts, and memory. | Universal across every tracker-template article |
| **P-03** | Missing items discovered too late — scores, school reports, recs silently not received. | "check portals weekly until everything shows received" |
| **P-04** | Deadline chaos: platform deadlines ≠ aid deadlines ≠ scholarship deadlines ≠ honors deadlines. | CSS/FAFSA per-school variance |
| **P-05** | Essay version hell: `essay_final_FINAL_v3_mom_edits.docx`. No revision history, no idea which version was actually submitted. | CC essay threads |
| **P-06** | Reuse is manual and error-prone — including the catastrophic "wrong school name in the Why Us essay." | Consultant blogs, CC |
| **P-07** | Recommendation anxiety — no visibility into whether a teacher submitted. | Portal-checking advice |
| **P-08** | Financial aid is a second, hidden application nobody warned them about. | Noncustodial/IDOC complexity |
| **P-09** | Award letters are incomparable; families guess at real cost. | "no standard format," 1/3 omit COA |
| **P-10** | Scholarship fatigue → total abandonment. 9 hrs spent, $0 won. | Sallie report |
| **P-11** | Round-rule confusion; genuine fear of accidentally violating ED/REA policy. | Every consultant FAQ |
| **P-12** | Deferral/waitlist limbo — no idea a LOCI exists or that it's time-sensitive. | LOCI guides across all sources |
| **P-13** | The process is described as "**a period of absolute dread.**" Anxiety is the product's real competitor. | CC / A2C |
| **P-14** | Post-submission cliff — mid-year reports, final transcripts, AP score sends, deposits, housing. Every tracker stops at "Submitted." | Common App form ordering rules |
| **P-15** | Parents want status without nagging; students want autonomy without being nagged. | Consultant positioning |
| **P-16** | Existing tools are static. A spreadsheet cannot tell you *what to do next Tuesday*. | Every template article ends here |

### What consultants sell (i.e. what people pay thousands of dollars for)

Crimson: a **team** around one student, each owning a slice, with an insider review pass.
Command's stated thesis: the process makes families "**reactive rather than proactive**,"
and their job is to flip that. Ivy Coach's most-read posts are damage-control ("I forgot
part of my application").

**The product insight:** the thing being sold at $10k–$100k is *proactive sequencing and
the absence of dread.* Not information — information is free. **Sequencing, verification,
and calm are the product.**

---

## 8. Competitive Assessment

| Tool | Why it fails |
|---|---|
| Google Sheets / Excel templates | Static. No derived deadlines, no dependencies, no version history, no rule checking. Rots by October. |
| Notion templates | Beautiful for a week. Every relation must be maintained by hand; no automation; no domain knowledge. |
| Airtable | Better relations, worse UX, still zero domain intelligence. |
| Trello / Linear | Generic task managers. No concept of a college, a round, or an essay. |
| Scoir / MaiaLearning / Naviance | **Counselor-owned**, school-mandated, student-hostile UX. Optimized for the counselor's reporting, not the student's week. |
| Common App dashboard | Only its own colleges. No UC, no ApplyTexas, no scholarships, no aid, no tasks, no essays-in-progress. |
| CollegeVine / Appily | Discovery & chancing tools, not execution tools. |

**The open lane:** a *student-owned execution system* that encodes domain rules, spans
every platform, and answers one question perfectly — **"what do I do right now?"**

---

## 9. Design Principles Derived From Research

1. **Derive, don't ask.** The system generates the checklist from the college + round.
   The student's job is to *do* work, not to *model* work.
2. **Verification over completion.** "Submitted" is not done. "Received, confirmed in
   portal" is done. (P-03, P-14)
3. **One ranked queue.** There is always exactly one correct next action. (P-16)
4. **Make the invisible visible.** FERPA gates, noncustodial Profiles, mid-year reports,
   LOCI windows — surface them before they bite. (P-08, P-11, P-12, P-14)
5. **Protect the student from the rules.** Never let someone file two binding EDs. (P-11)
6. **Reduce arousal, not just clicks.** Show *this week*, not all 340 tasks. Celebrate
   real milestones. Never use red for "you have work"; red means *late*. (P-13)
7. **Essays are first-class entities with a reuse graph**, not attachments. (P-01, P-05, P-06)
8. **The season doesn't end at submit.** Model all the way to enrollment deposit. (P-14)

---

## Sources

- [Common App: A Complete Guide 2025–2026 — Collegewise](https://collegewise.com/blog/common-app)
- [Common App Sections — InGenius Prep](https://ingeniusprep.com/blog/common-app-guides-resources-to-guide-you-through-the-different-sections/)
- [Navigating the Common App 2025-2026 — Galin Education](https://galined.com/blog/common-app-2025-2026/)
- [In what order should I submit the Counselor school forms? — Common App](https://membersupport.commonapp.org/s/article/In-what-order-should-I-submit-the-Counselor-school-forms)
- [Transcript, School Report and Recommendations — Stanford](https://admission.stanford.edu/apply/first-year/forms.html)
- [Personal Insight Question vs. Personal Statement — College Essay Guy](https://www.collegeessayguy.com/blog/personal-insight-question-vs-personal-statement)
- [UC Application vs. Common App — Prepory](https://prepory.com/blog/uc-application-vs-common-app/)
- [Comparing Coalition and Common App Essay Prompts — Scoir](https://www.scoir.com/blog/comparing-essay-prompts-coalition-common-app)
- [Coalition Application Essay Prompts — College Essay Guy](https://www.collegeessayguy.com/blog/coalition-application-essay-prompts-examples)
- [Apply to the National College Match — QuestBridge](https://www.questbridge.org/apply-to-college/programs/national-college-match/apply)
- [Ranking Colleges — QuestBridge](https://www.questbridge.org/apply-to-college/programs/national-college-match/apply/ranking-colleges)
- [What is Restrictive Early Action — InGenius Prep](https://ingeniusprep.com/blog/restrictive-early-action/)
- [Early Decision vs Early Action — Ivy Coach](https://www.ivycoach.com/the-ivy-coach-blog/early-decision-early-action/early-decision-vs-early-action/)
- [ED2 Schools List 2026 — Oriel Admissions](https://orieladmissions.com/ed2-schools-list-2026/)
- [CSS Profile 2026–27 Guide — ScholarshipsandGrants.us](https://scholarshipsandgrants.us/high-school-seniors/css-profile/)
- [IDOC — College Board](https://cssprofile.collegeboard.org/idoc)
- [CSS Profile and CSS Profile Schools — College Essay Guy](https://www.collegeessayguy.com/blog/css-profile-and-css-profile-schools)
- [Prospective Students, Financial Aid — Harvard College](https://college.harvard.edu/financial-aid/apply-financial-aid/prospective-students)
- [Check Your College Portal After Submitting — Great College Advice](https://greatcollegeadvice.com/did-your-college-receive-your-test-scores-check-the-portal/)
- [What to Do If I Forgot Part of My College Application — Ivy Coach](https://www.ivycoach.com/the-ivy-coach-blog/admissions-process/missing-parts-of-your-submitted-application/)
- [Why Students Are Exhausted From Scholarship Search — Sallie](https://www.sallie.com/research/the-scholarship-search-fatigue-report)
- [Scholarship Tracker — Cirkled In](https://www.cirkledin.com/library/scholarships-and-financial-aid/scholarship-tracker-manage-applications-deadlines/)
- [How to Write a Great Letter of Continued Interest — College Essay Guy](https://www.collegeessayguy.com/blog/letter-of-continued-interest)
- [When Should You Write a Letter of Continued Interest — IvyWise](https://www.ivywise.com/blog/when-should-you-write-a-letter-of-continued-interest/)
- [Top College Interview Policies — Top Tier Admissions](https://toptieradmissions.com/top-college-interview-policies/)
- [Alumni Interview — Dartmouth Admissions](https://admissions.dartmouth.edu/glossary-term/alumni-interview)
- [How to Compare College Financial Aid Awards — CollegeXpress](https://www.collegexpress.com/articles-and-advice/financial-aid/articles/financial-aid-admissions/how-compare-your-college-financial-aid-awards/)
- [Comparing Financial Aid Awards — How to Pay for College](https://howtopayforcollege.com/blog/comparing-financial-aid-awards)
- [Do colleges check for reused supplemental essays — College Confidential](https://talk.collegeconfidential.com/t/do-colleges-check-for-reused-or-recycled-supplemental-essays/1919519)
- [So Many Supplemental Essays — College Confidential](https://talk.collegeconfidential.com/t/so-many-supplemental-essays/3673153)
- [Ivy League College Admission Consultants — Crimson Education](https://www.crimsoneducation.org/us/admissions/ivy-league-college-consultant)
- [Ivy Whisperers — Command Education](https://www.commandeducation.com/press/ivy-whisperers-10-elite-gurus-getting-your-kids-into-top-schools/)
