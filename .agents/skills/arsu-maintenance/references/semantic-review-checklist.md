# ARSU Semantic Review Checklist

脚本只能回答“数值上覆盖多少”。以下项目必须由执行维护的 Agent 阅读原文后逐项判定，并写入
`audits/arsu/<anchor>/05-semantic-review.md`。

## 1. Mode-to-graph binding

- 上游 MODE_REGISTRY 的每个 mode 是否在审阅工件中有 tab？
- mode 的 active agents 是否都能映射到 capability 节点或显式 `adapted/removed` 决策？
- 上游 orchestration（Stage/Phase/checkpoint）是否只由 graph profile 承担，而不是泄漏进 SKILL？

## 2. Capability semantic preservation

对每个新增或变更 capability：

- 上游语义义务：列出 2-5 个不可丢失的语义点（输出、规则、边界）。
- 转换后承载：指出 SKILL 或 knowledge 中的具体章节/锚点。
- 判定：
  - `preserved`：语义与边界均保留。
  - `adapted`：为 graph engine 有意改编（例如 phase -> node + completion）。
  - `removed`：有意删除，必须说明原因与替代承载。
  - `gap`：未覆盖，必须给出后续 action。
- 证据：上游文件路径 + 原文片段；转换后文件路径 + 锚点。

## 3. Knowledge single-sourcing

- mandatory rubric/protocol 是否保留在 knowledge 文件中，并由 SKILL 引用？
- SKILL 是否内联了与 knowledge 分歧的副本？
- knowledge hash 是否与 manifest 一致？

## 4. Flow authority check

```bash
grep -R -n -E 'proceed to|next phase|Phase [0-9]' skills/capabilities --include='SKILL.md'
```

- 命中项必须逐条解释，或修正后重新生成。
- 上游 agent-team orchestration 不得作为节点内步骤出现。

## 5. Anchor review

- 对 assessment 中的 `gap / missing / converted_only`：逐条判定真实缺口还是锚点不当。
- 对 `flow`：确认其语义由 graph profile / Gate / Decision 承接。
- 记录判定与证据到 `05-semantic-review.md`。

## 6. Human confirmation

- 变更范围是否与用户意图一致？
- 破坏性变更（重命名、删除 capability、schema 变更）是否已获确认？
- 是否需要更新 OpenSpec change 或归档审计？
