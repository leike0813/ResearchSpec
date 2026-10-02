
# src/core/contracts/capability-manifest.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/contracts](../../../../modules/src/core/contracts.md)
<!-- node: file:src/core/contracts/capability-manifest.ts -->

能力包 manifest 契约（schema "1"）：能力分类、节点角色、执行类型、输入/输出角色、校验器、知识引用与溯源字段的 Zod 定义及交叉约束。
源码：[src/core/contracts/capability-manifest.ts](../../../../../../src/core/contracts/capability-manifest.ts)

## 符号（2）
<!-- node: function:src/core/contracts/capability-manifest.ts:parseCapabilityManifest -->
<!-- node: function:src/core/contracts/capability-manifest.ts:unique -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| parseCapabilityManifest | 函数 | 199–201 | 中等 | contract、parser、capability-manifest | 0 | 能力 manifest 的解析入口，委托 CapabilityManifestSchema 校验。 |
| unique | 函数 | 174–187 | 中等 | contract、validation、deduplication | 0 | 对 manifest 内角色、校验器、知识引用与 preset 集合按 ID 去重。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [stable-specs.ts](stable-specs.ts.md) | src/core/contracts/stable-specs.ts | 稳定 spec 契约：project / sources / claims / manuscript 四类 spec 的 Zod schema、StableId 命名规则与 YAML frontmatter 解析入口。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](../../arsu-converter/authoring/author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |
| [capability-manifest.test.ts](../../../tests/capability-manifest.test.ts.md) | tests/capability-manifest.test.ts | manifest 契约测试：覆盖最小 producer 包、缺失输出角色、kebab-case 能力 ID、未知节点类型、重复角色 ID、输入来源策略、script 校验器 runner 契约与网络校验器降级声明。 |
| [capability-validators.test.ts](../../../tests/capability-validators.test.ts.md) | tests/capability-validators.test.ts | 校验器执行测试：覆盖 script 校验器通过与失败、网络校验器降级为 degraded 而非 pass、未知 policy 与未解析 schema 校验器 fail-closed，以及 submitGraphNode 触发注册表声明的校验器。 |
| [catalog.ts](../../procedures/catalog.ts.md) | src/procedures/catalog.ts | 运行时派生的 Procedure 目录：合并 ARSU 路由、Companion 工作流、核心能力与插件扩展，产出可检索、可渐进披露的过程卡片集合。 |
| [extensions.ts](../../plugins/extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [graph-check.ts](../../plugins/graph-check.ts.md) | src/plugins/graph-check.ts | 对工作区已选插件域做只读体检：域可用性、已投影文件哈希与能力清单一致性，全部收敛为结构化 Diagnostic。 |
| [graph-run.ts](../runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [graph.ts](../../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [registry.ts](../../capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
| [validators.ts](../../capabilities/validators.ts.md) | src/capabilities/validators.ts | 能力校验器执行层：按 manifest 声明依次运行 policy 与 script 校验器；script 校验器在临时目录写入 submission.json 后按 argv 模板执行，网络型校验器失败降级为 degraded 而非 pass。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| parseCapabilityManifest | 函数 | 199–201 | 能力 manifest 的解析入口，委托 CapabilityManifestSchema 校验。 |
| unique | 函数 | 174–187 | 对 manifest 内角色、校验器、知识引用与 preset 集合按 ID 去重。 |
