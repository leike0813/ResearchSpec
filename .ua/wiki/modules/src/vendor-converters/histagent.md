
# src/vendor-converters/histagent
> 目录聚合页：9 个文件、16 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/vendor-converters/histagent/cli.ts](../../../files/src/vendor-converters/histagent/cli.ts.md) | 文件 | 2 | HistAgent vendor converter 的命令行入口，暴露 convert/check/idempotence 三个维护子命令。 |
| [src/vendor-converters/histagent/complete-tree.ts](../../../files/src/vendor-converters/histagent/complete-tree.ts.md) | 文件 | 4 | 把三个 histagent-* Skill 的已编写树与上游 LICENSE、historical_support.py 支持库渲染为完整树，并按能力映射注入派生源信息。 |
| [src/vendor-converters/histagent/converter.ts](../../../files/src/vendor-converters/histagent/converter.ts.md) | 文件 | 5 | HistAgent 转换主流程：在临时暂存区生成三个 Skill 树、vendor bundle 与转换清单，装配中央注册表，并提供生成物检查与幂等性校验。 |
| [src/vendor-converters/histagent/policy.ts](../../../files/src/vendor-converters/histagent/policy.ts.md) | 文件 | 3 | HistAgent 生产策略：固定 release/revision/audit 哈希，声明 120 条源条目、31 个知识面、21 项能力映射与三个 Skill 契约的条目数量。 |
| [src/vendor-converters/histagent/preview.ts](../../../files/src/vendor-converters/histagent/preview.ts.md) | 文件 | 1 | HistAgent 策展预览：把渲染出的完整树写入临时预览目录，并生成含审核状态与逐文件哈希的 preview-manifest.json。 |
| [src/vendor-converters/histagent/production-policy.json](../../../files/src/vendor-converters/histagent/production-policy.json.md) | 配置 | 0 | HistAgent 生产策略 SSOT：在 snapshot-47bbe21 审计基线上，把 120 个源条目、31 个知识面、5 个内容来源、4 条许可声明、10 项运行时权威、16 个外部资源、10 条安全发现与 3 个候选 Skill 逐条映射为 excluded / retained-evidence / independent-reimplementation，并附带 21 项能力面映射与 3 份 Skill 契约。 |
| [src/vendor-converters/histagent/review-decision.json](../../../files/src/vendor-converters/histagent/review-decision.json.md) | 配置 | 0 | HistAgent 人工评审决定：记录 approved 状态与被批准的树集合哈希 c44f136b…dbd3，批准时间 2026-07-15，作为生产字节与准入的最终绑定点。 |
| [src/vendor-converters/histagent/skill-definitions.ts](../../../files/src/vendor-converters/histagent/skill-definitions.ts.md) | 文件 | 1 | 三个 histagent-* Skill 的非原生 Skill 契约定义表：能力与命令映射、入口点调用方式、支持库引用和条件读取的 references。 |
| [src/vendor-converters/histagent/source-evidence.json](../../../files/src/vendor-converters/histagent/source-evidence.json.md) | 配置 | 0 | HistAgent 上游来源证据：为 5 个被归属到 Microsoft AutoGen / Magentic-One 的脚本逐个记录固定 revision、官方路径、官方文件 sha256、声称符号、匹配结论与生产动作，全部落在 independent-reimplementation 上。 |

## 子目录
- [lib](histagent/lib.md)、[skills/histagent-historical-research/references](histagent/skills/histagent-historical-research/references.md)、[skills/histagent-historical-research/scripts](histagent/skills/histagent-historical-research/scripts.md)、[skills/histagent-historical-source-analysis/references](histagent/skills/histagent-historical-source-analysis/references.md)、[skills/histagent-historical-source-analysis/scripts](histagent/skills/histagent-historical-source-analysis/scripts.md)、[skills/histagent-historical-source-identification/references](histagent/skills/histagent-historical-source-identification/references.md)、[skills/histagent-historical-source-identification/scripts](histagent/skills/histagent-historical-source-identification/scripts.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/core/workspace](../core/workspace.md) | 3 |
| [src/vendor-converters/shared](shared.md) | 3 |
| [src/plugins](../plugins.md) | 2 |
| [src/vendor-converters/shared/non-native-skill-standard](shared/non-native-skill-standard.md) | 2 |
| [src/vendor-audits](../vendor-audits.md) | 1 |
