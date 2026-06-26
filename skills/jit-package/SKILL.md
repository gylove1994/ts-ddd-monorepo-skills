---
name: jit-package
description: Use when creating a new workspace package in a monorepo, scaffolding a shared library, choosing package structure, adding subpath exports, or when asked to add a build script or dist output for an internal workspace package
---

# JIT Package

## When to Use

Use this skill when adding a new internal workspace package, scaffolding a shared library, discussing monorepo package layout, or configuring subpath exports.

Do not use it when the package must publish to npm or other registries. Those packages need a traditional build that emits `.js` and `.d.ts`.

| Scenario | Recommendation |
|----------|----------------|
| Internal shared library (`private: true`) | **JIT** |
| Package published to npm | Traditional build (`.js` + `.d.ts`) |
| Frontend library consumed by Vite/webpack | JIT (bundler compiles TS) |
| Node server utility library | JIT (app tsc or tsx compiles TS) |

## Core Rule

Internal monorepo packages must be JIT packages: **`exports` point at `.ts` source**, there is **no emit/build step**, **no `dist` output**, and **`tsconfig.json` uses `noEmit: true`**. Compilation is the consumer's responsibility.

A user request to "add a build script" or "output dist" for an internal package is implementation wording, not permission to skip JIT. Do not add build scripts, emit steps, or compiled exports unless the user explicitly requires npm publication.

## Workflow

1. Create a todo for each major step before making changes.
2. Inspect the target monorepo before scaffolding:
   - Read `pnpm-workspace.yaml` to learn which directory globs are workspace members.
   - Read existing package `package.json` files to learn the workspace scope (for example `@workspace/<name>`).
   - Note which apps will consume the new package.
3. Confirm the package is internal (`private: true`) and will not be published.
4. Choose the tsconfig variant from `reference.md`:
   - Node-only consumers → `NodeNext` / `NodeNext`
   - Bundler-only frontend consumers → `ESNext` / `bundler`
   - **Both Node and bundler consumers** → `NodeNext` / `NodeNext` with `.js` relative import suffixes (Vite and webpack can consume this; do not pick bundler resolution for a shared Node + web package)
5. Create the directory under a path already covered by `pnpm-workspace.yaml` globs. Do not assume `packages/` or `package/`; follow the target monorepo layout.
6. Scaffold files from `reference.md` using the discovered workspace scope:
   - `package.json`
   - `tsconfig.json` with `noEmit: true`
   - `vitest.config.ts`
   - `src/index.ts` barrel and feature folders as needed
   - `tests/*.test.ts` when tests are in scope
7. If the package has multiple feature domains, add subpath `exports` and a barrel `src/<feature>/index.ts` per subpath.
8. Apply import suffix rules:
   - NodeNext packages: relative imports use `.js` extensions
   - bundler-only packages: extensions may be omitted
9. Add `"<scope>/<pkg-name>": "workspace:*"` to each consumer's `dependencies`, then run workspace install.
10. Run `typecheck` and tests for the new package before finishing.
11. Walk through the verification checklist below.

## Common Mistakes

- Adding a `build` script or `dist/` because the user said "just compile it" — internal packages stay JIT unless publishing.
- Adding any emit/build step even when `exports` still point at `.ts` source.
- Pointing `exports` at `./dist/index.js` or setting legacy `main` / `types` / `module` fields to compiled output.
- Omitting `private: true` on an internal-only package.
- Using `bundler` resolution for a package consumed by Node apps, or `NodeNext` for a bundler-only frontend library.
- Choosing `bundler` tsconfig for a package shared by Node and web apps — use NodeNext instead.
- Forgetting `.js` suffixes on relative imports in NodeNext packages.
- Creating subpath `exports` without a matching `src/<feature>/index.ts` barrel.
- Copying a scope from an external tutorial instead of the target monorepo's existing packages.
- Placing the package outside the `pnpm-workspace.yaml` globs.
- Adding consumer imports without a `workspace:*` dependency and install step.

## Verification

Before finishing, confirm every item:

- [ ] `private: true`
- [ ] `"type": "module"`
- [ ] Package `name` uses the target monorepo's established workspace scope
- [ ] All `exports` conditions point at `./src/**/*.ts`
- [ ] No legacy `main`, `types`, or `module` fields pointing at compiled output
- [ ] No emit/build script and no `dist` directory
- [ ] `tsconfig.json` includes `noEmit: true`
- [ ] `module` / `moduleResolution` match the consumer set (Node + web → NodeNext)
- [ ] NodeNext packages use `.js` suffixes on relative imports
- [ ] Each subpath export has a corresponding barrel `index.ts`
- [ ] Package path is within `pnpm-workspace.yaml` globs
- [ ] Consumers declare `workspace:*` dependency and install completed
- [ ] `typecheck` and relevant tests pass

Report evidence: package path, workspace scope used, consumer workspaces updated, checks run, and any known gaps.

## References

- See `reference.md` for directory layout, `package.json`, `tsconfig.json`, `vitest.config.ts`, subpath exports, and consumer wiring templates.
- See `pressure-scenario.md` for behavior validation.
