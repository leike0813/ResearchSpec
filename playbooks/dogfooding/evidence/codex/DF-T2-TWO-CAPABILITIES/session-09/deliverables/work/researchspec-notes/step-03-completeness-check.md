# Step 03 — 完整性检查

> 目的：确认 Step 02 中没有遗漏的意见点、claim、source 或稿件位置。
> 方法：把 Step 02 与原始 review/claim/source/manuscript 做交叉对账。

## 3.1 意见覆盖核对（每条意见是否都已拆分）

| 原始意见 | Step 02 是否覆盖 | 落点节 |
|---|---|---|
| Major 1 — evidence 是 local & synthetic | ✓ | Step 02 Major 1 |
| Major 2 — CLM-02 改写或删除 | ✓ | Step 02 Major 2 |
| Major 3 — CLM-03 改为 hypothesis | ✓ | Step 02 Major 3 |
| Major 4 — Methods 节 | ✓ | Step 02 Major 4 |
| Minor — 术语统一 | ✓ | Step 02 Minor 1 |
| Minor — 局限性在结论处可见 | ✓ | Step 02 Minor 2 |

意见计数 4 major + 2 minor = 6 条，全部覆盖。

## 3.2 Claim 覆盖核对

| Claim | 强度变化 | 是否被 Step 02 触及 | 备注 |
|---|---|---|---|
| CLM-01 | tentative → tentative | ⚠ 未在 Step 02 显式处理 | 见 §3.5 风险项 |
| CLM-02 | unsupported_as_written → tentative | ✓ | Major 2 |
| CLM-03 | hypothesis_only → hypothesis_only（表述重写） | ✓ | Major 3 |

## 3.3 Source 覆盖核对

| Source | 是否被 Step 02 触及 | 用在哪条意见 |
|---|---|---|
| SYN-CLASSROOM-01 | ⚠ 仅隐含（CLM-01 的支撑） | 未显式拆 |
| SYN-INTERVIEW-02 | ✓ | Major 2 |
| SYN-SURVEY-03 | ✓ | Major 3 |
| SYN-POLICY-04 | ✓ | Major 3 |

## 3.4 稿件位置覆盖核对（`partial-manuscript.md` 现有段落）

| 现有段落 | 涉及意见 | Step 02 覆盖 |
|---|---|---|
| Working title | — | 不需改 |
| Introduction | Major 1（部分）、Minor 1 | ✓ |
| Preliminary findings | Major 1、Major 2 | ✓ |
| Missing sections（4 项） | Major 3、Major 4、Minor 2 | ✓ |

## 3.5 潜在遗漏与风险

1. **CLM-01 没有显式改写动作** — 它已是 tentative，但意见 1 要求的"在结论前声明证据是 local & synthetic"会间接给 CLM-01 加一层限定；建议在改稿时同步补一句限定语（如"…in this single introductory course"）。Step 02 没有写到。
2. **SYN-CLASSROOM-01 也没显式拆分** — 它支撑 CLM-01，Methods 节（Major 4）必须列出此 source 及其 limits；Step 02 Major 4 提到"列四条 source"，未单列其 limits，存在被遗漏风险。
3. **术语统一的影响范围** — Minor 1 不仅影响稿件正文，也影响 claims.yaml 中的措辞；Step 02 写成"全文替换"，未点名 yaml，需要在执行阶段补一刀。
4. **"Conclusion calibrated to the supplied evidence"** — 这是 Missing sections 第 4 项，由 Minor 2 触发，但稿件当前缺失结论；Step 02 已识别，未遗漏。
5. **政策差异与替代解释** — Missing sections 第 2、3 项被 Major 3 触发（policy variation）与 Major 4 的因果推断受限说明覆盖；alternative explanations 在 Methods 中可附带一句，未单列——是否需要新段取决于作者决定，不构成遗漏。

## 3.6 与 `goal.md` 约束的兼容性

| 约束 | Step 02 是否触发 |
|---|---|
| 只用合成材料 | ✓（无外部 source 引用） |
| 区分观察 / 解释 / 未知 | ✓（CLM-03 显式标 hypothesis） |
| 不补造参与者信息、效应量、引用或伦理审批 | ✓（Methods 节不引入新数据） |
| 改变范围 / claim 强度需先告知用户 | ⚠ CLM-02 强度变更未在 Step 02 中显式回询用户；执行阶段前应确认 |

## 3.7 结论

Step 02 不存在意见或材料的整体遗漏，但有 3 处需要补强的细节：

- CLM-01 的限定语；
- SYN-CLASSROOM-01 的 limits 在 Methods 中要单列；
- CLM-02 的 yaml 强度变更需要在执行前确认（与 goal.md 约束对应）。

→ 下一步（Step 04）建议：先就 CLM-02 强度变更向用户确认，再进入稿件改写与 yaml 同步更新。
