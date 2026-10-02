
# src/core/contracts/graph-workspace.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/contracts](../../../../modules/src/core/contracts.md)
<!-- node: file:src/core/contracts/graph-workspace.ts -->

schema 2 工作区的核心契约集合：config、稳定 spec、run、节点实例、handoff 与启动命令的 Zod schema，并提供 frontmatter 解析与渲染。
源码：[src/core/contracts/graph-workspace.ts](../../../../../../src/core/contracts/graph-workspace.ts)

## 符号（4）
<!-- node: function:src/core/contracts/graph-workspace.ts:parseProjectChangeV2 -->
<!-- node: function:src/core/contracts/graph-workspace.ts:parseProjectSpecV2 -->
<!-- node: function:src/core/contracts/graph-workspace.ts:parseRunHandoff -->
<!-- node: function:src/core/contracts/graph-workspace.ts:renderRunHandoff -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| parseProjectChangeV2 | 函数 | 128–138 | 简单 | parsing、contract、frontmatter、project-change | 1 | 解析项目变更 frontmatter 与正文，并要求正文非空。 |
| [parseProjectSpecV2](../../../../symbols/src/core/contracts/graph-workspace.ts/parseProjectSpecV2.md) | 函数 | 84–92 | 简单 | parsing、contract、frontmatter、stable-specs | 2 | 切分 project.md 的 YAML frontmatter 与正文并按 schema 2 校验。 |
| [parseRunHandoff](../../../../symbols/src/core/contracts/graph-workspace.ts/parseRunHandoff.md) | 函数 | 298–306 | 简单 | parsing、handoff、frontmatter、contract | 2 | 解析 handoff.md 的 frontmatter 与正文并按 schema 校验。 |
| renderRunHandoff | 函数 | 288–291 | 简单 | serialization、rendering、handoff、contract | 1 | 把 handoff 契约对象序列化为 frontmatter 加正文的 Markdown 文本。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-graph.ts](capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [project-path.ts](project-path.ts.md) | src/core/contracts/project-path.ts | 路径安全词法规则 SSOT：安全相对路径、安全路径分量、规范绝对路径与禁止进入 researchspec/ 的项目相对路径。 |
| [stable-specs.ts](stable-specs.ts.md) | src/core/contracts/stable-specs.ts | 稳定 spec 契约：project / sources / claims / manuscript 四类 spec 的 Zod schema、StableId 命名规则与 YAML frontmatter 解析入口。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-bootstrap.ts](../../cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
| [graph-context.ts](../../cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts | list / show / handoff / pack / propose / archive 与项目变更 Decide 的处理器，基于工作区索引输出只读快照或有界写入。 |
| [graph-delivery.ts](../../plugins/graph-delivery.ts.md) | src/plugins/graph-delivery.ts | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [graph-run.ts](../runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [graph-security.test.ts](../../../tests/graph-security.test.ts.md) | tests/graph-security.test.ts | 验证安全边界：非法项目路径与符号链接组件被拒绝，无效安装清单在任何读取前阻断全部投影写操作，符号链接父目录下的投影不改动目标。 |
| [graph-workspace-index.ts](../runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| parseProjectChangeV2 | 函数 | 128–138 | 解析项目变更 frontmatter 与正文，并要求正文非空。 |
| [parseProjectSpecV2](../../../../symbols/src/core/contracts/graph-workspace.ts/parseProjectSpecV2.md) | 函数 | 84–92 | 切分 project.md 的 YAML frontmatter 与正文并按 schema 2 校验。 |
| [parseRunHandoff](../../../../symbols/src/core/contracts/graph-workspace.ts/parseRunHandoff.md) | 函数 | 298–306 | 解析 handoff.md 的 frontmatter 与正文并按 schema 校验。 |
| renderRunHandoff | 函数 | 288–291 | 把 handoff 契约对象序列化为 frontmatter 加正文的 Markdown 文本。 |
