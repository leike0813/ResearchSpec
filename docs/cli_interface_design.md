# ResearchSpec CLI Interface Design

## 1. 定位与事实源

ResearchSpec CLI 是 schema `"1"` workspace 的确定性文件控制面。公开命令、选项和静态帮助
由 `src/cli/command-catalog.ts` 唯一生成；当前 selector 和允许动作由 workspace 文件按需计算。
本文说明交互模型，不复制完整命令帮助。完整静态参考见 `docs/cli_handbook.md`。

## 2. 公开命令

CLI 固定包含十六个顶层命令：

```text
init        update      status      instructions
start       advance     check       list
show        handoff     pack        propose
decide      archive     doctor      plugin
```

命令 wrapper 只是这些能力在 Agent host 中的投影，不建立另一套产品接口。

## 3. 全局协议

涉及当前研究工作的 Agent 使用：

```text
status -> instructions <selector> -> start / decide / advance -> status
```

公开 selector 为：

- `route:<skill-id>:<mode>`；
- `subflow:<instance-id>`；
- `gate:<instance-id>/<gate-id>`；
- `decision:<instance-id>/<decision-id>`；
- `change:<change-id>`；
- `handoff:<instance-id>`。

`show` 另外支持四份 stable spec、`profile:academic-pipeline` 和 `tool:<tool-id>`。Machine
selector 只接受稳定 ID；目录名相似度和“最近一个”不能替代显式选择。

## 4. 命令职责

- `init` 创建 current workspace 和 manifest-owned 静态投影，不启动学术工作。
- `update` 只协调受管 profile、Skills、wrappers、plugins 和 literature adapter 文件；发生 drift
  时默认保留用户修改，只有显式 `--force` 才替换生成内容。
- `status`、`list`、`show`、`instructions`、`check` 和 `doctor` 只读扫描当前 owner。
- `start` 原子创建一个已独立确认的 subflow control、handoff 和可选私有 work 目录。
- `decide` 记录 owning control 中的 Gate、Decision 或 override，或 project change 的人类决定。
- `advance` 单独校验 profile、当前 control、直接 child、Gate、Decision 和 handoff 前置后推进。
- `handoff` 创建、替换、渲染或检查可直接编辑的 handoff。
- `propose` 创建 adaptable project change；`archive` 只归档已具备终态的 change。
- `pack` 生成有界上下文包，不复制外部交付物和 subflow 私有 work。
- `plugin` 管理静态、经审查的 domain Skill 投影，不取得 workflow authority。

## 5. 文件写入边界

四份 stable specs、project change 和 handoff 可由用户或 Agent 直接编辑。边界交付物位于
`researchspec/` 外。CLI 是 `control.yaml` 中 Gate、Decision、frontier 和 transition 的唯一
写入者；生成 profile 和 Agent 投影仍由 manifest 保护。

所有 control mutation 使用当前文件字节作为读前置并执行单文件原子替换。公开接口不暴露
plan hash、receipt 或多文件事务身份。

## 6. JSON 与失败语义

`--json` 返回 schema `"1"` envelope，包含 command、ok、data、diagnostics 和可选 error。
结构或语义输入错误使用稳定错误码和字段级 validation entries。读命令不写 workspace；遇到旧、
未知或包含旧控制面 marker 的 workspace 时，所有可能写入的命令在计划前以
`workspace_unsupported` 失败。

`doctor` 只报告 current schema、受管投影 drift、unsafe path、duplicate ID 和 owner 文件损坏。
它不会重建学术事实、Gate、Decision、handoff 或外部文件。

## 7. 确认边界

每个 standalone、pipeline parent、child、branch 和动态 revision round 都需要自己的 route
summary 与人类确认。一次确认仅授权一个实例。Formal Gate verdict、failed-Gate override 和
scope、claim、structure、branch 选择同样需要人类确认；确认本身不推进 checkpoint。
