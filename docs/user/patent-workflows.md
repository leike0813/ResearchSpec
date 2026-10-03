# 专利任务

直接告诉 Agent 要完成什么，例如“从这份技术报告挖掘发明点并准备交底书”“将交底书整理成中国
发明申请文件”“分析这批专利并生成权利要求对照表”。Navigate 会发现固定专利 Procedures；
初始化即可使用，无需安装领域插件。默认管辖区为中国，具体申请类型和交付要求在任务开始时确认。

普通检索、阅读、对照表、政策研究和单次文档制作可以独立执行。需要正式确认、分支、修订轮次或
论文与专利组合时，选择 graph 入口，确认前置条件、边界成果、Gates、Decisions 和成本后启动。

| Profile | 工作范围 |
| --- | --- |
| `patent-disclosure` | 材料梳理、发明挖掘、检索、现有技术分析、交底书及审阅 |
| `patent-application` | 从已有交底书生成权利要求、说明书、摘要、附图及审阅 |
| `patent-docket` | 协调单案交底与申请，可确认保护布局，执行有界修订和正式确认 |
| `patent-intelligence` | 检索、阅读与分析，可选择对照表、交互地图、政策简报或它们的组合 |
| `patent-oa` | 根据审查意见与申请材料编写、核查答复 |
| `research-to-patent` | 学术研究成果进入专利交底与申请流程 |
| `patent-informed-paper` | 专利情报与学术研究汇合，带来源类型和证据限制进入论文写作 |

Docket 默认预算为三轮。继续或结束由每轮的人类 Decision 决定；Agent 在预算用尽时说明未解决
问题和新增成本。检查报告只提供证据，每个正式 Gate 仍须用户确认。
继续下一轮后，Navigate 通过 CLI handoff 选择上一轮已接受的交底和申请版本，再读取当前节点指令。
原始版本和各轮输出均保留。选择保护布局时，布局方案须通过人工 Gate 后才进入申请子图。
布局在交底成稿后提供 1+N 保护建议；本次 docket 处理一个明确案卷。
新增分案逐一确认其材料与边界后启动对应任务，Agent 不自行创建批量子运行。

交付物放在普通项目目录中，例如 `work/patents/case-a/`。JSON 索引列出文件角色、路径、元数据和
限制，包含技术材料、专利全文、Markdown、DOCX、Excel、图形或本地地图。它们不会替代 run/node
状态，也不自动修改稳定 specs。修改既有材料时保留版本，正式承诺继续走项目 change 生命周期。

以下命令用于发现和读取能力，不会开始正式工作：

```sh
researchspec list procedures --query "专利交底" --json
researchspec show procedure:generation-patent-disclosure --json
researchspec instructions procedure:generation-patent-disclosure --json
researchspec instructions profile:patent-docket --json
```

具体执行命令和资源按激活后的 Procedure 加载。文本文件可直接由 Agent 生成；Word、公式、
Excel、PDF 提取、浏览器制图及 CAD 使用用户已配置的相应解释器和工具。缺少依赖时保留文本与
证据草稿，并明确未完成的格式交付。ResearchSpec 不安装依赖或创建运行环境。

Obsidian 是可选交付：先选定 vault 和允许写入的文件，再投影阅读笔记、Canvas/Bases 与相关配置。
交互地图使用明确选择的本地语料；向量模型和 IPC 数据由用户提供，本地展示仅监听 loopback。
检索服务使用宿主 Agent 获准的浏览器或连接配置。发布包不含模型权重、IPC 数据、凭据或产品示例图片。

专利公开文本、申请人主张和法律状态需要分别记录。将专利资料用于论文时保留其来源类别、日期和
证据限制，已有学术文献和综合材料不会因合并而丢失。草案完成不代表提交、授权或法律结论。
研究转专利先将研究报告、综合材料、学术证据分级和实际技术材料整理成案卷索引，再进入专利子图。
专利资料支持论文时，先在来源范围 Gate 确认学术与专利材料，再并行运行两个来源子图；
两者完成后才合并证据并进入写作。
