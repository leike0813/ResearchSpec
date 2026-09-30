# ToolUniverse 上游增量审计：v1.3.1 → v1.5.4

## 结论与范围

截至 2026-09-30T14:26:11.492Z，最新稳定发布为 [v1.5.4](https://github.com/mims-harvard/ToolUniverse/releases/tag/v1.5.4)。本轮按用户请求追踪上游并完成增量审计，目标是生产准入前的影响分析。生产 pin、现有 catalog/registry、130 个 raw Skills、130 个 extension 和 profiles 保持原状态。

建议以 v1.5.4 的不可变 commit 作为下一次吸纳候选，处理下列确认缺口后再执行转换。main 的未发布提交单独列出，不混入目标。当前目录不是已固化生产锚点：没有目标 manifest.json，也未运行 artifacts/records/baseline 来重新认证旧状态。

## 上游身份

| 对象 | 版本/分支 | 完整 commit | Git tree |
|---|---|---|---|
| 生产基线 | v1.3.1 | 9b7ff91ddb45b567cac2fa8ea31b82851e877617 | 5672746698c5e56aca2add9570e714209c3b307d |
| 稳定目标 | v1.5.4 | 8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06 | c5e125db35e4667f5597871f964aae90eadc531f |
| 追踪 main | main | 164aaf1e7822a30d4229a933b1f718bb6c122c43 | 未作为准入目标 |

目标 commit 时间：2026-09-27T05:56:12+00:00。目标相对基线有 474 个提交；main 比目标多 10 个提交，观测 HEAD 时间 2026-09-30T08:39:57-04:00。

主要来源：[稳定版本发布](https://github.com/mims-harvard/ToolUniverse/releases/tag/v1.5.4)、[不可变提交比较](https://github.com/mims-harvard/ToolUniverse/compare/9b7ff91ddb45b567cac2fa8ea31b82851e877617...8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06)、本机原始 Git objects。获取发生在临时 bare repo，未切换项目分支或子模块。

## 库存与直接影响

| 项目 | 结果 |
|---|---:|
| Git 自动识别重命名的 diff | 3,414 文件；+431,861 / -176,788 行 |
| 按路径、关闭重命名的完整库存 | 3,425 路径；2,055 修改、1,355 新增、15 删除 |
| Top-level Skills | 150 → 185 |
| 新增 / 删除 Skill | 35 / 0 |
| 已准入能力的直接变化 / 文件未变 | 33 / 97 |
| 已准入目录内变动文件 | 39：38 发布来源 + 1 已排除测试 |
| 发布来源：SKILL / reviewed resource | 24 / 14 |
| Reviewed 资源未变 | 334 / 348 |
| 已排除旧 Skill 有变化 | 4，维持排除建议 |

两个文件总数采用不同重命名口径；JSON 按真实前后路径/blob 列出 3,425 项，可重现 --no-renames 结果。39 个 admitted 目录内变动没有新增或删除资源，14 个资源变化均为 Markdown；已 reviewed 的 Python 资源本轮无直接文件变化。文件未变不表示调用的外部工具行为未变。

| raw Skill | extension / profile | SKILL 变动 | reviewed 发布来源变化 |
|---|---|---|---|
| tooluniverse-admet-prediction | plugin-tooluniverse-admet-prediction | 是 | 1 |
| tooluniverse-adverse-event-detection | plugin-tooluniverse-adverse-event-detection | 否 | 1 |
| tooluniverse-antibody-engineering | plugin-tooluniverse-antibody-engineering | 是 | 1 |
| tooluniverse-binder-discovery | plugin-tooluniverse-binder-discovery | 是 | 1 |
| tooluniverse-cell-line-profiling | plugin-tooluniverse-cell-line-profiling | 是 | 1 |
| tooluniverse-comparative-genomics | plugin-tooluniverse-comparative-genomics | 是 | 1 |
| tooluniverse-dataset-discovery | plugin-tooluniverse-dataset-discovery | 是 | 1 |
| tooluniverse-drug-regulatory | plugin-tooluniverse-drug-regulatory | 是 | 1 |
| tooluniverse-drug-research | plugin-tooluniverse-drug-research | 否 | 1 |
| tooluniverse-ecology-biodiversity | plugin-tooluniverse-ecology-biodiversity | 是 | 1 |
| tooluniverse-epidemiological-analysis | plugin-tooluniverse-epidemiological-analysis | 是 | 1 |
| tooluniverse-epigenomics | plugin-tooluniverse-epigenomics | 是 | 1 |
| tooluniverse-gene-enrichment | plugin-tooluniverse-gene-enrichment | 否 | 2 |
| tooluniverse-literature-deep-research | plugin-tooluniverse-literature-deep-research | 是 | 2 |
| tooluniverse-molecular-cloning | plugin-tooluniverse-molecular-cloning | 是 | 1 |
| tooluniverse-multiomic-disease-characterization | plugin-tooluniverse-multiomic-disease-characterization | 否 | 2 |
| tooluniverse-neuroscience | plugin-tooluniverse-neuroscience | 是 | 1 |
| tooluniverse-phylogenetics | plugin-tooluniverse-phylogenetics | 是 | 1 |
| tooluniverse-plant-genomics | plugin-tooluniverse-plant-genomics | 是 | 1 |
| tooluniverse-precision-oncology | plugin-tooluniverse-precision-oncology | 否 | 2 |
| tooluniverse-product-safety-surveillance | plugin-tooluniverse-product-safety-surveillance | 是 | 1 |
| tooluniverse-protein-interactions | plugin-tooluniverse-protein-interactions | 否 | 1 |
| tooluniverse-protein-structure-prediction | plugin-tooluniverse-protein-structure-prediction | 是 | 1 |
| tooluniverse-rare-disease-diagnosis | plugin-tooluniverse-rare-disease-diagnosis | 否 | 1 |
| tooluniverse-rare-disease-genomics | plugin-tooluniverse-rare-disease-genomics | 是 | 1 |
| tooluniverse-regulatory-genomics | plugin-tooluniverse-regulatory-genomics | 是 | 1 |
| tooluniverse-regulatory-variant-analysis | plugin-tooluniverse-regulatory-variant-analysis | 是 | 1 |
| tooluniverse-sequence-analysis | plugin-tooluniverse-sequence-analysis | 是 | 1 |
| tooluniverse-spatial-transcriptomics | plugin-tooluniverse-spatial-transcriptomics | 是 | 1 |
| tooluniverse-statistical-modeling | plugin-tooluniverse-statistical-modeling | 否 | 1 |
| tooluniverse-structural-proteomics | plugin-tooluniverse-structural-proteomics | 是 | 1 |
| tooluniverse-target-research | plugin-tooluniverse-target-research | 否 | 1 |
| tooluniverse-variant-interpretation | plugin-tooluniverse-variant-interpretation | 是 | 2 |

完整变化路径、Git blob、前后 mode、既有 file disposition、capability 映射及 97 个文件未变能力见 [upstream-delta.json](artifacts/upstream-delta.json)。

## 已确认的语义变化与缺口

1. **退役接口不能只靠 Skill diff 查出。** CLUE 的五个工具和 EBI eQTL Catalogue 的两个工具移入 broken_apis，默认配置已停用。cell-line-profiling 已删 CLUE 建议；epigenomics-chromatin 正文未改，仍在第 165/237 行建议 eQTL 主路径和 fallback。后者是确认的间接 gap。证据：[停用 eQTL](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/src/tooluniverse/default_config.py#L1077)、[停用 CLUE](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/src/tooluniverse/default_config.py#L1300)。这是上游代码声明，未访问数据库验证服务状态。
2. **FAERS 返回分页对象。** 目标要求读取 reports/count/total_available/truncated，不能将一页 count 当总体，也不能凭 serious 工具名假设结果仅含严重病例。除直接变动的 adverse-event-detection，还复核了文件未变的 pharmacovigilance、drug-repurposing、clinical-trial-design：其参数示例已有 drug_name/reaction 或 limit=500 等与目标契约不符的旧问题，不能作为这次新引入的回归；升级时仍需统一处理。证据：[目标声明](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/src/tooluniverse/data/fda_drug_adverse_event_detail_tools.json#L300)、[未变旧示例](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-clinical-trial-design/WORKFLOW_DETAILS.md#L142)。
3. **Reactome 数值与过滤含义变化。** gene-enrichment、multiomic-disease-characterization 将 coverage 与 pathway size fraction 分开，并禁止按大小比值排序。target-research 不再建议 species 参数；实际 schema 仍列出 species/types，但声明不支持，目标实现显式拒绝该 endpoint 的非空过滤参数。不能描述为 schema 删参或静默丢过滤。证据：[参数说明](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/src/tooluniverse/data/reactome_tools.json#L323)。
4. **本地环境和可选服务扩展。** ADMET 新增 tooluniverse[ml] 安装/doctor 建议；protein-structure-prediction 新增付费、异步 Boltz；AlphaGenome、Folklore、Genomic Intelligence、Noodle/Exa 扩大可选外部服务路径。保留业务能力，同时通过受审适配维持环境、服务、费用、数据和凭证边界。
5. **分析方法改变。** phylogenetics 按指标选择 alignment，RCV 使用未裁剪数据，gap percentage 区分列与残基，PhyKIT 多列输出须声明列约定。regulatory-variant-analysis 新增序列预测 triage/deep-dive 和 sequence-model-supported, annotation-silent 层级，必须保留无 key 的完整 annotation 路径及预测证据边界。
6. **文档纠错不等于接口退役。** ChEMBL、STRING、ClinGen、FAERS 的若干旧名称，以及 SASBDB_download_data，在基线和目标工具声明中都不存在。本轮删除/更正文档应记录为修正不可兑现的指导，不能据此虚构真实 API 删除事件。

逐能力 2–5 项语义义务、preserved/adapted/removed/gap 与不可变原文位置见 [05-semantic-review.md](05-semantic-review.md)。

## 工具目录的间接影响

对 src/tooluniverse/data 下 JSON 静态声明（排除 broken_apis）统计得到 2,769 → 2,971 个唯一名称：209 新增、7 移出、837 条已有声明变化；其中 671 条参数结构变化，742 条参数文本变化。结构比较去掉 description/title/examples/$comment 并排序 object keys，仍包含默认值；因此默认 operation 增补也算变化，并非全部破坏性变更。112 个现有 capability 有名称匹配信号，具体调用是否受影响需结合语义证据判断。

此统计不是运行时注册表验证：不保证所有非归档声明都已启用、不解析所有 response schema、不执行 Python 实现、不探测服务。JSON 同时列出来源路径和前后 parameter 摘要 hash，供逐工具复核；上述确认问题另以原文和实现定位支撑。

## 新增 35 个 Skill 的范围决策

30 个 setup-*-remote-tool、host-and-share-remote-tool、tooluniverse-antigravity-plugin，共 32 个，建议排除：其主要行为是部署、安装、凭证、连接或宿主插件操作。agents/openai.yaml 等平台配置不进入研究能力包。

| 新增业务 Skill | 预审建议 | 理由与后续决策 |
|---|---|---|
| tooluniverse-biomedical-fact-lookup | defer | 有数据库事实核查价值，但“必须查询”与变异题建议凭模型推理存在内部冲突；最大 p 值被默认解释为最显著、PubTator 共现被当作特定数据库关系的替代证据，需要先适配。 |
| tooluniverse-gene-liability | candidate-not-admitted | 可作为研究性风险分析候选；覆盖率、缺失值和实验建议有明确契约。0–100 分数、阈值及权重是上游启发式，不能作为已验证安全指标；需评估与 target-research/toxicology 重叠。 |
| tooluniverse-nih-funding-landscape | candidate-not-admitted | 适合作为资金与研究政策分析候选；须独立审阅资源、OpenNIH 服务条件和内容许可，区分经验案例与验证事实。live verifier/evals 属维护验证资源，不能仅因在 scripts/ 下便转入生产包。 |

candidate-not-admitted/defer 是本轮建议，未改变任何生产准入、领域成员或硬依赖。三个候选都需要源文件/内容许可/资源/交叉依赖/ARSU 重叠和 ANZSRC Group 决策；root LICENSE 本轮未变不能自动证明新增嵌入内容许可。全部新增目录及逐项理由已列入 JSON。

## 未发布 main 的跟踪结果

- 164aaf1e7822a30d4229a933b1f718bb6c122c43 2026-09-30T08:39:57-04:00 Fix: regenerate the static lazy registry and pin it to its generator (#675)
- e34e567c34df7a884ee99b74286b032f01e6444c 2026-09-30T07:43:48-04:00 Docs: state the macOS 14 requirement on Apple Silicon (#674)
- ce754c58bb9638a4ec557bc3413cf766a9119405 2026-09-30T05:34:10-04:00 Stop a domain noun from becoming a verb when one more tool is registered (#673)
- 9e687cef8479de1e106d9d776fc9a13b4a33bd11 2026-09-30T05:34:00-04:00 Fix: notes that invited the wrong reading of an approved indication (#672)
- e128dfb87b0bf3b5168b9015a2234d47a616f107 2026-09-30T05:33:42-04:00 Feature: gather a drug-target profile from several databases in one call (#671)
- 820f1f8f2220fa0ad67512b7dbeca387c3ed80b7 2026-09-29T02:11:29-04:00 Fix: listing metadata that had drifted away from the catalogue (#670)
- d176908f52327991907bcd884a0ca475c51c41f8 2026-09-29T00:29:39-04:00 Fix: validation errors named an array index instead of the parameter (#669)
- 0e45bc20cc6b8ec3234604f48e25a4fff06563b2 2026-09-29T00:29:24-04:00 Fix: correct the MCPB manifest licence and listing metadata (#667)
- f5c37eebebb9a9eb8672a66e9edb51e66f33e4ca 2026-09-27T06:00:12-04:00 Fix: let the bundle install on Python 3.14 (#666)
- 5cdef3b95040adb8a4f685c1fa576ea3338f3fed 2026-09-27T05:39:29-04:00 Fix: republish the bundle when it installs an older release than this one (#665)

这 10 个提交修改 38 个路径，没有 skills/ 变化。包含 target-profile 聚合工具、注册表、bundle/目录元数据和参数验证修正；本轮记录这些动向，不混入 v1.5.4 的准入范围。main 是本次观测的快照，未来追踪重新取 remote HEAD。

## 验证与产出

- 当前基线：node scripts/tooluniverse-maintenance.mjs check v1.3.1 → OK。
- pnpm check、pnpm lint → 通过（当前代码库，非目标转换验收）。
- 当前 130 个正文（忽略正文外围空行）、name、execution type、profile hash、validator 模板及 348 个 resource hash/byte-copy 只读校验 → 通过。
- 本轮 JSON 库存覆盖、33 个直接变化能力唯一映射、每能力 2–5 义务、35 个新增 Skill 分类、原文锚点、生产元数据前后 hash 一致性 → 校验通过。
- 未运行上游脚本、模型、验证服务、live verifier、安装命令或 packaged resources；目标尚未转换，因此不宣称目标全量 pnpm test/graph 验收通过。

机器证据：artifacts/upstream-delta.json，SHA-256 `7bcb2a25284ac816fc93e8dbe80622d23f86a8a549633b5eb407e07b32616f40`。本报告与逐能力语义记录是新建审计文件，旧 v1.3.1 审计工件未刷新。

## 后续吸纳范围

若实施更新，先确认是否纳入三个新增业务候选，并修订目标版本 immutable audit、已变 dependency decisions 和 reviewed 适配；再 pin 目标子模块、更新 converter/generator 的版本输入、生成 raw bundle 与受影响 extension/profile/registry/catalog，完成目标测试和语义审阅后创建新 manifest。97 个直接文件未变能力不能批量重写；确认的间接 gap 应加入受影响集合。

现有维护脚本、generator 和 converter 含 v1.3.1 revision、数量及 audit 路径假设，不能把目录名换为 v1.5.4 后运行 baseline 就视为已更新。新源目录 185 项必须有明确准入/排除事实，新增工具提及也不自动成为硬依赖。此前抽样式旧锚点语义证据不足的事实保留为证据限制，未替本轮未改能力补写虚构审阅。
