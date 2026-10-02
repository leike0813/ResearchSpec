
# tests/helpers
> 目录聚合页：5 个文件、14 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [tests/helpers/cli.ts](../../files/tests/helpers/cli.ts.md) | 文件 | 2 | CLI 测试夹具：用 spawnSync 运行编译产物、解析 envelope 响应，并创建与清理临时项目目录。 |
| [tests/helpers/graph-workspace.ts](../../files/tests/helpers/graph-workspace.ts.md) | 文件 | 4 | 图谱测试夹具库：提供最小图谱样例、schema 2 基础工作区与运行目录的落盘助手，以及按图谱合成能力 manifest 的测试注册表。 |
| [tests/helpers/revision-master.ts](../../files/tests/helpers/revision-master.ts.md) | 文件 | 2 | revision-master 测试夹具：读取包内 Schema 的建表 DDL，并构造一个覆盖评语、线索、作用域、阻塞与策略卡的工作区样本。 |
| [tests/helpers/vendor-audit.ts](../../files/tests/helpers/vendor-audit.ts.md) | 文件 | 5 | vendor 审计测试的共享断言工具：检查固定源码是否初始化、执行只读 git 查询、枚举顶层 Skill、汇总仓库资源统计并校验证据路径安全可读。 |
| [tests/helpers/vendor-maintenance.ts](../../files/tests/helpers/vendor-maintenance.ts.md) | 文件 | 1 | 厂商锚点测试的共享断言：校验 manifest 的锚点身份、上游 revision 与文件数、raw Skill 与 capability/profile 计数、领域分布与工具文件一致性，维护文件哈希匹配，并实际执行对应厂商的 check 命令。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/review-workspace](../src/review-workspace.md) | 2 |
| [src/capabilities](../src/capabilities.md) | 1 |
| [src/core/contracts](../src/core/contracts.md) | 1 |
| [src/core/runtime](../src/core/runtime.md) | 1 |
| [src/vendor-audits](../src/vendor-audits.md) | 1 |
