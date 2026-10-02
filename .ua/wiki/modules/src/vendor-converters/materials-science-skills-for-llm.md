
# src/vendor-converters/materials-science-skills-for-llm
> 目录聚合页：10 个文件、13 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/vendor-converters/materials-science-skills-for-llm/admission-decisions.json](../../../files/src/vendor-converters/materials-science-skills-for-llm/admission-decisions.json.md) | 配置 | 0 | Materials-Science 12 个上游 Skill 的准入裁决 SSOT：逐条记录 generated_skill_id、准入或排除结论、reason_codes，以及 license、content_review、permission_review、overlap 四类证据复核结果。 |
| [src/vendor-converters/materials-science-skills-for-llm/cli.ts](../../../files/src/vendor-converters/materials-science-skills-for-llm/cli.ts.md) | 文件 | 2 | Materials-Science-Skills-For-LLM vendor converter 的命令行入口，暴露 convert/check/idempotence 三个维护子命令。 |
| [src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts](../../../files/src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts.md) | 文件 | 4 | 渲染七个 materials-* Skill 的 Tier 1/Tier 2 完整树，注入 MIT 许可声明、NOTICE 与 DERIVATION 派生源，并逐树计算哈希。 |
| [src/vendor-converters/materials-science-skills-for-llm/converter.ts](../../../files/src/vendor-converters/materials-science-skills-for-llm/converter.ts.md) | 文件 | 4 | Materials 转换主流程：渲染七个 Skill 树、校验上游来源文件、在暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../files/src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json.md) | 配置 | 0 | 14 条外部资源处置裁决：逐个 Skill 记录其软件、数据、模型与计算环境依赖的 kind 与 disposition，把安装、凭据和远程执行统一归为用户自行提供的前置条件。 |
| [src/vendor-converters/materials-science-skills-for-llm/file-decisions.json](../../../files/src/vendor-converters/materials-science-skills-for-llm/file-decisions.json.md) | 配置 | 0 | 24 条源文件级派生裁决：为每个上游文件记录 source_sha256、adapted 或 excluded 结论，以及改写后落入生成树的 derived_output_paths，是转换字节可复现的依据。 |
| [src/vendor-converters/materials-science-skills-for-llm/policy.ts](../../../files/src/vendor-converters/materials-science-skills-for-llm/policy.ts.md) | 文件 | 2 | Materials 生产策略的 zod 契约：12 条准入决定、7 条关系、逐文件处置与外部资源决定，并要求每条决定都带有指向真实证据文件的存在性校验。 |
| [src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json](../../../files/src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json.md) | 配置 | 0 | 7 条 Skill 间关系裁决：把 DeepMD、Slurm、ASE、Atomsk 等跨 Skill 关联统一定为 advisory 或 source-excluded，resolved_target 全部为 null，禁止转化为安装依赖。 |
| [src/vendor-converters/materials-science-skills-for-llm/review-decision.json](../../../files/src/vendor-converters/materials-science-skills-for-llm/review-decision.json.md) | 配置 | 0 | Materials-Science 转换的最终发布裁决（schema 2）：锚定 snapshot-fafd3ab 与审计哈希，published 记录已批准的树集合哈希 c45bafc4… 与转换器版本 2，candidate 为空表示无待审候选。 |
| [src/vendor-converters/materials-science-skills-for-llm/skill-definitions.ts](../../../files/src/vendor-converters/materials-science-skills-for-llm/skill-definitions.ts.md) | 文件 | 1 | 七个 materials-* Skill 的定义表：Tier 1/2 分级、上游 Skill 映射、领域归属，以及 agent-procedure 与 external-tool 两种能力实现形态。 |

## 子目录
- [skills/materials-science-skills-apex-alloy-workflows/references](materials-science-skills-for-llm/skills/materials-science-skills-apex-alloy-workflows/references.md)、[skills/materials-science-skills-atomsk-cli](materials-science-skills-for-llm/skills/materials-science-skills-atomsk-cli.md)、[skills/materials-science-skills-deeptb-helper/references](materials-science-skills-for-llm/skills/materials-science-skills-deeptb-helper/references.md)、[skills/materials-science-skills-dpgen-workflow/references](materials-science-skills-for-llm/skills/materials-science-skills-dpgen-workflow/references.md)、[skills/materials-science-skills-gpumd-workflow/references](materials-science-skills-for-llm/skills/materials-science-skills-gpumd-workflow/references.md)、[skills/materials-science-skills-phonopy-workflows/references](materials-science-skills-for-llm/skills/materials-science-skills-phonopy-workflows/references.md)、[skills/materials-science-skills-unimol-ops/references](materials-science-skills-for-llm/skills/materials-science-skills-unimol-ops/references.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/vendor-converters/shared](shared.md) | 4 |
| [src/core/workspace](../core/workspace.md) | 3 |
| [src/plugins](../plugins.md) | 2 |
| [src/vendor-audits](../vendor-audits.md) | 2 |
| [src/vendor-converters/shared/non-native-skill-standard](shared/non-native-skill-standard.md) | 2 |
