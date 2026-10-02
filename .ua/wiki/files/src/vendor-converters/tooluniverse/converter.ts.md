
# src/vendor-converters/tooluniverse/converter.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/tooluniverse](../../../../modules/src/vendor-converters/tooluniverse.md)
<!-- node: file:src/vendor-converters/tooluniverse/converter.ts -->

ToolUniverse vendor 转换器主体：按审计与依赖决策生成 130 个已评审 Skill 的 bundle、manifest 与转换报告，并提供输出校验与幂等性检查。
源码：[src/vendor-converters/tooluniverse/converter.ts](../../../../../../src/vendor-converters/tooluniverse/converter.ts)

## 符号（7）
<!-- node: function:src/vendor-converters/tooluniverse/converter.ts:adaptSkillEntry -->
<!-- node: function:src/vendor-converters/tooluniverse/converter.ts:checkToolUniverseIdempotence -->
<!-- node: function:src/vendor-converters/tooluniverse/converter.ts:checkToolUniverseOutput -->
<!-- node: function:src/vendor-converters/tooluniverse/converter.ts:convertToolUniverse -->
<!-- node: function:src/vendor-converters/tooluniverse/converter.ts:generateBundle -->
<!-- node: function:src/vendor-converters/tooluniverse/converter.ts:validateAuditAndPolicies -->
<!-- node: function:src/vendor-converters/tooluniverse/converter.ts:validateSource -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| adaptSkillEntry | 函数 | 211–236 | 中等 | vendor-converter、semantic-adaptation、skill-md | 0 | 对单个 Skill 入口文件套用已评审的语义适配并规范化 frontmatter，写出带 ResearchSpec 边界声明的 SKILL.md。 |
| checkToolUniverseIdempotence | 函数 | 111–118 | 简单 | idempotence、drift-detection、validation | 1 | 在临时目录重跑一次转换并与已发布投影比较，返回幂等结论与漂移路径。 |
| checkToolUniverseOutput | 函数 | 96–109 | 中等 | validation、quality-gate、invariant | 1 | 加载已生成注册表，断言 ToolUniverse 拥有 130 个 Skill、六个生产 vendor 齐备且域总数为 218。 |
| convertToolUniverse | 函数 | 65–94 | 中等 | vendor-converter、orchestration、entry-point | 1 | 转换主流程：校验审计与决策、在临时 stage 生成 bundle、装配插件注册表，按需检测漂移后提交生成物。 |
| generateBundle | 函数 | 120–187 | 复杂 | code-generation、vendor-converter、tooluniverse | 0 | 遍历候选 Skill 生成 vendor 树：复制并适配已评审内容、记录文件级取舍理由、汇总依赖决策并输出 bundle、manifest 与报告。 |
| validateAuditAndPolicies | 函数 | 189–198 | 简单 | validation、audit、invariant | 0 | 校验审计汇总数字与依赖决策一致，阻断在无审计依据的情况下生成内容。 |
| validateSource | 函数 | 200–209 | 简单 | validation、pinned-source、audit | 0 | 确认上游 checkout 的 release 与 revision 同审计声明一致，防止用错固定输入。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assembler.ts](../../plugins/assembler.ts.md) | src/plugins/assembler.ts | 中央插件注册表装配器：读取领域目录与 ANZSRC 2020 分类快照，合并 vendor-bundles 下的各 vendor bundle，校验后原子写出 registry.json。 |
| [production-vendors.ts](../shared/production-vendors.ts.md) | src/vendor-converters/shared/production-vendors.ts | 生产 vendor 清单的唯一事实源：声明六个已进入生产的 vendor ID，并提供域计数读取与清单一致性比对工具。 |
| [registry.ts](../../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [semantic-adaptations.ts](semantic-adaptations.ts.md) | src/vendor-converters/tooluniverse/semantic-adaptations.ts | ToolUniverse 已评审内容的语义适配规则集：修补 v1.3.1 到 v1.5.4 之间的工具契约漂移，按工具族、文件或 Skill 精确作用域生效。 |
| [staging.ts](../shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](cli.ts.md) | src/vendor-converters/tooluniverse/cli.ts | ToolUniverse 转换器的命令行薄封装，向上游定位仓库根后分派 convert / check / idempotence 三个子命令。 |
| [tooluniverse-converter.test.ts](../../../tests/tooluniverse-converter.test.ts.md) | tests/tooluniverse-converter.test.ts | ToolUniverse 转换产物测试：断言 130 准入 / 55 排除、226 条依赖边分类、被排除资源的理由，以及生成 bundle 的输出校验、幂等性与静态权威与署名契约。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| checkToolUniverseIdempotence | 函数 | 111–118 | 在临时目录重跑一次转换并与已发布投影比较，返回幂等结论与漂移路径。 |
| checkToolUniverseOutput | 函数 | 96–109 | 加载已生成注册表，断言 ToolUniverse 拥有 130 个 Skill、六个生产 vendor 齐备且域总数为 218。 |
| convertToolUniverse | 函数 | 65–94 | 转换主流程：校验审计与决策、在临时 stage 生成 bundle、装配插件注册表，按需检测漂移后提交生成物。 |
