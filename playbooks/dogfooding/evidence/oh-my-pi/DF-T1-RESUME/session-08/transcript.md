



---

Now I have a full picture. The workspace is a fresh ResearchSpec dogfooding synthetic fixture with no prior run state, no work artifacts, and an empty run just initialized. Let me confirm there's no hidden state.

---



# 研究项目恢复简报

## 项目身份

- 路径：`[workspace]/researchspec/` (schema "2", CLI 0.1.0)
- 当前运行：`run-b0ce2449fcbe921b50674d55`，profile `academic-pipeline`，入口 `main`
- 启动确认：2026-09-27T06:32:31.113Z（合成 fixture 用户），formal gates 链：`research-gate → write-gate → review-gate → final-integrity-gate`
- 期望产出（仍未生成）：`work/historical-submission_package.zip`、`work/historical-process_summary.md`

## 已完成

- 工作区已初始化，7 个 profile 已安装（`academic-pipeline`、`academic-paper`、`academic-paper-reviewer`、`research-main`、`review-response`、`paper-humanizer`、`minimal`）
- 自定义 agent `.omp/agents/researchspec-executor.md`、`researchspec-reviewer.md` 已注入
- 同步 skill `.omp/skills/researchspec-navigate/` 已注入
- `tool-installation-manifest.json` 已落盘 13 项 installation
- 根 run `run-b0ce2449fcbe921b50674d55` 已 `start`，graph.yaml 冻结为 `22018faa9c6cb866d5bb7834c828f54a5aae36f9a1cb2f692d3a6b28e8c13a57`
- 诊断：0 阻塞、0 警告

## 当前阻塞

- **稳定 specs 全空**：`researchspec/specs/project.md`（仅含标题空模板）、`sources.yaml`、`claims.yaml`、`manuscript.yaml` 都是占位 YAML，没有任何研究意图/来源/claim/手稿条目
- **没有 `work/` 产物目录**：`submission_package` 与 `process_summary` 尚未产生
- **没有任何节点实例**：`runs/.../nodes/` 为空；frontier 没有待办节点

## Frontier

- `pending_subgraph_starts`: `node:run-b0ce2449fcbe921b50674d55/research`（按 SKILL.md，父授权已覆盖，无需再走根 run 确认）
- `pending_gates` / `pending_decisions`: 空
- 没有 subgraph 起步前的额外决策## 下一步（按当前 frontier）

1. `researchspec instructions node:run-b0ce2449fcbe921b50674d55/research --json` —— 读取 `research-main` 子图的起步包与边界产出（`research_report` / `annotated_bibliography` / `synthesis_report`）
2. 启动 `research-main` 子图入口 `research-question`（capability `design-research-question-formulation`，输入 `project_intent` 来自 `stable_spec`）
3. 走完 `methodology → literature → grading → synthesis → report`，产出写到 `work/` 或对应声明路径
4. `advance node:run-b0ce2449fcbe921b50674d55/research` → `research-gate` 出 verdict

## 需要你裁决的方向（运行图之前）

`research-main` 的首个能力节点要从 `stable_spec/project.md` 取 `project_intent`。`researchspec/specs/` 现在是空的，而 `benchmark/` 下确实有合成材料（goal + 4 个 SYN-* 来源 + 3 个 claim + 部分稿 + 审稿意见 + 修订指引）。两条路：

- **A. 把 `benchmark/` 当作狗粮素材灌进 stable specs**：让 `research-main` 真跑出可审查产物。前提：合成材料不传播为真引用（`benchmark/README.md` 已明文禁止把 SYN-* 当真 DOI）。
- **B. 跳过研究子图，直接 `mid-entry` 进 `write`/`review`/`revision`**：把 `benchmark/partial-manuscript.md` 作为已有 manuscript_draft 推进，用 fixture 验审查→修订闭环。

要走哪一条？（默认按"恢复工程目的"应是 A；若只是想验证 review/revision 节点，选 B 更短。）
