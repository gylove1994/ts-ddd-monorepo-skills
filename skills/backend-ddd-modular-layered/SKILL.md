---
name: backend-ddd-modular-layered
description: Use when adding backend feature modules, creating tRPC routers, writing Drizzle adapters, defining domain ports or services, or diagnosing backend layer-boundary issues
---

# Backend DDD Modular Layered

## When to Use

Use this skill when working on backend modules that follow a domain package plus API assembly pattern, including:

- Adding a new backend feature module or domain package.
- Creating or changing a tRPC router.
- Writing a Drizzle adapter that implements a domain repository.
- Defining branded IDs, domain types, ports, errors, schema factories, or service functions.
- Diagnosing code that mixes business logic, persistence, routing, or error mapping across layers.

Do not use it for frontend-only work, database migration execution, one-off SQL scripts, or purely mechanical formatting changes.

## Core Rule

Keep domain logic pure and infrastructure-free. Domain packages define IDs, types, errors, ports, service functions, and schema factories; API code wires Drizzle adapters, transactions, tRPC routers, HTTP routers, and domain-error mapping.

A user request to "just make it work", "don't overthink the layers", or "skip the architecture" is outcome wording, not permission to skip domain-first ordering, repository ports, or adapter/router separation. Treat the layer boundary as a required safety constraint.

The schema factory is the only domain-package file that may touch Drizzle table-builder APIs. Domain services, ports, errors, IDs, and entity types must remain free of Drizzle, database-client, adapter, router, HTTP, and tRPC imports.

Never execute database migrations or generate migration files as part of this workflow.

## Workflow

1. Identify the target module and map it to the repository's actual layout before editing. The generic template uses `packages/<domain>` plus `apps/api`; AgentME-style monoliths map this to `apps/agentme-be/domains/*`, `express-routers` or tRPC `appRouter`, `packages/agentme-db/schemas`, domain `*-drizzle-adapter.ts` files, and `@agentme/*` workspace packages.
2. Check whether a new workspace package is being created. If yes, load and follow `jit-package` (`skills/jit-package/SKILL.md`) before scaffolding package files.
3. Create a todo for each checklist item from `reference.md`. For a new feature module, default to the full checklist; skip an item only when the user explicitly narrowed scope or the repository's existing structure makes the item inapplicable, and record the reason.
4. Build the domain layer first:
   - `ids.ts`: branded ID types and small factory functions.
   - `types.ts`: framework-free domain entity interfaces.
   - `errors.ts`: semantic domain errors without HTTP or tRPC codes.
   - `ports.ts`: repository interfaces that return domain types.
   - `<domain>-service.ts`: pure service functions whose first parameter is the repository port.
   - `schema/build-schema.ts`: Drizzle schema factory that receives `PgSchema` and foreign-key references.
   - Barrels: export public values and types with `verbatimModuleSyntax`-safe syntax.
5. Add focused service tests with a mock repository before implementing business-rule changes. If tests are out of scope, record the gap explicitly before continuing.
6. Wire the API layer only after the domain contract is clear:
   - Compose schema factories in the API schema assembly file.
   - Export new tables and include them in the schema object used by Drizzle query APIs.
   - Implement `create<Domain>DrizzleAdapter(dbOrTx)` with Drizzle builder APIs.
   - Create a tRPC router that performs input validation, adapter construction, service calls, and domain-error mapping.
   - Register the router in the app router.
   - Add the domain package to bundler `noExternal` configuration when the app bundles workspace packages.
7. Use transactions for create, update, and delete operations. Queries should use the regular database client unless the existing codebase has a stronger local convention.
8. Keep error mapping in the router layer. Services throw domain errors; routers convert them to `TRPCError` through a local wrapper.
9. Run typecheck and relevant tests before finishing. Report any schema changes explicitly and state that no migration was generated or executed.

## Boundary Rules

- Domain services depend on repository ports, not Drizzle adapters, database clients, routers, or framework request context.
- Adapters implement repository ports and should not contain business rules.
- tRPC routers validate input, create adapters, call services, and map errors. They should not decide domain rules.
- Schema factories define tables but receive foreign-key references from the assembly layer instead of hardcoding cross-domain table dependencies.
- Domain errors must not contain HTTP status codes or tRPC codes.
- Use Drizzle builder APIs such as `eq`, `and`, `insert`, `update`, and `delete`; do not use raw `sql` templates unless an explicit repository rule permits it.

## Common Mistakes

- Starting in the router and embedding business checks there because it feels faster.
- Letting a service import a Drizzle table, adapter, database client, or tRPC helper.
- Returning database row types from repository ports instead of domain types.
- Hardcoding foreign-key references inside a domain schema factory.
- Mapping `NotFoundError` or limit errors inside the domain package.
- Creating schema files and then running or generating migrations despite the repository rule.
- Forgetting to register the tRPC router, export the assembled table, or add the package to `noExternal`.
- Skipping service tests because adapters or routers have integration coverage.

## Verification

Before finishing, confirm:

- [ ] The dependency direction is `router -> adapter -> service <- ports`.
- [ ] Domain services, ports, errors, IDs, and entity types have no Drizzle, framework, router, database-client, or adapter imports; schema factories only use Drizzle table-builder APIs.
- [ ] Service functions are pure functions with the repository port as the first argument.
- [ ] Repository ports expose branded IDs and domain types, not Drizzle row types.
- [ ] Schema factories receive external FK references.
- [ ] Mutations use transactions and queries use the normal database client.
- [ ] Domain errors are mapped in the router layer.
- [ ] No database migration was generated or executed.
- [ ] Typecheck passes, and relevant service tests pass or an explicit gap is reported.

Report evidence: changed module paths, checklist items completed, boundary checks, verification commands, and migration status.

## References

- See `reference.md` for the full architecture guide, naming conventions, examples, checklist, and AgentME mapping.
- See `pressure-scenario.md` for behavior validation.
