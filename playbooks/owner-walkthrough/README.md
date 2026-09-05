# ResearchSpec 项目所有者演练

这份演练面向需要理解真实运行方式、同时保留最终决定权的项目所有者。它不替代 CLI
参考，也不承担发布验收；发布前人工测试请使用
[Dogfooding QA Playbook](../dogfooding/README.md)。

示例中的 ID、路径和时间只用于说明。真正操作必须先读取当前 `status` 和 `instructions`，不能
照抄示例值。

## 1. 先建立总模型

ResearchSpec 中有四个核心角色：

| 角色 | 负责什么 |
| --- | --- |
| 用户 | 研究目标、根 entry 确认、正式 Gate、Decision、分支和高影响选择 |
| Agent 与 ARSU Skills | 理解意图、维护研究语义、生产论文及研究交付物 |
| ResearchSpec CLI | 校验公开合同，执行 workflow-state mutation，并维护合法的 run、node、Gate、Decision、transition 和 handoff 记录 |
| Workspace 文件 | 保存 stable specs、profile、冻结 graph、运行记录和跨会话 handoff |

用户决定方向，Agent 完成语义工作，CLI 维护流程纪律，文件承担跨会话接口。ResearchSpec 不接管
论文文件的版本，也不为研究交付物建立全局登记表；Git 管理项目文件版本。

## 2. 初始化只准备工作环境

在研究项目中执行：

```bash
researchspec init
researchspec status --json
researchspec check all --strict --json
```

`init` 创建 workspace schema `"2"`，投影选定工具、命令 wrappers、registry-derived capability
packages 和可选 Adapter。它准备 graph profiles，但不会选择路线、创建 run 或开始研究。

典型目录如下：

```text
researchspec/
├── config.yaml
├── tool-installation-manifest.json
├── profiles/
│   └── academic-pipeline.yaml
├── specs/
│   ├── project.md
│   ├── sources.yaml
│   ├── claims.yaml
│   └── manuscript.yaml
├── changes/
└── runs/
```

四份 stable specs 的职责固定：`project.md` 保存问题、范围和边界，`sources.yaml` 保存来源身份
与限制，`claims.yaml` 保存 claim 强度与支持边界，`manuscript.yaml` 保存稿件类型、交付格式和
结构意图。它们可以为空；普通低风险编辑可直接进行，高影响变化使用 project change。

初始化后应看到有效 workspace 和零个 active run。旧或未知 workspace 只报告为 unsupported，CLI
不迁移、不回滚，也不从旧文件猜测 schema 2 状态。

## 3. 从意图进入一张冻结图

宽泛请求先由 `researchspec-navigate` 读取 `status`，再比较 routing catalog。Agent 要说明推荐
route、near miss、prerequisites、已确认 handoff inputs、边界 outputs、formal Gates、Decisions、
风险和成本。明确指定 route 只能减少消歧，不能跳过这份摘要。

机器交互遵循：

```text
status --json
  → instructions profile:<profile-id> --json
  → 选择 entry 与 entry node
  → 用户确认当前摘要
```

根 run 需要一次针对当前 entry 的确认。确认后，Agent 准备 schema 2 Start input，并调用：

```text
researchspec start profile:<profile-id> \
  --input <start.yaml> --confirmed-by <name>
```

`--confirmed-by` 表示确认当前精确摘要。根确认冻结 profile graph，并授权图中声明的节点、重复
轮次和 binding child runs；它不授权图外工作，也不替代每个 formal Gate、graph Decision、
failed-Gate override、异模型复核、Plugin/Adapter consent 或 QMD 执行 consent。

根 run 的文件为：

```text
researchspec/runs/<run-id>/
├── run.yaml
├── graph.yaml
├── handoff.md
└── nodes/
    └── <node-instance>.yaml
```

`run.yaml` 保存身份、profile、entry、状态和 parent binding；`graph.yaml` 是本次 run 的冻结
调度合同；`nodes/*.yaml` 保存 node 状态、输出、Gate attempts、Decision 和 transition 记录。
`status` 与 `instructions` 从这些文件即时派生 frontier。不要手改这些 authority 文件。

相同 Start input 产生相同根 run identity，精确重试返回已有 run；不同 entry、输入或输出合同
会产生不同 identity，不能借目录名伪装成同一次启动。

## 4. 节点输出与 handoff

ARSU Skill 生产的论文、报告、review、图表和数据都是 `researchspec/` 外的普通项目文件，例如：

```text
research/brief.md
research/synthesis.md
paper/manuscript.md
reviews/round-01.md
```

ResearchSpec 不复制、hash-bind 或管理这些文件的生命周期。run 的 `handoff.md` 只描述边界交换：
role、type、path、purpose、source run、intended consumer、format 和限制。路径必须是项目内的
安全相对路径，并位于 `researchspec/` 外；只有真正消费该 role 的动作才检查文件是否存在、可读
且没有 symlink escape。

Handoff 是按公开合同直接编辑的边界记录，也可以由 CLI 渲染或替换：

```text
researchspec handoff run:<run-id> --input <handoff.yaml|json>
```

当 handoff 变化同时触发 workflow-state mutation 时，使用 CLI 让当前字节前置、所属记录和受影响
祖先的完成派生在同一写入计划中处理；单独整理外部路径时仍只改变 handoff 内容。下游按 role 和
binding 消费，路径本身不是工作流关系的事实源。

## 5. Frontier、Gate、Decision 与 Advance

完成语义工作后，Agent 按 `instructions` 要求提交声明输出：

```text
researchspec advance node:<run-id>/<node-id>[@round] \
  --input <advance.yaml> --actor-name <name>
```

CLI 校验 node 是否 eligible、输入 binding、输出路径和必要 validator，成功后更新 owning node。

Gate findings 可以由 Agent 或 validator 准备，verdict 必须由用户确认：

```text
researchspec instructions gate:<run-id>/<gate-id>[@round]
researchspec decide gate:<run-id>/<gate-id>[@round] \
  --verdict pass --actor-name <name> --reason <reason>
```

`pass`、`pass_with_conditions` 和 `fail` 都不会顺便完成节点。Challenge 追加新的 attempt，失败
Gate 的 override 需要单独的理由与 Decision identity，并保留原失败事实。

Graph Decision 也逐项确认；记录 choice 后只有对应分支进入 frontier。普通探索、工具调用和日常
文件修改不应伪装成 Decision。每次 mutation 都以当前 authority 字节为前置；冲突时重新读取，
不产生部分写入。

## 6. Academic Pipeline

`academic-pipeline:end-to-end` 启动 root run。阶段顺序、子图、Gates、Decision 和 repeatable
revision template 来自 `profiles/academic-pipeline.yaml`，core 不硬编码具体研究流程。当前根图
的 `parallel_groups` 为空；其中的 reviewer child 使用 `academic-paper-reviewer` profile，该
profile 将 `specialist` 与 `da` 声明为 `join_policy: all` 的并行组。

根确认后，frontier 暴露 eligible subgraph 时使用：

```text
researchspec start node:<root-run-id>/<node>[@round]
```

Child start 继承根授权，不接受第二次 `--confirmed-by`。Child 有自己的 run、冻结 graph、node
files 和 handoff；Child 内的 formal Gate、Decision 与其它独立 consent 仍照常确认。重复的
revision/re-review 从 graph 暴露的 round 开始，不能自建第二个轮次计数器。

典型 end-to-end frontier 是 research、research Gate、write、write Gate、review、review Gate，
然后按 `revision-outcome` Decision 继续或接受；继续会开启下一轮 revision/re-review，接受后才
解锁 format、final-integrity 和 final-integrity Gate。Child 完成、handoff 存在或 Gate 通过只使
对应条件满足，root completion 仍由冻结 graph 和合法 mutation 派生。

## 7. 恢复、project change 与 pack

关闭聊天后，新 Agent 先执行：

```text
researchspec status --json
researchspec instructions run:<run-id> --json
```

它只依据 run、graph、node、handoff、stable specs 和 changes 恢复；多个候选由用户选择，不能
根据“最近一个”或目录名猜 selector。恢复 active root run 不需要再次启动确认，frontier 到达时
启动 graph-authorized child/round 也不需要第二次 run confirmation；Gate、Decision 和 override
仍逐次确认。新 root run 或新的 entry 仍需新的确认。

高影响 spec 变化使用：

```text
propose → 用户与 Agent 编辑 change → decide
→ 显式编辑 stable specs → check → 标记 applied → archive
```

接受 change 不会自动应用 `delta.yaml`。`pack --scope run:<run-id>` 只打包选定的 schema 2
authority、handoff 和必要 change 文件，不复制 handoff 指向的外部文件字节、Zotero 数据或外部
服务内容。

常用命令回答的问题如下：

| 命令 | 问题 |
| --- | --- |
| `status` | 当前 run、阻塞和 frontier 是什么 |
| `instructions <selector>` | 当前 prerequisites、输出和确认要求是什么 |
| `list` / `show` | 有哪些 profiles、runs、nodes、Gates、Decisions、changes 和 handoffs |
| `handoff <run-selector>` | 当前 run 记录了哪些边界路径 |
| `check all --strict` | workspace 合同和引用是否有效 |
| `doctor` | unsupported 或受损 workspace 的只读诊断是什么 |

最后区分三个结论：**Run complete** 表示图中选定节点、child、Gate 和 Decision 已满足；
**Workspace valid** 表示当前 specs、profiles、runs、handoffs 和 changes 通过检查；**论文可投稿**
还需要作者确认内容、证据、伦理、合规、格式和 venue 要求。
