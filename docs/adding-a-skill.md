# Adding a Skill

Use this checklist when adding a skill to the repository.

Before creating or changing a distributed skill, use the project-level authoring skill at `.agents/skills/writing-skills/SKILL.md`.

Distributed skills live under `skills/`. Project-level authoring, testing, or repository operation skills may live under `.agents/skills/` when they are meant to guide agents working on this repository rather than be distributed as part of the shared skill library.

## 1. Create the Directory

Create one directory per skill:

```text
skills/my-skill/
├── SKILL.md
└── reference.md
```

Use lowercase letters, numbers, and hyphens for directory names.

For project-level skills, use the same structure under `.agents/skills/my-skill/`.

## 2. Write `SKILL.md`

Every skill must start with YAML frontmatter:

```markdown
---
name: my-skill
description: Performs a specific workflow. Use when the user asks for that workflow or mentions related trigger terms.
---
```

The `description` should include:

- When an agent should use it.
- Trigger words that users are likely to mention.
- Symptoms or situations that indicate the skill applies.

Do not summarize the workflow in `description`; put the workflow in the body.

## 3. Keep Skills Agent-Neutral

Write the core workflow for any capable coding agent. Put agent-specific details in `docs/agent-support.md` or the relevant plugin entrypoint only when the runtime requires it.

## 4. Use Progressive Disclosure

Keep `SKILL.md` concise. Move detailed examples, long references, or scripts into adjacent files and link to them directly.

## 5. Validate

Run:

```bash
pnpm test
```

The structure validator checks required repository entrypoints and basic skill frontmatter.
