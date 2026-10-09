# VISUAL TDA — MASTER ENGINEERING MISSION V12

**Continuity note.** `state.md` shows the repository at `MISSION_V11_SYSTEMATIC_DESIGN_SYSTEM_OVERHAUL`, Parts 1–12 complete. This document is V12. It's longer than V6 or V11 on purpose — the human asked for an extensive pass this round — but it's still organized so any single section can be read and acted on without needing the rest in context at once. If you lose context mid-session, `docs/known-issues.md` → `IA/architect/state.md` → `IA/architect/next.md`, in that order, same as always.

**Framing.** Every item in Part 1 was found by the human in under ten minutes of actually using the app — after a session that reported 48 test files, 375 passing tests, 9/9 contrast tests, and full real-Chromium screenshot verification. That gap is the same gap this project has hit every round so far. Nothing here is a criticism of the work in V11 — the design-system migration was real, substantial, correct work. It's a reminder that "all automated gates pass" and "a person using it for ten minutes finds nothing wrong" are different claims, and only the second one is the actual target.

---

## Part 1 — Human-reported defects (fix all of these; this is the priority)

### 1.1 Feedback form doesn't deliver — nobody is getting the emails
No feedback has arrived via `FeedbackModal`. Near-certain cause: **FormSubmit requires activation**. The first submission to any new destination email triggers a confirmation email to that address with an "Activate Form" link; until that's clicked, every subsequent submission is silently accepted by the client (looks successful to the student) but never delivered. Do this:
1. Check whether `lromerom@fi.uba.ar` ever received and clicked that activation email (check spam too).
2. Send a real test submission right now and confirm with the human whether it actually arrives — don't mark this fixed on code inspection alone, mark it fixed when a real email lands in a real inbox.
3. Add `lucioromeromascaro@gmail.com` as a second delivery target (or switch primary to it, per the human's preference) — a personal inbox is less likely to have this kind of silent delivery failure go unnoticed.
4. Because this failure mode is invisible to the client (the UI shows success either way), this is exactly the kind of bug automated tests won't catch — `tests/feedbackAndFooter.test.tsx` presumably mocks the fetch call, which proves the request is *sent*, not that it's *delivered*. Document in `docs/known-issues.md` that delivery itself must be periodically re-verified by hand, the same way the browser-autocomplete check from Mission V6 is.

### 1.2 Median of Medians: ~300 blank lines pass local tests and unlock the exercise
The human submitted an attempt that was almost entirely whitespace/newlines (~300 lines, no real content) in the Median of Medians exercise. It passed the *local* TypeScript-side tests and the UI marked the exercise completed — which is false; nothing was solved.
1. Find out exactly why: does this exercise's validator or "local test" path have a fallback that doesn't actually check Python output? Does `codeEffortAnalyzer.ts`'s line-counting get fooled by blank lines, or is it not being consulted at all before marking completion for this specific exercise?
2. This is the same class of bug as the 40-character-fallback found in an earlier session — a validator that can be satisfied by near-empty input. Audit every one of the 38 exercises for the same hole, not just this one: for each, submit a near-empty / whitespace-only attempt and confirm it is correctly rejected with real failure feedback, not silently accepted.
3. Add a permanent regression test asserting that blank/whitespace-only/trivial code never produces a "passed" or "completed" state, for every exercise, not just Median of Medians.

### 1.3 Kruskal / MST: the app treats a *worse* result as better
**Report, verbatim in spirit**: the human found a spanning tree with total weight 9, and the app's comparison told him 10 was better. For a Minimum Spanning Tree, lower total weight is strictly better — this is backwards.
1. Find the exact comparison in the Kruskal/MST validator or feedback logic and fix the direction (near-certain cause: a `>` where `<` belongs, or a validator written as if MST were a maximization problem).
2. This class of bug — minimization vs. maximization direction errors — is serious enough to warrant a systematic check, not a one-line patch: go through **every** exercise that is fundamentally a minimization problem (MST, shortest paths/Bellman-Ford, lateness minimization, vertex cover size, coin change count, knapsack weight constraint) and every one that's a maximization problem (knapsack value, interval scheduling count, LCS length, max flow, max subarray) and assert with a concrete numeric example that "better" and "worse" are recognized correctly in each one's validator and UI feedback language. A single direction bug this blatant, caught by a human in minutes, means this needs checking everywhere it could exist, not just where it was caught.

### 1.4 "Hide problem" layout: broken in the *default* (non-hidden) state, across many exercises
Several exercises were built/tested against the expanded "hide problem" view, and look fine there — but the default (problem shown) state is described as "horrible y superpuesta" in multiple places. **Majority Element** is the named example (its +/− controls overlap). Use it as the reference case:
1. Fix Majority Element's default-state layout completely.
2. Then audit every other exercise in its *default* state specifically (not hidden) — this needs to be checked exercise by exercise, since the failure mode is specifically "works in the state that got tested, breaks in the one that didn't."
3. Where you find overlapping elements, prefer fixing the underlying layout (flex/grid with real gap spacing) over nudging absolute pixel offsets — see the pattern note in Part 2.

### 1.5 Dark mode: "continue exercise" button shows the wrong blue at rest, correct blue on hover
A card/button's resting-state color is a washed-out light blue instead of the standard accent blue; hovering shows the correct color. This is almost certainly a stale CSS variable reference on the non-hover selector that didn't get updated in the Radix migration while the `:hover` rule did. Find and fix the specific selector; then grep for the same pattern (resting state uses an old/undefined token, hover state uses the new one) across other components, since if it happened once during the migration it may have happened elsewhere too.

### 1.6 Minimize Lateness: still bad — label overlap and obscured background indicator
Despite prior rounds of work on this exercise (drag stabilization, etc.), it remains hard to read: the "inversion (15 > 8)" background indicator is described as completely obscured, and deadline labels (`d_j5`, `d_j6`, etc.) overlap each other outright. This needs actual layout restructuring, not another micro-adjustment:
- Apply the same 1D label-staggering technique already built and working for Road Antennas' house labels (vertical offset + leader line when labels are within a proximity threshold) to this exercise's deadline labels.
- Separately fix the obscured inversion-count indicator's z-ordering/contrast so it's legible against whatever is currently covering it.
- After fixing, verify by rendering a case with closely-spaced deadlines (not just the default preset) — the bug is specifically about crowding, so a sparse test case won't expose it.

### 1.7 Knapsack: cramped numbers, and bring it up to the interactivity level of other exercises
Two related asks:
- **Spacing**: numbers sit too close to other numbers and labels in the current Knapsack visualizer. Fix spacing/structure.
- **Interactivity parity**: other exercises (Road Antennas, Minimize Lateness, Hamiltonian Cycle, TSP) got real drag-and-drop item manipulation. Knapsack should too — let the student drag items into/out of the bag, and show `KnapsackVisualBag.tsx` actually filling up as items are added, not just a static end-state. Bring it to the same interaction quality bar as the exercises that already got this treatment.

### 1.8 Sudoku: MRV heuristic reveals the answer; gate it like Knight's Tour's Warnsdorff hint
Sudoku currently shows the Minimum-Remaining-Values heuristic directly, which tells the student the answer instead of letting them reason about it — the same problem Knight's Tour had with its Warnsdorff heuristic, which was already fixed by gating it behind instructor mode / genuine mastery. Apply the identical pattern here.

### 1.9 Hamiltonian Cycle: a "0" label is unreadable against the background
Specifically the default/starting vertex label "0" blends into its background — described as very bad. This is a targeted contrast fix (likely a hardcoded color that didn't go through the Radix migration, similar to the Inversion Counting / Huffman fixes already done for other stray hardcoded colors). Fix it, and re-run the contrast script specifically against this component to confirm it wasn't just missed by whatever scan ran before.

### 1.10 Road Antennas: real-city example has visually unwieldy numbers
The "Highway 2" example with real town names (Lezama, Castelli, etc.) uses km values large enough to look bad in the visualizer. Keep the real-place-name flavor — it's a nice touch — but rebuild the example around Quilmes and its nearby towns, with smaller, simulated km values chosen for how they look in the visualizer rather than geographic accuracy.

### 1.11 Logo: too small, not distinctive
The message describing this was cut off mid-sentence, but the intent is clear: make the logo bigger and give it a more distinct visual identity — it currently doesn't carry enough presence. Use this as an opportunity, not just a resize: something that reads clearly at both the header's small size and could work as a favicon/social-share image, consistent with the $P \stackrel{?}{=} NP$ emblem direction already started in the header.

### 1.12 DP exercises: add a recurrence-equation input, and purge any remaining spoilers
Two parts:
- Add an optional input, on or near the Solve phase of DP exercises, where a student can type their own guess at the recurrence relation. Show a generic, clearly-formatted example of valid input *above* the field (students will otherwise type free-form text or special characters that could error out) — validate loosely enough to never crash on malformed input (this is a sanity-checked text field, not a symbolic math engine; don't build a full equation parser/evaluator for this — KISS applies). Treat it as a self-check tool for the student, not something that's graded.
- Audit every DP exercise's Discover/Solve-phase copy for the recurrence relation being revealed before the student should see it. Weighted Interval Scheduling is a confirmed offender — fix it — and check the rest, since if one shipped with the recurrence spoiled, others may have too.

---

## Part 2 — Patterns worth fixing once, not exercise-by-exercise

These aren't new bug reports; they're what Part 1's items have in common, and fixing the pattern prevents the next five exercises from needing the same fix individually.

### 2.1 Label/element overlap is a recurring class, not isolated incidents
Road Antennas house labels, Weighted Interval's predecessor box, Minimize Lateness deadline labels, Hamiltonian Cycle's "0", and Majority Element's +/− controls have all independently had overlap/legibility bugs across different sessions. That's a pattern: elements positioned with fixed/absolute coordinates that don't account for nearby content. Where a shared utility would help (the staggering logic already built for Road Antennas is a good candidate to generalize), extract it once and reuse it, rather than re-solving layout collision per exercise as each one gets reported.

### 2.2 Minimization/maximization direction needs a standing test, not a one-time fix
Per 1.3 — once Kruskal's direction is fixed, add it as a named category in the test suite: a cheap, standing invariant test asserting every minimization-type validator rejects a worse (higher) value as "better," and every maximization-type validator rejects a worse (lower) value as "better," with a concrete counterexample per exercise.

### 2.3 Before declaring anything done: a cleared-profile re-test of what was actually touched
This session's bugs (default-state layout, stale hover colors, missing contrast on specific components) are all things that existed in states the prior session didn't happen to look at. Before writing `state.md`/`current-audit.md` as complete, open a clean/private browser window and click through every exercise *touched this session* — not a sample, not just the ones in Part 1 — in its default state, in both themes. This is slower than trusting the automated suite, but the automated suite has now missed a feedback-delivery failure, an academic-integrity hole, and a backwards correctness check in a row; it needs a human pass as a complement, not a replacement.

### 2.4 Feedback channel: verify delivery, not just the request
Per 1.1 — more generally, any feature whose success is "something happens outside this browser tab" (an email arrives, a webhook fires) needs its success verified by checking the outside thing, not by checking that the client-side call didn't throw. Mocked tests proving a `fetch` call was made are necessary but not sufficient for this category of feature.

---

## Part 3 — Order of work

1.1 → 1.2 → 1.3 → 1.9 → 1.5 → 1.4 → 1.6 → 1.8 → 1.12 → 1.7 → 1.10 → 1.11 → Part 2 (apply throughout, don't treat as a separate phase at the end). Autonomous operation per V4 §63 still applies. Escalate only genuinely irreversible/ambiguous calls to `IA/architect/questions.md`.

This is meant to leave the product at "only details remain" — treat Part 1 as the actual bar for that, not the automated gates alone. Once this is verified (including the human re-test in 2.3), the next step is merging `agent/antigravity` into `main` and connecting the production domain — that conversation is happening separately with the architect, not part of this mission.

Begin now. Only the literal word `STOP` ends the mission; follow the established STOP protocol when it arrives.

