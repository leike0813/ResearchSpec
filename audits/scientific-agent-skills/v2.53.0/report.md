# Scientific Agent Skills v2.53.0 供应商审计

## 执行摘要

ResearchSpec 对不可变的 `K-Dense-AI/scientific-agent-skills` 发布版本
`v2.53.0`（提交 `9c9bd2e92af12311ecd0c1a643e0931643f9ea04`）进行了审计。
机器可读的真实来源是 [`skill-audit.json`](./skill-audit.json)；本报告解释其证据，
但不授予生产准入资格。

源仓库包含 147 个顶层 Skills。其中 8 个被排除，因为它们是 Agent/运行时权威表面，
或带有禁止所需复制和派生的条款。在 139 个业务候选中，66 个因许可证或
Critical/High 安全审查而被阻止，64 个需要人工审核，9 个达到审计的
结构标准适配阈值。本次变更未安装任何 Skill，也未将其复制到生产 Skill 树
或添加到任何域。

该仓库作为第二供应商具有价值，因为它以本地 Python 包、定量方法、物理科学、
工程、可视化和实验室集成补充了 ToolUniverse。其生物医学、研究写作和证据发现
Skills 与 ToolUniverse 及 ResearchSpec 固定的 ARSU 表面高度重叠，
因此批量引入将产生冗余功能和不安全的工作流权威。

## 固定来源与清单

| 字段 | 审计值 |
| --- | --- |
| 仓库 | `https://github.com/K-Dense-AI/scientific-agent-skills` |
| 发布版本 | `v2.53.0` |
| 修订版 | `9c9bd2e92af12311ecd0c1a643e0931643f9ea04` |
| 根许可证 | MIT（`LICENSE.md`） |
| Skill 根目录数 | 147 |
| Skill 根目录下的文件数 | 1,468 |
| Skill 根目录下的字节数 | 19,783,777 |
| 具有 `references/` 的 Skills | 135 |
| 具有 `scripts/` 的 Skills | 70 |
| `scripts/` 下的文件数 | 387 |
| 具有 `assets/` 的 Skills | 24 |
| 符号链接数 | 0 |

审计清点的是顶层 `skills/<id>/SKILL.md` 根目录，而非 README 徽章声明
或浮动的默认分支。后续的 `main` 分支添加不在此发布范围内。上游
`docs/skills.md` 也存在目录漂移：`autoskill`、`nextflow` 和 `pacsomatic`
存在于源树中，但缺失或以过时的替代条目表示。其记录引用了该漂移，
而非默默采用替代标签。

## Open Agent Skills 与资源适配

所有 147 个入口文档都具有可解析的 YAML 前置元数据，且每个 `name`
都与其目录匹配。38 个无法在不进行适配的情况下通过当前的 ResearchSpec
前置元数据契约：

- 31 个使用嵌套的 `metadata.openclaw` 对象，而 ResearchSpec 接受字符串
  元数据值；
- 6 个使用数组形式的 `allowed-tools`（`deeptools`、`diffdock`、`gget`、
  `matplotlib`、`pennylane` 和 `rdkit`）；
- `experimental-design` 的描述长度为 1,035 个字符，超过 1,024 个字符的限制。

31 个 Skills 声明了非标准的顶层 `required_environment_variables` 字段。
适配器必须将这些要求移入受支持的 `compatibility` 元数据和清晰的散文说明中。
确定性扫描在 109 个条目中发现了安装、下载、克隆或包运行指令。
这些要求可以被记录，但 ResearchSpec 不得执行它们、配置凭据，
或声称仓库级的 `pyproject.toml` 锁定了每个 Skill 的依赖。

6 个 Skill 根目录包含入口文档中未明确披露的脚本：`gget`、`open-notebook`、
`opentrons-integration`、`pdf`、`phylogenetics` 和 `scvelo`。审计将此记录为
渐进式披露审查发现，而非执行资源以推断意图。

## 许可证审查

仓库根目录为 MIT，但 Skill 前置元数据包含 29 个不同的非空许可证表达式，
且通常描述的是底层包、服务或数据集，而非所编写的 Skill 内容。7 个 Skills
省略了该字段，10 个使用 `Unknown`。因此，审计将仓库根许可证
与已审查的 Skill 内容许可证分开。

机器结果如下：

| 状态 | Skills 数 | 含义 |
| --- | ---: | --- |
| `confirmed` | 111 | 存在可识别的宽松内容声明或相邻许可证 |
| `ambiguous` | 32 | 缺失、未知、专有、非商业、 copyleft、面向服务/包，或其他不明确情况 |
| `prohibited` | 4 | 相邻条款明确禁止所需的提取、保留、派生和重新分发 |

`docx`、`pdf`、`pptx` 和 `xlsx` 是硬性排除项，因为每个相邻的 `LICENSE.txt`
都禁止在管理服务协议之外进行复制、衍生作品和分发。`rowan` 是专有的，
`what-if-oracle` 声明了 CC BY-NC-SA 4.0，而 GPL/CeCILL 或缺失声明
仍被阻止，而非被乐观地标准化。后续的转换器必须为每个 admitted 派生作品
提供准确的 Skill 级许可证和 `NOTICE.md`。

## 安全与权威审查

固定的上游 `SECURITY.md` 报告了 877 个扫描器发现，包括 66 个 Critical
和 48 个 High 发现。其每个 Skill 的汇总表包含 667 个列表发现，
以及以下最高严重性分布：

| 最高严重性 | Skills 数 |
| --- | ---: |
| Critical | 21 |
| High | 20 |
| Medium | 25 |
| Low | 66 |
| Info | 1 |
| 无发现 | 14 |

上游将 106 个 Skills 标记为安全，包括具有 Medium 和 Low 发现的 Skills。
审计仅将该标签保留为上游证据。每个 Critical 或 High Skill 仍为
`blocked-review`，直到其详细发现与许可证、凭据、网络、文件写入和权威行为
一起被审查。

4 个非文档 Skills 被排除在域插件权威模型之外：

- `arbor` 持久化研究状态、调度执行器 Agent 和工作树，并拥有合并/门控行为；
- `autoskill` 收集屏幕历史、调用 LLM 后端、生成 Skills，并将它们提升到
  Agent 环境中；
- `pi-agent` 是第三方 Agent 运行时、SDK、RPC 和扩展平台；
- `get-available-resources` 写入平台特定的资源状态，不是域语义 Skill。

`bulk-rnaseq` 及类似的科学编排器只有在经过人工审核明确其提供语义指导
且不拥有 ResearchSpec 路由、状态、正式 Gates、Decisions、收据或子 Agent
调度后，才能保留为业务候选。

## ANZSRC 分类元数据

审计保留上游 `docs/skills.md` 的 34 个描述性类别作为来源证据，同时按统一的
ANZSRC 2020 FoR Field 合同记录学科元数据。130 个 Skills 有 primary Field，
并可列出 distinct additional Fields；17 个跨学科方法、元工作流或硬排除项没有
自然 primary Field，均记录明确的 `anzsrc_unclassified_reason`。

Field 仅用于审计，不自动创建或填充 domain。学科安装单元严格采用 ANZSRC Group，
工具型安装单元采用 ResearchSpec 的五类粗粒度目录；所有 direct membership 仍需在
source-neutral domain catalog 中单独审校。本次审计本身没有授予任何生产 membership；后续正式准入结果由独立 converter policy 与 conversion report 记录。

## 跨 Skill 关系

上游没有结构化的 Skill 依赖字段。本次审计记录了 22 个已审查的关系，
涵盖代表性的复合工作流，并区分了三种含义：

- `required`：源工作流将必需步骤委托给目标；
- `related`：目标是可选的辅助或兼容实现；
- `routing`：入口明确将不同的任务重定向到目标。

示例包括 `bulk-rnaseq` 的四个必需阶段、
`literature-review -> parallel-web`、`research-lookup -> parallel-web`
和 `scientific-writing -> research-lookup`。包名巧合不是依赖关系。
后续的转换器可能仅将已审查的 `required` 边复制到现有的递归注册表依赖图中。

## 与 ToolUniverse 和 ARSU 的重叠

与当前的 130 个 ToolUniverse Skills 或 8 个固定的 ARSU/Companion Skills
没有精确的 Skill ID 冲突，但语义重叠很大：

- `phylogenetics`、`bulk-rnaseq`、`pydeseq2`、`pathway-enrichment`、`scanpy`、
  `anndata` 和 `scvi-tools` 与 ToolUniverse 的基因组学和组学工作流重叠；
- `rdkit`、`datamol`、`deepchem`、`diffdock` 及相关包与 ToolUniverse 的
  小分子和药物发现工作流重叠；
- 临床、DepMap、成像、统计和数据库 Skills 与当前的转化和定量支持表面重叠；
- 文献综述、研究检索、科学写作、同行评审、假设生成和学术评估与固定的
  ARSU 工作流表面重叠。

后续的准入必须针对每个功能选择是保留 ToolUniverse、保留此来源、
以不同的执行模式保留两者，还是推迟。相似性本身不是同时安装两者的理由。

## 固定的适配器方向

后续引入变更必须使用以下架构：

```text
scientific-agent-skills 转换器 ──> 隔离的供应商 Skill 树 + 包清单
ToolUniverse 转换器 ─────────────> 隔离的供应商 Skill 树 + 包清单
                                    │
来源中立的域目录 ──────────────────┼──> 中央注册表装配器
                                    │       │
                                    └───────┴──> skills/plugins/registry.json
```

来源特定的转换器将审计作为其准入和策略输入，标准化前置元数据和兼容性，
应用已审查的资源处置，并且绝不执行来源资产。中央装配器防止一个转换器
覆盖另一个供应商，并给予域层对跨供应商成员资格的独有所有权。

注册表 Schema 1 已要求 Skill 级内容许可证值，同时保留供应商根许可证。
现有依赖字段支持硬传递闭包，central assembler 已与具体 vendor converter 解耦。
审计完成时尚未生成生产 bundle、registry vendor、domain membership 或安装表面。当前正式准入状态见 `skills/plugins/conversion-reports/scientific-agent-skills.md` 与 `docs/scientific_agent_skills_vendor_adapter.md`；机器审计继续作为不可变来源证据。

## 审计局限与建议

本审计是结构性、许可证、安全边界、依赖和打包证据。它不验证科学正确性、
执行代码、测试第三方服务或完成法律审查。

后续准入由单独 change 中的 Scientific Agent Skills 专用 converter 和完整逐项决策实施。转换器只能生成许可证、安全、内容、重叠、依赖、资源和 domain 结论全部明确的 Skills；本报告中的 readiness 与上游安全标签本身不构成准入。
