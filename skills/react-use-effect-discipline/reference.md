# React Effect Decision Reference

Source: https://react.dev/learn/you-might-not-need-an-effect

## Main Decision

Effects are escape hatches for synchronizing React with external systems such as browser APIs, imperative widgets, subscriptions, timers, analytics caused by display, or network state that must stay synchronized while the component is visible. This decision applies to `useEffect`, `useLayoutEffect`, `useInsertionEffect`, and Effects hidden inside custom hooks.

If there is no external system, the code usually belongs in render logic, an event handler, a `key`, lifted state, or a purpose-built hook.

## Prefer These Replacements

| Situation | Prefer |
| --- | --- |
| Deriving data from props or state | Calculate it during render |
| Expensive pure calculation | `useMemo` after the cost is real or plausible |
| Logic caused by a click, submit, drag, or selection | Event handler |
| Resetting all state for a changed identity | Pass a different `key` |
| Resetting selected derived data | Store a stable ID and derive the object during render |
| Notifying a parent about local state changes | Lift state up or call the callback in the same event |
| Subscribing to browser or external stores | `useSyncExternalStore` or a custom hook |
| Fetching data in a framework or query-enabled app | Framework loader, server action, query hook, or repository data fetching abstraction |
| Repeated external synchronization | Custom hook with a declarative API |

## Effects That Can Be Appropriate

- Synchronizing an imperative third-party widget with React state.
- Subscribing to browser APIs or external stores when `useSyncExternalStore` is not the right fit.
- Starting and cleaning up timers or intervals tied to component visibility.
- Sending analytics because a screen or form was displayed.
- Keeping network results synchronized with visible query parameters when no better data fetching abstraction exists.

## Cleanup Requirements

- Subscriptions must unsubscribe.
- Timers and intervals must be cleared.
- Imperative resources must be disposed or reset.
- Async fetches must ignore or abort stale responses.
- Effects must be correct when React remounts components in development.
