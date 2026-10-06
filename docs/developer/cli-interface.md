# ResearchSpec CLI 接口

ResearchSpec CLI 是 schema `"2"` workspace 的确定性文件控制面。公开命令、选项和静态帮助由
typed command/payload catalog 生成；当前 selector、frontier 与允许动作从 workspace 即时派生。
完整静态参数见[CLI handbook](../user/cli-handbook.md)。

## 调用协议

```text
status --json
  -> instructions <selector> --json
  -> start / decide / advance
  -> status --json
```

`instructions` 是动作合同：它返回当前 selector 的 eligibility、blockers、输入 schema、确认边界
和 execution policy。Agent 不应根据静态文档猜测当前可执行参数。

运行 selectors 包括 `profile:`、`run:`、`node:`、`gate:`、`decision:` 和 `change:`。
Inspection 命令另有 stable spec、handoff 与 tool selectors；每个命令只接受 catalog 声明的子集。
`show` 当前只接受 profile、run、node 和 change。

## 十六个顶层命令

| 命令 | 职责 |
| --- | --- |
| `init` | 创建 schema 2 workspace 与静态投影，不启动 run |
| `update` | 刷新受管投影，默认保留有 drift 的用户文件 |
| `status` | 汇总 profiles、runs、frontier、blockers、specs、tools、Adapters 与 Plugins |
| `instructions` | 返回一个精确 selector 的当前动作合同 |
| `start` | 启动已确认的根 graph，或启动 eligible child subgraph |
| `advance` | 校验并完成执行节点 |
| `check` | 对选定 owner 或 workspace 做只读结构检查 |
| `list` | 稳定排序并以 cursor 分页列出 owner；`list tools` 展示入口机制与发现回退 |
| `show` | 展示一个 profile、run、node 或 project change |
| `handoff` | 渲染或替换一个 run handoff |
| `pack` | 为一组 owner 或单个 owner 生成确定性上下文包 |
| `propose` | 创建 project change |
| `decide` | 记录 Gate、override、graph Decision 或 change decision |
| `archive` | 归档达到终态的 project change |
| `doctor` | 只读诊断 workspace 与受管投影 |
| `plugin` | 管理静态、经审查的 domain Skill 投影 |

## Start 的两个形态

`start profile:<id>` 使用确认后的 schema 2 payload 创建根 run，校验 route-bound entry 并冻结图。
写作相关入口可以带 `manuscript_delivery`，记录用户选择与 Quarto probe summary。

`start node:<run>/<child-node>[@round]` 创建或返回唯一绑定 child。它继承根图授权，不接受
`--confirmed-by`。普通 child 不接受输入；声明 delivery requirement 的 child 可以接收当前
delivery snapshot，用于 format 前的 Quarto 可用性判断。

## 写入与失败

Stable specs、project changes、handoffs 和外部交付物可由用户或 Agent 直接维护。CLI 独占
`run.yaml`、`graph.yaml` 和 node instances 中的 lifecycle、Gate、override、Decision 与
transition。

所有 CLI 文件输入使用同一安全项目相对路径合同：拒绝绝对路径、遍历、空路径、当前目录、
反斜杠歧义和解析到 `researchspec/` 内的路径。验证失败时不写控制文件。

`--json` 使用独立版本的 envelope，包含 command、ok、data、diagnostics 和可选 error；envelope
version 与 workspace schema 无关。旧或未知 workspace 对 mutation fail closed。`status`、
`check`、`doctor` 和其它读命令不会执行外部工具、修复语义或改变文件。

工具目录是项目入口机制的唯一来源。`list tools --json` 列出每个已注册目标的机制、路径、文档
依据和限制；`doctor --json` 静态检查已选目标的入口缺失、漂移、标记错误和已知遮蔽条件，并在
人类可读输出中显示非阻塞诊断。二者都不探测宿主运行状态。共享区域的 manifest 哈希只覆盖标记
区域，实际写入仍使用整文件快照前置条件保护用户字节。
工具目录同时是写作 guard 的宿主元数据来源（`TOOLS[].promptGuard`）；`init/update` 默认投影
共享 guard 与归属条目，`--paper-humanizer-guard on|off` 持久化偏好，协议与限制见
[写作 guard](paper-humanizer-hooks.md)。

## 确认边界

根 entry summary 的一次确认授权 frozen graph 及绑定 child runs。Formal Gate、Decision、
failed-Gate override、异模型 review、Plugin、Adapter 与 QMD 代码执行仍分别确认。Decision 只改变
frontier 条件，不会隐式完成执行节点。
