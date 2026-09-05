# ARSU Contract Anchor Audit

## 1. 当前职责

Anchor manifest 记录 vendored ARSU 中需要由 ResearchSpec current contracts 接管的精确文本边界。
它区分 upstream observation 与 replacement policy；上游历史文字不是 ResearchSpec authority。

## 2. Replacement owner

56 个 anchors 的精确 replacement targets 由
[`contract-anchors.json`](../../src/arsu-converter/anchors/contract-anchors.json) 维护，分为：

- 四份 stable specs；
- `profiles/academic-pipeline.yaml`；
- owning run 的 `nodes/<node-instance>.yaml` 和 `handoff.md`；
- `changes/<change-id>/change.md`；
- 外部注释工作材料 `work/annotation-intake/`；
- ARSU `revision_patch` schema 与 stateless helper。

Boundary deliverables 保持为 `researchspec/` 外的普通文件。Replacement 不为它们分配全局身份、
hash binding 或独立 lifecycle。

这些精确 targets 不是完整运行时文件清单。`run.yaml` 和冻结的 `graph.yaml` 同样属于运行权威。
当前运行权威与确认边界以[用户使用模型](../user/usage-model.md)为准：CLI 维护 run/node 状态，
capability 生产外部语义文件，根 run 确认授权冻结图内的 child 与轮次，正式 Gate 和 Decision 逐次确认。

## 3. 保留的学术语义

Audit 保留 source/corpus discipline、claim intent、reviewer sprint separation、compliance checks、
revision traceability、annotation raw/interpretation 分离和 pipeline Gate 语义。替换只改变外层所有权
和交接载体，不把这些学术约束压缩成通用占位说明。

## 4. 验证

`pnpm arsu:anchors:check` 校验 vendored source 边界、replacement targets、coverage、唯一匹配和
current-owner markers。`pnpm arsu:runtime-policy:check` 校验 ARS v3.19.0 的 33 个 runtime-policy
命中分类、宿主原生委派改造与两文件 panel checker 闭包。`pnpm arsu:check` 校验生成树，
`pnpm arsu:idempotence` 证明重复转换不改变
bytes。旧控制面残留检查只作用于 ResearchSpec-authored injection 和 replacement，不扫描未改造的
upstream history prose。
