---
sidebar_position: 1
title: 工作流指南
description: 理解 ResearchSpec 工作流模型——状态、指令、启动、提交、推进
---

# 工作流指南

ResearchSpec 使用**基于选择器的运行时协议**。CLI 返回动态的动作描述符，告诉
智能体下一步可以做什么。

## 运行时协议

```
status → instructions <selector> → start / submit / advance → status
```

### 1. 检查状态

```bash
researchspec status --json
```

返回当前运行状态和待处理项。JSON 信封中包含 `next_selectors` 列表。

### 2. 读取指令

```bash
researchspec instructions <selector> --json
```

每个选择器解析为一个**动作描述符**，包含语义输入模式、执行策略和动作基准哈希。

### 3. 启动子流程

```bash
researchspec start <subflow> \
  --input start.json \
  --actor-kind agent \
  --actor-name "My Agent"
```

### 4. 提交制品

```bash
researchspec submit <item> \
  --input payload.json \
  --actor-kind agent \
  --actor-name "My Agent"
```

### 5. 推进转换

```bash
researchspec advance <transition> \
  --actor-kind agent \
  --actor-name "My Agent"
```

## 选择器族

| 族 | 示例 | 说明 |
|----|------|------|
| `subflow:` | `subflow:deep-research` | 启动命名子流程 |
| `gate:` | `gate:literature-complete` | 确认门控裁定 |
| `transition:` | `transition:to-review` | 推进到下一阶段 |
| `patch:` | `patch:revision-1` | 应用修订补丁 |
| `change:` | `change:scope-update` | 提议规约变更 |

## 人工决策

对研究意图、范围、声明或结构的变更需要记录在**决策账本**中的显式人工决策：

```bash
researchspec decide <item> \
  --decision accept \
  --actor-name "Dr. Researcher" \
  --reason "The broader scope is appropriate for the target journal"
```
