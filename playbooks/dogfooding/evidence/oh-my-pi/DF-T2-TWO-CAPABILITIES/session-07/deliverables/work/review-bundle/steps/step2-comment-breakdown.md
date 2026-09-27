# 步骤 2 — 逐条拆分意见

> 单一文件快照：`work/review-bundle/steps/step2-comment-breakdown.md`
> 详细 atom 文件：`work/review-bundle/atoms/*.md`（每个批注独立文件）
> 工作语言：中文
> 注：本阶段只做拆分与映射，不修改稿件、不写回复信。

## 1. 拆解约定

- 每条审稿意见分配一个稳定原子 ID（`COM-M1`–`COM-M4`、`COM-m1`–`COM-m2`）。
- 拆分记录字段：`metadata / quote / requirements / target locations / evidence support / gap summary / dependencies / pending confirmations / completion criteria`。
- 所有原子在 `work/review-bundle/atoms/` 下落地，方便后续 Step 3 / 回复信 / 方法阶段直接引用。

## 2. 意见↔原子↔稿件位点 总表

| Review comment | 原子 ID | 优先级 | 作者立场 | 关键目标位点 | 依赖 |
|---|---|---|---|---|---|
| Major #1：陈述 local + synthetic | `COM-M1` | high | accepted | `Introduction`（在 `Preliminary findings` 前一句） | 与 M4 同时定调 |
| Major #2：`CLM-02` 改写为权衡 | `COM-M2` | high | accepted | `Preliminary findings` + `claims.yaml` | 与 M3 共用 claim 重写 |
| Major #3：`CLM-03` 降级为 hypothesis | `COM-M3` | high | accepted_with_conditions | `Preliminary findings` / `Hypotheses` + `claims.yaml` | 依赖 M4 同步 |
| Major #4：增 Methods 段 | `COM-M4` | high | accepted | 新增 `Methods and evidence-selection limitations` 段 | 与 M1 口径一致 |
| Minor #1：术语一致 | `COM-m1` | low | accepted | 通稿 | 与 m2 一并执行 |
| Minor #2：Conclusion 复述局限 | `COM-m2` | medium | accepted | 新增 / 改写 `Conclusion` 末段 | 依赖 M4 |

## 3. 关键 depend 关系一览

- `M1 ↔ M4`：共享"synthetic + local"前置口径，必须同时定稿。
- `M2 ↔ M3`：共享 `claims.yaml` 重写，建议同步提交。
- `M4 → m2`：Methods 完成后才能复述其局限到 Conclusion。
- `m1 ↔ m2`：纯文案可一并执行。

## 4. 拆分结果摘要（每个原子 1 行）

- `COM-M1`：在 `Introduction` 末 / `Preliminary findings` 前加入"local + synthetic"前置声明。Gap：现稿隐含但未明说。
- `COM-M2`：将"reduces instructor workload"改写为"faster formative feedback + additional verification"的权衡陈述；`claims.yaml` 同步。Gap：现稿正文承认"may be offset"但同时声明"is not supported"，两层矛盾需要合一。
- `COM-M3`：将 `CLM-03` 在正文中以 future research hypothesis 形式出现；删除任何关联/因果措辞；`claims.yaml` 同步。Gap：现稿正文未出现 `CLM-03`。
- `COM-M4`：新增 `Methods and evidence-selection limitations` 段，明示材料来源、选择方式、causal inference unavailable、四→三的 source→claim 映射。Gap：现稿无 Methods。
- `COM-m1`：统一"generative AI feedback"，并在 Methods 首次出现时标注。Gap：现稿尚未引入术语，正是预防性窗口。
- `COM-m2`：在 `Conclusion` 末段复述 local + synthetic、no causal inference、claim 强度限定。Gap：现稿无 Conclusion。

## 5. 与作者决定的逐项对照

- 已记录作者接受：M1、M2、M4、m1、m2（直接执行）。
- 已记录条件接受：M3（保留 policy-clarity 观点；标记 hypothesis；删因果措辞）。本拆分完全遵循。
- 未作者决定的分支：
  - M2：alternative A（改写为权衡）vs B（删除 `CLM-02`）— 待作者选择。
  - M3：alternative A（保留 hypothesis）vs B（删除 `CLM-03` 转 `Discussion` 进一步研究方向）— 待作者选择。
  - M1 / M4：语句措辞是否授权 — 待作者选择。

## 6. 输出进入下一步的条件

- Step 2 输出是 Step 3 覆盖核查的输入（见 `step3-coverage-and-gaps.md`）。
- 任何 Option 替代选择或措辞授权未确定前，Step 3 仍按 alternative A 假定推进覆盖判定；待作者反馈后再校准。
