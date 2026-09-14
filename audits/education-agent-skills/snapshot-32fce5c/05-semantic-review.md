# Education Agent Skills Extension Anchor Semantic Review — snapshot-32fce5c

## 审阅范围

本锚点通过 `scripts/generate-education-agent-skills-extensions.mjs` 将 136 个
reviewed Education Agent Skills vendor-bundle Skills 一对一转换为
`plugin-education-agent-skills-*` extension capability packages + 一节点 graph profiles：

- 136 个 capability / 136 个 profile；
- 全部为静态 `execution_type: llm` package，`knowledge_refs: []`；
- 每个 package 只包含 manifest、完整 SKILL 正文和 `validate_education_brief.py`。

本审阅采用“全量机器审阅 + 分层抽样语义审阅”：
- 机器审阅覆盖全部 136 个 package 的 manifest/SKILL/profile/registry/domain 身份、
  hash 与 validator 绑定；
- Agent 阅读了 learning-science 类（adaptive-hint-sequence-designer）、
  student-learning 类（ai-claim-checker）与多个其他领域的代表 SKILL。

## 逐项语义判定

### 1. 全量转换规则（适用全部 136 个 package）

- 上游语义义务 1：每个 reviewed `SKILL.md` 正文必须完整保留。
  证据：生成器只替换 frontmatter 并在文末追加 ResearchSpec node contract；
  原正文中的 `researchspec-education-boundary` 块逐字保留。判定：`preserved`。
- 上游语义义务 2：evidence/authority/minors 三道 ResearchSpec 边界必须继续生效。
  证据：抽样 SKILL 中 `researchspec-education-boundary:start/end` 完整保留，
  未标记引用只具 identity verification 的提示保留。判定：`preserved`。
- 上游语义义务 3：不得引入脚本、references 或运行时依赖。
  证据：所有 manifest `knowledge_refs: []`；生成器对 vendor bundle 的
  SKILL/LICENSE/NOTICE 之外文件不做任何复制（该 vendor 恰好没有额外文件）。判定：`preserved`。
- 上游语义义务 4：每个 package 有明确输入/输出与证据门。
  证据：统一 `task_request`/`research_brief` 契约与六个 required brief fields。判定：`adapted`。
- 判定小结：136 个 package 均为 `preserved` + 一个统一 `adapted`，无 removed/gap。

### 2. learning-science 抽样：`plugin-education-agent-skills-adaptive-hint-sequence-designer`

- 上游语义义务：hint cascade 3–5 级、trigger conditions、bottom-out strategy、
  scaffolding 不剥夺学习认知工作。
  上游原文：“progressively more revealing hints... without bypassing the cognitive
  work that produces learning.”
  转换后承载：extension SKILL 正文完整保留；brief 六字段覆盖 scope/method/evidence/
  conclusions。判定：`preserved`。

### 3. student-learning 抽样：`plugin-education-agent-skills-ai-claim-checker`

- 上游语义义务：AI 输出视为 claim 而非 truth；三步 epistemic vigilance；
  minors/authority/evidence 边界。
  上游原文见边界块与 “treats AI output as a claim to evaluate, not truth to absorb.”
  转换后承载：extension SKILL 正文与边界块完整保留。判定：`preserved`。

### 4. 领域分配规则（适用全部 136 个 package）

- 上游语义义务：source-neutral domain catalog 是领域成员资格 SSOT。
  证据：`audits/education-agent-skills/catalog.json.extension_domains` 为
  `curriculum-and-pedagogy`（54）、`specialist-studies-in-education`（73）、
  `education-systems`（9）；maintenance check 逐 domain 对比 extension registry 子集。判定：`preserved`。

## 流程权威检查

- `grep -R -n -E 'next-node|next-phase|agent-team|proceed to next'`：0 hits。
- 每个 extension SKILL 的 Completion 只说明 submit 后查询 `researchspec status`。
- 上游 educational workflow 只留在 reviewed SKILL 正文；ResearchSpec 流程权威由
  每个 package 的一节点 graph profile 承接。
- 统一 validator 不导入也不执行任何资源。

## 风险与遗留

- 统一六字段 `research_brief` 契约是粗粒度证据门；education 领域后续可按
  teaching/learning/assessment/wellbeing 场景细化 schema。
- 136 个静态 package 的语义完整度依赖 reviewed SKILL 正文；任何后续精简必须
  经过维护 Skill 的 Agent 语义审阅并重新 baseline。
- CC-BY-SA-4.0 license 通过 manifest 字段承载；投影目标由 Agent 工具自行读取
  manifest/SKILL，不额外复制 LICENSE/NOTICE。

## 按需激活复核（2026-09-14）

- 范围：136 个 Education Agent Skills extension。逐包程序正文、输入输出、knowledge、validator、安全边界和 profile 保持原审阅结论；本轮语义变化只把固定 graph 完成动作改为服从 activation packet。
- Standalone packet 只允许返回 researchspec/ 外的普通输出路径，禁止 run、node、handoff、Gate、Decision、override 和 transition 写入；graph packet 才提供 owning handoff 与精确 advance selector。
- 生成路径与静态受审树均已核对；全库 47/47 core 与 332/332 extension 包含 mode-neutral Completion，旧 advance node:<run>/<node> Completion 为 0。该适配保留既有领域步骤和证据义务，未引入新的流程权威。

## 结论

`declared-fit-with-notes`：136 个 extension capability 一对一保留了 reviewed Education
Agent Skills 语义正文与 evidence/authority/minors 边界，统一证据 validator 全部绑定；
遗留项为后续 schema 领域化工作，不构成本锚点语义缺口。
