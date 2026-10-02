
# src/vendor-converters/scientific-agent-skills/converter.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/scientific-agent-skills](../../../../modules/src/vendor-converters/scientific-agent-skills.md)
<!-- node: file:src/vendor-converters/scientific-agent-skills/converter.ts -->

Scientific Agent Skills 转换主流程：按准入决定逐个适配上游 Skill、复制评审过的非标准资源、把引用段改写为被动语态，并在暂存区生成插件包与注册表。
源码：[src/vendor-converters/scientific-agent-skills/converter.ts](../../../../../../src/vendor-converters/scientific-agent-skills/converter.ts)

## 符号（6）
<!-- node: function:src/vendor-converters/scientific-agent-skills/converter.ts:adaptSkillEntry -->
<!-- node: function:src/vendor-converters/scientific-agent-skills/converter.ts:checkScientificAgentSkillsIdempotence -->
<!-- node: function:src/vendor-converters/scientific-agent-skills/converter.ts:checkScientificAgentSkillsOutput -->
<!-- node: function:src/vendor-converters/scientific-agent-skills/converter.ts:convertScientificAgentSkills -->
<!-- node: function:src/vendor-converters/scientific-agent-skills/converter.ts:generateBundle -->
<!-- node: function:src/vendor-converters/scientific-agent-skills/converter.ts:passivizeCitationSection -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [adaptSkillEntry](../../../../symbols/src/vendor-converters/scientific-agent-skills/converter.ts/adaptSkillEntry.md) | 函数 | 212–266 | 复杂 | 内容适配、代码生成、vendor-converter | 1 | 按单条准入决定构建一个 Skill 包：保留上游 SKILL.md 正文、复制评审过的资源、附加生成 ID 与来源派生元数据。 |
| checkScientificAgentSkillsIdempotence | 函数 | 106–113 | 简单 | 幂等性、校验、vendor-converter | 0 | 重新生成并与已提交输出比对，返回漂移路径确认转换可重复。 |
| checkScientificAgentSkillsOutput | 函数 | 88–104 | 简单 | 校验、生成物检查、vendor-converter | 0 | 校验已提交的生成物与当前准入、依赖、资源和安全复核策略一致，汇总错误与警告。 |
| convertScientificAgentSkills | 函数 | 67–86 | 中等 | 转换流水线、orchestration、entry-point | 1 | 执行一次 Scientific Agent Skills 转换：加载策略、校验上游来源、在暂存目录生成后装配注册表并提交或返回 dry-run 清单。 |
| generateBundle | 函数 | 115–210 | 复杂 | 代码生成、转换流水线、哈希绑定 | 0 | 在暂存目录写出 56 个已准入 Skill 树、资源知识引用、vendor bundle 与转换清单，并汇总依赖决定与引用规范化记录。 |
| passivizeCitationSection | 函数 | 276–289 | 简单 | 内容适配、文本处理、vendor-converter | 0 | 把 SKILL.md 中的引用段改写为被动语态，避免把上游表述当作 ResearchSpec 自身的声明，并记录一次引用规范化。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assembler.ts](../../plugins/assembler.ts.md) | src/plugins/assembler.ts | 中央插件注册表装配器：读取领域目录与 ANZSRC 2020 分类快照，合并 vendor-bundles 下的各 vendor bundle，校验后原子写出 registry.json。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/scientific-agent-skills/policy.ts | 加载并校验 Scientific Agent Skills 的准入、依赖、资源与人工安全复核策略，同时合并上游审计记录构成完整策略视图。 |
| [production-vendors.ts](../shared/production-vendors.ts.md) | src/vendor-converters/shared/production-vendors.ts | 生产 vendor 清单的唯一事实源：声明六个已进入生产的 vendor ID，并提供域计数读取与清单一致性比对工具。 |
| [registry.ts](../../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [security-review.ts](security-review.ts.md) | src/vendor-converters/scientific-agent-skills/security-review.ts | Scientific Agent Skills 的人工安全评审层：定义评审目录的 Zod 契约，并交叉校验人工评审结论、固定审计身份、准入决策与上游实际文件清单之间的漂移。 |
| [staging.ts](../shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](cli.ts.md) | src/vendor-converters/scientific-agent-skills/cli.ts | Scientific Agent Skills vendor converter 的命令行入口，暴露 convert/check/idempotence 三个维护子命令。 |
| [scientific-agent-skills-converter.test.ts](../../../tests/scientific-agent-skills-converter.test.ts.md) | tests/scientific-agent-skills-converter.test.ts | Scientific Agent Skills 转换测试：验证准入策略覆盖全部审计记录、人工安全评审与准入结论互相印证，且已生成 bundle 保留 632 个资源与规范化入口并通过输出与幂等校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| checkScientificAgentSkillsIdempotence | 函数 | 106–113 | 重新生成并与已提交输出比对，返回漂移路径确认转换可重复。 |
| checkScientificAgentSkillsOutput | 函数 | 88–104 | 校验已提交的生成物与当前准入、依赖、资源和安全复核策略一致，汇总错误与警告。 |
| convertScientificAgentSkills | 函数 | 67–86 | 执行一次 Scientific Agent Skills 转换：加载策略、校验上游来源、在暂存目录生成后装配注册表并提交或返回 dry-run 清单。 |
