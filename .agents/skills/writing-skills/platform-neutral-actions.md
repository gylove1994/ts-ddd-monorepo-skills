# Platform-Neutral Actions

Skills should describe intent, not a specific runtime's tool names.

## Action Vocabulary

| Write this | Avoid this in shared skills |
| --- | --- |
| Read the relevant file | Use a specific file-reading tool |
| Search the repository | Use a specific search command |
| Create a todo for each checklist item | Use a runtime-specific todo API |
| Dispatch an independent agent | Use a named subagent command |
| Run the repository verification command | Use a hard-coded package manager unless the repo requires it |
| Report findings by severity | Use a platform-specific review format |
| Ask the user a blocking question | Use a named question tool |

## When Specific Tools Are Allowed

Use runtime-specific names only when:

- The skill is intentionally for one runtime.
- The tool name is the subject of the skill.
- A reference file maps generic actions to platform equivalents.

Keep shared skills portable. Put mappings in adjacent reference files or platform entrypoints.

## Generic Action Patterns

### Read Before Acting

Good:

```markdown
Read the current skill file before editing it.
```

Avoid:

```markdown
Use [specific tool] to read the current skill file.
```

### Parallel Review

Good:

```markdown
Dispatch two independent agents: one for structure, one for behavior.
```

Avoid:

```markdown
Call [specific subagent tool] with these exact parameters.
```

### Verification

Good:

```markdown
Run the repository's documented verification command and fix failures introduced by this change.
```

Avoid:

```markdown
Always run one hard-coded command in every repository.
```

## Completion Language

A skill should tell the agent what evidence to report:

- Files changed.
- Checks run.
- Failures found and fixed.
- Known gaps or unverified behavior.

Avoid claiming success without evidence.
