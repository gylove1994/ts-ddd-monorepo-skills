# 多智能体技能模板

用于在多个编码智能体之间共享同一套技能库的空白仓库模板。

本仓库将与智能体无关的技能说明保存在 `skills/` 中，并为 Cursor、Claude、Codex、Gemini、Kimi、OpenCode 和 Pi 等智能体运行时提供轻量入口。

## 仓库结构

```text
.
├── skills/                 # 共享技能库
├── docs/                   # 维护者文档
├── hooks/                  # 可选的 hook 清单和脚本
├── .cursor-plugin/         # Cursor 插件清单
├── .claude-plugin/         # Claude 插件清单
├── .codex-plugin/          # Codex 插件清单
├── .kimi-plugin/           # Kimi 插件清单
├── .opencode/              # OpenCode 插件入口
├── .pi/                    # Pi 扩展入口
├── AGENTS.md               # 通用智能体说明
├── CLAUDE.md               # Claude 兼容说明
├── GEMINI.md               # Gemini 兼容说明
└── gemini-extension.json   # Gemini CLI 扩展清单
```

## 添加技能

在 `skills/` 下创建一个新目录：

```text
skills/my-skill/
├── SKILL.md
└── reference.md
```

每个技能都必须包含带 YAML frontmatter 的 `SKILL.md`：

```markdown
---
name: my-skill
description: Performs a specific workflow. Use when the user asks for that workflow or mentions related trigger terms.
---

# My Skill

## Instructions

Write concise, agent-neutral instructions here.
```

完整清单请参阅 `docs/adding-a-skill.md`。

## 智能体支持

智能体入口应保持轻量。它们只需要将运行时指向 `skills/`，避免重复复制技能内容。

当前入口和维护说明请参阅 `docs/agent-support.md`。

## 验证

```bash
pnpm install
pnpm typecheck
pnpm test
```
