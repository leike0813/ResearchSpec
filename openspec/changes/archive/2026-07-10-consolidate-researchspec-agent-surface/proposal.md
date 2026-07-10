## Why

ResearchSpec 当前仍向每个 Agent 工具投影九个 Companion，入口职责与已经锁定的 Navigate 使用模型、直接 CLI 事务边界不一致。完整 ARSU profiles 已可执行，现在需要收敛最后一层 Agent surface，并在升级时安全移除框架拥有的旧投影而不破坏用户修改。

## What Changes

- 新增 `researchspec-navigate`，统一 Route、Resume、Explain 和 Export，对路线语义使用 converter-owned routing catalog，对运行可用性使用 CLI frontier。
- **BREAKING**：Companion 集合由九个收敛为 Navigate、Propose、Decide、Verify 四个；Explore、Next、Context 的职责并入 Navigate，Check、Submit、Archive 改由既有 CLI 直接承担。
- 将交付面锁定为 31 个工具各 8 个 Skills，以及 28 个 command-capable 工具各 8 个 wrappers。
- 让 existing-workspace init 与 update 共享安全 reconciliation：只删除 manifest-owned 且哈希匹配的退役投影，保留并报告用户漂移；Codex 全局 prompt 的产品退役与工具 deselection 使用不同清理规则。
- 更新 ARSU converter preflight，使 manual/legacy artifact registration 直接使用 hash-bound `researchspec submit`，并重生成 converter-owned Skills。
- 保持十五个顶层 CLI 命令、现有 workspace Schema 和 ARSU runtime graph 不变。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `companion-skills`: 将九 Companion 契约收敛为四 Companion，并定义 Navigate 的四分支职责和事务边界。
- `agent-tool-delivery`: 将期望投影改为每工具八个 Skills/八个可用 wrappers，并定义退役投影的所有权感知清理。
- `arsu-routing-catalog`: 增加由 catalog 确定性生成的 Navigate 路线投影。
- `arsu-converter`: 将 ARSU manual/legacy registration guidance 从 Submit Companion 切换为直接 CLI submit。
- `cli-interface`: 明确 init/update 对退役投影使用相同的安全 reconciliation，同时保持公共命令集合不变。

## Impact

- 影响 Companion manifest、workflow renderer、tool delivery reconciliation、ARSU routing projection、converter preflight 和生成的 `skills/arsu/**`。
- 影响 adapter、CLI delivery、converter 测试及当前态产品、架构、CLI、Schema、Skill 和 workflow 文档。
- 不新增依赖、Schema migration、公共命令或 runtime LLM 集成。
