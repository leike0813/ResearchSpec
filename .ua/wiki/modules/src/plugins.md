
# src/plugins
> 目录聚合页：10 个文件、39 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/plugins/assembler.ts](../../files/src/plugins/assembler.ts.md) | 文件 | 2 | 中央插件注册表装配器：读取领域目录与 ANZSRC 2020 分类快照，合并 vendor-bundles 下的各 vendor bundle，校验后原子写出 registry.json。 |
| [src/plugins/domain-catalog.json](../../files/src/plugins/domain-catalog.json.md) | 配置 | 0 | 内部领域目录：预建全部 213 个学科领域与 5 个工具领域，字段含 domain_id、ANZSRC Group 编码、标题与 skills 归属。 |
| [src/plugins/extensions.ts](../../files/src/plugins/extensions.ts.md) | 文件 | 5 | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [src/plugins/graph-check.ts](../../files/src/plugins/graph-check.ts.md) | 文件 | 2 | 对工作区已选插件域做只读体检：域可用性、已投影文件哈希与能力清单一致性，全部收敛为结构化 Diagnostic。 |
| [src/plugins/graph-delivery.ts](../../files/src/plugins/graph-delivery.ts.md) | 文件 | 9 | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [src/plugins/graph-status.ts](../../files/src/plugins/graph-status.ts.md) | 文件 | 1 | 为 graph 工作区汇总插件状态视图：已选、可用、已投影域以及已解析与已投影的 capability/profile ID，注册表加载失败时降级为错误信息。 |
| [src/plugins/registry.ts](../../files/src/plugins/registry.ts.md) | 文件 | 10 | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [src/plugins/runtime-capabilities.ts](../../files/src/plugins/runtime-capabilities.ts.md) | 文件 | 1 | 按工作区已选插件域把扩展能力合并进基础能力注册表，产出运行时统一视图并保持能力 ID 有序。 |
| [src/plugins/status.ts](../../files/src/plugins/status.ts.md) | 文件 | 7 | 把插件配置与安装清单投影为 status 与 catalog 展示模型：域选择、解析快照、可用与已投影域，以及 Skill 级别的汇总条目。 |
| [src/plugins/taxonomy.ts](../../files/src/plugins/taxonomy.ts.md) | 文件 | 2 | ANZSRC 2020 Fields of Research 快照的 schema、加载校验与 Group 标题到领域 slug 的派生规则，是学科领域命名的唯一事实源。 |

## 子目录
- [taxonomy](plugins/taxonomy.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/adapters](adapters.md) | 4 |
| [src/core/contracts](core/contracts.md) | 4 |
| [src/core/runtime](core/runtime.md) | 4 |
| [src/core/validation](core/validation.md) | 4 |
| [src/capabilities](capabilities.md) | 3 |
| [src/core/workspace](core/workspace.md) | 3 |
| [src/adapters/companion](adapters/companion.md) | 1 |
| [src/arsu-converter/routing](arsu-converter/routing.md) | 1 |
| [src/core-skills](core-skills.md) | 1 |
| [src/literature-adapters](literature-adapters.md) | 1 |
