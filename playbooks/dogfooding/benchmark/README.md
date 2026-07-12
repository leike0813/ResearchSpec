# Synthetic Dogfooding Benchmark

本目录中的全部内容均为 ResearchSpec dogfooding 专用的合成材料，不描述真实研究、真实参与者、真实论文或真实审稿过程。

统一主题是“生成式 AI 对高校写作教学的影响”。所有 `SYN-*` source ID 仅用于离线测试，不对应 DOI、出版物或外部网页。执行者和 Agent 不得把它们作为真实引用传播，也不得联网猜测其作者或出处。

fixture variants 由 `../scenarios.yaml` 定义：

- `goal-only`：`goal.md`
- `evidence-corpus`：goal + `sources.yaml`
- `partial-manuscript`：goal + sources + `claims.yaml` + `partial-manuscript.md`
- `review-cycle`：partial manuscript + `review-comments.md` + `revision-context.md`
- `fault-injection`：review cycle + `variants/` 中的矛盾或陈旧材料

合成材料有意包含证据强弱差异、范围限制和可识别的冲突，用于观察 Agent 是否区分事实、推断和未知，而不是测试它能否检索外部知识。
