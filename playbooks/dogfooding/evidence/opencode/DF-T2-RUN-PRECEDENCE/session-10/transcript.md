工作区状态：

- 活跃 run：`run-21541277a674c606f68f5c4d`（`academic-pipeline:end-to-end`，human 已授权）。
- 前沿：`pending_subgraph_starts`停在 `node:run-…/research`——子图首节点 `research-question` 需要 `specs/project.md` 作为 `project_intent`。
- 阻塞：`specs/project.md` 全空；`benchmark/goal.md` 明确写「研究问题、研究设计或目标产物尚未确定，希望先了解可行路线」。
- 陈旧物料：`work/researchspec-notes/writing-evidence.md` 内容仍是未改动的 TEST FIXTURE 模板，下一步写的是「对照 `benchmark/sources.yaml` 核查 draft claims 并产出 ordinary合成文件」，且自记 `Related run: none`——与当前激活 run 不一致。

需要先和你确认一件事再动手。两条互斥推进路径，请选一条：

A. 沿用当前 `academic-pipeline`：你给出研究问题、设计与目标产物的方向（哪怕一句话），我把它落到 `specs/project.md` 并继续 `research-question` 节点的 FINER 评分。
B. 切换到 `deep-research:socratic`：把 `run.yaml`/handoff/graph 调整到 socratic 入口，先用苏格拉底对话澄清 RQ、产出 `rq_brief`，再决定是否回到 pipeline。
C. 忽略 graph，按 `writing-evidence.md` 模板里说的，只做 `partial-manuscript.md` 与 `sources.yaml` 的 ordinary 合成（不推进 run）。
