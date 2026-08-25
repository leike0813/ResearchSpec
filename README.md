# ResearchSpec

ResearchSpec is an agent-neutral, file-based execution-flow engine for academic research capabilities. It installs composable capability Skills into supported Agent tools, keeps stable research contracts explicit, and records each graph run, node state, formal Gate, human Decision, transition, and handoff path in its own control directory.

Version `0.1.0` is an MVP release candidate. The functional user model is implemented and covered by public-CLI acceptance journeys; publication remains blocked until the hosted CI and manual dogfooding checklist are signed.

## 它解决什么问题

AI Agent 驱动的学术研究面临三个核心问题：

1. **平台锁定**：研究 Skills（文献综述、论文写作、同行评议等）往往被实现为特定 Agent 平台（Claude Code、Codex 等）的专有指令，无法跨平台复用
2. **状态碎片化**：研究意图、文献来源、论证主张、Gate 决策散落在聊天记录中，缺乏可审计的单点真相
3. **人工决策不可追溯**：关键范围、贡献、方法论的选择往往通过自然语言对话隐式完成，难以复核和演进

ResearchSpec 的应对方案：

- **Agent-neutral Skills**：所有研究 Skills 以文件形式分发，通过 CLI 适配层安装到不同 Agent 工具，不依赖任何平台的私有运行时
- **CLI 为中心的执行框架**：CLI 是 run/node 运行状态的唯一修改入口；Agent 执行能力节点、维护研究规格、外部语义交付物和 handoff，不直接编辑 run/node 状态
- **文件合约 (File Contracts)**：研究意图、来源、claims、稿件结构、graph profile、run/node state、handoff 与 project change 都有明确的 Markdown / YAML / JSON owner

## 灵感来源

ResearchSpec 的设计深受 **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** spec-driven 开发模式的启发：

- **当前 specs 即为真理**：核心研究意图和约束存放在 `specs/`，实时生效
- **变更隔离**：高影响修改以可审阅的 project change 文档包存在于 `changes/`；接受 change 不会自动修改 stable specs
- **决策 first-class**：Human-in-the-loop 不依赖聊天记录；正式 Gate、override 和分支选择写入所属 node instance 文件

与 OpenSpec 遵循相同理念：代码（此处为研究工件）是附带产物，specs 才应驱动行为。

## 🔗 与 Zotero-Agents 的集成

**ResearchSpec 提供可选的 [Zotero-Agents](https://github.com/leike0813/zotero-agents) 集成。**

Zotero-Agents 是面向 Zotero 文献管理生态的 Agent 自动化框架。ResearchSpec 的 `zotero-library` Adapter 提供七个 Skill：`zotero-library-agent` 负责宽泛路由，Query、Acquisition、Analysis、Synthesis 与 Curation 五个任务 Skill 各自处理有界意图，`zotero-bridge-cli` 提供精确操作和恢复机制。

交互式 `init` 会在选择 Agent 工具后询问是否安装该 Adapter；非交互使用 `--literature-adapters zotero-library`。它要求用户已安装 Zotero 及 Zotero-Agents 插件。选择后才生成 `.zotero-bridge/` 和七个 Skill 投影；ResearchSpec 不探测、不启动也不安装 Zotero 或插件。Zotero 保持文献数据的唯一权威，ResearchSpec 保持工作流状态的唯一权威。

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

`init` 只创建 schema `"2"` workspace、graph profiles、四份 stable specs 和静态 Agent
投影，不会启动学术工作。旧或未知 workspace 会被报告为 unsupported，且不会被读取、迁移
或修改。

随后在相同项目中启动 Codex，以自然语言描述研究目标：

> I want to study how generative AI affects writing instruction in higher education. Show candidate routes, prerequisites, boundary outputs, formal Gates, risks, and cost. Do not start a route until I confirm it.

ResearchSpec 默认投影经过 authoring converter 生成的 capability Skills（当前 47 个，含 paper-humanizer 四个节点与 review-response 五个节点），并安装五个核心 Companion 工作流与预设 graph profiles：`minimal`、`research-main`、`academic-paper`、`academic-paper-reviewer`、`academic-pipeline`、`paper-humanizer`、`review-response`。

可选的 [Zotero 文献系统 Adapter](docs/literature_system_adapters.md) 会额外安装七个 Skill、项目级 `.zotero-bridge` runtime 和配置模板。`update --literature-adapters none` 可取消选择；未修改的托管文件会被移除，发生 drift 的文件会保留并报告。初始化及状态检查阶段不与 Zotero 通信。

可选 ResearchSpec 维护的[领域 Skill 插件](docs/domain_skill_plugins.md)可为 workspace 添加经审查的 Open Agent Skills。用户按稳定 domain 选择；维护者 converter 拥有上游出处和 Skill 依赖。学科域遵循 [ANZSRC 2020 FoR 组](docs/domain_taxonomy.md)，Field 代码只用于审计。插件不增加 Companion 或 CLI capability，也不能修改 stable specs、run/node state、handoff、Gate、Decision 或 graph transition。用户拒绝插件或插件不可用时，核心工作不变。

## 运行时协议

Agent 按统一协议运行：

```text
researchspec --help
→ researchspec <command> --help
→ status --json
→ instructions <selector> --json
→ start profile:<id> / decide gate:|decision:|change: / advance node:<run>/<node>
→ status --json
```

前两层提供静态发现，不授权运行时动作。完整命令、选项和 selector 说明见
[CLI handbook](docs/cli_handbook.md)。当问题涉及当前 workspace 时，Agent 先读取 status，
再请求当前 selector 的 instructions。

Selector family 包括 `profile:`、`run:`、`node:`、`gate:`、`decision:` 和 `change:`。CLI 是 run/node 文件中 Gate、Decision、frontier 和 transition 的唯一写入者；
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
[CLI handbook](docs/cli_handbook.md)。当前可执行动作及其 payload、确认和执行策略始终以
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
- [ARSU 用户使用模型](docs/arsu_user_usage_model.md)
- [CLI handbook](docs/cli_handbook.md)
- [CLI 接口设计](docs/cli_interface_design.md)
- [领域 Skill 插件](docs/domain_skill_plugins.md)
- [领域分类标准](docs/domain_taxonomy.md)
- [固定文献系统适配器](docs/literature_system_adapters.md)
- [Education Agent Skills 厂商适配器](docs/education_agent_skills_vendor_adapter.md)
- [FinRobot 厂商适配器](docs/finrobot_vendor_adapter.md)
- [HistAgent 厂商适配器](docs/histagent_vendor_adapter.md)
- [Materials-Science-Skills-For-LLM 厂商适配器](docs/materials_science_skills_vendor_adapter.md)
- [Scientific Agent Skills 厂商适配器](docs/scientific_agent_skills_vendor_adapter.md)
- [ToolUniverse 厂商适配器](docs/tooluniverse_vendor_adapter.md)
- [发布流程](docs/release_process.md)

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
