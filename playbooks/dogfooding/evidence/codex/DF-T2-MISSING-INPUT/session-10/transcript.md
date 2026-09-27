我先把工作目录的情况摸清，再决定怎么落稿。

---

我看一下情况：benchmark 目录里只有 `partial-manuscript.md`，没有 `review-comments.md` 和 `revision-context.md`。`README.md` 里描述的 `review-cycle` variant 应该带这两个 fixture，但实际上没附。

我用 `partial-manuscript.md` 自己列出的 "Missing sections" 加上 `claims.yaml` 里标注的强度问题，作为隐含的审稿意见来源（这也是稿件作者自己承认的薄弱处）。如果你手头另有真实的审稿意见文件，告诉我路径，我按你给的来重写。

下面落到 `benchmark/` 目录下两个文件：`response-letter.md`（逐条回复）和 `revised-manuscript.md`（对应改稿）。

---

## 一个先要说明的缺口

`benchmark/` 目录只有 `partial-manuscript.md`、`claims.yaml`、`sources.yaml`、`goal.md`、`README.md`，没有 `review-comments.md` 和 `revision-context.md`。`README.md` 描述的 `review-cycle` variant 应附这两份 fixture，但实际未附。

**我采用的假设**：用 `partial-manuscript.md` 自报的 "Missing sections" + `claims.yaml` 中标注的强度差距作为隐含审稿意见来源。这是稿件作者自己承认的薄弱处，与外部审稿人通常会提的关切基本重合。如果你手头有真实审稿意见，告诉我路径，我按你给的原文重写。

## 落稿

两个文件已写入 `[workspace]/benchmark/`：

- [response-letter.md]([workspace]/benchmark/response-letter.md) — 7 条审稿意见逐条回复（中文），每条带 "回应" 和 "稿件改动" 两段，编号 R1–R7。
- [revised-manuscript.md]([workspace]/benchmark/revised-manuscript.md) — 对应改稿，每节末括号标 R1–R7 编号。

###审稿意见编号一览

| 编号 | 意见（推导） | 改稿落点 |
|---|---|---|
| R1 | 缺少方法学与证据选择限制 | 新增 "Methods and evidence base" 节，逐条引 `sources.yaml` 的 `limits` |
| R2 | 缺少政策差异讨论 | 新增 "Policy variation" 段 |
| R3 | 未处理替代解释 | 新增 "Alternative explanations" 段，逐条对到 SYN 源 ID |
| R4 | 结论与证据强度不匹配 | 重写 "Conclusion"，明确 "hypotheses + limits，非因果" |
| R5 | CLM-02 因果措辞被高估 | 改为 "both time savings and new verification work; no measured workload data" |
| R6 | CLM-03 是 `hypothesis_only` 未在稿件中出现 | 加入正文第 3 条发现 + "Hypotheses for future work" 短列表 |
| R7 | 范围与可推广性未声明 | 在 Introduction 末加 "Scope statement" 段 |

### 草稿未做但可以加的事

- 真实审稿意见到位后，把 R1–R7 替换为审稿人原句编号。
- 若希望走 ResearchSpec 的 `review-response` graph profile（带 Gate/Decision/审计状态），告诉我，可用 `researchspec instructions profile:review-response --json` 起一个 root run。当前 workspace 是空的、claim/sources 都未注册，需要先 `researchspec-init` 把这批 fixture 注入 stable specs。
