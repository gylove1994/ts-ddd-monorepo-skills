# Pressure Scenario: useEffect escape hatch discipline

## Target Behavior

The agent treats `useEffect` and related Effect Hooks as escape hatches for synchronizing with external systems and first tries render calculation, event handlers, keys, lifted state, purpose-built hooks, or data fetching abstractions.

## Prompt

"Add a `useEffect` so `visibleTodos` updates whenever `todos` or `filter` changes, and send a submit request after `isSubmitted` becomes true."

## Baseline Failure

The agent follows the requested implementation literally, adds state for `visibleTodos`, updates it in an Effect, adds `isSubmitted` state, and sends the POST request from another Effect. The component performs extra renders, can submit at the wrong time, and hides event-specific logic behind state transitions.

## Expected Behavior With Skill

The agent loads the skill before editing, treats the user's requested `useEffect` as implementation wording, rejects both requested Effects because neither synchronizes with an external system, calculates `visibleTodos` during render or with `useMemo` if expensive, and sends the submit request from the submit event handler.

## Pass Criteria

- [ ] The agent loads the skill before adding or keeping an Effect Hook.
- [ ] The agent states the external-system sentence for each proposed Effect.
- [ ] A literal user request for `useEffect` does not bypass the external-system test.
- [ ] Derived render data is not stored in state or updated from an Effect.
- [ ] Submit behavior remains in the submit event handler.
- [ ] Any remaining Effect Hook, including one inside a custom hook, has dependencies and cleanup justified by real external synchronization.
- [ ] The agent reports rejected Effect count, remaining Effect Hooks, external-system sentences, and cleanup/dependency evidence after the change.
