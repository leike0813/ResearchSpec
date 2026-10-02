
# 核心契约与工作流运行时

ResearchSpec 的规格事实源：workspace/graph/run 契约定义、Zod 解析校验、写入计划与路径边界、批注溯源等纯运行时逻辑，CLI 与转换器都只经由此层改变工作流状态。
> 本页由知识图谱分层 `layer:core` 生成，共 27 个文件级节点。

## 目录分布

| 目录 | 文件数 |
| --- | --- |
| [src/core/contracts](../modules/src/core/contracts.md) | 9 |
| [src/core/workspace](../modules/src/core/workspace.md) | 6 |
| [src/core/runtime](../modules/src/core/runtime.md) | 5 |
| [src](../modules/src.md) | 3 |
| [src/core/validation](../modules/src/core/validation.md) | 2 |
| [src/utils](../modules/src/utils.md) | 2 |

## 文件清单

| 文件 | 类型 | 语言 | 摘要 |
| --- | --- | --- | --- |
| [src/annotation-intake.ts](../files/src/annotation-intake.ts.md) | 文件 | — | 批注接收（annotation intake）子系统的 barrel 入口，向上重导出 contracts、session、sources、review-copy、review-delta 与 interpretation 全部公开接口。 |
| [src/core/contracts/annotation.ts](../files/src/core/contracts/annotation.ts.md) | 文件 | — | 核心层批注契约：语义影响级别、批注目标、原始来源、来源引用、完整批注与 AnnotationSetCandidate 的 zod 定义。 |
| [src/core/contracts/capability-graph.ts](../files/src/core/contracts/capability-graph.ts.md) | 文件 | — | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [src/core/contracts/capability-manifest.ts](../files/src/core/contracts/capability-manifest.ts.md) | 文件 | — | 能力包 manifest 契约（schema "1"）：能力分类、节点角色、执行类型、输入/输出角色、校验器、知识引用与溯源字段的 Zod 定义及交叉约束。 |
| [src/core/contracts/control-selector.ts](../files/src/core/contracts/control-selector.ts.md) | 文件 | — | 定义 run、node、Gate、Decision、change 与各类 inspection 的选择器 Zod 契约，并给出控制族与检查族的展示名称。 |
| [src/core/contracts/graph-workspace.ts](../files/src/core/contracts/graph-workspace.ts.md) | 文件 | — | schema 2 工作区的核心契约集合：config、稳定 spec、run、节点实例、handoff 与启动命令的 Zod schema，并提供 frontmatter 解析与渲染。 |
| [src/core/contracts/project-change.ts](../files/src/core/contracts/project-change.ts.md) | 文件 | — | 项目变更契约：变更 frontmatter 状态机（draft → accepted/rejected/deferred/superseded → applied）与 sources/claims 增量操作记录的 Zod 定义。 |
| [src/core/contracts/project-path.ts](../files/src/core/contracts/project-path.ts.md) | 文件 | — | 路径安全词法规则 SSOT：安全相对路径、安全路径分量、规范绝对路径与禁止进入 researchspec/ 的项目相对路径。 |
| [src/core/contracts/stable-specs.ts](../files/src/core/contracts/stable-specs.ts.md) | 文件 | — | 稳定 spec 契约：project / sources / claims / manuscript 四类 spec 的 Zod schema、StableId 命名规则与 YAML frontmatter 解析入口。 |
| [src/core/contracts/workspace-format.ts](../files/src/core/contracts/workspace-format.ts.md) | 文件 | — | 工作区格式版本常量与 config.yaml schema 定义，锁定当前 schema 版本号与 WorkspaceFormatKind 判定类型。 |
| [src/core/runtime/annotation-provenance.ts](../files/src/core/runtime/annotation-provenance.ts.md) | 文件 | — | 校验候选批注集的原始来源真实有效：限制在私有工作根内、拒绝符号链接、比对字节哈希与来源片段，并返回读前置条件。 |
| [src/core/runtime/annotation-target.ts](../files/src/core/runtime/annotation-target.ts.md) | 文件 | — | 把批注目标落到实际 Markdown 上核对：章节标题必须唯一，块必须存在且哈希一致，引用必须在块内唯一出现并保持前后文。 |
| [src/core/runtime/boundary-path.ts](../files/src/core/runtime/boundary-path.ts.md) | 文件 | — | 边界交付物路径解析：拒绝绝对路径、越界、符号链接分量与 researchspec/ 内部路径，并在消费输入时校验存在性与可读性。 |
| [src/core/runtime/graph-run.ts](../files/src/core/runtime/graph-run.ts.md) | 文件 | — | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [src/core/runtime/graph-workspace-index.ts](../files/src/core/runtime/graph-workspace-index.ts.md) | 文件 | — | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [src/core/validation/parse.ts](../files/src/core/validation/parse.ts.md) | 文件 | — | JSON / JSONL / YAML 解析封装：失败时统一转为带文件路径与行号的阻塞诊断，而非抛出异常。 |
| [src/core/validation/types.ts](../files/src/core/validation/types.ts.md) | 文件 | — | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |
| [src/core/workspace/discover.ts](../files/src/core/workspace/discover.ts.md) | 文件 | — | 从显式路径或逐级向上查找最近的 schema 2 researchspec 工作区，返回可辨识的解析结果。 |
| [src/core/workspace/graph-discover.ts](../files/src/core/workspace/graph-discover.ts.md) | 文件 | — | 图工作区发现：在向上查找基础上提供 require 变体，把缺失、旧格式与非法路径直接转为异常。 |
| [src/core/workspace/layout.ts](../files/src/core/workspace/layout.ts.md) | 文件 | — | 定义 schema "2" 工作区的目录骨架与模板文件（config.yaml、工具安装清单、specs 下的 project/sources/claims/manuscript），并把模板转换为可创建的目录与文件条目。 |
| [src/core/workspace/path-boundary.ts](../files/src/core/workspace/path-boundary.ts.md) | 文件 | — | 路径边界守卫：要求 root 与 target 都是绝对路径、目标不逃逸根目录，并逐级 lstat 拒绝路径中的符号链接与非目录祖先。 |
| [src/core/workspace/templates.ts](../files/src/core/workspace/templates.ts.md) | 文件 | — | 工作区布局常量的 barrel 出口，把 getWorkspaceEntries 与各类文件名、必需目录清单统一再导出。 |
| [src/core/workspace/write-plan.ts](../files/src/core/workspace/write-plan.ts.md) | 文件 | — | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |
| [src/licensing.ts](../files/src/licensing.ts.md) | 文件 | — | 提供项目版权声明与 MIT 许可证正文的单一来源，供各 Skill 包在渲染 LICENSE 文件时引用。 |
| [src/review-workspace.ts](../files/src/review-workspace.ts.md) | 文件 | — | 交互式审阅工作台子系统的 barrel 入口，向上重导出 v1/v2 工作台、适配器、结果契约与冻结来源投影接口。 |
| [src/utils/fs.ts](../files/src/utils/fs.ts.md) | 文件 | — | 三个薄文件系统辅助：存在性判断、目录判断与可选文本读取，只把 ENOENT 视为正常缺失，其余错误照常抛出。 |
| [src/utils/json.ts](../files/src/utils/json.ts.md) | 文件 | — | 极小的 JSON 输出工具：把任意值以两空格缩进写入标准输出，供 CLI 各命令统一打印。 |

## 对其它分层的依赖

| 目标分层 | 边数 | 关系类型 |
| --- | --- | --- |
| [宿主与投递适配层](adapters.md) | 2 | imports×2 |
| [能力与插件目录层](capability-registry.md) | 2 | imports×2 |
| [ARSU 转换与 Skill 生成层](arsu-converter.md) | 1 | imports×1 |

## 被其它分层依赖

| 来源分层 | 边数 | 关系类型 |
| --- | --- | --- |
| [测试与验收夹具层](tests.md) | 42 | imports×42 |
| [能力与插件目录层](capability-registry.md) | 25 | imports×25 |
| [宿主与投递适配层](adapters.md) | 20 | imports×20 |
| [CLI 命令入口层](cli.md) | 20 | imports×20 |
| [厂商 Skill 转换与审计层](vendor-converters.md) | 18 | imports×18 |
| [ARSU 转换与 Skill 生成层](arsu-converter.md) | 11 | imports×11 |
| [评审批注与静态工作台层](review-workspace.md) | 6 | imports×6 |
| [维护工具链与工程基础设施](tooling.md) | 5 | imports×5 |
