import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * @typedef {{
 *   private?: boolean;
 *   packageManager?: string;
 *   scripts?: Record<string, string>;
 *   dependencies?: Record<string, string>;
 *   devDependencies?: Record<string, string>;
 *   peerDependencies?: Record<string, string>;
 *   imports?: Record<string, string>;
 *   exports?: Record<string, string>;
 *   name?: string;
 * }} PackageJson
 *
 * @typedef {{
 *   tasks?: Record<string, { cache?: boolean }>;
 * }} TurboJson
 *
 * @typedef {{
 *   compilerOptions?: Record<string, string | boolean | string[]>;
 *   include?: string[];
 *   exclude?: string[];
 *   extends?: string;
 * }} TsconfigJson
 *
 * @typedef {{
 *   tailwind?: Record<string, string | boolean>;
 *   aliases?: Record<string, string>;
 *   registries?: Record<string, string>;
 * }} ComponentsJson
 */

const targetArg = process.argv[2];

if (!targetArg) {
  console.error('Usage: node tests/validate-generated-monorepo.mjs <generated-monorepo-path>');
  process.exit(2);
}

const root = path.resolve(targetArg);
/** @type {string[]} */
const failures = [];
/** @type {string[]} */
const warnings = [];
/** @type {string[]} */
const passes = [];

/**
 * @param {...string} segments
 * @returns {string}
 */
function filePath(...segments) {
  return path.join(root, ...segments);
}

/**
 * @param {boolean} condition
 * @param {string} message
 * @param {{ warning?: boolean }} [options]
 * @returns {void}
 */
function record(condition, message, options = {}) {
  if (condition) {
    passes.push(message);
    return;
  }

  if (options.warning) {
    warnings.push(message);
    return;
  }

  failures.push(message);
}

/**
 * @param {...string} segments
 * @returns {string}
 */
function readText(...segments) {
  const absolute = filePath(...segments);
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : '';
}

/**
 * @template T
 * @param {...string} segments
 * @returns {T}
 */
function readJson(...segments) {
  const text = readText(...segments);
  if (!text) {
    failures.push(`Missing JSON file: ${segments.join('/')}`);
    return /** @type {T} */ ({});
  }

  try {
    return /** @type {T} */ (JSON.parse(text));
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`Invalid JSON in ${segments.join('/')}: ${message}`);
    return /** @type {T} */ ({});
  }
}

/**
 * @param {...string} segments
 * @returns {boolean}
 */
function hasFile(...segments) {
  return existsSync(filePath(...segments)) && statSync(filePath(...segments)).isFile();
}

/**
 * @param {...string} segments
 * @returns {boolean}
 */
function hasDir(...segments) {
  return existsSync(filePath(...segments)) && statSync(filePath(...segments)).isDirectory();
}

/**
 * @param {string} startDir
 * @param {(file: string) => boolean} predicate
 * @param {string[]} [results]
 * @returns {string[]}
 */
function walk(startDir, predicate, results = []) {
  if (!existsSync(startDir)) {
    return results;
  }

  for (const entry of readdirSync(startDir)) {
    if (entry === 'node_modules' || entry === '.git') {
      continue;
    }

    const absolute = path.join(startDir, entry);
    const stats = statSync(absolute);

    if (stats.isDirectory()) {
      walk(absolute, predicate, results);
      continue;
    }

    if (predicate(absolute)) {
      results.push(absolute);
    }
  }

  return results;
}

record(hasDir(), `Target exists: ${root}`);

const requiredFiles = [
  'apps/.gitkeep',
  'package/.gitkeep',
  'pnpm-workspace.yaml',
  'package.json',
  'turbo.json',
  'tsconfig.json',
  '.gitignore',
  'eslint.config.mjs',
  'lefthook.yml',
  'commitlint.config.mjs',
  '.github/workflows/lint.yml',
  'package/ui/package.json',
  'package/ui/tsconfig.json',
  'package/ui/components.json',
  'package/ui/src/lib/utils.ts',
  'package/ui/src/styles/globals.css',
  'package/ui/src/types/css.d.ts',
  'package/ui/.storybook/main.ts',
  'package/ui/.storybook/preview.ts',
];

for (const requiredFile of requiredFiles) {
  record(hasFile(...requiredFile.split('/')), `Required file exists: ${requiredFile}`);
}

record(!hasDir('packages', 'ui'), 'Shared UI is not created under packages/ui');
record(hasDir('package', 'ui'), 'Shared UI is created under package/ui');

const gitHead = readText('.git', 'HEAD').trim();
record(gitHead === 'ref: refs/heads/master', 'Git HEAD points to refs/heads/master');

const rootPackageJson = readJson('package.json');
record(rootPackageJson.private === true, 'Root package is private for the private scaffold');
record(rootPackageJson.packageManager?.startsWith('pnpm@'), 'Root packageManager uses pnpm');

const expectedRootScripts = {
  build: 'turbo build',
  commitlint: 'commitlint',
  lint: 'eslint .',
  'lint:fix': 'eslint . --fix',
  prepare: 'lefthook install',
  test: 'turbo test',
  typecheck: 'tsc --noEmit',
  'typecheck:workspaces': 'turbo typecheck',
};

for (const [scriptName, expectedCommand] of Object.entries(expectedRootScripts)) {
  record(
    rootPackageJson.scripts?.[scriptName] === expectedCommand,
    `Root script ${scriptName} is ${expectedCommand}`,
  );
}

for (const dependency of [
  '@antfu/eslint-config',
  '@commitlint/cli',
  '@commitlint/config-conventional',
  '@eslint-react/eslint-plugin',
  'eslint',
  'eslint-plugin-react-hooks',
  'eslint-plugin-react-refresh',
  'lefthook',
  'turbo',
  'typescript',
]) {
  record(
    Boolean(rootPackageJson.devDependencies?.[dependency]),
    `Root devDependency is installed with -wD: ${dependency}`,
  );
}

const workspaceYaml = readText('pnpm-workspace.yaml');
record(workspaceYaml.includes('  - apps/*'), 'pnpm workspace includes apps/*');
record(workspaceYaml.includes('  - package/*'), 'pnpm workspace includes package/*');
record(workspaceYaml.includes('shellEmulator: true'), 'pnpm workspace enables shellEmulator');
record(workspaceYaml.includes('trustPolicy: no-downgrade'), 'pnpm workspace sets trustPolicy');

const turboJson = readJson('turbo.json');
record(Boolean(turboJson.tasks?.['build-storybook']), 'Turbo has build-storybook task');
record(turboJson.tasks?.['lint:fix']?.cache === false, 'Turbo lint:fix disables cache');

const tsconfigJson = readJson('tsconfig.json');
record(tsconfigJson.compilerOptions?.strict === true, 'Root tsconfig enables strict');
record(tsconfigJson.compilerOptions?.jsx === 'react-jsx', 'Root tsconfig uses react-jsx');
record(tsconfigJson.include?.includes('package'), 'Root tsconfig includes package');

const eslintConfig = readText('eslint.config.mjs');
record(eslintConfig.includes('@antfu/eslint-config'), 'Root ESLint config uses @antfu/eslint-config');
record(eslintConfig.includes('typescript: true'), 'Root ESLint config enables TypeScript');
record(eslintConfig.includes('react: true'), 'Root ESLint config enables React');
record(eslintConfig.includes('**/components/ui/**'), 'Root ESLint ignores generated shadcn UI components');
record(eslintConfig.includes('**/components/ai-elements/**'), 'Root ESLint ignores generated AI Elements components');

record(!hasFile('package', 'ui', 'eslint.config.mjs'), 'UI package does not define a package-local ESLint config');

const uiPackageJson = readJson('package', 'ui', 'package.json');
record(uiPackageJson.name === '@workspace/ui', 'UI package name is @workspace/ui');
record(uiPackageJson.scripts?.['build-storybook'] === 'storybook build', 'UI package has build-storybook script');
record(uiPackageJson.scripts?.typecheck === 'tsc -p tsconfig.json --noEmit', 'UI package has typecheck script');
record(!uiPackageJson.scripts?.lint, 'UI package does not define local lint script');

for (const [exportName, expectedPath] of Object.entries({
  './globals.css': './src/styles/globals.css',
  './components/*': './src/components/*.tsx',
  './hooks/*': './src/hooks/*.ts',
  './lib/*': './src/lib/*.ts',
})) {
  record(uiPackageJson.exports?.[exportName] === expectedPath, `UI export ${exportName} points to ${expectedPath}`);
}

for (const dependency of [
  '@radix-ui/react-slot',
  'class-variance-authority',
  'clsx',
  'lucide-react',
  'radix-ui',
  'tailwind-merge',
]) {
  record(Boolean(uiPackageJson.dependencies?.[dependency]), `UI dependency is installed: ${dependency}`);
}

for (const dependency of [
  '@storybook/addon-docs',
  '@storybook/react-vite',
  '@tailwindcss/vite',
  '@types/react',
  '@types/react-dom',
  'react',
  'react-dom',
  'storybook',
  'tailwindcss',
  'tw-animate-css',
  'vite',
]) {
  record(Boolean(uiPackageJson.devDependencies?.[dependency]), `UI devDependency is installed: ${dependency}`);
}

record(!uiPackageJson.devDependencies?.next, 'UI devDependencies do not include Next.js');
record(!uiPackageJson.dependencies?.next, 'UI dependencies do not include Next.js');
record(!uiPackageJson.devDependencies?.['@storybook/nextjs-vite'], 'UI devDependencies do not include @storybook/nextjs-vite');

const uiTsconfigJson = readJson('package', 'ui', 'tsconfig.json');
record(uiTsconfigJson.extends === '../../tsconfig.json', 'UI tsconfig extends root tsconfig');
record(uiTsconfigJson.include?.includes('src'), 'UI tsconfig includes src');
record(uiTsconfigJson.include?.includes('.storybook'), 'UI tsconfig includes .storybook');

const componentsJson = readJson('package', 'ui', 'components.json');
record(componentsJson.tailwind?.config === '', 'components.json keeps Tailwind config empty for v4');
record(componentsJson.tailwind?.css === 'src/styles/globals.css', 'components.json points to shared globals.css');
record(componentsJson.aliases?.components === '#components', 'components.json aliases components to #components');
record(componentsJson.aliases?.ui === '#components/ui', 'components.json aliases ui to #components/ui');
record(componentsJson.aliases?.lib === '#lib', 'components.json aliases lib to #lib');
record(componentsJson.aliases?.hooks === '#hooks', 'components.json aliases hooks to #hooks');
record(componentsJson.aliases?.utils === '#lib/utils', 'components.json aliases utils to #lib/utils');
record(
  componentsJson.registries?.['@storybook'] === 'https://registry.lloydrichards.dev/v3/radix/{name}.json',
  'components.json configures the radix @storybook registry',
);

for (const componentFile of [
  'button.tsx',
  'dialog.tsx',
  'field.tsx',
  'table.tsx',
]) {
  record(
    hasFile('package', 'ui', 'src', 'components', 'ui', componentFile),
    `Representative shadcn/ui component exists: ${componentFile}`,
  );
}

const storyFiles = walk(
  filePath('package', 'ui', 'src'),
  file => file.endsWith('.stories.tsx'),
);
record(storyFiles.length >= 10, `Storybook all-stories generated many stories (${storyFiles.length})`);

const storyContent = storyFiles.map(file => readFileSync(file, 'utf8')).join('\n');
record(!storyContent.includes('next/image'), 'Storybook stories do not import next/image');
record(!storyContent.includes('@storybook/nextjs-vite'), 'Storybook stories use React Vite Storybook types');

const aiElementsDir = filePath('package', 'ui', 'src', 'components', 'ai-elements');
const aiElementFiles = walk(
  aiElementsDir,
  file => file.endsWith('.tsx') || file.endsWith('.ts'),
);
record(hasDir('package', 'ui', 'src', 'components', 'ai-elements'), 'AI Elements shared directory exists');
record(aiElementFiles.length >= 5, `AI Elements generated multiple files (${aiElementFiles.length})`);

const storybookMain = readText('package', 'ui', '.storybook', 'main.ts');
record(storybookMain.includes('@storybook/react-vite'), 'Storybook config uses @storybook/react-vite');
record(!storybookMain.includes('@storybook/nextjs-vite'), 'Storybook config does not use @storybook/nextjs-vite');
record(storybookMain.includes('@tailwindcss/vite'), 'Storybook Vite config imports Tailwind plugin');
record(storybookMain.includes('mergeConfig'), 'Storybook Vite config merges Tailwind plugin');

const storybookPreview = readText('package', 'ui', '.storybook', 'preview.ts');
record(storybookPreview.includes("../src/styles/globals.css") || storybookPreview.includes("'../src/styles/globals.css'"), 'Storybook preview imports shared globals.css');

const globalsCss = readText('package', 'ui', 'src', 'styles', 'globals.css');
record(globalsCss.includes('@import "tailwindcss";'), 'globals.css imports tailwindcss');
record(globalsCss.includes('@import "tw-animate-css";'), 'globals.css imports tw-animate-css');

const lefthook = readText('lefthook.yml');
record(lefthook.includes('run: pnpm lint'), 'Lefthook pre-commit runs pnpm lint');
record(lefthook.includes('run: pnpm exec commitlint --edit {1}'), 'Lefthook commit-msg runs Commitlint');

const commitlint = readText('commitlint.config.mjs');
record(commitlint.includes('@commitlint/config-conventional'), 'Commitlint uses conventional config');

const lintWorkflow = readText('.github', 'workflows', 'lint.yml');
record(lintWorkflow.includes('pnpm/action-setup@v4'), 'GitHub Actions sets up pnpm');
record(lintWorkflow.includes('cache: pnpm'), 'GitHub Actions enables pnpm cache');
record(lintWorkflow.includes('run: pnpm install --frozen-lockfile'), 'GitHub Actions installs with frozen lockfile');
record(lintWorkflow.includes('run: pnpm lint'), 'GitHub Actions runs pnpm lint');

console.log(`Validated generated monorepo: ${root}`);
console.log(`Passes: ${passes.length}`);

if (warnings.length > 0) {
  console.log(`Warnings: ${warnings.length}`);
  for (const warning of warnings) {
    console.log(`  WARN ${warning}`);
  }
}

if (failures.length > 0) {
  console.error(`Failures: ${failures.length}`);
  for (const failure of failures) {
    console.error(`  FAIL ${failure}`);
  }
  process.exit(1);
}

console.log('Generated monorepo validation passed.');
