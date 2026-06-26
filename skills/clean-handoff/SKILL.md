---
name: clean-handoff
description: Use when cleaning, deleting, pruning, or removing files from the repository root `.handoff/` directory
---

# Clean Handoff

## When to Use

Use this skill when the user asks to clean, delete, reset, prune, or remove subagent handoff files or files under the repository root `.handoff/` directory.

Do not use it for general build artifacts, caches, logs, generated code, or files outside `.handoff/`.

## Core Rule

Only delete handoff files from the repository root `.handoff/` directory. Never broaden cleanup to other directories unless the user explicitly asks for a separate cleanup task.

If the requested cleanup scope is unclear, narrow it before deleting files.

## Workflow

1. Locate the repository root `.handoff/` directory.
2. If `.handoff/` does not exist, report that there are no handoff files to clean.
3. Determine the cleanup scope:
   - All handoff files.
   - Files for a named task, run, round, or subagent.
   - Files older than a user-specified point in time.
   - Files matching a clear `.handoff/` naming pattern from the handoff-producing task.
4. If the scope is ambiguous, ask the smallest clarifying question needed before deletion.
5. Delete only matching files inside `.handoff/`.
6. Leave `.handoff/` ignored by Git; do not remove the `.gitignore` entry.
7. Verify what remains in `.handoff/`.
8. Report a concise cleanup summary: removed count or paths, remaining files, and any skipped ambiguous files.

## Common Mistakes

- Deleting files outside `.handoff/` because they look temporary.
- Removing `.handoff/` from `.gitignore`.
- Deleting the entire `.handoff/` directory when only one run was requested.
- Guessing which files belong to a run when names are unclear.
- Reporting "cleaned" without verifying whether files remain.
- Treating missing `.handoff/` as an error instead of a no-op cleanup.

## Verification

Before finishing work that used this skill, confirm:

1. Cleanup was limited to the repository root `.handoff/` directory.
2. The requested scope was clear, or a clarifying question was asked before deletion.
3. Only matching handoff files were removed.
4. `.gitignore` still ignores `.handoff/`.
5. Remaining handoff files were checked or the directory was confirmed absent or empty.

## References

- See `pressure-scenario.md` for behavior validation.
