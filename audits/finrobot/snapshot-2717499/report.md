# FinRobot `snapshot-2717499` 能力审计

## 范围与身份

本审计将官方 FinRobot 仓库绑定到提交
`2717499b8e30f242640af08c4ad9afd1113c2d45`（Git tree
`eee135451d83398acd925f061483f0c864331749`），作为 `snapshot-297a8d2` 之后的
下一吸纳候选。它覆盖全部 1,049 个已跟踪 Git 条目，包含 1,042 个普通文件、6 个可
执行文件和 1 个未初始化的 `FinNLP` gitlink。树内文件总计 45,380,198 字节。每个
普通文件与可执行文件都按原始字节计算 SHA-256（含二进制，不使用文本归一化）。

该修订首次包含 `SKILL.md`，但它们是第三方转存内容，不是 FinRobot 一手 Skill。
因此本审计同时清点 66 个既有来源绑定知识 surface、7 个本轮选中的新增
surface，以及 56 个 Anthropic 派生 Skill surface；**全部 56 个第三方 Skill 本轮均
不获准入**。

权威记录是 `capability-audit.json`。本报告总结审查决策，但不替代该记录，也不
授予生产准入。候选机器事实位于 `candidate-policies/`，全部绑定本审计的
SHA-256，审核状态为 `pending-human-review`。

| 项目 | 值 |
| --- | --- |
| 候选提交 | `2717499b8e30f242640af08c4ad9afd1113c2d45` |
| 候选 Git tree | `eee135451d83398acd925f061483f0c864331749` |
| 官方仓库 | `https://github.com/AI4Finance-Foundation/FinRobot.git` |
| 已跟踪条目 | 1,049（1,042 文件 + 6 可执行 + 1 gitlink） |
| 树内字节 | 45,380,198 |
| 知识 surface | 129（39 admitted + 90 excluded） |
| 候选能力 | 6 |
| 内容来源 | 8 |
| 许可声明 | 7 |

## 库存与字节校验

- 1,049 条 `source_entries` 与固定 tree 逐条一致：`path`、`git_mode`、
  `git_object_id` 全部匹配，普通文件与可执行文件的 `bytes` 与逐字节 SHA-256 匹配。
- `FinNLP` 保持未初始化 gitlink（`finrobot_autogen/FinNLP`，模式 `160000`，无
  `bytes`/`sha256`），本轮不初始化、不审计其内部内容。
- 库存按区域：根目录 9、`.github/` 1、`figs/` 11、`finrobot_autogen/` 71、
  `finrobot_desktop/` 893、`finrobot_equity/` 64。
- `summary` 的 `files`/`executables`/`gitlinks`/`file_bytes`/`knowledge_surfaces`/
  `content_origins`/`license_claims` 均由记录派生，并由独立校验脚本复算一致。

## 旧知识来源迁移

旧快照的 66 个 surface 来自 18 个源文件，全部保持相同 Git blob。除
`finrobot/functional/analyzer.py` 迁移为
`finrobot_autogen/finrobot/functional/analyzer.py`、`configs/*` 与 `finrobot/*`
迁移到 `finrobot_autogen/` 前缀外，其余路径原样保留。32 个已准入 surface 的语义
依据未变，旧排除项（`enhanced-executive-summary`、`equity-tagline`、
`valuation-simplified-dcf` 等）继续排除，未因目录迁移而改判。

迁移后的来源映射（部分）：

| 旧路径 | 新路径 | blob 不变 |
| --- | --- | --- |
| `finrobot/functional/analyzer.py` | `finrobot_autogen/finrobot/functional/analyzer.py` | 是 |
| `finrobot/agents/agent_library.py` | `finrobot_autogen/finrobot/agents/agent_library.py` | 是 |
| `configs/save_config_forecaster.json` | `finrobot_autogen/configs/save_config_forecaster.json` | 是 |
| `FinNLP` | `finrobot_autogen/FinNLP` | 是 |
| `finrobot_equity/core/src/modules/analyzer` 系列 | 原路径 | 是 |

## 新增选中知识 surface

从候选 `finrobot_desktop/finrobot/` 中静态阅读原文、依赖与边界后，选取 7 个
surface，符号均已在该固定快照中定位并逐字节核对：

| surface_id | 来源 | 符号 | 归属 | 实现类型 |
| --- | --- | --- | --- | --- |
| `valuation-comparability` | `engine/compute/operators/valuation_synthesis.py` | `synthesize_valuations` | relative-valuation | bundled-script |
| `valuation-ev-bridge` | `engine/compute/operators/audit/ev_bridge.py` | `audit_ev_bridge` | relative-valuation | bundled-script |
| `valuation-dcf-validity` | `engine/compute/operators/dcf.py` | `calculate_dcf` | relative-valuation | bundled-script |
| `statement-ttm-coverage` | `engine/compute/operators/audit/ttm_period.py` | `audit_ttm_period` | statement-analysis | bundled-script |
| `valuation-currency-caliber` | `engine/compute/operators/audit/currency_caliber.py` | `audit_currency_caliber` | statement-analysis | bundled-script |
| `statement-source-lineage` | `engine/data/validator.py` | `market_cap_consistency` | statement-analysis | bundled-script |
| `financial-numeric-evidence` | `engine/models/numeric_claim.py` | `NumericClaim` | company-fundamentals | agent-procedure |

说明：`statement-source-lineage` 的符号在源码中实际为 `market_cap_consistency`
（`validator.py:255`），审计采用真实符号，并记录“股数由同一 `market_cap/price`
倒算即弃权、不构成独立验证”的语义边界。`valuation-dcf-validity` 采用
`calculate_dcf`，其 `tg < WACC` 守卫是真实有效性规则；非正终值/权益不得作为负的
普通股公允价发布。

每个新增 surface 仅作为**算法与规则来源（evidence-only）**记录，不复制为运行时
资产：其 source-entry 决策的 `production_action = evidence-only`、
`output_assets = []`。完整解析与呈现仍由已审阅的 extension 脚本承接。

## 56 个 Anthropic 派生 Skill

`finrobot_desktop/skills/` 下 56 个 `SKILL.md`（另有 4 个测试 fixture）逐项登记为
知识 surface 并**排除**：

- 原始来源 revision 未固定：`UPSTREAM_VERSION.txt` 只记录转换时间与上游作者本机
  路径，无原始提交号。
- 许可声明冲突：`ATTRIBUTION.md` 声明 MIT，而上游项目 LICENSE 为 Apache-2.0；
  根 Apache-2.0 不能作为这批副本的分发依据。
- 资源闭包缺失：`scripts/convert_skills.py` 只抽取正文，正文引用的
  references/examples/assets 悬空，包不自包含。
- 独立 method/runtime/dataset 复用同样排除，不与转存正文一并准入。

因此这 56 个 surface 的 `content_origin_id = anthropic-derived`（blocked），
`disposition = exclude`，surface 决策 `reason_code = third-party-unverified-origin`。
对应 58 个 `skills/` 文件（含 `ATTRIBUTION.md`、`UPSTREAM_VERSION.txt`）全部为
`blocked-origin`，未复制进任何包。

## 来源、许可与再分发

内容来源（8）区分了可审阅的一手 Apache 证据、第三方转存与外部数据：

- `root-apache`、`native-desktop` 为 `reviewed` 生产来源（Apache-2.0）。
- `anthropic-derived`、`external-dataset-fixture`、`attributed-autogen`、
  `unclear-filings`、`unclear-marker`、`external-finnlp` 全部 `blocked`，
  **不能统一按 root-apache 认定可发布**。

The `external-dataset-fixture` origin covers the bundled Damodaran
`engine/data/datasets/` spreadsheets and the captured provider/`skills` fixtures
under `tests/fixtures/`; both are audit-only evidence with no in-tree
redistribution grant.

许可声明（7）覆盖新目录：`root-apache` 的 scope 已包含 `setup.py`、
`finrobot_desktop/LICENSE`、`finrobot_desktop/pyproject.toml`（旧 `setup.py` 的 MIT 元数据
冲突在本修订已消除）；新增 `anthropic-skills-attribution`（`conflicting`）与
`third-party-datasets-and-fixtures`（`unknown`）。

资源决策保持原内容，不新增 provider：外部证据仍只在宿主与目标 Agent 授权下通过
已配置工具取得，ResearchSpec 不引入 FX/数据 provider 包装层。

## 候选能力映射

六个候选能力 ID 保持不变，仅按新增 surface 扩展 `source_surface_ids`：

| 候选能力 | surface 数 | 新增 |
| --- | ---: | --- |
| `company-fundamentals-analysis` | 8 | `financial-numeric-evidence` |
| `competitive-position-analysis` | 2 | — |
| `corporate-risk-analysis` | 3 | — |
| `financial-news-impact-analysis` | 6 | — |
| `financial-statement-analysis` | 10 | ttm-coverage、currency-caliber、source-lineage |
| `relative-valuation-analysis` | 10 | comparability、ev-bridge、dcf-validity |

合计 39 个 admitted surface。候选能力与 surface 的自动阈值（如 2×/4× 分歧带、
固定价差）视为上游产品策略，记录为诊断可用，不作为 ResearchSpec 硬门禁。

## 证据限度

本审计建立了完整的**身份库存**（全部 1,049 条路径与逐字节哈希），但这不等价于
对 893 个 `finrobot_desktop/` 文件逐一完成语义或来源审查：

- 仅对 12 个既有准入来源与 7 个新增选中来源静态阅读了原文、依赖与边界。
- Desktop 运行时（Tauri/React、FastAPI、SQLite 存储、认证、secret store）、
  provider adapter、原生 pipeline runtime、LBO/DDM/SOTP/Monte Carlo 等方法、
  Damodaran 数据集与测试 fixture 只做审计，不进入任何分发包。
- 上游 README 中此前未被实现的断言改为本修订的观察：本修订确实实现了 DCF、
  WACC、DDM、LBO、Monte Carlo 与桌面 UI，旧“实现缺失”结论不再适用。

未执行上游代码、未安装依赖、未配置凭证、未运行上游测试、未访问外部服务。

## 本轮结论与下一步

**结论：既有六项能力的来源语义 preserved；新增 7 个 surface 为候选增量；56 个
转存 Skill 与外部数据集本轮不获准入。**

`candidate-policies/` 中的 fact 已绑定本审计 SHA-256；`admission` 与 `content_review`
均为 `pending-human-review`，`review.candidate` 为非空 pending 对象（`review_status`
为 `pending-human-review`，`tree_set_sha256` 已由维护者预览绑定），`review.published`
保留旧的已批准树 hash。**本报告不声明用户已审阅新候选树，也不授予发布批准。**

## 生产吸纳记录

沿用的 66 项 surface 中，部分 finding evidence 保留旧快照路径。它们是原观察的
历史引用：旧审计中的 Git blob 与 SHA-256 可唯一映射到当前 `finrobot_autogen/`
下的同字节文件。当前 source_entries、surface.source_path 和生产 derivation 均使用
新路径；审计验证同时检查历史来源对象与当前文件，保留获批审计 JSON 的原字节。

上述候选状态是批准前来源审计的记录。用户随后明确批准了完整树集合
`1a101495abecacbc702a8ce8fd3b376631b88e9cc45de3d9a216d6aaedb3a4c6`。
当前生产政策、raw/extension 包和 vendor pin 已切换到本修订，生产准入由 converter
八份 reviewed 政策和 `review-decision.json` 决定。批准记录见
[approval.json](artifacts/approval.json)，转换与验证结果见 [03-conversion.md](03-conversion.md)，
生产维护身份见 [manifest.json](manifest.json)。候选政策与产物保留批准前状态，
不会据此推定新的来源、第三方 Skill 或独立估值方法已获准入。
