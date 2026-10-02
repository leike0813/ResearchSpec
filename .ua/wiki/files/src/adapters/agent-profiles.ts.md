
# src/adapters/agent-profiles.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/adapters](../../../modules/src/adapters.md)
<!-- node: file:src/adapters/agent-profiles.ts -->

为支持项目本地原生自定义 Agent 的宿主渲染 researchspec-executor 与 researchspec-reviewer 两个托管 profile 文件，按 frontmatter 或 TOML 两种宿主格式输出同一份 worker 契约。
源码：[src/adapters/agent-profiles.ts](../../../../../src/adapters/agent-profiles.ts)

## 符号（4）
<!-- node: function:src/adapters/agent-profiles.ts:renderAgentProfileFiles -->
<!-- node: function:src/adapters/agent-profiles.ts:renderContract -->
<!-- node: function:src/adapters/agent-profiles.ts:renderFrontmatter -->
<!-- node: function:src/adapters/agent-profiles.ts:renderToml -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [renderAgentProfileFiles](../../../symbols/src/adapters/agent-profiles.ts/renderAgentProfileFiles.md) | 函数 | 90–101 | 简单 | renderer、agent-profile、factory | 2 | 为单个宿主渲染两个角色的全部托管 profile 文件；宿主不支持原生 Agent 时返回空列表。 |
| renderContract | 函数 | 163–205 | 中等 | contract、prompt-text、worker-contract、authority | 0 | 生成两个角色共用的 worker 契约正文：激活条件、契约优先级、权限边界与固定返回简报。 |
| renderFrontmatter | 函数 | 132–148 | 中等 | renderer、yaml、frontmatter、host-adapter | 0 | 按 frontmatter 宿主渲染角色定义文件，组装 name/description/权限键与内联契约正文。 |
| renderToml | 函数 | 150–161 | 简单 | renderer、toml、escaping、host-adapter | 0 | 按 TOML 宿主渲染角色定义，promptRef 存在时改为引用外部 prompt 键并转义三引号。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [tools.ts](tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [agent-profiles.test.ts](../../tests/agent-profiles.test.ts.md) | tests/agent-profiles.test.ts | 校验 24 个 class-A 宿主上的两种受管 profile：50 个渲染文件的精确路径、角色契约、frontmatter/TOML/Vibe prompt 格式，以及不固定厂商模型的中立性。 |
| [delivery.ts](delivery.ts.md) | src/adapters/delivery.ts | 为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。 |
| [managed-target.ts](managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [renderAgentProfileFiles](../../../symbols/src/adapters/agent-profiles.ts/renderAgentProfileFiles.md) | 函数 | 90–101 | 为单个宿主渲染两个角色的全部托管 profile 文件；宿主不支持原生 Agent 时返回空列表。 |
