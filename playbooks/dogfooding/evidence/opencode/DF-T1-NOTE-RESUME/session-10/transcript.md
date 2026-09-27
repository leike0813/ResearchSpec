我先读完了这几份文件来判断下一步：

**判断依据（按文件）**

- `benchmark/README.md` — 整个基准包是合成 dogfooding 材料，`SYN-*`都不是真实文献，明确禁止联网猜测作者或把合成来源当作真实引用。
- `benchmark/goal.md` — 研究问题、设计、目标产物都还没定；约束是只用合成材料、明确区分观察/解释/未知、不补造参与者和效应量。
- `benchmark/partial-manuscript.md:13-15` — 草稿里有三个可核查点：CLM-01（结构化提示 → 更多提纲修订）、关于"更快反馈但伴随核查工作"的隐含 claim、CLM-02（"生成式 AI 减轻工作量"——作者已自注不被现有证据支持）。
- `benchmark/sources.yaml:4-33` — 四条合成来源各自带显式 limits：SYN-CLASSROOM-01 无对照组无有效测量；SYN-INTERVIEW-02 自报、无时间日志；SYN-SURVEY-03 自愿偏差、态度非行为；SYN-POLICY-04 单机构政策、不可推广。
- `work/researchspec-notes/writing-evidence.md` — 上一次留下的任务笔记，记录的"Next step"就是"按 sources.yaml 核查 draft claims，再写一份普通综合文件"。"Related run: none"，所以走 standalone。
- `researchspec status --json` — 没有 active run，没有 frontier，没有 pending gate/decision，确认是 standalone territory。
- `researchspec check specs --json` — specs 确定性检查通过，零诊断；`researchspec/specs/claims.yaml`、`sources.yaml` 都是空数组，`manuscript.yaml` 未填充，`project.md` 章节空白。

**判断的下一步**

按 `researchspec-navigate` 的指引，证据核查走 `procedure:researchspec-verify` standalone 配套流程（authority：普通项目文件可读写、`researchspec/` 只读；不动 workflow state；输出是 evidence-linked findings + 不录入门控结论）。任务笔记已经明确下一动作是写一份"普通综合文件"，没有 Gate、没有 Decision、没有 plugin/managed-library，所以不升级为 graph run。继续按笔记推进即可。

下面执行：把每条 draft claim 映射到对应 SYN-* 来源，标注观察 / 解释 / 未知；写综合文件 `work/synthesis-writing-evidence.md`；更新任务笔记。

---

**已交付**

- 综合文件：`work/synthesis-writing-evidence.md`（普通项目文件，未触碰 `researchspec/`、未动 workflow state）
- 任务笔记已更新：`work/researchspec-notes/writing-evidence.md`

**核查结论要点**

- CLM-01：在 SYN-CLASSROOM-01 范围内作为过程层观察是 SUPPORTED，但下游质量/因果表述超出证据。
- "更快反馈但伴随核查工作"：作为对 SYN-INTERVIEW-02 的对冲解读 SUPPORTED；不足以支撑任何聚合的工作量结论。
- CLM-02（"减轻工作量"）：UNSUPPORTED，建议改写或删去。
- 引言中的"negotiate new expectations"：WEAKLY SUPPORTED，仅靠 SYN-SURVEY-03 + SYN-POLICY-04 拼出来的合成表述。
- 没有 Gate 结论被记录；这是 standalone verify 配套流程，不录入门控判决。

**待你决定的下一步**（已在综合文件"Items That Require a User Decision"节列出）

1. CLM-02 改写 / 删去 / 保留作者自注；
2. 是否清理暗示因果或跨机构推广的措辞；
3. 引言 framing 保留还是收紧到两条直接可溯源的观察（学生态度 + 政策文本）；
4. 是否现在补起草稿所列的缺失章节（方法、政策差异、替代解释、克制结论），还是先定研究问题再动笔。
