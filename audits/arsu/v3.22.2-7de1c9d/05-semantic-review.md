# ARSU Anchor Semantic Review — v3.22.2-7de1c9d

## 审阅范围

2026-09-30，比较 ARS v3.21.1 (`127ff85e4bbfcdd10b95040537b6c6bd7ad17aeb`) 与正式发布版 v3.22.2 (`7de1c9dfb7af9c02a9b57750761323f35a743aa2`)。远端 annotated tag 的 peeled commit 与干净子模块一致；采用发布标签，不吸纳 main 后续未发布提交。完整源差异为 353 files、38,237 insertions、2,998 deletions，详见本目录 `06-incremental-update.md` 的逐文件清单。

120 个提取工件中 39 个更新（34 个正文变化，5 个仅来源切片行号/说明元数据变化），新增 KP-M2-09，80 个原有文件与 Git HEAD 字节一致，无删除。27 mode、38 个 ARS capability ID 和 core schemas 保持；academic-paper profile 为 draft/abstract 增加 intake 配置绑定，其余 profiles 不变。全部 registry 另含九个 own-vendor 能力，共 47。

读取三份审阅 HTML 的源文本、四个上游 SKILL、MODE_REGISTRY、变更 procedure、提取正文和生成 SKILL/knowledge；审阅证据不依赖模型执行实验。下表路径 `skills/capabilities/<id>/` 对应各能力，源 procedure 位于 `src/arsu-converter/authoring/procedures/m1..m5/`。每项原文与切片定位见 extraction index。

## 逐项语义判定

| 变更能力/范围 | 上游证据、不可丢失义务 | 转换后承载与判定 |
|---|---|---|
| 全部 38 个 ARS 能力 | 四个 SKILL、shared/ground_truth_isolation_pattern.md §2A；外部文本、工具返回与委派报告不能成为执行指令或授权 | adapted：author.ts 在 ARS 来源 Procedure 统一插入指令/数据边界；检索、手稿、引文、审稿意见和委派报告均覆盖。实际用户决定确定范围。上游 helper 路径不能证明工具可执行，缺失检查标记 not_checked |
| discovery-literature-search-screening、analysis-evidence-synthesis | literature_strategist_agent、synthesis_agent 新增 §2A；Claim Intent Manifest、Two-Layer Citation 切片移位 | preserved/adapted：既有检索与综合义务保留，统一边界补全；KP-M1-05/06 正文未改，只更新来源坐标 |
| generation-report-compilation | deep-research/agents/report_compiler_agent.md：writing diagnostics 是提示，缺失日期不能用 hedge 补证据 | adapted：SKILL Writing Quality Check 与 Temporal Integrity；不再用词汇禁用/破折号额度判定写作质量，材料缺口保留标记或归因/省略 |
| design-writing-intake | intake_agent Step 6、shared/output_language_pair.md：opaque registry token、one declaration site、pair/cardinality separate | adapted：SKILL Language & Abstract、PCR row；KP-M2-09 单源 registry；只有默认 zh-tw-en，不问只有一个答案的问题。省略保持省略，非法/冲突输入停止，普通配置/交换材料承载，不扩展 core schema |
| design-manuscript-structure-design | structure_architect_agent 字数分配、abstract_writing_guide regime table：Standard/Conference/Extended abstract/Dissertation、policy_brief 无摘要 | preserved/adapted：SKILL Word Count Allocation 引用 abstract-guide；新增 language-pair 与 abstract-guide 知识引用。正文预算与摘要预算分开，venue 优先，不再内联固定250字 |
| design-argument-blueprint | academic_writing_style、paper_structure_patterns 更新：表格是摘要预算事实源；段落形状仅辅助 | preserved：两个更新知识文件；论证、主张和证据程序无新增权限，统一数据边界生效 |
| generation-manuscript-drafting | draft_writer_agent：output_language_pair carry-forward、advisory acronym、缺证据不以hedge替代 | adapted：SKILL Writing Quality Check、Output Language Pair Carry-Forward；写作质量仅诊断，body/L1/L2 分开首用定义。普通交换材料原样带token，非法值显式失败；摘要长度读 abstract-guide，确定性缩略语检查缺失为not_checked |
| generation-abstract-writing | abstract_bilingual_agent、abstract_writing_guide：独立写作、registry语言角色、regime表、protected hedges、acronym scope | preserved/adapted：SKILL Output Language Pair、Length & Keyword Regime、Acronym Report；abstract-guide为数字唯一来源，language-pair为语言角色来源。pair不编码cardinality，稿件未出现的结果不补造，hedges不能为字数删除 |
| check-citation-format-compliance | citation_compliance_agent、apa7_chinese_citation_guide：中文笔画序/期刊规则、3+作者首用等、同年消歧、DOI观察 | adapted：SKILL Chinese Citation Special Checks、DOI Verification；新增APA中文知识。保留双作者、完整参考作者字段，笔画与相邻倒序须有证据；不确定不重排，DOI字符串不能证明解析成功或同一文献 |
| check-reference-integrity-verification | integrity_verification_agent §2A、shared/cross_model_verification：provider safety intervention 是 transport failure | adapted：统一数据边界；SKILL Cross-Model 记录 unavailable、不计agree/disagree；主机原生子代理的model/content/cost同意边界保留 |
| design-review-panel-config | field_analyst_agent §2A | adapted：统一边界，review-target与角色约束保持，不从手稿里的指令推导用户选择 |
| judgment-editorial-judgment | editor_in_chief_agent §2A；sprint_contract_protocol advisory attachment隔离 | preserved/adapted：统一边界与sprint-contract知识；advisory不能加入准则或改变裁决，eic角色范围不变 |
| judgment-specialist-review | sprint_contract_protocol 新增缩略语附件隔离 | preserved：sprint-contract知识；真实reviewer findings才形成条目，数值合成与既有角色限制不变 |
| judgment-devils-advocate-stress-test | devils_advocate_agent §2A、Concession Threshold切片移位、sprint_contract_protocol | preserved/adapted：统一边界、sprint-contract；DA不得受外部指令改变判定，KP-M3-05a正文未变 |
| judgment-review-synthesis | editorial_synthesizer_agent、sprint_contract_protocol：附件不进入decision/roadmap/criteria | adapted：SKILL Advisory Attachments；decision/consensus/roadmap仅来自reviewer输入，不将缩略语脚本输出伪装为评审意见 |
| check-pre-submission-self-check | re_review_mode_protocol：acronym attachment adds no criterion | adapted：SKILL verification-review第6项、re-review-protocol、sprint-contract；先冻结准则，附件不生成新问题或分支决定 |
| transform-revision-roadmap-parsing | revision_coach_agent：真实committee范围、Attachment: Acronym Check不解析意见 | adapted：SKILL Committee or institutional correspondence与Unusual Review Formats；期刊编辑、area chair、program committee留在peer review，不因名字含committee误选行政分支 |
| transform-revision-patching | revision_patch_protocol：真实当前授权；附件不成为patch或response | adapted：先验证当前接受的变更及CLI可见确认，再apply；summary/委派报告/引用ID不是授权。advisory read-only，不替代作者接受范围，integrity correction不带附件 |
| generation-format-rendering | formatter_agent §2A、journal_submission_guide更新 | preserved/adapted：统一边界与submission-guide；既有格式/提交材料合同保留，上游格式器一般摘要字数例外不升级为统一表事实源 |
| check-terminal-policy-gate | finalizer/submission-gate §2A；degradation_registry新增acronym状态 | preserved/adapted：统一边界及现有terminal-firm-rules；缩略语partial/not_checked仅为advisory，不成为终端Gate |
| 七个确定性checker能力 | degradation_registry.json新增检查覆盖状态/说明 | preserved：各包degradation-registry更新；现有派生计算与recompute validators未改，未直接执行上游脚本 |
| analysis-risk-of-bias-assessment | risk_of_bias_agent §2A | adapted：统一边界；RoB2/ROBINS-I与证据评估义务保持，不从外部文本领取指令 |
| transform-socratic-mentoring | socratic_mode_protocol：non-generation exit、Auto-End Conditions唯一阈值权威 | adapted：SKILL Rules要求独立行 `[SOCRATIC-NON-GENERATION-EXIT: explicit_user_request]`；仅明确要求AI提候选才能退出并标AI来源，不能记为用户INSIGHT。round/convergence不构成生成同意，源知识保持原文 |
| check-claim-faithfulness-audit | claim_ref_alignment_audit_agent：judge identity incl effort、unknown禁止cross-run hits | adapted：SKILL Cache lookup；实际caller identity不由节点选model，unknown只做本run去重，fallback后先更新identity，§2A覆盖judge读材料 |
| check-compliance-check | shared/agents/compliance_agent §2A | adapted：统一边界；学术完整性意见仍不授予伦理机构审批权 |
| check-collaboration-depth-observer | collaboration_depth_rubric：provider-neutral成本/能力表述 | preserved：更新rubric知识；不将provider等级或费用模板当实际model同意 |
| ARSU四个来源包 | academic-pipeline Run ledger and handoff check (#887)、acronym调用、routing_core新增 | adapted/removed：STATE-010独立替换run evidence义务，恢复STATE-007既有含义；runtime policy界定未发布helper不可执行。run ledger仅外部工作材料，CLI状态唯一权威；routing知识与原文保留不扩展公共CLI。实际模型/脚本效果未作经验验证 |

所有其余只受统一边界影响的能力（design-research-question-formulation、design-methodology-design、analysis-meta-analysis、generation-figure-generation、discovery-literature-monitoring、discovery-source-quality-grading）保留原来输出、方法和知识引用，判定 adapted（边界）/preserved（任务语义）。九个own-vendor能力不接受ARS统一插入，生成树保持。

## 独立复核与修复

原生子代理继承主代理模型，只读审查全部27mode并定位五项问题；主代理逐项修复并重新生成。修订授权前移到apply之前；draft/abstract增加optional `writing_configuration`角色并绑定intake；摘要按EN-only/zh-TW-only只执行对应写作/报告，双语对照对单语not applicable；STATE-011替换完整checkpoint步骤，runtime-policy替换state-machine两个ledger段；Socratic明确Procedure阈值覆盖原文冲突，探索模式收敛不自动结束。全部修复均从authoring/policy源生成，未手改生产正文。

## 27 mode 语义映射

| route | 主要承载能力或profile | 判定及证据摘要 |
|---|---|---|
| deep-research:full | research-main，RQ/methodology/search/grading/synthesis/report | preserved/adapted；统一数据边界与报告写作诊断 |
| deep-research:quick | search/grading/synthesis/report | preserved/adapted；快速检索与证据范围保持 |
| deep-research:review | editorial/devils-advocate/review-synthesis | adapted；研究文本角色与外部数据隔离 |
| deep-research:lit-review | search/evidence-synthesis | preserved；筛选与综合 |
| deep-research:three-way-scan | search/evidence-synthesis | preserved/adapted；WHY/HOW/WHAT与比较输出 |
| deep-research:fact-check | evidence-synthesis/claim-faithfulness | adapted；实际judge身份、证据核验 |
| deep-research:socratic | socratic-mentoring | adapted；非生成退出、明确阈值优先级 |
| deep-research:systematic-review | risk-of-bias/meta-analysis/search/synthesis/report | preserved/adapted；PRISMA/RoB/GRADE及材料边界 |
| academic-paper:full | academic-paper profile intake/structure/argument/draft/cite/abstract | adapted；intake配置现有角色传递、语言与cardinality分离 |
| academic-paper:plan | socratic-mentoring/structure-design | adapted；作者提问与统一摘要预算 |
| academic-paper:outline-only | structure-design/argument-blueprint | preserved/adapted；摘要预算引用事实源 |
| academic-paper:revision | revision-roadmap/revision-patching | adapted；授权先于应用，附件不作修订项 |
| academic-paper:revision-coach | revision-roadmap-parsing | adapted；真实委员会与peer review区别 |
| academic-paper:abstract-only | abstract-writing | adapted；单语分支、统一regime、可选配置输入 |
| academic-paper:lit-review | search/evidence-synthesis | preserved；手稿证据综合 |
| academic-paper:format-convert | format-rendering | preserved/adapted；现有格式投影 |
| academic-paper:citation-check | citation-format-compliance/reference-integrity | adapted；中文作者与DOI证据边界 |
| academic-paper:disclosure | format-rendering | preserved；政策与披露事实独立 |
| academic-paper:rebuttal-audit | revision-roadmap-parsing QA branch | adapted；仅QA，不回应脚本附件 |
| academic-paper-reviewer:full | reviewer profile panel/specialist/DA/editorial/synthesis | adapted；附件不参与决定与路线图 |
| academic-paper-reviewer:re-review | pre-submission-self-check verification branch | adapted；冻结准则，不纳附件 |
| academic-paper-reviewer:quick | editorial-judgment | adapted；eic显示名变化、角色保持 |
| academic-paper-reviewer:methodology-focus | specialist-review | preserved；方法准则范围 |
| academic-paper-reviewer:guided | specialist-review/socratic-mentoring | adapted；渐进对话 |
| academic-paper-reviewer:calibration | 现有近似review/check节点与来源协议 | gap（继承）；无专用实验校准能力，不宣称实测 |
| academic-pipeline:end-to-end | academic-pipeline profile/subgraphs/Gates/Decision | adapted；CLI authority，ledger描述替换 |
| academic-pipeline:resume_from_passport | mid-entry/passport-verifier/status/instructions | adapted/removed；不执行上游hash重放 |

## 非 preserved 锚点逐项判定

机器评估116项为107 preserved、2 converted_only、6 gap、1 flow；它只检测文本锚点，以下语义判断优先：

- reviewer full/quick `converted_only:EIC Review Report`：adapted。当前上游显示名为Journal-Fit Reviewer，内部角色及既有editorial_decision输出仍对应；不新增权限。
- calibration `gap:FNR`、`gap:FPR`、`gap:gold set`：gap，继承v3.21.1缺口。既有图无专用实验校准能力，近似节点不能提供冻结条件/隔离gold/重复panel/误差区间的完整实验。directional tier保持NOT_CALIBRATED。
- calibration `preserved:AUC`：removed语义。上游禁止对连续质量评分报告AUC；文字命中不代表应计算AUC。
- pipeline `flow:Stage 1 RESEARCH`：adapted/flow，由profile子图与正式Gate承接。`FINAL INTEGRITY`、`Process Summary`即使文字preserved，同样不授权节点编排。
- resume `gap:reset boundary`、`gap:awaiting_resume`、`gap:consumes_hash`：removed/adapted，继承既有设计。current run/node状态和status/instructions负责恢复，不实现ARS passport hash重放。
- abstract-only旧`5-7 keywords`/`150-300 words`锚点已过时：改为`Keywords per language`与`Abstract Length & Keyword Regime`，两端读取相同表；未改表来迎合旧数字。

## 流程权威检查

- `rg -n -i 'next-node|next.phase|agent.team|proceed to' skills/capabilities -g SKILL.md` 无命中。统一Completion只处理当前节点并读取status，profile/Gate/Decision承接流程。
- 契约锚点58、来源库存325；runtime-policy分类41（18 adapt、23 retain），reviewer checker closure 5。STATE-010/011的owner与目标路径显式声明，STATE-007保持既有reset/resume含义；state-machine ledger两段通过runtime policy替换。
- 四个ARSU入口unavailable boundary约束嵌套agent/reference/template。缩略语与ledger上游路径为描述性来源，不能触发执行/重建/安装。真实用户指令可以决定工作范围，第三方文本不能代替。
- 摘要数值和语言角色知识单源；manifest绑定knowledge hash，八个新增知识投影由authoring declarations拥有，不手改生成正文。

## 风险与遗留

reviewer calibration专用能力gap保留；本轮不执行模型校准实验，不宣称真实Agent能完全遵循新增提示。确定性缩略语算法不打包，语义检查与外部报告须披露自身覆盖；缺失执行为not_checked。ARS ledger重放未实现。格式器上游一般摘要额度仍为已记录例外，不能覆盖配置/venue及统一regime表。

用户授权“ARS的更新审计与增量吸纳”覆盖本轮范围；没有能力重命名/删除、依赖安装、公共CLI或schema变更。审计结论不是发布批准。

## 验证结果

最终实际命令、全量测试结果和新旧锚点差异见 `06-incremental-update.md`；生成清单本身不冒充执行证据。

- `UV_CACHE_DIR=/tmp/researchspec-uv-cache pnpm test`：稳定产物上412项全部通过，0失败。收尾统一默认语言措辞并消除探索模式的强制推进矛盾后，受影响authoring/parity/preset/maintenance/runtime-policy/extraction/anchors共26项全部通过，0失败。
- `pnpm check`、`pnpm lint`、`openspec validate update-ars-to-v3-22-2 --strict`、authored whitespace与`git diff --check`：通过。
- extraction 120 pass；两次authoring全树字节一致；raw ARSU convert/check/idempotence通过；58anchors/325files和runtime policy检查通过。
- packaged checker：七节点真实生成与提交、篡改拒绝、run完成通过；当前计算脚本未修改。
- review HTML：27个唯一mode panel；parity所有低覆盖/缺输出/flow-retained清单为空。旧锚点目录及80未变提取工件字节保持。

## 结论

declared-fit-with-notes。本轮发布版的语言配置、摘要统一规则、中文引文修复、缩略语advisory隔离、真实授权与指令/数据边界已进入现有承载路径。继承的calibration缺口、ledger运行时排除及未执行确定性缩略语检查明确披露；静态operational标签不能证明这些功能有运行证据。
