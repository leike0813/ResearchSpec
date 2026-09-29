# Own Vendor Anchor Semantic Review — paper-humanizer @ v2.9.1-1a31f2d

## 审阅范围

- `vendor/paper-humanizer` 上游 8 个文件（SKILL + review/full playbook + 2 references + 2 Python scripts）。
- 9 个 extraction artifacts（PH-CAP-01…05、PH-KP-01/02、PH-SCRIPT-01/02）。
- 4 个 capability packages 与 `paper-humanizer` graph profile。

## 逐项语义判定

| 上游语义 | 转换后承载 | 判定 | 证据 |
|---|---|---|---|
| 39-pattern taxonomy 与 invariants | `generation-humanization-reference` knowledge | preserved | PH-CAP-03 -> `knowledge/paper-humanizer-taxonomy.md` |
| Read-only review + coverage ledger + revision plan | `check-paper-humanization-review` | preserved | PH-CAP-01 -> review procedure |
| Plan approval before editing | `paper-humanizer-plan` Gate + plan-decision | adapted | graph profile 节点 `plan-gate` / `plan-decision` |
| Prose-only document artifact edits + analyze/validate/render | `transform-paper-humanization-revision` + `scripts/document_pipeline.py` | preserved | PH-CAP-04 + PH-SCRIPT-01 |
| Candidate verification + user acceptance | `check-paper-humanization-verification` + `paper-humanizer-acceptance` Decision | adapted | PH-CAP-05 -> verification procedure；graph `outcome` Decision 替代 Python acceptance gate |
| `full_workflow.py` state machine | graph revision template | adapted | 上游状态机保留为 extraction provenance，不再作为运行时流程权威 |

## 流程权威检查

- [x] capability SKILL 无 next-node / next-phase / agent-team orchestration。
- [x] plan/verification/acceptance 流程锚点由 graph profile 与 Gate/Decision 承接。
- [x] 打包 `document_pipeline.py` 已剥离提取头，可作为普通 Python 工具执行。

## 风险与遗留

- `full_workflow.py` 不再作为运行时状态机，仅保留 provenance；如未来发现 graph template 无法表达的协商路径，需新增 Decision。

## 按需激活复核（2026-09-14）

- 范围：4 个 paper-humanizer capability。逐包程序正文、输入输出、knowledge、validator、安全边界和 profile 保持原审阅结论；本轮语义变化只把固定 graph 完成动作改为服从 activation packet。
- Standalone packet 只允许返回 researchspec/ 外的普通输出路径，禁止 run、node、handoff、Gate、Decision、override 和 transition 写入；graph packet 才提供 owning handoff 与精确 advance selector。
- 生成路径与静态受审树均已核对；全库 47/47 core 与 332/332 extension 包含 mode-neutral Completion，旧 advance node:<run>/<node> Completion 为 0。该适配保留既有领域步骤和证据义务，未引入新的流程权威。

## 交互审阅工作区复核（2026-09-23）

- `check-paper-humanization-review` 与 `transform-paper-humanization-revision` 各自携带同一份 `review-workspace/index.html`；reference 与 verification 包不携带该资产。
- review procedure 将 revision plan 投影成 `review-workspace.v1`，revision procedure 只消费用户显式导出的 `review-workspace-result.v1`。稿件 SHA-256 与完整 item disposition 覆盖由共享契约校验。
- 静态页面只在浏览器本地保存草稿并导出 JSON，不写 `researchspec/`，不执行 revision，不确认 Gate/Decision，也不取代对话内审阅路径。生成后的 SKILL 与 manifest 对这些边界表述一致。

## 冻结审阅件复核（2026-09-29）

范围：frozen-document-review-workspace 实现后，2 个受影响 capability 的 authoring procedure
（procedures/paper-humanizer/review.md、revision.md）、由它们生成的 SKILL/manifest，以及随包
review-workspace 资产；另 2 个 paper-humanizer 包只做语义漂移核对。上游 extraction 9 artifacts 与
上游 8 文件本轮未变（02-ingestion.md 记录逐字节对上）。

### 受影响 capability 判定

| 上游语义 | 转换后承载 | 判定 | 证据 |
|---|---|---|---|
| review 工作流：只读诊断 + 保守 revision plan，绝不改稿（PH-CAP-01） | check-paper-humanization-review SKILL 正文与 knowledge | preserved | capabilities/01_review_workflow.md -> skills/capabilities/check-paper-humanization-review/SKILL.md；knowledge_refs 仍为 taxonomy/diagnostic/contract |
| 浏览器审阅原为计划输入的只读前置（旧文写“校验手稿 hash、按 v1 投影”） | review 过程句改写为：冻结源集于 researchspec/ 之外、准备 review-workspace.v2、逐次渲染前单独批准、批准后临时副本、转换不确定处显示 raw source、校验导出结果并比对当前源与冻结集、有变则展示差异并询问、无变则按 quote/context 定位且歧义时询问 | adapted | src/arsu-converter/authoring/procedures/paper-humanizer/review.md:73；生成 SKILL 同段保留“页面不改稿、不批准计划、回到 Gate/Decision” |
| revision 过程原为 eligible prose 与已验证候选的交互复核（旧文写“回查导出源 hash”） | revision 过程句改写为：冻结源集 + review-workspace.v2、批准后临时副本渲染、不可靠转换保留为 raw source、结果校验与源比对、有变/歧义时询问、请求变更进入新工作区标识且不带旧批注、页面不替代 verification 与 acceptance Decision | adapted | src/arsu-converter/authoring/procedures/paper-humanizer/revision.md:40；生成 SKILL 同段 |

两处改写保留原句的全部语义义务（只读、校验、返回 Gate/Decision、不替代验证），只把载体由 v1 投影换成冻结 v2 生命周期，并补齐渲染授权与源比对边界。判定为 adapted，不构成 removed 或 gap。

### review-workspace v2 / v1 资产

| 资产 | 断言 | 证据 |
|---|---|---|
| v2 页面 | 仅接受 review-workspace.v2（schema_version === '2'）；导入 v1 弹出 legacy 对话框并给出 ./v1.html 路由，不把 v1 转 v2；误导入导出结果给出提示 | review-workspace/index.html，SHA 505b1e769c5dab8528e668f20734c458da7a02d23af1196c428abed8b7ae1796 |
| v1 恢复页 | 与变更前 review-workspace/index.html（git HEAD）逐字节相同 | review-workspace/v1.html，SHA 5626313e33ccf67479c704d703e638f409367a6173ef1c639866b76f91a7dd09；diff (git show HEAD:review-workspace/index.html) review-workspace/v1.html 无差异 |
| 随包一致性 | 2 个受影响包各自携带同一份 index.html 与 v1.html，与根资产逐字节相同 | shasum 四份副本哈希均为 505b1e76… / 5626313e… |
| manifest 绑定 | knowledge_refs 新增 review-workspace-index.html（505b1e76…）与 review-workspace-v1.html（5626313e…），哈希与文件一致；SKILL Tools 段把两者描述为 advisory local static review surface，绝不拥有 workflow state | 两包 manifest.yaml / SKILL.md |

判定为 adapted：v2 承载直接的文档批注体验，v1 作为可恢复的旧契约原样留存，两版不混用。

### 流程权威检查

- [x] check-paper-humanization-review 与 transform-paper-humanization-revision SKILL 中 grep next node / next-phase / agent team / spawn / subagent 均无命中。
- [x] 页面只做 localStorage 草稿与下载式导出，无 fetch / XMLHttpRequest / eval / new Function；唯一 http:// 为 MathML 命名空间，不发起网络请求。
- [x] plan Gate 与 acceptance Decision 仍由 graph profile / instructions 承接（src/review-workspace/instructions.ts 宣告 review-workspace.v2 与 review-workspace-result.v2）。
- [x] generation-humanization-reference 与 check-paper-humanization-verification 未改动（git 工作区无变更），不携带 review-workspace 资产，knowledge_refs 未变。

### 风险与遗留

- review 包 section coverage 0.800，未覆盖 Contents、7. Full-mode structured payload、8. Deliver the review：均属 full-mode 路由/投递段，由 graph 与 router 承接，仍以 PH-CAP-02 保留为 provenance，非阻塞，沿用既有已接受结论。
- v2 页面含 FORMAL_ACTIONS 标记，仅用于展示 formal-action 目标，不写 researchspec/；如未来把展示升级为操作，需重新审阅其权威边界。
- 冻结源集捕获依赖 Agent 在上游侧完成；页面不校验源集完整性，该义务在 procedure 文本中已明确交给 Agent。

## 审阅场景与候选稿比较复核（2026-09-29）

- 本轮仍由 PH-CAP-01 的只读诊断生成保守方案。`check-paper-humanization-review` 将 finding ID、原始 locator、操作、风险、建议、预期效果和保留约束交给页面；显式显示位置只指向冻结渲染块，不改写证据 locator。判定 `adapted`，方案 Gate 与 Decision 仍独立确认。
- PH-CAP-04 的正文修改仍限于已批准计划与 eligible prose。`transform-paper-humanization-revision` 先执行 analyze/validate/render 与信息单元核对，再冻结本轮直接原文和候选稿；比较行逐块配对，左、右批注导出不同块 ID。无法可靠配对时显示来源片段。判定 `adapted`，浏览器比较不能替代候选稿验证或 acceptance Decision。
- 两包的 `review-workspace/index.html` 与根页面 SHA-256 均为 `9f52387ccb0fc0ebe3fc6cdd778f16d5c878f4ea500859e115e516d02ae0bffc`；`v1.html` 仍为 `5626313e33ccf67479c704d703e638f409367a6173ef1c639866b76f91a7dd09`。manifest、registry 与 parity 已由 authoring/maintenance 更新，4/4 paper-humanizer 包 operational，无知识或流程缺口。
- 阅读本轮两份生成 SKILL、source procedure 与页面脚本后，未见 browser 接管手稿、ResearchSpec 状态或 Gate/Decision 的入口。来源比对和歧义处理仍由 Agent 执行。

## 结论

declared-fit。冻结 v2 与保留 v1 的语义边界完整，2 个受影响 capability 的改写为 adapted 且保留原有证据与写入义务，无阻塞性 gap；未发现未受控的流程权威或语义漂移。
