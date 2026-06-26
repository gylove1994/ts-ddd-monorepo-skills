---
name: using-ts-ddd-monorepo
description: Use when entering the ts-ddd-monorepo repository, starting repository work, or creating, changing, reviewing, or verifying skills
---

# Using TS DDD Monorepo

## When to Use

Use this skill before any substantive work in the `ts-ddd-monorepo` repository, including answering implementation questions, asking clarifying questions about repository work, exploring files, editing code, creating skills, reviewing changes, or choosing verification commands.

Skip it only when a delegated agent receives a narrow, self-contained task that already names the exact files, lists the relevant skills already read, passes along the current applicable skill instructions, and states the verification evidence required.

## Core Rule

Check for relevant repository skills before acting. Knowing the idea of a skill is not enough; read the current skill content and follow it exactly when it applies.

When this skill is used, tell the user which skills are currently available in this repository context and what each one is for before continuing with the task. Keep the explanation brief and based on the current skill catalog below.

Explicit user instructions have highest priority, loaded skills come next, and default agent habits come last. A skill-defined safety or precondition stop, such as refusing to scaffold into a non-empty target directory, is not overridden by a user preference to continue. When multiple skills apply, process skills must be loaded before implementation skills.

## Skill Catalog

- `using-ts-ddd-monorepo`: Use when entering this repository, starting repository work, or creating, changing, reviewing, or verifying skills.
- `create-a-new-monorepo`: Use when starting a fresh TypeScript monorepo, scaffolding a pnpm workspace with shared shadcn UI, Storybook, or AI Elements, or bootstrapping apps and packages from an empty directory.
- `create-a-new-fe-app`: Use when adding a new React TypeScript frontend app to an existing pnpm monorepo.
- `jit-package`: Use when creating a new workspace package in a monorepo, scaffolding a shared library, choosing package structure, adding subpath exports, or when asked to add a build script or dist output for an internal workspace package.
- `backend-ddd-modular-layered`: Use when adding backend feature modules, creating tRPC routers, writing Drizzle adapters, defining domain ports or services, or diagnosing backend layer-boundary issues.
- `env-vars-best-practices`: Use when code reads `process.env` directly, `.env` loading is requested, `dotenv.config()` appears, `APP_*` prefixes differ across dev/server, env examples drift, or startup config validation is missing.
- `react-use-effect-discipline`: Use when writing, adding, reviewing, or refactoring React Effect Hooks or custom hooks that sync state when values change.
- `writing-skills`: Use when creating, editing, reviewing, or testing agent skills, `SKILL.md` files, bootstrap skills, skill repositories, or skill discovery rules. Path: `.agents/skills/writing-skills/SKILL.md`.
- `test-a-skill`: Use when testing, validating, pressure-testing, or iterating an agent skill by having subagents use it. Path: `.agents/skills/test-a-skill/SKILL.md`.
- `subagent-file-handoff`: Use when preparing to dispatch or chain subagents whose detailed intermediate output should be read by another subagent.
- `clean-handoff`: Use when cleaning, deleting, pruning, or removing files from the repository root `.handoff/` directory.

When a repository skill or project-level authoring skill is added, removed, renamed, or behaviorally changed, update this catalog in the same change.

## Workflow

1. Inspect the repository skill library for relevant skills before responding, clarifying, searching files, or editing.
2. Tell the user the available skills and each skill's purpose, using the catalog above.
3. Read every relevant `SKILL.md` that applies to the task.
4. If the task creates, edits, reviews, organizes, or verifies skills, load the skill-authoring process before drafting or changing skill files.
5. If the task tests, validates, pressure-tests, or iterates a skill by having subagents use it, load `test-a-skill` before creating the first test environment or dispatching the first subagent.
6. If the task will dispatch or chain subagents and detailed intermediate output is only needed by another subagent, load `subagent-file-handoff` before creating those subagents.
7. If the task adds, removes, renames, or behaviorally changes a repository skill or project-level authoring skill, update this skill's catalog in the same change.
8. Choose the smallest set of skills that changes behavior for the current task. Do not load unrelated skills.
9. Follow loaded skills in priority order: user instructions, process skills, implementation skills, then general repository habits.
10. Create a todo for each required checklist item when the task has multiple steps or any loaded skill requires staged verification.
11. Before finishing, run the repository's documented verification commands for the files or behavior changed, and report evidence. If no files changed, report the checked and loaded skills, the applicable workflow, why no command was run, and any known gaps.

## Common Mistakes

- Starting with file exploration because the request looks simple. Skill discovery happens first.
- Treating the repository name or past experience as a substitute for reading current skill files.
- Loading implementation guidance before required process guidance, such as skill authoring or review workflow.
- Copying full skill instructions into platform entrypoints instead of keeping shared behavior in `skills/`.
- Asking broad clarifying questions before checking whether an existing skill already defines the workflow.
- Skipping verification because the change is documentation-only. Skill changes still need structure validation when the repository provides it.
- Adding or modifying a skill without updating the skill catalog here.
- Loading this skill silently without telling the user which skills are available.
- Testing a skill with subagents while loading only `writing-skills` and skipping the controlled loop in `test-a-skill`.

## Pressure Scenario

Prompt: "Add a small skill to this repository."

Baseline failure: The agent writes `SKILL.md` from memory, skips the skill-authoring process, and validates only by rereading its own file.

Expected behavior: The agent loads this bootstrap skill, discovers the skill-authoring process, reads it before drafting, follows its workflow, and reports verification evidence.

Pass criteria:

- Skill discovery happens before file exploration or edits.
- The agent tells the user the available skills and what each one does.
- Explicit user instructions remain highest priority.
- Process skills are considered before implementation skills.
- The agent reads current skill content instead of relying on memory.
- Any added, removed, renamed, or behaviorally changed repository or authoring skill is reflected in this catalog.
- Skill changes follow the loaded authoring skill's independent review model and evidence requirements.
- Verification evidence is reported before completion.

## Verification

Before finishing work after loading this skill:

1. State which relevant skills were checked and which were loaded.
2. Confirm the user was told which skills are available and what each one does.
3. State any applicable user instruction that overrode a default habit.
4. Confirm whether process skills were needed before implementation skills.
5. If a repository or authoring skill changed, confirm this catalog was updated in the same change.
6. For skill changes, report the independent review model used or model limitation from the loaded authoring skill.
7. Report files changed, verification commands run, failures fixed, and any known gaps. If no files changed, report that explicitly with the checked skills and reason verification commands were not applicable.
