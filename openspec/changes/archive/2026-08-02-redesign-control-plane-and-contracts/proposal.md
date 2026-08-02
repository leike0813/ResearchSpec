## Why

ResearchSpec 当前把 artifact registry、全局 ledger、receipt/hash transaction、strict/adaptive
兼容层和迁移协议作为运行时权威，这与已经锁定的“stable specs + per-subflow control +
handoff + project change”文件合同相冲突。现在需要一次不兼容硬切，先冻结新的公开合同，
再逐步迁移 CLI、ARSU 与 Companion，避免继续在旧事实源上叠加功能。

## What Changes

- **BREAKING**: 以 current workspace schema `"1"` 取代旧 strict/adaptive workspace；不提供
  兼容读取、迁移或回滚。
- **BREAKING**: 将 ResearchSpec 运行时权威收敛到四份 stable specs、项目 pipeline
  profile、每个 subflow 的 `control.yaml`、每个 subflow 的 `handoff.md` 和 project change。
- **BREAKING**: 删除 `submit` 以及 artifact registry、全局 Gate/Decision ledger、receipt、
  action-basis/plan hash、Material Passport、通用 Draft Patch 和 runtime repair 协议。
- 让边界研究交付物始终位于 `researchspec/` 外，并通过 handoff role/path 显式传递。
- 将 `academic-pipeline` graph 作为 converter-owned、manifest-managed 的项目 profile；
  standalone 与 pipeline child 都通过用户独立确认启动。
- 保留四个 ARSU、四个 Companion、七个 Zotero Adapter Skills 和十六个公开 CLI 命令，
  同步 current-state 文档、生成物和用户旅程。

## Capabilities

### New Capabilities

无。目标行为通过现有 ResearchSpec capability 边界重新定义。

### Modified Capabilities

- `framework-core`: 定义 current workspace、stable specs、项目 profile 和硬切格式识别。
- `cli-interface`: 收敛为十六个命令及 current selector/DTO，删除 `submit` 和旧事务参数。
- `arsu-run-usage`: 使用 profile、per-subflow control 和 handoff 运行 ARSU。
- `arsu-user-model-acceptance`: 以 fresh packaged CLI 和目标态用户旅程验收新合同。
- `arsu-user-routing`: 以 stable specs、handoff role/path 和独立启动确认路由。
- `arsu-workflow-profiles`: 用单一项目 pipeline profile 取代 strict/adaptive profiles。
- `subflow-instance-control-plane`: 让每个 `control.yaml` 成为实例唯一运行时权威。
- `gate-transition-control-plane`: 将 Gate、override、Decision 和 transition 收敛到 owning control。
- `contract-change-proposal`: 用可直接编辑的 project change package 表达高影响更新。
- `manuscript-annotation-system`: 保留 ARSU revision patch，删除通用 patch lifecycle。
- `manuscript-annotation-intake-adapters`: 将 annotation intake 收敛为 subflow 私有无状态材料。
- `companion-skills`: 让 Navigate、Propose、Decide、Verify 使用新文件合同。
- `agent-surface-model`: 固定四个 ARSU、四个 Companion 和七个 Zotero Skills。
- `agent-tool-delivery`: 投影十五个固定 Skills 和十六个命令 wrapper。
- `domain-skill-plugin-registry`: 删除普通插件写入的通用 plan-hash binding。
- `help-documentation-system`: 生成并检查 current CLI 与合同文档。
- `mvp-release-readiness`: 以硬切 workspace、十六命令和新用户旅程作为发布边界。
- `artifact-submit`: 移除 artifact submit、registry 和候选 hash-binding 要求。
- `case-obligation-control-plane`: 移除 adaptive obligation/case runtime 要求。
- `material-passport-import`: 移除 Material Passport 导入与恢复要求。
- `runtime-recovery`: 移除 receipt-backed repair 和 runtime 重建要求。

## Impact

变更影响核心合同与 workspace loader、CLI 参数和输出、profile/converter、ARSU anchors、
Companion Skills、安装 manifest、校验、打包、文档和用户旅程测试。旧 workspace 将被明确
拒绝；现有用户材料只能在框架外备份后作为 fresh workspace 的显式输入或 handoff 重新引入。
本 change 不引入 runtime LLM、数据库、外部服务调用或依赖安装。
