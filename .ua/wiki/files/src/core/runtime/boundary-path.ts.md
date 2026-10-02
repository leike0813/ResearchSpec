
# src/core/runtime/boundary-path.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/runtime](../../../../modules/src/core/runtime.md)
<!-- node: file:src/core/runtime/boundary-path.ts -->

边界交付物路径解析：拒绝绝对路径、越界、符号链接分量与 researchspec/ 内部路径，并在消费输入时校验存在性与可读性。
源码：[src/core/runtime/boundary-path.ts](../../../../../../src/core/runtime/boundary-path.ts)

## 符号（3）
<!-- node: class:src/core/runtime/boundary-path.ts:BoundaryPathError -->
<!-- node: function:src/core/runtime/boundary-path.ts:isPathWithin -->
<!-- node: function:src/core/runtime/boundary-path.ts:resolveBoundaryPath -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| BoundaryPathError | 类 | 14–19 | 简单 | error-contract、path-safety、class、security | 0 | 边界路径解析失败时抛出的错误，携带可判定的细分错误码。 |
| [isPathWithin](../../../../symbols/src/core/runtime/boundary-path.ts/isPathWithin.md) | 函数 | 88–91 | 简单 | path-safety、utility、read-only、security | 2 | 纯词法判断目标是否位于根目录之内。 |
| resolveBoundaryPath | 函数 | 21–70 | 复杂 | path-safety、security、validation、async | 0 | 解析边界交付物路径，按 use 区分仅校验与实际消费，逐类拒绝分隔符、越界、绝对路径与 researchspec 内部路径。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [project-path.ts](../contracts/project-path.ts.md) | src/core/contracts/project-path.ts | 路径安全词法规则 SSOT：安全相对路径、安全路径分量、规范绝对路径与禁止进入 researchspec/ 的项目相对路径。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [annotation-provenance.ts](annotation-provenance.ts.md) | src/core/runtime/annotation-provenance.ts | 校验候选批注集的原始来源真实有效：限制在私有工作根内、拒绝符号链接、比对字节哈希与来源片段，并返回读前置条件。 |
| [graph-run.ts](graph-run.ts.md) | src/core/runtime/graph-run.ts | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [graph-security.test.ts](../../../tests/graph-security.test.ts.md) | tests/graph-security.test.ts | 验证安全边界：非法项目路径与符号链接组件被拒绝，无效安装清单在任何读取前阻断全部投影写操作，符号链接父目录下的投影不改动目标。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| BoundaryPathError | 类 | 14–19 | 边界路径解析失败时抛出的错误，携带可判定的细分错误码。 |
| [isPathWithin](../../../../symbols/src/core/runtime/boundary-path.ts/isPathWithin.md) | 函数 | 88–91 | 纯词法判断目标是否位于根目录之内。 |
| resolveBoundaryPath | 函数 | 21–70 | 解析边界交付物路径，按 use 区分仅校验与实际消费，逐类拒绝分隔符、越界、绝对路径与 researchspec 内部路径。 |
