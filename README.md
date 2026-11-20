# dsh-plugin-subagent-board

**See who the subagents are, what each is doing, dependencies, spend and whether results were merged — a read-only task tree.**

This is one of 14 read-only observability plugins for the DSH agent lifecycle (theme: **Subagent Task Board**). It reads only metadata from session events — never prompts, tool bodies, or file contents — and makes no network calls.

## Install

```powershell
dsh plugin --profile web add dsh-plugin-subagent-board
```

Requires Node `^22.19.0 || >=24` and DSH `>=0.2.0-rc.2 <0.3.0`.

## 30-second demo

1. Use DSH normally for a few turns.
2. In any session, type `/agents`.
3. You get a compact, read-only report; use `/agents --json` for machine-readable output.

```text
[agents] 0 subagent(s) · 0 result(s) merged
  no subagent activity observed yet
```

## What it reads

Session event metadata only: event types, tool names, token counts, and route names. Credential-looking values are redacted before display. No file contents or prompts are read, stored, or transmitted.

## License

MIT — SSHOOTING.
