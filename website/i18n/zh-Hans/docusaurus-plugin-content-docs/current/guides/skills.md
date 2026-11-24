---
sidebar_position: 2
title: 技能与 Procedure
description: 唯一的 Navigate 入口与按需 Procedure 目录
---

# 技能与 Procedure

ResearchSpec 在宿主的基础 Skill 目录中只提供一个固定入口：`researchspec-navigate`。它处理跨能力请求、恢复任务和用户沟通，并按需发现和加载能力。

```bash
researchspec list procedures --query "systematic review screening"
researchspec show procedure:<procedure-id>
researchspec instructions procedure:<procedure-id>
```

发现从用户原始自然语言请求开始，支持中文、英文或混合表达。Procedure 目录由已有注册表在运行时派生，不另存一份注册表。

## 五个 ARSU 工作流

| 工作流 | 用途 |
| --- | --- |
| `deep-research` | 系统性文献发现、获取与综合 |
| `academic-paper` | 从研究问题逐步撰写论文 |
| `academic-paper-reviewer` | 对稿件进行结构化审阅 |
| `academic-pipeline` | 编排研究、写作、审阅和修订 |
| `sr-screener` | 系统综述筛选、排除复核和 PRISMA 报告 |

五个 ARSU 工作流、三个 Companion 工作流、核心能力和插件扩展都是隐藏的 Procedure，不会投影到宿主 Skill 目录。插件 Procedure 只有在选择领域、确认可用并验证 manifest hash 后才会加载；其内容是静态审阅材料，ResearchSpec 不执行它。

## 可选 Zotero Adapter

选择 `zotero-library` 会增加七个文献 Skill。它需要 Zotero 和 [Zotero-Agents 插件](https://github.com/leike0813/zotero-agents)：

| Adapter Skill | 用途 |
| --- | --- |
| `zotero-library-agent` | 路由和协调文献库任务 |
| `zotero-library-query` | 检索当前文献库内容并给出有来源依据的回答 |
| `zotero-literature-acquisition` | 发现、评估和导入文献 |
| `zotero-literature-analysis` | 分析文献并保留来源证据 |
| `zotero-research-synthesis` | 将文献综合为研究背景 |
| `zotero-library-curation` | 规划并执行已批准的文献库维护 |
| `zotero-bridge-cli` | Zotero 底层操作和命令发现 |

支持项目级自定义 Agent 的宿主还会得到 `researchspec-executor` 与 `researchspec-reviewer` 两个非入口配置。Navigate 仅在 activation packet 建议时使用，并验证 worker 返回结果后才执行 CLI 状态变更。
