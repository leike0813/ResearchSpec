我来先了解项目结构和当前状态。

---

我需要先停下来澄清一件事——这是一个**阻塞性的范围问题**。

## 实际工作区状况

`benchmark/` 目录里只有 `partial-manuscript` fixture 变体的内容：

| 文件 | 状态 |
|------|------|
| `goal.md` | ✓ 存在（合成研究目标） |
| `sources.yaml` | ✓ 存在（4 个 `SYN-*` 合成来源） |
| `claims.yaml` | ✓ 存在（CLM-01/02/03） |
| `partial-manuscript.md` | ✓ 存在（仅 Working title / Introduction / Preliminary findings / Missing sections） |
| `review-comments.md` | ✗ **不存在** |
| `revision-context.md` | ✗ **不存在** |
| `scenarios.yaml` | ✗ **不存在** |

`benchmark/README.md` 第 9–13 行明确说明，`review-cycle` 变体需要 `review-comments.md + revision-context.md`，但本工作区里没有这两个文件，也没有任何其他位置包含审稿意见。

## 为什么我不直接"逐条回应"

按 `benchmark/README.md` 的合成材料约定：

- "不补造参与者信息、效应量、引用或伦理审批"；
- "合成材料有意包含证据强弱差异、范围限制和可识别的冲突，用于观察 Agent 是否区分事实、推断和未知，而不是测试它能否检索外部知识"；
- 按 `CLAUDE.md`核心规则，"明确区分观察、解释与未知项"。

如果我替您"想出"审稿意见并逐条回应，那就是把推断伪装成观察——既违背 benchmark 的测试目的，也不符合"不补造"的硬约束。

## 我需要您先决定

请在以下方向中选一个，然后我再进入方案/执行阶段：

1. **补齐材料**：您提供审稿意见文本（粘贴或指明路径），我就按既有规则逐条回应并产出 `partial-manuscript.md` 的对应修改。
2. **改换任务**：当前材料支持的是 `partial-manuscript` 变体（草稿撰写 / 缺口补全），我可以按 `partial-manuscript.md` 里 `Missing sections` 列出的四项（方法与证据选择限制 / 政策差异讨论 / 替代解释 / 校准的结论）继续推进。
3. **自我审查模式**：您授权我从稿件自身和 `claims.yaml` 的 `strength`/`limits` 出发，列出**我自己作为读者会提出的**问题清单（明确标注"作者自检·非审稿意见"），再据此回应并修改。这不补造外部审稿人意见，但能产出与回应审稿同形态的稿件修订。
4. **其他路径**：您描述其他期望。

哪一个方向继续？
