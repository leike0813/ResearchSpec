# Own Vendor Semantic Review Checklist

脚本只回答“数值上覆盖多少”。以下项目必须由执行维护的 Agent 阅读原文后逐项判定，
并写入 `audits/own-vendors/<vendor>/<anchor>/05-semantic-review.md`。

## 1. Capability semantic preservation

对每个新增或变更 capability：

- 上游语义义务：列出 2–5 个不可丢失的语义点（输出、规则、边界）。
- 转换后承载：指出 SKILL 或 knowledge 中的具体章节/锚点。
- 判定：`preserved` / `adapted` / `removed` / `gap`。
- 证据：上游文件路径 + 原文片段；转换后文件路径 + 锚点。

## 2. Knowledge single-sourcing

- mandatory rubric/protocol 是否保留在 knowledge 文件中，并由 SKILL 引用？
- SKILL 是否内联了与 knowledge 分歧的副本？
- knowledge hash 是否与 manifest 一致？

## 3. Flow authority check

```bash
grep -R -n -E 'proceed to|next phase|Phase [0-9]' skills/capabilities --include='SKILL.md'
```

- 命中项必须逐条解释，或修正后重新生成。
- 上游 stage/state-machine 语义只由 graph profile / Gate / Decision 承接。

## 4. Parity evidence

- 对 `parity-packages.json` 中的 `below_*`、`output_missing`、`flow_retained` 逐条判定。
- 数值覆盖是下限，不是语义等价证明。

## 5. Human confirmation

- 变更范围是否与用户意图一致？
- 破坏性变更是否已获确认？
- 是否需要更新 OpenSpec change 或归档审计？
