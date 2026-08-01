# Workspace 生命周期旅程

本文属于 [ResearchSpec 目标态用户使用预演](../researchspec_user_usage_rehearsal.md)，描述
目标行为，不代表当前 CLI 已经实现。

## 1. 从空项目初始化

### 用户目标与确认

用户在一个没有 `researchspec/` 的项目根目录运行：

```text
researchspec init
```

CLI 检测可用 Agent hosts，并展示准备投影到每个 host 的固定 Skills 与 16 个 command
wrappers。用户选择目标 hosts 后确认安装。Host 选择只决定静态投影位置，不开始任何研究。

### 文件结果

```text
project/
├── researchspec/
│   ├── config.yaml
│   ├── tool-installation-manifest.json
│   ├── profiles/
│   │   └── academic-pipeline.yaml
│   ├── specs/
│   │   ├── project.md
│   │   ├── sources.yaml
│   │   ├── claims.yaml
│   │   └── manuscript.yaml
│   ├── changes/
│   └── subflows/
├── .zotero-bridge/
│   ├── profile.template.json
│   └── bin/<platform-runtime>
└── <host-specific Skill projection>
```

固定 Skill 表面是 4 个 ARSU Skills、4 个 Companion Skills 和 7 个 Zotero Adapter Skills。
没有安装任何 domain plugin。`tool-installation-manifest.json` 只管理 ResearchSpec 生成的软件、
profile 和 Skill 投影，不登记研究交付物。

四份 specs 只是空骨架。初始化不得创造来源、claims、稿件结构、研究结论、active subflow，
也不得创建下列旧控制面：

```text
runs/current/
artifact-registry.json
Gate/Decision ledger
receipt
Material Passport
```

### 初始化后的只读视图

`researchspec status` 返回“Workspace 已初始化、没有 active subflow、研究意图尚不充分”的
语义摘要。`researchspec check` 校验骨架和受管 profile；两个命令都不产生文件。

### 验收

- 用户拒绝 host 投影时，不在该 host 写文件。
- `init` 不启动 Agent、开发服务器、Zotero 或外部服务。
- 非空目标或未知内容触发安全停止，不覆盖现有文件。
- 第一次可见的研究变化只能来自后续用户-Agent 对话或显式命令。

## 2. 明确研究意图但不启动工作

从快照 S0 开始。用户告诉 Agent：

> 我想比较湿润与干旱气候城市，关注公园和林荫道对地表温度与近地气温的影响，最后写成
> 英文期刊论文。

Navigate 澄清时间范围、语言、证据类型、目标读者和是否允许外部检索。用户确认后，Agent
直接维护 `project.md` 与 `manuscript.yaml`。这属于已确认事实的普通文档编辑，不需要先建
change，也不启动 subflow。

```yaml
# manuscript.yaml 的语义片段
output_type: journal_article
language: en
audience: urban_climate_researchers
venue: provisional
```

`sources.yaml` 和 `claims.yaml` 保持空集合。`check` 允许研究早期的不同完成度；它只检查
结构与已有引用，不要求用占位事实填满四份 specs。

## 3. 查看、解释和定向检查

用户问“现在做到哪了”时，Navigate 使用 `status`。用户要浏览实例或 change 时，使用
`list` 再对选中对象调用 `show`。用户问“为什么不能开始写作”时，Navigate 对相关 spec、
profile、control 或 handoff 使用定向 `check`，然后区分：

- 已知事实：例如缺少 accepted claims；
- 推断：现有 synthesis 可能足以形成候选 claims；
- 未知：外部报告路径尚未读取；
- 冲突：handoff 指向的稿件与用户指定稿件不同。

这些命令不会保存项目级索引、history projection 或诊断报告。需要留下说明时，由用户明确
要求 Agent 修改相应 handoff/change，而不是让 `status` 暗中写文件。

## 4. 更新受管静态内容

用户运行 `researchspec update`。CLI 先确认 workspace 是当前格式，再检查安装 manifest、
受管 Skills、wrappers、profiles 和 Zotero runtime metadata。更新只作用于 ResearchSpec-owned
静态投影，并遵守生成文件 drift 保护。

以下内容保持不变：

- 四份 stable specs；
- 所有 subflow `control.yaml`、`handoff.md` 和私有 `work/`；
- changes；
- `researchspec/` 外的研究、稿件和评审材料。

目标版本只支持同一 current workspace 合同内的更新。检测到旧 strict/adaptive runtime 时，
`update` 不提供迁移参数，也不尝试解释旧 state。

## 5. 暂停与恢复同一个实例

从快照 S4 开始，存在一个尚未完成的 `academic-paper:revision` child。用户说：

> 继续上次的论文修改。

Navigate 运行 `status`，扫描 controls、handoffs 与 changes，找到唯一可恢复实例；随后用
`instructions <instance-id>` 读取当前 checkpoint，并按需读取该实例的 control、handoff、
私有 `work/` 和当前动作依赖的外部文件。

```yaml
instance_id: sf_revision_round_01
route: academic-paper:revision
status: active
checkpoint: revise-methods-and-limitations
round: 1
```

同一实例的 route、范围、成本、Gate 与 branch 没有改变，因此不重新请求启动确认。若用户
改为 `revision-coach`、追加新的 child、选择新的 editorial branch 或创建 round 02，Agent
必须展示新的路线摘要并重新确认。

恢复不会新建同名实例，不把外部稿件复制进 `work/`，也不根据聊天猜测 checkpoint。

## 6. Handoff 与上下文导出

### 直接交接

Producer 完成一组边界交付物后，Agent 使用 `researchspec handoff` 创建或维护指定 subflow
的 `handoff.md`。输入只包含用户/Agent 显式提供的 role、type、path、用途、限制和预期下游：

```markdown
## Outputs

- role: current-manuscript
  path: paper/manuscript.md
  use: input for independent peer review
  limits: tables 3–4 still need visual QA
```

Handoff 不分配 artifact ID，不声明隐式 `latest`，不保存文件 hash，也不拥有该文件。

### Pack

用户要求“给另一个 Agent 一个上下文包”，Navigate 先说明隐私和包含范围，再调用：

```text
researchspec pack --output exports/researchspec-context.zip
```

默认包包含配置、project profile、stable specs、controls、changes 与 handoffs。外部论文、
报告、Zotero 数据、subflow 私有 `work/` 不进入包；handoff 中仍保留路径与限制说明。输出
位置由用户指定，既有文件不被静默覆盖。

## 7. 外部路径后来缺失

Research handoff 曾指向 `research/urban-heat/synthesis.md`，但该文件后来被移动。`status`
仍可显示历史 subflow，既有 Gate 与 completion 继续有效。只有当前写作动作确实要读取该
文件时才阻塞。

Agent 向用户提供三个有界选择：重新定位原文件、选择替代输入、缩小当前工作范围。它不做
全 workspace drift 扫描，不清空 handoff，不撤销历史 Gate，也不从相似文件名猜测替代物。

## 8. 旧或未知 workspace

CLI 发现 `runs/current/state.yaml`、registry/ledger、Passport 或其它非 current 合同时停止：

> Unsupported workspace format. This development version supports only the current workspace contract.

`status`、`check` 和 `doctor` 可以报告这一事实，但不兼容解析、不移动、不覆盖、不归档，
也不从旧工件推断新 control。用户若要重用旧材料，先在框架外备份，再在 fresh workspace
中把它们作为普通输入和 handoff 重新引入。

## 9. `control.yaml` 被手工修改

用户把已完成 child 的 checkpoint 改回早期阶段，造成 status 与 Gate 记录矛盾。`check` 与
`doctor` 报告结构或状态冲突，并指出 owning control；它们不猜测哪个 Gate 应保留，也不
自动修复语义权威。

可确定派生的静态 Skill/profile 投影可以在受控更新流程中重建，`control.yaml` 不属于此类
文件。恢复必须由用户根据 Git 历史或明确证据作出决定。

## 10. 生命周期验收

- `init`、`update`、`status`、`check`、`list`、`show`、`instructions`、`handoff`、`pack`
  与 `doctor` 的边界都能从用户旅程中观察。
- 所有只读命令在成功、阻塞和诊断路径上都不产生文件。
- 只有当前动作需要外部文件时才检查该路径。
- 恢复复用原实例；语义路线发生变化时重新确认。
- 旧 workspace 和损坏 control 都安全停止，不产生“修复后”的伪造权威。
