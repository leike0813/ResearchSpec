# ResearchSpec Dogfooding QA Playbook

## 1. 文档地位

本文是发布前人工 dogfooding 规程，面向测试与发布维护者。它验证真实用户、Agent、ARSU
Skills 与 ResearchSpec CLI 的协作是否遵守当前产品合同。若需要先理解各角色和文件，请阅读
[项目所有者演练](../owner-walkthrough/README.md)。

本目录不进入 npm 包。`scenarios.yaml` 是场景目录的机器可读事实源；adapter 只描述宿主差异，
不得复制或改写场景语义。

## 2. 核心边界

每轮执行都必须遵守：

1. `researchspec init` 只准备 schema `"1"` workspace 与静态投影，不启动学术工作。
2. Agent 从 `status` 和当前 selector 的 `instructions` 读取 frontier，不硬编码 pipeline。
3. 每个 parent、child、branch 和动态 revision round 分别展示摘要并取得确认。
4. ARSU producer 把边界交付物写到 `researchspec/` 外，并维护所属 handoff。
5. CLI 是 `control.yaml` 的唯一修改入口；Gate、Decision、override 与 transition 不得手改。
6. Stable specs、project changes 和 handoffs 可以按公开合同直接编辑。
7. 正式 Gate 必须展示 verdict、证据、限制和后果，再由用户逐次确认。
8. Challenge 追加 reverification；失败 Gate 不得被覆盖成通过。
9. `pack` 排除全部私有 `work/` 和外部交付物字节，不提供扩大该边界的选项。
10. Plugin 与 Zotero 操作不能改变 ARSU producer、control 或 frontier。

以下行为属于硬失败：

- 未经确认启动 route、child、branch 或 revision round；
- 直接修改 `control.yaml`，或绕过正式 Gate、Decision、override；
- 让下游读取上游私有 `work/`；
- 把外部交付物写入 `researchspec/`，或把其字节打入 pack；
- 使用目录名、模糊匹配或“最近一个实例”代替 machine selector；
- CLI 尚未到 terminal state 就宣称流程完成；
- 在真实 Agent 全局目录或真实 Zotero library 中留下测试副作用。

## 3. Agent 中立执行模型

所有 adapter 必须实现同一组能力：

| 能力 | 要求 |
| --- | --- |
| 隔离 | 使用一次性研究项目，并隔离宿主的项目级和全局投影目录 |
| Bootstrap | 从源码或 tarball 安装 CLI，执行 `init` 与 `check all --strict` |
| Skill 发现 | 验证 4 个 ARSU、4 个 Companion 和 7 个 Zotero Adapter Skills |
| 会话控制 | 结束当前会话，并在同一项目启动一个没有旧聊天的新会话 |
| 证据捕获 | 保存原始提示、Agent 回复、CLI stdout/stderr、退出码和相关文件快照 |
| 清理 | 只清理已验证属于本轮的隔离目录，不用 `--force` 掩盖 drift |

Adapter 可以改变宿主启动和工具调用语法，不能改变 prompts、断言、fixture 或 ResearchSpec
协议。首个适配器见 [`adapters/codex.md`](adapters/codex.md)。

## 4. 基准包

所有场景使用 [`benchmark/`](benchmark/) 中完全合成、离线的材料，主题为“生成式 AI 对高校
写作教学的影响”。基准包提供五类起点：

- `goal-only`：宽泛研究目标；
- `evidence-corpus`：增加合成来源；
- `partial-manuscript`：增加 claims 与部分稿件；
- `review-cycle`：增加审稿意见和 revision context；
- `fault-injection`：增加陈旧稿件和冲突意见。

基准 source ID 只在测试包中有效。不得联网补全虚构文献，也不得把测试材料导入真实 Zotero
library。

## 5. 分层执行

### Tier 0：环境与安装

验证隔离、bootstrap、固定 Skill surface、重复 init/update 和静态投影 drift 保护。Tier 0
失败时，其余结果无效。

### Tier 1：发布签收

Tier 1 对应 `artifacts/mvp_release_checklist.md` 的五项人工证据：

1. `DF-T1-STANDALONE`：模糊目标经 Navigate 路由并完成 `deep-research:quick`。
2. `DF-T1-RESUME`：新会话仅根据 profile、control 和 handoff 恢复。
3. `DF-T1-EXPORT`：维护 handoff 并生成有界 pack，control 不变。
4. `DF-T1-GATE`：challenge、reverification、失败阻塞和显式 override。
5. `DF-T1-PIPELINE`：parent/child 独立确认并完成至少两轮 revision。

自动 acceptance 不能替代这些真实对话与人工判断。

### Tier 2：覆盖扩展

覆盖专家直达、拒绝和重选、27 条 route 摘要、代表性执行、mid-entry、parallel/join、project
change、pack 隐私边界、plugin 与 Zotero 非干扰性。

### Tier 3：故障注入

验证 unsafe boundary path、symlink escape、错误 selector、精确重试、control 并发冲突、拒绝
override、受损 workspace 和外部篡改。预期结果是结构化拒绝，且失败动作不产生部分 authority
写入。

## 6. 单场景执行协议

每个场景按以下顺序执行：

1. 从 `scenarios.yaml` 读取场景和 fixture，不复用未声明的状态。
2. 复制 [`evidence-template/`](evidence-template/) 到 workspace 外的证据目录。
3. 保存初始 `status --json`、`check all --strict --json` 和相关 instructions。
4. 原样发送场景 prompts；追加说明只能提供已声明输入。
5. 在 checkpoint 保存 selector、CLI 请求与响应、相关 control/handoff 快照及外部文件 hash。
6. 触发 prohibited action 或 hard assertion 失败时，立即停止后续 mutation。
7. 执行有界 cleanup，并记录最终诊断、硬断言、软评分和缺陷分类。

推荐证据目录：

```text
dogfood-evidence/<run-id>/<scenario-id>/
├── manifest.yaml
├── prompts.md
├── transcript.md
├── steps/
│   ├── 001-status.json
│   ├── 002-instructions.json
│   ├── 003-command.json
│   └── 004-result.json
├── controls/
├── handoffs/
├── external-files.sha256
├── final-check.json
└── notes.md
```

证据目录不能位于 `researchspec/`，避免影响 pack、路径边界和 workspace 检查。

## 7. 评分与结论

控制面安全采用硬断言；体验与产物采用四项 0–3 分：

| 维度 | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| 路由与解释 | 错误或误导 | 多次纠正 | 基本正确、有遗漏 | route、near miss、依赖、Gate 和成本清楚 |
| 用户控制 | 越过用户或无法继续 | 频繁无效确认 | 少量摩擦 | 在正确边界停下，确认精确 |
| 证据纪律 | 捏造或脱离输入 | 关键推断无依据 | 主要结论有依据 | 事实、推断、未知和限制清楚 |
| 交付物可用性 | 无法使用 | 需大幅返工 | 可继续但需编辑 | 可直接进入下一 frontier |

单场景至少 9/12，且任何维度不得为 0：

- `pass`：硬断言通过、评分达标、证据完整；
- `fail`：任一硬断言失败、评分不达标或关键证据缺失；
- `blocked`：外部环境或授权使场景无法开始或继续，且没有观察到产品失败。

Tier 1 五个场景必须全部 pass。熟悉协议的维护者轮与低干预自然语言轮分开记录。

## 8. 故障取证

卡住时不要手工修复 control。依次保存：

```bash
researchspec status --json
researchspec instructions '<current-selector>' --json
researchspec check all --strict --json
researchspec show '<exact-id>' --json
researchspec doctor --json
```

同时保存相关 authority 文件修改前后的 bytes/hash、外部路径状态、CLI exit code、结构化 error
code，以及新会话中能否复现。

缺陷分为：

- **控制面缺陷**：frontier、selector、control precondition、Gate、Decision 或 transition 错误；
- **Agent 体验缺陷**：协议正确，但 Agent 漏读、误路由或解释不清；
- **语义质量缺陷**：流程正确，但交付物偏离输入、证据或学术目标；
- **adapter 缺陷**：宿主安装、Skill 发现、隔离或证据捕获不符合 contract。

修复后使用相同 scenario ID、fixture 和原始 prompts 重跑，并在新 manifest 中引用失败轮次。

## 9. 与自动验收的关系

当前自动 journey IDs 是 `bootstrap`、`routing`、`standalone`、`pipeline-confirmation`、
`gate-override`、`change`、`plugin-zotero`、`revision-rounds` 和 `resume-pack-failure`。

`scenarios.yaml` 的 `acceptance_journey_refs` 只表示覆盖同一用户边界。自动测试不能代替真实
对话、人工 Gate、跨会话 Agent 行为或学术质量评分。
