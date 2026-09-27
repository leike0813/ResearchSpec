我先记录本轮工作笔记，然后开始起草回复信。

**模式与范围**

- 模式：standalone（用户只要求"逐条回复"草稿，不要求跑完整 revision round，不涉及 Gates、Decision、并行节点或子 profile；合成材料为 ResearchSpec dogfooding fixture，无外部访问需求）。
- 选用能力：`review-response` profile 下 `generation-review-response-round` 的输出契约 `response-letter.v1` 作为格式依据；本轮只产出 `response_markdown`，不写 LaTeX、不动工作稿件、不动 researchspec/。
- 关键依据：审稿意见（4 major + 2 minor）、稿件现状（只有 Introduction / Preliminary findings / Missing sections 三段）、`claims.yaml`（CLM-01 tentative / CLM-02 unsupported_as_written / CLM-03 hypothesis_only）、`revision-context.md`（作者已接受 1、2、4；对 3 保留政策清晰度观点、改为假设、删除因果措辞）、`sources.yaml`（四份来源各自的范围与限制）。
- 文件所有权边界：`researchspec/` 只读；回复信写入 `benchmark/`，与现有 partial-manuscript.md / review-comments.md 同目录，方便审阅对照。
- 注意：fixture 自带 `TEST FIXTURE — NOT A REAL PEER REVIEW` 标识，回复信正文中须保留这一点，不要把它包装成真实审稿交流。

下面起草正文。

---

回复信草稿已写入 `[workspace]/benchmark/response-letter-draft.md`。

**模式与依据**
- standalone（用户限定为"逐条回复草稿"，未要求完整 revision round、不触发 Gates 或 Decision）。
- 选用 `review-response` profile 下 `generation-review-response-round` 输出的 `response-letter.v1` 契约，仅产出 `response_markdown`。
- 依据：`benchmark/review-comments.md`（4 major + 2 minor）、`benchmark/claims.yaml`、`benchmark/sources.yaml`、`benchmark/revision-context.md`（作者接受 1/2/4，对 3 保留观点、改为假设、删除因果措辞）、`benchmark/partial-manuscript.md`。

**关键决定与对齐**
- Major 1：在 Preliminary findings 前新增证据范围段落，并在 Methods 与 Conclusion 中呼应。
- Major 2：CLM-02 改写为"更快反馈与新增核验工作相互抵消"的暂态观察；`claims.yaml` 中 strength 从 `unsupported_as_written` 改为 `tentative`，limits 保留。
- Major 3：保留政策清晰度观点，改为非因果的"候选假设"措辞；strength 保持 `hypothesis_only`，limits 保留。
- Major 4：新增 Methods 四要点（来源集合 / 选择理由 / 单源 limits / 因果推断受限原因）。
- Minor 1：统一术语为 "AI-assisted formative feedback"，首次出现时给定义。
- Minor 2：重写 Conclusion，使其镜像 Methods 中的局限，并明确指出仍待回答的三个问题。

**未覆盖内容（明示给审稿人）**
未新增数据、未补造测量、未直接验证 CLM-03；证据仍为本地、单一机构、合成材料。文末"Remains limited"段落直接列出这三项，避免读者把措辞调整误读为新证据。

**跳过的部分**
- 未产出 LaTeX 版（`response_latex`），未动工作稿件、未提交语义 revision log——这些属于完整 `generation-review-response-round`流程，本轮只交付回复信草稿。
- 未生成 coverage matrix 与 round summary——同样需要完整 round workspace，本轮不引入。
