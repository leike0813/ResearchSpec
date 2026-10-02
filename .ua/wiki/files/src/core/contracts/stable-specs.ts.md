
# src/core/contracts/stable-specs.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/contracts](../../../../modules/src/core/contracts.md)
<!-- node: file:src/core/contracts/stable-specs.ts -->

稳定 spec 契约：project / sources / claims / manuscript 四类 spec 的 Zod schema、StableId 命名规则与 YAML frontmatter 解析入口。
源码：[src/core/contracts/stable-specs.ts](../../../../../../src/core/contracts/stable-specs.ts)

## 符号（1）
<!-- node: function:src/core/contracts/stable-specs.ts:parseProjectSpec -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| parseProjectSpec | 函数 | 97–103 | 中等 | contract、parser、stable-specs、yaml | 0 | 解析 project.md 的 YAML frontmatter 与正文，frontmatter 缺失或未闭合时直接抛错。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [workspace-format.ts](workspace-format.ts.md) | src/core/contracts/workspace-format.ts | 工作区格式版本常量与 config.yaml schema 定义，锁定当前 schema 版本号与 WorkspaceFormatKind 判定类型。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-graph.ts](capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [capability-manifest.ts](capability-manifest.ts.md) | src/core/contracts/capability-manifest.ts | 能力包 manifest 契约（schema "1"）：能力分类、节点角色、执行类型、输入/输出角色、校验器、知识引用与溯源字段的 Zod 定义及交叉约束。 |
| [contract.ts](../../arsu-converter/revision/contract.ts.md) | src/arsu-converter/revision/contract.ts | ARSU 修订补丁 v2.0 的唯一契约：操作、授权上下文、claim strength 变更与批注映射的 zod 定义、校验和 JSON Schema 导出。 |
| [control-selector.ts](control-selector.ts.md) | src/core/contracts/control-selector.ts | 定义 run、node、Gate、Decision、change 与各类 inspection 的选择器 Zod 契约，并给出控制族与检查族的展示名称。 |
| [delivery.ts](../../arsu-converter/quarto/delivery.ts.md) | src/arsu-converter/quarto/delivery.ts | Quarto 交付层：探测本机 Quarto 可用性，并把单个 .qmd 渲染结果以「临时暂存 + 硬链接」方式原子落地；默认禁用代码执行，执行需独立人工同意记录。 |
| [graph-workspace.ts](graph-workspace.ts.md) | src/core/contracts/graph-workspace.ts | schema 2 工作区的核心契约集合：config、稳定 spec、run、节点实例、handoff 与启动命令的 Zod schema，并提供 frontmatter 解析与渲染。 |
| [project-change.ts](project-change.ts.md) | src/core/contracts/project-change.ts | 项目变更契约：变更 frontmatter 状态机（draft → accepted/rejected/deferred/superseded → applied）与 sources/claims 增量操作记录的 Zod 定义。 |
| [registry.ts](../../graph-profiles/registry.ts.md) | src/graph-profiles/registry.ts | 图谱配置注册表层：加载并校验 skills/arsu/profiles/registry.json，逐个比对 profile 文件 SHA-256，并交叉验证图谱引用的能力在能力注册表中存在。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| parseProjectSpec | 函数 | 97–103 | 解析 project.md 的 YAML frontmatter 与正文，frontmatter 缺失或未闭合时直接抛错。 |
