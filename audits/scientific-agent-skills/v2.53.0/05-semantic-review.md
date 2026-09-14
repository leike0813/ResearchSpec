# Scientific Agent Skills Extension Anchor Semantic Review — v2.53.0

## 审阅范围

本锚点通过 `scripts/generate-scientific-agent-skills-extensions.mjs` 将 49 个
reviewed Scientific Agent Skills vendor-bundle Skills 一对一转换为
`plugin-scientific-agent-skills-*` extension capability packages + 一节点 graph profiles：

- 49 个 capability / 49 个 profile；
- 18 个 package 含 `.py` 资源，`execution_type: mixed`；
- 31 个 package 无脚本资源，`execution_type: llm`；
- 410 个 reviewed 资源文件按原相对路径逐字节复制为 hash-bound knowledge refs，
  其中包括 TimesFM 的 4 个二进制示例资产（png/gif）。

本审阅采用“全量机器审阅 + 分层抽样语义审阅”：
- 机器审阅覆盖全部 49 个 package 的 manifest/SKILL/profile/registry/domain 身份、
  byte-level knowledge hash、资源 byte-identity 与 validator 绑定；
- Agent 阅读了无脚本资源型（aeon）、多 references 型（astropy）、脚本资源型
  （timesfm-forecasting）与二进制资产处理路径。

## 逐项语义判定

### 1. 全量转换规则（适用全部 49 个 package）

- 上游语义义务 1：每个 reviewed `SKILL.md` 正文必须完整保留。
  证据：生成器只替换 frontmatter 并在文末追加 ResearchSpec node contract；
  manifest provenance 绑定 raw SKILL 与全部资源 hash。判定：`preserved`。
- 上游语义义务 2：reviewed 资源路径继续有效，二进制示例资产可投影。
  证据：资源按原相对路径复制；extension registry loader 已改为 byte-level
  SHA-256 校验，png/gif 资源通过 hash 验证；maintenance check 逐文件 byte-identical。判定：`preserved`。
- 上游语义义务 3：bundled scripts 必须保持 inert。
  证据：raw SKILL 的 “Bundled scripts: ResearchSpec distributes these reviewed
  inert resources but does not run them” 保留；manifest 只把 `.py` 列为
  knowledge ref，唯一执行的是 `advance` 的 `validate_scientific_brief.py`。判定：`preserved`。
- 上游语义义务 4：每个 package 有明确输入/输出与证据门。
  证据：统一 `task_request`/`research_brief` 契约与六个 required brief fields。判定：`adapted`。
- 判定小结：49 个 package 均为 `preserved` + 一个统一 `adapted`，无 removed/gap。

### 2. 无脚本资源型抽样：`plugin-scientific-agent-skills-aeon`

- 上游语义义务：aeon 1.x API 版本边界、任务适用条件与 ResearchSpec boundary。
  上游原文：“Examples target aeon 1.x... import paths differ from aeon 0.x/sktime-era code.”
  转换后承载：extension SKILL 正文完整保留；11 个 references 按原路径打包；
  `execution_type: llm`。判定：`preserved`。

### 3. 脚本资源型抽样：`plugin-scientific-agent-skills-timesfm-forecasting`

- 上游语义义务：preflight 系统检查与 forecast 脚本的副作用/依赖披露、inert distribution。
  上游原文见 “Bundled scripts” 与 workflow。
  转换后承载：脚本按原路径打包为 knowledge refs；二进制示例输出（png/gif）
  经 byte-level hash 校验并投影；`execution_type: mixed`。判定：`preserved`。

### 4. 领域分配规则（适用全部 49 个 package）

- 上游语义义务：source-neutral domain catalog 是领域成员资格 SSOT。
  证据：`audits/scientific-agent-skills/catalog.json.extension_domains` 由
  `src/plugins/domain-catalog.json` 中 `scientific-agent-skills-*` skills 推导；
  maintenance check 逐 domain 对比 extension registry 子集。判定：`preserved`。

## 流程权威检查

- `grep -R -n -E 'next-node|next-phase|agent-team|proceed to next'`：0 hits。
- 每个 extension SKILL 的 Completion 只说明 submit 后查询 `researchspec status`。
- 上游 workflow/tool 编排留在 reviewed SKILL 正文与资源中；ResearchSpec 流程权威
  由每个 package 的一节点 graph profile 承接。
- 统一 validator 不导入也不执行 packaged 脚本或二进制资源。

## 风险与遗留

- 统一六字段 `research_brief` 契约是粗粒度证据门；Scientific Agent Skills 覆盖
  从量子模拟到 lab automation 的广泛领域，后续 schema 正式化时应按领域细化。
- 18 个 mixed package 的脚本依赖由目标 Agent 的用户配置环境满足；ResearchSpec
  不安装、不探测、不执行这些依赖。
- byte-level knowledge hash 是本次为二进制资源引入的加载器改进；已有 text
  knowledge refs 的 hash 语义不变，需在后续 OpenSpec spec 中持续保证。

## 按需激活复核（2026-09-14）

- 范围：49 个 Scientific Agent Skills extension。逐包程序正文、输入输出、knowledge、validator、安全边界和 profile 保持原审阅结论；本轮语义变化只把固定 graph 完成动作改为服从 activation packet。
- Standalone packet 只允许返回 researchspec/ 外的普通输出路径，禁止 run、node、handoff、Gate、Decision、override 和 transition 写入；graph packet 才提供 owning handoff 与精确 advance selector。
- 生成路径与静态受审树均已核对；全库 47/47 core 与 332/332 extension 包含 mode-neutral Completion，旧 advance node:<run>/<node> Completion 为 0。该适配保留既有领域步骤和证据义务，未引入新的流程权威。

## 结论

`declared-fit-with-notes`：49 个 extension capability 一对一保留了 reviewed
Scientific Agent Skills 语义正文、inert 脚本边界、二进制示例资产与领域分配，
统一证据 validator 全部绑定；遗留项为后续 schema 领域化工作，不构成本锚点语义缺口。
