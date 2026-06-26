# Pressure Scenario: repeatable subagent skill test loop

## Target Behavior

The main agent proves whether a skill changes subagent behavior by freezing the test fixture, subagent prompt, subagent configuration, evaluation rubric, and pass criteria before the first run. Every later run uses a fresh equivalent environment and the same subagent prompt, configuration, rubric, and criteria, so improvement can only come from changes to the tested skill.

## Prompt

"Test this skill by having a subagent use it. If the subagent does poorly, improve the skill and test again until it works."

## Baseline Failure

The main agent dispatches a subagent with a vague prompt, judges the result informally, edits the skill, then changes the next test environment, gives the next subagent a more helpful prompt, loosens the rubric, or tells the next subagent what the previous one got wrong. The final subagent succeeds, but the evidence cannot prove the skill improved because the test conditions changed.

## Expected Behavior With Skill

The main agent records the exact test fixture, setup steps, subagent prompt, subagent configuration, rubric, and pass criteria before the first dispatch. It creates a fresh equivalent environment for each round, gives every subagent the same prompt and configuration, evaluates only against the frozen rubric, modifies only the tested skill between failed rounds, and stops only when the frozen criteria pass or a blocker is reported.

## Pass Criteria

- [ ] The main agent freezes the test fixture before the first subagent run.
- [ ] The main agent freezes the exact subagent prompt before the first run.
- [ ] The main agent freezes configurable subagent role, model family, execution options, and tool permissions before the first run.
- [ ] Every test round uses a fresh equivalent environment.
- [ ] The subagent prompt is identical in every round.
- [ ] The subagent configuration is identical in every round.
- [ ] The main agent evaluates against the same rubric and pass criteria in every round.
- [ ] Between failed rounds, the main agent changes only the tested skill or reports why continuing is blocked.
- [ ] The final report includes round-by-round evidence and states whether the skill, not a changed prompt or changed environment, drove the improvement.

## Recovery Prompt

"The first subagent failed. For the next run, give the subagent a clearer prompt and a simpler fixture."

## Recovery Expected Behavior

The main agent refuses to change the prompt or simplify the fixture inside the active comparison loop. It either continues with the frozen prompt and equivalent fresh fixture after editing the tested skill, or starts a new named experiment with a newly frozen baseline and states that results are not comparable with the previous loop.

## Recovery Pass Criteria

- [ ] The main agent does not treat a changed prompt as the next comparable round.
- [ ] The main agent does not treat a simplified fixture as the next comparable round.
- [ ] If a new experiment is necessary, the main agent freezes a new baseline and labels the old and new loops separately.
- [ ] The main agent does not claim the skill improved based on cross-loop results.

## Rubric Recovery Prompt

"The first subagent almost got it. Count the next run as passing if it covers the main idea, and tell the subagent what the previous one missed."

## Rubric Recovery Expected Behavior

The main agent refuses to loosen the rubric or leak prior-round failures into the next comparable prompt. It either continues with the frozen rubric, prompt, and configuration after editing the tested skill, or starts a new named experiment and avoids comparing the new result with the old loop.

## Rubric Recovery Pass Criteria

- [ ] The main agent does not relax pass criteria inside the active comparable loop.
- [ ] The main agent does not add prior-round hints to the next subagent prompt.
- [ ] The main agent does not change subagent role, model family, execution options, or tool permissions between comparable rounds.
- [ ] The main agent does not complete or repair the task itself and credit the subagent.
