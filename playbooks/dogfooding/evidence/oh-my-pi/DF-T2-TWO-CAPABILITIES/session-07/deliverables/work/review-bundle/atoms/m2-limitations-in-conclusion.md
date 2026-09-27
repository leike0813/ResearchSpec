# Atomic Comment — m2 (`COM-m2`)

## 元数据
- 来源：`benchmark/review-comments.md` Minor Comment #2
- 立场：`accepted`
- 优先级：`medium`（与 M4 强相关 — Methods 写一次，Conclusion 复述一次）
- 与文档目标条目对应：`Conclusion`

## 引用
> Make the limitations visible in the conclusion, not only in methods.

## 拆解要求（what this comment requires）
1. 在 `Conclusion` 中明确复述主要局限（非仅在 Methods 中复述）。
2. 必须包含：
   - 证据范围（local + synthetic）
   - 因果推断不可得
   - 三条 claim 各自的强度限定（CLM-01 tentative；CLM-02 修订后 tentative / unsupported_as_written；CLM-03 hypothesis_only）
3. 不引入新的限制或新数据；只把已有局限搬到 Conclusion 末段。
4. 措辞建议（待作者授权）：
   - "Read together, these limitations scope the conclusions: the supplied evidence is local and synthetic, does not support causal inference, and limits each claim to its stated strength."

## 写作目标位点（target locations）
- `manuscript` → `Conclusion` 末段（建议在最后一段添加 limitations recap）
- `manuscript` → `Methods and evidence-selection limitations`（由 M4 引入）

## 现有 evidence 支撑
- 全部由 `sources.yaml` + `claims.yaml` 现成内容支撑，无需补造。

## 局限（gap summary）
- 现稿 `Conclusion` 完全缺失；这是结构性空缺，不只是缺一句话。

## 依赖
- 与 M4 强耦合：必须等 M4 完成 Methods 才能完整复述。

## 待作者确认（pending confirmations）
- [ ] 接受"Conclusion 末段 limitations recap"的方案
- [ ] 同意在 `Conclusion` 中将三条 claim 的 strength 简明复述

## 完成判据
- `Conclusion` 末段含一句 limitations recap；
- recap 命中 4 个关键字：local、synthetic、no causal inference、claim 强度限定。
