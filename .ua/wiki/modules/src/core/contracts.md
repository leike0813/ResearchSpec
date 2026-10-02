
# src/core/contracts
> 目录聚合页：9 个文件、14 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/core/contracts/annotation.ts](../../../files/src/core/contracts/annotation.ts.md) | 文件 | 0 | 核心层批注契约：语义影响级别、批注目标、原始来源、来源引用、完整批注与 AnnotationSetCandidate 的 zod 定义。 |
| [src/core/contracts/capability-graph.ts](../../../files/src/core/contracts/capability-graph.ts.md) | 文件 | 4 | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [src/core/contracts/capability-manifest.ts](../../../files/src/core/contracts/capability-manifest.ts.md) | 文件 | 2 | 能力包 manifest 契约（schema "1"）：能力分类、节点角色、执行类型、输入/输出角色、校验器、知识引用与溯源字段的 Zod 定义及交叉约束。 |
| [src/core/contracts/control-selector.ts](../../../files/src/core/contracts/control-selector.ts.md) | 文件 | 0 | 定义 run、node、Gate、Decision、change 与各类 inspection 的选择器 Zod 契约，并给出控制族与检查族的展示名称。 |
| [src/core/contracts/graph-workspace.ts](../../../files/src/core/contracts/graph-workspace.ts.md) | 文件 | 4 | schema 2 工作区的核心契约集合：config、稳定 spec、run、节点实例、handoff 与启动命令的 Zod schema，并提供 frontmatter 解析与渲染。 |
| [src/core/contracts/project-change.ts](../../../files/src/core/contracts/project-change.ts.md) | 文件 | 1 | 项目变更契约：变更 frontmatter 状态机（draft → accepted/rejected/deferred/superseded → applied）与 sources/claims 增量操作记录的 Zod 定义。 |
| [src/core/contracts/project-path.ts](../../../files/src/core/contracts/project-path.ts.md) | 文件 | 2 | 路径安全词法规则 SSOT：安全相对路径、安全路径分量、规范绝对路径与禁止进入 researchspec/ 的项目相对路径。 |
| [src/core/contracts/stable-specs.ts](../../../files/src/core/contracts/stable-specs.ts.md) | 文件 | 1 | 稳定 spec 契约：project / sources / claims / manuscript 四类 spec 的 Zod schema、StableId 命名规则与 YAML frontmatter 解析入口。 |
| [src/core/contracts/workspace-format.ts](../../../files/src/core/contracts/workspace-format.ts.md) | 文件 | 0 | 工作区格式版本常量与 config.yaml schema 定义，锁定当前 schema 版本号与 WorkspaceFormatKind 判定类型。 |
