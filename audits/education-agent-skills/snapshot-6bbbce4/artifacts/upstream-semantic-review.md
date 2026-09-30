# Education Agent Skills 增量语义审阅 — snapshot-6bbbce4

审阅日期：2026-10-01。阅读范围包括两项变更 Skill 的完整候选正文、旧版正文、当前 reviewed vendor/extension 正文、对应 manifest/profile，以及转换和生成路径。其余程序通过全量来源哈希和正文恢复检查继承既有审阅；没有将机器比对描述为重新完成全部 136 项人工语义审阅。

本记录中的上游行号均指 `6bbbce418f82e11044009c9f3b7373a354de5bd0`，通过 `git show <revision>:<path>` 读取。当前生产目录仍对应 `32fce5c`。

## 1. 独立证据检查

上游：[skills/student-learning/unassisted-evidence-checkpoint/SKILL.md](https://github.com/GarethManning/education-agent-skills/blob/6bbbce418f82e11044009c9f3b7373a354de5bd0/skills/student-learning/unassisted-evidence-checkpoint/SKILL.md)。

raw：`skills/plugins/vendors/education-agent-skills/education-agent-skills-unassisted-evidence-checkpoint/SKILL.md`。

extension：`skills/plugins/extensions/capabilities/plugin-education-agent-skills-unassisted-evidence-checkpoint/SKILL.md`。

| 不可丢失的语义点 | 候选证据与判定 | 当前扩展承载情况 |
|---|---|---|
| 先有练习，再独立尝试；提交前无提示，记录 assistance tag | L39–50、L101–111、L143 的独立窗口和 assisted 重标规则保持；`preserved` | System Prompt 的 no-help、review、capture 步骤完整保留 |
| 把协议与研究的真实验证范围分开 | L64 明确协议是研究推论；片段 `design extrapolation from the study`；`adapted` | What This Skill Does 仍把协议直接归为研究 guardrail；尚有 `gap` |
| 研究描述包含对照组与两种 tutor 的区别 | L19、L68 更正题名、比较基准和提示设计；`adapted` | Evidence Foundation 仍保留旧解释和未核实术语归因；尚有 `gap` |
| 成功反馈只说明本次表现；长期保持与其他情境要另查 | L126、L152 修改反馈，L245 保留单次不足以概括能力的限制；`adapted` | System Prompt 的成功反馈仍直接宣称 real learning；尚有 `gap` |
| learner-facing 输入、置信度/反思/错误记录、限制与安全边界完整保留 | L24–56、L239–247；`preserved` | 六字段 brief 和 reviewed evidence/authority/minors/privacy 等边界存在；新正文应继续由既有适配路径承接 |

候选前言、程序及 Known Limitations 已能一致地限定独立表现的推断。L128 仍借群体研究解释个人表现差距，L209 的示例也把单次置信度变化描述为校准；这是保留的个体归因风险，不能把本次观察当成因果证明或完整校准测量。该风险需要在使用时服从现有证据边界，不构成引入新的测评或 workflow 权限的理由。

前置证据强度、标签和版本变更只是上游元数据观察。ResearchSpec 的作品存在性、claim-support 与 learner-safety 判定继续由自己的记录负责。

## 2. 每周学习策略回顾

上游：[skills/student-learning/weekly-agency-review/SKILL.md](https://github.com/GarethManning/education-agent-skills/blob/6bbbce418f82e11044009c9f3b7373a354de5bd0/skills/student-learning/weekly-agency-review/SKILL.md)。

raw：`skills/plugins/vendors/education-agent-skills/education-agent-skills-weekly-agency-review/SKILL.md`。

extension：`skills/plugins/extensions/capabilities/plugin-education-agent-skills-weekly-agency-review/SKILL.md`。

| 不可丢失的语义点 | 候选证据与判定 | 当前扩展承载情况 |
|---|---|---|
| 有数据时先呈现证据，让学习者先解释 | System Prompt / SECTION 2、L104–109；`preserved` | 正文保留 learner-first interpretation |
| 表现差距用于反思学习策略，避免赋予未核实诊断名称 | L123 用 `assisted–unassisted gap`、`useful evidence` 描述；`adapted` | 当前扩展 L80 仍使用 phantom attainment signal；尚有 `gap` |
| 缺数据时转为基线目标设定或有披露的回忆 | SECTION 1 和 WARM-START PROTOCOL；`preserved` | 两条路径完整保留，不需要新增数据存储或授权 |
| 学习者提出并确认下一周期的策略目标 | SECTION 3 和 EVIDENCE CAPTURE；`preserved` | 返回目标及反思证据，不产生 ResearchSpec Decision |
| 会话证据的局限和因果解释谨慎保持 | Known Limitations 1–4；`preserved` | reviewed 隐私、学员安全和证据边界继续适用 |

该 Skill 的 frontmatter、五条证据声明、四条 advisory relationship 均未变。没有观察到新的工具、引用文件、脚本、外部服务或 required brief field。

## 3. 受影响研究声明的范围核对

针对 `evidence-0768 -> work-0317`，对照 [PNAS 原文](https://www.pnas.org/doi/10.1073/pnas.2422633122) 的 Experimental Design、Main Results、Discussion：土耳其中学数学随机试验约千名学生；GPT Base / Tutor 的辅助练习表现分别比对照组高 48% / 127%；随后独立测验中 Base 低 17%，Tutor 与对照组差异不显著。原文只研究短期结果，没有验证这个 Skill 的检查协议。新解释比旧版更贴合这项研究的适用范围。

这项核对不覆盖其他四条引用的教育机制，也不证明检查本身改善长期学习、广泛迁移或任何个体的学习原因。原论文将长期结果列为后续研究方向。旧 evidence map 的存在性结论可以延续，旧 `claim_support_reviewed: false` 保持原样；新版本若记录本次核对，应按具体声明范围表达，不能整体升级作品的支持强度。

`evidence-0769`、`evidence-0772` 的已验证存在性，以及 `evidence-0770`、`evidence-0771` 的 unresolved 状态保持。weekly review 的声明 `evidence-0773`–`evidence-0777` 也保持原存在性状态；重新绑定新源哈希时继续保留 unresolved 标记及证据边界。

## 4. 授权与排除范围

候选根 [LICENSE](https://github.com/GarethManning/education-agent-skills/blob/6bbbce418f82e11044009c9f3b7373a354de5bd0/LICENSE) L3–7 增加 Gareth Manning 署名和教育内容的 CC BY-SA 4.0 通知。L32–33 将其标明为通知，并链接完整法律文本。它为已准入作者内容补充明确来源依据；不会替代分发中的完整 license，也不解决第三方来源与框架授权。

所有 29 个被排除 Skill 的源文件均未变。没有新的逐项授权或框架来源审阅，因此不扩大准入。MCP 服务、安装/校验脚本、上游 registry/cache、tests 与依赖全部仅作审计参考。

## 5. 流程权威与知识资源

- 136 个已准入源正文从 reviewed raw 中恢复后，与当前 pin 的上游正文一致；136 个 extension 的程序正文与 raw 正文一致。
- 136 个现有 package 仍为静态 `llm`，`knowledge_refs: []`，均绑定现有六字段 brief validator。两个变更程序没有引入知识文件或执行工具。
- 本轮忽略大小写扫描 `next-node|next-phase|agent-team|proceed to next`，命中 `plugin-education-agent-skills-checking-for-understanding-protocol-designer/SKILL.md:215`：`Proceed to next phase`。上下文是课堂 CFU 正确率决定下一教学阶段，属于教学建议，不是 ResearchSpec 节点控制；对应上游 Skill 未变。旧记录的大小写敏感扫描没有这项命中。
- 两个变更程序的本地 cognitive gate、assistance tag、策略目标仍属教育语义。formal Gate、Decision、run/node、handoff 与 advance 权限没有扩张。
- 对上游 MCP/runtime 的审阅由继承主模型的原生子代理完成，主线程核对了包消费路径、153+4 工具数量、13 个缓存 prompt 修复及依赖差异；未将上游服务安全加固视为 ResearchSpec 运行服务的授权。

## 结论

`declared-fit-with-notes`：候选中的两项教育程序更正适合进入受审转换，教育步骤、输入与证据输出保持，研究范围和反馈解释得到收窄。现有 29 项排除、三个领域、六字段 brief、validator 和流程权限应沿用。

该结论是增量内容审阅，不是新生产树的验收。当前生产包仍缺少上述候选更正；生成链路还需要修复逐 Skill 来源保真与固定旧 catalog 身份，并以新审计和预览重新绑定审批。故 `snapshot-6bbbce4` 的 production baseline 状态为 `not-created`。具体机器差异与旧生产保真证据见 `artifacts/incremental-audit.json`。
