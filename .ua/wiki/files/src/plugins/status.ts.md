
# src/plugins/status.ts
所属分层：[能力与插件目录层](../../../layers/capability-registry.md)  
所属目录：[src/plugins](../../../modules/src/plugins.md)
<!-- node: file:src/plugins/status.ts -->

把插件配置与安装清单投影为 status 与 catalog 展示模型：域选择、解析快照、可用与已投影域，以及 Skill 级别的汇总条目。
源码：[src/plugins/status.ts](../../../../../src/plugins/status.ts)

## 符号（7）
<!-- node: function:src/plugins/status.ts:buildResolutionSnapshots -->
<!-- node: function:src/plugins/status.ts:pluginCatalogItem -->
<!-- node: function:src/plugins/status.ts:pluginCatalogSummaryItem -->
<!-- node: function:src/plugins/status.ts:pluginStatusSummary -->
<!-- node: function:src/plugins/status.ts:skillItem -->
<!-- node: function:src/plugins/status.ts:skillSummaryItem -->
<!-- node: function:src/plugins/status.ts:unavailablePluginCatalogItem -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| buildResolutionSnapshots | 函数 | 25–31 | 简单 | plugin、status、resolution、snapshot | 0 | 为给定域集合构建域解析快照，包含域版本与去重后的已解析 Skill ID。 |
| pluginCatalogItem | 函数 | 47–62 | 中等 | plugin、status、catalog | 0 | 把单个域投影为 plugin list 的目录条目，包含类型、ANZSRC 元数据与 Skill 数量。 |
| pluginCatalogSummaryItem | 函数 | 64–79 | 中等 | plugin、status、catalog | 0 | 生成 catalog 列表中的域摘要条目，含选择状态与可用状态。 |
| pluginStatusSummary | 函数 | 33–45 | 中等 | plugin、status、projection | 1 | 生成 status 使用的插件摘要：已选、可用、不可用、已投影域与已解析 Skill。 |
| skillItem | 函数 | 106–122 | 中等 | plugin、status、catalog、skill | 0 | 把 Skill 投影为目录条目，含类型、所属域与 vendor 归属。 |
| skillSummaryItem | 函数 | 124–133 | 简单 | plugin、status、summary、skill | 0 | 生成 Skill 汇总条目，用于紧凑的域级状态展示。 |
| unavailablePluginCatalogItem | 函数 | 90–104 | 中等 | plugin、status、catalog、recovery | 0 | 为缺失或已空的域生成不可用恢复态的目录条目，提示需卸载或重新填充。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [installations.ts](../adapters/installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [registry.ts](registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-status.ts](graph-status.ts.md) | src/plugins/graph-status.ts | 为 graph 工作区汇总插件状态视图：已选、可用、已投影域以及已解析与已投影的 capability/profile ID，注册表加载失败时降级为错误信息。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| buildResolutionSnapshots | 函数 | 25–31 | 为给定域集合构建域解析快照，包含域版本与去重后的已解析 Skill ID。 |
| pluginCatalogItem | 函数 | 47–62 | 把单个域投影为 plugin list 的目录条目，包含类型、ANZSRC 元数据与 Skill 数量。 |
| pluginCatalogSummaryItem | 函数 | 64–79 | 生成 catalog 列表中的域摘要条目，含选择状态与可用状态。 |
| pluginStatusSummary | 函数 | 33–45 | 生成 status 使用的插件摘要：已选、可用、不可用、已投影域与已解析 Skill。 |
| unavailablePluginCatalogItem | 函数 | 90–104 | 为缺失或已空的域生成不可用恢复态的目录条目，提示需卸载或重新填充。 |
