
# src/core/contracts/project-path.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/contracts](../../../../modules/src/core/contracts.md)
<!-- node: file:src/core/contracts/project-path.ts -->

路径安全词法规则 SSOT：安全相对路径、安全路径分量、规范绝对路径与禁止进入 researchspec/ 的项目相对路径。
源码：[src/core/contracts/project-path.ts](../../../../../../src/core/contracts/project-path.ts)

## 符号（2）
<!-- node: function:src/core/contracts/project-path.ts:isSafeProjectRelativePath -->
<!-- node: function:src/core/contracts/project-path.ts:isSafeRelativePath -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| isSafeProjectRelativePath | 函数 | 23–27 | 简单 | path-safety、validation、security、utility | 1 | 在安全相对路径基础上额外拒绝 researchspec/ 顶层命名空间。 |
| isSafeRelativePath | 函数 | 8–13 | 简单 | path-safety、validation、security、utility | 0 | 检查词法层面的安全 POSIX 相对路径：拒绝反斜杠、NUL、绝对路径、盘符与 . / .. 分段。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [boundary-path.ts](../runtime/boundary-path.ts.md) | src/core/runtime/boundary-path.ts | 边界交付物路径解析：拒绝绝对路径、越界、符号链接分量与 researchspec/ 内部路径，并在消费输入时校验存在性与可读性。 |
| [graph-security.test.ts](../../../tests/graph-security.test.ts.md) | tests/graph-security.test.ts | 验证安全边界：非法项目路径与符号链接组件被拒绝，无效安装清单在任何读取前阻断全部投影写操作，符号链接父目录下的投影不改动目标。 |
| [graph-workspace.ts](graph-workspace.ts.md) | src/core/contracts/graph-workspace.ts | schema 2 工作区的核心契约集合：config、稳定 spec、run、节点实例、handoff 与启动命令的 Zod schema，并提供 frontmatter 解析与渲染。 |
| [installations.ts](../../adapters/installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [managed-target.ts](../../adapters/managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| isSafeProjectRelativePath | 函数 | 23–27 | 在安全相对路径基础上额外拒绝 researchspec/ 顶层命名空间。 |
| isSafeRelativePath | 函数 | 8–13 | 检查词法层面的安全 POSIX 相对路径：拒绝反斜杠、NUL、绝对路径、盘符与 . / .. 分段。 |
