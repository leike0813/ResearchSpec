# Education Agent Skills `snapshot-32fce5c` ingest 审阅

## 审阅对象

- 上游：`https://github.com/GarethManning/education-agent-skills`
- Snapshot：`snapshot-32fce5c`
- Revision：`32fce5c0d097ec675cf81c750a65a379e4d87e3c`
- Git tree：`3223d79299ae10391c22549debef7ffc9ef7a0e2`
- Audit SHA-256：`e9326c43078db4c6bce4387c5a41a5bef775ad4d1691095c2020ef9cb9926857`
- Evidence map SHA-256：`58e0768df288aad6d9e3c5222338879ef1703bc78f80e02739f6d4194cc6bd2b`
- Production policy SHA-256：`fcb818163c79058ac084f944700c187c36b06b1698b1c9242454b973e259256f`
- License SHA-256：`f8366f5391f49974ea29b26f167b40f9c673714680666651c6fa047dc2314e4f`
- 完整预览树聚合 SHA-256：`c4fc2f93a7553a1c02538d15491ed108afd36ad4a4a291ca4db3bad39e74775d`
- 当前状态：`approved`

## 准入结论

完整目录处理 165 个 Skill：

- 136 个进入完整树预览；
- 19 个因 `original-framework` 来源与授权边界无法证明而排除；
- 10 个因 Sean Hu 署名内容缺少独立授权而排除；
- 两组排除项无重叠。

准入集合仅包含 immutable audit 中唯一内容作者为 Gareth Manning 且未标记
`original-framework` 风险的 Skill。每个预览 Skill 使用
`education-agent-skills-<upstream-name>`，包含 `SKILL.md`、
CC BY-SA 4.0 `LICENSE` 和完整 `NOTICE.md`。

## Evidence 适配

完整 evidence adaptation catalog 覆盖全部 872 个 declaration。136 个预览
Skill 中：

- 360 条 declaration 的 work 集包含 unresolved 状态，因此完整
  `evidence_sources` citation 被标记；
- 628 个正文完整单元被标记；
- 43 条 unresolved declaration 在正文中没有安全、稳定的作者/年份使用
  单元，因此仅标记 frontmatter citation；
- 所有标记均成对且不嵌套；
- 去除插入的 boundary block 和 marker 后，136 个 body 与 pinned source
  逐字节一致；
- `input_schema` 与 `output_schema` 语义值全部保持一致。

统一证据边界明确：未标记 citation 只完成书目身份核验，不代表
claim-support review；unresolved 内容在依赖前必须核验来源及其支持范围，
否则应省略、弱化并披露不确定性。

## 能力与安全

预览保留 116 个教师向、7 个混合、13 个学生向 Skill。转换未删除输入、
输出、Prompt、示例、主流程或学生交互。根据 immutable audit 只增加以下
边界：

- ResearchSpec workflow authority 始终属于 CLI；
- 未成年人和学生向 consequential use 需要可问责的人类监督；
- 隐私与学习分析不得用于隐性画像、监控或未经授权的数据传输、持久化；
- 福祉内容保持教育性、非临床，不替代 safeguarding、医疗或心理支持；
- error diagnosis 仅指可观察的任务推理与错误模式，不得诊断学习者或健康
  状况。

没有 Skill 因可通过这些边界消除的风险而被改写成阉割版。若出现无法避免的
临床诊疗、隐性监控、无人工参与的高风险决策、未授权敏感数据处理、
ResearchSpec 状态越权或无法证明的来源，policy 要求直接排除。

## Relationships 与域

全部 813 条 `chains_well_with` 声明已逐一分类为 advisory relationship，
硬 Skill 依赖为 0。预览域成员为：

- `curriculum-and-pedagogy`：54；
- `education-systems`：9；
- `specialist-studies-in-education`：73。

这些成员已写入生产 source-neutral domain catalog 和 registry。

## 分发与惰性边界

预览及未来 converter 只读取、规范化和复制静态 `SKILL.md`。它不分发或执行
上游 MCP、installer、tests、scripts、registry cache、项目文档或生成缓存，
不安装依赖，不读取凭据，不联系服务，也不上传学习者材料。

## 人工批准

用户已于 `2026-07-16T20:00:47+08:00` 明确批准以下完整树聚合
SHA-256，并授权生产 conversion、三个教育域成员、第六 vendor、bundle、
manifest、report 和 registry：

`c4fc2f93a7553a1c02538d15491ed108afd36ad4a4a291ca4db3bad39e74775d`

任何 audit、evidence map、policy、license、source 或生成字节变化都会产生新
hash，并使当前批准失效。
