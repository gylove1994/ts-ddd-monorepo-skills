# Agent Support

This template follows the same broad shape as Superpowers: one shared skills library plus small runtime-specific entrypoints.

## Shared Library

`skills/` is the source of truth. Do not duplicate complete skill instructions into plugin manifests or agent instruction files.

## Entrypoints

| Agent Runtime | Entrypoint |
| --- | --- |
| Generic agents | `AGENTS.md` |
| Claude | `CLAUDE.md`, `.claude-plugin/plugin.json` |
| Cursor | `.cursor-plugin/plugin.json` |
| Codex | `.codex-plugin/plugin.json` |
| Gemini | `GEMINI.md`, `gemini-extension.json` |
| Kimi | `.kimi-plugin/plugin.json` |
| OpenCode | `.opencode/INSTALL.md`, `.opencode/plugins/skills-template.js` |
| Pi | `package.json`, `.pi/extensions/skills-template.ts` |

## Maintenance Rules

- Keep skill content in `skills/`.
- Keep platform files focused on metadata, installation, and bootstrap behavior.
- Prefer relative paths so the repository can be forked or renamed.
- Update `tests/validate-structure.mjs` when adding a new required entrypoint.
