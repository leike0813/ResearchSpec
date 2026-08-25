# Workspace 生命周期旅程

本文属于 [ResearchSpec 用户模型验收基线](../researchspec_user_usage_rehearsal.md)。

## 1. 初始化与重配

`researchspec init` 创建 schema 2 workspace、四份 stable specs、空 `runs/`、converter-owned graph
profiles 和选定 Agent 投影。固定基础表面由四个 ARSU Skills、五个 Companion Skills 和 capability
registry 派生；选择 `zotero-library` 才增加七个 Adapter Skills。

```text
researchspec/
  config.yaml
  tool-installation-manifest.json
  profiles/<profile-id>.yaml
  specs/{project.md,sources.yaml,claims.yaml,manuscript.yaml}
  changes/
  runs/
```

交互式 re-init 预选当前配置；非交互调用省略选择参数时保留当前值。所有静态投影进入同一个
ownership-aware plan。受管文件 drift 默认保留，preflight 冲突使整个 transaction 零写入。

Init 不启动 Agent、Zotero、外部服务或研究 run，也不创造来源、claims 或研究结论。

## 2. 维护稳定事实

用户确认研究范围、语言、证据边界和读者后，Agent 可直接维护 stable specs。高影响的 scope、claim
强度、贡献、稿件结构或 review-response strategy 先建立 project change。Accepted change 不自动
编辑 specs；应用完成且检查通过后才能标记 applied。

## 3. 启动、暂停与恢复

开始工作前，Agent 读取 `status --json` 与 `instructions profile:<id> --json`，展示完整 entry
summary，确认后执行 `start profile:<id>`。CLI 原子创建：

```text
runs/<run-id>/
  run.yaml
  graph.yaml
  handoff.md
  nodes/
```

恢复时，Navigate 从 status 返回的精确 run/node/Gate/Decision selectors 中选择，再读取对应
instructions。已有 root run 不重复确认；启动 frozen graph 声明的 child-profile node 也不要求第二次
run-level 确认。多个候选必须由用户选择。

## 4. Handoff 与导出

Producer 将交付物写到项目普通路径，并用 `handoff run:<run-id>` 维护 role、type、path、purpose、
limits 和 consumer。Handoff 不分配 artifact ID，也不推断 `latest`。

`pack --output <zip>` 只复制选定的 schema 2 contracts。它保留外部路径说明，但不复制论文、报告、
Zotero 数据或其它 boundary bytes。

## 5. 更新、检查与异常

`update` 只刷新受管静态投影，不改 stable specs、runs、nodes、handoffs、changes 或外部文件。
`status`、`check`、`list`、`show`、`instructions` 和 `doctor` 只读。

外部 handoff 路径缺失只阻塞真正消费它的当前 node。CLI 不清空历史，不撤销 Gate，也不根据相似
文件名猜替代物。

旧或未知 workspace 被报告为 unsupported 并保持不变。Run/node 文件被手工破坏时，check/doctor
指出具体 owner；它们不猜测、修复或重建学术状态。

## 6. 生命周期验收

- Fresh init 没有 active run；所有运行文件只由确认后的 start 创建。
- Graph profile/capability 投影共享 preflight、hash ownership 与 commit-last transaction。
- Root、child、Gate、Decision 与 node completion 的授权边界可观察。
- 只读命令在成功、阻塞和诊断路径上均零写入。
- Resume 复用精确 run ID；旧 workspace 与损坏 owner 都安全停止。
