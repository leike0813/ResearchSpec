# ARSU Contract Anchor Audit

## 1. 当前职责

Anchor manifest 记录 vendored ARSU 中需要由 ResearchSpec current contracts 接管的精确文本边界。
它区分 upstream observation 与 replacement policy；上游历史文字不是 ResearchSpec authority。

## 2. Replacement owner

55 个 anchors 的 replacements 只引用以下 current owners：

- 四份 stable specs；
- `profiles/academic-pipeline.yaml`；
- owning subflow 的 `control.yaml`、`handoff.md` 和私有 `work/`；
- `changes/<change-id>/`；
- ARSU `revision_patch` schema 与 stateless helper。

Boundary deliverables 保持为 `researchspec/` 外的普通文件。Replacement 不为它们分配全局身份、
hash binding 或独立 lifecycle。

## 3. 保留的学术语义

Audit 保留 source/corpus discipline、claim intent、reviewer sprint separation、compliance checks、
revision traceability、annotation raw/interpretation 分离和 pipeline Gate 语义。替换只改变外层所有权
和交接载体，不把这些学术约束压缩成通用占位说明。

## 4. 验证

`pnpm arsu:anchors:check` 校验 vendored source 边界、replacement targets、coverage、唯一匹配和
current-owner markers。`pnpm arsu:check` 校验生成树，`pnpm arsu:idempotence` 证明重复转换不改变
bytes。旧控制面残留检查只作用于 ResearchSpec-authored injection 和 replacement，不扫描未改造的
upstream history prose。
