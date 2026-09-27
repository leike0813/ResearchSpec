# 步骤 3 — 覆盖与遗漏核查

> 单一文件快照：`work/review-bundle/steps/step3-coverage-and-gaps.md`
> 来源：步骤 1 / 步骤 2 输出；事实回查 `benchmark/`。
> 工作语言：中文
> 注：本阶段只做核查，不修改稿件、不写回复信。

## 1. 审稿意见覆盖矩阵

| 原子 ID | 覆盖来源 / 目标位点 | 已建立证据链 | 缺口 | 是否覆盖 |
|---|---|---|---|---|
| `COM-M1` | `Introduction`；与 `Methods` 头部口径一致 | 现稿引言隐含"synthetic"但缺"local"前置声明 | M1 前置声明落点 | 已覆盖（待作者授权措辞） |
| `COM-M2` | `Preliminary findings` + `claims.yaml` | `SYN-INTERVIEW-02` 的对照、文本现成的两个限定 | 现稿两层矛盾（一面承认缺口一面判 unsupported） | 已覆盖（待作者选 A/B） |
| `COM-M3` | `Preliminary findings` / 新 `Hypotheses` + `claims.yaml` | 已有 `hypothesis_only` 元数据；缺少正文引用 | 正文未出现 `CLM-03`；可能存在剩余措辞瑕疵（"associated with" 类） | 已覆盖（待作者选 A/B） |
| `COM-M4` | 新增 `Methods and evidence-selection limitations` | 4 段 source、3 段 claim 已映射 | 现稿整段缺失 | 已覆盖（结构性问题，已规划） |
| `COM-m1` | 通稿 | 无 | 现稿尚未引入该术语，正可预防 | 已覆盖（与 m2 一并执行） |
| `COM-m2` | 新 / 改写 `Conclusion` | 来源 = M4 + claim strength | 现稿 Conclusion 整体缺失 | 已覆盖（与 M4 同步） |

> 结论：所有 6 条意见均已分配 1 条原子并附完整证据链。

## 2. 与作者决定的逐条对齐

| 原子 | 作者决定 | 拆分是否一致 |
|---|---|---|
| M1 | 接受 | 一致 |
| M2 | 接受（具体语言二选一） | 拆分保留 alternative A vs B，待作者选 |
| M3 | 接受条件：降级为 hypothesis、删除因果措辞、保留 policy-clarity | 拆分完全遵循 |
| M4 | 接受 | 一致 |
| m1 | 接受 | 一致 |
| m2 | 接受 | 一致 |

> 结论：与作者意图 100% 一致；剩余不确定性仅在于 M2/M3 的 alternative 分支与措辞授权。

## 3. 遗漏与潜在盲点

| # | 可能遗漏 / 盲点 | 严重程度 | 现状 | 建议处置 |
|---|---|---|---|---|
| G1 | `partial-manuscript.md` 引言已用"small synthetic evidence set"，但 M1 要求同时声明 "local"。当前拆分已覆盖；唯一风险是被作者锁定的措辞里漏掉 local | low | 已纳入原语检查 | 提交 reply 时由 reply letter 复核 |
| G2 | `CLM-02` 在改写（alternative A）或删除（alternative B）两种路径下，response 行措辞差异较大 | medium | 已记录 alternative | 回复信按作者选定分支起草 |
| G3 | `CLM-03` 在 alternative A 保留 hypothesis、alternative B 删除 → 两者对应的 response 段落结构不同 | medium | 已记录 alternative | 回复信按作者选定分支起草 |
| G4 | `Methods` 段新增后，"source-to-claim 映射"如果有任一 claim 不严格对一，会被 reviewer 视为偷工减料 | medium | 已规划 | 写作时务必 4→3 完整对应 |
| G5 | 术语选择（`COM-m1`）若与作者过往习惯不符，可能需要回滚 | low | 已声明替代项 | 提交前再次确认 |
| G6 | 现稿 Conclusion 完全缺失 — 若 M4 完成后未能接着写 Conclusion，会让 m2 失去载体 | medium | 已依赖 M4 | 任务排程上把 m2 钉在 M4 之后 |
| G7 | "alternative explanations" 在 `partial-manuscript.md` "Missing sections" 中明列 — 但本次审稿意见未单独要求；本拆分未主动添加此段 | low | 未自动扩张范围 | 若要补，应先问作者，避免擅改范围 |
| G8 | "Discussion of policy variation" 同样在 "Missing sections" 中明列 — 审稿意见未单独要求 | low | 同 G7 | 同 G7：仅在作者授权后纳入 |
| G9 | reply letter 是否需要单独交付 LaTeX 版 | low | 未要求 | 暂以 Markdown 起草；若需要再生成 .tex |
| G10 | ResearchSpec run 的启动（graph/profile）— 用户并未要求，本拆分仅做材料整理与意见拆分 | info | 当前路径仅产出项目级文件 | 显式不启动 run，留作后续步骤 |

## 4. 检查结果：是否还有未答复的批注？

- 已读取的审稿意见：4 major + 2 minor，共 6 条；
- 拆分后产生原子：6 条，与批注一一对应，无遗漏、无合并、无孤儿。

> 一致性结论：本批次的拆分覆盖了审稿人提的全部意见，对作者意图无偏离，未擅自扩范围。

## 5. 待作者决定 / 反馈清单

- [ ] M2 alternative A（改写为权衡） vs B（删除 `CLM-02`）— 选定一种。
- [ ] M3 alternative A（保留 hypothesis 措辞） vs B（删除 `CLM-03` 转 discussion）— 选定一种。
- [ ] M1 / M4 / m1 / m2 的推荐措辞是否直接采用 — 决定 yes/no。
- [ ] 是否需要单独处理 "Discussion of policy variation" 与 "Alternative explanations" 两段（G7/G8）— 默认不纳入，需作者确认才补。

## 6. 进入回复信 / 修订阶段的前置条件

- 全部 6 条意见完成 alternative 选择；
- 全部 6 条意见的措辞建议被作者授权或修订；
- `claims.yaml` 中 `CLM-02` / `CLM-03` 同步更新计划被作者认可；
- 进入下一阶段前应再次读取 `researchspec status --json` 与对应 procedure `instructions`，避免绕过 ResearchSpec 流程启动。
