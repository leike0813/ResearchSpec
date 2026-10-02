
# src/vendor-converters/shared/staging.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/shared](../../../../modules/src/vendor-converters/shared.md)
<!-- node: file:src/vendor-converters/shared/staging.ts -->

各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。
源码：[src/vendor-converters/shared/staging.ts](../../../../../../src/vendor-converters/shared/staging.ts)

## 符号（4）
<!-- node: function:src/vendor-converters/shared/staging.ts:commitVendorStage -->
<!-- node: function:src/vendor-converters/shared/staging.ts:prepareVendorStage -->
<!-- node: function:src/vendor-converters/shared/staging.ts:vendorProjectionDiff -->
<!-- node: function:src/vendor-converters/shared/staging.ts:walkFiles -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| commitVendorStage | 函数 | 14–24 | 简单 | staging、filesystem、publish | 0 | 将 stage 中该 vendor 的 Skill 树、bundle、manifest、转换报告与 registry.json 写回输出根。 |
| prepareVendorStage | 函数 | 8–12 | 简单 | staging、filesystem、vendor-inventory | 1 | 把已发布的插件树复制到临时 stage，并删除该 vendor 的既有投影与 registry.json。 |
| vendorProjectionDiff | 函数 | 26–31 | 简单 | drift-detection、idempotence、hashing | 1 | 按 SHA-256 比较期望投影与实际投影，返回全部漂移的相对路径。 |
| walkFiles | 函数 | 37–46 | 简单 | filesystem、utility、traversal | 0 | 递归收集目录下的全部文件并按名称排序，目录不存在时返回空列表。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](../finrobot/complete-tree.ts.md) | src/vendor-converters/finrobot/complete-tree.ts | 把已审核的六个 financial-research Skill 定义与上游 LICENSE、共享支持库组装为完整文件树，逐文件计算哈希并做路径与敏感值安全校验。 |
| [complete-tree.ts](../histagent/complete-tree.ts.md) | src/vendor-converters/histagent/complete-tree.ts | 把三个 histagent-* Skill 的已编写树与上游 LICENSE、historical_support.py 支持库渲染为完整树，并按能力映射注入派生源信息。 |
| [complete-tree.ts](../materials-science-skills-for-llm/complete-tree.ts.md) | src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts | 渲染七个 materials-* Skill 的 Tier 1/Tier 2 完整树，注入 MIT 许可声明、NOTICE 与 DERIVATION 派生源，并逐树计算哈希。 |
| [converter.ts](../education-agent-skills/converter.ts.md) | src/vendor-converters/education-agent-skills/converter.ts | Education Agent Skills 生产转换器：校验策略与审批哈希、在 staging 目录生成 136 个准入 Skill 的插件包、写入转换清单，并提供产物检查与幂等性检查。 |
| [converter.ts](../finrobot/converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../histagent/converter.ts.md) | src/vendor-converters/histagent/converter.ts | HistAgent 转换主流程：在临时暂存区生成三个 Skill 树、vendor bundle 与转换清单，装配中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../materials-science-skills-for-llm/converter.ts.md) | src/vendor-converters/materials-science-skills-for-llm/converter.ts | Materials 转换主流程：渲染七个 Skill 树、校验上游来源文件、在暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../scientific-agent-skills/converter.ts.md) | src/vendor-converters/scientific-agent-skills/converter.ts | Scientific Agent Skills 转换主流程：按准入决定逐个适配上游 Skill、复制评审过的非标准资源、把引用段改写为被动语态，并在暂存区生成插件包与注册表。 |
| [converter.ts](../tooluniverse/converter.ts.md) | src/vendor-converters/tooluniverse/converter.ts | ToolUniverse vendor 转换器主体：按审计与依赖决策生成 130 个已评审 Skill 的 bundle、manifest 与转换报告，并提供输出校验与幂等性检查。 |
| [materials-science-skills-converter.test.ts](../../../tests/materials-science-skills-converter.test.ts.md) | tests/materials-science-skills-converter.test.ts | Materials-Science-Skills-For-LLM 转换测试：校验 version 2 策略的 7 准入 / 5 排除、Tier 1 与 Tier 2 划分、六个条件读取的 reference，以及完整树的溯源、渐进式披露与生成输出幂等性。 |
| [policy.ts](../materials-science-skills-for-llm/policy.ts.md) | src/vendor-converters/materials-science-skills-for-llm/policy.ts | Materials 生产策略的 zod 契约：12 条准入决定、7 条关系、逐文件处置与外部资源决定，并要求每条决定都带有指向真实证据文件的存在性校验。 |
| [preview.ts](../finrobot/preview.ts.md) | src/vendor-converters/finrobot/preview.ts | FinRobot 候选预览路径：限定预览根必须位于 audits/finrobot 之下，只渲染 pending-human-review 的候选树，并输出候选清单供人工语义复核。 |
| [vendor-staging.test.ts](../../../tests/vendor-staging.test.ts.md) | tests/vendor-staging.test.ts | 共享暂存协议测试：遍历全部六个生产 vendor，断言提交目标 vendor 投影不会改动其他 vendor 的任何文件哈希。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| commitVendorStage | 函数 | 14–24 | 将 stage 中该 vendor 的 Skill 树、bundle、manifest、转换报告与 registry.json 写回输出根。 |
| prepareVendorStage | 函数 | 8–12 | 把已发布的插件树复制到临时 stage，并删除该 vendor 的既有投影与 registry.json。 |
| vendorProjectionDiff | 函数 | 26–31 | 按 SHA-256 比较期望投影与实际投影，返回全部漂移的相对路径。 |
| walkFiles | 函数 | 37–46 | 递归收集目录下的全部文件并按名称排序，目录不存在时返回空列表。 |
