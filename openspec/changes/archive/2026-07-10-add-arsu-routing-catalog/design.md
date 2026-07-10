## Context

ResearchSpec 当前在 converter config、adapter delivery 和 command renderer 中分别维护四个 ARSU Skill 集合或描述；生成的 `SKILL.md` 又保留上游 frontmatter description。用户模型已经定义 25 个 operational modes、两个 pipeline entry routes 以及路线摘要所需的产物、前置条件、风险、Gate 与成本信息，但这些事实尚不可被后续 control plane 可靠消费。

本 change 在 converter-owned 纯数据模块中建立路由 SSOT，并生成一个可审计 JSON view。它先解决“有哪些路线、如何区分、需要什么、会产生什么”，不解决“当前 workspace 哪条路线可启动”。

## Goals / Non-Goals

**Goals:**

- 用严格 Schema 和交叉引用校验表达完整 ARSU routing catalog。
- 让 converter、Skill frontmatter、command wrappers 和后续 runtime 消费同一事实源。
- 保留 pipeline entry 与 semantic mode 的区别。
- 让 prerequisite fallback graph 可被下一阶段直接计算。
- 把 generated catalog 纳入 converter hash、drift 和 idempotence guarantees。

**Non-Goals:**

- 实现 Navigate、route selection CLI、subflow instance 或 prerequisite evaluation against a workspace。
- 定义实际 Gate IDs、validators、workflow completion 或完整 profiles。
- 改变当前九个 Companion、tool registry 或 public CLI envelope。

## Decisions

### Catalog source is typed code; JSON is a derived audit view

`src/arsu-converter/routing/` 包含严格 Zod contracts、canonical data 和 projections。模块加载时解析 canonical object，失败立即阻断 build/test。Converter 把同一 parsed object稳定序列化为 `skills/arsu/routing-catalog.json`；生成 JSON 不成为第二个可编辑事实源。

### Routes unify modes and pipeline entries

每个 route 使用 `<skill-id>:<route-id>`。前三个 Skills 的 route kind 为 `mode` 且 `mode_id` 非空；pipeline 的 `end-to-end` 和 `mid-entry` 为 `entry` 且 `mode_id: null`。这避免把 pipeline 使用方式伪装成上游 mode，同时让 near-miss/fallback refs 使用单一类型。

### Prerequisites are groups, not prose

所有 prerequisite groups 都必须满足。`all_of` group 要求全部 requirements；`any_of` group 要求至少一个。Requirement kind 只允许 `contract`、`artifact`、`user_input`。Group 可携带 fallback route refs，fallback graph 必须无环。Catalog 只描述可满足条件，workspace 实况计算留给下一阶段。

### Gate policy is routing metadata

Gate policy level 为 `none / conditional / required / profile_defined`，gate kinds 使用语义 ID。Catalog 可用于路线摘要和检查未来 profile 是否覆盖政策，但当前 evaluator 不从它创建或通过 Gate。实际 Gate ID 和 completion 只由 workflow profile/runtime 拥有。

### Descriptions are deterministic projections

Skill description 由 summary、routes、intents、near-misses 和确认纪律生成；command description 使用相同 summary/routes 的短投影。Converter 通过 YAML parser 修改 root frontmatter，只替换 description 语义并保留其余 metadata/body。Delivery 和 command renderer 从 catalog 导出 Skill IDs 与 command contents，不维护平行数组。

### Generated metadata is fully registered

Converter version 升为 `0.5.0`。Conversion manifest 增加 required routing catalog metadata，并将 JSON hash 加入 `output_files`；report 显示 path、catalog ID 和 route counts。Validator 对 JSON、canonical equality、manifest linkage 和四个 description projections 做结构化检查。

## Risks / Trade-offs

- **Catalog data较大** → Schema、data、projection 分模块；route facts 保持结构化，文档从同一 canonical mapping校验。
- **Artifact IDs先于完整 profiles出现** → 明确它们是 route-level type names，不承诺 work paths、validators 或 completion。
- **Upstream descriptions包含更丰富历史触发词** → canonical intents覆盖当前用户模型，Skill body仍保留上游详细 routing guidance。
- **Command descriptions可能过长** → command 使用短 projection，Skill frontmatter 使用完整 projection，两者共享同一 facts。
- **Generated output drift较大** → 只通过 converter `--force` 重建并运行 check/idempotence，不手改 generated trees。

## Migration Plan

1. 建立 catalog contracts/data/projection 和单元校验。
2. 让 converter config、delivery、command renderer 消费 catalog exports。
3. 生成 JSON、manifest/report metadata 并扩展 validator。
4. 强制重建 `skills/arsu`，更新当前文档和 umbrella task。
5. 完成验证后保持 child 和 umbrella changes active。

Rollback 删除 catalog/projection integration 并用旧 converter 重建 generated output；本 change 不写 workspace runtime，因此无需研究项目迁移。

## Open Questions

无。Workflow template refs、实际 Gate nodes 和 route availability evaluation 由后续 changes 决定。
