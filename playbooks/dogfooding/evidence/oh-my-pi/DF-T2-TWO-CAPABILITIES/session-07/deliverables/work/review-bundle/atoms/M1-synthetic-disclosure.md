# Atomic Comment — M1 (`COM-M1`)

## 元数据
- 来源：`benchmark/review-comments.md` Major Comment #1
- 立场：`accepted`（作者已接受）
- 优先级：`high`（在呈现任何 finding 前必须出现；属"前置声明"型批注）
- 与文档目标条目对应：`Introduction`（建议插在首段或紧邻"preliminary findings"之前）

## 引用
> The manuscript should state that all evidence is local and synthetic before presenting findings.

## 拆解要求（what this comment requires）
1. 在 `Introduction` 段（or 新建 `Evidence framing` 小段）中加一句对"local + synthetic"的明文声明。
2. 该声明应覆盖以下要点：
   - 全部 evidence 来自一份合成材料包（synthetic evidence set）
   - 仅适用于该材料包，不构成对外推 causal effect 的支撑
   - 不应被误用为通用经验规则或对外推广
3. 措辞建议（待作者授权）：
   - "All evidence analyzed in this paper comes from a four-document synthetic package supplied for this revision and represents local observations only."
   - "Findings should be read as design hypotheses, not as generalisable effects."

## 写作目标位点（target locations）
- `manuscript` → `Introduction`（推荐插入位）
- 备选：在 `Methods` 段开始处重复一次以确保两处都有声明

## 现有 evidence 支撑
- 整份 `partial-manuscript.md` 引言已隐含"small synthetic evidence set"，但未在 find 前明说 — M1 就是要将其前置并明确化。

## 局限（gap summary）
- 当前稿件只在 `Introduction` 中轻提"small synthetic evidence set"一次；缺少在 find 前对"synthetic + local"两点的明示 — 此处即为 gap。

## 依赖
- 无前置依赖；可与 M4（methods）并行。

## 待作者确认（pending confirmations）
- [ ] 接受上述措辞建议，或要求改写
- [ ] 同意在 `Introduction` 而非 `Methods` 顶部呈现

## 完成判据
- `Introduction` 段最迟在 `Preliminary findings` 之前出现一句明确"local + synthetic"的声明。
- 措辞锁定后即可进入 strategy / response draft。
