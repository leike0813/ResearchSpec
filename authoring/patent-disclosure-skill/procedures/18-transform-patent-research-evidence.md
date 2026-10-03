# 研究证据桥接 (Research evidence bridge)

## 何时

需要把专利解读证据整合进学术写作的参考文献与综合报告接口。

## 输入

- `patent_notes`（必需，handoff 或 node_output）
- `annotated_bibliography`（可选，handoff 或 node_output）：既有学术参考文献，需保留
- `synthesis_report`（可选，handoff 或 node_output）：既有综合报告，需保留
- `claim_chart`（可选，handoff 或 node_output）：补充比对证据
- `graded_sources`（可选，handoff 或 node_output）：学术来源分级

## 输出是 Markdown 正文

两个输出角色都是**可读的普通 Markdown 文件**，不是 JSON 索引。下游的写作阶段读的是
文本：参考文献条目带注解，综合报告是成段论述。写成 JSON 索引，下游拿到的只是一堆
路径。

`annotated_bibliography` 每条来源一段：引用键、标题、出处、来源类别、证据等级、
一句注解。`synthesis_report` 按主题成段论述、整合而不罗列，每条实质判断带引用锚点。

## 步骤

1. 每条专利来源保留公开号、段号 / 图号、技术观察、解释与证据限制，并标来源类别
   （专利文献 / 学术文献 / 技术材料）。写法细则见
   `knowledge/pd-kp-15-research-evidence-bridge.md`。
2. 从 `patent_notes` 与可选的 `claim_chart` 里提取可引用的专利证据，逐条保留公开号、
   段号 / 图号、技术观察、解释与证据限制。
3. 逐条标来源类别：专利文献 / 学术文献 / 技术材料。
4. 若传入了 `graded_sources`，**沿用它对学术来源的证据等级**——那套分级评的是来源
   可信度，与专利方案的完整度无关，不要拿它去评判专利写法，也不要反过来用专利的
   「充分公开」标准去改学术来源的等级。专利来源另标自己的证据级别
   （摘要级 / 未通读 / 已核段号）。
5. 与既有 `annotated_bibliography` / `synthesis_report` 合并：保持既有条目的引用位置、
   顺序与措辞不变，只追加专利来源段落和受其影响的论述。
6. 写两个 Markdown 文件，另附一份普通交接说明列出实际路径与 `limitations`。

## 硬约束

- 不得把专利公开当成实证验证；专利派生陈述与经验发现必须可区分。
- 不把交底或申请草稿中的主张提升为稳定承诺或稳定规格。
- 不改动学术来源的引用位置、顺序或语义，也不改写它们的证据等级。
- 不自行进入写作节点，不修改 run、节点、Gate 或 Decision。

## 失败路径

- 既有参考文献或综合报告不可读：保留专利证据部分并报告缺口，不覆盖原文件。
- 专利证据不足以支撑某条论述：标证据限制，不把「未读到」写成「不存在」。

## 完成

输出 `annotated_bibliography`（annotated-bibliography.v1）与 `synthesis_report`（synthesis-report.v1）的**实际 Markdown 文件路径**，附来源类别与证据限制说明。
