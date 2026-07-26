# ResearchSpec

ResearchSpec is an agent-neutral, file-based control plane for Academic Research Skills Universal (ARSU). It installs research Skills into supported Agent tools while keeping workflow state, artifacts, formal Gates, human Decisions, transitions, and receipts in an explicit local workspace.

Version `0.1.0` is an MVP release candidate. The functional user model is implemented and covered by public-CLI acceptance journeys; publication remains blocked until the hosted CI and manual dogfooding checklist are signed.

## 它解决什么问题

AI Agent 驱动的学术研究面临三个核心问题：

1. **平台锁定**：研究 Skills（文献综述、论文写作、同行评议等）往往被实现为特定 Agent 平台（Claude Code、Codex 等）的专有指令，无法跨平台复用
2. **状态碎片化**：研究意图、文献来源、论证主张、Gate 决策散落在聊天记录中，缺乏可审计的单点真相
3. **人工决策不可追溯**：关键范围、贡献、方法论的选择往往通过自然语言对话隐式完成，难以复核和演进

ResearchSpec 的应对方案：

- **Agent-neutral Skills**：所有研究 Skills 以文件形式分发，通过 CLI 适配层安装到不同 Agent 工具，不依赖任何平台的私有运行时
- **CLI 为中心的执行框架**：CLI 是工作流状态的唯一权威；Agent 只生产语义工件，不直接编辑状态、注册表或账本
- **文件合约 (File Contracts)**：研究意图 (`specs/project.md`)、证据来源 (`specs/sources.yaml`)、论证主张 (`specs/claims.yaml`)、工作流状态 (`runs/current/state.yaml`)、Gate 决策 (`runs/current/decision-ledger.jsonl`) 均以类型化的 Markdown / YAML / JSON / JSONL 文件存储

## 灵感来源

ResearchSpec 的设计深受 **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** spec-driven 开发模式的启发：

- **当前 specs 即为真理**：核心研究意图和约束存放在 `specs/`，实时生效
- **变更隔离**：高影响修改以独立 proposal + contract-patch 形式存在于 `changes/`，人工确认后才合并
- **决策 first-class**：Human-in-the-loop 不依赖聊天记录，而是显式写入结构化 Decision 账本

与 OpenSpec 遵循相同理念：代码（此处为研究工件）是附带产物，specs 才应驱动行为。

## 🔗 与 Zotero-Agents 的集成

**ResearchSpec 内置了与 [Zotero-Agents](https://github.com/leike0813/zotero-agents) 的深度集成。**

Zotero-Agents 是面向 Zotero 文献管理生态的 Agent 自动化框架。ResearchSpec 通过七个固定文献适配器 Skill 与之联动：`zotero-library-agent` 负责宽泛路由，Query、Acquisition、Analysis、Synthesis 与 Curation 五个任务 Skill 各自处理有界意图，`zotero-bridge-cli` 提供精确操作和恢复机制。

初始化 ResearchSpec 项目后，`.zotero-bridge/` 运行时目录自动生成。当用户配置的 Host Bridge 可用时，这些 Adapter Skill 即可调用 Zotero 文献库。Zotero 保持文献数据的唯一权威，ResearchSpec 保持工作流状态的唯一权威——双方通过文件接口松耦合协作。

> **详情参见 [Zotero-Agents 项目](https://github.com/leike0813/zotero-agents) 及 [文献系统适配器文档](docs/literature_system_adapters.md)。**

## 吸纳的上游开源项目

ResearchSpec 不是从零构建——它吸纳并整合了多个优秀上游项目的 Skills，通过可复现的转换器管道 (converter pipeline) 将上游内容转化为 agent-neutral 格式发布。

### 核心 ARSU Skills

| 上游项目 | 生成的 Skills | 说明 |
|---|---|---|
| **Academic Research Skills (ARS)** / **Academic Research Skills Universal (ARSU)** | `deep-research`、`academic-paper`、`academic-paper-reviewer`、`academic-pipeline` | ResearchSpec 的主要能力载荷，覆盖深度研究、论文规划写作、同行评议、跨阶段协调 |

### 领域 Skill 插件（经审查转换的第三方上游项目）

| 上游项目 | 版本 | 经审查输出的 Skills 数量 | 覆盖领域 |
|---|---|---|---|
| **ToolUniverse** | v1.3.1 | 130 | 28 个 ANZSRC 学科组 + 2 个工具领域 |
| **Scientific Agent Skills** | v2.53.0 | 49 | 19 个 ANZSRC 学科组 + 5 个工具领域 |
| **Materials-Science-Skills-For-LLM** | snapshot-fafd3ab | 7 | 材料工程、高分子与材料化学、计算建模与模拟 |
| **FinRobot** | snapshot-297a8d2 | 6 | 银行金融与投资、会计审计 |
| **HistAgent** | snapshot-47bbe21 | 3 | 历史研究、遗产档案与博物馆研究 |
| **Education Agent Skills** | snapshot-32fce5c | 136 | 课程与教学法、教育系统、特殊教育研究 |

所有上游 Skills 均通过不可变审计和独立转换器管道处理；生产准入由人工审查的哈希值绑定。上游代码不直接分发——ResearchSpec 重新创作并维护所有生成的 Skill 文件，保持完整的出处记录和许可证归属。

## 环境要求

- Node.js 22 或 24
- pnpm 10（源码开发）
- 一个受支持的 Agent 工具；以下示例使用 Codex

Node 20 已结束生命周期，不在发布的 Node/OS 矩阵中。

## 安装

包发布后：

```bash
npm install --global researchspec
researchspec --version
```

本地源码评估：

```bash
pnpm install --frozen-lockfile
pnpm build
npm link
researchspec --version
```

`npm link` 仅用于开发和内部试用，不表示 npm 包已正式发布。

## 快速入门

初始化新研究项目（不启动学术工作）：

```bash
mkdir my-research
cd my-research
researchspec init . --tools codex
researchspec check all --strict
```

随后在相同项目中启动 Codex，以自然语言描述研究目标：

> I want to study how generative AI affects writing instruction in higher education. Show candidate routes, prerequisites, artifacts, formal Gates, risks, and cost. Do not start a route until I confirm it.

ResearchSpec 安装十五个固定项目 Skills：

- **ARSU**：`deep-research`、`academic-paper`、`academic-paper-reviewer`、`academic-pipeline`
- **Companion**：`researchspec-navigate`、`researchspec-propose`、`researchspec-decide`、`researchspec-verify`
- **Zotero 文献适配器**：`zotero-library-agent`、`zotero-library-query`、`zotero-literature-acquisition`、`zotero-literature-analysis`、`zotero-research-synthesis`、`zotero-library-curation`、`zotero-bridge-cli`

固定[文献系统适配器](docs/literature_system_adapters.md)还会安装一个项目级 `.zotero-bridge` 运行时和配置模板。初始化及状态检查阶段不与 Zotero 通信。七个适配器 Skill 在用户配置的 Host Bridge 可用时提供有界任务访问；Zotero 为文献权威方，ResearchSpec 为工作流权威方。

可选 ResearchSpec 维护的[领域 Skill 插件](docs/domain_skill_plugins.md)可为工作空间添加经审查的 Open Agent Skills。用户按稳定域选择（厂商透明）；维护者转换器拥有上游出处和 Skill 依赖。学科域遵循 [ANZSRC 2020 FoR 组](docs/domain_taxonomy.md) 分类，Field 代码仅为审计元数据。空固定域在有经审查 Skills 前保持内部不可见。插件不增加命令包装器，永不拥有工作流状态、Gate、Decision 或收据。正常研究对话期间，Navigate 可静默检测紧凑插件元数据，建议少量相关域，获得单独同意后预览并执行精确的哈希绑定安装，将输出 Skill 用作当前 ARSU producer 的建议助手。用户拒绝或增强不可用时，核心工作保持不变。可通过 `researchspec plugin list` 手动查看捆绑目录；手动 CLI 选择仍是可选项。

## 运行时协议

标准运行时协议为：

```text
status → instructions <selector> → start / submit / advance → status
```

Selector 类型：
- `subflow:<id>` — 启动子流程
- `work:<id>` — 生产候选工件并提交
- `gate:<id>` — 人工确认 Gate 并提交判定
- `transition:<id>` — 推进至下一状态

CLI 是唯一的工作流状态权威。Agent 生产语义候选工件；不得直接编辑状态、注册表、账本或收据。

## Codex 安装范围

Codex Skills 为项目级，位于 `.codex/skills/`。Codex 命令提示为共享全局，位于 `$CODEX_HOME/prompts/`（`CODEX_HOME` 未设时回退为 `~/.codex/prompts/`）。非交互初始化需显式选择 Codex，使此全局写入可见。

隔离评估：

```bash
export CODEX_HOME="$PWD/.codex-home"
researchspec init . --tools codex
```

从相同环境运行 Codex。维护者可使用仓库专属 [Codex 内部试用适配器](playbooks/dogfooding/adapters/codex.md)和标准 playbook（均不包含在 npm 包中）。

## 16 个 CLI 命令

| 命令 | 说明 |
|---|---|
| `init [path]` | 初始化或安全扩展 ResearchSpec 工作空间 |
| `update [path]` | 刷新选定已生成 Agent 文件 |
| `status` | 显示当前运行与待处理项 |
| `instructions <selector>` | 显示运行时 selector 动态指令 |
| `start <subflow>` | 原子启动已确认子流程 |
| `submit <runtime-item>` | 提交候选工件或 Gate 判定（哈希绑定） |
| `advance <transition>` | 原子推进唯一已授权 transition |
| `check [target]` | 检查合约/运行时/工件/工具/插件/适配器 |
| `list [type]` | 列出变更/工件/gate/决策/工具 |
| `show <item>` | 显示 spec 项或全局唯一项 |
| `handoff` | 渲染当前交接视图 |
| `pack` | 创建确定性上下文包 |
| `propose <change-id>` | 创建已验证的待处理合约变更 |
| `decide [item]` | 解决待处理人工决策 |
| `archive [item]` | 归档已解决变更或草稿补丁 |
| `plugin` | 子命令：list、show、install、uninstall、update、instructions |

## 隐私与安全

- ResearchSpec CLI 无运行时 LLM API 集成，不发送遥测
- Agent 工具可能有自己的网络、模型和遥测行为，请单独审查
- `handoff` 为派生视图，`pack` 默认排除已注册工件；`--include-artifacts` 为显式隐私敏感操作
- 研究内容保留在项目内，除非用户或 Agent 工具主动导出或传输
- 正式 Gate 需人工确认；`--yes` 仅授权已预览的机械事务

详见 [SECURITY.md](SECURITY.md)。

## 文档

- [ResearchSpec 与 ARSU 核心运行模型](docs/researchspec_arsu_runtime/README.md) — CLI/Agent/ARSU 权威边界、OpenSpec 融合、四个 Skill workflow 与 current-state 审计
- [ARSU 用户使用模型](docs/arsu_user_usage_model.md)
- [CLI 接口设计](docs/cli_interface_design.md)
- [领域 Skill 插件](docs/domain_skill_plugins.md)
- [领域分类标准](docs/domain_taxonomy.md)
- [固定文献系统适配器](docs/literature_system_adapters.md)
- [Education Agent Skills 厂商适配器](docs/education_agent_skills_vendor_adapter.md)
- [FinRobot 厂商适配器](docs/finrobot_vendor_adapter.md)
- [HistAgent 厂商适配器](docs/histagent_vendor_adapter.md)
- [Materials-Science-Skills-For-LLM 厂商适配器](docs/materials_science_skills_vendor_adapter.md)
- [Scientific Agent Skills 厂商适配器](docs/scientific_agent_skills_vendor_adapter.md)
- [Scientific Agent Skills v2.53.0 手动安全审查](artifacts/scientific_agent_skills_v2_53_0_manual_security_review.md)
- [Scientific Agent Skills v2.53.0 吸纳结论](artifacts/scientific_agent_skills_v2_53_0_ingest_report.md)
- [ToolUniverse 厂商适配器](docs/tooluniverse_vendor_adapter.md)
- [发布流程](docs/release_process.md)
- [项目维护者导览](playbooks/owner-walkthrough/README.md) — 推荐了解实际运行模型
- [Playbooks 索引](playbooks/README.md) — 维护者导览与内部试用 QA 指引；仓库专用，不包含在 npm 包中

## 许可证

ResearchSpec 使用混合许可证模型：

- ResearchSpec 原创框架和 Companion 材料以 **MIT** 许可发布
- 捆绑和生成的 ARSU 衍生材料以 **CC BY-NC 4.0** 许可发布，保留 Cheng-I Wu 的上游署名
- 固定 Zotero 适配器包以 **AGPL-3.0-only** 许可发布，保留固定来源和衍生记录
- Education Agent Skills 域资产以 **CC BY-SA 4.0** 改编，保留 Gareth Manning 署名及每个 Skill 中的修改声明
- ToolUniverse、Scientific Agent Skills、Materials-Science-Skills-For-LLM、FinRobot、HistAgent 域资产保留每个生成 Skill 的 `LICENSE`、`NOTICE` 或 `NOTICE.md` 中记录的 Skill 级许可和出处

完整组合包不得被描述为不受限制的商业使用。有关材料边界，参见 [LICENSE](LICENSE)、[NOTICE](NOTICE) 和 [LICENSES](LICENSES/)。商业使用需独立权利审查，可能需上游许可。

## 发布状态

仓库不含自动发布工作流。仅在[发布检查清单](artifacts/mvp_release_checklist.md)中的技术 Gate、托管 Node/OS 矩阵、管理控制和人工内部试用完成后方可授权标签或 npm 发布。
