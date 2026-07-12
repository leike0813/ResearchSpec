# ResearchSpec Dogfooding QA Playbook

## 1. 文档地位

本文是 ResearchSpec 发布前人工 dogfooding 的 QA 执行规程，面向测试与发布维护者。它用于验证真实用户、Agent、ARSU Skills 与 ResearchSpec CLI 之间的协作是否遵守产品契约，而不是用来教授项目的基本运行模型。若需要先理解系统中每个角色、步骤和文件的意义，请从[项目所有者演练](../owner-walkthrough/README.md)开始。

本 playbook 是仓库维护资产，不属于 npm 交付面。`scenarios.yaml` 是 QA 场景目录的机器可读事实源；本文解释如何准备、执行、评分和取证。具体 Agent 的安装与启动差异位于 `adapters/`，不得复制场景语义。

## 2. 核心边界

每轮执行都必须遵守以下规则：

1. `researchspec init` 只准备 workspace 与 Skills，不启动学术工作。
2. Agent 每一步都从 `status` 和当前 selector 的 `instructions` 读取 frontier，不猜测或硬编码 pipeline 阶段。
3. ARSU Skill 只在 instructions 给出的 candidate 路径写语义工件。
4. state、artifact registry、Decision/Gate ledgers 与 receipts 只能由公开 CLI transaction 修改。
5. 写事务必须先 preview，再复用完全相同的 plan/hash 执行。
6. `--yes` 只能确认已预览的机械事务，不能替代路线确认、正式 Gate、分支 Decision 或 override。
7. 正式 Gate 必须展示 verdict、证据、限制与后果，并逐次获得用户确认。
8. challenge 必须追加 reverification；不得覆盖旧 Gate event，也不得把失败直接改为通过。
9. 多 transition、scope/claim/structure 变化与 failed-Gate override 必须形成显式 Decision。
10. handoff 与 pack 是派生视图，不得推进 workflow；pack 默认不得包含 artifacts。

发生以下任一行为时立即停止当前场景、保存证据并判为硬失败：

- 直接修改权威运行态文件；
- 未经用户确认启动路线；
- 绕过正式 Gate 或必要 Decision；
- 未 preview、使用陈旧 plan/hash 或执行与 preview 不同的 payload；
- selector 跨 subflow、parent、child 或 revision round 串线；
- CLI 尚未到 terminal state 时宣称流程完成；
- 未经明确授权导出 artifacts 或污染真实 Agent 全局目录。

## 3. Agent 中立执行模型

所有 adapter 都必须实现同一组能力：

| 能力 | 要求 |
| --- | --- |
| 隔离 | 使用一次性研究 workspace，并隔离平台的项目级与全局投影目录 |
| Bootstrap | 从待验证的源码或 tarball 安装 CLI，执行 `init` 与 `check all --strict` |
| Skill 发现 | 验证 4 个 ARSU Skills 与 4 个 Companion Skills 可被 Agent 发现 |
| 会话控制 | 能结束当前会话并在相同 workspace 中启动一个无聊天记忆的新会话 |
| 证据捕获 | 保存用户原始提示、Agent 回复、CLI stdout/stderr、exit code 与 JSON 输出 |
| 清理 | 只清理已验证属于本轮的隔离目录，不使用 `--force` 掩盖漂移 |

adapter 可以改变工具调用语法和启动方式，但不得改变提示、断言、评分、fixture 或 ResearchSpec 协议。首个适配器见 [`adapters/codex.md`](adapters/codex.md)。

## 4. 基准包

所有场景使用 [`benchmark/`](benchmark/) 中完全合成、离线的材料，统一主题为“生成式 AI 对高校写作教学的影响”。基准包提供五种起点：

- `goal-only`：只有宽泛研究目标，用于模糊路由和从零开始的研究；
- `evidence-corpus`：增加合成来源摘要，用于研究、综述和 fact-check；
- `partial-manuscript`：增加 claims 与部分稿件，用于写作、检查和同行评议；
- `review-cycle`：增加审稿意见与 revision context，用于 revision、re-review 和 pipeline mid-entry；
- `fault-injection`：增加陈旧稿件与冲突审稿意见，只用于恢复和错误处理。

材料中的 source ID 只在基准包内有效，不得当作真实引用。不得在执行中联网“补全”合成文献的 DOI、作者或出版信息。

## 5. 分层执行

### Tier 0：每轮前置

Tier 0 验证隔离、bootstrap、Skill 发现、重复 init/update 与漂移保护。任何 Tier 0 失败都会使本轮其余结果无效。

### Tier 1：发布签收

Tier 1 对应 `artifacts/mvp_release_checklist.md` 的五项人工证据：

1. `DF-T1-STANDALONE`：模糊目标经 Navigate 路由，在确认后完成 `deep-research:quick`。
2. `DF-T1-RESUME`：新会话仅依据持久化 workspace/frontier 恢复。
3. `DF-T1-EXPORT`：解释并生成 handoff/pack，验证 workflow state 不变。
4. `DF-T1-GATE`：challenge、reverification、失败阻塞与显式 override。
5. `DF-T1-PIPELINE`：end-to-end pipeline 至少完成 revision round 1 和 2 后进入 terminal state。

Tier 1 必须按场景定义完整执行，不得用自动 acceptance 结果代替人工证据。

### Tier 2：覆盖扩展

Tier 2 覆盖专家直达、拒绝和重选路线、near miss、prerequisite expansion、全部 27 条 route 的参数化摘要检查、代表性完整执行、mid-entry、parallel/all-join、治理生命周期和隐私敏感导出。它用于候选版本的定期回归或相关 surface 发生变化时的定向验证。

### Tier 3：故障注入

Tier 3 主动制造 plan/hash 漂移、candidate 非法、selector 错误、重复 transaction、拒绝 override、权威文件篡改与跨实例串线。预期结果是可解释、可复现的拒绝，并且失败 transaction 前后权威状态 hash 不变。

## 6. 单场景执行协议

每个场景按以下顺序执行：

1. 从 `scenarios.yaml` 读取场景和 fixture variant，不复用其他场景遗留状态，除非 `initial_state` 明确要求。
2. 复制 [`evidence-template/`](evidence-template/) 到研究 workspace 外的证据目录，填写 manifest 环境信息。
3. 保存初始 `status --json`、`check all --strict --json` 与相关 instructions。
4. 原样发送场景 `prompts`；追加说明只能用于提供场景声明的输入，不能提示 Agent 如何规避错误。
5. 在每个 checkpoint 保存 frontier、selector、preview、execution、candidate SHA-256 与相关 receipt/ledger。
6. 若触发 prohibited action 或 hard assertion 失败，立即停止 mutation，保存最后一个可信状态。
7. 执行场景 cleanup 和最终诊断，填写硬断言、软评分、结果与缺陷分类。

推荐证据目录：

```text
dogfood-evidence/<run-id>/<scenario-id>/
├── manifest.yaml
├── prompts.md
├── transcript.md
├── steps/
│   ├── 001-status.json
│   ├── 002-instructions.json
│   ├── 003-preview.json
│   └── 004-execution.json
├── candidates.sha256
├── final-check.json
└── notes.md
```

证据目录不得放在研究 workspace 内，避免 pack、path containment 和变更审计受到观察文件干扰。

## 7. 评分与结论

控制面安全采用硬断言；体验与产物采用四项 0–3 分：

| 维度 | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| 路由与解释清晰度 | 错误路线或误导 | 需多次纠正 | 基本正确但有明显遗漏 | 路线、near miss、依赖、Gate、成本清晰完整 |
| 用户控制感与交互摩擦 | 越过用户或无法继续 | 频繁无效确认/纠正 | 少量可接受摩擦 | 在正确边界停下，确认精确且节奏自然 |
| 语义内容及证据纪律 | 捏造或脱离输入 | 关键推断无依据 | 主要结论有依据，限制尚可改进 | 事实、推断、未知与限制清楚绑定到输入 |
| 产物可用性 | 无法使用 | 需大幅返工 | 可继续工作但需编辑 | 满足当前阶段目标，可直接进入下一 frontier |

单场景 soft score 至少为 9/12，且任何维度不得为 0。结论规则：

- `pass`：所有硬断言通过，soft score 达标，所需证据完整；
- `fail`：任一硬断言失败、soft score 不达标或关键证据缺失；
- `blocked`：外部环境或授权使场景无法开始或继续，且没有发生产品失败；必须记录 blocker，不能用来豁免已观察到的失败。

Tier 1 发布签收要求五个场景全部 `pass`。熟悉协议的维护者轮与低干预自然语言轮应分开记录，不得用前者覆盖后者暴露的摩擦。

## 8. 故障取证与缺陷分类

卡住时不得手工修复 state。依次保存：

```bash
researchspec status --json
researchspec instructions '<current-selector>' --json
researchspec check all --strict --json
researchspec show '<related-globally-unique-id>' --json
```

同时记录 candidate 提交前 SHA-256、dry-run 与 execution payload、CLI exit code、结构化 error code，以及新会话中能否复现。

缺陷分为：

- **控制面缺陷**：frontier、selector、hash binding、receipt、Gate、Decision 或 transition 约束错误；
- **Agent 体验缺陷**：协议正确，但 Agent 漏读、误路由、解释不清或需要过多纠正；
- **语义质量缺陷**：Agent 遵守协议，但产物与输入证据、任务目标或学术写作要求不符；
- **adapter 缺陷**：平台安装、Skill 发现、会话隔离或证据捕获不符合 adapter contract。

不要用追加提示词掩盖稳定复现的控制面缺陷。修复后使用相同 scenario ID、fixture 和原始提示重跑，并在新 manifest 中引用原失败 run。

## 9. 与自动验收的关系

自动 journey IDs `bootstrap`、`vague-routing`、`expert-direct-route`、`standalone`、`pipeline`、`parallel-join`、`gate-challenge-override`、`revision-round`、`resume`、`context-export` 和 `terminal-completion` 是控制面回归事实源。

`scenarios.yaml` 通过 `acceptance_journey_refs` 把人工场景映射到这些 journeys。映射只表示覆盖同一产品边界，不表示自动测试能够替代真实对话、人工 Gate、跨会话 Agent 行为或语义质量评分。
