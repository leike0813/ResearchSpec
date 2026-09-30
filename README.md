# ResearchSpec

ResearchSpec helps an Agent carry out academic research tasks through reusable capabilities and ordinary project files. The user describes a research goal; the Agent finds suitable capabilities, delivers usable results, and saves the progress needed to continue. Formal graph runs provide Gates, Decisions, parallel work, revision rounds, and auditable state when the task calls for them.

Version `0.1.0` is an MVP release candidate. The functional user model is implemented and covered by public-CLI acceptance journeys; publication remains blocked until the hosted CI and manual dogfooding checklist are signed.

## 它解决什么问题

AI Agent 驱动的学术研究面临三个核心问题：

1. **平台锁定**：研究 Skills（文献综述、论文写作、同行评议等）往往被实现为特定 Agent 平台（Claude Code、Codex 等）的专有指令，无法跨平台复用
2. **状态碎片化**：研究意图、文献来源、论证主张、Gate 决策散落在聊天记录中，缺乏可审计的单点真相
3. **人工决策不可追溯**：关键范围、贡献、方法论的选择往往通过自然语言对话隐式完成，难以复核和演进

ResearchSpec 的应对方案：

- **研究任务优先**：用户直接表达目标；Navigate 按需发现适用能力，普通工作先交付成果并用任务笔记延续
- **按需 Procedure**：研究能力仍以文件包分发，但宿主只常驻 Navigate；CLI 在选定后加载完整内容，不依赖平台私有运行时
- **CLI 为中心的执行框架**：CLI 是 run/node 运行状态的唯一修改入口；Agent 执行能力节点、维护研究规格、外部语义交付物和 handoff，不直接编辑 run/node 状态
- **文件合约 (File Contracts)**：研究意图、来源、claims、稿件结构、graph profile、run/node state、handoff 与 project change 都有明确的 Markdown / YAML / JSON owner

## 灵感来源

ResearchSpec 的设计深受 **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** spec-driven 开发模式的启发：

- **已确认承诺写入 specs**：接受的研究范围、主张、限制与交付要求存放在 `specs/`；探索草稿留在普通工作文件
- **变更隔离**：高影响修改以可审阅的 project change 文档包存在于 `changes/`；接受 change 不会自动修改 stable specs
- **决策 first-class**：Human-in-the-loop 不依赖聊天记录；正式 Gate、override 和分支选择写入所属 node instance 文件

Specs 帮助保存已确认的约束和决定；研究工件是实际交付，价值要由研究结果的可用性和证据质量检验。

## 🔗 与 Zotero-Agents 的集成

**ResearchSpec 提供可选的 [Zotero-Agents](https://github.com/leike0813/zotero-agents) 集成。**

Zotero-Agents 是面向 Zotero 文献管理生态的 Agent 自动化框架。ResearchSpec 的 `zotero-library` Adapter 提供七个 Skill：`zotero-library-agent` 负责宽泛路由，Query、Acquisition、Analysis、Synthesis 与 Curation 五个任务 Skill 各自处理有界意图，`zotero-bridge-cli` 提供精确操作和恢复机制。

交互式 `init` 会在选择 Agent 工具后询问是否安装该 Adapter；非交互使用 `--literature-adapters zotero-library`。它要求用户已安装 Zotero 及 Zotero-Agents 插件。选择后才生成 `.zotero-bridge/` 和七个 Skill 投影；ResearchSpec 不探测、不启动也不安装 Zotero 或插件。Zotero 保持文献数据的唯一权威，ResearchSpec 保持工作流状态的唯一权威。

> **详情参见 [Zotero-Agents 项目](https://github.com/leike0813/zotero-agents) 及 [文献系统适配器文档](docs/user/literature-adapters.md)。**

## 吸纳的上游开源项目

ResearchSpec 不是从零构建——它吸纳并整合了多个优秀上游项目的 Skills，通过可复现的转换器管道 (converter pipeline) 将上游内容转化为 agent-neutral 格式发布。

### 核心 ARSU Skills

| 上游项目 | 生成的 Skills | 说明 |
|---|---|---|
| **Academic Research Skills (ARS)** / **Academic Research Skills Universal (ARSU)** | `deep-research`、`academic-paper`、`academic-paper-reviewer`、`academic-pipeline` | ResearchSpec 的主要能力载荷，覆盖深度研究、论文规划写作、同行评议、跨阶段协调 |

### 领域 Skill 插件（经审查转换的第三方上游项目）

| 上游项目 | 版本 | 经审查输出的 Skills 数量 | 覆盖领域 |
|---|---|---|---|
| **ToolUniverse** | v1.5.4 | 130 | 28 个 ANZSRC 学科组 + 2 个工具领域 |
| **Scientific Agent Skills** | v2.53.0 | 49 | 19 个 ANZSRC 学科组 + 5 个工具领域 |
| **Materials-Science-Skills-For-LLM** | snapshot-fafd3ab | 7 | 材料工程、高分子与材料化学、计算建模与模拟 |
| **FinRobot** | snapshot-2717499 | 6 | 银行金融与投资、会计审计 |
| **HistAgent** | snapshot-47bbe21 | 3 | 历史研究、遗产档案与博物馆研究 |
| **Education Agent Skills** | snapshot-32fce5c | 136 | 课程与教学法、教育系统、特殊教育研究 |

上游内容通过不可变审计和独立转换器管道处理，生产准入由经审阅的决策与内容身份约束。不同来源采用保留指令文本、复制已审阅资源或重新创作执行流程的方式；分发内容保留相应出处记录、许可和署名。

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

生成并检查 CLI 文档，或构建文档站：

```bash
pnpm docs:generate   # 从 CLI catalog 生成指令参考
pnpm docs:check      # 验证生成内容未漂移
pnpm --dir website build
```

## 快速入门

初始化新研究项目（不启动学术工作）：

```bash
mkdir my-research
cd my-research
researchspec init . --tools codex
researchspec check all --strict
```

需要访问 Zotero 馆藏时，先安装 [Zotero-Agents](https://github.com/leike0813/zotero-agents)，再显式选择 Adapter：

```bash
researchspec init . --tools codex --literature-adapters zotero-library
```

`init` 只创建 schema `"2"` workspace、graph profiles、四份 stable specs 和 Navigate Agent
投影，不会启动学术工作。旧或未知 workspace 会被报告为 unsupported，且不会被读取、迁移
或修改。

随后在相同项目中启动 Codex，以自然语言描述研究目标：

> 请帮我梳理生成式 AI 对高校写作教学的影响。先找近年的研究，说明主要发现、证据限制和仍有争议的问题，再给我一份可继续修改的综述提纲。

持续的普通研究工作由 Navigate 主 Agent 用 `work/researchspec-notes/<task-id>.md` 记录目标、材料、
已完成内容和下一步；新会话可据此继续，不需要为保存或恢复普通工作启动 graph。正式 Gate/Decision、
并行汇合、重复轮次或可审计状态才需要 graph。具体边界见[用户使用模型](docs/user/usage-model.md)。

ResearchSpec 默认只投影 `researchspec-navigate`。它自带从 typed catalog 生成的 CLI handbook 和 ARSU route reference：主文件负责完整控制流程，详细参数与路由表按需读取。四个 ARSU 工作流、其余三个 Companion、47 个 core capability 与 332 个 plugin extension 通过 `list/show/instructions procedure` 按需发现和加载；预设 graph profiles 保持可组合。

可选的 [Zotero 文献系统 Adapter](docs/user/literature-adapters.md) 会额外安装七个 Skill、项目级 `.zotero-bridge` runtime 和配置模板。`update --literature-adapters none` 可取消选择；未修改的托管文件会被移除，发生 drift 的文件会保留并报告。初始化及状态检查阶段不与 Zotero 通信。

可选 ResearchSpec 维护的[领域插件](docs/developer/domain-plugins.md)让 workspace 选择经审查的 Procedure 与 graph profile，不向宿主目录批量投影 Skills。用户按稳定 domain 选择；维护者 converter 拥有上游出处和依赖。插件不能修改 stable specs、run/node state、handoff、Gate、Decision 或 graph transition。

这里的“可选”控制 workspace 投影；安装 CLI 仍会下载包含全部插件和 Adapter 资源的离线包。能力包的 `operational` 是已编写完整执行流程的成熟度声明，内容覆盖由独立 parity 检查验证；真实 Agent 的证据质量和交付可用性仍需单独演练、人工签收。

## 运行时协议

正式 graph run 按以下协议运行：

```text
researchspec --help
→ researchspec <command> --help
→ status --json
→ instructions <selector> --json
→ start profile:<id> / decide gate:|decision:|change: / advance node:<run>/<node>
→ status --json
```

前两层提供静态发现，不授权运行时动作。完整命令、选项和 selector 说明见
[CLI handbook](docs/user/cli-handbook.md)。当问题涉及当前 workspace 时，Agent 先读取 status，
再请求当前 selector 的 instructions。

Selector family 包括 `procedure:`、`profile:`、`run:`、`node:`、`gate:`、`decision:` 和 `change:`。CLI 是 run/node 文件中 Gate、Decision、frontier 和 transition 的唯一写入者；
ARSU producer 负责 `researchspec/` 外的语义文件和自己的 handoff。`doctor` 只读诊断当前
owner，不执行修复事务。

## Codex 安装范围

Codex Skills 为项目级，位于 `.agents/skills/`；不再生成 `$CODEX_HOME/prompts` 自定义提示。Kimi Code 使用 `.kimi-code/skills/`，旧 `.kimi/skills/` 仅作为迁移来源。`init/update` 的 `--delivery` 可选 `skills`、`commands` 或 `both`，新 workspace 默认 `skills`。

隔离评估：

```bash
export CODEX_HOME="$PWD/.codex-home"
researchspec init . --tools codex
```

从相同环境运行 Codex。仓库维护者可以使用内部试用 playbook；这些材料不包含在 npm 包中。

## CLI 命令

ResearchSpec 保持 16 个顶层命令。使用 `researchspec --help` 查看当前命令集合，
使用 `researchspec <command> --help` 查看具体语法；完整静态参考见
[CLI handbook](docs/user/cli-handbook.md)。当前可执行动作及其 payload、确认和执行策略始终以
workspace 的 `status` 与 `instructions <selector>` 为准。

## 隐私与安全

- ResearchSpec CLI 无运行时 LLM API 集成，不发送遥测
- Agent 工具可能有自己的网络、模型和遥测行为，请单独审查
- `handoff` 只引用外部边界文件；`pack` 排除 run 私有 work 和外部文件字节
- 研究内容保留在项目内，除非用户或 Agent 工具主动导出或传输
- 正式 Gate、failed-Gate override、scope、claim、structure 和 branch 选择均需人工确认

详见 [SECURITY.md](SECURITY.md)。

## 文档

- **文档站**: [https://leike0813.github.io/ResearchSpec/](https://leike0813.github.io/ResearchSpec/) (中文: [zh-Hans](https://leike0813.github.io/ResearchSpec/zh-Hans/))
- [文档入口](docs/README.md)
- [用户使用模型](docs/user/usage-model.md)
- [CLI handbook](docs/user/cli-handbook.md)
- [开发者文档](docs/developer/README.md)
- [维护者文档](docs/maintainer/README.md)

## 许可证

ResearchSpec 使用混合许可证模型：

- ResearchSpec 原创框架和 Companion 材料以 **MIT** 许可发布
- 捆绑和生成的 ARSU 衍生材料以 **CC BY-NC 4.0** 许可发布，保留 Cheng-I Wu 的上游署名
- 固定 Zotero 适配器包以 **AGPL-3.0-only** 许可发布，保留固定来源和衍生记录
- Education Agent Skills 域资产以 **CC BY-SA 4.0** 改编，保留 Gareth Manning 署名及每个 Skill 中的修改声明
- ToolUniverse、Scientific Agent Skills、Materials-Science-Skills-For-LLM、FinRobot、HistAgent 域资产保留每个生成 Skill 的 `LICENSE`、`NOTICE` 或 `NOTICE.md` 中记录的 Skill 级许可和出处

完整组合包不得被描述为不受限制的商业使用。有关材料边界，参见 [LICENSE](LICENSE)、[NOTICE](NOTICE) 和 [LICENSES](LICENSES/)。商业使用需独立权利审查，可能需上游许可。

## 发布状态

仓库不含自动发布工作流。仅在[发布检查清单](artifacts/release/mvp-release-checklist.md)中的技术 Gate、托管 Node/OS 矩阵、管理控制和人工内部试用完成后方可授权标签或 npm 发布。
