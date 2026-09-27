# 论断核查摘要 — `benchmark/partial-manuscript.md`

> 仅在本次会话工作区内复盘；不修改 `researchspec/` 工作流状态。论断全部针对合成测试材料，文中 `SYN-*` 来源仅供离线测试。

## 范围与限制

- 上一轮已识别稿子中的待查论断（`CLM-01`、`CLM-02` 及若干隐含论断）。本轮能完成的是"稿内自洽性 + 措辞保险度"的核查；无法完成的是"按外部来源逐条核验"，原因是：
  - `benchmark/sources.yaml` 文件根本不存在；
  - `researchspec/specs/sources.yaml` 与 `researchspec/specs/claims.yaml` 都是空表；
  - 稿子没有 `<!--ref:slug-->` / `<!--anchor:...-->` 引用标记，无法送进 `check-claim-faithfulness-audit` 这类正式程序而不先做格式转换。
- 因此本摘要给出"稿内已显式标记的状态 + 措辞评估 + 阻断条件"，不假装对未提供的来源做了核验。

## 论断清单

| ID | 论断 | 稿内措辞 | 内部状态 | 风险 |
|---|---|---|---|---|
| `CLM-01` | 结构化提示与某门入门课更明显的大纲修订相关 | "coincided with more visible outline revisions in one introductory course" | 作为观察呈现，未越界到因果 | 范围限定（"one introductory course"）、动词"coincided"为相关而非因果 |
| `CLM-02` | 生成式 AI 降低工作量 | "The stronger statement that generative AI reduces workload" | 稿内明确标注"is not supported by the supplied evidence" | 作者已自行剔除，无需额外动作 |
| 隐含 A | 更快的反馈可能被核对工作抵消 | "Interview summaries also suggest that faster feedback may be offset by verification work" | 模糊化叙述（"suggest"、"may be offset"） | 措辞合宜，无来源标记则作为观察而非发现 |
| 隐含 B | 本文只考察小型合成证据，目的为提出假设与设计约束而非一般因果 | "examines a small synthetic evidence set to identify useful hypotheses and design constraints rather than general causal effects" | 范围声明 | 与缺失章节列表一致，未越界 |

## 措辞评估

- 所有显式论断均使用相关（"coincided"、"suggest"、"may"）而非因果（"reduces"、"causes"）动词。
- `CLM-02` 是稿中唯一一处被作者显式否决的强论断，否决理由与措辞都到位。
- 唯一无 ID、无引用的经验性句子是"Interview summaries also suggest..."，按"uncited assertion"标准看是低风险（"suggest"已足够软化），但若补证据应优先放在这里。

## 阻断条件

- 缺失 `benchmark/sources.yaml`（或同等来源语料）→ 无法对任何论断做跨来源核验。
- 缺失 `<!--ref:slug-->` / `<!--anchor:...-->` 标记 → 即便补了来源，`check-claim-faithfulness-audit` 也无法直接吃下。
- 缺失章节（方法、替代解释、政策差异、结语）均未写 → 论断强度只能在"补完缺失章节后再调"。

## 结论

- 论断抽取与稿内一致性核查：完成。
- 跨来源核验：阻塞，需用户提供 `benchmark/sources.yaml`（或授权联网检索）。
- 建议下一步：先把缺失章节补上以校准论断强度，再决定是否补来源核验；当前不构成对任何外部论断的背书。
