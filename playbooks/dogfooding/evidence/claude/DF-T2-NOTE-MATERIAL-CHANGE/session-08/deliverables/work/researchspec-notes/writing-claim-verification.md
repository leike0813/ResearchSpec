# 论断核查笔记 — partial-manuscript fixture

## 核查范围

`benchmark/partial-manuscript.md` 是工作稿，正文里出现两条显式 claim ID（CLM-01、CLM-02）和若干隐含判断。任务笔记 `work/researchspec-notes/writing-evidence.md` 把 `benchmark/sources.yaml` 列为对照输入，但该文件在 fixture 中并不存在；`researchspec/specs/sources.yaml` 与 `claims.yaml` 同为空。这一缺源是核查工作的实际边界。

本笔记因此回答"在现有材料下能核查多少"，而不是替 sources.yaml 编造支撑。

## 显式 claim 检查

### CLM-01 —— 结构化提示让某门入门课的大纲修改更可见

稿中措辞已经做了三层收窄：一门课、coincided with（非因果）、more visible（未给量级）。在没有 sources.yaml 的情况下，只能从稿内自洽性判断：

- 范围限定与 effect direction 一致，没有越界；
- 缺少样本量、观察窗口、对照组、效应量；
- 没有引用某条 SYN-* 源，所以也无法把它对回具体证据单元。

核查结论：**稿内措辞属于可防御的弱观察**，但**没有可校验的源支撑**。投稿前必须找到这条 claim 对应的至少一条 source summary，否则不能保留。

### CLM-02 —— 生成式 AI 减轻工作量

稿中已自行标注"not supported by the supplied evidence"。这是一个已经被稿子自己否定的强主张。

核查结论：**应当删除或显式退一步**。保留它会让 Introduction 与 Preliminary findings 之间出现可被审稿人直接抓到的内部矛盾。

## 隐含 claim 检查

下列判断没有编号，但同样承担论证负载：

1. "faster feedback may be offset by verification work"（源自访谈摘要）。
   - 方向合理，但同样没有源文件可对照。"may be" 的措辞救了一命，让它勉强能站住。仍需一条访谈摘要对回。
2. "Universities are experimenting with generative AI in writing courses while instructors and students negotiate new expectations"（Introduction）。
   - 这是 framing，不是 empirical claim。核查不要求源支撑，但要求不被后续小节证伪。当前稿面没有证伪它。
3. 工作稿自我定位为"identify useful hypotheses and design constraints rather than general causal effects"——这等于作者主动把可主张的范围压到 hypothesis-level。任何后续段落如果滑向 causal language 都会和这段自陈冲突。

## 整体证据基础

| 维度 | 现状 |
| --- | --- |
| 显式 claim 数 | 2（CLM-01 弱、CLM-02 强） |
| claim-spec 文件 | `researchspec/specs/claims.yaml` 为空 |
| sources 文件 | `researchspec/specs/sources.yaml` 为空、`benchmark/sources.yaml` 缺失 |
| 稿内源引用 | 无 SYN-* 锚点落地到具体来源 |
| 推断性措辞 | 多处用 "may / coincident with / one course"，已部分抵消证据不足 |

判定：**整篇稿子在没有 sources.yaml 的前提下无法完成对外核查**。目前的检查只是内部一致性 + 措辞校准，不能替代源对源核验。

## 下一步

1. 由 fixture 维护方补出 `benchmark/sources.yaml`（以及 `researchspec/specs/claims.yaml` 的结构化条目），否则任何 claim 验证都是悬空的。
2. 拿到源后，按 `claim_id → source_ids → source_summary` 三段做直接对照；对 CLM-02 单独决定删除、改写为假设、还是补强。
3. 当前不进入 graph run。任务笔记里"related run: none"依然成立；只有补出源之后，是否走 `researchspec-verify` 才值得讨论。
4. 任何 Effect size、统计显著性、政策归因都不要在源未补齐前补造——`benchmark/goal.md` 已经明令禁止。

## 相关产物

- 输入稿：`benchmark/partial-manuscript.md`
- 任务笔记：`work/researchspec-notes/writing-evidence.md`
- 本核查：`work/researchspec-notes/writing-claim-verification.md`
- 相关 run：无
