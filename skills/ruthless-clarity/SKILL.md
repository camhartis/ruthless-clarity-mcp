---
name: ruthless-clarity
description: Permanent operating system for every agent task and bounty work. Use on any diagnostic, research, evaluation, process, or bounty task. Triggers include define victory, map reality, controlling variable, kill options, diagnostic package, parallel diagnostic loop, tightening loop, ruthless clarity, victory condition, hard constraints, needle metric, record bet result. Load this skill before any real work begins.
---

# Ruthless Clarity — Agent Operating System

This skill is the permanent operating system. Load it first on every task. Do not proceed without it.

**Vocabulary:** Use **function names** (Victory, Tightening loop, Needle, Bet, Lock, Verify, …).  
Chapter numbers are optional cross-references to `references/full-framework.md` for book readers — not the primary interface.

## How the loop actually runs (read this first)

The diagnostic is **not three sequential steps** and not three simultaneous essays.  
It is **one tightening loop**: map a slice → kill noise → test a controlling-variable candidate → narrow the map → repeat until the CV holds.

It is **operationally atomic** at commit time: one `run_diagnostic_loop` (or one structured block) when the loop has **converged** — not when the map is “complete.”

**Incomplete maps are intentional.** A long map is not a better diagnostic. Completeness that delays kills and CV isolation is a failure mode.

**Bet plan is not enough to Lock.** The Bet must **run and produce results** before Lock. Record results, then lock the cut.

| Gate | What you produce | How you commit it |
|------|------------------|-------------------|
| **Victory** | Locked victory condition | `define_victory` (or explicit locked statement) |
| **Tightening loop → Diagnostic package** | Reality map + CV + kill log | Single `run_diagnostic_loop` after the loop converges |
| **Needle** | Metric + causal link | `set_needle_metric` |
| **Bet (plan)** | Small irreversible bet | `propose_irreversible_bet` |
| **Bet (result)** | Information gained | `record_bet_result` |
| **Lock** | Locked decision / cut | `lock_decision` (requires bet **results**) |
| **Verify** | Check against needle | `verify_cut` |
| **Rollback / Double-down** | Forced binary response | `rollback_or_double_down` |
| **Codify** | Lesson in the system | `codify_lesson` |
| **Teach / Live** | Transfer + private standard | Human and system responsibility — not automated here |

If the MCP server is not connected, produce the same artifacts in the same order as structured sections in your reply. Do not invent alternate sequences. Do not skip a gate and claim it was "implicit."

## Non-Negotiable Sequence

1. Lock **Victory** before any diagnostic or execution work.
2. Run the **tightening loop**; commit the **diagnostic package** only when it has converged.
3. Only after the diagnostic package exists may Needle, Bet, Lock, Verify, or Codify run.
4. Propose the Bet, **run it**, record results — then **Lock**. Lock without results is forbidden.
5. Treat every Required Output as a hard gate. Do not invent missing upstream artifacts.
6. Any controlling-variable statement must pass the manipulability test before acceptance.
7. Options killed in this session stay dead unless fully re-justified with new evidence.

Full book-aligned framework (optional depth) lives in `references/full-framework.md`.

## Victory (Hard Gate)

Victory is never a feeling, a go-live date, a timeline, or "we are ready."  
Victory is a single, verifiable state that must be true for the work to have been worth doing.

**Grandmother test:** Can a grandmother who knows nothing about the work look at the outcome and know, without interpretation, whether we won or lost? If no, rewrite until yes.

**Do not spend the first calorie until this statement exists and is locked.**

**Required outputs (must all be present):**
- One-sentence Victory Condition (a state, not an action)
- Explicit verification method (objective check)
- Grandmother-test translation (plain language)
- Key unknowns / assumptions / risks (with owners and resolution intent when known)
- What you will do if the victory condition is not met
- Confirmation that the statement is locked

No later gate may begin until these outputs exist and are treated as fixed.

## Diagnostic Package — The Tightening Loop

### What the loop is

Map, kill, and controlling-variable isolation **sharpen each other in real time**:

```
Map a slice of reality
  → surfaces real constraints and false options
    → kill what fails constraints (noise down)
      → sharper signal on what could be the lever
        → that candidate tells you what to map next
          → map deeper there; ignore dead branches
            → kill more
              → CV locks or is replaced
```

Recursive = same loop on a smaller surface.  
Iterative = repeat until the CV passes manipulability and surviving options are few.  
**Commit once** when the loop has converged.

### How to run the loop (do this, not three essays)

```
Loop (typically 3–5 passes; stop when stable):
  1. Name 1–3 new facts about how the system actually runs
     (not the whole system — only what you still need)
  2. Update hard constraints
  3. Kill options that fail those constraints; record them
  4. State current CV candidate + manipulability (yes/no this afternoon)
  5. If no → drop candidate; go to 1 with a narrower focus
  6. If yes → ask: what else on the map must be true for this CV
     to be causal? Map only that. Kill more.
  7. Stop when: no new meaningful kills, one CV holds, survivors are few

Then commit run_diagnostic_loop (or one structured block).
```

Do **not** finish a complete reality map and only then invent a lever.  
Do **not** inventory every option and only later apply constraints.  
Do **not** treat a long map as higher quality.

### Map Reality

Map the process as it actually runs, not as documentation pretends.  
Name real handoffs, undocumented workarounds, approval gates, single points of failure, and owners who do not actually own the step.

Inside the tightening loop, map **only enough** to name constraints, options, and CV candidates. Expand only where the current CV candidate requires evidence.

Method (when you need structure):
- Segment into 3–7 major pieces only if the problem is still wide
- For relevant segments: real inputs, outputs, owner, frequency, failure modes
- Flag junctions/handoffs and undocumented workarounds
- Trace actual ownership, not title ownership

Required in the committed package:
- Enough map to defend constraints, kills, and the CV (not an encyclopedia)
- Junctions/handoffs that affect the lever
- Initial variable inventory (name what you saw; protect nothing)

### Controlling Variable

The controlling variable is never an outcome, a hope, a market condition, or a "whether."  
It is the single rate, volume, or action we can directly increase or decrease inside the time window that has the highest causal impact on the defined victory.

**Manipulability test (hard):** Can we change this number or action this afternoon without waiting for external permission or luck?  
If no → it is not the controlling variable. Drop it and keep looping.  
"Whether X happens" and "market demand" always fail this test.

Required in the committed package:
- Symptom statement (what is actually observed)
- Explicit controlling variable (rate, volume, or action)
- Proof of manipulability (concrete action this afternoon)
- Causal justification (why changing this moves victory)

### Kill Options

Name hard constraints first.  
Any option that fails a constraint is killed the moment it fails and recorded with the exact constraint that killed it.  
A killed option stays dead unless new evidence forces full re-justification from scratch.

Required in the committed package:
- Explicit hard constraints (at least one)
- Kill log (at least one option): option → constraint failed (or "survived") → killed Y/N
- Surviving options
- Rejustification if reviving a session-previous kill

Empty kill logs are invalid. "No options considered" is invalid.

**Session permanent kill rule:** Options killed earlier in this session cannot be marked survived on a later diagnostic without rejustification.

## After the Diagnostic Package

Only when Victory + diagnostic package exist:

1. **Needle** — one metric causally linked to both Victory and Controlling Variable. State the causal link. If the metric can move without victory moving, it is wrong.
2. **Bet (plan)** — small irreversible bet with rollback condition and time box.
3. **Bet (result)** — measured needle movement, outcome, information gained. **Required before Lock.**
4. **Lock** — make the cut once using information the bet produced.
5. **Verify** — binary check against the needle with explicit target comparison.
6. **Rollback or Double-down** — forced by verification. Rollback clears diagnostic↓; permanent kills remain.
7. **Codify** — only after met + double_down.

## Failure Modes This Skill Forbids

- Skipping Victory and "inferring" it later
- Sequential fake-parallel: full map finished, then lever invented, then kills as afterthought
- **Complete-map theater:** long reality maps that delay kills and CV isolation
- Controlling variables that fail manipulability ("whether customers buy", "market conditions")
- Empty or missing kill logs
- **Lock** with only a Bet *plan* — results are required
- Declaring victory without Verify and target comparison
- Codify before Verify + double_down
- Reopening a killed option without full re-justification from scratch
- Using chapter numbers as the primary navigation when function names exist (prefer Victory, Bet, Lock, …)
- Treating Teach / Live as irrelevant after Codify (they still apply; this skill does not automate them)

## Project-Specific Overlay (Agent Bounty Protocol)

Apply only when the active project is the Agent Bounty Protocol (or the user explicitly says this overlay is in force):

- Victory is verified payout received, not task completion.
- Strict filter: only high-fit diagnostic / research / evaluation / process tasks. Kill commodity generation on sight.
- Free-tier limits are a hard constraint. Treat message budget as scarce capital.
- Prefer a tight tightening loop over encyclopedic maps (token budget is scarce capital).
- Deliver structured diagnostic packages, never surface-level output.
- The human remains the sole rail for accounts, wallets, submissions, and KYC.

Do **not** apply this overlay to unrelated tasks.

## Usage Rule

Before any task, confirm this skill is loaded.  
Lock **Victory** (including unknowns and if-not-met).  
Run the **tightening loop** until the CV holds; commit the **diagnostic package** once.  
Then **Needle** → Bet plan → **Bet result** → **Lock** → **Verify** → Rollback/Double-down → **Codify**.  
Missing an upstream artifact is a hard stop, not a prompt to invent one.
