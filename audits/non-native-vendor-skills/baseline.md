# 非原生上游 Skill 规范基线

## 审阅目的

本报告记录 `standardize-non-native-vendor-skills` 建立时，HistAgent、
FinRobot 和 Materials-Science-Skills-For-LLM 产物相对新规范的已知差距。
它是迁移排序依据，不是生产准入结论，也不把新校验器接入当前 registry
或 release Gate。

审阅依据包括：当前转换器源、当前生成或草案 Skill 树、vendor 审计与转换
文档，以及 `docs/non_native_vendor_skill_standard.md`。这里只审阅静态文件，
没有导入或执行 vendor 代码、安装依赖、读取凭证或访问外部服务。

## 总体结论

| 顺序 | Vendor | 当前状态 | 主要问题 | 后续动作 |
| --- | --- | --- | --- | --- |
| 1 | HistAgent | `ingest-histagent` 草案，未生产准入 | 私有 runner/schema 被误作通用协议；关键契约被拆入浅 references；正文不足以独立控制复杂能力 | 先重新设计三个完整 Skill，再恢复 ingest |
| 2 | FinRobot | 六个生产 Skill | 正文由统一 shared contract 与短 fragment 拼装；能力资源存在，但资源选择、调用、输入输出和失败恢复没有在每个 Skill 中形成完整闭环 | 单独 change 重写并重新做完整树审核 |
| 3 | Materials-Science-Skills-For-LLM | 七个生产 Skill | 正文极薄，普遍把执行细节交给 references 或用户环境；缺少足够的工作流、职责、完成条件和失败恢复 | 单独 change 按能力逐项重写 |

ToolUniverse 和 Scientific Agent Skills 提供原生 Skill 上游，不在本次强制改写
范围内。

## HistAgent

### 已确认事实

- 三个草案 `SKILL.md` 分别为 47、44、46 行，三个 vendor 专属 reference
  分别为 11、11、17 行；完整树还会追加通用 I/O 与依赖 reference。
- 每个草案固定要求 `assets/runner.json`、通用 input/output schema、
  `RUNTIME.json`、`dependencies.json`、doctor 和结果校验器。
- 这些文件只由 HistAgent 草案自身消费，ResearchSpec 没有对应公共 runner。
- 正文给出命令和简短职责边界，但具体 payload、结果层次、依赖诊断和失败
  契约被分散到 references 与固定 runtime 元数据。

### 相对新规范的差距

- `SKILL.md` 缺少完整的输入发现、逐步工作流、模式合流、输出验收、失败
  分类与恢复路径。
- reference 内容短且包含执行关键规则，不符合“可延迟加载的详细资料”定位。
- 固定 JSON envelope 和 schema 反映另一套私有接线协议，而不是现有
  ResearchSpec 消费者的需求。
- 历史研究的状态与 Gate、来源识别/分析的脚本能力虽然已有实现雏形，但
  主文件没有把每项能力与具体实现、调用时机、依赖和失败行为逐一闭合。

### 迁移门槛

`ingest-histagent` 保持暂停。恢复前必须重新撰写三个 vendor 专属完整树，
移除无消费者的私有 runner 协议，按实际需要选择 script-assisted、stateful
和 resource-backed 扩展，通过复制树离线测试，并重新绑定完整树人工审核
哈希。已有安全、许可和历史来源分层规则继续有效。

## FinRobot

### 已确认事实

- 六个生产 `SKILL.md` 均为 77 行，由一个统一 `renderSkill` 将 frontmatter、
  provenance、能力 fragment 和 `shared-contract.md` 拼接得到。
- 每个 Skill 包含来源派生资源、许可、notice、derivation 和
  `dependencies.json`；资源具有审计来源与适配结论。
- 当前正文能表达业务能力与形式安全边界，但大量段落在六个 Skill 间同构。

### 相对新规范的差距

- shared contract 加 fragment 的生成方式无法证明每个 Skill 的主工作流是
  作为一个完整能力被设计和审核的。
- 资源文件没有在每个 Skill 中按路径建立完整的选择、调用、输入、输出、
  依赖、provider 绑定和失败恢复说明。
- “允许产生预测、估值、评级和建议”等能力声明强于现有执行指令；目标
  Agent 仍需自行补全如何组织计算、验证和结论交付。
- `dependencies.json` 是发布元数据的一部分，但没有真实 ResearchSpec
  runtime 因此不应被当作执行能力的替代品。

### 迁移门槛

未来 FinRobot change 应保留已审核的来源、许可、安全与能力边界，逐个能力
撰写完整 Skill 树，为每个派生资源建立明确消费者和调用闭环，并对任何保留
脚本执行复制树测试。迁移前现有生产发布不因本标准自动失效。

## Materials-Science-Skills-For-LLM

### 已确认事实

- 七个生产 `SKILL.md` 为 22 至 25 行。
- 除 Atomsk 外，多数正文要求先读取一个或多个 reference；当前七个 Skill
  共发布 15 个 reference 文件。
- 正文主要陈述适用范围、用户管理依赖、昂贵或远程操作确认和若干科学检查
  点，没有打包可执行脚本。

### 相对新规范的差距

- 主文件普遍缺少按输入、判断、操作、验证、交付组织的完整工作流。
- reference 被当作普通执行入口，却没有在正文内保留完整的关键约束、完成
  定义和失败恢复。
- “prepare”“plan”“interpret”等能力缺少可验收产物和代表性成功/失败
  路径，容易退化为通用工具提醒。
- 对外部 CLI、GPU、DFT、调度器和模型环境说明了权限边界，但没有为每项
  能力完整说明命令构建、结果验证、依赖不可用和部分失败时的处理。

### 迁移门槛

未来 Materials change 应按七项能力分别决定 instruction-led、
script-assisted 或 resource-backed 厚度，把普通路径与硬约束收回
`SKILL.md`，只保留确实节省上下文的详细 reference，并重新审核外部工具的
实际可执行闭环。

## 固定迁移顺序与边界

1. 完成并验证本标准。
2. 重新设计 HistAgent 三个 Skill，更新 `ingest-histagent` 后再恢复实现。
3. 通过独立 change 迁移 FinRobot。
4. 通过独立 change 迁移 Materials-Science-Skills-For-LLM。

本报告不修改上述 vendor 的 generated tree、registry、domain membership、
package scripts 或生产 vendor 数量。每次迁移仍需使用对应 vendor 的源审计、
许可、安全、依赖和完整树 hash-bound 人工审核作为事实源。
