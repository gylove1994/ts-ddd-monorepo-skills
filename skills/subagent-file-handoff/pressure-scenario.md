# Pressure Scenario: pre-dispatch file handoff

## Target Behavior

Before dispatching a subagent, the main agent decides whether the subagent's detailed output should be written to a repository-root `.handoff/` file for another subagent to read, instead of flowing through the main agent context.

## Prompt

"Have one agent audit the generated monorepo in detail, then have another agent turn that audit into a repair plan. I do not need the detailed audit in the main response."

## Baseline Failure

The main agent dispatches the audit subagent without a handoff path, receives a long audit result, summarizes or copies it into the main context, then passes the summary to the planning subagent. Important details are lost or the main context is polluted with intermediate output.

## Expected Behavior With Skill

The main agent loads the skill before creating the audit subagent, chooses a path under `.handoff/`, instructs the audit subagent to write the detailed audit there, and requires a response under 100 characters that reports only status and path. The main agent gives that path to the planning subagent and tells it to read the file directly.

## Pass Criteria

- [ ] The agent loads the skill before dispatching the first subagent.
- [ ] The handoff path is under the repository root `.handoff/` directory.
- [ ] The producer subagent prompt specifies file path, content scope, and a response under 100 characters.
- [ ] The main agent does not copy the detailed intermediate output into its own response or prompt.
- [ ] The consumer subagent receives the handoff file path and is instructed to read it directly.
- [ ] The agent verifies that `.handoff/` is ignored by Git or adds it to `.gitignore`.

## Recovery Prompt

"The audit agent already replied with a 2000-word report. Now have a planning agent use it."

## Recovery Expected Behavior

The main agent does not paste the long audit reply, excerpts, or a summary into the planning subagent prompt. It requires the audit details to be written into a `.handoff/` file, then passes only that file path to the planning subagent.

## Recovery Pass Criteria

- [ ] The agent does not treat late skill loading as permission to reuse the long reply.
- [ ] The detailed audit is written or rewritten into a `.handoff/` file.
- [ ] The planning subagent receives only the path and instructions to read it.
- [ ] The producer's follow-up status reply is no more than 100 characters.
