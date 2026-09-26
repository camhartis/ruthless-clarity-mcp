---
name: ruthless-clarity
description: Permanent operating system for every agent task and bounty work. Use on any diagnostic, research, evaluation, process, or bounty task. Load this skill before any real work begins.
triggers:
  - define victory
  - map reality
  - controlling variable
  - kill options
  - diagnostic package
  - parallel diagnostic loop
  - ruthless clarity
  - victory condition
  - hard constraints
  - needle metric
  - irreversible bet
  - lock decision
  - verify the cut
---

# Ruthless Clarity — Agent Operating System

This skill is the permanent operating system. Load it first on every task. Do not proceed without it.

## How the loop actually runs (read this first)

Chapters 2, 3, and 4 are **conceptually parallel** (you reason across map, lever, and kills together).  
They are **operationally atomic**: you commit them as one complete artifact. You do not call three separate chapter tools. You do not finish a full map and only then invent a lever.

**Bet before lock is not enough.** Protocol Chapter 6 produces information; Chapter 7 locks after that information exists. You must **record bet results** before locking a decision.

| Phase | What you produce | How you commit it |
|-------|------------------|-------------------|
| Chapter 1 | Locked victory condition | `define_victory` (or explicit locked statement) |
| Chapters 2+3+4 | Reality map + CV + kill log | Single `run_diagnostic_loop` (or one structured block) |
| Chapter 5 | Needle metric + causal link | `set_needle_metric` |
| Chapter 6 plan | Small irreversible bet | `propose_irreversible_bet` |
| Chapter 6 outcome | Bet results / information gained | `record_bet_result` |
| Chapter 7 | Locked decision | `lock_decision` (requires bet **results**) |
| Chapter 8 | Verification against needle | `verify_cut` |
| Chapter 9 | Rollback or double-down | `rollback_or_double_down` |
| Chapter 10 | Lesson codified | `codify_lesson` |
| Chapters 11–12 | Teach / Live | Human and system responsibility — not automated here |

If the MCP server is not connected, produce the same artifacts in the same order as structured sections in your reply. Do not invent alternate sequences. Do not skip a gate and claim it was "implicit."

## Non-Negotiable Sequence

1. Lock Chapter 1 before any diagnostic or execution work.
2. Commit Chapters 2+3+4 as one atomic diagnostic package after Chapter 1 is locked.
3. Only after the diagnostic package exists may needle, bet, lock, verify, or codify run.
4. Propose the bet, **run it**, record results — then lock. Lock without results is forbidden.
5. Treat every Required Output as a hard gate. Do not invent missing upstream artifacts.
6. Any controlling-variable statement must pass the manipulability test before acceptance.
7. Options killed in this session stay dead unless fully re-justified with new evidence.

Full original framework (all 12 chapters) lives in `references/full-framework.md`. Load it only when deeper fidelity on later chapters is required.

## Chapter 1 — Define Victory Ruthlessly (Hard Gate)

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

Chapters 2–12 may not begin until these outputs exist and are treated as fixed.

## Diagnostic Package (Chapters 2 + 3 + 4) — One Atomic Commit

Reason across all three while forming the package. Commit once when all required fields are ready.

### Chapter 2 — Map Reality Without Flinching

Map the process as it actually runs, not as documentation pretends.  
Name every real handoff, undocumented workaround, approval gate, single point of failure, and owner who does not actually own the step.

Method:
- Segment the system into 3–7 major pieces.
- For each segment list real inputs, real outputs, real owner, real frequency, and real failure modes.
- Explicitly flag every junction/handoff.
- Mark undocumented steps and approval gates.
- Trace actual ownership, not title ownership.

Required inside the diagnostic package:
- Named segments / processes
- Explicit list of junctions and handoffs (with real owners)
- Flagged undocumented workarounds and approval gates
- Initial variable inventory

### Chapter 3 — Identify the Controlling Variable

The controlling variable is never an outcome, a hope, a market condition, or a "whether."  
It is the single rate, volume, or action we can directly increase or decrease inside the time window that has the highest causal impact on the defined victory.

**Manipulability test (hard):** Can we change this number or action this afternoon without waiting for external permission or luck?  
If no → it is not the controlling variable. Rewrite until yes.  
"Whether X happens" and "market demand" always fail this test.

Required inside the diagnostic package:
- Symptom statement (what is actually observed)
- Explicit statement of the controlling variable (rate, volume, or action)
- One-sentence proof of manipulability (how we change it this afternoon)
- Causal justification (why changing this one thing moves the victory condition)

### Chapter 4 — Kill Options Early

Name the hard constraints first.  
Any option that fails a constraint is killed the moment it fails and is recorded with the exact constraint that killed it.  
A killed option stays dead unless new evidence forces a full re-justification from scratch.

Required inside the diagnostic package:
- Explicit list of hard constraints (at least one)
- Kill log with at least one option considered: each row = option → constraint failed (or "survived") → killed Y/N
- List of options that survived
- If reviving a previously killed option in this session: explicit rejustification with new evidence

Empty kill logs are invalid. "No options considered" is invalid.

**Session permanent kill rule:** Options killed earlier in this session cannot be marked survived on a later diagnostic without rejustification. This is not optional.

## After the Diagnostic Package

Only when Chapters 1–4 artifacts exist:

1. **Needle** — one metric causally linked to both Victory and Controlling Variable. State the causal link explicitly. If the metric can move without victory moving, it is the wrong metric.
2. **Bet plan** — small irreversible bet with rollback condition and time box.
3. **Bet result** — measured needle movement, outcome, information gained. **Required before lock.**
4. **Lock** — make the cut once using the information the bet produced; protect it from casual reopening.
5. **Verify** — binary check against the needle with explicit target comparison. Feeling better is not verification.
6. **Rollback or double-down** — forced by verification result. On rollback, diagnostic/needle/decision are stale; permanent kills remain. On double-down, codify the lesson.
7. **Codify** — only after met + double_down.

## Failure Modes This Skill Forbids

- Skipping Chapter 1 and "inferring" victory later
- Sequential fake-parallel: full map finished, then lever invented, then kills as afterthought
- Controlling variables that fail manipulability ("whether customers buy", "market conditions")
- Empty or missing kill logs
- Locking a decision with only a bet *proposal* — results are required
- Declaring victory without needle verification and target comparison
- Codifying a lesson before verification + double_down
- Reopening a killed option without full re-justification from scratch
- Treating Chapters 11–12 as out of scope for the human/system after codify (they still apply; this skill does not automate them)

## Project-Specific Overlay (Agent Bounty Protocol)

Apply only when the active project is the Agent Bounty Protocol (or the user explicitly says this overlay is in force):

- Victory is verified payout received, not task completion.
- Strict filter: only high-fit diagnostic / research / evaluation / process tasks. Kill commodity generation on sight.
- Free-tier limits are a hard constraint. Treat message budget as scarce capital.
- Deliver structured diagnostic packages, never surface-level output.
- The human remains the sole rail for accounts, wallets, submissions, and KYC.

Do **not** apply this overlay to unrelated tasks.

## Usage Rule

Before any task, confirm this skill is loaded.  
Lock Chapter 1 (including unknowns and if-not-met).  
Commit the diagnostic package (2+3+4) as one atomic unit.  
Then needle → propose bet → **record bet result** → lock → verify → rollback/double-down → codify.  
Missing an upstream artifact is a hard stop, not a prompt to invent one.
