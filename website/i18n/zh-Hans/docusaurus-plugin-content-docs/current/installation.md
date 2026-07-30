---
sidebar_position: 3
title: 安装指南
description: ResearchSpec 详细安装说明
---

# 安装指南

## 系统要求

| 要求 | 版本 |
|------|------|
| Node.js | >= 22 |
| 包管理器 | pnpm（推荐）或 npm |

## 全局安装

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

## 验证

```bash
researchspec --version
```

## 工作区设置

```bash
mkdir my-research && cd my-research
researchspec init
```

`init` 命令会创建 `.researchspec/` 目录、安装技能并写入初始规约文件。

## 更新

```bash
pnpm update -g researchspec
```

更新后刷新工作区文件：

```bash
researchspec update
```

## 卸载

```bash
pnpm remove -g researchspec
```

ResearchSpec 仅修改工作区内的 `.researchspec/` 目录，卸载 CLI 不会影响你的研究数据。

## 故障排除

使用 `researchspec doctor` 进行运行时诊断，`researchspec check` 验证工作区完整性。
