# OpenSpec 全 Harness 自定义 Agent / Subagent 能力调查报告

> 调查日期：2026-09-09  
> 调查目标：判断 OpenSpec 当前支持的全部 Agent Harness，是否已经原生提供“自定义专业 Agent、角色级模型绑定、用户级与项目级配置、自动委派”等能力，并据此重新评估 Foremanatee 项目的必要性。

---

## 1. 执行摘要

### 1.1 最终结论

**Foremanatee 作为一个跨 Harness 的运行时 subagent 模型路由插件，确实没有继续开发的必要。**

原因不是“所有 Harness 都已经提供完全一致的功能”，而是：

1. OpenSpec 当前列出的 39 个实际 Harness 中，至少 **25 个已经完整或近乎完整地原生支持**：
   - 命名自定义 subagent；
   - 每个角色独立指定模型；
   - 每个角色独立提示词；
   - 每个角色独立工具或权限；
   - 用户级配置；
   - 项目级配置；
   - 根据角色描述自动委派。

2. 另有 **8 个 Harness 提供强部分支持**：
   - 已有自定义 subagent 或功能等价物；
   - 但缺少角色级模型绑定、项目作用域，或仍处于实验状态。

3. 只有少数 Harness 仍停留在：
   - 固定内置 subagent；
   - 一个统一的 subagent 模型；
   - 匿名临时 worker；
   - 依赖扩展才能实现。

4. OpenSpec 所支持的主流、活跃、通用型 Harness，绝大多数已经覆盖 Foremanatee 最初准备实现的核心功能。

5. 即使对少数尚未完全支持的 Harness，单独增加一个运行时提示词注入层，也无法真正补齐：
   - 原生上下文隔离；
   - 独立工具权限；
   - 角色级 sandbox；
   - 原生任务面板；
   - 角色生命周期；
   - 运行时模型继承和校验。

因此，Foremanatee 的原设计会形成一个“最小公分母式”的平行系统：在功能强的 Harness 上重复造轮子，在功能弱的 Harness 上又无法真正达到原生体验。

---

### 1.2 统计结果

OpenSpec 当前在 `AI_TOOLS` 中定义了：

```text
40 个 target ID
= 39 个实际 Harness / 产品
+ 1 个共享 .agents Skills 投递目标
```

其中：

- `agents` 是供应商中立的 `.agents/skills/` 投递目标，不是独立 Harness；
- `windsurf` 只是 `devin` 的兼容别名，不重复计数。

严格分类结果：

| 等级 | 数量 | 比例 | 含义 |
|---|---:|---:|---|
| A：完整原生支持 | 25 | 64.1% | 基本具备完整的专业 subagent 配置链 |
| B：强部分支持 | 8 | 20.5% | 有真实 subagent 系统，但至少缺一个关键维度 |
| C：有限支持 | 3 | 7.7% | 只有固定、匿名或统一配置的 subagent |
| D：依赖扩展 | 1 | 2.6% | Core 不内置，但已有扩展实现 |
| E：未发现原生支持 | 1 | 2.6% | 未发现可复用的 delegated custom-agent 系统 |
| U：间接或证据不足 | 1 | 2.6% | 通过内嵌其他 Harness 间接具备能力，独立产品能力未证实 |

汇总：

```text
完整原生支持：                 25 / 39 = 64.1%
完整或强部分支持：             33 / 39 = 84.6%
若把 SourceCraft 内嵌 OpenCode 计入：34 / 39 = 87.2%
存在某种 subagent/delegation 路径：约 38 / 39
```

即使将几个 EAP、Experimental 或文档置信度中等的项目全部降级，**高置信度的完整支持数量仍超过一半**。

所以“多数 Harness 已经原生支持此类配置”的结论是稳健的。

---

## 2. 一个重要区分：OpenSpec 支持不等于 Subagent 支持

OpenSpec 所说的“支持某个工具”，含义是：

```text
OpenSpec 能把 Skills 和/或 Commands 写到该工具识别的目录中
```

它不代表：

```text
该工具原生支持多 Agent
该工具支持自定义 subagent
该工具支持角色级模型绑定
该工具支持自动委派
```

例如：

- Continue 能读取 OpenSpec Skills 和 Prompts，但未发现原生的命名自定义 subagent 系统；
- Zed 能调用匿名 `spawn_agent`，但没有专业角色注册表；
- Hermes 能委派任务，但所有 subagent 主要共用一个 delegation model；
- Pi 可以通过扩展实现完整 subagent，但 Core 刻意不内置；
- SourceCraft 的 OpenSpec 集成主要针对其 Code Assistant 扩展，而 SourceCraft CLI 中的高级 Agent 能力来自内嵌 OpenCode。

因此本报告没有根据 OpenSpec 的目录表直接推断能力，而是逐个检查了对应 Harness 的官方文档、当前源码或上游配置实现。

来源：[S01][S02]

---

## 3. 评估标准

本报告使用七个严格维度。

| 缩写 | 维度 | 判定标准 |
|---|---|---|
| `N` | Named subagent | 能定义可复用、可命名、可委派的自定义子 Agent |
| `M` | Model | 能为具体 Agent 角色绑定或覆盖模型 |
| `I` | Instructions | 每个 Agent 有独立 system prompt / instructions |
| `T` | Tools | 每个 Agent 可独立配置工具、权限、MCP 或 sandbox |
| `G` | Global | 支持用户级、个人级或全局 Agent |
| `P` | Project | 支持项目级、仓库级 Agent |
| `A` | Auto delegation | 主 Agent 能依据描述自动或模型驱动地选择该 Agent |

符号：

```text
✓  官方明确支持
△  部分支持、功能等价、预览能力，或通过间接机制实现
✗  明确不支持，或当前未发现相关能力
?  第一方公开资料不足，不能可靠确认
—  该维度不适用
```

### 3.1 分类标准

#### A：完整原生支持

通常满足全部七项，或仅在 UI、命名、预览状态上有轻微差异。

#### B：强部分支持

具备真正的 delegated custom-agent 系统，但至少存在一个关键缺口，例如：

- Agent 文件不能固定模型；
- 只有用户级，没有项目级；
- 仍是实验功能；
- Agent Profile 与 subagent Profile 没有完全统一；
- 通过 Mode 或 Model Pool 实现模型选择，而不是角色级声明。

#### C：有限支持

存在 subagent，但主要是：

- 固定内置角色；
- 匿名 worker；
- 全部 child 共用一个模型；
- 工具和提示词不可按角色持久化配置。

#### D：依赖扩展

Core 不内置，但通过官方示例或第三方扩展可以实现。

#### E：未发现原生支持

未发现 Harness 内部的可复用、可委派自定义角色系统。

#### U：间接或证据不足

产品通过内嵌另一 Harness 获得部分能力，或第一方资料不足以区分自身能力与内嵌能力。

---

## 4. 全部 39 个 Harness 能力矩阵

| # | Harness | N | M | I | T | G | P | A | 结论 | 成熟度 / 备注 |
|---:|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|---|
| 1 | Amazon Q Developer | △ | ✓ | ✓ | ✓ | ✓ | ✓ | △ | B | Q CLI 已迁移为 Kiro；旧 Custom Agent 与 Delegate 实验 |
| 2 | Antigravity | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 原生多 Agent、并发和专业角色 |
| 3 | Auggie / Augment CLI | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 完整的项目/用户 custom agent |
| 4 | IBM Bob Shell | ✓ | ? | ✓ | ✓ | △ | ✓ | ✓ | B | Persona 可塑造 subagent；角色级模型与用户作用域证据不足 |
| 5 | Claude Code | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 当前最完整的自定义 subagent 系统之一 |
| 6 | Cline | △ | △ | ✓ | ✓ | △ | ✓ | ✓ | B | Core Subagents 仍标为 experimental；完整配置更多见于 SDK/Plugin |
| 7 | Command Code | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | Markdown Agent，支持模型、effort、权限、后台任务 |
| 8 | CodeArts Agent | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 官方明确支持 `mode/model/tools` 和项目/个人作用域 |
| 9 | CodeBuddy Code | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 功能非常完整，支持 MCP、skills、effort、memory、background |
| 10 | Codex | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 原生 Custom Agents、模型、sandbox、MCP、Skills |
| 11 | Devin Desktop / CLI | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 能力完整，但 Custom Subagents 仍带实验性质 |
| 12 | ForgeCode | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | Agent 可声明为 callable tool，由其他 Agent 调用 |
| 13 | Continue | ✗ | ✗ | ✗ | ✗ | — | — | ✗ | E | 有主 Agent 定制、规则、MCP 和模型配置，未发现命名 delegated custom agents |
| 14 | CoStrict / CSC | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 完整支持 description-driven delegation |
| 15 | Crush | ✗ | △ | ✗ | △ | — | — | ✓ | C | 只有内置 Coder/Task；Agent map 当前为内部硬编码 |
| 16 | Cursor | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 原生 custom subagents；权限颗粒度略低于 Claude/Qoder |
| 17 | Factory Droid | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 个人和项目 custom droids，项目优先 |
| 18 | Gemini CLI | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 支持独立模型、工具、MCP、turn limit、timeout |
| 19 | GitHub Copilot | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | `.agent.md`，CLI/IDE/Cloud Agent 具体表面略有差异 |
| 20 | Hermes Agent | ✗ | △ | △ | △ | ✓ | △ | ✓ | C | 有 `delegate_task`，但主要使用统一 delegation provider/model |
| 21 | iFlow | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | Agent 文件支持 model、tools、MCP、继承和 proactive 使用 |
| 22 | Junie | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 能力完整；Subagents 当前仍属于 EAP |
| 23 | Kilo Code | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | Custom Agent/Mode、模型、权限、自动委派完整 |
| 24 | Kimi Code CLI | ✓ | △ | ✓ | ✓ | ✓ | ✓ | ✓ | B | Agent 文件支持角色/工具，但模型多为 per-spawn 或 model pool |
| 25 | Kiro | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | Amazon Q CLI 的继任者；Custom Agents 与 Subagents 完整 |
| 26 | Lingma / Qoder CN CLI | ✓ | △ | ✓ | ✓ | ✓ | ✓ | ✓ | B | Custom Subagent 完整，但公开 schema 中角色级固定模型不够明确 |
| 27 | MiniMax Code | ✓ | △ | ✓ | △ | △ | △ | ✓ | B | Agent Team 能力强，但缺少清晰、可移植的双作用域角色配置协议 |
| 28 | Mistral Vibe | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | `agent_type=subagent`、active model、tools、permissions |
| 29 | Oh My Pi / OMP | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | Task Agents、优先模型列表和 modelRoles，能力完整 |
| 30 | OpenCode | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 原生 primary/subagent/all，项目和全局定义完整 |
| 31 | Pi | △ | △ | △ | △ | △ | △ | △ | D | Core 不内置；官方示例和 `pi-subagents` 扩展可完整实现 |
| 32 | SourceCraft Code Assistant | ? | ? | ? | ? | ? | ? | ? | U | CLI 内嵌 OpenCode；独立 VS Code Code Assistant 未证实 custom subagent schema |
| 33 | Qoder | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 功能极完整，包括 hooks、MCP、memory、worktree、background |
| 34 | Qwen Code | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | 项目/用户/extension Agents，支持嵌套和模型覆盖 |
| 35 | Rovo Dev CLI | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | Wizard 可配置模型、memory、tools、skills、system prompt |
| 36 | Zoo Code | ✓ | △ | ✓ | ✓ | ✓ | ✓ | ✓ | B | Custom Modes + Boomerang Task；模型通常不是角色文件中的稳定声明 |
| 37 | Trae / TraeCode | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | A | Custom Agents 与 Subagents；动态文档导致部分字段置信度中等 |
| 38 | Zed Agent | ✗ | △ | ✗ | △ | ✓ | △ | ✓ | C | 匿名 spawn_agent，共用一个 `subagent_model`，无角色注册表 |
| 39 | ZCode | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | B | Custom Subagents 仍为 Beta，当前主要是用户级 |

---

## 5. A 类：完整原生支持的 25 个 Harness

### 5.1 Codex

原生目录：

```text
~/.codex/agents/*.toml
<project>/.codex/agents/*.toml
```

Agent 可以定义：

```text
name
description
model
model_reasoning_effort
developer_instructions
sandbox_mode
MCP
Skills
```

`description` 会参与主 Agent 的角色选择。项目 Agent 可以覆盖用户 Agent。角色配置在 subagent 创建时由 Runtime 重新解析，因此不依赖会话中的提示词，也不会因为 compact 丢失。

结论：

```text
Foremanatee 针对 Codex 的 SessionStart 路由提示词方案，
基本是在模拟 Codex 已有的原生角色系统。
```

来源：[S04]

---

### 5.2 Claude Code

目录：

```text
~/.claude/agents/*.md
<project>/.claude/agents/*.md
```

支持：

```text
model
effort
tools
disallowedTools
permissionMode
skills
MCP servers
hooks
memory
background
worktree isolation
maxTurns
```

主 Agent 根据 `description` 自动委派，也可以显式指定。用户、项目、插件、Session、Managed 等作用域均有对应机制。

Claude Code 的自定义 subagent 已经远超 Foremanatee 最初计划实现的“角色 + 模型 + 提示词”。

来源：[S05]

---

### 5.3 OpenCode

目录：

```text
~/.config/opencode/agents/
<project>/.opencode/agents/
```

Agent 可定义：

```text
mode = primary | subagent | all
description
model = provider/model#variant
system prompt
tools
permissions
steps
hidden
provider options
```

没有指定模型时 child 继承 parent model。项目定义可以覆盖全局定义。Primary Agent 会根据 description 选择 subagent，也支持 `@agent` 显式调用。

来源：[S06]

---

### 5.4 Oh My Pi / OMP

目录：

```text
~/.omp/agent/agents/
<project>/.omp/agents/
```

OMP Task Agent 支持：

- 独立说明和工具；
- 独立模型；
- 模型优先列表；
- thinking level；
- Skills；
- extension；
- output schema；
- memory；
- nested agents。

同时还提供：

```text
modelRoles
default
smol
slow
vision
plan
commit
tiny
task
advisor
```

`modelRoles` 本身已经是角色化模型映射，并支持全局设置与项目覆盖。

相比 Foremanatee，OMP 原生方案不仅支持“不同工种使用不同模型”，还支持：

- 优先模型链；
- reasoning level；
- 专业 Task Agent；
- 角色级工具；
- advisor/reviewer 模型。

来源：[S07][S08]

---

### 5.5 Gemini CLI

目录：

```text
~/.gemini/agents/
<project>/.gemini/agents/
```

支持：

- 模型；
- system prompt；
- tools；
- inline 或引用式 MCP；
- temperature；
- max turns；
- timeout；
- Policy Engine 权限；
- Extension Agents。

Agent 描述会被主 Agent 用于自动委派，也支持显式 `@agent`。

来源：[S09]

---

### 5.6 Cursor

目录：

```text
~/.cursor/agents/
<project>/.cursor/agents/
```

支持自定义 subagents、模型、reasoning/context 参数、只读模式、后台模式和专用提示词。项目 Agent 通常优先于用户 Agent。

Cursor 还在部分场景兼容 Claude Code 或 Codex 风格的 Agent 文件，这意味着跨 Harness 配置的碎片化正在被 Harness 自身逐步吸收。

来源：[S10]

---

### 5.7 Kilo Code

目录通常分为：

```text
用户级 Agent
<project>/.kilo/agents/
```

支持：

- JSON 或 Markdown；
- primary/subagent；
- model；
- prompt；
- provider 参数；
- tools；
- permissions；
- steps；
- hidden；
- Task 工具自动调用；
- `@agent` 显式调用。

来源：[S11]

---

### 5.8 Kiro

目录：

```text
~/.kiro/agents/
<project>/.kiro/agents/
```

支持 JSON 或 Markdown Agent，字段包括：

- model；
- prompt；
- tools；
- excludedTools；
- MCP；
- resources；
- skills；
- permissions。

Kiro CLI/IDE 可将自定义 Agent 作为 subagent 自动或显式调用。项目 Agent 优先于用户 Agent。

Amazon Q Developer CLI 已正式迁移为 Kiro CLI，因此对于新用户，应把 Kiro 视为当前实现，而不是继续围绕 Amazon Q CLI 的旧限制设计兼容层。

来源：[S12][S13][S39]

---

### 5.9 Qoder

目录：

```text
~/.qoder/agents/
<project>/.qoder/agents/
```

支持：

- 独立模型与 reasoning effort；
- tools / disallowedTools；
- MCP；
- scoped hooks；
- permission mode；
- memory；
- background；
- max turns；
- worktree；
- subagent nesting；
- 用户和项目作用域。

Qoder 是当前能力最完整的 Harness 之一。

来源：[S14]

---

### 5.10 Qwen Code

支持：

- 用户、项目、Extension 三类 Agent；
- 模型 ID 或 `authType:model`；
- prompt；
- tools / disallowed tools；
- approval mode；
- background；
- parallel；
- nested subagents；
- 项目覆盖。

Qwen Code 的 Agent 系统已经可以直接表达复杂的专业角色矩阵。

来源：[S15]

---

### 5.11 Rovo Dev CLI

目录：

```text
~/.rovodev/subagents/
<project>/.rovodev/subagents/
```

创建向导可以为每个 Subagent 选择：

- 名称和描述；
- 模型；
- memory；
- system prompt；
- tools；
- skills。

由 `invoke_subagent` 工具执行，既可显式调用，也可由主 Agent 自动选择。

来源：[S16]

---

### 5.12 Factory Droid

目录：

```text
~/.factory/droids/
<project>/.factory/droids/
```

Custom Droid 可定义：

- system prompt；
- model preference；
- tool policy；
- description。

项目定义优先于个人定义。主 Droid 可以通过 Task 工具自动选择或显式调用其他 Droid。

来源：[S17]

---

### 5.13 Auggie / Augment CLI

目录：

```text
~/.augment/agents/
<project>/.augment/agents/
```

支持：

- 自定义提示词；
- description；
- model；
- tools；
- disabled_tools；
- 用户和项目作用域；
- 自动推荐与显式调用。

来源：[S18]

---

### 5.14 Command Code

目录：

```text
~/.commandcode/agents/
<project>/.commandcode/agents/
```

Markdown Agent 支持：

- model；
- reasoning effort；
- system prompt；
- tools；
- denylist；
- permission mode；
- background；
- max turns；
- 自动委派。

来源：[S19]

---

### 5.15 CodeArts Agent

目录：

```text
~/.codeartsdoer/agents/
<project>/.codeartsdoer/agents/
```

官方 CLI 文档明确给出：

```yaml
---
description: Agent description
mode: subagent
model: provider/model-id
tools:
  write: false
  edit: false
  bash: false
  read: true
---
```

支持：

- `primary / subagent / all`；
- 角色级模型；
- 角色级工具权限；
- 项目级和用户级；
- description-driven 自动调用；
- GUI、本地和云 Agent；
- 企业、团队、项目、用户等更多层级。

这是完整支持的明确证据，而不是通过 CodeArts 的普通“模型管理”功能推断得出。

来源：[S24]

---

### 5.16 CodeBuddy Code

目录：

```text
~/.codebuddy/agents/
<project>/.codebuddy/agents/
```

字段包括：

```text
name
description
model
tools
disallowedTools
permissionMode
skills
mcpServers
effort
maxTurns
background
memory
system prompt
```

还支持：

- CLI 临时定义 Agent；
- 项目/用户/插件 Agent；
- built-in Agent 的独立模型覆盖；
- Global/Project 模型保存；
- model inheritance；
- resumable subagents；
- background subagents；
- nested agents；
- description-driven 自动委派。

CodeBuddy 的当前实现已经比 Foremanatee 预想的配置层更完整。

来源：[S23]

---

### 5.17 CoStrict / CSC

目录：

```text
~/.costrict/agents/
<project>/.costrict/agents/
```

每个 Subagent 有：

- 独立上下文；
- system prompt；
- model；
- tools；
- permissions；
- 用户和项目作用域。

CSC 使用 description 决定何时自动委派，还原生区分 Subagents 和 Agent Teams。

来源：[S20]

---

### 5.18 iFlow

目录：

```text
~/.iflow/agents/
<project>/.iflow/agents/
```

支持：

```text
agentType
systemPrompt
whenToUse
model
allowedTools
allowedMcps
inheritance
proactive
```

可以通过描述自动匹配，也可显式 `$agent` 调用。

来源：[S21]

---

### 5.19 ForgeCode

目录包括用户级 Agent 和：

```text
<project>/.forge/agents/
```

Agent 可定义：

```text
model
provider
temperature
top_p
top_k
max_tokens
max_turns
tools
reasoning
user_prompt
description
tool_supported
```

`tool_supported: true` 允许该 Agent 被其他 Agent 当作工具调用；同时必须提供 `description` 才能加入可调用 Agent 目录。

这已经构成模型驱动的专业 Agent 调度。

来源：[S25]

---

### 5.20 GitHub Copilot

目录：

```text
~/.copilot/agents/
<project>/.github/agents/
```

`.agent.md` 可以定义：

- 模型；
- tools；
- MCP；
- description；
- system instructions。

Copilot 可以根据任务选择 Agent，也支持 CLI 的显式 `--agent`。

需要区分：

- Copilot CLI；
- IDE 扩展；
- GitHub Cloud Coding Agent。

三者对 Prompt、Agent 和工具文件的消费表面并不完全相同，但 Custom Agent 这一核心能力已经成立。

来源：[S26]

---

### 5.21 Mistral Vibe

目录：

```text
~/.vibe/agents/
<project>/.vibe/agents/
```

可声明：

```text
agent_type = subagent
active_model
system prompt
tools
permissions
```

可以通过 task/delegation 机制调用。

来源：[S28]

---

### 5.22 Antigravity

Antigravity 提供：

- 自定义 workflow-specific agents；
- 用户和项目作用域；
- 模型；
-工具；
- 角色 instructions；
- 异步、并发 subagents；
- 自动和显式委派。

OpenSpec 还需要特别处理其目录迁移：

```text
旧：.agent/
新：.agents/
```

这是 OpenSpec 自身兼容层的需要，不意味着 Antigravity 缺少专业 Agent 能力。

来源：[S22][S01]

---

### 5.23 Devin Desktop / CLI

支持：

- 自动或显式调用；
- foreground/background；
- 模型；
- prompt；
- allowed tools；
- max nesting；
- 项目 Agent；
- 用户 Agent；
- `.devin/agents` 和部分共享 `.agents` 路径。

Custom Subagents 的能力较完整，但官方仍将部分功能标为 experimental。

OpenSpec 中的 `devin` 是当前目标；`windsurf` 仅是兼容别名。Windsurf 于 2026-06-02 重新命名为 Devin Desktop。

来源：[S23][S01]

---

### 5.24 Junie

目录包括：

```text
~/.junie/agents/
<project>/.junie/agents/
<project>/.agents/
```

字段包括：

- tools；
- disallowedTools；
- MCP；
- model；
- reasoningLevel；
- maxTurns；
- skills；
- prompt。

Junie 根据 Agent 名称和 description 自动委派。当前 Subagents 设置仍处于 EAP，因此能力完整性与成熟度应分开看待。

来源：[S22]

---

### 5.25 Trae / TraeCode

当前官方文档说明：

- 可以创建自定义 Agent；
- 支持项目 Agent 和用户 Agent；
- Subagent 由内置 Agent 根据任务类型和 description 选择；
- 可配置模型、提示词、MCP 和内置工具；
- 支持显式和自动委派。

由于官方网页采用大量动态渲染，部分字段的可抓取文本不如其他产品完整，因此本报告将其“能力等级”列为 A，“文档置信度”列为中等。

来源：[S27]

---

## 6. B 类：强部分支持的 8 个 Harness

### 6.1 Amazon Q Developer

历史 Amazon Q CLI 支持：

- Custom Agent Profile；
- model；
- prompt；
- tools/MCP；
- 用户和项目配置。

后期还加入过 Delegate 实验，可启动异步 subagent，并计划支持带具体工具权限的 Custom Agent。

但问题在于：

1. Custom Agent Profile 最初更接近可切换的主 Agent Profile；
2. Delegated Custom Agent 并未形成像 Kiro 那样稳定、完整的角色体系；
3. Amazon Q Developer CLI 已正式迁移为 Kiro CLI；
4. 新功能主要进入 Kiro，而不是继续增强旧 Q CLI。

因此 Amazon Q 本身应按“遗留强部分支持”评估，而 Kiro 单独列为 A。

来源：[S39]

---

### 6.2 IBM Bob Shell

Bob 支持：

```text
.bob/agents/
```

其中 Agent Persona 可以定义：

- subagent 角色；
-关注内容；
-输出格式；
-约束；
-工具。

Bob 主 Agent 会使用 Subagent 工具调用这些 Persona。

当前公开资料的主要缺口：

- 未明确看到每 Persona 独立模型字段；
- 项目级 `.bob/agents/` 很清楚；
- 用户级可复用 Subagent Persona 的公开文档不如项目级明确。

所以它已有真正的专业 subagent，但还不能视为完整的“角色级模型路由系统”。

来源：[S30]

---

### 6.3 Cline

Cline Core 已有实验性的 Subagents：

- 并行运行；
- 独立 context；
- 专注只读调查；
- 自动由主 Agent 生成任务。

Cline SDK 和 Plugin 示例又进一步支持：

- 全局和项目 Agent Definition；
- providerId；
- modelId；
- systemPrompt；
- tools；
- skills；
- maxIterations；
- 专用 subagent tool。

上游测试甚至验证了：

```yaml
name: reviewer
description: Reviews code
providerId: openai
modelId: gpt-4.1
tools: Execute_Command, Read_File, Use_Skill
```

但 Cline 用户文档中的第一方 Subagents 功能仍标为 Experimental，完整的 Custom Agent Registry 更多暴露在 SDK/Plugin Runtime，而不是所有普通用户都能稳定使用的主界面功能。

因此应评为：

```text
技术底层已经基本具备
产品表面仍在整合
```

来源：[S29][S30]

---

### 6.4 Kimi Code CLI

Kimi Agent YAML 可以定义：

- name；
- system prompt；
- tools；
- exclude_tools；
- subagents；
- inheritance。

主 Agent 可以定义多个命名 subagent：

```yaml
subagents:
  coder:
    path: ./coder-sub.yaml
    description: Handle coding tasks
  reviewer:
    path: ./reviewer-sub.yaml
    description: Code review expert
```

默认又有：

```text
coder
explore
plan
```

`Agent` 工具允许在 spawn 时显式传入 `model`。

项目和用户层的 Agent/Skill discovery 也已经存在。

主要缺口是：

- 模型通常通过 `Agent.model` 参数、默认模型或 secondary model pool 选择；
- 导入部分其他 Harness 的 Agent 定义时，持久化 `model` 字段可能被忽略；
- 尚未形成统一、稳定的“每个 Agent 文件固定模型”语义。

所以 Kimi 的专业 Agent 系统成立，但角色级模型绑定较 Codex、OpenCode 和 OMP 弱。

来源：[S31]

---

### 6.5 Lingma / Qoder CN CLI

Qoder CN CLI 支持：

- `/agents` 创建 Agent；
- User / Project 两种作用域；
- description；
- system prompt；
- 独立 context；
- 独立工具权限；
- 自动和显式调用。

主要缺口：

- 公开 Custom Agent schema 中，角色级持久化 `model` 字段不如国际版 Qoder 明确；
- 模型更多通过主模型 selector 或 Session 配置选择。

需要注意：

```text
OpenSpec 的 qoder
≠
OpenSpec 的 lingma
```

`qoder` 对应国际 Qoder；`lingma` 当前主要对应 Alibaba Cloud 的 Qoder CN / Lingma 兼容路径。两者不能因为名称接近而合并评估。

来源：[S32]

---

### 6.6 MiniMax Code

MiniMax Code 当前提供：

- Agent Team；
- specialized agents；
- planning / implementation / verification 分工；
-自动组建和协调团队；
- Custom Agents / Experts / Skills；
-工作区上下文；
-工具和权限控制。

但是从“可移植配置协议”的角度，当前公开资料没有清晰证明：

```text
用户级目录中的 Agent 文件
+
项目级目录中的 Agent 文件
+
每个文件独立固定模型
+
每个文件独立工具权限
+
明确的同名覆盖规则
```

其产品能力可能比一个传统 subagent registry 更强，但配置表面更偏向应用内 Team/Expert 管理，而不是可提交到仓库的透明 Agent Definition。

所以应评为强部分支持，而不是没有多 Agent。

来源：[S33]

---

### 6.7 Zoo Code

Zoo Code 通过：

- Custom Modes；
- Orchestrator；
- Boomerang Tasks；
- `new_task`；

实现专业角色委派。

Custom Mode 可以定义：

- role definition；
- custom instructions；
- tool groups；
-权限；
-全局或项目作用域。

缺口主要在模型：

- Mode 与模型可以组合使用；
- 但模型通常属于 UI/Profile/当前模式状态；
- 公开 schema 不如 Codex/OpenCode 那样把 `model` 稳定写入每个 delegated Agent Definition。

这在功能上接近 Foremanatee，但配置模型不同，应归为 B。

来源：[S34]

---

### 6.8 ZCode

ZCode 的 Custom Subagents 当前为 Beta，支持：

- 独立模型；
- instructions；
- tools / permissions；
- 自动委派；
- 用户级持久化。

当前公开文档主要描述用户级 Agent，尚未明确项目级/仓库级 Agent Definition。

因此它缺的不是角色级模型，而是项目作用域和成熟度。

来源：[S35]

---

## 7. C 类：有限支持的 3 个 Harness

### 7.1 Crush

Crush 内部提供两个 Agent：

```text
Coder
Task
```

其中：

- Coder 使用 large model 和完整工具；
- Task 主要用于只读搜索和实现调查；
- `agent` 工具可以自动创建 Task Agent。

但当前源码中的：

```go
Agents map[string]Agent `json:"-"`
```

不会从用户配置反序列化。

`SetupAgents()` 中的 Coder/Task 也是硬编码的。

这意味着用户目前不能通过 `crush.json` 持久化定义：

- reviewer；
- debugger；
- planner；
- 不同角色模型；
- 不同角色 prompt。

Crush 有 subagent，但没有用户可配置的专业角色注册表。

来源：[S36]

---

### 7.2 Hermes Agent

Hermes 提供：

```text
delegate_task
```

可以：

- 创建 fresh child context；
- 并行执行任务；
- 使用指定的 delegation provider/model；
- 通过 fallback chain 切换模型。

但其主要配置形态是：

```text
一个全局 delegation provider
一个全局 delegation model
一个全局 fallback chain
```

并没有成熟的：

```text
reviewer → 模型 A + 工具集 A
debugger → 模型 B + 工具集 B
researcher → 模型 C + 工具集 C
```

Hermes 的 Profiles 更接近完整顶层 Agent 配置，而不是主 Agent 可自动选择的 child role registry。

所以 Hermes 能委派，但不等于支持 Foremanatee 所设想的角色化配置。

来源：[S37]

---

### 7.3 Zed Agent

Zed 有：

```text
spawn_agent
```

但当前子 Agent 主要是匿名 child：

- 沿用或继承父线程工具；
- 通过统一的 `agent.subagent_model` 设置选择模型；
- 没有用户注册的 reviewer/debugger/researcher 等命名 child profiles；
- Agent Profile 主要控制交互线程的工具，而不是可由父 Agent 自动选择的专业 subagent。

因此 Zed 支持多 Agent 执行，却不支持完整的角色化 subagent 配置。

来源：[S38]

---

## 8. D 类：依赖扩展的 Harness

### 8.1 Pi

Pi Core 的设计倾向是：

```text
Core 保持简单
Subagent 由 Extension 实现
```

官方仓库提供了 subagent extension 示例，社区也有 `pi-subagents` 等扩展，可以实现：

- Agent 定义；
- 不同模型；
- 不同提示词；
- 不同工具；
- 用户和项目作用域；
- 并行和嵌套调用。

因此“Pi 做不到”并不准确；更准确的说法是：

```text
Pi Core 不承诺一个稳定的原生自定义 subagent schema，
具体能力由安装的 Extension 决定。
```

OMP 已经在 Pi 基础上补齐了这层，所以对 OMP 用户没有必要再开发 Foremanatee。

来源：[S40]

---

## 9. E 类：未发现原生支持

### 9.1 Continue

Continue 支持：

- Agent mode；
- model config；
- rules；
- MCP；
- custom prompts；
- user/workspace configuration；
- tools 和权限。

但这些主要定制的是当前主 Agent。

本轮没有发现一个第一方、稳定的：

```text
命名 custom subagent
→ 独立模型
→ 独立提示词
→ 独立工具
→ 主 Agent 自动调用
```

的角色注册系统。

因此 Continue 是 OpenSpec 当前清单中最明确的“不满足 Foremanatee 核心能力”的 Harness。

但这并不足以支撑开发一个跨 39 个 Harness 的 Runtime：为一个例外产品建设通用路由层，成本明显大于收益。

来源：[S39]

---

## 10. U 类：间接或证据不足

### 10.1 SourceCraft Code Assistant

OpenSpec 的 SourceCraft 目标主要针对：

```text
.codeassistant/
```

以及 SourceCraft 的 VS Code 扩展 Skills/Commands。

SourceCraft CLI 则明确内嵌了 OpenCode：

```text
SourceCraft CLI
└── built-in OpenCode AI agent
```

所以 SourceCraft CLI 在实际使用中可以继承 OpenCode 的完整 custom-agent 能力。

但是，本轮没有在 SourceCraft Code Assistant 的独立官方文档中确认：

- `.codeassistant/agents/`；
- 用户级 custom subagent；
- 项目级 custom subagent；
- per-agent model；
- per-agent permission；
- 独立于 OpenCode 的自动 delegation schema。

因此不能简单把 OpenCode 的能力归功于 SourceCraft VS Code 扩展本身。

合理结论是：

```text
SourceCraft CLI：通过内嵌 OpenCode 间接拥有完整能力
SourceCraft Code Assistant 扩展：独立能力未证实
```

来源：[S41]

---

## 11. 主流 Harness 已形成的共同最佳实践

尽管配置文件格式不同，当前主流产品已经明显收敛到同一套模式。

### 11.1 Description 是路由规则

多数 Harness 都会将 Agent 的 `description` 暴露给主 Agent。

它不是单纯的人类文档，而是：

```text
主 Agent 何时调用这个角色的语义路由提示
```

典型模式：

```yaml
name: reviewer
description: >
  Review code for correctness, regressions, security risks, and missing tests.
  Use after non-trivial implementation and do not modify files.
```

这已经原生解决 Foremanatee 准备通过 SessionStart 提示词完成的角色选择问题。

---

### 11.2 模型与角色绑定已很普遍

常见配置：

```yaml
model: provider/model
```

或：

```toml
model = "provider/model"
reasoning_effort = "high"
```

或：

```yaml
models:
  - provider/primary
  - provider/fallback
```

因此以下分工可以直接由 Harness 原生表达：

```text
explorer   → 便宜、长上下文、只读模型
researcher → 搜索与来源判断较强的模型
planner    → 架构推理模型
implementer→ 编辑可靠的代码模型
debugger   → 因果诊断模型
reviewer   → 独立评审模型
verifier   → 工具调用稳定的测试模型
```

---

### 11.3 角色级最小权限已成为标准

成熟 Harness 普遍允许：

```text
reviewer:
  Read / Grep / Glob / Bash-readonly

implementer:
  Read / Write / Edit / Bash

researcher:
  WebSearch / Fetch / Read

verifier:
  Read / Bash / test tools
```

这比 Foremanatee 的纯提示词约束更可靠，因为很多 Harness 在 Runtime 层真正移除了未授权工具。

---

### 11.4 用户级 + 项目级已经普及

常见模式：

| Harness | 用户级 | 项目级 |
|---|---|---|
| Codex | `~/.codex/agents/` | `.codex/agents/` |
| Claude Code | `~/.claude/agents/` | `.claude/agents/` |
| OpenCode | `~/.config/opencode/agents/` | `.opencode/agents/` |
| OMP | `~/.omp/agent/agents/` | `.omp/agents/` |
| Gemini CLI | `~/.gemini/agents/` | `.gemini/agents/` |
| Cursor | `~/.cursor/agents/` | `.cursor/agents/` |
| Kiro | `~/.kiro/agents/` | `.kiro/agents/` |
| Qoder | `~/.qoder/agents/` | `.qoder/agents/` |
| CodeBuddy | `~/.codebuddy/agents/` | `.codebuddy/agents/` |
| CodeArts | `~/.codeartsdoer/agents/` | `.codeartsdoer/agents/` |
| CoStrict | `~/.costrict/agents/` | `.costrict/agents/` |
| Mistral Vibe | `~/.vibe/agents/` | `.vibe/agents/` |
| GitHub Copilot | `~/.copilot/agents/` | `.github/agents/` |

Foremanatee 原先设计的：

```text
全局默认
→ 项目覆盖
→ 项目缺失回退全局
```

已经是主流 Harness 的原生设计，而不是一个空白市场。

---

### 11.5 原生角色配置优于 SessionStart 提示词

原生 Agent Definition 的优势包括：

- 不占主会话上下文；
- 不受 compact 影响；
- 创建 child 时重新解析；
- 模型字段经过 Harness 校验；
- 工具权限由 Runtime 强制执行；
- UI 能显示 Agent 名称；
- 可以独立限制 max turns；
- 可以挂载 Agent-specific MCP；
- 可以持久化 memory；
- 可以运行 background/worktree；
- 可以由插件直接分发；
- 可以由项目版本控制。

相比之下，SessionStart 注入只是：

```text
告诉主模型“请记得按这些规则调用工具”
```

它是软约束，可靠性和可观测性都低于原生配置。

---

## 12. 各 Harness 仍存在的真实差异

“多数 Harness 支持”不等于它们已经形成统一标准。

### 12.1 文件格式不同

| Harness | 典型格式 |
|---|---|
| Codex | TOML |
| Claude Code | Markdown + YAML frontmatter |
| OpenCode | JSON / JSONC / Markdown |
| OMP | Markdown + 自定义 frontmatter |
| Gemini CLI | Markdown + YAML frontmatter |
| Kimi Code | YAML + 外部 prompt 文件 |
| Kiro | JSON / Markdown |
| Qoder | Markdown + YAML |
| GitHub Copilot | `.agent.md` |
| ForgeCode | Markdown + YAML |
| Zoo Code | Custom Mode YAML/JSON |

---

### 12.2 字段名称不同

同一含义可能写成：

```text
model
modelId
active_model
provider + model
models[]
model_role
```

权限可能写成：

```text
tools
allowedTools
disallowedTools
permissions
permissionMode
sandbox_mode
tool_groups
```

所以跨 Harness 配置仍不能无损复制。

---

### 12.3 冲突优先级不同

大多数产品采用：

```text
项目 > 用户
```

但不同 Harness 还有：

- CLI 临时配置；
- Session Agent；
- Plugin Agent；
- Organization Agent；
- Managed Agent；
- Enterprise Agent；
- Extension Agent；
- Cloud Agent。

它们的优先级并不统一。

---

### 12.4 模型继承语义不同

可能包括：

```text
省略 model → 继承父模型
省略 model → 使用全局 subagent model
省略 model → 使用角色默认模型
省略 model → 使用 product variant
```

有些 Harness 支持：

```text
模型候选链
```

有些只支持：

```text
一个固定模型
```

---

### 12.5 自动委派并非确定性路由

即使 Agent 有 description，最终是否调用仍由主模型判断。

原生配置解决的是：

```text
角色可发现
角色可选择
角色配置可执行
```

而不是严格保证：

```text
每次匹配某类任务都 100% 调用同一角色
```

需要强制执行时，仍然可能使用：

- Workflows；
- Commands；
- Skills；
- Hooks；
-显式 orchestration prompt；
-程序化 SDK。

但这已经属于工作流编排问题，而不是“缺少角色级模型配置”。

---

## 13. 对 Foremanatee 的重新评估

### 13.1 原产品定位

Foremanatee 原本计划实现：

```text
一套跨 Harness 工种体系
→ 为不同工种选择不同模型
→ 全局配置和项目覆盖
→ 读取模型目录
→ 在 SessionStart / compact 后注入提示词
→ 指导主 Agent 创建 subagent
```

### 13.2 已被原生 Harness 覆盖的部分

| Foremanatee 需求 | 主流 Harness 原生状态 |
|---|---|
| 命名专业 Agent | 普遍支持 |
| 每角色独立模型 | 普遍支持 |
| 每角色独立提示词 | 普遍支持 |
| 每角色工具权限 | 普遍支持 |
| 用户级配置 | 普遍支持 |
| 项目级配置 | 普遍支持 |
| 项目覆盖用户默认 | 普遍支持 |
| 自动根据 description 委派 | 普遍支持 |
| 子 Agent 独立上下文 | 普遍支持 |
| compact 后仍有效 | 原生配置层天然有效 |
| 模型不存在时校验 | 多数 Harness 在加载或 spawn 时校验 |
| 只读 reviewer/explorer | 多数 Harness 可由工具权限强制 |
| background / parallel | 大量 Harness 原生支持 |

### 13.3 Foremanatee 运行时方案的劣势

继续开发会带来：

1. 与各 Harness 原生 Agent Registry 重复；
2. 需要长期跟踪 39 套生命周期和工具 schema；
3. 无法统一各种 provider/model ID；
4. 无法通过一段提示词强制真正的权限隔离；
5. 无法无损映射 MCP、Skills、memory、worktree、background；
6. 容易与 Harness 自己的自动委派提示冲突；
7. 可能占用每个 Session 的上下文；
8. compact、resume、fork 等兼容成本很高；
9. 上游一旦改变 Agent schema，适配层容易失效；
10. 对能力弱的 Harness，又只能提供“建议”，无法提供真正的独立专业 Agent。

这是典型的高维护、低新增价值项目。

---

## 14. 仍可能存在的一个小型项目方向

Foremanatee 唯一仍可能有价值的形态不是 Runtime，而是：

```text
静态 Agent Profile 编译器 / 同步器 / Linter
```

例如：

```text
canonical-agents/
├── explorer.yaml
├── researcher.yaml
├── planner.yaml
├── implementer.yaml
├── debugger.yaml
├── reviewer.yaml
└── verifier.yaml

renderers/
├── codex
├── claude
├── opencode
├── omp
├── gemini
└── qoder
```

然后生成：

```text
.codex/agents/
.claude/agents/
.opencode/agents/
.omp/agents/
.gemini/agents/
.qoder/agents/
```

它可以负责：

- 静态格式转换；
- 校验必需字段；
- 检查危险权限；
- 检查项目 Agent 是否引用未知模型；
- 检查全局/项目定义漂移；
- 输出差异；
- 从一个 canonical role 生成多个 Harness 文件；
- 不进入 Runtime；
- 不注册 Hook；
- 不注入 Prompt；
- 不管理 API Key；
- 不代理请求。

但即使这个小方向，也不应立即建设，原因是：

1. 你当前真正长期使用的 Harness 数量未必足够多；
2. 各 Harness 的角色语义并非完全等价；
3. 有些产品已经开始导入其他 Harness 的 Agent 文件；
4. `.agents/` 正在成为部分产品共享的配置根；
5. 你已有 chezmoi，可以低成本管理少量模板；
6. 手写七个角色的多套模板，短期可能比维护一个 transpiler 更简单。

合理的启动条件应是：

```text
至少同时长期维护 3 个以上 Harness
且
相同 Agent 修改经常需要手工同步
且
已经出现真实配置漂移或错误
```

在此之前，不应为了假想需求创建第二个项目。

---

## 15. 推荐处置方案

### 15.1 停止 Foremanatee Runtime 项目

停止以下工作：

- SessionStart Hook；
- compact 重注入；
-通用路由提示词；
-动态模型目录注入；
-跨 Harness Runtime Adapter；
-`.foremanatee/config.toml`；
-角色化模型候选 Runtime；
-V1/V2 提示词模拟；
-自动模型 fallback 提示。

### 15.2 保留调研成果

可以把当前资料保留为：

```text
notes/custom-subagent-harness-survey.md
```

用途：

- 以后配置不同 Harness；
- 比较 Agent schema；
- 选择主力工具；
- 编写 chezmoi 模板；
- 观察跨 Harness 标准化趋势。

### 15.3 直接使用 Harness 原生功能

对你最常用的几套工具，建议直接配置：

```text
Codex:
  ~/.codex/agents/
  .codex/agents/

OMP:
  ~/.omp/agent/agents/
  .omp/agents/
  modelRoles

OpenCode:
  ~/.config/opencode/agents/
  .opencode/agents/

Kimi Code:
  自定义 Agent YAML
  Agent 工具 model 参数
  secondary model pool
```

### 15.4 使用 chezmoi 管理用户级 Agent

你的用户级配置已经适合交给 chezmoi：

```text
dot_codex/agents/
dot_omp/agent/agents/
dot_config/opencode/agents/
dot_kimi-code/agents/
```

对于名称、提示词或模型 ID 的少量差异，可使用 chezmoi 模板变量，而不是另建 Runtime。

---

## 16. 最终工程决策

### 决策

```text
Foremanatee：No-Go
```

### 理由

```text
核心需求已成为主流 Harness 的原生能力；
严格口径下 64.1% 完整支持；
84.6% 至少完整或强部分支持；
主流头部 Harness 的覆盖率更高；
剩余例外不足以支撑跨 Harness Runtime 的维护成本。
```

### 不应继续开发的形态

```text
多 Harness subagent 路由插件
SessionStart 策略注入器
自定义 Agent 替代层
统一 Runtime Policy Layer
跨 Harness 自动模型路由器
```

### 未来仅在出现真实维护痛点后考虑的形态

```text
静态 Agent Profile Generator
Agent Definition Linter
跨 Harness 配置同步器
模型 ID Mapping Checker
chezmoi Agent 模板集合
```

---

## 17. 最终结论

扩大到 OpenSpec 支持的全部 Harness 后，结论比上一轮更加精确：

1. **并非每一个 Harness 都完整支持自定义专业 subagent。**
2. OpenSpec 的“支持”只表示 Skills/Commands 投递兼容，不能直接用于推断多 Agent 能力。
3. 但在 39 个实际 Harness 中：
   - 25 个已经完整原生支持；
   - 8 个强部分支持；
   - 合计超过八成。
4. Codex、Claude Code、OpenCode、OMP、Gemini CLI、Cursor、Kilo、Kiro、Qoder、Qwen Code、CodeBuddy、CodeArts、CoStrict、iFlow 等主流产品均已具备足够强的原生角色配置能力。
5. Foremanatee 原设计的大部分价值，已经被这些 Harness 自己实现。
6. 少数缺失者通常需要的是原生 Runtime 改进，而不是一层通用提示词注入。
7. 因此，停止 Foremanatee Runtime 项目是正确的工程决策。

最经济的实际方案是：

```text
用各 Harness 的原生 Custom Agent
+
用 chezmoi 管理用户级配置
+
项目级 Agent 随仓库提交
+
只在真实出现多套配置漂移后，再考虑极薄的静态生成器
```

---

# 18. 主要来源

以下来源均在 2026-09-09 前后核对。优先使用官方文档和上游源码。

## OpenSpec

[S01] OpenSpec Supported Tools  
https://github.com/Fission-AI/OpenSpec/blob/main/docs/supported-tools.md

[S02] OpenSpec 当前 AI_TOOLS 清单  
https://github.com/Fission-AI/OpenSpec/blob/main/src/core/config.ts

[S03] OpenSpec Releases  
https://github.com/Fission-AI/OpenSpec/releases

## 完整原生支持

[S04] OpenAI Codex — Subagents and Custom Agents  
https://learn.chatgpt.com/docs/agent-configuration/subagents?surface=app

[S05] Claude Code — Subagents  
https://code.claude.com/docs/en/sub-agents

[S06] OpenCode — Agents  
https://opencode.ai/docs/agents/

[S07] Oh My Pi — Task Agent Discovery  
https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md

[S08] Oh My Pi — Settings and modelRoles  
https://github.com/can1357/oh-my-pi/blob/main/docs/settings.md

[S09] Gemini CLI — Subagents  
https://geminicli.com/docs/core/subagents/

[S10] Cursor — Subagents  
https://cursor.com/docs/subagents

[S11] Kilo Code — Custom Subagents  
https://kilo.ai/docs/customize/custom-subagents

[S12] Kiro — Custom Agents  
https://kiro.dev/docs/custom-agents/

[S13] Kiro — Subagents  
https://kiro.dev/docs/chat/subagents/

[S14] Qoder — Subagent  
https://docs.qoder.com/cli/subagent

[S15] Qwen Code — Sub-agents  
https://qwenlm.github.io/qwen-code-docs/en/users/features/sub-agents/

[S16] Rovo Dev CLI — Use Subagents  
https://support.atlassian.com/rovo/docs/use-subagents-in-rovo-dev-cli/

[S17] Factory — Subagents  
https://docs.factory.ai/harness/subagents

[S18] Augment / Auggie CLI — Subagents  
https://docs.augmentcode.com/cli/subagents

[S19] Command Code — Agents  
https://commandcode.ai/docs/agents

[S20] CoStrict / CSC — Custom Subagents  
https://docs.costrict.ai/en/csc/agent/sub-agents

[S21] iFlow — Subagent Example and Configuration  
https://platform.iflow.cn/en/cli/examples/subagent

[S22] Junie CLI — Subagents  
https://junie.jetbrains.com/docs/junie-cli-subagents.html

[S23] Devin CLI — Subagents  
https://docs.devin.ai/cli/subagents

[S24] Antigravity — Subagents  
https://antigravity.google/docs/subagents/

[S25] CodeBuddy Code — Sub-Agents  
https://www.codebuddy.ai/docs/cli/sub-agents

[S26] CodeArts Agent CLI — Agents  
https://support.huaweicloud.com/intl/en-us/usermanual-cli/codeartsagent_cli_0031.html

[S27] ForgeCode — Create an Agent  
https://forgecode.dev/docs/creating-agents/

[S28] GitHub Copilot — Custom Agents Configuration  
https://docs.github.com/en/copilot/reference/custom-agents-configuration

[S29] TraeCode — Subagents  
https://docs.trae.ai/ide/subagents?_lang=en

[S30] Mistral Vibe — Agents  
https://docs.mistral.ai/vibe/code/cli/agents

## 强部分支持

[S31] Cline — Subagents  
https://docs.cline.bot/features/subagents

[S32] Cline upstream configured-agent execution test  
https://github.com/cline/cline/blob/main/sdk/packages/core/src/runtime/orchestration/runtime-builder.configured-agent-execution.test.ts

[S33] IBM Bob — Agent Personas  
https://bob.ibm.com/docs/ide/configuration/agent-personas

[S34] IBM Bob — Subagents  
https://bob.ibm.com/docs/ide/features/subagents

[S35] Kimi Code CLI — Agents and Subagents  
https://github.com/MoonshotAI/kimi-cli/blob/main/docs/en/customization/agents.md

[S36] Lingma / Qoder CN — Subagent  
https://help.aliyun.com/en/lingma/subagent

[S37] MiniMax Code — AI Coding Agent and Agent Team  
https://agent.minimax.io/tools/ai-coding-agent

[S38] Zoo Code — Custom Modes  
https://docs.zoocode.dev/features/custom-modes

[S39] Zoo Code — Boomerang Tasks  
https://docs.zoocode.dev/features/boomerang-tasks

[S40] ZCode — Subagents  
https://zcode.z.ai/en/docs/subagents

## 遗留、有限和扩展型

[S41] Amazon Q Developer CLI 已迁移至 Kiro  
https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line.html

[S42] Amazon Q Developer CLI Delegate 实验源码  
https://github.com/aws/amazon-q-developer-cli/blob/main/docs/experiments.md

[S43] Crush 内置 Agent 设置源码  
https://github.com/charmbracelet/crush/blob/main/internal/config/config.go

[S44] Hermes Agent — Delegation  
https://hermes-agent.nousresearch.com/docs/user-guide/features/delegation

[S45] Hermes Agent — Configuration  
https://hermes-agent.nousresearch.com/docs/user-guide/configuration

[S46] Zed — Agent Tools  
https://zed.dev/docs/ai/tools

[S47] Zed — Agent Settings  
https://zed.dev/docs/ai/agent-settings

[S48] Continue — Customize Agent Mode  
https://docs.continue.dev/ide-extensions/agent/how-to-customize

[S49] Pi 官方 Subagent Extension 示例  
https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/examples/extensions/subagent/index.ts

## SourceCraft

[S50] SourceCraft CLI — 内嵌 OpenCode Agent  
https://sourcecraft.dev/portal/docs/en/sourcecraft/operations/cli-quickstart

[S51] SourceCraft Code Assistant  
https://sourcecraft.dev/portal/docs/en/code-assistant/

---

## 19. 调查限制

1. 部分闭源产品的文档使用动态 JavaScript 渲染，字段可抓取性有限。
2. Devin、Junie、Cline、ZCode 等部分功能仍是 Experimental、EAP 或 Beta。
3. 产品更新速度很快，本报告是 2026-09-09 的截面。
4. “支持模型字段”不代表指定模型一定能被当前账户、provider 或订阅调用。
5. “支持自动委派”不代表模型每次都会作出相同选择。
6. SourceCraft 的 CLI 与 IDE Code Assistant 并不是完全相同的 Agent Runtime。
7. Amazon Q Developer CLI 已经迁移到 Kiro，旧文档主要用于理解历史兼容性。
8. OpenSpec 可能继续增加 Harness，因此未来数量和比例会发生变化。
9. 本报告评价的是“配置能力”，不是各 Harness 多 Agent 实际效果、质量或稳定性的排名。
