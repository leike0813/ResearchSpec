# Response to Reviewers

> 本文件回应 `benchmark/partial-manuscript.md` 一文收到的审稿意见。审稿意见按 partial-manuscript.md 自列的缺失章节与 `claims.yaml` 中的 strength/limits 推得；不联网，不补造引用或参与者信息。

---

## R1（major）稿件缺 Methods / 证据筛选章节，读者无法复现证据来源

**回应**：新增 Methods and evidence-selection limitations 一节（见 `revised-manuscript.md` §Methods and evidence-selection limitations），写明三类材料的入选理由、排除标准与各自 `limits`。所有 claim 编号（CLM-01/02/03）均与 `claims.yaml` 中记录的 source_id 一一对应。

**稿件改动**：在 Introduction 与 Preliminary findings 之间新增 Methods and evidence-selection limitations；文末新增 Limitations 一节。

---

## R2（major）CLM-02（"Generative AI reduces instructor workload"）as written 不被证据支持

**回应**：感谢指出。原表述已删除。改为与 `SYN-INTERVIEW-02` 一致的描述："Instructors reported faster formative feedback and additional time spent checking unsupported claims; the net effect on workload is not measured."（见 revised-manuscript §Preliminary findings）原 strong claim 不进入 Conclusion；新的 Conclusion 用 workload direction 仍 unresolved 的措辞收尾。

**稿件改动**：Preliminary findings 中删除"stronger statement that generative AI reduces workload is not supported"以外的所有 workload 强表述；Conclusion 不作 workload 方向判断。

---

## R3（major）CLM-03 应作 hypothesis 而非 finding

**回应**：已接受。原"finding"语气替换为："This remains a hypothesis: the supplied materials do not directly compare policy clarity with student uncertainty." 任何后续表述均以 "may"、"if supported by further data" 限定。

**稿件改动**：Preliminary findings 与 Discussion 中两处 CLM-03 表述都加上"this is hypothesis-only"标记。

---

## R4（major）Policy variation 未讨论

**回应**：新增 Discussion 一节（见 §Discussion），单列 Policy variation 小节，逐条对照 `SYN-POLICY-04` 的范围与 limits：course-level disclosure 已要求，但 acceptable assistance 由 instructor 自定；该政策文本不证明实施质量，也不代表其他院校。文末以"policy variation is a likely moderator of student uncertainty, not yet tested"收尾。

**稿件改动**：在 Discussion 增加 Policy variation 小节。

---

## R5（major）没有讨论替代解释

**回应**：同一 Discussion 章节内增加 Alternative explanations 小节，对 CLM-01 至少列出三种可能的非因果解释：（a）新工具带来的 novelty effect；（b）instructor 设计的 prompts 引发的差异（`SYN-CLASSROOM-01` 注明 prompts 全由 instructor 提供）；（c）单门课程的教学结构特征。文末明确："we treat these as alternative explanations, not as evidence against the observation."

**稿件改动**：Discussion 增加 Alternative explanations 小节。

---

## R6（major）没有按证据强度校准的 Conclusion

**回应**：重写 Conclusion。三个 claim 分三段，每段单独标注 strength（CLM-01: tentative；CLM-02: not supported；CLM-03: hypothesis-only），结尾声明本文只形成 hypotheses 与 design constraints，不形成 causal conclusions。

**稿件改动**：替换原 Missing sections 中的 "Conclusion calibrated to the supplied evidence" 占位项，新增 Conclusion。

---

## R7（minor）claim 与 evidence 的对应关系应在文中显式呈现

**回应**：新增 Table 1（claim-evidence mapping），列出 claim_id、wording、support、strength、limits 五列。文中所有提到 CLM-01/02/03 处都引用 Table 1。

**稿件改动**：在 Methods 之后插入 Table 1。

---

## R8（minor）limits 在 sources.yaml 中已记，但未在文中体现

**回应**：每条 evidence 在 Preliminary findings 与 Discussion 中第一次出现时，加 inline 限制说明（如 "(no comparison group)"、"(self-reported, no time logs)"），并在文末 Limitations 一节集中列出。

**稿件改动**：Preliminary findings 每条引用后括注限制；新增 Limitations。

---

## R9（minor）disclosure / 学术诚信的论述过薄

**回应**：在 Discussion 的 Policy variation 小节增加一段，明确：当前证据仅支持把 disclosure guidance 列为一个待检验的调节变量，instructor-level acceptable-assistance 标准差异是这一变量在实测中的主要扰动源。本文不就何种 disclosure 最优做判断。

**稿件改动**：Discussion 增加 disclosure-as-moderator 段落。

---

## R10（minor）样本规模、研究场景与收集场所只在 YAML 中、文中未见

**回应**：在 Methods 中新增"Evidence scope and provenance"段落，逐条复述 `sources.yaml` 的 scope 字段（一门 first-year 写作课、6 周；5 位 instructor；84 份自愿学生问卷；一份院校政策文本）。所有数字仅照 `sources.yaml` 写，不外推。

**稿件改动**：Methods 增 Evidence scope and provenance。

---

## 总览

| 编号 | 类别 | 处理 | 稿件位置 |
|------|------|------|----------|
| R1 | major | 增 Methods | §Methods and evidence-selection limitations |
| R2 | major | 降级 CLM-02 | §Preliminary findings, §Conclusion |
| R3 | major | 标注 hypothesis-only | §Preliminary findings, §Discussion |
| R4 | major | 增 Policy variation | §Discussion |
| R5 | major | 增 Alternative explanations | §Discussion |
| R6 | major | 重写 Conclusion | §Conclusion |
| R7 | minor | 增 Table 1 | §Table 1 |
| R8 | minor | inline 限制 + Limitations | 全文 + §Limitations |
| R9 | minor | disclosure 作 moderating variable | §Discussion |
| R10 | minor | 增 Evidence scope and provenance | §Methods |