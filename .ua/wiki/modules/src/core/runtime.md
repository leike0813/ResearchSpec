
# src/core/runtime
> 目录聚合页：5 个文件、38 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/core/runtime/annotation-provenance.ts](../../../files/src/core/runtime/annotation-provenance.ts.md) | 文件 | 2 | 校验候选批注集的原始来源真实有效：限制在私有工作根内、拒绝符号链接、比对字节哈希与来源片段，并返回读前置条件。 |
| [src/core/runtime/annotation-target.ts](../../../files/src/core/runtime/annotation-target.ts.md) | 文件 | 2 | 把批注目标落到实际 Markdown 上核对：章节标题必须唯一，块必须存在且哈希一致，引用必须在块内唯一出现并保持前后文。 |
| [src/core/runtime/boundary-path.ts](../../../files/src/core/runtime/boundary-path.ts.md) | 文件 | 3 | 边界交付物路径解析：拒绝绝对路径、越界、符号链接分量与 researchspec/ 内部路径，并在消费输入时校验存在性与可读性。 |
| [src/core/runtime/graph-run.ts](../../../files/src/core/runtime/graph-run.ts.md) | 文件 | 23 | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [src/core/runtime/graph-workspace-index.ts](../../../files/src/core/runtime/graph-workspace-index.ts.md) | 文件 | 8 | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/core/contracts](contracts.md) | 8 |
| [src/core/workspace](workspace.md) | 4 |
| [src/adapters](../adapters.md) | 2 |
| [src/capabilities](../capabilities.md) | 2 |
| [src/arsu-converter/revision](../arsu-converter/revision.md) | 1 |
| [src/core/validation](validation.md) | 1 |
