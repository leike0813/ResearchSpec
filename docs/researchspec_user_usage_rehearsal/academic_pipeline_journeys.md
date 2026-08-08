# Academic Pipeline 用户旅程

本文属于 [ResearchSpec 目标态用户使用预演](../researchspec_user_usage_rehearsal.md)。Pipeline
只编排已确认的 ARSU children；学术方法由 child Skill 提供，运行权威由项目 profile 与每个
实例自己的 `control.yaml` 提供。

## 共同合同

项目内的 `researchspec/profiles/academic-pipeline.yaml` 明示 entry、默认 children、顺序、
join、formal Gates、branches、override policy 与动态 revision-round template。它是发布侧
规则的受管项目投影，不是 stable research spec，也不保存具体实例状态。

Parent 启动确认只允许创建 parent。每个默认、条件性或动态 child 都必须在启动前重新展示
Skill/mode、实际输入、外部输出、formal Gates、成本和角色边界。拒绝 child 时，parent 停在
当前 checkpoint；不得预创建 child 或伪造完成状态。

## 1. `academic-pipeline:end-to-end`：从研究目标到投稿包

### 1.1 自然语言入口

从 S0 开始。用户说：

> 我想研究城市绿地能不能缓解城市热岛，最后写成一篇论文。

目标跨越研究与写作，Navigate 读取 config、四份 stable specs、项目 pipeline profile、
`status` 和 routing catalog。它先询问城市/气候区、地表温度与空气温度、绿地类型、时间与
语言范围、目标稿件、venue、Zotero/外部检索权限和建议输出路径。

用户确认后，Agent 将当前事实写入 `project.md` 与 `manuscript.yaml`。`sources.yaml` 和
`claims.yaml` 仍为空，不使用占位来源或推测结论。

### 1.2 Parent 路线确认

Navigate 展示：

```text
Skill: academic-pipeline
Entry: end-to-end
Default children:
  1. deep-research:full
  2. academic-paper:full
  3. academic-paper-reviewer:full
  4. academic-paper:revision + reviewer:re-review（条件性、可重复）
  5. academic-paper:format-convert（accepted review/re-review 后）
Formal Gates:
  evidence quality、manuscript readiness、review/editorial outcome、final integrity
Cost: high / long-horizon
Example outputs: research/urban-heat/、paper/
```

用户拒绝或调整路线时，不创建 subflow。确认后，`start` 只创建 parent：

```text
researchspec/subflows/
└── 2026-08-01_10-15-00__academic-pipeline__end-to-end__8f31ac/
    ├── control.yaml
    ├── handoff.md
    └── work/
```

```yaml
instance_id: sf_pipeline_8f31ac
route: academic-pipeline:end-to-end
profile: academic-pipeline
status: active
checkpoint: research
gates: []
decisions: []
```

此时仍没有 research child、论文或报告。

### 1.3 Research child

Profile 暴露 `deep-research:full`。Agent 单独展示 inputs、RQ/method/bibliography/synthesis/report、
evidence Gate 和 high/long-horizon 成本。用户确认后才创建 child：

```text
2026-08-01_10-18-30__deep-research__full__31b9d2/
├── control.yaml
├── handoff.md
└── work/
```

用户允许 Zotero 时，producer 可以嵌套调用 Adapter；plugin 建议也另行征得同意。二者都不
修改 parent 或 child control。Research 交付物写入：

```text
research/urban-heat/
├── rq-brief.md
├── methodology.md
├── bibliography.md
├── literature-matrix.csv
├── synthesis.md
└── research-report.md
```

Child handoff 逐项指向外部文件。Verify 提出 evidence verdict；用户确认后，`decide` 将 Gate
写入 research child control。Agent 将用户接受的来源与 claims 提炼进 stable specs，
`advance` 完成 child，再推进 parent checkpoint。既有外部文件不被移动或登记。

### 1.4 Writing child

Agent 展示 `academic-paper:full` 的实际上游输入、输出、两项 readiness 检查和成本，用户再次
确认。Writing child 读取四份 specs、research control/handoff 及其指向的 report、synthesis
和 bibliography。

```text
paper/
├── outline.md
├── evidence-map.md
├── argument-blueprint.md
└── manuscript.md
```

重要 outline 选择经 `decide` 记录 structure Decision，认可蓝图进入 `manuscript.yaml`。
Handoff 指向稿件；Verify 提出 manuscript-quality/citation-integrity verdict，用户确认 Gate，
`advance` 完成 child 并推进 parent。

### 1.5 Reviewer child 与 editorial branch

启动 `academic-paper-reviewer:full` 前，Agent 再次展示被审稿件、scope、blind 边界、输出、
review Gate 和成本。Reviewer 输出：

```text
paper/reviews/
├── round-01-review.md
├── editorial-outcome.md
└── revision-roadmap.md
```

用户先确认 Review Gate，再单独选择 editorial branch：

- `accept`：进入 `format`，完成后才进入 final integrity；
- `revision`：实例化下一 revision round；
- `reject/stop`：结束或重新规划；
- failed Gate 后继续：需要 profile 允许的显式 override 和理由。

主线选择 `revision`。`decide` 将 branch 写入 reviewer child control，并保留原 Gate verdict。
Parent 只读取该 control 与 handoff 来确定下一 checkpoint。

### 1.6 Revision round 与 re-review

Profile 按 branch 实例化 round 01 的候选 children，但不自动创建实例。Agent 分别在启动
revision 与 re-review 前请求确认：

```text
researchspec/subflows/
├── 2026-08-02_09-00-00__academic-paper__revision__round-01__7a42dd/
└── 2026-08-02_11-30-00__academic-paper-reviewer__re-review__round-01__e2c618/
```

Revision child 产生 ARSU patch、修订稿和回复信。无状态 patch 工具只对显式路径工作；失败
时不改稿、不写 control。Verify 评估回应充分性，用户确认 Gate，`advance` 完成 revision。

Re-review child 读取修订稿、原 review、response 与 patch，输出
`paper/reviews/round-01-re-review.md`。若仍需修改，用户通过新的 branch Decision 请求 round
02，随后分别确认新的 children。Core 不写死轮数，旧 round 目录保持原样。

### 1.7 格式化、final integrity 与完成

用户确认 `academic-paper:format-convert` child 后，producer 读取最终稿与 manuscript spec。Markdown
沿用既有转换路径；QMD 以 `.qmd` 作为正式源稿，读取其同目录资源但不纳入多文件 Quarto project：

```text
paper/submission/
└── manuscript.pdf  # v1 每个 formatting child 只有一个确认目标
```

Verify 同时检查稿件源稿（QMD 或 Markdown）与 formatted output、稳定 claims 与已知限制，提出
final-integrity verdict。用户确认后，format child 完成，parent 才能进入 final-integrity；parent handoff 汇总最终外部
路径、限制和后续责任。所有 children 保留为按时间浏览的直接审计材料。

### 1.8 End-to-end 验收

- Parent 与每个 child 都有独立启动确认。
- Gate、branch 和 override 分开确认并写入 owning control。
- Profile 决定可用顺序，Agent 不从 prose 自行创建 child。
- Sources/claims/manuscript blueprint 只在用户认可后进入 stable specs。
- 外部交付物不进入 `researchspec/`，pack 默认也不包含其字节。

## 2. `academic-pipeline:mid-entry`：从已有材料继续

### 2.1 识别真实起点

用户在 fresh current workspace 中说：

> 我已经有研究报告和一版稿件，也收到了一轮审稿意见，从修改阶段继续。

Navigate 不导入旧 workspace Gate，也不要求 Material Passport。它读取四份 specs，检查用户
提供的外部材料：

```text
incoming/
├── research-report.md
├── manuscript.md
├── reviewer-comments.md
└── revision-notes.md
```

Agent 询问这些文件的来源、当前稿件身份、review round、哪些结论已获用户认可、venue 与
期望终点。它区分“材料存在”和“本 workspace 已通过 Gate”；前者不能自动满足后者。

### 2.2 建立外部 handoff

用户确认材料边界后，Agent 先把稳定研究事实提炼进四份 specs；未确认 claims 保持候选。
Navigate 准备 mid-entry 摘要：

```text
Skill: academic-pipeline
Entry: mid-entry
Legal points: research、write、review、revision、re-review、format、final-integrity
Chosen point: revision
External inputs: manuscript、reviewer comments、research report
First child: academic-paper:revision（单独确认）
Expected later children: re-review、后续 revision rounds、format-convert、final-integrity
Formal Gates: revision completeness、review outcome、final integrity
Cost: high / long-horizon
```

摘要同时说明不会继承任何旧 Gate/Decision/completion。用户拒绝时不创建 parent。

### 2.3 Parent 与第一个 child

用户确认后，`start` 创建新的 mid-entry parent，payload 同时携带 `profile_entry: mid-entry` 与
`entry_point: revision`。Control 的 `start_confirmation.entry_point` 记录该选择，初始 checkpoint
直接是 `revision`；它不会预创建 revision child。Incoming 文件保持原路径，不复制进 parent
`work/`。

若用户先要策略，Agent 单独确认 `academic-paper:revision-coach`；若修改方案已明确，则单独
确认 `academic-paper:revision`。Parent 确认不能替代这一步，也不能预先授权随后 re-review。

每个 child 按 standalone 合同生产外部结果、更新自己的 handoff、经必要 Gate 与 `advance`
完成。Parent 只依据项目 profile、child control 和 handoff 继续。

在 parent 尚未发生 profile transition 时，frontier 只暴露所选入口 child。该 child 可以跳过
profile 内部的上游 child dependency 和 branch unlock，但输入角色、Gate、成本、稿件快照和
文件检查不变。首个 child 完成并推进 parent 后，所有普通依赖、Gate、branch 和动态 round
规则恢复；从 `revision` 或 `re-review` 进入时，本地轮次从 round 1 开始。

### 2.4 不同起点的处理

- 只有 research report：选择 `write`，再单独确认 writing child；不假定 manuscript 已存在。
- 已有 draft、没有 review：可选择 `review` 或 `final-integrity`，由用户确认实际入口与所需输入。
- 已有 comments、没有可信 current draft：请求重新定位稿件，不能猜测 base。
- 已有 revised draft 和 response：可选择 `re-review`，但本 workspace 仍需自己的 Gate，并从 round 1 开始。
- 只有旧 Passport、registry ID 或 receipt：视为普通未知材料或拒绝，不解析为权威。

### 2.5 Mid-entry 失败与验收

输入路径缺失只阻塞依赖它的当前动作。材料互相矛盾时，Agent 展示冲突并请求用户指定当前
稿件；不得以修改时间或文件名自动选择。

验收要求新 parent 有自己的确认与 control，所有 children 单独确认，外部材料通过 handoff
传递，旧 workspace 的 Gate/Decision 永不继承。Mid-entry 最终完成方式与 end-to-end 相同，
但历史明确说明它从外部材料开始。

## 3. Pipeline 暂停、拒绝与 override

恢复原 parent 时，Navigate 从 control checkpoint 与 project profile 计算当前说明，不重新
确认已启动实例。拒绝下一个 child 时 parent 保持 active/paused；用户以后可以恢复。

Formal Gate fail 后可以重新调用 Verify，新的结论作为同一 Gate 的新 attempt，旧 fail 保留。
如果仍失败而用户坚持继续，Decide 收集批准人、时间与理由；只有 profile 允许 override 时
`advance` 才继续。Override 不能改变原 verdict，也不能被 parent 启动确认暗示授权。
