# Atomic Comment — M4 (`COM-M4`)

## 元数据
- 来源：`benchmark/review-comments.md` Major Comment #4
- 立场：`accepted`（作者已接受）
- 优先级：`high`（新增结构段，影响全文证据—结论映射）
- 与文档目标条目对应：新增 `Methods and evidence-selection limitations` 段

## 引用
> Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable.

## 拆解要求（what this comment requires）
1. 新增一个 `Methods and evidence-selection limitations` 段。
2. 该段必须明确：
   - 四个 source 是"被提供给本次修订"的合成材料（synthetic package）；
   - 选择它们是依据 revision brief，而非代表性抽样；
   - 因果推断不可得（causal inference unavailable）—— 因为缺乏对照组、量化测量、时间日志、随机化与跨机构覆盖；
   - 与每个 claim 的支持来源一一对应（CLM-01 → SYN-CLASSROOM-01；CLM-02 → SYN-INTERVIEW-02；CLM-03 → SYN-SURVEY-03 + SYN-POLICY-04）。
3. 推荐段落骨架：
   - 段头一句明确"材料来源和选择方式"；
   - 一句明确"causal inference unavailable"；
   - 三句映射每个 claim 到其证据；
   - 末句指向 limitations 段。

## 写作目标位点（target locations）
- `manuscript` → 新增 `Methods and evidence-selection limitations`（在 `Preliminary findings` 之前或之后均可，建议之前，因更符合"先说明方法后给发现"的常规结构）。

## 现有 evidence 支撑
- 四个 source 的局限都已在 `sources.yaml` 列明，可逐字引用作为 Methods 的脚注式说明。

## 局限（gap summary）
- 现稿完全没有 Methods 段；缺少对证据选择的解释与对因果限制的说明。

## 依赖
- 与 M1 在"synthetic + local"前置声明上有口径一致性，建议同时敲定措辞。

## 待作者确认（pending confirmations）
- [ ] Methods 段位置（推荐置于 `Preliminary findings` 之前；作者可改）
- [ ] 同意在 Methods 段中保留每个 claim 的 source 映射

## 完成判据
- 稿件中实际新增 `Methods and evidence-selection limitations` 段。
- 段内明文"causal inference unavailable"，且把四个 source 与三个 claim 一一对应。
- 与 M1 的"synthetic + local"前置声明口径一致。
