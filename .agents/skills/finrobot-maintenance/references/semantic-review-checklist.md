# FinRobot Semantic Review Checklist

脚本只回答“数量上是否一致”。以下项目必须由执行维护的 Agent 阅读原文后逐项判定，
并写入 `audits/finrobot/<anchor>/05-semantic-review.md`。

## 1. Capability semantic preservation

对每个 extension capability：

- 上游语义义务：从 `skills/plugins/vendors/finrobot/<raw-skill>/SKILL.md`
  列出 2–5 个不可丢失的语义点（输出、规则、边界）。
- 转换后承载：指出 extension `SKILL.md`、`tools/` 或 graph profile 中的具体章节/锚点。
- 判定：`preserved` / `adapted` / `removed` / `gap`。
- 证据：上游文件路径 + 原文片段；转换后文件路径 + 锚点。

## 2. Tool and knowledge single-sourcing

- mixed package 的 `tools/` 是否与 vendor bundle 逐字节一致？
- 每个 tool 是否都有明确的 knowledge_ref、调用时机、输入/输出与失败处理？
- knowledge hash 是否与 manifest 一致？
- llm package 是否错误地打包了脚本或让脚本决定语义结论？

## 3. Flow authority check

```bash
grep -R -n -E 'next-node|next-phase|agent-team|proceed to next' \
  skills/plugins/extensions/capabilities/plugin-financial-* --include='SKILL.md'
```

- 命中项必须逐条解释，或修正后重新生成。
- 上游 workflow/state-machine 语义只由 graph profile / Gate / Decision 承接。

## 4. Validator evidence

- required brief fields 是否对应 SKILL 声明的证据承载章节？
- validator 是否只读取 submission JSON 和 `research_brief` 输出，而不执行工具、网络或模型调用？
- 失败路径是否保证 node 状态不写？

## 5. Human confirmation

- 变更范围是否与用户意图一致？
- 上游安全边界（不执行上游 runtime、不读凭证、不访问服务）是否保留？
- 破坏性变更是否已获确认？
- 是否需要更新 OpenSpec change 或归档审计？
