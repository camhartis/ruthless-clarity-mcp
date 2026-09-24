# Ruthless Clarity MCP

**Decision-discipline harness for AI agents.**

This repository packages the *Ruthless Clarity* protocol as:

1. An **MCP server** (`src/`) — enforceable hard gates agents cannot skip
2. An **agent skill** (`skills/ruthless-clarity/`) — operating rules for any compatible agent

It is **not** a general agent harness. It is a decision-quality layer that reduces drift, reopened decisions, and invalid controlling variables.

---

## What it enforces

| Gate | Rule |
|------|------|
| **Victory** | Verifiable state + grandmother test before any further work |
| **Diagnostic package** | Reality map + controlling variable + kill log committed as **one atomic unit** |
| **Manipulability** | Controlling variable must be a rate/volume/action changeable this afternoon — not a “whether,” hope, or market condition |
| **Kill discipline** | Named hard constraints first; empty kill logs rejected; killed options stay dead |
| **Bet before lock** | Small irreversible bet must be recorded before a decision can be locked |
| **Verify before celebrate** | Binary check against the needle metric |
| **Rollback / double-down** | Forced by verification result; rollback clears stale diagnostic state |
| **Codify after success** | Lessons only after `verification=met` and `double_down` |

Secondary effect: lower token waste and better viability of smaller models once diagnostic artifacts exist.

Protocol detail: [`skills/ruthless-clarity/SKILL.md`](skills/ruthless-clarity/SKILL.md) (agent-facing) and [`skills/ruthless-clarity/references/full-framework.md`](skills/ruthless-clarity/references/full-framework.md) (full 12 chapters).

---

## Tools

| Tool | Requires | Produces |
|------|----------|----------|
| `define_victory` | — | Locked victory (resets all downstream state) |
| `run_diagnostic_loop` | Victory locked | Atomic diagnostic package (map + CV + kills) |
| `set_needle_metric` | Diagnostic complete | Single causal needle metric |
| `propose_irreversible_bet` | Needle set | Recorded bet (required before lock) |
| `lock_decision` | Bet recorded | Locked decision |
| `verify_cut` | Decision locked | `met` / `not_met` + evidence |
| `rollback_or_double_down` | Verification done | Consistent action; rollback clears diagnostic↓ |
| `codify_lesson` | `met` + `double_down` | Codified lesson |
| `get_protocol_status` | — | Gate checklist for current session |
| `export_artifacts` | — | Full session state JSON |

**Operational sequence (do not invent another):**  
`define_victory` → `run_diagnostic_loop` → `set_needle_metric` → `propose_irreversible_bet` → `lock_decision` → `verify_cut` → `rollback_or_double_down` → (`codify_lesson` only on success)

Chapters 2–4 are *conceptually* parallel (reason across map, lever, and kills together). They are *operationally* atomic: one commit via `run_diagnostic_loop`.

---

## Quick start (local / stdio)

```bash
npm install
npm run build
npm start
```

MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

### Claude Desktop / Cursor

```json
{
  "mcpServers": {
    "ruthless-clarity": {
      "command": "node",
      "args": ["/absolute/path/to/ruthless-clarity-mcp/dist/index.js"]
    }
  }
}
```

### Skill install (agent skill path)

Copy or symlink `skills/ruthless-clarity/` into your agent’s skills directory (e.g. `.claude/skills/`, `.cursor/skills/`, or your platform’s skill root). The skill is valid **with or without** the MCP server: without MCP, produce the same artifacts as structured sections in order.

---

## Docker

```bash
docker build -t ruthless-clarity-mcp .
docker run -i --rm ruthless-clarity-mcp
```

stdio transport. For MCPRush:

| Path | Use when | Notes |
|------|----------|--------|
| **Node.js** (recommended) | Public GitHub repo or App-authorized private repo | MCPRush runs `npm install` / build and adds HTTP adapter for stdio |
| **Published container image** | You push an image to a registry | Name start command `node dist/index.js`; MCPRush adds adapter |
| **Custom Dockerfile** | Only if you implement Streamable HTTP yourself | Custom Dockerfiles must expose their **own** Streamable HTTP endpoint — our stock Dockerfile is stdio-only |

Managed builds require a **public** source (or GitHub App read access). A private repo alone is not enough for managed builds.

---

## Architecture

- **Session-scoped state only** — no durable customer data on the server
- **Hard gates** — downstream tools return `isError: true` when upstream artifacts are missing
- **Atomic diagnostic** — prevents sequential fake-parallel (map → invent lever → afterthought kills)
- **State invalidation** — redefining victory or diagnostic clears dependent artifacts
- **Separate from** the private “Company Brain” variant (persistent, multi-layer, IoT-capable)

---

## Development

```bash
npm install
npm run build
npm start
npm run dev    # tsc --watch
```

Requirements: Node.js ≥ 18.

See [CONTRIBUTING.md](CONTRIBUTING.md) for PR and change rules.  
See [AGENTS.md](AGENTS.md) for how coding agents should work in this repo.

---

## License

Server Side Public License (SSPL) v1 — see [LICENSE](LICENSE).

Commercial licensing available for service use.

**Source protocol:** *Ruthless Clarity: The IN → DO → OUT Protocol* by Cameron Hartis
