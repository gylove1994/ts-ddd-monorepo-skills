# Backend DDD Modular Layered Reference

This reference is a generic template using `packages/<domain>` plus `apps/api`. In AgentME-style monoliths, map it to `apps/agentme-be` domains, `express-routers` or the tRPC `appRouter`, `packages/agentme-db/schemas`, domain `*-drizzle-adapter.ts` files, and `@agentme/*` workspace packages.

## Architecture Overview

```text
packages/<domain>/
  src/
    ids.ts
    types.ts
    errors.ts
    ports.ts
    <domain>-service.ts
    schema/
      build-schema.ts
      index.ts
    index.ts

apps/api/src/
  adapters/
    <domain>-drizzle-adapter.ts
  routers/
    trpc-routers/<domain>.ts
    trpc-routers/index.ts
    http-routers/
  db/schema/
    private-space.ts
    index.ts
```

## Layer Responsibilities

| Layer | Location | Responsibility | Forbidden |
| --- | --- | --- | --- |
| ID | `packages/<domain>/ids.ts` | Branded ID types and factory functions | Business logic |
| Types | `packages/<domain>/types.ts` | Domain entity interfaces | Drizzle or framework dependencies |
| Errors | `packages/<domain>/errors.ts` | Semantic domain error classes | HTTP or tRPC codes |
| Ports | `packages/<domain>/ports.ts` | Repository interfaces | Implementation details |
| Services | `packages/<domain>/<domain>-service.ts` | Pure business functions; first argument is repo | Direct DB access or adapter imports |
| Schema Factory | `packages/<domain>/schema/build-schema.ts` | Receive `PgSchema` and FK refs, return table definitions | Hardcoded external FK columns |
| Adapter | `apps/api/adapters/` | Implement repository port with Drizzle | Business rules; raw `sql` templates |
| tRPC Router | `apps/api/routers/trpc-routers/` | Input validation, adapter and service assembly, error mapping | Business-rule decisions |
| HTTP Router | `apps/api/routers/http-routers/` | Non-JSON-RPC cases such as streaming or files | Duplicate CRUD already exposed via tRPC |

## Core Principles

1. Dependency direction: `router -> adapter -> service <- ports`.
2. Service functions are pure functions that receive `repo` as the first parameter and hold no state.
3. Schema factories define package-owned tables but receive FK references from the API schema assembly layer.
4. Branded IDs use a `Brand<K, T>` pattern to prevent cross-domain ID mixing.
5. Domain errors are mapped outside the domain layer, usually through `wrapDomainErrors` in each router file.
6. Do not run or generate database migrations during this workflow.

## New Domain Module Checklist

Copy this checklist into todos and adapt the package scope and paths to the target repository.

```markdown
New domain module: @coedu/task
- [ ] 1. Create packages/task package structure in JIT mode; follow the jit-package skill when this is a new workspace package.
- [ ] 2. Define ids.ts with branded ID types and factory functions.
- [ ] 3. Define types.ts with domain entity interfaces.
- [ ] 4. Define errors.ts with domain error classes.
- [ ] 5. Define ports.ts with repository interfaces.
- [ ] 6. Implement task-service.ts as pure service functions.
- [ ] 7. Write schema/build-schema.ts as a Drizzle table factory.
- [ ] 8. Write schema/index.ts and src/index.ts barrels.
- [ ] 9. Write tests/task-service.test.ts with mock repository unit tests.
- [ ] 10. apps/api: compose buildTaskDrizzleSchema in db/schema/private-space.ts.
- [ ] 11. apps/api: export new tables and include them in the schema object in db/schema/index.ts.
- [ ] 12. apps/api: create adapters/task-drizzle-adapter.ts.
- [ ] 13. apps/api: create routers/trpc-routers/task.ts.
- [ ] 14. apps/api: register the subrouter in routers/trpc-routers/index.ts.
- [ ] 15. apps/api: add @coedu/task to tsup noExternal when bundling workspace packages.
- [ ] 16. Run typecheck and relevant tests.
- [ ] 17. Confirm no migration was generated or executed.
```

Use `@coedu/task` only as a teaching example. In AgentME, replace it with `@agentme/*`, `apps/agentme-be/src/domains/...`, and the repository's actual backend paths.

## Naming Conventions

| Item | Convention | Example |
| --- | --- | --- |
| Package | `@coedu/<domain>` in the template; `@agentme/<domain>` in AgentME | `@coedu/note` |
| ID type | `<Entity>Id` plus factory `<entity>Id()` | `NoteId`, `noteId()` |
| Repository | `<Entity>Repository` | `NoteRepository` |
| Service functions | `list/get/create/update/delete + <Entity>` | `createNote()` |
| Adapter factory | `create<Entity>DrizzleAdapter(db)` | `createNoteDrizzleAdapter(db)` |
| Schema factory | `build<Entity>DrizzleSchema(pgSchema, refs)` | `buildNoteDrizzleSchema()` |
| tRPC router | `<domain>TrpcRouter` | `noteTrpcRouter` |
| Error class | `<Name>Error` | `NotFoundError` |
| Domain error wrapper | `wrapDomainErrors(fn)` | Usually local to each router file |

## Domain Package Pattern

```text
packages/note/
  package.json
  tsconfig.json
  src/
    ids.ts
    types.ts
    errors.ts
    ports.ts
    note-service.ts
    schema/
      build-schema.ts
      index.ts
    index.ts
  tests/
    note-service.test.ts
```

### JIT package.json

```json
{
  "name": "@coedu/note",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./schema": {
      "types": "./src/schema/index.ts",
      "import": "./src/schema/index.ts",
      "default": "./src/schema/index.ts"
    }
  }
}
```

Internal packages should point exports at `.ts` source, avoid build output, and rely on the consuming app to compile.

### ids.ts

```typescript
type Brand<K extends string, T> = T & { readonly __brand: K };

export type NoteId = Brand<'NoteId', string>;
export type SpaceId = Brand<'SpaceId', string>;
export type UserId = Brand<'UserId', string>;

export function noteId(raw: string): NoteId {
  return raw as NoteId;
}
```

Use one branded type per ID and one lowercase factory per type. Multiple packages may define compatible shared IDs when the brand label intentionally matches.

### types.ts

```typescript
import type { Value } from 'platejs';
import type { NoteId, SpaceId, UserId } from './ids.js';

export interface Note {
  id: NoteId;
  title: string;
  content: Value;
  spaceId: SpaceId;
  userId: UserId;
  createdAt: Date;
  updatedAt: Date;
}

export type NoteSummary = Omit<Note, 'content'>;
```

Keep domain types as pure data interfaces. Derive variants with TypeScript utility types instead of duplicating shapes.

### errors.ts

```typescript
export class NotFoundError extends Error {
  public readonly resource: string;

  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

export class NotesPerSpaceLimitError extends Error {
  public readonly limit: number;

  constructor(limit: number) {
    super(`A space can have at most ${limit} notes`);
    this.name = 'NotesPerSpaceLimitError';
    this.limit = limit;
  }
}
```

Domain errors carry semantic properties only. HTTP status codes and tRPC codes belong in API error mapping.

### ports.ts

```typescript
import type { Value } from 'platejs';
import type { NoteId, SpaceId, UserId } from './ids.js';
import type { Note, NoteSummary } from './types.js';

export interface NoteRepository {
  findById: (id: NoteId) => Promise<Note | null>;
  findAllBySpaceIdAndUserId: (spaceId: SpaceId, userId: UserId) => Promise<NoteSummary[]>;
  create: (data: {
    id: NoteId;
    title: string;
    content: Value;
    spaceId: SpaceId;
    userId: UserId;
  }) => Promise<Note>;
  update: (id: NoteId, data: { title?: string; content?: Value }) => Promise<Note | null>;
  deleteById: (id: NoteId) => Promise<boolean>;
}
```

Repository ports expose domain terms. They do not expose table rows, Drizzle query builders, transactions, or framework context.

### service.ts

```typescript
import { randomUUID } from 'node:crypto';
import type { Value } from 'platejs';
import { NotesPerSpaceLimitError } from './errors.js';
import { noteId, type SpaceId, type UserId } from './ids.js';
import type { Note } from './types.js';
import type { NoteRepository } from './ports.js';

export const MAX_NOTES_PER_SPACE = 10;

export async function createNote(
  repo: NoteRepository,
  params: { spaceId: SpaceId; userId: UserId; title?: string; content?: Value },
): Promise<Note> {
  const existing = await repo.findAllBySpaceIdAndUserId(params.spaceId, params.userId);
  if (existing.length >= MAX_NOTES_PER_SPACE) {
    throw new NotesPerSpaceLimitError(MAX_NOTES_PER_SPACE);
  }

  return repo.create({
    id: noteId(randomUUID()),
    title: params.title ?? '',
    content: params.content ?? ([] as Value),
    spaceId: params.spaceId,
    userId: params.userId,
  });
}
```

Business rules, permission checks, limits, and ID generation live in services. Services have no direct DB access.

### schema/build-schema.ts

```typescript
import type { Value } from 'platejs';
import type { AnyPgColumn, PgSchema } from 'drizzle-orm/pg-core';
import { index, jsonb, text, timestamp } from 'drizzle-orm/pg-core';
import type { NoteId, SpaceId, UserId } from '../ids.js';

export interface NoteSchemaRefs {
  userIdColumn: () => AnyPgColumn;
  spaceIdColumn: () => AnyPgColumn;
}

export function buildNoteDrizzleSchema(pgSchema: PgSchema, refs: NoteSchemaRefs) {
  const note = pgSchema.table('note', {
    id: text('id').$type<NoteId>().primaryKey(),
    title: text('title').notNull().default(''),
    content: jsonb('content').$type<Value>().notNull().default([]),
    spaceId: text('space_id').$type<SpaceId>().notNull()
      .references(refs.spaceIdColumn, { onDelete: 'cascade' }),
    userId: text('user_id').$type<UserId>().notNull()
      .references(refs.userIdColumn, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .notNull().defaultNow().$onUpdate(() => new Date()),
  }, table => [index('note_space_id_idx').on(table.spaceId)]);

  return { note };
}

export type NoteSchema = ReturnType<typeof buildNoteDrizzleSchema>;
```

The factory receives `PgSchema` and external FK references. The API assembly layer injects actual columns.

### index.ts

```typescript
export { NotesPerSpaceLimitError, NotFoundError } from './errors.js';
export { noteId, spaceId, userId } from './ids.js';
export type { NoteId, SpaceId, UserId } from './ids.js';
export {
  createNote,
  deleteNote,
  getNoteById,
  listNotes,
  MAX_NOTES_PER_SPACE,
  updateNote,
} from './note-service.js';
export type { NoteRepository } from './ports.js';
export type { Note, NoteSummary } from './types.js';
```

Use value exports for runtime values and `export type` for type-only exports when `verbatimModuleSyntax` is enabled.

## API Layer Pattern

### Schema assembly

```typescript
import { buildNoteDrizzleSchema } from '@coedu/note/schema';
import { buildSpaceDrizzleSchema } from '@coedu/private-space/schema';
import { user } from './auth.js';
import { coedu } from './coedu.js';

const { space } = buildSpaceDrizzleSchema(coedu, {
  userIdColumn: () => user.id,
});

const { note } = buildNoteDrizzleSchema(coedu, {
  userIdColumn: () => user.id,
  spaceIdColumn: () => space.id,
});

export { note, space };
```

All related tables should belong to the repository's intended `pgSchema`. New tables must also be exported and included in the schema object used by Drizzle query APIs.

### Adapter

```typescript
import type { NoteRepository } from '@coedu/note';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import { note } from '../db/schema/private-space.js';

export function createNoteDrizzleAdapter(
  db: NodePgDatabase<Record<string, unknown>>,
): NoteRepository {
  return {
    async findById(id) {
      const rows = await db.select().from(note).where(eq(note.id, id)).limit(1);
      return rows[0] ?? null;
    },
    async create(data) {
      const rows = await db.insert(note).values(data).returning();
      return rows[0]!;
    },
    async deleteById(id) {
      const rows = await db.delete(note).where(eq(note.id, id)).returning({ id: note.id });
      return rows.length > 0;
    },
  };
}
```

The adapter receives either `db` or `tx`, returns the repository interface, uses Drizzle builder APIs, and imports assembled table references from the API schema layer.

### tRPC router

```typescript
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  createNote,
  listNotes,
  NotFoundError,
  NotesPerSpaceLimitError,
  spaceId,
  userId,
} from '@coedu/note';
import { protectedProcedure, router } from '../../config/trpc/index.js';
import { db, withTransaction } from '../../db/client.js';
import { createNoteDrizzleAdapter } from '../../adapters/note-drizzle-adapter.js';

function wrapDomainErrors<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch((err) => {
    if (err instanceof NotFoundError) {
      throw new TRPCError({ code: 'NOT_FOUND', message: err.message });
    }
    if (err instanceof NotesPerSpaceLimitError) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: err.message });
    }
    throw err;
  });
}

export const noteTrpcRouter = router({
  list: protectedProcedure
    .meta({
      name: 'List notes',
      docs: { description: 'List notes in a space', tags: ['Note'] },
    })
    .input(z.object({ spaceId: z.string().uuid() }))
    .query(({ ctx, input }) =>
      wrapDomainErrors(async () => {
        const repo = createNoteDrizzleAdapter(db);
        return listNotes(repo, spaceId(input.spaceId), userId(ctx.user.id));
      }),
    ),

  create: protectedProcedure
    .input(z.object({ spaceId: z.string().uuid(), title: z.string().max(500).optional() }))
    .mutation(({ ctx, input }) =>
      wrapDomainErrors(() => withTransaction(async (tx) => {
        const repo = createNoteDrizzleAdapter(tx);
        return createNote(repo, {
          spaceId: spaceId(input.spaceId),
          userId: userId(ctx.user.id),
          title: input.title,
        });
      })),
    ),
});
```

Router responsibilities are input validation, adapter construction, service invocation, domain error mapping, and procedure metadata for API documentation.

### Router registration

```typescript
import { router } from '../../config/trpc/index.js';
import { noteTrpcRouter } from './note.js';

export const appRouter = router({
  note: noteTrpcRouter,
});

export type AppRouter = typeof appRouter;
```

### Bundler noExternal

```typescript
noExternal: ['@coedu/note', '@coedu/private-space', '@coedu/conversation', '@coedu/task']
```

Add new JIT domain packages when the API bundle needs workspace package source inlined.

## Error Mapping

| Domain error | tRPC code |
| --- | --- |
| `NotFoundError` | `NOT_FOUND` |
| `*LimitError` or business constraint errors | `BAD_REQUEST` |
| Unknown errors | Rethrow unchanged so the framework treats them as 500-level failures |

Keep `wrapDomainErrors` close to the router unless the repository already has a shared local helper.

## Transaction Pattern

Use transactions for mutations:

```typescript
.mutation(({ ctx, input }) =>
  wrapDomainErrors(() => withTransaction(async (tx) => {
    const repo = createNoteDrizzleAdapter(tx);
    return createNote(repo, params);
  })),
)
```

Use the regular database client for queries unless local code already wraps reads for a specific reason.

## Service Test Pattern

Service tests should use a mock repository, not a database.

```typescript
function makeMockRepo(notes: Note[] = []): NoteRepository {
  const store = new Map(notes.map(note => [note.id, { ...note }]));

  return {
    findById: vi.fn(async (id) => {
      const note = store.get(id);
      return note ? { ...note } : null;
    }),
    findAllBySpaceIdAndUserId: vi.fn(async (spaceId, userId) =>
      [...store.values()]
        .filter(note => note.spaceId === spaceId && note.userId === userId)
        .map(({ content: _content, ...summary }) => summary),
    ),
    create: vi.fn(async (data) => {
      const note: Note = { ...data, createdAt: new Date(), updatedAt: new Date() };
      store.set(note.id, note);
      return { ...note };
    }),
    update: vi.fn(async (id, data) => {
      const existing = store.get(id);
      if (!existing) {
        return null;
      }
      const next = { ...existing, ...data, updatedAt: new Date() };
      store.set(id, next);
      return { ...next };
    }),
    deleteById: vi.fn(async id => store.delete(id)),
  };
}
```

Cover normal paths, permission checks, boundary limits, and domain error cases.

## Constraint Reminders

| Constraint | Reminder |
| --- | --- |
| No raw `sql` templates | Use Drizzle builder APIs. |
| No self-managed migrations | Do not run `drizzle-kit push`, `migrate`, or `generate`; do not create migration files. |
| Import suffixes | Do not use `.ts` suffixes. Follow the repository's tsconfig convention for `.js` suffixes or extensionless imports. |
| Avoid `any` and `unknown` | Infer from existing repository types when possible. |
| JIT packages | Internal domain packages export `.ts` source and have no build output. |
| `verbatimModuleSyntax` | Use `export type` for type-only exports. |
