# Contributing

Thanks for helping harden Ruthless Clarity. This project prioritizes **correct gates over feature volume**.

## Before you change behavior

1. Read [AGENTS.md](AGENTS.md) (product rules and gate sequence).
2. Read [skills/ruthless-clarity/SKILL.md](skills/ruthless-clarity/SKILL.md) (agent-facing contract).
3. If your change alters a gate, plan updates to **server + skill + README** in the same PR.

## Development setup

```bash
git clone https://github.com/camhartis/ruthless-clarity-mcp.git
cd ruthless-clarity-mcp
npm install
npm run build
npm start
```

Node.js ≥ 18 required.

### Inspector smoke path

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Walk: victory → diagnostic → needle → bet → lock → verify → double_down → codify.  
Also confirm failure paths: diagnostic without victory; lock without bet; empty kill log; codify without success.

## Pull requests

- **One concern per PR** when possible (gate fix vs docs vs packaging).
- Describe which gates change and how agents could previously skip them.
- Keep skill and server aligned; reviewers will reject skill-only or server-only gate changes that disagree.
- Do not weaken rejects without an explicit rationale in the PR body.
- Branch protection may require review / signed commits — follow the repo settings.

### PR checklist

- [ ] `npm run build` succeeds
- [ ] Gate sequence still matches AGENTS.md
- [ ] SKILL.md tool table updated if tools/fields changed
- [ ] README tools table and sequence updated if needed
- [ ] No broken links to removed paths
- [ ] Dockerfile still builds (if packaging touched)
- [ ] Manual inspector smoke of happy path + one hard-gate failure

## Code style

- TypeScript strict; no `any` for tool inputs — use Zod schemas.
- Error messages: `HARD GATE:` for missing upstream state; `REJECTED:` for invalid payload; `INCONSISTENT:` for action vs verification mismatch.
- Session state stays in-memory and process-local.

## Reporting issues

Include:

- Tool call sequence attempted
- Expected gate behavior
- Actual response (`isError`, message text)
- Whether MCP server, skill-only, or both were in use

## License

Contributions are accepted under the same SSPL v1 terms as the repository (see [LICENSE](LICENSE)). Commercial use of the service form may require a separate license from the author.
