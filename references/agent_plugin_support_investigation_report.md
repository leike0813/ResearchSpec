# 主流 Coding Agent 原生插件 / 扩展机制调查

> **调查日期：2026-08-29**  
> **调查对象：** Codex、Claude Code、OpenCode、Kilo Code、Pi、OMP / Oh My Pi、Command Code、Kimi Code、Cline、Gemini CLI、GitHub Copilot CLI、Cursor、Qwen Code、Kiro、Goose。  
> **调查口径：** 本文只讨论各宿主的**原生插件、扩展或 Hook ABI**。单独的 Agent Skill、MCP Server，以及只把 Skill 和 MCP 打进一个目录的“插件包”，不视为完整的原生插件机制。

---

## 1. 本文所说的“原生插件”是什么

本文把下列能力中的至少一种视为“宿主原生插件能力”：

- 向 Agent 注册新的原生工具、Provider、认证方式或模型目录；
- 拦截或修改 Agent Loop、模型请求、工具调用、上下文压缩或权限判断；
- 注册宿主专用 Hook、命令、子 Agent、规则、LSP、主题、UI、频道适配器或其他运行时组件；
- 通过宿主提供的 TypeScript / JavaScript / Python 等 API，在宿主进程或受宿主管理的运行时内执行插件代码；
- 通过宿主专用 manifest，把上述能力安装、启用、更新并参与宿主生命周期。

下列情况**不单独计入**原生插件支持：

- 只提供 `SKILL.md`；
- 只声明 MCP Server；
- 只把 Skills 与 MCP 打包成 Agent Plugins / Open Plugin Spec 容器；
- 仅能安装普通编辑器扩展，但不能扩展该 Agent 的运行时；
- 仅通过外部 MCP 间接提供工具，而宿主本身没有插件生命周期或扩展 API。

不过，如果一个宿主原生插件包同时包含 Hook、Agent、Command、LSP 等宿主专用组件，那么这些组件仍属于本文范围。

---

## 2. 分级标准

### 2.1 原生插件能力等级

| 等级 | 含义 |
|---|---|
| **A：通用可执行扩展 ABI** | 插件代码由宿主加载，可注册工具、Hook、Provider、UI、事件监听器等，并直接影响 Agent 运行时。 |
| **B：广义声明式宿主插件** | 插件由 manifest 组织，可贡献宿主专用 Agent、Command、Rule、Hook、LSP 等，但没有通用的进程内编程 API。 |
| **C：有限原生扩展** | 只开放 Hook、频道适配器或其他单一类型的宿主专用扩展点。 |
| **D：没有通用原生插件 ABI** | 所谓“插件”本质上仍只是 Skill、MCP 或静态配置包。 |

### 2.2 探测能力等级

| 等级 | 含义 |
|---|---|
| **S：完整结构化探测** | 能以 JSON / API 区分安装、启用、加载成功、加载失败及错误原因。 |
| **A：结构化安装清单较强** | 能结构化取得安装、版本、来源和启用状态，但运行态仍需额外探针。 |
| **B：主要为人类可读探测** | 有 CLI / UI 清单和错误提示，但没有稳定的机器可读运行状态。 |
| **C：主要依赖文件、配置、日志和冒烟测试** | 没有完整清单或健康状态接口，需要自行关联多个信息源。 |

---

## 3. 核心结论

1. **真正拥有广义可执行插件 API 的工具**主要是 OpenCode 2、Kilo Code、Pi、OMP、Command Code 和 Cline。它们的插件能够直接注册工具、Hook、Provider 或修改运行时行为。
2. **Claude Code、Kimi Code、Gemini CLI、GitHub Copilot CLI、Cursor 和 Qwen Code**更接近“声明式宿主插件”：能够打包 Agent、Command、Hook、LSP、规则等组件，但通常没有一个任意插件都能调用的通用进程内 API。
3. **Codex 在严格口径下属于有限原生插件支持**：插件管理、版本和来源探测很强，但除 Skill / MCP 外，当前最明确的本地宿主专用扩展点主要是生命周期 Hook，而不是通用 TypeScript 插件 ABI。
4. **Kiro Powers 在严格口径下不算完整原生插件系统**。Power 的标准主体仍是 `plugin.json + skills/ + mcp.json`，`dev.kiro/` 主要放 Kiro steering；Kiro 的 Agent Hooks 和自定义 Agent 是宿主能力，但并未形成与 Power 完全统一的通用可执行插件 ABI。
5. **Goose 的原生部分目前主要是命令型 Hooks**；它的插件包除了 Skills 外，只能通过生命周期 Hook 执行本地命令，不能像 OpenCode / Pi 那样注册任意进程内工具或 Provider。
6. **插件探测能力最完整的三款工具是 Claude Code、OpenCode 2 和 Kimi Code**：三者都能给出当前加载成功或失败的结构化状态；Kimi 还能通过 API 暴露 Git 来源、已安装 SHA 和 `updateAvailable`。
7. **没有跨所有 Agent 的原生可执行插件 ABI**。跨宿主兼容主要停留在 Skills、MCP、Hook 配置的部分重用，以及安装时转换。
8. **Kilo Code 与 OpenCode 的兼容关系必须分版本看**：Kilo 对 OpenCode V1 / 旧式插件 API 高度同源；OpenCode 2 官方明确说明 V1 插件不能直接运行，必须迁移到 V2 API。
9. 对任何管理器来说，以下四个状态都不能混为一谈：

   ```text
   已安装 ≠ manifest 有效 ≠ 当前进程已加载 ≠ 插件功能健康
   ```

---

## 4. 总览矩阵

| 工具 | 原生能力等级 | 原生扩展形式 | 可扩展的主要宿主能力 | 安装 / 更新成熟度 | 运行态探测 | 综合判断 |
|---|---:|---|---|---:|---:|---|
| **Codex** | C | `.codex-plugin/plugin.json`、插件内 Hook | 生命周期 Hook；插件信任和策略 | 很强 | 中等偏弱 | 包管理成熟，但不是通用进程内插件 ABI |
| **Claude Code** | B | `.claude-plugin/plugin.json` | Agents、Commands、Hooks、LSP、Monitors、Output Styles、Themes、Channels 等 | 很强 | **S** | 声明式原生插件中最完整 |
| **OpenCode 2** | A | npm / Git / 本地 TS/JS Plugin | 工具、Hook、集成、命令、Agent、Provider、TUI 等 | 强 | **S** | 最强的通用可执行插件 API 之一；V2 仍为 beta |
| **Kilo Code** | A | TS/JS Server / TUI Plugin | 工具、工具拦截、Provider、模型目录、请求变换、压缩、TUI、环境等 | 中强 | B/C | 深度很高，但缺少统一的机器可读清单 |
| **Pi** | A | Pi Extension / Pi Package | 工具、命令、事件、UI、Provider 等 | 强 | B/C | 简洁、开放，但运行健康探测较弱 |
| **OMP** | A | OMP Extension / Tool / Plugin Package | Extensions、Tools、Hooks、Commands、Agents、LSP、Provider 等 | 很强 | A/B | 包管理和 doctor 很强，实际会话仍需冒烟测试 |
| **Command Code** | A（实验） | TypeScript `ModApi` | 工具、命令、Hook、事件、输入拦截、Feed、状态栏、Provider 等 | 强 | B | 能力极深，但 ABI 明确仍是实验性 |
| **Kimi Code** | B | `kimi.plugin.json` | Agents、Commands、Hooks、System Prompt、Session Start 等 | 很强 | **S** | 声明式插件和 REST 探测非常完整，无通用进程内代码 ABI |
| **Cline** | A | TS/JS `AgentPlugin` | 工具、Hook、命令等 | 中强 | C | 可执行插件 API，但当前客户端覆盖面有限 |
| **Gemini CLI** | B | `gemini-extension.json` | Commands、Hooks、Subagents、Policy、Themes、Context、Settings 等 | 很强 | B | 声明式扩展成熟，需重启生效 |
| **GitHub Copilot CLI** | B | `plugin.json` | Agents、Commands、Hooks、Extension Directories、LSP 等 | 很强 | B | 管理和版本体系完整，兼容 Claude manifest 较好 |
| **Cursor** | B | `.cursor-plugin/plugin.json` | Rules、Agents、Commands、Hooks、Variables | 强（主要 UI） | C | 原生组件丰富，但自动化探测接口较弱 |
| **Qwen Code** | B+ | `qwen-extension.json` | Commands、Subagents、Context、Settings；有限的 Channel Plugin | 很强 | B/C | 格式转换能力最强之一，但转换不等于 ABI 兼容 |
| **Kiro** | D / C− | Power + 独立 Agent Hooks | Power 主要是 Skill/MCP；另有 Hook、Custom Agent、Steering | 强（主要 UI） | C | 不应把 Power 直接视作完整可执行插件系统 |
| **Goose** | C | Open Plugin + command Hooks | 生命周期 Hook，可阻止部分工具调用 | 中强 | C | 原生部分仅限 Hook，工具扩展仍主要依赖 MCP |

---

## 5. 安装、版本和运行态探测矩阵

符号说明：

- **✅**：有明确、稳定或结构化的接口；
- **◐**：可以取得，但需要 UI、人类可读输出、文件关联或推断；
- **❌**：没有发现稳定接口；
- **⚠**：接口本身仍标注实验性或 beta。

| 工具 | 安装清单 | 启用状态 | 版本 / 来源 | 当前加载成功或失败 | 可用更新 | 最可靠的探测入口 |
|---|---:|---:|---:|---:|---:|---|
| Codex | ✅ JSON | ✅ JSON | ✅ JSON | ◐ | ◐ | `codex plugin list --json` + `/plugins` + `/hooks` + Hook 冒烟测试 |
| Claude Code | ✅ JSON | ✅ JSON | ✅ JSON | **✅ JSON init event** | ✅ | `claude plugin list --json` + `system/init.plugins` / `plugin_errors` |
| OpenCode 2 | ◐ CLI / config | ✅ API | ◐ 包 spec / `package.json` / SHA | **✅ API** ⚠ | ◐ | `GET /api/plugin` 或插件内 `ctx.plugin.list()` |
| Kilo Code | ◐ 配置 / 缓存 | ◐ 配置 / `KILO_PURE` | ✅ 包 spec / `package.json` | ◐ 日志 / Session Error | ◐ | 配置 + 缓存 + `engines.opencode` + DEBUG 日志 |
| Pi | ✅ CLI | ◐ `pi config` | ✅ npm / Git / `package.json` | ◐ | ◐ | `pi list` + `pi config` + 日志 + 冒烟测试 |
| OMP | ✅ JSON | ✅ JSON / lockfile | ✅ lockfile / package / Git | ◐ doctor / 实际会话 | ◐ | `omp plugin list --json` + `omp plugin doctor` + 冒烟测试 |
| Command Code | ✅ 人类可读 | ◐ disabled 配置 | ◐ package / Git SHA | ✅ 人类可读警告 | ◐ | `cmd mods list` + `.registry` + `/reload` + headless test |
| Kimi Code | **✅ REST** | **✅ REST** | **✅ REST / Git SHA** | **✅ REST** ⚠ | **✅ REST** | `GET /api/v1/plugins` + `/plugins info` + Marketplace API |
| Cline | ◐ 安装结果 JSON | ◐ config | ◐ `package.json` | ◐ `cline config` / test | ❌ | `cline plugin install --json` + `cline config` + 冒烟测试 |
| Gemini CLI | ✅ CLI / TUI | ✅ CLI | ✅ manifest / Git ref | ◐ 重启后人工确认 | ✅ | `/extensions list` + `gemini extensions ...` + 重启测试 |
| Copilot CLI | ✅ CLI | ✅ CLI | ✅ manifest / SHA | ◐ Dashboard / restart | ✅ | `copilot plugin list` + `/plugin` Dashboard + `/restart` |
| Cursor | ◐ Customize UI | ◐ UI | ◐ manifest / Marketplace | ◐ UI / Hook 日志 | ◐ | Customize + 本地目录 + Reload Window + 冒烟测试 |
| Qwen Code | ◐ CLI / UI | ✅ CLI / UI | ✅ manifest / npm / Git | ◐ 重启后确认 | ✅ | `/extensions manage` + 安装目录 + 重启测试 |
| Kiro | ◐ Powers Panel | ◐ UI / 动态激活 | ✅ manifest / Registry | ◐ | ✅ UI | Powers Panel + 文件检查 + Hook / Agent 冒烟测试 |
| Goose | ◐ 安装目录 | ◐ settings | ◐ manifest / Git 元数据 | ◐ 日志 / 冒烟测试 | ◐ / 自动更新 | `~/.agents/plugins` + `disabledPlugins` + 日志 + Hook test |

---

# 6. 各工具详解

## 6.1 Codex

### 原生插件机制

Codex 已有完整的插件安装器、Marketplace 和 JSON 清单。严格排除 Skill 与 MCP 后，目前最明确的本地宿主专用扩展点是**插件内生命周期 Hooks**：

```text
plugin-root/
├── .codex-plugin/
│   └── plugin.json
├── hooks/
│   └── hooks.json
└── scripts/
```

Hook 以宿主外部命令方式执行，可以观察、修改或阻止特定生命周期事件。Codex 会向插件 Hook 注入：

```text
PLUGIN_ROOT
PLUGIN_DATA
CLAUDE_PLUGIN_ROOT
CLAUDE_PLUGIN_DATA
```

其中后两个变量是对既有 Claude 风格插件 Hook 的兼容辅助，但这不代表整个 Claude Code 插件 ABI 可直接运行。

### 安装与更新

```bash
codex plugin add <plugin>
codex plugin list
codex plugin list --json
codex plugin remove <plugin>
codex plugin marketplace add <source>
codex plugin marketplace list --json
codex plugin marketplace upgrade --json
```

`codex plugin list --json` 可返回：

```text
pluginId
name
marketplaceName
version
installed
enabled
source
installPolicy
authPolicy
marketplaceSource
```

### 探测方式

**安装与版本：强。** 直接使用：

```bash
codex plugin list --json
```

**运行态：中等偏弱。** 建议组合：

1. 用 JSON 清单确认 `installed`、`enabled` 和版本；
2. 新建会话，使用 `/plugins` 检查宿主发现结果；
3. 使用 `/hooks` 检查 Hook 是否被发现和信任；
4. 检查启动日志；
5. 触发一个无副作用 Hook，验证事件是否真实到达。

安装或启用插件并不自动信任其 Hook；未获信任的 Hook 会被跳过。因此 `enabled: true` 仍不等于 Hook 已执行。

### 重要限制

- 当前没有公开的、等价于 Claude `plugin_errors` 或 OpenCode `active/failed` 的统一运行态插件列表；
- Codex IDE Extension 当前不应与 Codex CLI 的插件支持混为一谈；
- 严格口径下，Codex 不是 OpenCode / Pi 那种任意 TypeScript 进程内插件平台。

**官方资料：**

- [Codex developer commands](https://developers.openai.com/codex/developer-commands)
- [Codex hooks](https://developers.openai.com/codex/hooks)
- [ChatGPT / Codex plugins overview](https://learn.chatgpt.com/docs/plugins)

---

## 6.2 Claude Code

### 原生插件机制

Claude Code 使用可选的：

```text
.claude-plugin/plugin.json
```

并能由约定目录自动发现组件。排除 Skill 和 MCP 后，原生插件仍可贡献：

- Subagents；
- Markdown Commands；
- Lifecycle Hooks；
- LSP Servers；
- Monitors；
- Output Styles；
- Themes；
- Channels；
- 插件依赖与用户配置等。

它属于**广义声明式宿主插件**：组件能力覆盖很广，但不是 OpenCode / Pi 那种任意插件函数直接注册所有运行时能力的统一进程内 API。

### 安装、更新和校验

```bash
claude plugin install <plugin> [--scope user|project|local]
claude plugin uninstall <plugin>
claude plugin enable <plugin>
claude plugin disable <plugin>
claude plugin update <plugin>
claude plugin list --json
claude plugin details <plugin>
claude plugin validate ./plugin --strict
```

修改 Hooks、Agents、LSP 等组件后，可执行：

```text
/reload-plugins
```

### 探测方式

Claude Code 是当前探测最完整的工具之一。

#### 安装态

```bash
claude plugin list --json
```

可取得版本、来源 Marketplace 和启用状态。

#### 组件清单

```bash
claude plugin details <plugin>
```

可列出插件贡献的 Agents、Hooks、LSP 等组件以及大致上下文成本。

#### 当前会话加载态

在 headless / SDK 的 `system/init` 事件中读取：

```text
plugins         成功加载的插件
plugin_errors   加载失败插件、错误类型和消息
capabilities    当前版本实际实现的协议能力
```

因此 Claude Code 可以明确区分：

```text
已安装
已启用
成功加载
加载失败
失败原因
```

官方建议根据 `capabilities` 做特性探测，而不是只比较 Claude Code 版本号。

### 兼容性

- GitHub Copilot CLI 能直接寻找 `.claude-plugin/plugin.json` 和 Claude Marketplace manifest；
- Qwen Code 能在安装时将 Claude 插件转换为 Qwen Extension；
- Codex 和 OMP 能复用部分 Hook、Marketplace 或声明式资源；
- Claude 专有 Monitor、LSP、Channel、生命周期细节仍不能假定跨宿主完全一致。

**官方资料：**

- [Claude Code plugins reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code headless / init event](https://code.claude.com/docs/en/headless)

---

## 6.3 OpenCode 2

> OpenCode 2 当前仍标注为 beta，插件 API 和 HTTP API 仍可能变化。

### 原生插件机制

OpenCode 2 提供真正的可执行插件 API。插件可以来自：

- npm 包、scoped 包和精确版本；
- npm-compatible Git spec；
- Git branch、tag、完整 commit SHA；
- 本地 `.ts` / `.js` 文件；
- 本地插件目录；
- SDK 注册插件。

插件可扩展工具、Hook、集成、命令、Agent、Provider、TUI 及其他运行时行为。

配置示例：

```jsonc
{
  "plugins": [
    "opencode-acme-plugin",
    "opencode-acme-plugin@1.2.0",
    "@acme/opencode-plugin",
    "./plugins/local.ts",
    {
      "package": "@acme/opencode-plugin",
      "options": {
        "strict": true
      }
    }
  ]
}
```

### 安装与更新

```bash
opencode2 plugin add opencode-acme-plugin@1.2.0
opencode2 plugin list
opencode2 plugin list --builtin
opencode2 plugin remove opencode-acme-plugin@1.2.0
```

精确 npm 版本和完整 Git SHA 会固定；未固定 npm / Git 插件会在后台刷新，但新副本通常到下次 server start 才激活。

### 探测方式

#### 运行态结构化 API

```http
GET /api/plugin
```

返回 `Plugin.Info[]`，其中包含：

```text
id
source
status: active | failed
error       仅失败时存在
tui
```

来源类型可区分：

```text
builtin
package
local
sdk
```

插件内部也可调用宿主上下文中的插件清单能力，例如：

```ts
const plugins = yield* ctx.plugin.list()
```

#### 版本探测缺口

运行态 `Plugin.Info` 没有统一的 `version` 字段，因此需要关联：

- 配置中的 package spec；
- 已安装包的 `package.json.version`；
- Git resolved SHA；
- OpenCode 自身缓存信息。

这意味着 OpenCode 2 对 `active / failed` 的探测非常强，但对“活跃插件的精确解析版本”仍需额外关联。

### V1 / V2 兼容性

OpenCode 2 官方明确说明：

```text
V1 plugins will not work in V2.
```

配置项可以迁移，但插件实现代码必须移植到新的 API。因此：

- OpenCode V1 插件不能直接视为 OpenCode 2 插件；
- Kilo 与 OpenCode V1 的同源性，不意味着 Kilo 插件可直接在 OpenCode 2 运行。

**官方资料：**

- [OpenCode 2 plugins](https://opencode.ai/v2/docs/plugins)
- [OpenCode 2 HTTP API](https://opencode.ai/v2/docs/api)
- [OpenCode V1 to V2 migration](https://opencode.ai/v2/docs/migrate-v1/)
- [OpenCode 2 troubleshooting](https://opencode.ai/v2/docs/troubleshooting/)

---

## 6.4 Kilo Code

### 原生插件机制

Kilo 插件是宿主加载的 TypeScript / JavaScript 模块，并可同时具有 Server 与 TUI 入口。它能：

- 注册新的模型工具；
- 在工具执行前后拦截、修改或阻止调用；
- 监听 Session、Message、Permission、LSP、File 等事件；
- 注册 Provider、认证流程和模型目录；
- 修改模型请求参数、Header 和上下文压缩；
- 注入 shell 环境变量；
- 扩展 TUI 命令、路由、插槽、对话框和快捷键。

典型 npm manifest：

```json
{
  "name": "@acme/kilo-plugin",
  "type": "module",
  "exports": {
    "./server": {
      "import": "./dist/server.js"
    },
    "./tui": {
      "import": "./dist/tui.js"
    }
  },
  "engines": {
    "opencode": "^1.0.0"
  }
}
```

### 安装方式

配置可引用：

```jsonc
{
  "plugin": [
    "@org/plugin",
    "plugin@1.2.3",
    ["plugin", { "option": true }],
    "./plugins/local.ts"
  ]
}
```

本地发现目录包括：

```text
~/.config/kilo/plugin/
.kilo/plugin/
.kilocode/plugin/    # 旧路径
```

也可使用：

```bash
kilo plugin my-plugin
kilo plugin my-plugin --global
kilo plugin my-plugin --force
```

Kilo 使用 Bun 安装包；精确版本固定，裸包名通常跟踪 `latest`。安装脚本默认不应被视为可执行安全边界，插件本体仍是受信任代码。

### 探测方式

Kilo 当前缺少公开、稳定的：

```bash
kilo plugin list --json
```

建议组合探测：

1. 解析项目级和用户级配置；
2. 扫描本地插件目录；
3. 检查 Kilo / OpenCode cache 中的实际包；
4. 读取 `package.json.version`；
5. 校验 `engines.opencode` 是否满足当前 CLI；
6. 启动时读取 DEBUG 日志；
7. 检查 TUI 或 VS Code 中的 session error；
8. 对插件提供的工具或 Hook 做冒烟测试。

调试命令：

```bash
kilo --print-logs --log-level DEBUG
```

全部禁用外部插件：

```bash
KILO_PURE=1 kilo
```

如果 `engines.opencode` 不满足，插件会被跳过并显示警告。因此“包已下载”不等于“当前 runtime 已加载”。

### 与 OpenCode 的兼容性

Kilo 文档把自身插件行为描述为与上游 OpenCode 旧式插件行为一致，但需要严格区分版本：

| 组合 | 结论 |
|---|---|
| Kilo ↔ OpenCode V1 / 旧式 Server Plugin | 高度同源，常能少改或不改复用 |
| Kilo 专有 TUI / Workspace API → OpenCode V1 | 不保证 |
| Kilo / OpenCode V1 Plugin → OpenCode 2 | **不能直接运行，必须移植** |

**官方资料：**

- [Kilo Code plugins](https://kilo.ai/docs/automate/extending/plugins)
- [OpenCode V1 to V2 migration](https://opencode.ai/v2/docs/migrate-v1/)

---

## 6.5 Pi

### 原生插件机制

Pi 的原生可执行扩展称为 **Extension**，通常是 TypeScript / JavaScript 文件。Extension 能注册：

- 工具；
- 命令；
- 事件处理器；
- 自定义 UI；
- Provider 和模型行为；
- 其他 Agent 生命周期能力。

Pi Package 是分发容器，可以同时打包 Extensions、Skills、Prompt Templates 和 Themes；本文只把其中的 Extension 计入原生插件能力。

示例：

```json
{
  "name": "my-package",
  "pi": {
    "extensions": ["./extensions"],
    "skills": ["./skills"],
    "prompts": ["./prompts"],
    "themes": ["./themes"]
  }
}
```

### 安装与更新

```bash
pi install npm:@foo/bar@1.0.0
pi install git:github.com/user/repo@v1
pi install ./local-package
pi remove npm:@foo/bar
pi list
pi update --all
pi update --extensions
pi update --extension npm:@foo/bar
pi config
pi -e npm:@foo/bar
```

Pi 支持用户级和项目级设置。npm 精确版本与 Git ref 可以固定；本地路径通常直接引用，不复制。

### 探测方式

#### 安装态

```bash
pi list
```

可读取 settings 中声明的 package source。

#### 启用态

```bash
pi config
```

可逐项启用或禁用 package 中的 Extension 等资源。

#### 版本和来源

需要关联：

- npm spec；
- `package.json.version`；
- Git ref 和当前 checkout SHA；
- 用户级 / 项目级 settings；
- 本地路径的文件状态。

#### 运行健康

Pi 尚未公开类似 `active / failed / error` 的统一结构化插件状态。建议：

1. 解析 `pi list` 与 settings；
2. 检查入口文件是否存在；
3. 启动最小 headless 会话；
4. 验证插件注册的一个无副作用命令或工具；
5. 保存启动日志和异常。

### 安全与兼容性

Pi 官方明确提醒：Package 与 Extension 具有完整系统访问权限，应视为受信任代码。

OMP 会回退读取 `package.json.pi`，因此 Pi Package 向 OMP 存在一定单向兼容性；但 Extension 若调用 Pi 专有 API，仍可能在 OMP 中失败。

**官方资料：**

- [Pi Packages](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md)
- [Pi Extensions](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md)
- [Pi documentation index](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/index.md)

---

## 6.6 OMP / Oh My Pi

### 原生插件机制

OMP 支持较完整的宿主扩展能力，包括：

- OMP Extensions；
- Tools；
- Hooks；
- Commands；
- Agents / Tasks；
- LSP；
- Provider 或其他运行时能力；
- Marketplace 声明式资源。

其可执行 Extension 由宿主直接导入和初始化，属于 A 级插件系统。

### Manifest 与兼容回退

OMP 解析 manifest 的顺序为：

```text
package.json.omp
→ package.json.pi
→ 仅使用 package.json.version
```

缺少 `omp` / `pi` 字段的包仍可被安装和列出，但运行时会跳过。因此必须区分：

```text
可安装
可列出
有有效 OMP/Pi manifest
已启用
实际加载
```

### 安装、状态和持久化

常用命令包括：

```bash
omp plugin install <spec>
omp plugin uninstall <name>
omp plugin list --json
omp plugin link <path>
omp plugin enable <name>
omp plugin disable <name>
omp plugin doctor
omp plugin doctor --fix
omp plugin discover
omp plugin upgrade
```

主要状态文件：

```text
~/.omp/plugins/package.json
~/.omp/plugins/node_modules/
~/.omp/plugins/omp-plugins.lock.json
~/.omp/plugins/installed_plugins.json
~/.omp/marketplaces.json
```

`omp-plugins.lock.json` 可记录：

```text
版本
启用 / 禁用
已选 features
插件设置
```

### 安装校验与 doctor

OMP 安装时会尝试：

1. 解析插件入口；
2. 导入 Extension factory；
3. 在临时注册面上初始化；
4. 若失败则尝试回滚安装。

`omp plugin doctor` 能发现部分：

- lockfile 与 node_modules 漂移；
- 无效 feature；
- 缺失工具、Hook 或命令文件；
- 部分 manifest 问题。

但文档也指出，一些缺失路径可能在运行时被静默跳过，只由 doctor 报告；`doctor --fix` 也是 best-effort。因此最终仍应做真实会话冒烟测试。

### 版本探测

优先读取：

```text
omp-plugins.lock.json.version
package.json.version
npm dependency spec
Git resolved SHA
Marketplace catalog version
installed_plugins.json
```

npm 插件没有统一的独立“检查更新”动作，常通过重新执行新版本的 install 完成；Marketplace 的升级逻辑单独存在。

### 兼容性

- **Pi → OMP：** manifest 层面部分单向兼容；Extension API 是否兼容需逐个测试；
- **Claude Marketplace → OMP：** catalog 和部分声明式资源可发现，不等于 Claude 可执行插件 ABI 完整兼容；
- **OMP → Pi：** 通常不成立，尤其是 OMP 专有 API 和组件。

### 安全

OMP 可执行扩展在宿主环境中运行，没有通用沙箱，必须按受信任代码处理。

**官方资料：**

- [OMP plugin manager and installer plumbing](https://github.com/can1357/oh-my-pi/blob/main/docs/plugin-manager-installer-plumbing.md)
- [OMP marketplace](https://github.com/can1357/oh-my-pi/blob/main/docs/marketplace.md)

---

## 6.7 Command Code

### 原生插件机制：Mods

Command Code 的原生可执行扩展称为 **Mods**。Mod 是针对 `ModApi` 编写的 TypeScript factory，可以扩展：

- 工具；
- Slash Commands；
- 生命周期 Hooks；
- 事件监听器；
- 用户输入拦截；
- Feed 渲染；
- 状态栏和部分 TUI；
- Flags；
- 模型 Provider。

Command Code 的部分第一方 Provider 和内部功能也使用同一 Mod API。

### 稳定性

官方明确标注：

```text
Experimental
```

`ModApi` 的 surface 和函数签名仍可能变化，因此插件发布者应固定宿主版本或声明兼容范围。

### 安装与管理

```bash
cmd mods add cmd-mod-hi
cmd mods add @team/review-mod@1.2.0
cmd mods add owner/repo@v1
cmd mods add ./local-mod
cmd mods add -g owner/repo
cmd mods list
cmd mods update
cmd mods remove <name-or-source>
cmd mods open
cmd --mod ./your-mod.ts
```

项目级与用户级目录：

```text
<project>/.commandcode/
~/.commandcode/
```

安装包落入：

```text
.commandcode/mods/.registry/npm/
.commandcode/mods/.registry/git/
```

启动时不会自动执行 npm / Git 更新，需显式运行 `cmd mods update`。

### 探测方式

```bash
cmd mods list
```

会列出名称、作用域、来源，并显示加载警告。典型失败原因包括：

```text
import error
没有 default-export factory
factory threw
duplicate name
```

修改后执行：

```text
/reload
```

其实际行为是重启进程、恢复会话并重新发现所有 Mods，而不是进程内热替换。

CI 可使用：

```bash
cmd -p "exercise the mod" --mod ./your-mod.ts
```

### 版本探测注意事项

Command Code 的 package identity 对版本 / Git ref 不敏感。例如同一仓库的 `@v1` 与 `@main` 仍可能被视为同一来源身份。统一管理器应额外保存：

```text
source identity
requested version / ref
resolved package.json.version
resolved commit SHA
实际加载入口
```

### 兼容性

Command Mod 是专有 ABI，不能直接运行 OpenCode、Kilo、Pi、OMP 或 Cline 的插件代码。

**官方资料：**

- [Command Code Mods](https://commandcode.ai/docs/mods)

---

## 6.8 Kimi Code

### 原生插件机制

Kimi Code 使用：

```text
kimi.plugin.json
```

或：

```text
.kimi-plugin/plugin.json
```

排除 Skill 与 MCP 后，Kimi 插件仍可贡献：

- 自定义 Agents；
- Session Start 自动加载逻辑；
- System Prompt / System Prompt File；
- Markdown Slash Commands；
- Lifecycle Hooks。

不支持的任意运行时字段，例如：

```text
tools
apps
inject
configFile
```

会作为 diagnostics 显示并被忽略。因此 Kimi 插件属于声明式宿主插件，而不是任意 JS / TS 进程内插件 API。

### 安装和管理

```text
/plugins
/plugins list
/plugins install <path-or-url>
/plugins marketplace [source]
/plugins info <id>
/plugins enable <id>
/plugins disable <id>
/plugins remove <id>
/plugins reload
```

支持：

- 本地目录；
- ZIP URL；
- GitHub repository；
- branch、tag、commit SHA；
- 官方和自定义 Marketplace。

本地插件会复制到 Kimi 管理目录。安装、启用、禁用或删除后通常需要 `/reload` 或新会话。当前主要是用户级安装，不是项目级安装。

### 结构化 REST 探测

Kimi 的 Server API 是当前最适合第三方管理器的接口之一。

```http
GET /api/v1/plugins
```

每个插件可包含：

```text
id
displayName
version
enabled
state: ok | error
skillCount
mcpServerCount
enabledMcpServerCount
hookCount
commandCount
hasErrors
source
originalSource
github.owner
github.repo
github.ref
github.installedSha
```

其中加载失败会反映为：

```text
state = error
hasErrors = true
```

Marketplace API：

```http
GET /api/v1/plugins/marketplace
```

可返回：

```text
installed
version
updateAvailable
```

启停与删除也有 REST action：

```http
POST /api/v1/plugins/{plugin_id}:enable
POST /api/v1/plugins/{plugin_id}:disable
POST /api/v1/plugins/{plugin_id}:remove
```

### 探测成熟度

Kimi 能结构化区分：

```text
已安装
已启用
manifest 版本
来源类型
Git ref / installed SHA
加载正常 / 加载错误
是否存在更新
```

Server API 当前仍标注为实验性，自动化程序应以运行中服务暴露的 OpenAPI 为最终契约，并准备处理字段变化。

### 兼容性

Kimi manifest 目前主要是 Kimi 专用。其 Hook、Agent 和 Command 可人工转换到 Claude、Gemini 或其他声明式宿主，但不是直接 ABI 兼容。

**官方资料：**

- [Kimi Code plugins](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/plugins)
- [Kimi Code Server API](https://www.kimi.com/code/docs/en/kimi-code-cli/reference/server-api.html)

---

## 6.9 Cline

### 原生插件机制

Cline 提供 TypeScript / JavaScript `AgentPlugin` API，可注册：

- 自定义工具；
- Hooks；
- Commands；
- 其他声明在 `capabilities` 中的宿主能力。

示例 manifest：

```json
{
  "name": "my-cline-plugin",
  "version": "1.0.0",
  "cline": {
    "plugins": [
      {
        "paths": ["./index.ts"],
        "capabilities": ["tools", "hooks"]
      }
    ]
  }
}
```

### 客户端范围

当前插件系统主要适用于 Cline SDK、CLI 和 Kanban；不能简单假设它同时适用于 Cline 的 VS Code 与 JetBrains 扩展。

### 安装

```bash
cline plugin install <source>
cline plugin install <source> --force
cline plugin install <source> --json
cline plugin install <source> --cwd <path>
```

来源可包括单文件 URL、Git、npm、本地文件或目录。项目级安装目录可位于：

```text
<project>/.cline/plugins
```

### 探测方式

安装结果可用 `--json`，但当前没有公开的完整：

```text
plugin list --json
active / failed / error API
```

官方建议安装后运行：

```bash
cline config
```

并在 Plugin 页面确认已加载。自动化管理器应结合：

- 安装结果 JSON；
- 用户 / 项目插件目录；
- `package.json.version`；
- Cline config；
- 插件注册的命令或工具冒烟测试。

### 兼容性

Cline `AgentPlugin` 是独立 ABI，不能直接作为 OpenCode、Kilo、Pi 或 Command Mod 运行。

**官方资料：**

- [Cline plugins](https://docs.cline.bot/customization/plugins)

---

## 6.10 Gemini CLI

### 原生插件机制

Gemini CLI Extension 使用：

```text
gemini-extension.json
```

排除 Skill 与 MCP 后，仍可贡献：

- Custom Commands；
- Hooks；
- Subagents；
- Policy Engine 配置；
- Themes；
- Context Files；
- Settings。

Hook 当前主要是声明式 command Hook，通过 stdin / stdout JSON 与宿主通信，而不是通用进程内 JS API。

### 安装与管理

```bash
gemini extensions install <source> [--ref <ref>] [--auto-update]
gemini extensions uninstall <name...>
gemini extensions disable <name> [--scope user|workspace]
gemini extensions enable <name> [--scope user|workspace]
gemini extensions update <name>
gemini extensions update --all
gemini extensions link <path>
```

交互会话中查看：

```text
/extensions list
```

安装时会复制扩展；本地开发可使用 link。管理操作和 Slash Command 更新通常要在重启 CLI 会话后生效。

### 探测方式

可取得：

- 已安装扩展；
- user / workspace 启停状态；
- `gemini-extension.json.version`；
- Git ref；
- 是否配置 auto-update。

但没有发现与 Claude `plugin_errors` 或 Kimi `state=error` 等价的稳定机器可读运行态接口。推荐：

1. `/extensions list` 获取人类可读清单；
2. 读取安装目录和 manifest；
3. 重启会话；
4. 验证一个 Command、Hook 或 Subagent；
5. 检查日志。

### 兼容性

Qwen Code 可在安装时转换 Gemini Extension，但转换后的文件是 Qwen Extension，不代表两个宿主共用同一运行时 ABI。

**官方资料：**

- [Gemini CLI extension reference](https://geminicli.com/docs/extensions/reference/)
- [Gemini CLI hooks reference](https://geminicli.com/docs/hooks/reference/)

---

## 6.11 GitHub Copilot CLI

### 原生插件机制

Copilot CLI 使用根目录 `plugin.json`，可贡献：

- Agents；
- Commands；
- Hooks；
- Extension Directories；
- LSP Servers；
- 以及不在本文重点中的 Skills / MCP。

这属于声明式原生插件，而不是任意进程内 JavaScript API。

### 安装和更新

```bash
copilot plugin install <specification>
copilot plugin uninstall <name>
copilot plugin list
copilot plugin update <name>
copilot plugin update --all
copilot plugin enable <name>
copilot plugin disable <name>
copilot plugin marketplace add <source>
copilot plugin marketplace list --json
copilot plugin marketplace browse <name> --json
copilot plugin marketplace update [name]
```

来源支持 Marketplace、GitHub、Git URL 和本地路径。可用完整 commit SHA 固定插件，适合可复现部署。

部分第一方 Marketplace 插件会在可信工作目录中按 session 自动更新；`/plugin` Dashboard 会提示可用更新。

### 探测方式

**安装、启用、版本、来源：强。** 主要使用：

```bash
copilot plugin list
```

以及 `/plugin` Dashboard 和 Marketplace JSON 命令。

**当前会话加载健康：中等。** 当前公开文档未给出统一的结构化 `loaded / failed / error` 插件 API。建议：

1. 读取清单与 manifest；
2. 检查安装目录；
3. `/restart` 或开启新会话；
4. 检查 Dashboard 警告；
5. 对 Hook、Command、Agent 或 LSP 做冒烟测试。

### Claude 兼容性

Copilot CLI 会寻找：

```text
.claude-plugin/plugin.json
.claude-plugin/marketplace.json
```

也会提供兼容的数据目录变量。因此它是目前与 Claude Code manifest / Marketplace 兼容程度最高的宿主之一。但仍需逐组件验证 Hook 事件、LSP 行为、优先级和宿主生命周期。

**官方资料：**

- [GitHub Copilot CLI plugin reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)

---

## 6.12 Cursor

### 原生插件机制

Cursor 同时支持：

```text
plugin.json                    # Agent Plugins，仅 Skills / MCP
.cursor-plugin/plugin.json     # Cursor 原生插件
```

本文只把第二种计作 Cursor 原生插件。Cursor Plugin 可贡献：

- Rules；
- Agents；
- Commands；
- Hooks；
- Variables；
- 以及可选的 Skills / MCP。

### 安装与作用域

主要通过 Cursor 的 Customize 页面和 Marketplace：

1. 打开 Customize；
2. 选择插件；
3. 选择 user 或 project scope；
4. 安装后 Reload Window 或重启。

本地开发目录：

```text
~/.cursor/plugins/local/<plugin-name>
```

也可用符号链接进行开发。

### 探测方式

Cursor 的人机管理体验较完整，但机器可读探测较弱。推荐组合：

1. Customize 页面确认安装和作用域；
2. 读取 `.cursor-plugin/plugin.json`；
3. 扫描 `~/.cursor/plugins/local` 及实际安装目录；
4. 执行 `Developer: Reload Window`；
5. 检查 Hook 日志；
6. 验证 Rule、Agent、Command 或 Hook 是否出现并运行。

当前公开文档没有稳定的：

```text
cursor plugin list --json
active / failed plugin API
```

### 兼容性

- Agent Plugins v1 可无修改加载，但其标准核心只是 Skills 与 MCP，不计入本文原生 ABI；
- Cursor Plugin 的 Rules、Agents、Commands、Hooks 和 Variables 是 Cursor 专用；
- Cursor 可兼容部分 Claude Hook 配置，但不能假定完整 Claude Plugin ABI 一致。

**官方资料：**

- [Cursor plugins](https://cursor.com/docs/plugins)
- [Cursor plugin reference](https://cursor.com/docs/reference/plugins)
- [Cursor CLI parameters](https://cursor.com/docs/cli/reference/parameters)

---

## 6.13 Qwen Code

### 原生插件机制

Qwen 原生 Extension 使用：

```text
qwen-extension.json
```

排除 Skill 与 MCP 后，可贡献：

- Context / System Instructions；
- Commands；
- Subagents；
- Settings；
- 有限的 `channels` 可执行入口。

`channels` 字段可指向编译后的 JavaScript，并要求导出符合 `ChannelPlugin` 接口的对象。这是一个真实的可执行插件点，但它只针对频道 / 平台适配，不是通用工具、Provider、UI、Hook 全覆盖 API。

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "channels": {
    "my-platform": {
      "entry": "dist/index.js",
      "displayName": "My Platform Channel"
    }
  },
  "commands": "commands",
  "agents": "agents"
}
```

### 安装与管理

Qwen Code 可从以下来源安装：

- 原生 Qwen Extension；
- npm；
- Git；
- 本地路径；
- Archive URL；
- Claude Code Marketplace；
- Gemini CLI Extension；
- Qoder Plugin；
- Agent Plugins v1。

常用操作：

```bash
qwen extensions install <source>
qwen extensions uninstall <name>
qwen extensions disable <name> [--scope=workspace]
qwen extensions enable <name> [--scope=workspace]
qwen extensions update <name>
qwen extensions update --all
qwen extensions sources ...
```

交互式管理：

```text
/extensions manage
/extensions explore ClaudeCode
/extensions explore Gemini
```

CLI 变更通常在重启活动 CLI 会话后完全体现。

### 探测方式

可以较可靠地取得：

- 安装目录；
- manifest 版本；
- npm / Git / Marketplace 来源；
- 启用或禁用状态；
- 可用更新。

但没有发现稳定的统一 `active / failed / error` API。推荐结合：

- `/extensions manage`；
- `<home>/.qwen/extensions`；
- `qwen-extension.json`；
- 安装器转换记录；
- 重启后的 Command / Agent / Channel 冒烟测试。

### 转换兼容性

Qwen Code 能自动转换 Claude、Gemini 和 Qoder 的插件格式，例如：

```text
Claude manifest → qwen-extension.json
Claude Agent → Qwen Subagent
Gemini Extension → qwen-extension.json
TOML Command → Markdown Command
```

这属于**导入转换**，不属于共用原生 ABI。复杂 Hook、LSP、权限、UI 和生命周期逻辑仍可能丢失或改变。

**官方资料：**

- [Qwen Code Extensions](https://qwenlm.github.io/qwen-code-docs/en/users/extension/introduction/)

---

## 6.14 Kiro

### Power 的实际边界

Kiro Power 的主要结构是：

```text
my-power/
├── plugin.json
├── skills/
├── mcp.json
└── dev.kiro/
```

其中：

- `skills/` 是 Agent Skills；
- `mcp.json` 是 MCP；
- `dev.kiro/` 可提供 Kiro-specific steering；
- `plugin.json` 主要负责标识、版本和动态激活关键词。

按本文严格口径，Power 本身并没有展示一个类似 OpenCode Plugin、Pi Extension 或 Command Mod 的通用可执行 ABI。因此不应仅因为它叫“Power / Plugin”就把它评级为 A 或 B 级原生插件平台。

### 宿主另有的原生能力

Kiro 另行提供：

- Agent Hooks；
- Custom Agents；
- Steering Files；
- 项目级和用户级 Agent 配置。

Agent Hook 可以在事件发生时触发 Prompt 或 shell command，但它们目前更像独立宿主配置，而非任意 Power 都可统一声明、安装、探测的通用插件代码入口。

### 安装与更新

Power 可从：

- Kiro Registry；
- GitHub URL；
- 本地目录；
- Agent Plugins 格式；
- 旧版 `POWER.md`；

进行安装。Powers Panel 可显示版本并检查更新。

### 探测方式

建议区分两套状态：

#### Power 状态

- Powers Panel 中是否安装；
- `plugin.json.version`；
- 是否存在更新；
- 是否被动态激活；
- `skills/`、`mcp.json` 和 `dev.kiro/` 是否有效。

#### 独立原生宿主能力

- `.kiro/hooks/*.json` 是否存在；
- Hook shell command 是否成功；
- `.kiro/agents/` 或用户级 Agent 是否被发现；
- Agent / Hook 的冒烟测试。

当前没有发现统一机器 API 可返回 Power 与独立 Hooks / Agents 的 `loaded / failed` 状态。

### 结论

Kiro 是“Skill / MCP 动态激活容器 + 独立宿主 Hook / Agent 能力”，而不是一个已经统一成熟的可执行插件 ABI。

**官方资料：**

- [Kiro Powers](https://kiro.dev/docs/powers/)
- [Installing Kiro Powers](https://kiro.dev/docs/powers/installation/)
- [Kiro Agent Hooks](https://kiro.dev/docs/hooks/)
- [Kiro custom agents](https://kiro.dev/docs/custom-agents/)

---

## 6.15 Goose

### 原生插件机制

Goose Plugin 可包含 Skills 和 Hooks。排除 Skill 后，它的原生宿主扩展能力主要是：

```text
hooks/hooks.json
```

Hook 在生命周期事件发生时执行本地 shell command，事件 payload 以 JSON 写入 stdin，并可使用 `${PLUGIN_ROOT}`。

典型结构：

```text
my-plugin/
├── plugin.json
├── hooks/
│   └── hooks.json
└── scripts/
    └── notify.sh
```

Goose Hook 可观察 Session、Prompt、Tool、File 和 Shell 事件；部分 `PreToolUse` Hook 可阻止工具调用。

### 安装与更新

```bash
goose plugin install <git-url>
goose plugin install --auto-update <git-url>
goose plugin update <plugin-name>
```

发现目录：

```text
~/.agents/plugins/<plugin-name>/
<project>/.agents/plugins/<plugin-name>/
```

禁用插件通过 settings：

```json
{
  "disabledPlugins": ["my-plugin"]
}
```

### 探测方式

Goose 当前没有完整的结构化插件清单和运行健康 API。建议：

1. 扫描插件目录；
2. 读取 `plugin.json.version`；
3. 读取安装器保存的 Git 来源和 auto-update 元数据；
4. 检查 `disabledPlugins`；
5. 验证 `hooks/hooks.json`；
6. 检查 Goose 日志；
7. 触发一个无副作用 Hook。

自动更新失败时 Goose 会记录失败并继续使用现有版本，因此“当前仍能运行”不等于“已经更新成功”。

### 能力边界

Goose Plugin 不能通过自身原生 ABI 注册任意进程内工具、Provider 或 UI。此类工具扩展仍主要通过 MCP 完成，所以原生插件等级为 C。

### 兼容性

Goose 遵循 Open Plugins Hook 规范。其 Hook 目录和 JSON 结构可能与其他采用相近规范的宿主复用，但事件名、payload、阻断协议和信任策略必须逐项验证，不能直接等同于 Claude、Codex 或 Cursor Hook。

**官方资料：**

- [Goose plugins](https://goose-docs.ai/docs/guides/context-engineering/plugins/)
- [Goose hooks](https://goose-docs.ai/docs/guides/context-engineering/hooks/)

---

# 7. 原生插件兼容性汇总

## 7.1 可以认为兼容性较高的组合

| 来源 | 目标 | 兼容性 | 准确含义 |
|---|---|---:|---|
| OpenCode V1 / 旧式插件 | Kilo Code | 高 | Server Plugin、工具和 Hook API 高度同源；Kilo 专有 TUI 仍需适配 |
| Kilo Code 基础 Server Plugin | OpenCode V1 | 中高 | 仅限未使用 Kilo 专有 API 的公共子集 |
| Pi Package manifest | OMP | 中 | OMP 回退读取 `package.json.pi`；实际 Extension API 仍需测试 |
| Claude Code manifest / Marketplace | GitHub Copilot CLI | 中高 | Copilot 会直接发现 `.claude-plugin` 路径；组件语义仍可能有差异 |
| Claude Code Plugin | Qwen Code | 转换级 | 安装时转换为 Qwen Extension，不是直接运行 Claude ABI |
| Gemini CLI Extension | Qwen Code | 转换级 | 转换 manifest、命令和部分资源，不是直接运行 Gemini ABI |
| Open Plugins command Hooks | Goose | 原生 | Goose 明确遵循 Open Plugins Hook 规范 |

## 7.2 明确不能直接兼容的组合

| 来源 | 目标 | 结论 |
|---|---|---|
| OpenCode V1 / Kilo Plugin | OpenCode 2 | **不能直接运行，必须迁移实现代码** |
| OpenCode 2 Plugin | Kilo Code | 不兼容，API 代际不同 |
| Command Mod | OpenCode / Kilo / Pi / OMP / Cline | 不兼容，专有 `ModApi` |
| Cline AgentPlugin | OpenCode / Kilo / Command / Pi | 不兼容，专有 `AgentPlugin` API |
| Cursor Plugin | Claude / Gemini / Kimi / Qwen | 不兼容，Cursor 专用 manifest 与组件 |
| Kimi Plugin | 其他宿主 | 不直接兼容，可转换 Agent / Command / Hook |
| Qwen ChannelPlugin | 其他宿主 | 不兼容，Qwen 专用接口 |
| Kiro Power | A 级可执行插件系统 | 不等价；核心仍是 Skills、MCP 与 steering |

## 7.3 Agent Plugins v1 不应被误判为原生 ABI

Agent Plugins / Open Plugin Spec 目前最重要的可移植核心仍是：

```text
Skills
MCP
```

客户端专用目录可以携带宿主数据，但标准本身不统一：

```text
Hooks
Agents
Commands
LSP
Provider
UI
TUI
运行时 API
权限模型
更新器
健康探测
```

因此：

```text
同一个 plugin.json 能被多个宿主安装
```

并不等于：

```text
同一份原生可执行插件代码能跨宿主运行
```

---

# 8. 推荐的统一状态模型

跨 Agent 管理器不应只保存：

```yaml
installed: true
version: 1.0.0
```

建议至少使用以下状态：

```yaml
host: claude-code
plugin_id: example-plugin

source:
  type: npm                  # npm | git | marketplace | local | archive
  requested: example@^1.2.0
  requested_ref: null
  repository: null
  marketplace: example-marketplace

resolved:
  manifest_version: 1.2.3
  package_version: 1.2.3
  git_sha: null
  installed_path: /path/to/plugin
  manifest_format: claude-plugin

state:
  installed: true
  enabled: true
  discovered: true
  loaded: true
  activated: true
  healthy: true
  update_available: false
  reload_required: false

runtime:
  host_version: 2.1.246
  compatible: true
  last_probe_at: 2026-08-29T12:00:00Z
  probe_method: system-init
  error: null

security:
  trusted: true
  executes_in_process: false
  executes_local_commands: true
```

## 8.1 字段解释

| 字段 | 含义 |
|---|---|
| `installed` | 文件、包或安装记录是否存在 |
| `enabled` | 宿主配置是否允许加载 |
| `discovered` | 宿主是否发现 manifest 或入口 |
| `loaded` | 插件组件或代码是否完成初始化 |
| `activated` | 动态组件是否已进入当前会话或命中激活条件 |
| `healthy` | 关键命令、工具、Hook 或 Agent 是否通过冒烟测试 |
| `manifest_version` | manifest 自报版本 |
| `package_version` | npm / package 实际版本 |
| `git_sha` | Git 实际解析 commit |
| `update_available` | 远程版本是否更新 |
| `reload_required` | 磁盘状态与当前进程状态是否可能不一致 |
| `compatible` | 宿主版本 / engine range 是否满足 |
| `trusted` | Hook 或插件代码是否通过宿主信任门控 |

---

# 9. 推荐的探测流程

## 9.1 第一阶段：静态清单

读取：

```text
宿主 CLI / REST / UI 清单
用户级配置
项目级配置
插件安装目录
manifest
lockfile
package.json
Git HEAD / resolved SHA
Marketplace catalog
```

输出：

```text
installed
enabled
source
requested version
resolved version
resolved SHA
manifest format
host scope
```

## 9.2 第二阶段：宿主发现探测

使用宿主提供的原生接口：

```text
Claude       system/init.plugins + plugin_errors
OpenCode 2   GET /api/plugin
Kimi         GET /api/v1/plugins
Codex        /plugins + /hooks
OMP          list + doctor
Command      cmd mods list
其他工具     UI / config / logs
```

输出：

```text
discovered
loaded
load error
compatibility warning
trust gate
reload required
```

## 9.3 第三阶段：功能冒烟测试

每种插件至少声明一个不产生副作用的 probe：

```yaml
probes:
  - type: command
    name: plugin:status
    expect: success

  - type: hook
    event: SessionStart
    expect_file: ${PLUGIN_DATA}/probe-ok

  - type: tool
    name: plugin_health
    args: {}
    expect_json:
      status: ok

  - type: agent
    name: plugin-reviewer
    prompt: Return exactly PLUGIN_OK
    expect: PLUGIN_OK
```

只有冒烟测试成功，才设置：

```yaml
healthy: true
```

## 9.4 第四阶段：更新探测

区分：

```text
manifest 自报版本
安装器解析版本
npm registry latest
Git requested ref
Git resolved SHA
Marketplace catalog version
当前进程实际加载版本
```

对 Git branch 和 tag，最好保存 SHA；仅保存 `main` 或 `v1` 无法保证可复现。

---

# 10. 各宿主推荐探测命令速查

```text
Codex
  codex plugin list --json
  codex plugin marketplace list --json
  /plugins
  /hooks

Claude Code
  claude plugin list --json
  claude plugin details <name>
  claude plugin validate ./plugin --strict
  system/init.plugins
  system/init.plugin_errors

OpenCode 2
  opencode2 plugin list
  GET /api/plugin
  GET /api/health
  opencode2 service restart

Kilo Code
  inspect config and plugin directories
  inspect package.json and engines.opencode
  kilo --print-logs --log-level DEBUG
  KILO_PURE=1 kilo

Pi
  pi list
  pi config
  pi update --extensions
  inspect settings, package.json and Git SHA

OMP
  omp plugin list --json
  omp plugin doctor
  omp plugin doctor --fix
  inspect omp-plugins.lock.json

Command Code
  cmd mods list
  cmd mods update
  cmd --mod ./mod.ts
  /reload
  cmd -p "exercise the mod" --mod ./mod.ts

Kimi Code
  /plugins list
  /plugins info <id>
  GET /api/v1/plugins
  GET /api/v1/plugins/marketplace
  POST /api/v1/plugins/{id}:enable

Cline
  cline plugin install <source> --json
  cline config
  inspect .cline/plugins and package.json

Gemini CLI
  /extensions list
  gemini extensions enable <name>
  gemini extensions disable <name>
  gemini extensions update <name>
  restart session

GitHub Copilot CLI
  copilot plugin list
  copilot plugin marketplace list --json
  /plugin
  /restart

Cursor
  Customize
  inspect ~/.cursor/plugins/local
  Developer: Reload Window
  inspect hook logs

Qwen Code
  /extensions manage
  qwen extensions enable <name>
  qwen extensions disable <name>
  qwen extensions update <name>
  inspect ~/.qwen/extensions
  restart session

Kiro
  Powers Panel
  inspect plugin.json, .kiro/hooks and .kiro/agents
  run Power / Hook / Agent smoke probe

Goose
  inspect ~/.agents/plugins and project .agents/plugins
  inspect disabledPlugins
  goose plugin update <name>
  inspect logs and trigger a harmless hook
```

---

# 11. 对跨 Agent 插件管理器的适配建议

建议不要设计成一个“万能插件 ABI”，而是设计为多种 Adapter：

```text
structured-runtime-adapter
  Claude Code
  OpenCode 2
  Kimi Code

executable-module-adapter
  Kilo Code
  Pi
  OMP
  Command Code
  Cline

managed-declarative-adapter
  Codex
  Gemini CLI
  GitHub Copilot CLI
  Cursor
  Qwen Code

limited-hook-adapter
  Goose
  Kiro Hooks

skills-mcp-package-adapter
  Agent Plugins v1
  Kiro Powers
```

## 11.1 优先适配顺序

### 第一优先级：可结构化探测运行态

```text
Claude Code
OpenCode 2
Kimi Code
```

这些宿主可以建立可靠的：

```text
installed → enabled → loaded / failed → error
```

状态链。

### 第二优先级：包管理强但运行态需冒烟测试

```text
Codex
OMP
```

### 第三优先级：依赖配置、缓存、日志或 UI

```text
Kilo
Pi
Command Code
Gemini CLI
GitHub Copilot CLI
Qwen Code
Cursor
Cline
```

### 第四优先级：有限插件面或非统一插件模型

```text
Goose
Kiro
```

---

# 12. 安全边界

## 12.1 A 级插件必须视为本地代码执行

下列插件通常能在宿主或宿主管理的 Node / Bun / TS 运行时中执行代码：

```text
OpenCode
Kilo
Pi
OMP
Command Code
Cline
```

它们可能读取文件、环境变量、凭证、网络和进程状态。没有沙箱声明时，应按与安装普通本地程序相同的信任标准处理。

## 12.2 声明式插件也不等于安全

Claude、Codex、Gemini、Copilot、Cursor、Kimi、Goose 等插件即使没有通用进程内 API，也可能通过：

```text
Hook command
LSP process
Monitor process
Channel process
Browser extension
外部 helper
```

执行本地代码。

## 12.3 推荐的管理策略

- 优先固定 npm 精确版本或 Git SHA；
- 记录插件内容哈希；
- 将“已审核”与“已沙箱化”分开；
- 对 Hook 与 LSP 单独显示可执行命令；
- 在项目级插件首次加载前要求 workspace trust；
- 默认禁用安装脚本；
- 更新后重新执行静态检查和冒烟测试；
- 不允许插件仅靠自报版本决定安全策略。

---

# 13. 最终结论

若只看**原生插件能力深度**：

```text
OpenCode 2 / Kilo / Pi / OMP / Command Code / Cline
```

属于真正的可执行扩展平台。

若看**声明式插件体系的完整度和生态管理**：

```text
Claude Code / Kimi Code / Gemini CLI / Copilot CLI / Cursor / Qwen Code
```

更成熟，其中 Claude Code 的组件面最完整，Kimi 的 REST 状态探测最系统，Qwen 的跨生态转换范围最广。

若看**第三方管理器最容易可靠探测的宿主**：

```text
Claude Code
OpenCode 2
Kimi Code
```

处于第一梯队。

若要实现跨 Agent 插件管理，最现实的架构不是强行统一插件代码，而是：

```text
统一状态模型
+ 宿主专用安装 Adapter
+ 宿主专用运行态 Probe
+ 可选转换器
+ 通用冒烟测试协议
```

其中必须明确保留：

```text
安装状态
启用状态
宿主发现状态
加载状态
激活状态
健康状态
版本和 Git SHA
更新状态
重载要求
信任状态
```

原生插件 ABI 本身目前仍高度碎片化；真正可跨宿主稳定复用的能力仍主要是 Skills、MCP，以及少量可以适配的命令型 Hook，而不是任意可执行插件代码。

---

# 14. 官方资料索引

- Codex
  - https://developers.openai.com/codex/developer-commands
  - https://developers.openai.com/codex/hooks
  - https://learn.chatgpt.com/docs/plugins
- Claude Code
  - https://code.claude.com/docs/en/plugins-reference
  - https://code.claude.com/docs/en/headless
- OpenCode 2
  - https://opencode.ai/v2/docs/plugins
  - https://opencode.ai/v2/docs/api
  - https://opencode.ai/v2/docs/migrate-v1/
  - https://opencode.ai/v2/docs/troubleshooting/
- Kilo Code
  - https://kilo.ai/docs/automate/extending/plugins
- Pi
  - https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md
  - https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md
- OMP / Oh My Pi
  - https://github.com/can1357/oh-my-pi/blob/main/docs/plugin-manager-installer-plumbing.md
  - https://github.com/can1357/oh-my-pi/blob/main/docs/marketplace.md
- Command Code
  - https://commandcode.ai/docs/mods
- Kimi Code
  - https://www.kimi.com/code/docs/en/kimi-code-cli/customization/plugins
  - https://www.kimi.com/code/docs/en/kimi-code-cli/reference/server-api.html
- Cline
  - https://docs.cline.bot/customization/plugins
- Gemini CLI
  - https://geminicli.com/docs/extensions/reference/
  - https://geminicli.com/docs/hooks/reference/
- GitHub Copilot CLI
  - https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference
- Cursor
  - https://cursor.com/docs/plugins
  - https://cursor.com/docs/reference/plugins
  - https://cursor.com/docs/cli/reference/parameters
- Qwen Code
  - https://qwenlm.github.io/qwen-code-docs/en/users/extension/introduction/
- Kiro
  - https://kiro.dev/docs/powers/
  - https://kiro.dev/docs/powers/installation/
  - https://kiro.dev/docs/hooks/
  - https://kiro.dev/docs/custom-agents/
- Goose
  - https://goose-docs.ai/docs/guides/context-engineering/plugins/
  - https://goose-docs.ai/docs/guides/context-engineering/hooks/