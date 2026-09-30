# Proposal

## Why

FinRobot 的默认分支已到 `2717499b8e30f242640af08c4ad9afd1113c2d45`，增加 Desktop 计算与证据审计源码，并迁移旧来源目录。当前转换器只接受旧库存和已批准树，无法生成不同 hash 的待审完整候选。

## What Changes

- 为 `snapshot-2717499` 建立全量来源审计，覆盖 1,049 个 Git entries、旧 66 个 surface、七项新增证据义务及 56 个暂不准入的第三方 Skill。
- 保留六个金融能力 ID、两领域、四 mixed / 两 llm 结构；增强估值桥、方法可比性、期间覆盖、币种和血缘审计。
- 用既有 renderer 和文件校验生成隔离的候选完整树及 extension 投影，并提供维护者 preview/check 路径。
- 新树须展示精确 hash 后获人类批准，再切换生产 pin、政策、产物与锚点；准备阶段保留当前生产来源和批准。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `finrobot-domain-skill-audit`: 审计数量随绑定快照验证，真实 Skill 和第三方来源独立记录。
- `finrobot-vendor-conversion`: 支持完整待审候选、七项业务增量及与已批准生产树隔离的验证。
- `domain-skill-plugin-registry`: 将 FinRobot bundle 身份绑定到获批的新快照，保持六个 Skill 和两领域成员关系。

## Impact

影响 FinRobot 审计 schema、政策校验、完整树 renderer、维护者 CLI、候选 authored 程序与测试；新增审计和审阅工件。生产吸纳阶段影响 FinRobot pin、政策、raw/extension 包与锚点。无依赖安装、新公共 CLI 命令或新增研究流程权威。
