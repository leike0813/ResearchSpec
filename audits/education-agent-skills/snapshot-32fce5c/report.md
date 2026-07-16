# Education Agent Skills 审计 — snapshot-32fce5c

## 来源绑定

- 官方远程仓库：`https://github.com/GarethManning/education-agent-skills`
- 未标记提交：`32fce5c0d097ec675cf81c750a65a379e4d87e3c`
- Git 树：`3223d79299ae10391c22549debef7ffc9ef7a0e2`
- 已跟踪条目集 SHA-256：`bbceef6fceddd22f21aeceb49fd6767e8a2fc068a45190ab3272cb1f5c47b1f7`
- 已跟踪文件：238
- 来源字节数：6454335
- Skills：165 个，分布在 20 个上游域

本审计仅限维护者使用，不构成生产准入。未执行上游代码、安装依赖、配置凭据、启动 MCP 服务器或联系上游服务。过时的上游 `AUDIT.md` 和 README 统计数据仅为观察结果；以下所有总计均派生自 `skill-audit.json`。

## 仓库清单

| 分类 | 文件数 |
|---|---:|
| skill-content | 165 |
| license-provenance | 1 |
| project-doc | 17 |
| installer | 10 |
| mcp-runtime | 20 |
| maintenance | 12 |
| test | 5 |
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

仓库在 README 和插件元数据中声称 CC BY-SA 4.0，但固定的根目录不包含许可证文本。唯一已跟踪的 `LICENSE` 仅作用于 `mcp-server/`。因此，根声明无法为任何 Skill 或嵌入的命名框架清除再分发权限。Git 历史和声明的贡献者按 Skill 保留，但每个 Skill 级的许可证结论仍保持明确。

| 许可证状态 | Skills 数 |
|---|---:|
| clear | 0 |
| conditional | 0 |
| unresolved | 165 |

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

缺失的根许可证文本阻止了整个固定快照的生产许可，因此已完成的审计可以合理地不包含任何候选。内容适配分析仍按 Skill 保留：面向教师的学习科学、课程与评估、读写与批判性思维、课程对齐和专业学习是未来的候选重点，而学生辅导、分析、福祉/诊断、原创框架和不完整证据在应用许可证阻止项之前默认推迟。

## 未来引入边界

单独的 `ingest-education-agent-skills` 变更必须消费此不可变审计。它可以生成 `education-agent-skills-<upstream-name>` ID，合并两个前置元数据部分，并默认保留已批准的内容。每个已准出的输出都需要已审查的 CC BY-SA 4.0 许可证文本、Skill 本地的 `NOTICE.md` 和来源绑定。MCP 运行时、安装程序、编排器、测试、展示和维护表面被排除。任何内容适配和每个 ANZSRC Group 成员资格都需要单独的来源哈希绑定批准。

## 发现

- **阻止 根许可证缺失：** 固定的仓库没有根许可证文本；README/插件的 CC BY-SA 4.0 声明和 MCP 子树许可证无法建立 Skill 级的再分发权限。
- **阻止 证据未独立验证：** 所有 872 个证据声明都保留了明确的身份和支持阻止项，因为固定的检出未提供独立的书目标识符或已审查的来源摘录。
- **审查 上游审计漂移：** 上游兼容性审计报告了 131 个 Skills，而固定的 Git 清单包含 165 个；其抽样结论是过时的观察，不是审计输入。
- **审查 关系目标漂移：** 17 个 chains_well_with 声明缺失、模糊或重复，并保持可见但不成为依赖。
- **审查 上游证据枚举异常：** 2 个 Skills 使用上游证据标签，超出文档化的枚举范围；任何上游标签都不被视为 ResearchSpec 结论。
- **审查 学生对话模式差异：** 13 个面向学习者的 Skills 省略了 output_schema，而是定义了需要单独敏感内容审查的对话/证据捕获行为。

阻止性发现：2 个。即使所有前瞻性内容都被阻止，审计完成仍然有效；它不注册供应商、生成包、修改生产域或添加公共 CLI 命令。
