---
sidebar_position: 3
title: 安装
description: 安装 ResearchSpec 0.1.0 首发候选版本
---

# 安装

ResearchSpec 0.1.0 目前是首发候选版本，npm 包尚未发布。当前评估方式是从源码安装。

## 系统要求

| 要求 | 版本 |
| --- | --- |
| Node.js | 22 或 24 |
| 包管理器 | pnpm 10.13.1 |
| Agent | 支持的 Agent 宿主，例如 Codex |

## 从源码安装

```bash
git clone https://github.com/leike0813/ResearchSpec.git
cd ResearchSpec
corepack enable
pnpm install --frozen-lockfile
pnpm build
npm link
researchspec --version
```

`npm link` 用于本地开发和内部试用，不代表 npm 包已经发布。

## 发布后安装

```bash
npm install --global researchspec
researchspec --version
```

## 创建工作区

```bash
mkdir my-research && cd my-research
researchspec init . --tools codex
```

`init` 创建 schema `"2"` 工作区、四份 stable specs、预设 graph profiles 和项目配置，并安装唯一基础入口 `researchspec-navigate`。ARSU、Companion、核心能力和插件能力通过按需 Procedure 提供。对当前工作区再次运行 `init` 可重新配置工具或 Adapter；CLI 升级后使用 `researchspec update` 刷新托管投影。

### 工具和交付方式

- `--tools all`：选择所有兼容工具
- `--tools none`：不投影 Agent 入口
- `--tools codex,claude`：设置完整工具选择
- `--delivery skills|commands|both`：选择支持的交付形式
- `--literature-adapters zotero-library`：选择可选 Zotero Adapter
- `--literature-adapters none`：不选择文献 Adapter

Zotero Adapter 需要 Zotero 和 [Zotero-Agents 插件](https://github.com/leike0813/zotero-agents)。ResearchSpec 不会探测或安装它们。

## 更新工作区

升级 CLI 后运行 `researchspec update`。它刷新托管 Agent 文件，不覆盖研究内容。旧版或未知工作区会被报告并保持原样；ResearchSpec 不提供迁移、回滚或语义修复。

## 卸载

```bash
npm uninstall --global researchspec
```

卸载 CLI 不会删除项目文件、Agent 投影或 `.zotero-bridge/`。如需移除干净的 Adapter 投影，先运行 `researchspec update --literature-adapters none`。

## 故障排除

`researchspec doctor` 提供只读运行时诊断，`researchspec check` 验证工作区完整性。
