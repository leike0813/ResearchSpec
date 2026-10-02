
# 符号目录

图谱共记录 1917 个节点。这里按类型、复杂度与标签聚合，便于从「形状」反查具体页面。

## 按节点类型

| 类型 | 数量 |
| --- | --- |
| 函数 | 1012 |
| 文件 | 387 |
| resource | 230 |
| 文档 | 227 |
| 配置 | 42 |
| 类 | 16 |
| pipeline | 2 |
| 表 | 1 |

## 按复杂度

| 复杂度 | 数量 |
| --- | --- |
| 简单 | 909 |
| 中等 | 704 |
| 复杂 | 304 |

## 按语言

| 语言 | 数量 |
| --- | --- |

## 高频标签

共 1490 个不同标签，下表列出前 40 个。

| 标签 | 节点数 |
| --- | --- |
| validation | 260 |
| test | 147 |
| tested | 138 |
| utility | 121 |
| cli | 116 |
| documentation | 115 |
| contract | 95 |
| histagent | 94 |
| entry-point | 70 |
| integrity | 69 |
| finrobot | 68 |
| vendor-converter | 61 |
| 校验 | 60 |
| replacement | 58 |
| hash | 56 |
| admission-decision | 45 |
| plugin | 45 |
| review-workspace | 44 |
| hashing | 42 |
| configuration | 41 |
| orchestration | 41 |
| security | 40 |
| converter | 39 |
| procedure | 39 |
| filesystem | 38 |
| markdown | 37 |
| parsing | 36 |
| registry | 35 |
| contract-anchor | 34 |
| diagnostics | 34 |
| excluded | 34 |
| rendering | 34 |
| fixture | 33 |
| literature-adapter | 33 |
| policy | 33 |
| arsu | 32 |
| audit | 32 |
| reporting | 32 |
| external-resource | 31 |
| 断言 | 30 |

## 被引用最多的复杂符号

下表列出复杂度标记为「复杂」且被其他节点引用最多的符号。

| 符号 | 类型 | 入边数 | 位置 | 摘要 |
| --- | --- | --- | --- | --- |
| [loadGraphWorkspaceIndex](symbols/src/core/runtime/graph-workspace-index.ts/loadGraphWorkspaceIndex.md) | 函数 | 13 | src/core/runtime/graph-workspace-index.ts:118–197 | 构建工作区只读索引：必需目录与文件、清单与 config、稳定 spec 交叉引用、profile、run、节点与变更，并汇总诊断。 |
| [createMaintenanceCommands](symbols/scripts/lib/vendor-maintenance.mjs/createMaintenanceCommands.md) | 函数 | 6 | scripts/lib/vendor-maintenance.mjs:150–265 | 为单个厂商组装 artifacts/records/baseline/check/diff 命令：baseline 强制语义审阅完成，check 逐字段比对锚点 manifest 与实时状态，diff 输出关键指纹变化。 |
| [evaluateGraphFrontier](symbols/src/core/runtime/graph-run.ts/evaluateGraphFrontier.md) | 函数 | 3 | src/core/runtime/graph-run.ts:319–450 | 综合节点实例、Gate/Decision 记录、并行组与子运行投影，得出当前可执行节点、待处理控制项与阻塞原因。 |
| [executeWritePlan](symbols/src/core/workspace/write-plan.ts/executeWritePlan.md) | 函数 | 3 | src/core/workspace/write-plan.ts:143–227 | 执行整批写入事务：先校验冲突与读前置条件，再写临时文件、备份原文件并原子改名，任一步失败即逆序回滚。 |
| [renderFinRobotCompleteTrees](symbols/src/vendor-converters/finrobot/complete-tree.ts/renderFinRobotCompleteTrees.md) | 函数 | 3 | src/vendor-converters/finrobot/complete-tree.ts:31–101 | 加载策略后按 Skill 契约排序渲染全部完整树，注入 LICENSE/NOTICE/DERIVATION 与共享支持库，并汇总出整组树哈希与审核状态。 |
| [sandboxCommand](symbols/scripts/dogfood/hosts.mjs/sandboxCommand.md) | 函数 | 2 | scripts/dogfood/hosts.mjs:74–128 | 构造 bubblewrap 沙箱命令：tmpfs 覆盖家目录，仅暴露运行时、ResearchSpec 构建产物、宿主凭据与本次证据，并重写 HOME/PATH/XDG 环境。 |
| [generateUpstreamManifest](symbols/src/arsu-converter/anchors/manifest.ts/generateUpstreamManifest.md) | 函数 | 2 | src/arsu-converter/anchors/manifest.ts:76–112 | 从 vendor/ars 读取当前 commit，筛选受审计根下的全部文件并并行生成清单条目，Markdown 额外抽取 frontmatter 与标题树，最终组装为 researchspec.arsu.upstream-manifest.v0。 |
| [authorCapabilityPackage](symbols/src/arsu-converter/authoring/author.ts/authorCapabilityPackage.md) | 函数 | 2 | src/arsu-converter/authoring/author.ts:86–225 | 能力包编写主流程：读取 extraction index 并拒绝未通过验证的产物，按声明落盘知识文件与包资源，构建 policy/script validators 与上游来源记录，最后写包并更新注册表。 |
| [convertArsu](symbols/src/arsu-converter/converter.ts/convertArsu.md) | 函数 | 2 | src/arsu-converter/converter.ts:34–113 | 完整转换流程：所有规划与冲突检查都在触碰生成目录之前完成，输出目录已存在且有漂移时要求显式 --force，随后按清单逐组 emit、写出根级投影文件并执行两阶段落盘与校验。 |
| [applyGraphWorkspaceProjection](symbols/src/cli/handlers/graph-bootstrap.ts/applyGraphWorkspaceProjection.md) | 函数 | 2 | src/cli/handlers/graph-bootstrap.ts:37–98 | 生成并提交整套工作区投影：校验既有清单、运行交付计划、写 config 与安装清单，冲突或阻塞诊断时整体放弃。 |
| [scanRuns](symbols/src/core/runtime/graph-workspace-index.ts/scanRuns.md) | 函数 | 2 | src/core/runtime/graph-workspace-index.ts:277–358 | 扫描每个 run 目录的 run/graph/handoff 与节点，并交叉校验目录名、冻结图哈希、profile 身份与 entry 声明。 |
| [planFile](symbols/src/core/workspace/write-plan.ts/planFile.md) | 函数 | 2 | src/core/workspace/write-plan.ts:46–103 | 比较目标文件的现状与期望内容，判定 create/skip-unchanged/skip-drift/refresh/conflict，并处理所有权、清单哈希与文件模式保护。 |
| [validatePluginRegistry](symbols/src/plugins/registry.ts/validatePluginRegistry.md) | 函数 | 2 | src/plugins/registry.ts:142–210 | 校验域分类、vendor 定义、Skill 清单与保留 ID 冲突，组装领域映射并收集诊断。 |
| [loadProcedureCatalog](symbols/src/procedures/catalog.ts/loadProcedureCatalog.md) | 函数 | 2 | src/procedures/catalog.ts:42–132 | 并行装载核心能力、图 profile 与插件扩展，再叠加 ARSU 路由与 Companion 工作流，构建 Procedure ID 到定义的映射。 |
| [renderEducationCompleteTrees](symbols/src/vendor-converters/education-agent-skills/complete-tree.ts/renderEducationCompleteTrees.md) | 函数 | 2 | src/vendor-converters/education-agent-skills/complete-tree.ts:41–91 | 加载生产策略与审计，渲染全部准入 Skill 的完整树并计算聚合哈希，是预览、转换与检查共用的唯一渲染源。 |
| [validateEvidenceMapAgainstAudit](symbols/src/vendor-evidence/education-agent-skills/index.ts/validateEvidenceMapAgainstAudit.md) | 函数 | 2 | src/vendor-evidence/education-agent-skills/index.ts:44–84 | 校验证据映射与审计在快照标识、哈希、声明总数、evidence ID 顺序和逐条声明字段上完全一致。 |
| [buildRevisionMasterPreviewCase](symbols/harness/revision-master-preview-data.ts/buildRevisionMasterPreviewCase.md) | 函数 | 1 | harness/revision-master-preview-data.ts:264–438 | 由同一组审稿意见常量推导出 in_progress 与 complete 两种预览用例：写出稿件、补充材料、CSV 与回复信文件，并生成 workbench 需要的数据库行。 |
| [currentState](symbols/scripts/arsu-maintenance.mjs/currentState.md) | 函数 | 1 | scripts/arsu-maintenance.mjs:359–403 | 汇总上游修订、抽取索引、registry 转换、parity 覆盖率与三份 HTML 审阅哈希，构成锚点状态。 |
| [writeRecords](symbols/scripts/arsu-maintenance.mjs/writeRecords.md) | 函数 | 1 | scripts/arsu-maintenance.mjs:179–357 | 渲染 ARS 锚点的五份记录文件，并保留已有人工填写的语义审阅。 |
| [resolveSelection](symbols/scripts/dogfood/lib.mjs/resolveSelection.md) | 函数 | 1 | scripts/dogfood/lib.mjs:119–155 | 把 CLI 参数、配置与场景目录解析为冻结选择：拒绝多宿主旧用法，校验行为宿主、适配器、模型、场景、验收人与各类并发/超时边界。 |
