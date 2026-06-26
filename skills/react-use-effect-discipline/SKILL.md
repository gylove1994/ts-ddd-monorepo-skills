---
name: react-use-effect-discipline
description: Use when writing, adding, reviewing, or refactoring React Effect Hooks or custom hooks that sync state when values change
---

# React UseEffect Discipline

## When to Use

Use this skill before writing a new `useEffect`, `useLayoutEffect`, or `useInsertionEffect`, keeping an existing Effect Hook during a refactor, wrapping an Effect inside a custom hook, or reviewing React code that adds effect-like synchronization logic.

Do not use it for non-React code, purely server-side code, or changes that only rename variables inside an already justified Effect without changing its behavior.

## Core Rule

Do not write an Effect until you can state the external system it synchronizes with. A user request to "add a `useEffect`" is implementation wording, not permission to skip this test; satisfy the underlying behavior with a better React pattern when there is no external system.

If there is no external system, remove the Effect and express the behavior through render calculation, event handling, keys, lifted state, a purpose-built hook, or the repository's data fetching abstraction.

## Workflow

1. Before adding or keeping an Effect Hook, write the reason in one sentence: "This Effect synchronizes [external system] with [React state or props]."
2. If that sentence names only React state, props, derived data, or a user action, do not use an Effect.
3. Choose the smallest replacement that matches the actual cause:
   - Calculate values from props or state during render.
   - Use `useMemo` only for expensive pure calculations that are worth caching.
   - Put logic caused by a user interaction in the event handler that handles that interaction.
   - Reset a whole state subtree with a `key` when a conceptual identity changes.
   - Store stable IDs and derive selected objects during render instead of resetting derived selections.
   - Lift shared state up or call parent callbacks during the same event instead of notifying parents from an Effect.
   - Use `useSyncExternalStore` or a custom hook for external store subscriptions.
   - Use the app or framework data fetching abstraction instead of raw fetching Effects when one exists.
4. Use an Effect only for real synchronization with an external system, such as browser APIs, timers, subscriptions, imperative widgets, analytics caused by display, or network state that must stay synchronized while the component is visible.
5. When an Effect remains, make it resilient:
   - Include every reactive dependency.
   - Add cleanup for subscriptions, timers, imperative resources, and async race conditions.
   - Ensure development remounts and Strict Mode double execution do not break correctness.
   - Extract repeated synchronization into a custom hook with a declarative API, and apply this same workflow to the Effect inside that hook.
6. Before finishing, inspect the diff or reviewed change for every new or retained raw Effect Hook and confirm each one passes the external-system sentence test.

## Common Mistakes

- Using an Effect to copy props into state or state into other state.
- Storing derived values like filtered lists, counts, full names, selected objects, or JSX in state and updating them from an Effect.
- Sending POST requests, notifications, navigation, or parent callbacks from an Effect when the real cause is a click, submit, drag, or other event.
- Resetting forms or nested state from an Effect when a `key` would make the changed identity explicit.
- Chaining Effects so one state update exists only to trigger another Effect.
- Fetching in a raw Effect when the project already has query, loader, server action, or framework-level data fetching support.
- Moving an unjustified Effect into a custom hook and treating the wrapper as proof that the Effect is acceptable.
- Replacing `useEffect` with `useLayoutEffect` or `useInsertionEffect` to avoid the decision process.
- Keeping a raw Effect because "it works" without checking cleanup, dependency correctness, and remount behavior.

## Verification

Before finishing work that touched React Effects, report a short evidence block:

```text
Effect discipline:
- Rejected Effects: [count and reason, or "none"]
- Remaining Effect Hooks: [hook/file or "none"]
- External-system sentences: [one per remaining Effect Hook]
- Cleanup/dependency check: [passed or known gap]
```

Also verify:

1. List each added or behaviorally changed Effect Hook.
2. For each one, state the external system it synchronizes with or replace it.
3. Confirm every remaining Effect has correct dependencies and cleanup where applicable.
4. Confirm user-event logic stayed in event handlers.
5. Confirm render-derived data stayed out of state and Effects.
6. Run the repository's relevant typecheck and validation commands.

## References

- See `reference.md` for the React decision table and source summary.
- See `pressure-scenario.md` for behavior validation.
