
# src/core/workspace/path-boundary.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/workspace](../../../../modules/src/core/workspace.md)
<!-- node: file:src/core/workspace/path-boundary.ts -->

路径边界守卫：要求 root 与 target 都是绝对路径、目标不逃逸根目录，并逐级 lstat 拒绝路径中的符号链接与非目录祖先。
源码：[src/core/workspace/path-boundary.ts](../../../../../../src/core/workspace/path-boundary.ts)

## 符号（1）
<!-- node: function:src/core/workspace/path-boundary.ts:assertPathWithinRoot -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [assertPathWithinRoot](../../../../symbols/src/core/workspace/path-boundary.ts/assertPathWithinRoot.md) | 函数 | 4–31 | 中等 | path-boundary、security、validation | 6 | 校验目标路径位于可信根目录之内，逐级拒绝符号链接与非目录祖先，违规时抛出 EWRITE_CONFLICT。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-delivery.ts](../../plugins/graph-delivery.ts.md) | src/plugins/graph-delivery.ts | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [graph-workspace-index.ts](../runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [legacy-reconciliation.ts](../../adapters/legacy-reconciliation.ts.md) | src/adapters/legacy-reconciliation.ts | 规划对旧宿主 Skill 目录与过时命令包装的安全清理：仅删除内容与已知 ResearchSpec 字节完全一致的树，其余一律保留并给出诊断。 |
| [managed-target.ts](../../adapters/managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [project-entry.ts](../../adapters/project-entry.ts.md) | src/adapters/project-entry.ts | 维护项目级研究入口协议：对共享标记区域或专用文件写入、移除与检查 Navigate 入口协议文本，在用户改动出现时保留内容并报告诊断。 |
| [write-plan.ts](write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [assertPathWithinRoot](../../../../symbols/src/core/workspace/path-boundary.ts/assertPathWithinRoot.md) | 函数 | 4–31 | 校验目标路径位于可信根目录之内，逐级拒绝符号链接与非目录祖先，违规时抛出 EWRITE_CONFLICT。 |
