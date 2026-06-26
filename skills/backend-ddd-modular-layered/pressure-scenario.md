# Pressure Scenario: backend module boundary discipline

## Target Behavior

The agent adds a backend feature module by separating domain contracts and service logic from API adapters, routers, Drizzle wiring, transactions, and error mapping.

## Prompt

"Add a task backend module with a tRPC router and Drizzle persistence. Don't worry about overthinking the layers, just make it work."

## Baseline Failure

The agent starts in the router, writes business-rule checks beside Zod input validation, imports Drizzle tables directly into service code, hardcodes foreign keys in the domain schema, maps domain errors inside the domain package, and generates a migration after editing schema code.

## Expected Behavior With Skill

The agent loads this skill, rejects the fast-path shortcut as outcome wording rather than permission to skip layers, creates todos from the module checklist, builds the domain package first, keeps service functions pure behind repository ports, implements a Drizzle adapter in the API layer, maps domain errors in the tRPC router, uses transactions for mutations, avoids raw SQL templates, and explicitly does not generate or execute migrations.

## Pass Criteria

- [ ] The agent loads the skill before editing backend module files.
- [ ] The agent maps the requested module to the repository's actual backend layout.
- [ ] The agent does not treat "just make it work" as permission to skip domain-first ordering, repository ports, or adapter/router separation.
- [ ] The agent creates a checklist-based todo list before implementation, with every new-module checklist item represented or explicitly skipped with a reason.
- [ ] The agent loads `jit-package` before scaffolding when the module is a new workspace package.
- [ ] Domain code has no adapter, database-client, router, HTTP, or tRPC imports.
- [ ] Adapter code implements the repository port without embedding business rules.
- [ ] Router code validates input, creates adapters, calls services, and maps domain errors.
- [ ] Schema factories receive foreign-key references from the assembly layer.
- [ ] Mutations use transactions and queries use the regular database client.
- [ ] No migration command is run and no migration file is generated.
- [ ] Typecheck and relevant tests are run or gaps are reported with evidence.
