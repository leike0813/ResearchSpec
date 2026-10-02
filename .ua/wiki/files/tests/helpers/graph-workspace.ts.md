
# tests/helpers/graph-workspace.ts
所属分层：[测试与验收夹具层](../../../layers/tests.md)  
所属目录：[tests/helpers](../../../modules/tests/helpers.md)
<!-- node: file:tests/helpers/graph-workspace.ts -->

图谱测试夹具库：提供最小图谱样例、schema 2 基础工作区与运行目录的落盘助手，以及按图谱合成能力 manifest 的测试注册表。
源码：[tests/helpers/graph-workspace.ts](../../../../../tests/helpers/graph-workspace.ts)

## 符号（4）
<!-- node: function:tests/helpers/graph-workspace.ts:graphTestCapabilityRegistryForGraphs -->
<!-- node: function:tests/helpers/graph-workspace.ts:runValue -->
<!-- node: function:tests/helpers/graph-workspace.ts:writeBaseWorkspace -->
<!-- node: function:tests/helpers/graph-workspace.ts:writeRun -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| graphTestCapabilityRegistryForGraphs | 函数 | 139–172 | 中等 | test-helper、capabilities、fixture、graph-profile | 0 | 按给定图谱合成测试用能力 manifest，使图谱声明的输入输出角色与 output_roles 策略校验器一致。 |
| runValue | 函数 | 56–77 | 中等 | test-helper、fixture、graph-workspace | 0 | 构造与 minimal profile 兼容的 run.yaml 测试数据，含启动确认摘要。 |
| writeBaseWorkspace | 函数 | 79–107 | 中等 | test-helper、fixture、filesystem、workspace | 0 | 落盘 schema 2 基础工作区：profiles/specs/runs/changes 目录、config.yaml、安装清单、profile 文件与四类 spec。 |
| writeRun | 函数 | 109–128 | 中等 | test-helper、fixture、graph-workspace、filesystem | 0 | 落盘运行目录的 run.yaml、冻结 graph.yaml 与 handoff.md，可选写入已完成的 rq 节点实例。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-graph.ts](../../src/core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [graph-workspace-index.ts](../../src/core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [registry.ts](../../src/capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-validators.test.ts](../capability-validators.test.ts.md) | tests/capability-validators.test.ts | 校验器执行测试：覆盖 script 校验器通过与失败、网络校验器降级为 degraded 而非 pass、未知 policy 与未解析 schema 校验器 fail-closed，以及 submitGraphNode 触发注册表声明的校验器。 |
| [graph-cli.test.ts](../graph-cli.test.ts.md) | tests/graph-cli.test.ts | 图谱 CLI 集成测试：在 schema 2 工作区上验证 status/check/doctor 只读路径，以及 start → instructions → advance 的节点闭环。 |
| [graph-run-advanced.test.ts](../graph-run-advanced.test.ts.md) | tests/graph-run-advanced.test.ts | 图谱运行高级测试：覆盖 mid-entry 只暴露确认入口节点、子图绑定与父角色校验、父绑定子运行创建、运行完成判定、修订轮次独立节点文件与 node_output 显式 from_role 解析。 |
| [graph-run-conflict.test.ts](../graph-run-conflict.test.ts.md) | tests/graph-run-conflict.test.ts | 图谱运行冲突测试：验证扫描后出现的节点文件、扫描后被改动的节点文件、歧义重复节点实例均被拒绝，以及失败 Gate 的 override 记录在所属 Gate 内并解锁下游。 |
| [graph-run.test.ts](../graph-run.test.ts.md) | tests/graph-run.test.ts | 图谱运行主路径测试：验证运行创建的确定性与冻结图谱、dry-run 不落盘、frontier 随提交推进、乱序提交被拒、Gate/Decision 阻塞下游、图谱文本漂移后哈希稳定与缺失绑定输入的 fail-closed。 |
| [graph-workspace.test.ts](../graph-workspace.test.ts.md) | tests/graph-workspace.test.ts | 图谱工作区索引测试：验证 schema 2 接受、schema 1 拒绝，空工作区加载，运行/冻结图谱/节点/handoff 扫描，以及冻结图谱哈希不符与未知、重复节点实例的诊断。 |
| [review-response.test.ts](../review-response.test.ts.md) | tests/review-response.test.ts | review-response 测试：验证能力包已创作注册、图谱解析并声明修订回路、运行可经轮次 Decision 推进至完成，以及 handoff 物化出 revision-master 工作台资源、authoring 幂等。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| graphTestCapabilityRegistryForGraphs | 函数 | 139–172 | 按给定图谱合成测试用能力 manifest，使图谱声明的输入输出角色与 output_roles 策略校验器一致。 |
| runValue | 函数 | 56–77 | 构造与 minimal profile 兼容的 run.yaml 测试数据，含启动确认摘要。 |
| writeBaseWorkspace | 函数 | 79–107 | 落盘 schema 2 基础工作区：profiles/specs/runs/changes 目录、config.yaml、安装清单、profile 文件与四类 spec。 |
| writeRun | 函数 | 109–128 | 落盘运行目录的 run.yaml、冻结 graph.yaml 与 handoff.md，可选写入已完成的 rq 节点实例。 |
