---
sidebar_position: 2
title: 快速入门
description: 安装 ResearchSpec 并在几分钟内初始化你的第一个工作区
---

# 快速入门

## 环境要求

- **Node.js** >= 22
- **pnpm**（推荐）或 npm

## 安装

<Tabs>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm add -g researchspec
```

</TabItem>
<TabItem value="npm" label="npm">

```bash
npm install -g researchspec
```

</TabItem>
</Tabs>

验证安装：

```bash
researchspec --version
researchspec --help
```

## 初始化工作区

```bash
mkdir my-paper && cd my-paper
researchspec init
```

`researchspec init` 是**幂等的**——你可以安全地多次运行。它会在工作区中安装
ARSU 技能、配套技能和文献适配器技能，不会覆盖你的已有工作。

## 你的第一个工作流

1. **检查状态**，查看当前可用的操作：

   ```bash
   researchspec status --json
   ```

2. **读取指令**，获取返回选择器的操作说明：

   ```bash
   researchspec instructions subflow:deep-research --json
   ```

3. **启动子流程**（由你的 AI 智能体执行）：

   ```bash
   researchspec start subflow:deep-research \
     --input start.json \
     --actor-kind agent \
     --actor-name "My Agent"
   ```

4. **提交制品**：

   ```bash
   researchspec submit <item> --input payload.json \
     --actor-kind agent \
     --actor-name "My Agent"
   ```

5. **推进状态转换**：

   ```bash
   researchspec advance <transition> \
     --actor-kind agent \
     --actor-name "My Agent"
   ```

## 运行时配置

ResearchSpec 支持两种运行时配置：

| 配置 | 说明 |
|------|------|
| `adaptive`（默认） | 灵活的制品提交，自动哈希绑定 |
| `strict` | 完整的计划绑定执行，需要精确的 SHA-256 验证 |

```bash
researchspec init --profile strict
```

## 下一步

- 阅读[工作流指南](/guides/workflow)了解完整执行模型
- 浏览[CLI 命令参考](/cli)查看所有命令
- 查看[常见问题](/faq)
