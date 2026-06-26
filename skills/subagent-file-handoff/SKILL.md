---
name: subagent-file-handoff
description: Use when preparing to dispatch or chain subagents whose detailed intermediate output should be read by another subagent
---

# Subagent File Handoff

## When to Use

Use this skill before creating, dispatching, or chaining subagents when one subagent will produce detailed intermediate output that another subagent should read, and the main agent does not need to inspect or summarize those details.

Do not use it when the main agent must review the details before deciding the next step, when the intermediate output is short enough to pass directly, or when the result is the final answer to the user.

## Core Rule

Decide on file handoff before dispatching the producer subagent. All handoff files must live under the repository root `.handoff/` directory, and the producer subagent must be told the exact path, required content, and response limit before it starts work.

The producer subagent still replies to the main agent, but the reply must be extremely brief: no more than 100 characters, usually status plus the `.handoff/` path.

The main agent must pass the handoff path to the consumer subagent, not the handoff file contents, copied excerpts, or a summary of the producer's long output. If a producer already returned a long result before handoff was planned, do not use that long result as consumer input; ask the producer to write or rewrite the details into `.handoff/`, then pass only the path forward.

## Workflow

1. Before dispatching a subagent, ask whether its detailed output is only needed by another subagent.
2. If file handoff applies, verify that repository root `.gitignore` ignores `.handoff/`; add `.handoff/` if it is missing.
3. Choose a clear path under `.handoff/` using task, producer role, and round when helpful, such as `.handoff/monorepo-audit-reviewer-round-1.md`.
4. In the producer subagent prompt, include:
   - The exact `.handoff/` file path to write.
   - The content scope and format expected in the file.
   - Any constraints, source files, commands, or context the consumer subagent will need.
   - A requirement to reply to the main agent in no more than 100 characters.
5. Keep detailed intermediate content out of the main agent context. The main agent should retain only the path, status, and purpose of the handoff.
6. If the producer violates the 100-character reply limit, ignore the long reply as handoff content and require the producer to confirm that the `.handoff/` file contains the details.
7. When dispatching the consumer subagent, give it the `.handoff/` path and instruct it to read that file as its source of detailed input.
8. Make the consumer prompt self-contained: include the path, the fact that handoff rules were already applied, and the verification evidence expected from the consumer.
9. In final reporting, mention the handoff path only when it is useful evidence for the user.

## Handoff File Content

A useful handoff file should include only what the next subagent needs to continue independently:

- Task background and goal.
- Key findings, decisions, constraints, and open questions.
- File paths, commands, or evidence gathered.
- Recommended next actions or consumer instructions.
- Known gaps or verification still needed.

## Common Mistakes

- Loading the skill after the first subagent has already produced a long result.
- Writing handoff files outside the repository root `.handoff/` directory.
- Forgetting to ensure `.handoff/` is ignored by Git.
- Asking the producer subagent to "summarize briefly" without requiring a file path and content scope.
- Copying the handoff file contents back into the main agent prompt before dispatching the consumer.
- Reading the handoff file in the main agent and pasting excerpts into the consumer prompt.
- Feeding the producer's overlong reply to the consumer instead of requiring a `.handoff/` file.
- Treating handoff as silence; the producer must still send a status reply under 100 characters.
- Using a vague path like `.handoff/output.md` when several subagents or rounds are involved.

## Verification

Before finishing work that used this skill, confirm:

1. The skill was loaded before the producer subagent was dispatched.
2. The handoff file path was under `.handoff/`.
3. The producer prompt specified the path, content scope, and 100-character reply limit.
4. The main agent passed the path, not copied details, to the consumer subagent.
5. `.handoff/` was ignored by Git or added to `.gitignore`.
6. The producer gave a brief status reply and the consumer was told to read the file.
7. Any producer reply over 100 characters was not reused as consumer input.

## References

- See `pressure-scenario.md` for behavior validation.
