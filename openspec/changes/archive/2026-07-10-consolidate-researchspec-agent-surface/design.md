## Context

当前 Companion manifest 注册九个 workflow，delivery 为 31 个工具安装四个 ARSU Skills 加九个 Companion，并为其中 28 个工具生成同样两族 wrappers。canonical user model 已将目标锁定为四个 Companion；同时现有 stale cleanup 对 existing-workspace init 与 update 不一致，而且刻意保留所有 shared-global Codex prompts，无法区分产品退役与项目取消选择。

## Goals / Non-Goals

**Goals:**

- 以单一 typed manifest 交付 Navigate、Propose、Decide、Verify。
- 让 Navigate 从 routing catalog 和 CLI frontier 组合路线与运行事实。
- 对 local 和产品退役的 Codex global 投影执行哈希所有权感知清理。
- 让 init/update 共用 reconciliation，并使投影数量从注册表推导。
- 通过 converter 更新 ARSU preflight 和生成树。

**Non-Goals:**

- 不改变十五个公共 CLI 命令、workflow Schema 或 ARSU profiles。
- 不替代语义 producer、Gate confirmation、override 或 branch Decision。
- 不删除用户拥有、未登记或已漂移的文件，也不清理历史 OpenSpec 工件。

## Decisions

1. **Navigate 是一个自包含 Companion，而不是新的 CLI 状态机。** Route 使用 catalog-derived 静态投影，Resume 使用现有 status/instructions frontier；Explain 与 Export 编排既有只读/派生命令。这样保持 CLI 为状态权威，并避免 core 硬编码 ARSU 路线。
2. **路线摘要由 converter routing catalog 确定性投影。** 新 helper 只渲染 catalog 中已有的 route、intent、near-miss、artifact、prerequisite、risk、Gate 和 cost；Companion workflow 不维护平行映射。
3. **退役 workflow 源模块直接删除。** 保留死模块会形成第二个隐式 registry；旧职责只在 Navigate 或直接 CLI guidance 中存在。
4. **共享 reconciliation 以 desired paths、manifest ownership、scope 和 retirement reason 决策。** project-local stale exact-hash 文件可删；shared-global 仅在工具仍被选择且 source 属于显式退役集合时可删。工具 deselection 继续保留 global 文件。任何漂移均保留并诊断，即使使用 `--force`。
5. **目标数量从 tool、ARSU intent 和 Companion manifest 推导。** 测试验证 31×8 与 28×8，但生产代码不新增手写总数表。
6. **ARSU 生成内容只经 converter 更新。** manual/legacy preflight 直接展示 CLI submit 的 dry-run、plan/hash confirmation 和执行边界，不再路由到退役 Companion。

## Risks / Trade-offs

- [用户修改过的旧投影会使物理文件数高于目标] → 保留文件并报告 `generated_file_drift`，将其明确标为非规范残留；期望 manifest surface 仍为四 Companion。
- [全局 Codex prompt 可能被多个 workspace 共享] → 只有当前项目 manifest 拥有、哈希匹配且属于明确产品退役时删除；普通 deselection 不删。
- [Navigate 内容可能随 catalog 变化而漂移] → 投影完全确定性生成，并在 adapter/converter 测试中与 catalog 对照。
- [删除六个入口会暴露旧文档链接] → 同 change 更新 retained Companion、活动 docs、main specs 和 converter 生成物，历史归档不改写。

## Migration Plan

1. 发布四 Companion manifest 与 Navigate 投影。
2. init/update 计算新 desired surface，再按安全规则收敛 manifest-owned stale files。
3. 对干净 legacy 安装删除六个 local Skills/wrappers；对当前仍选择 Codex 的干净退役 global prompts 同步删除。
4. 保留并诊断漂移或未知文件；重复 update 不产生新变化。
5. 若需回滚，可恢复旧 manifest/workflow 源并重新 update；本 change 不迁移 workspace contracts。

## Open Questions

无。
