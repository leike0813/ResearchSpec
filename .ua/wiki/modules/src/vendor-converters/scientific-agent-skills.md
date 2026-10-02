
# src/vendor-converters/scientific-agent-skills
> 目录聚合页：8 个文件、17 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/vendor-converters/scientific-agent-skills/admission-decisions.json](../../../files/src/vendor-converters/scientific-agent-skills/admission-decisions.json.md) | 配置 | 0 | Scientific Agent Skills v2.70.0 全部 167 个上游 Skill 的准入裁决 SSOT：56 个准入、111 个排除，逐条记录 license、security_review、content_review、arsu_overlap、tooluniverse_overlap 与 domain_eligibility 六类证据复核。排除原因中 87 条为 tooluniverse-semantic-overlap，另有 arsu-surface-overlap、no-domain-fit、outside-plugin-authority、redistribution-prohibited 等。 |
| [src/vendor-converters/scientific-agent-skills/cli.ts](../../../files/src/vendor-converters/scientific-agent-skills/cli.ts.md) | 文件 | 2 | Scientific Agent Skills vendor converter 的命令行入口，暴露 convert/check/idempotence 三个维护子命令。 |
| [src/vendor-converters/scientific-agent-skills/converter.ts](../../../files/src/vendor-converters/scientific-agent-skills/converter.ts.md) | 文件 | 6 | Scientific Agent Skills 转换主流程：按准入决定逐个适配上游 Skill、复制评审过的非标准资源、把引用段改写为被动语态，并在暂存区生成插件包与注册表。 |
| [src/vendor-converters/scientific-agent-skills/dependency-decisions.json](../../../files/src/vendor-converters/scientific-agent-skills/dependency-decisions.json.md) | 配置 | 0 | 28 条跨 Skill 关系裁决：21 条因来源 Skill 被排除而作废，7 条降级为 advisory（如 scientific-slides→pptx、relsa-severity-assessment→statistical-analysis）。所有 resolved_target 均为空，任何关系都不构成硬依赖或安装触发条件。 |
| [src/vendor-converters/scientific-agent-skills/policy.ts](../../../files/src/vendor-converters/scientific-agent-skills/policy.ts.md) | 文件 | 3 | 加载并校验 Scientific Agent Skills 的准入、依赖、资源与人工安全复核策略，同时合并上游审计记录构成完整策略视图。 |
| [src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../files/src/vendor-converters/scientific-agent-skills/resource-decisions.json.md) | 配置 | 0 | 19 条资源级排除裁决，默认 disposition 为 included；每条剔除绑定 provider 凭据、修改宿主环境或发起远程请求的脚本与参考页，覆盖 infographics、latex-posters、modal、pacsomatic、parallel-web、scientific-schematics、scientific-slides 七个准入 Skill。 |
| [src/vendor-converters/scientific-agent-skills/security-review-decisions.json](../../../files/src/vendor-converters/scientific-agent-skills/security-review-decisions.json.md) | 配置 | 0 | 42 项人工安全复核的 SSOT（9 个批次各 5 项，末批 2 项）：逐 Skill 记录上游最高严重度、文件清单、findings、maintainer_decision、adaptations 与 independent_blockers。结论为 39 项附条件通过、2 项直接通过（autoskill、waypoint-bio）、1 项不通过（dhdna-profiler）。 |
| [src/vendor-converters/scientific-agent-skills/security-review.ts](../../../files/src/vendor-converters/scientific-agent-skills/security-review.ts.md) | 文件 | 6 | Scientific Agent Skills 的人工安全评审层：定义评审目录的 Zod 契约，并交叉校验人工评审结论、固定审计身份、准入决策与上游实际文件清单之间的漂移。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/vendor-audits](../vendor-audits.md) | 4 |
| [src/plugins](../plugins.md) | 2 |
| [src/vendor-converters/shared](shared.md) | 2 |
| [src/core/workspace](../core/workspace.md) | 1 |
