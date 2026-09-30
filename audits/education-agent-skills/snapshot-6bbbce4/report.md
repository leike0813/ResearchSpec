# Education Agent Skills 审计 — snapshot-6bbbce4

## 来源绑定

- 官方远程仓库：`https://github.com/GarethManning/education-agent-skills`
- 未标记提交：`6bbbce418f82e11044009c9f3b7373a354de5bd0`
- Git 树：`b90188569a783ba7d20dcffe2db7a55816db7c0b`
- 已跟踪条目集 SHA-256：`d7596855e4a05c8ca396d96cfe6eeaa1bdcaa0a8a40eafe85c5c5a2bf9aee9f8`
- 已跟踪文件：241
- 来源字节数：6598445
- Skills：165 个，分布在 20 个上游域

本审计仅限维护者使用，不构成生产准入。未执行上游代码、安装依赖、配置凭据、启动 MCP 服务器或联系上游服务。过时的上游 `AUDIT.md` 和 README 统计数据仅为观察结果；以下所有总计均派生自 `skill-audit.json`。

## 仓库清单

| 分类 | 文件数 |
|---|---:|
| skill-content | 165 |
| license-provenance | 2 |
| project-doc | 17 |
| installer | 10 |
| mcp-runtime | 21 |
| maintenance | 12 |
| test | 6 |
| generated | 2 |
| showcase | 6 |

## 证据审查

固定的 Skills 声明了 872 个命名证据出现（737 个不同的引用字符串）。每个出现都有明确的存证、作者/年份/标题、支持范围和误归因结论。固定的仓库未提供独立的书目标识符或来源包来验证这些声明，因此未解决的声明仍是阻止项，上游评级不会被提升为 ResearchSpec 结论。常规审计检查处于离线状态。

| ResearchSpec 证据强度 | 声明数 |
|---|---:|
| verified | 0 |
| partial | 216 |
| unverified | 656 |
| conflicting | 0 |

## 许可证与来源

根目录新增了署名 Gareth Manning 的 CC BY-SA 4.0 通知，作者自有的 Skill 内容由此获得许可补强；通知未覆盖嵌入的原创框架主张与单独署名的第三方贡献，其再分发授权仍未确立。树内 `mcp-server/LICENSE` 只作用于该子树。Git 历史和声明的贡献者按 Skill 保留，每个 Skill 级的许可证结论区分根通知覆盖的作者自有内容与范围未确立的其余内容。分发还须满足署名、相同方式共享和修改披露义务，并由单独的审阅吸纳决定接受。

| 许可证状态 | Skills 数 |
|---|---:|
| clear | 0 |
| conditional | 136 |
| unresolved | 29 |

## 关系与重叠

所有 813 个 `chains_well_with` 声明均被保留。17 个缺失、模糊或重复。已解析的关系仅为前瞻性建议链接；不创建硬依赖。每个 Skill 都包含对 ARSU 和五个现有供应商的明确重叠结论。

## 敏感内容审查

| 风险 | 存在风险的 Skills 数 |
|---|---:|
| minors（未成年人） | 164 |
| privacy（隐私） | 24 |
| learning-analytics（学习分析） | 16 |
| wellbeing（福祉） | 70 |
| diagnosis（诊断） | 1 |
| original-framework（原创框架） | 19 |

面向学生的实时辅导、学习者分析、福祉或动机诊断以及原创框架内容仍被阻止，以待后续人工审查。面向教师的内容仍可能间接影响未成年人，因此审计记录该暴露，而非假设仅限成人使用。

## 前瞻性 ANZSRC Group 证据

审计记录了 3 个手动推理的前瞻性 Groups：`3901 curriculum-and-pedagogy`、`3903 education-systems`、`3904 specialist-studies-in-education`。这些仅为审计证据，不创建域成员资格。上游域、标签或 Fields 不是自动分类权威。

## 非生产引入建议

| 处置 | Skills 数 |
|---|---:|
| candidate（候选） | 0 |
| defer（推迟） | 0 |
| exclude（排除） | 165 |

根许可证通知只覆盖作者自有的 Skill 内容，原创框架主张与第三方署名内容的再分发授权仍未确立，署名、相同方式共享和修改披露义务也尚未被审阅吸纳决定接受，因此已完成的审计不包含任何候选。内容适配分析仍按 Skill 保留：面向教师的学习科学、课程与评估、读写与批判性思维、课程对齐和专业学习是未来的候选重点，而学生辅导、分析、福祉/诊断、原创框架和不完整证据在应用许可证阻止项之前默认推迟。

## 未来引入边界

单独的 `ingest-education-agent-skills` 变更必须消费此不可变审计。它可以生成 `education-agent-skills-<upstream-name>` ID，合并两个前置元数据部分，并默认保留已批准的内容。每个已准出的输出都需要已审查的 CC BY-SA 4.0 许可证文本、Skill 本地的 `NOTICE.md` 和来源绑定。MCP 运行时、安装程序、编排器、测试、展示和维护表面被排除。任何内容适配和每个 ANZSRC Group 成员资格都需要单独的来源哈希绑定批准。

## 发现

- **阻止 许可证范围未确立：** 根目录新增署名 Gareth Manning 的 CC BY-SA 4.0 通知，为作者自有的 Skill 内容提供许可依据；该通知不覆盖嵌入的原创框架主张或单独署名的第三方内容，署名、相同方式共享和修改披露义务也尚未被审阅吸纳决定接受。
- **阻止 证据未独立验证：** 所有 872 个证据声明都保留了明确的身份和支持阻止项，因为固定的检出未提供独立的书目标识符或已审查的来源摘录。
- **审查 上游审计漂移：** 上游兼容性审计报告了 131 个 Skills，而固定的 Git 清单包含 165 个；其抽样结论是过时的观察，不是审计输入。
- **审查 关系目标漂移：** 17 个 chains_well_with 声明缺失、模糊或重复，并保持可见但不成为依赖。
- **审查 上游证据枚举异常：** 2 个 Skills 使用上游证据标签，超出文档化的枚举范围；任何上游标签都不被视为 ResearchSpec 结论。
- **审查 学生对话模式差异：** 13 个面向学习者的 Skills 省略了 output_schema，而是定义了需要单独敏感内容审查的对话/证据捕获行为。

阻止性发现：2 个。即使所有前瞻性内容都被阻止，审计完成仍然有效；它不注册供应商、生成包、修改生产域或添加公共 CLI 命令。
