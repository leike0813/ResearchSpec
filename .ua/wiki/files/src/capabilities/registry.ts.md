
# src/capabilities/registry.ts
所属分层：[能力与插件目录层](../../../layers/capability-registry.md)  
所属目录：[src/capabilities](../../../modules/src/capabilities.md)
<!-- node: file:src/capabilities/registry.ts -->

能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。
源码：[src/capabilities/registry.ts](../../../../../src/capabilities/registry.ts)

## 符号（4）
<!-- node: class:src/capabilities/registry.ts:CapabilityRegistryError -->
<!-- node: function:src/capabilities/registry.ts:loadCapabilityRegistry -->
<!-- node: function:src/capabilities/registry.ts:validateCapabilityRegistry -->
<!-- node: function:src/capabilities/registry.ts:validateGraphAgainstCapabilityRegistry -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| CapabilityRegistryError | 类 | 75–80 | 中等 | error-type、diagnostics、registry | 0 | 携带 blocking Diagnostic 列表的能力注册表错误类型，消息由诊断拼接而成。 |
| [loadCapabilityRegistry](../../../symbols/src/capabilities/registry.ts/loadCapabilityRegistry.md) | 函数 | 85–97 | 中等 | registry、loader、capabilities | 3 | 读取能力根目录下的 registry.json 并转交校验；读取失败时抛出 unreadable 诊断。 |
| [validateCapabilityRegistry](../../../symbols/src/capabilities/registry.ts/validateCapabilityRegistry.md) | 函数 | 99–208 | 复杂 | registry、validation、integrity、hashing | 1 | 逐条校验注册表：schema、ID 唯一性、manifest 哈希与 schema、SKILL.md 存在且非空、knowledge 资源哈希、schema 引用与 ARS 溯源制品。 |
| validateGraphAgainstCapabilityRegistry | 函数 | 221–262 | 中等 | graph-profile、validation、diagnostics、contracts | 0 | 交叉校验图谱与能力注册表：能力引用存在性、注册表版本一致、必填输入绑定、来源策略、stable_spec 映射、parameter 取值与 node_output 生产者输出可用性。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-graph.ts](../core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [capability-manifest.ts](../core/contracts/capability-manifest.ts.md) | src/core/contracts/capability-manifest.ts | 能力包 manifest 契约（schema "1"）：能力分类、节点角色、执行类型、输入/输出角色、校验器、知识引用与溯源字段的 Zod 定义及交叉约束。 |
| [types.ts](../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](../arsu-converter/authoring/author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |
| [authoring-converter.test.ts](../../tests/authoring-converter.test.ts.md) | tests/authoring-converter.test.ts | 验证能力编写器的输出可被注册表加载、manifest 指纹与注册表一致，并断言重复生成完全幂等。 |
| [capability-registry.test.ts](../../tests/capability-registry.test.ts.md) | tests/capability-registry.test.ts | 能力注册表测试：验证全部内置能力包可加载且为 operational 目录名，并覆盖 ID/路径不匹配、重复 ID、manifest 与 knowledge 哈希不符、未知 schema 引用、ARS 溯源缺失及图谱输入准入诊断。 |
| [capability-validators.test.ts](../../tests/capability-validators.test.ts.md) | tests/capability-validators.test.ts | 校验器执行测试：覆盖 script 校验器通过与失败、网络校验器降级为 degraded 而非 pass、未知 policy 与未解析 schema 校验器 fail-closed，以及 submitGraphNode 触发注册表声明的校验器。 |
| [catalog.ts](../procedures/catalog.ts.md) | src/procedures/catalog.ts | 运行时派生的 Procedure 目录：合并 ARSU 路由、Companion 工作流、核心能力与插件扩展，产出可检索、可渐进披露的过程卡片集合。 |
| [extensions.ts](../plugins/extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [graph-check.ts](../plugins/graph-check.ts.md) | src/plugins/graph-check.ts | 对工作区已选插件域做只读体检：域可用性、已投影文件哈希与能力清单一致性，全部收敛为结构化 Diagnostic。 |
| [graph-run.ts](../core/runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [graph-workspace.ts](../../tests/helpers/graph-workspace.ts.md) | tests/helpers/graph-workspace.ts | 图谱测试夹具库：提供最小图谱样例、schema 2 基础工作区与运行目录的落盘助手，以及按图谱合成能力 manifest 的测试注册表。 |
| [graph.ts](../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [paper-humanizer.test.ts](../../tests/paper-humanizer.test.ts.md) | tests/paper-humanizer.test.ts | paper-humanizer 测试：验证提取索引对固定 vendor 的哈希绑定、能力包已创作并注册、图谱可对内置注册表解析，以及 authoring 幂等与 Reference-mode 入口存在。 |
| [preset-graphs.test.ts](../../tests/preset-graphs.test.ts.md) | tests/preset-graphs.test.ts | 预设图谱测试：验证 research-main 预设可解析且节点全部可达、Gate 与前置绑定正确，converter 自有注册表与打包投影一致，minimal/writing/reviewer/pipeline 预设保留声明的 handoff 物化交接。 |
| [procedures.test.ts](../../tests/procedures.test.ts.md) | tests/procedures.test.ts | Procedure 目录的行为测试：验证目录规模由各注册表派生、Companion 仅暴露三个隐藏 Procedure、排序检索与激活包内容符合契约。 |
| [registry.ts](../graph-profiles/registry.ts.md) | src/graph-profiles/registry.ts | 图谱配置注册表层：加载并校验 skills/arsu/profiles/registry.json，逐个比对 profile 文件 SHA-256，并交叉验证图谱引用的能力在能力注册表中存在。 |
| [review-response.test.ts](../../tests/review-response.test.ts.md) | tests/review-response.test.ts | review-response 测试：验证能力包已创作注册、图谱解析并声明修订回路、运行可经轮次 Decision 推进至完成，以及 handoff 物化出 revision-master 工作台资源、authoring 幂等。 |
| [revision-master-runtime.test.ts](../../tests/revision-master-runtime.test.ts.md) | tests/revision-master-runtime.test.ts | revision-master workbench 运行时的端到端测试：在临时目录建 SQLite 工作区，经 uv 共享 Python 环境调用包内工具，校验投影、写入计划、回执与生成的能力包行为。 |
| [runtime-capabilities.ts](../plugins/runtime-capabilities.ts.md) | src/plugins/runtime-capabilities.ts | 按工作区已选插件域把扩展能力合并进基础能力注册表，产出运行时统一视图并保持能力 ID 有序。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| CapabilityRegistryError | 类 | 75–80 | 携带 blocking Diagnostic 列表的能力注册表错误类型，消息由诊断拼接而成。 |
| [loadCapabilityRegistry](../../../symbols/src/capabilities/registry.ts/loadCapabilityRegistry.md) | 函数 | 85–97 | 读取能力根目录下的 registry.json 并转交校验；读取失败时抛出 unreadable 诊断。 |
| [validateCapabilityRegistry](../../../symbols/src/capabilities/registry.ts/validateCapabilityRegistry.md) | 函数 | 99–208 | 逐条校验注册表：schema、ID 唯一性、manifest 哈希与 schema、SKILL.md 存在且非空、knowledge 资源哈希、schema 引用与 ARS 溯源制品。 |
| validateGraphAgainstCapabilityRegistry | 函数 | 221–262 | 交叉校验图谱与能力注册表：能力引用存在性、注册表版本一致、必填输入绑定、来源策略、stable_spec 映射、parameter 取值与 node_output 生产者输出可用性。 |
