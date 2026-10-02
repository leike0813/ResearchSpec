
# loadGraphWorkspaceIndex
<!-- node: function:src/core/runtime/graph-workspace-index.ts:loadGraphWorkspaceIndex -->

构建工作区只读索引：必需目录与文件、清单与 config、稳定 spec 交叉引用、profile、run、节点与变更，并汇总诊断。
类型：函数  
复杂度：复杂  
入边数：13  
标签：index、workspace、validation、orchestration  
所属文件：[src/core/runtime/graph-workspace-index.ts](../../../../../files/src/core/runtime/graph-workspace-index.ts.md)
源码：[src/core/runtime/graph-workspace-index.ts:118](../../../../../../../src/core/runtime/graph-workspace-index.ts#L118)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [applyGraphWorkspaceProjection](../../../cli/handlers/graph-bootstrap.ts/applyGraphWorkspaceProjection.md) | src/cli/handlers/graph-bootstrap.ts:37–98 | 生成并提交整套工作区投影：校验既有清单、运行交付计划、写 config 与安装清单，冲突或阻塞诊断时整体放弃。 |
| [handleGraphArchive](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:176–188 | 校验变更状态可归档后把目录移动到 changes/archive 之下。 |
| [handleGraphChangeDecision](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:190–203 | 记录项目变更的人类决定（接受/拒绝/推迟/取代），只改 frontmatter，不触碰稳定 spec。 |
| [handleGraphHandoff](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:110–135 | 无 --input 时渲染当前 run handoff，否则按语义输入改写并交由 run 写入层提交。 |
| [handleGraphList](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:28–69 | 列出 procedures、tools、profiles、runs、nodes、changes 或 diagnostics，支持词法查询与基于集合指纹的分页游标。 |
| [handleGraphPack](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:137–156 | 按 scope 选取文件并生成确定性 ZIP 上下文包，已存在输出需 --force 才覆盖。 |
| [handleGraphPropose](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:158–174 | 创建项目变更目录与 change.md，按 --with 生成 design/tasks/delta 支撑文档。 |
| [handleGraphShow](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:71–108 | 按 procedure/profile/run/node/change 选择器输出单个精确对象的完整内容。 |
| [selectPackFiles](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:205–230 | 按 all/specs/profiles/runs/changes 或 run:/change: 前缀从索引中筛选可打包文件。 |
| [handleGraphPluginInstall](../../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:82–114 | 要求显式领域 ID 与非交互下的 --yes，把选定领域投影进当前工作区。 |
| [handleGraphPluginUninstall](../../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:116–144 | 从工作区选择中移除领域并重新投影，未安装的 ID 直接报错。 |
| [handleGraphPluginUpdate](../../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:146–174 | 刷新已安装领域，缺省时刷新全部，并先校验所选领域当前可用。 |
| [handleGraphStatus](../../../../../files/src/cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts:67–141 | 只读输出图谱运行状态：工作区校验、运行索引、插件状态视图与当前 frontier 摘要。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [validateManagedTarget](../../../adapters/managed-target.ts/validateManagedTarget.md) | src/adapters/managed-target.ts:58–62 | 在解析结果之上追加词法与符号链接边界检查，作为任何目标读取前的统一前置。 |
| [parseProjectChangeV2](../../../../../files/src/core/contracts/graph-workspace.ts.md) | src/core/contracts/graph-workspace.ts:128–138 | 解析项目变更 frontmatter 与正文，并要求正文非空。 |
| [parseProjectSpecV2](../../contracts/graph-workspace.ts/parseProjectSpecV2.md) | src/core/contracts/graph-workspace.ts:84–92 | 切分 project.md 的 YAML frontmatter 与正文并按 schema 2 校验。 |
| [parseRunHandoff](../../contracts/graph-workspace.ts/parseRunHandoff.md) | src/core/contracts/graph-workspace.ts:298–306 | 解析 handoff.md 的 frontmatter 与正文并按 schema 校验。 |
| [scanChanges](../../../../../files/src/core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts:425–461 | 扫描活动与已归档的项目变更目录，限制包内文档集合并解析 change frontmatter。 |
| [scanGraphProfiles](scanGraphProfiles.md) | src/core/runtime/graph-workspace-index.ts:199–231 | 扫描 profiles 目录中的 YAML profile，检测重复 profile_id 并在无有效 profile 时报错。 |
| [scanRuns](scanRuns.md) | src/core/runtime/graph-workspace-index.ts:277–358 | 扫描每个 run 目录的 run/graph/handoff 与节点，并交叉校验目录名、冻结图哈希、profile 身份与 entry 声明。 |
| [assertPathWithinRoot](../../workspace/path-boundary.ts/assertPathWithinRoot.md) | src/core/workspace/path-boundary.ts:4–31 | 校验目标路径位于可信根目录之内，逐级拒绝符号链接与非目录祖先，违规时抛出 EWRITE_CONFLICT。 |
