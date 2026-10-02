
# src/core/workspace
> 目录聚合页：6 个文件、13 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/core/workspace/discover.ts](../../../files/src/core/workspace/discover.ts.md) | 文件 | 2 | 从显式路径或逐级向上查找最近的 schema 2 researchspec 工作区，返回可辨识的解析结果。 |
| [src/core/workspace/graph-discover.ts](../../../files/src/core/workspace/graph-discover.ts.md) | 文件 | 2 | 图工作区发现：在向上查找基础上提供 require 变体，把缺失、旧格式与非法路径直接转为异常。 |
| [src/core/workspace/layout.ts](../../../files/src/core/workspace/layout.ts.md) | 文件 | 2 | 定义 schema "2" 工作区的目录骨架与模板文件（config.yaml、工具安装清单、specs 下的 project/sources/claims/manuscript），并把模板转换为可创建的目录与文件条目。 |
| [src/core/workspace/path-boundary.ts](../../../files/src/core/workspace/path-boundary.ts.md) | 文件 | 1 | 路径边界守卫：要求 root 与 target 都是绝对路径、目标不逃逸根目录，并逐级 lstat 拒绝路径中的符号链接与非目录祖先。 |
| [src/core/workspace/templates.ts](../../../files/src/core/workspace/templates.ts.md) | 文件 | 0 | 工作区布局常量的 barrel 出口，把 getWorkspaceEntries 与各类文件名、必需目录清单统一再导出。 |
| [src/core/workspace/write-plan.ts](../../../files/src/core/workspace/write-plan.ts.md) | 文件 | 6 | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/core/runtime](runtime.md) | 2 |
| [src/utils](../utils.md) | 2 |
