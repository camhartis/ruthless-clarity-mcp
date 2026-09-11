# Ruthless Clarity MCP

**Decision-discipline harness for AI agents.**

This MCP server turns the *Ruthless Clarity* protocol into enforceable tools.  
Agents that use it are forced through hard gates for victory definition, parallel diagnostic (reality map + controlling variable + kill options), and downstream execution discipline.

It is **not** a general agent harness.  
It is a decision-quality layer that reduces drift, reopened decisions, and invalid controlling variables.

---

## What this server enforces

1. **Define Victory Ruthlessly** — verifiable state + grandmother test before any work begins  
2. **Parallel Diagnostic Loop** (Chapters 2–4) — reality map + controlling variable + kill log run together  
3. **Hard gates** — downstream tools refuse to run without required upstream artifacts  
4. **Manipulability test** — controlling variables that fail “can we change it this afternoon?” are rejected  
5. **Permanent kill discipline** — previously killed options stay dead

Secondary effect: lower token waste and better viability of smaller models once the diagnostic artifacts exist.

Full protocol rules live in [`protocol/ruthless-clarity.md`](protocol/ruthless-clarity.md).

---

## Tools

| Tool | Purpose |
|------|---------|
| `define_victory` | Lock a verifiable victory condition |
| `run_diagnostic_loop` | Parallel reality map + controlling variable + kill log (highest-value tool) |
| `set_needle_metric` | Lock the single causal needle metric |
| `propose_irreversible_bet` | Small bet + rollback condition |
| `lock_decision` | Make the cut once |
| `verify_cut` | Binary verification against the needle |
| `rollback_or_double_down` | Forced response to verification |
| `codify_lesson` | Write the lesson into system memory |
| `get_protocol_status` | See which gates are satisfied in the current session |
| `export_artifacts` | Export structured artifacts produced so far |

---

## Quick start (local / stdio)

```bash
npm install
npm run build
npm start
```

Or with the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

### Claude Desktop / Cursor config example

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

---

## Development

```bash
npm install
npm run dev          # watch mode
npm run build
npm test
```

---

## Architecture notes

- Session-scoped state only (no long-term customer data)
- Hard gates between stages
- Designed for marketplace listing and freemium monetization
- Separate from the private “Company Brain” variant (persistent, multi-layer, IoT-capable)

---

## License

Server Side Public License (SSPL) v1 — see [LICENSE](LICENSE).

Commercial licensing available for service use.

---

**Source protocol:** *Ruthless Clarity: The IN → DO → OUT Protocol* by Cameron Hartis
