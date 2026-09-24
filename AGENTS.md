# AGENTS.md — Working in this repository

This file is for AI coding agents (and humans using them) that modify this repo.

## What this project is

Ruthless Clarity is a **decision-discipline** MCP server + skill.  
It forces a fixed gate sequence. Do not turn it into a general agent framework, chatbot, or task runner.

**Vocabulary:** Prefer function names (Victory, Tightening loop, Diagnostic package, Needle, Bet, Lock, Verify, Codify). Chapter numbers are optional cross-refs to the book framework, not the primary interface.

## Non-negotiable product rules

1. **Hard gates stay hard.** Never soften a gate to "warn and continue." Missing upstream artifacts must return `isError: true` with a clear `HARD GATE` or `REJECTED` message.
2. **Atomic diagnostic package.** The tightening loop (map / kill / CV) is one operational commit (`run_diagnostic_loop`). Do not split into three tools unless the skill, README, AGENTS.md, and tests are updated together.
3. **Bet results before Lock.** `lock_decision` requires `record_bet_result`, not only `propose_irreversible_bet`. Information before commitment.
4. **Session permanent kills.** Options killed in-session stay dead across diagnostic refresh and rollback unless `rejustification` is supplied when marking them survived.
5. **Codify only after success.** `codify_lesson` requires `verification.result === "met"` and `lastAction === "double_down"`.
6. **Rollback clears stale state; permanent kills remain.** On rollback, clear diagnostic and everything below it. Victory may remain locked. `permanentKillLog` is retained.
7. **Session state only.** No database, no cross-session persistence in the public server. Persistent variants belong in a separate product.
8. **stdio is the default transport.** Streamable HTTP is a deliberate addition, not an accidental side effect. Stock Dockerfile stays stdio.

## Gate sequence (do not reorder)

```
define_victory                         # Victory
  → run_diagnostic_loop                # Tightening loop → Diagnostic package
    → set_needle_metric                # Needle
      → propose_irreversible_bet       # Bet (plan)
        → record_bet_result            # Bet (result)
          → lock_decision              # Lock
            → verify_cut               # Verify
              → rollback_or_double_down
                → codify_lesson        # Codify (only if double_down)
```

If you add a tool, place it explicitly in this chain and update:

- `src/index.ts` (gates + state)
- `skills/ruthless-clarity/SKILL.md` (gate table + failure modes)
- `README.md` (tools table + sequence)
- This file

## Editing the skill vs the server

| Change type | Update skill? | Update server? |
|-------------|-----------------|----------------|
| Wording / examples only | Yes | No |
| New required field on a phase | Yes | Yes (schema + validation) |
| New gate or reordered gate | Yes | Yes |
| Softer validation | **No** — reject the change unless product owner approves in writing |
| Bounty overlay behavior | Skill only (scoped section) | No |

## Validation standards

- Prefer **structural** rejects (empty arrays, "whether"/hope patterns, missing required strings) over keyword heuristics alone.
- Every reject path must tell the agent **what to fix**, not only that it failed.
- `get_protocol_status` must reflect any new gate flags you add (including `betResultRecorded`, `sessionPermanentKills`).

## Docs that must stay consistent

After any behavioral change, verify these still agree:

1. `src/index.ts` — actual enforcement
2. `skills/ruthless-clarity/SKILL.md` — agent-facing rules
3. `README.md` — human + marketplace facing
4. `AGENTS.md` — this file
5. `CONTRIBUTING.md` — process

Broken links are release blockers.

## What not to do

- Do not add network calls, API keys, or telemetry to the public server without an explicit product decision.
- Do not expand the bounty overlay into default behavior for all users.
- Do not claim Docker custom-Dockerfile path supports stdio-only servers on MCPRush (it does not; Node or published-image paths do).
- Do not invent a second operational path that diverges from `run_diagnostic_loop`.
- Do not allow `lock_decision` after proposal only — results are required.
- Do not make chapter numbers the primary UI in skill or docs when function names exist.

## Local verification before PR

```bash
npm install
npm run build
npx @modelcontextprotocol/inspector node dist/index.js
```

Confirm:
- missing Victory blocks diagnostic
- empty kill log rejected
- revived permanent kill without rejustification rejected
- Lock without bet **result** rejected
- Codify without double_down rejected
- rollback clears status flags but retains permanentKillLog count
