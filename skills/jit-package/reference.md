# JIT Package Reference

Use these templates when scaffolding a new internal workspace package. Replace `<scope>` with the workspace scope already used in the target monorepo (inspect existing package manifests). Adjust feature folders and the tsconfig variant to match consumers.

## Directory Structure

```text
<workspace-package-dir>/<pkg-name>/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts          # main barrel
│   ├── <feature-a>/
│   │   ├── index.ts      # subpath barrel
│   │   ├── impl-a.ts
│   │   └── types.ts
│   └── <feature-b>/
│       └── index.ts
└── tests/
    ├── feature-a.test.ts
    └── feature-b.test.ts
```

`<workspace-package-dir>` comes from `pnpm-workspace.yaml` globs (for example `package/` or `packages/`). Do not assume a path without reading the target monorepo.

## package.json

```jsonc
{
  "name": "<scope>/<pkg-name>",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts",
      "default": "./src/index.ts"
    }
    // add subpaths as needed; see Subpath Exports
  },
  "engines": { "node": ">=18" },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:unit": "vitest run"
  },
  "devDependencies": {
    "@types/node": "^25.0.3",
    "typescript": "~5.9.3",
    "vitest": "^3.2.4"
  }
}
```

Key points:

- **No `build` script** — turbo `build` tasks naturally skip this package.
- **All three `exports` conditions point at the same `.ts` source file.**
- **`private: true`** — not published to npm.
- Runtime dependencies go in `dependencies`; toolchain deps go in `devDependencies`.
- Do not add legacy `main`, `types`, or `module` fields that point at compiled output.

## tsconfig.json — Node library

Use when Node apps consume the package, or when both Node and bundler apps consume it:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "tests/**/*.ts", "vitest.config.ts"]
}
```

## tsconfig.json — Frontend-only library

Use only when bundler apps are the sole consumers:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "tests/**/*.ts"]
}
```

Both variants require **`noEmit: true`**.

## vitest.config.ts

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    exclude: ['dist', 'node_modules'],
  },
  resolve: {
    conditions: ['node', 'import', 'require'],
  },
});
```

## Subpath Exports

When the package has multiple independent feature domains, add subpath exports:

```jsonc
"exports": {
  ".": {
    "types": "./src/index.ts",
    "import": "./src/index.ts",
    "default": "./src/index.ts"
  },
  "./<feature>": {
    "types": "./src/<feature>/index.ts",
    "import": "./src/<feature>/index.ts",
    "default": "./src/<feature>/index.ts"
  }
}
```

Each subpath needs a matching `src/<feature>/index.ts` barrel. The main `src/index.ts` barrel may optionally re-export selected subpaths.

## Import Conventions

- **NodeNext** packages: relative imports must use `.js` suffix (`import { foo } from './bar.js'`).
- **bundler-only** packages: suffixes may be omitted (`import { foo } from './bar'`).

## Consumer Wiring

Add to each consumer's `package.json`:

```jsonc
"dependencies": {
  "<scope>/<pkg-name>": "workspace:*"
}
```

Then run workspace install. The consumer's compiler (tsc, Vite, tsx) must be able to import `.ts` source directly.
