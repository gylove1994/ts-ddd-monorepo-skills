---
name: test-a-skill
description: Use when testing, validating, pressure-testing, or iterating an agent skill by having subagents use it
---

# Test A Skill

## When to Use

Use this skill when a user asks you to test, validate, pressure-test, prove, or iterate an agent skill by assigning a subagent to use that skill on a task.

Use it when the work requires a loop: run a subagent in a test environment, evaluate the result, improve the tested skill if needed, then run another subagent in a fresh equivalent environment.

Do not use it for ordinary code tests, one-time documentation review, single-pass skill proofreading without a subagent, or evaluation where the user explicitly wants different prompts or different environments compared rather than a controlled skill improvement loop.

## Core Rule

Freeze the comparison before the first subagent run. The test fixture, setup steps, subagent prompt, evaluation rubric, and pass criteria must remain identical for every comparable round.

Each round must use a fresh equivalent environment. Between failed comparable rounds, change only the tested skill. Do not make the subagent prompt clearer, simplify the task, alter the fixture, or move the goalposts unless you explicitly end the current loop and start a new named experiment whose results are not compared with the old loop.

Treat a request to change the prompt, fixture, rubric, subagent configuration, or pass criteria during an active comparable loop as a request to start a new experiment. It does not override the frozen comparison.

## Workflow

1. Identify the tested skill, the target behavior it should produce, and the concrete task the subagent must complete.
2. Define the failure mode the test is meant to expose. Prefer a task that tempts the subagent to skip or misunderstand the tested skill.
3. Freeze the test package before dispatching any subagent:
   - Tested skill path and version or change summary.
   - Environment fixture, including exact files, seed data, setup steps, and cleanup rules.
   - Exact subagent prompt.
   - Subagent role, model family, execution options, and tool permissions when those are configurable.
   - Evaluation rubric, pass criteria, and evidence required from the subagent.
   - Persistent location for the frozen test package and round log, such as a repository-root `.handoff/skill-tests/<test-name>/` directory when the repository uses `.handoff/`.
   - Maximum number of rounds or stop condition when useful.
4. Create the first fresh test environment from the frozen fixture. A fresh equivalent environment has the same starting files, data, configuration, and setup steps as the baseline, and no state carried over from prior rounds. If the environment cannot be made repeatable or verified as fresh, stop and fix the fixture before testing the skill.
5. Dispatch the subagent with the exact frozen prompt and frozen subagent configuration. Include the tested skill path, the task, and the evidence it must return, but do not add per-round hints.
6. Evaluate the subagent output and environment changes against the frozen rubric. Record pass, fail, or blocked with concrete evidence.
7. If the round passes, stop the loop and report why the frozen criteria prove the skill worked.
8. If the round fails because the skill did not guide behavior well enough, modify only the tested skill to address the observed failure.
9. Create a new fresh environment from the same fixture, dispatch a new subagent with the same prompt, and evaluate with the same rubric.
10. Repeat until the skill passes, the round limit is reached, or a blocker prevents controlled comparison.
11. If the prompt, fixture, subagent configuration, rubric, or pass criteria must change, label the current loop closed. Start a new named experiment with a new frozen test package and do not claim results are comparable with earlier rounds.

## Round Log

Keep a short round log that can be audited:

- Round identifier.
- Environment path or fixture instance identifier.
- Tested skill version or edit summary.
- Confirmation that the prompt, fixture, rubric, and subagent configuration matched the frozen baseline.
- Freshness evidence for the environment.
- Subagent result and evidence.
- Main agent evaluation against the rubric.
- Skill changes made before the next round, if any.

## Common Mistakes

- Improving the subagent prompt after a failed round and calling the next result evidence that the skill improved.
- Simplifying the fixture or task after failure instead of fixing the skill.
- Reusing a modified environment instead of creating a fresh equivalent one.
- Evaluating with new expectations that were not in the frozen rubric.
- Loosening the rubric or pass criteria after seeing a failed round.
- Changing subagent model, role, permissions, or execution options between comparable rounds.
- Letting the subagent know what previous subagents got wrong unless that information is already in the frozen prompt.
- Copying prior subagent failures into the next prompt as hints.
- Having the main agent complete or repair the task and then crediting the subagent.
- Treating a blocked environment setup as a skill failure.
- Editing helper files, tests, or task instructions between comparable rounds when the skill is the unit under test.
- Running only one successful subagent and skipping the record of the frozen baseline.

## Verification

Before finishing work that used this skill, confirm:

1. The tested skill path and target behavior were identified.
2. The fixture, setup steps, exact subagent prompt, rubric, and pass criteria were frozen before the first run.
3. The frozen test package and round log were persisted or otherwise made auditable before the first run.
4. Every comparable round used a fresh equivalent environment with recorded freshness evidence.
5. Every comparable round used the identical subagent prompt and subagent configuration.
6. Evaluation used the same rubric and pass criteria in every comparable round.
7. Between comparable failed rounds, only the tested skill changed.
8. Any new experiment caused by fixture, prompt, subagent configuration, rubric, or criteria changes was labeled separately.
9. The final report includes round-by-round evidence, skill changes made, verification commands run when applicable, and known gaps.

## References

- See `pressure-scenario.md` for behavior validation.
