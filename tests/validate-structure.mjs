import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

const requiredPaths = [
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  "gemini-extension.json",
  "package.json",
  ".cursor-plugin/plugin.json",
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".kimi-plugin/plugin.json",
  ".opencode/INSTALL.md",
  ".opencode/plugins/skills-template.js",
  ".pi/extensions/skills-template.ts",
  "docs/adding-a-skill.md",
  "docs/agent-support.md",
  "hooks/hooks.json",
  "hooks/hooks-cursor.json",
  "hooks/hooks-codex.json",
];

const errors = [];

for (const path of requiredPaths) {
  if (!existsSync(join(root, path))) {
    errors.push(`Missing required path: ${path}`);
  }
}

const jsonPaths = [
  "gemini-extension.json",
  "package.json",
  ".cursor-plugin/plugin.json",
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".kimi-plugin/plugin.json",
  "hooks/hooks.json",
  "hooks/hooks-cursor.json",
  "hooks/hooks-codex.json",
];

for (const path of jsonPaths) {
  try {
    JSON.parse(readFileSync(join(root, path), "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Invalid JSON in ${path}: ${message}`);
  }
}

const skillRoots = ["skills", ".agents/skills"];

for (const skillRoot of skillRoots) {
  const skillsRoot = join(root, skillRoot);

  if (existsSync(skillsRoot)) {
    const skillDirs = readdirSync(skillsRoot).filter((entry) =>
      statSync(join(skillsRoot, entry)).isDirectory(),
    );

    for (const skillDir of skillDirs) {
      const skillPath = join(skillsRoot, skillDir, "SKILL.md");
      const displayPath = `${skillRoot}/${skillDir}/SKILL.md`;

      if (!existsSync(skillPath)) {
        errors.push(`Missing SKILL.md for skill: ${skillRoot}/${skillDir}`);
        continue;
      }

      const content = readFileSync(skillPath, "utf8");

      if (!content.startsWith("---\n")) {
        errors.push(`Missing YAML frontmatter in ${displayPath}`);
      }

      if (!/^name:\s+[a-z0-9-]+$/m.test(content)) {
        errors.push(`Missing valid name field in ${displayPath}`);
      }

      if (!/^description:\s+.+$/m.test(content)) {
        errors.push(`Missing description field in ${displayPath}`);
      }
    }
  } else if (skillRoot === "skills") {
    errors.push("Missing skills/ directory");
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Structure validation passed.");
}
