---
sidebar_position: 4
title: 文献 Adapter
description: 使用可选 Zotero Adapter 查询、获取、分析和整理文献
---

# 文献 Adapter

可选的七 Skill Zotero 文献 Adapter 通过 Zotero 文献库辅助学术研究，需要 Zotero 和 [Zotero-Agents 插件](https://github.com/leike0813/zotero-agents)。

| Skill | 用途 |
| --- | --- |
| `zotero-library-agent` | 路由和协调有界文献库研究任务 |
| `zotero-library-query` | 检索当前文献库内容，回答有来源依据的问题 |
| `zotero-literature-acquisition` | 发现、评估和导入文献 |
| `zotero-literature-analysis` | 分析文献并保留来源证据 |
| `zotero-research-synthesis` | 综合文献作为研究背景 |
| `zotero-library-curation` | 规划和执行已批准的文献库维护 |
| `zotero-bridge-cli` | Zotero 底层操作和命令发现 |

ResearchSpec 分发静态审阅内容；它不会执行二进制文件、联系 Zotero、探测或安装依赖。Agent 按 Skill 指令使用自己已配置的工具。

## 选择

交互式 `researchspec init` 在工具选择后提供 Adapter，默认不选。非交互初始化可明确选择：

```bash
researchspec init . --tools codex --literature-adapters zotero-library
```

已有工作区可替换选择：

```bash
researchspec update --literature-adapters zotero-library
researchspec update --literature-adapters none
```

省略该选项会保留当前选择。用 `researchspec check literature-adapters` 检查静态安装状态。禁用时 status 显示 `not-selected`。

Adapter 的运行时和 profile 文件位于工作区 `.zotero-bridge/` 下。Bundle、CLI 和 Skill 版本各自独立，不比较它们的 patch 版本。
