---
sidebar_position: 3
title: 领域插件
description: 发现并选择 ResearchSpec 维护的学科和工具领域能力
---

# 领域插件

领域插件是按需选择的、经审阅的 vendor Skill 内容包，按 ANZSRC 2020 Fields of Research Group 组织。它们提供领域辅助，不拥有 workflow state，也不安装依赖或配置凭据。CLI 离线包包含全部领域内容；选择决定哪些领域投影到当前工作区。

## 发现和查看

```bash
researchspec plugin list
researchspec plugin list --installed
researchspec plugin list --summary
researchspec plugin show <plugin-id>
```

## 安装和更新

```bash
researchspec plugin install <plugin-id>
researchspec plugin install <domain-id> --yes
researchspec plugin update <plugin-id>
researchspec plugin update
```

非交互安装必须给出精确领域 ID 和 `--yes`。运行时 Navigate 每次最多建议三个领域；插件同意与根 run 确认分开，继续前会展示具体安装内容。

## 卸载及按需加载

```bash
researchspec plugin uninstall <plugin-id>
researchspec instructions procedure:<procedure-id>
```

已选择的插件 Procedure 只有在领域已选择、内容可用且 manifest hash 校验通过后才会加载。它作为有界辅助能力返回给原始 ARSU producer，不改变核心 selector、producer、frontier 或 workflow authority。

目录预置 213 个学科领域和六个工具领域；空领域不会出现在普通发现结果中。
