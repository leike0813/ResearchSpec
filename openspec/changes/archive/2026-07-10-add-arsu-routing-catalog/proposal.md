## Why

ResearchSpec 已锁定对话优先的 ARSU 用户模型，但 Skill/mode、主要产物、前置条件、near-miss、风险、Gate policy 和成本仍散落在上游 Skill、设计文档与 adapter 描述中。后续 Navigate 和 subflow control plane 需要一个 converter-owned、机器可校验的路由事实源，否则会再次复制路由逻辑。

## What Changes

- 新增严格 typed ARSU routing catalog，覆盖四个 ARSU Skills、25 个 operational modes 和两个 pipeline entry routes。
- 建模 intents、primary artifact types、可计算 prerequisite groups、fallback routes、near-misses、risk、route-level Gate policy 和粗粒度成本。
- 从 catalog 派生四个 ARSU Skill IDs、生成 Skill frontmatter descriptions 和 command wrapper descriptions，移除现有重复常量。
- Converter 生成并登记 `skills/arsu/routing-catalog.json`，在 conversion manifest/report 中记录其 metadata 和 hash。
- Validator 校验 catalog Schema、引用闭包、fallback DAG、生成 JSON 和 description projections。
- 保持 Navigate、公开路由 CLI、subflow runtime、实际 Gate 节点和完整 workflow profiles 在后续 changes 中实现。

## Capabilities

### New Capabilities

- `arsu-routing-catalog`: ARSU route definitions、引用完整性、prerequisite graph、risk/Gate/cost policy 和 description projections 的统一事实源。

### Modified Capabilities

- `arsu-converter`: 生成 routing catalog JSON，投影 Skill descriptions，并把 catalog 纳入 conversion manifest、report 和 validation。

## Impact

- 影响 ARSU converter contracts/data/projection、conversion metadata、validator、command renderer、tool delivery 的 Skill ID 来源、generated `skills/arsu` 输出、相关测试和设计文档。
- Converter version 从 `0.4.0` 升至 `0.5.0`。
- 不新增公共 CLI command、JSON envelope、Companion Skill 或 workflow runtime 写入。
- Routing Gate policy 只作为路线摘要与未来 profile 的输入，不直接阻断当前 evaluator。
