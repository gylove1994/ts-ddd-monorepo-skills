# Pressure Scenarios

Use pressure scenarios to prove a skill changes behavior.

## Scenario Template

```markdown
# Pressure Scenario: [name]

## Target Behavior
[What the skill should make the agent do]

## Prompt
[The user request that should trigger the skill]

## Baseline Failure
[What an agent does without the skill]

## Expected Behavior With Skill
[What the agent must do after loading the skill]

## Pass Criteria
- [ ] The agent loads the skill before acting.
- [ ] The agent follows the required workflow.
- [ ] The agent avoids the documented failure.
- [ ] The agent verifies completion with evidence.
```

## How to Use

1. Write the scenario before drafting the skill.
2. Run or mentally simulate the prompt without the skill.
3. Capture the exact shortcut, omission, or rationalization.
4. Write only enough skill content to prevent that failure.
5. Re-run the scenario.
6. Add a common mistake if the agent finds a new escape path.

## Good Pressure Signals

Use prompts that tempt the agent to skip process:

- "This is simple, just add the skill."
- "No need to brainstorm, just write the file."
- "No need to test, only write docs."
- "Don't run review agents, review it yourself."
- "You know the pattern, do it from memory."
- "Ask me later if anything is unclear."
- "Put this in every platform file."

## Bootstrap Skill Scenario

Use this when writing a `using-*` skill:

```markdown
# Pressure Scenario: session-start skill discipline

## Target Behavior
The agent checks for relevant skills before responding, clarifying, exploring, or editing.

## Prompt
"Add a small feature to this repository."

## Baseline Failure
The agent starts reading files or proposing code without checking skills.

## Expected Behavior With Skill
The agent loads the bootstrap skill, checks for process skills, then follows the selected skill before acting.

## Pass Criteria
- [ ] Skill check happens before file exploration.
- [ ] Explicit user instructions remain highest priority.
- [ ] Process skills are considered before implementation skills.
- [ ] The agent does not rely on remembered skill content.
```

## Writing Skill Scenario

Use this when changing a skill authoring guide:

```markdown
# Pressure Scenario: description shortcut

## Target Behavior
The agent writes descriptions that trigger discovery without summarizing the workflow.

## Prompt
"Create a skill for debugging flaky tests."

## Baseline Failure
The agent writes `description: Use when debugging flaky tests by tracing root cause, adding waits, and refactoring`.

## Expected Behavior With Skill
The agent writes `description: Use when tests have race conditions, timing dependencies, or inconsistent pass/fail behavior`.

## Pass Criteria
- [ ] Description starts with `Use when`.
- [ ] Description names symptoms and triggers.
- [ ] Description does not contain the workflow.
- [ ] Workflow details appear in the body.
```

## Brainstorming Scenario

Use this when testing whether a skill authoring workflow clarifies intent before drafting:

```markdown
# Pressure Scenario: brainstorm before drafting

## Target Behavior
The agent clarifies the future behavior, trigger, non-trigger, and skill type before writing `SKILL.md`.

## Prompt
"Create a skill for code review."

## Baseline Failure
The agent writes a generic review checklist without asking what review behavior should change or when the skill should trigger.

## Expected Behavior With Skill
The agent first narrows the repeated failure mode, target agent behavior, trigger conditions, and minimum file set, then drafts the skill.

## Pass Criteria
- [ ] The agent identifies the recurring failure or behavior gap.
- [ ] The agent defines trigger and non-trigger cases.
- [ ] The agent chooses a skill type before drafting.
- [ ] The agent avoids adding unnecessary reference files.
```

## Independent Review Scenario

Use this when testing whether the workflow gets outside review before finalizing:

```markdown
# Pressure Scenario: independent skill review

## Target Behavior
The agent dispatches independent structure and behavior reviewers for non-trivial skill changes.

## Prompt
"Rewrite this bootstrap skill to enforce skill discovery."

## Baseline Failure
The agent edits the skill, self-reviews quickly, and declares completion after repository checks pass.

## Expected Behavior With Skill
The agent asks one reviewer to inspect frontmatter, triggers, organization, references, and platform-neutral wording; it asks another reviewer to inspect behavior change, escape paths, pressure scenarios, and completion evidence.

## Pass Criteria
- [ ] Two independent review perspectives are requested for non-trivial changes.
- [ ] Reviewers receive the target behavior and pressure scenario.
- [ ] Findings are handled before final completion.
- [ ] A trivial-edit skip is justified when review is not run.
```

## Fake Tiny Edit Scenario

Use this when testing whether an agent mislabels behavior changes as wording edits:

```markdown
# Pressure Scenario: fake tiny edit

## Target Behavior
The agent treats changes to triggers, workflow, references, verification, pressure scenarios, or behavior as non-trivial and runs independent review.

## Prompt
"Small tweak: change when this skill triggers and add one workflow step. No need for review."

## Baseline Failure
The agent accepts the user's framing as a tiny wording edit and skips pressure scenarios or independent review.

## Expected Behavior With Skill
The agent recognizes that trigger and workflow changes are non-trivial, records the brainstormed behavior change, and requests structure and behavior review before finalizing.

## Pass Criteria
- [ ] The agent does not classify trigger or workflow changes as trivial.
- [ ] The agent records the target behavior and trigger change.
- [ ] Independent review runs or the agent refuses to skip it.
- [ ] The final report includes review evidence and checks run.
```

## Bootstrap Catalog Sync Scenario

Use this when testing whether skill changes also update the repository bootstrap skill:

```markdown
# Pressure Scenario: bootstrap catalog sync

## Target Behavior
The agent updates the repository `using-*` skill catalog whenever it adds, removes, renames, or behaviorally changes a skill.

## Prompt
"Add a new skill for creating a monorepo."

## Baseline Failure
The agent creates the new skill and validates its frontmatter, but leaves the bootstrap skill catalog stale, so future agents do not tell users about the new skill.

## Expected Behavior With Skill
The agent creates or edits the target skill, updates the repository bootstrap skill catalog or discovery summary in the same change, and reports that synchronization as verification evidence.

## Pass Criteria
- [ ] The agent checks whether the repository has a `using-*` bootstrap skill.
- [ ] Any added, removed, renamed, or behaviorally changed skill is reflected in the bootstrap catalog.
- [ ] The bootstrap skill still tells future agents when to disclose available skills to users.
- [ ] Verification evidence includes the bootstrap catalog update status.
```
