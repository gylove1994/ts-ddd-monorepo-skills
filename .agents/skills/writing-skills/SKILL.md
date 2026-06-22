---
name: writing-skills
description: Use when creating, editing, reviewing, or testing agent skills, skill repositories, SKILL.md files, bootstrap skills, or skill discovery rules
---

# Writing Skills

If you are creating or changing a skill, you must use this skill before writing or editing `SKILL.md`.

Skills are process documents that change future agent behavior. Treat them like tested code: define the failure, write the smallest instruction that prevents it, then verify behavior changed.

## Skill Check Rule

Before acting on any request about skills:

1. Identify whether the request creates, edits, reviews, organizes, or verifies skills.
2. If yes, read this skill completely.
3. If the target skill has references, read only the references needed for the current decision.
4. Follow the workflow below before writing final skill content.

Do not rely on memory. Skill instructions evolve.

## What Counts as a Skill

A skill is a reusable guide for a technique, workflow, tool, or decision pattern.

Create a skill when:

- The behavior should be reused across tasks or repositories.
- A future agent might skip, improvise, or misunderstand the process.
- The task requires judgment that cannot be fully enforced by scripts.
- The workflow benefits from explicit triggers, steps, and verification.

Do not create a skill for:

- One-off project notes.
- Generic advice already obvious to a capable agent.
- Mechanical rules that a validator can enforce.
- A workflow without a repeatable trigger.

## Authoring Workflow

1. Brainstorm the skill before drafting it.
2. Define the exact behavior the skill must change.
3. Write a pressure scenario before writing the skill body.
4. Record how an agent would likely fail without the skill.
5. Draft the smallest `SKILL.md` that blocks that failure.
6. Add common mistakes that close likely escape paths.
7. Verify the skill with the same scenario.
8. Move long examples or platform mappings into adjacent reference files.
9. Dispatch independent review agents for structure and behavior.

For pressure scenario templates, see `pressure-scenarios.md`.

## Brainstorming Before Drafting

Do not start by writing `SKILL.md`. First clarify the skill as a design problem:

1. Identify the recurring task or failure mode.
2. Ask what future agent behavior should change.
3. List when the skill should trigger and when it should not.
4. Decide whether the skill is a process, technique, pattern, or reference.
5. Choose the minimum files needed: usually `SKILL.md`; add references only for long examples, pressure scenarios, or platform mappings.
6. Confirm the skill belongs in the target skill library, not in repository instructions or an automated validator.

If requirements are unclear, ask focused questions before drafting. If several designs are possible, compare them briefly and choose the smallest one that changes behavior.

Keep the brainstorm auditable. Before drafting or in your final report, state:

- Recurring failure mode.
- Target behavior.
- Trigger and non-trigger cases.
- Skill type.
- Minimum file set.

## Frontmatter

Every `SKILL.md` needs:

```markdown
---
name: lower-case-hyphen-name
description: Use when [specific trigger, symptom, or situation]
---
```

Description rules:

- Start with `Use when`.
- Describe only the trigger conditions.
- Do not summarize the workflow.
- Include concrete symptoms and likely user wording.
- Keep it short enough that the agent must read the body for the process.

Bad:

```yaml
description: Use when writing skills - creates pressure scenarios, writes instructions, and verifies behavior
```

Good:

```yaml
description: Use when creating, editing, reviewing, or testing agent skills or SKILL.md files
```

## Bootstrap Skill Pattern

A `using-*` skill teaches agents how to load and obey other skills. It should be small, strict, and loaded at session start or repository entry.

Include:

- When to skip it, such as delegated subagent execution with a narrow task.
- A rule that relevant skills must be checked before responding, asking clarifying questions, exploring files, or editing code.
- Instruction priority: explicit user instructions first, loaded skills second, default habits last.
- Skill priority: process skills before implementation skills.
- A warning that knowing the idea is not the same as loading the current skill.
- Platform-neutral actions, not runtime-specific tool names.

Avoid:

- Copying full skill content into the bootstrap skill.
- Listing every possible skill.
- Embedding platform-specific commands in the main body.
- Making the bootstrap skill so long that agents skim it.

## Skill Body Structure

Use this default structure unless the task needs something simpler:

```markdown
# Skill Name

## When to Use
[Concrete triggers and non-triggers]

## Core Rule
[The behavior that must not be skipped]

## Workflow
[Ordered steps]

## Common Mistakes
[Rationalizations and corrections]

## Verification
[How to know the skill worked]

## References
[Adjacent files only]
```

## Platform-Neutral Writing

Write actions by intent:

- Read the relevant file.
- Create a todo for each checklist item.
- Dispatch an independent agent for parallel review.
- Run the repository's verification command.
- Report findings by severity.

Do not name a specific runtime tool in the main skill unless the skill is only for that runtime. Put mappings in a reference file instead.

For examples, see `platform-neutral-actions.md`.

## Common Mistakes

- Writing a description that summarizes the workflow. Agents may follow the summary and skip the body.
- Creating a skill before proving a repeatable failure.
- Skipping brainstorming and starting with polished prose before the behavior is clear.
- Adding broad philosophy instead of exact behavior.
- Hiding required steps in long prose.
- Copying the same instructions into multiple platform entrypoints.
- Treating `SKILL.md` as documentation only, instead of behavior control.
- Reviewing the skill yourself only, without independent structure and behavior review for non-trivial changes.
- Forgetting completion criteria.

## Independent Review

For any non-trivial skill creation or modification, dispatch two independent review agents before finalizing:

1. Structure reviewer: checks frontmatter, triggers, organization, token economy, reference placement, and platform-neutral wording.
2. Behavior reviewer: checks whether the skill changes agent behavior, closes likely escape paths, supports pressure scenarios, and defines evidence of completion.

Give reviewers the skill files, target behavior, and pressure scenario. Ask for findings first, ordered by severity. Fix issues that would prevent discovery, correct use, or behavior verification.

Skip independent review only for tiny wording edits that do not alter triggers, workflow, references, verification, pressure scenarios, or behavior. If review is skipped, state why the edit is trivial.

## References

- For pressure scenario templates, see `pressure-scenarios.md`.
- For platform-neutral action wording, see `platform-neutral-actions.md`.

## Verification

Before finishing:

1. Confirm the skill has a specific trigger.
2. Confirm the description does not reveal the workflow.
3. Confirm the brainstormed target behavior is reflected in the body.
4. Confirm the body contains a concrete workflow and common mistakes.
5. Confirm references are adjacent and one level deep.
6. Confirm a pressure scenario exists for behavior validation.
7. Confirm independent review was run, findings were handled, or a trivial-edit skip was justified.
8. Report evidence: pressure scenario name, review summary or skip reason, checks run, and known gaps.
9. Run repository validation if the skill lives in a repository.
