# 写作 guard（Paper Humanizer prompt guard）

`init/update` 默认给经审查的宿主安装一份项目级写作 guard，让每个 prompt（以及已核实宿主的
subagent 启动事件）都携带完整 guard，而不需要为每条消息调用 Procedure。本文说明当前实现的
资源目标、宿主协议、ownership、生成路径与检查边界。

## 资源与偏好

项目内共享 runtime 是两个文件，位于 `PROJECT/researchspec/hooks/paper-humanizer/`
（`PROJECT` 是包含 `researchspec/` 的目录）：

| 文件 | 内容 |
| --- | --- |
| `guard.md` | 完整、单份的写作 guard |
| `inject.cjs` | 无依赖 CommonJS publisher，按 protocol/event 输出宿主原生注入响应 |

两者从包内 `hooks/paper-humanizer/` 逐字节复制，字节哈希记录在
`tool-installation-manifest.json` 的 `prompt-guard` 安装项里。

偏好保存在 `config.yaml.agent_tools.paper_humanizer_guard`（`on|off`）。
`init/update --paper-humanizer-guard on|off` 显式设置并持久化；省略时沿用当前值；字段缺失的
schema 2 workspace 解析为 `on`。非法取值以 `invalid_paper_humanizer_guard` 退出 2。guard 与
`--delivery skills|commands|both` 相互独立，三种模式行为一致。

## 宿主协议

宿主支持与原生配置位置只有一个来源：`src/adapters/tools.ts` 的 `TOOLS[].promptGuard`。
本文不复制宿主表，实际取值以该 catalog 为准：

| 字段 | 含义 |
| --- | --- |
| `path` / `alternatePath` | 原生配置或插件文件路径；已有安装沿用 manifest 记录路径，新建时优先使用主 `path`，主 `path` 不存在且 alternate 已存在时才改用 alternate |
| `format` | `groups`、`events`、`cursor`、`kiro`、`antigravity`、`copilot` 为 JSON 条目型；`script`、`opencode`、`kilo`、`pi`、`omp` 为文件型 |
| `protocol` / `event` / `subagentEvent` | publisher 调用参数与登记的宿主事件 |
| `additionalContextLimit` | 可选的 JSON hook 上下文上限（Codex 为 5000） |
| `documentation` / `checked_on` / `limitation` | 依据链接、核对日期与启用前置条件 |

当前 18 个已审阅宿主的路径、协议与限制全部从上述 catalog 派生。

JSON 条目型宿主只登记归属 ResearchSpec 的条目：命令通过 base64 编码的绝对路径调用
`inject.cjs`，避免 shell 引号与相对路径问题。文件型宿主写入原生插件或脚本文件：
`opencode`、`kilo`、`pi`、`omp` 插件用 `readFileSync(new URL(<相对 guard 路径>, import.meta.url))`
直接读取共享 `guard.md`，不依赖 publisher；`opencode` 默认导出工厂函数，`kilo` 的默认
导出是 `{ id: "researchspec-paper-humanizer", server: <工厂> }`；`script` 形态生成带可
执行位的包装脚本，调用 publisher 的 `run()`。

publisher 只读取与自己同目录的 `guard.md`。guard 缺失或不可读时，它返回该 protocol 的原生
空响应值并以状态 0 结束：不调用模型、不记录 prompt、不修改工作流状态。Copilot 的 transformed
prompt 在追加 guard 前读入，上限 64 KiB、1 秒超时。

## Ownership 与退休

manifest 以 `source.kind: "prompt-guard"` 记录交付物：`component` 区分 `config`、
`script`、`guard`、`publisher`，`mode` 区分 `file`（整文件）与 `entries`
（共享 JSON 中的归属条目）。

- 共享 JSON 的 manifest 哈希只覆盖 canonical 化的 ResearchSpec 条目；每次写入仍以整文件
  previous-bytes 前置条件提交，用户 settings、其他 hooks 与未知键保持原样。
- 未登记的已有条目、畸形配置和版本不符的原生 hooks 一律保留，不强制接管。
- `--paper-humanizer-guard off` 或从 `--tools` 取消选择时，未修改的归属条目被移除；
  被本地修改的条目连同 guard 资源一起保留，并给出非阻塞诊断 `prompt_guard_preserved`。
- 只要还有保留的宿主 hook，共享资源就保留；没有任何 hook 时，未修改的资源被移除，被修改的
  资源保留并报告 `prompt_guard_resource_preserved`。
- ResearchSpec 不修改用户 hooks 之外的宿主设置，不代替用户启用宿主 hooks 功能或确认 trust；
  每个宿主的启用前置条件记录在 catalog 的 `limitation` 中。

## 生成路径

`planWorkspaceDelivery` 在同一个写计划里调用 `planPaperHumanizerHooks`
（`src/adapters/prompt-guard.ts`），与 profile、Agent 工具、Adapter 和 Plugin 投影一起做冲突
检查并提交；`--dry-run` 只计划不写。资源逐字节来自包内文件，宿主配置与插件内容由 catalog
确定性生成，相同输入与现状产生相同字节。init/update 的人类 stderr 与 JSON diagnostics 会带上
计划阶段的 delivery 诊断（`prompt_guard_resource_conflict`、`prompt_guard_preserved`、
`prompt_guard_resource_preserved`）。

## 检查与验收范围

`status --json` 的 `agent_tools` 返回 `paper_humanizer_guard` 与 `prompt_guards[]`：
每个选中宿主包含 `tool_id`、`enabled`、`supported`、`installed`、
`host_loading: "unverified"`，以及来自 catalog 的 `event`、`documentation`、
`checked_on`、`prerequisites`。`check`（`tools` 目标）与 `doctor` 静态报告：

- `prompt_guard_unsupported`：偏好为 on，但该宿主没有已审阅协议；
- `prompt_guard_missing`：有协议但安装不完整；
- `prompt_guard_retirement_incomplete`：偏好为 off 时仍保留 writing hook，或宿主已取消选择但仍保留 hook 与依赖；
- `prompt_guard_resource_missing`：已有 hook 安装，但 manifest 缺少 guard 或 publisher 的托管记录；
- `prompt_guard_drift`：资源缺失或被修改；
- `prompt_guard_path_invalid`：目标路径不安全或不可读（blocking）。

这些命令只读取文件与 manifest，不执行 publisher、不启动宿主、不联网。静态安装与漂移检查不构成
宿主加载证明：guard 是否真的进入 prompt 取决于各宿主的 trust、EAP、私有接口与启用状态，需要
按 catalog 前置条件在真实宿主中手工验证。
