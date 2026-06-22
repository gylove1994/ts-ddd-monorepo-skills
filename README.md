# Multi-Agent Skills Template

[中文文档](README.zh-CN.md)

Blank repository template for sharing one skills library across multiple coding agents.

The repository keeps agent-neutral skill instructions in `skills/` and provides thin entrypoints for agent runtimes such as Cursor, Claude, Codex, Gemini, Kimi, OpenCode, and Pi.

## Repository Layout

```text
.
├── skills/                 # Shared skill library
├── docs/                   # Maintainer documentation
├── hooks/                  # Optional hook manifests and scripts
├── .cursor-plugin/         # Cursor plugin manifest
├── .claude-plugin/         # Claude plugin manifest
├── .codex-plugin/          # Codex plugin manifest
├── .kimi-plugin/           # Kimi plugin manifest
├── .opencode/              # OpenCode plugin entrypoint
├── .pi/                    # Pi extension entrypoint
├── AGENTS.md               # Generic agent instructions
├── CLAUDE.md               # Claude-compatible instructions
├── GEMINI.md               # Gemini-compatible instructions
└── gemini-extension.json   # Gemini CLI extension manifest
```

## Add a Skill

Create a new directory under `skills/`:

```text
skills/my-skill/
├── SKILL.md
└── reference.md
```

Every skill must include `SKILL.md` with YAML frontmatter:

```markdown
---
name: my-skill
description: Performs a specific workflow. Use when the user asks for that workflow or mentions related trigger terms.
---

# My Skill

## Instructions

Write concise, agent-neutral instructions here.
```

See `docs/adding-a-skill.md` for the full checklist.

## Agent Support

Agent entrypoints should stay thin. They should point the runtime at `skills/` and avoid duplicating skill content.

See `docs/agent-support.md` for current entrypoints and maintenance notes.

## Verification

```bash
pnpm install
pnpm typecheck
pnpm test
```
