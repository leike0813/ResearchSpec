# ResearchSpec CLI Interface Design

## 1. 定位与事实源

ResearchSpec CLI 是 schema `"2"` workspace 的确定性文件控制面。公开命令、选项和静态帮助由
typed command/payload catalog 生成；当前 selector、frontier 和允许动作从 workspace 文件即时派生。
完整静态参考见 `docs/cli_handbook.md`。

## 2. 公开命令

CLI 固定包含十六个顶层命令：

```text
init        update      status      instructions
start       advance     check       list
show        handoff     pack        propose
decide      archive     doctor      plugin
```

命令 wrapper 只投影这些能力，不建立另一套产品接口。

## 3. 全局协议与 selectors

涉及当前研究工作的 Agent 使用：

```text
status --json -> instructions <selector> --json -> start / decide / advance -> status --json
```

运行 selectors 为：

- `profile:<profile-id>`；
- `run:<run-id>`；
- `node:<run-id>/<node-id>[@round]`；
- `gate:<run-id>/<gate-id>[@round]`；
- `decision:<run-id>/<decision-id>[@round]`；
- `change:<change-id>`。

Inspection 另外支持 `spec:project`、`spec:sources`、`spec:claims`、`spec:manuscript` 和
`tool:<tool-id>`。Machine selector 只接受稳定 ID，不能用目录名相似度或“最近一个”替代。

## 4. 命令职责

- `init` 创建或重配 schema 2 workspace，投影已选 Agent tools、literature Adapters、capabilities 和
  profiles，不启动研究 run。
- `update` 刷新受管静态投影。当前字节发生用户 drift 时默认保留，只有显式 force 才允许替换。
- `status` 返回 profile/run/node frontier、pending selectors、blockers、稳定 specs、Agent tool、
  Adapter、Plugin 和诊断摘要。
- `instructions` 返回一个 profile、run、node、Gate、Decision 或 change 的当前动作合同；ineligible
  node 返回结构化 blocker，不伪造可执行 Node Card。
- `start profile:<id>` 使用 schema 2 payload 原子创建一个已确认的根 run，并冻结 graph。
- `start node:<run>/<child-node>[@round]` 为 eligible child-profile 节点创建或返回唯一绑定 child run；
  它继承父 graph 授权，不接受第二份 start payload 或确认人。
- `advance node:<run>/<node>[@round]` 校验 capability、validators、输入、输出、Gate、Decision 和 graph
  前置，成功后完成一个执行节点。
- `decide` 记录 Gate verdict、failed-Gate override、graph Decision 或 project change 决定。
- `list`、`show`、`check` 和 `doctor` 只读扫描当前 owner。
- `handoff run:<run-id>` 渲染或替换一个可直接编辑的 run handoff。
- `propose` 创建 project change；`archive` 只归档已具备终态的 change。
- `pack` 生成有界上下文包，不复制外部交付物。
- `plugin` 管理静态、经审查的 domain Skill 投影，不取得 graph authority。

## 5. 文件写入边界

四份 stable specs、project change 和 run handoff 可由用户或 Agent 直接编辑。边界交付物位于
`researchspec/` 外。CLI 是 `run.yaml` 和 node instance 中 graph lifecycle、Gate attempts、overrides
与 Decisions 的唯一 mutation authority；`graph.yaml` 在启动时冻结，生成 profiles 和 Agent 投影由
同一 ownership manifest、冲突 preflight 和 commit-last transaction 保护。

所有 CLI 文件输入都使用统一的安全项目相对路径合同：不能是绝对路径、遍历路径、空路径、当前目录、
含反斜杠歧义的路径，也不能解析到 `researchspec/` 内。验证失败时不写 run、node 或 handoff。

## 6. JSON 与失败语义

`--json` 使用独立版本的 CLI envelope，包含 command、ok、data、diagnostics 和可选 error；其中的
envelope version 不是 workspace schema。结构或语义错误使用稳定错误码和字段级 validation entries。

读命令不写 workspace。旧、未知或带旧控制面 marker 的 workspace 对任何可能 mutation 的命令都在
计划前以 `workspace_unsupported` 失败。`doctor` 只报告 current schema、受管投影 drift、unsafe
path、duplicate ID 和 owner 损坏，不执行语义修复。

## 7. 确认边界

根 run 需要人类确认完整 profile entry summary。该确认授权 frozen graph 中的节点和绑定 child runs；
每个 formal Gate 和 Decision 仍逐项确认。Gate verdict 或 Decision choice 只满足 frontier 条件，不会
直接完成执行节点。

异模型 review、Plugin 安装和 Adapter 访问各自使用独立 consent，不能从根 run、Gate 或 Decision
确认中推导。
