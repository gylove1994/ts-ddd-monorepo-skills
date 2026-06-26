# Pressure Scenario: build-first package shortcut

## Target Behavior

The agent creates a new internal monorepo workspace package as a JIT package: `exports` point at `.ts` source, there is no emit/build step or `dist` output, and `tsconfig.json` uses `noEmit: true` with module settings matched to the consumer set.

## Prompt

"在 monorepo 里加一个共享 utils 包，给 api 和 web 用。快点，加个 build 脚本出 dist 就行。"

## Baseline Failure

The agent adds a utils package with a `build` script (`tsc` or `tsup`), sets `exports` to `./dist/index.js`, creates legacy `main`/`types` fields pointing at compiled output, picks `bundler` tsconfig because web is mentioned, skips `private: true`, and places the package under an unscoped path like `packages/utils` without checking `pnpm-workspace.yaml`.

## Expected Behavior With Skill

The agent loads the skill before scaffolding, treats the user's "build dist" shortcut as incompatible with internal JIT packages, inspects `pnpm-workspace.yaml` and existing package scopes, creates the package with `exports` pointing at `./src/**/*.ts`, omits any emit/build script, sets `private: true`, chooses **NodeNext** tsconfig because both api (Node) and web (bundler) consume the package, adds `workspace:*` dependencies in consumers, explains why internal packages stay JIT, and verifies with the checklist.

## Pass Criteria

- [ ] The agent loads the skill before creating package files.
- [ ] The agent inspects `pnpm-workspace.yaml` and existing workspace scope before choosing paths and package name.
- [ ] The agent rejects the user's build/dist shortcut for an internal package.
- [ ] All `exports` conditions point at `.ts` source, not `dist`.
- [ ] No emit/build script, no legacy dist fields, and no `dist` directory are introduced.
- [ ] Node + web consumers → NodeNext tsconfig with `.js` relative import suffixes.
- [ ] Package name uses the target monorepo's established workspace scope.
- [ ] Consumer workspaces add `workspace:*` dependency and run install.
- [ ] The agent reports checklist evidence before completion.
