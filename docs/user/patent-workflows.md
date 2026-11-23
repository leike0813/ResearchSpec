# 专利任务

直接告诉 Agent 要完成什么，例如“从这份技术报告挖掘发明点并准备交底书”“将交底书整理成中国
发明申请文件”“分析这批专利并生成权利要求对照表”。Navigate 会找到相应的 Procedure。
交底、申请、案卷和研究转专利首次使用时，Navigate 会预览「知识产权材料」工具域的安装并取得同意。
专利情报、专利情报辅助论文和审查意见答复可以直接使用。默认管辖区为中国，具体申请类型和交付要求在任务开始时确认。

也可以手动预览和安装。安装确认与正式流程的启动确认各自进行。

```sh
researchspec plugin install intellectual-property-materials --dry-run --yes
researchspec plugin install intellectual-property-materials --yes
researchspec plugin update intellectual-property-materials
```

升级后继续已有的交底、申请、案卷或研究转专利运行时，先安装该域，再通过 `status --json`
和原节点的 `instructions` 续跑。安装会采用已有的流程 ID 和版本。

中国专利申报材料使用上述工具域中的独立 Procedure `generation-chinese-patent-filing`。
它支持发明、实用新型、外观设计和 PCT 中国国家阶段。PCT 中文原稿正常进入时核对原文，
外文原稿则按已确认的中文译文准备技术分册。

`filing_source` 可传入一份主案卷，`application_bundle` 可直接接收现有申请成果的
`application-bundle.v1` 普通文件索引。两者同时提供时先确认审定主版本，并记录分歧。Procedure
生成适用的 DOCX、CNIPA XML ZIP、请求书填报资料、附件和同目录文件，并以必需的
`filing_verification` 核验记录列明当前版本、实际交付路径、已完成检查、差异和证据限制。

包内 `build_filing.py` 与 `docx_to_cnipa_zip.py` 是本地 CLI 转换入口，使用用户已有依赖的
Python 3.12。Markdown 读入使用 `markdown-it-py`，DOCX 使用 `lxml`，位图使用 Pillow，
XML 公式渲染需要 Matplotlib。缺少依赖时保留可用稿件并说明受影响的转换和恢复条件；安装依赖须
单独取得用户同意。ResearchSpec 的安装、更新、检查和打包不会执行这些脚本，也不会安装依赖。

网页核稿只在用户另行授权官方站点、当前案卷和具体材料后开始。域安装不包含浏览器授权。申请人
完成认证后，Agent 只准备和检查该范围内的草稿并停在草稿预览；正式提交、声明、签章和缴费由申请人
控制。以当前案卷当前版本的适用文书、草稿重开和整包预览证据判定“可提交”。

能力包随附由国知局下载的[官方五书模板](https://cponline.cnipa.gov.cn/GzfwYwblGlwhTMVC/GzfwYwblGlwhT/selectToolsById?weihuRid=157)，
保持原始字节并将 SHA-256 记录为
`e52e39abec20f433c635e0586109465371ba7f5c144a01845e5dd49d04844c21`。官方页面未声明
开源许可。其余表格和模板可从指令里的官方入口获取。外观图样使用的 `sRGB-v4.icc`
按 CC0-1.0 随包提供。

已有论文可直接作为技术材料进入交底。若论文是本案技术方案的主要来源，案卷会附逐特征来源表，
随交底、申请和修订记录原文位置、技术观察、权项限定与待确认问题。仅作背景引用的论文无需此表。

要比较一篇论文和一件专利，可直接说“比较这篇论文和这件专利的技术异同”。独立 Procedure
`analysis-paper-patent-comparison` 接受两份原件，交付含双边出处、各自独有项和日期的 Markdown
报告。需要按权项制作 Excel 对照表时，使用已有的权利要求对照表 Procedure。

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
母案提交前可根据交底材料规划分案范围。母案已提交时，需提供首次提交的说明书、权利要求书与
原附图（如有），以核对拟申请的特征组合。缺少原始材料时，先交付范围核对稿和补件清单。

交付物放在普通项目目录中，例如 `work/patents/case-a/`。JSON 索引列出文件角色、路径、元数据和
限制，包含技术材料、专利全文、Markdown、DOCX、Excel、图形或本地地图。它们不会替代 run/node
状态，也不自动修改稳定 specs。修改既有材料时保留版本，正式承诺继续走项目 change 生命周期。

以下命令用于发现和读取能力，不会开始正式工作：

```sh
researchspec list procedures --query "专利交底" --json
researchspec show procedure:generation-patent-disclosure --json
researchspec instructions procedure:generation-patent-disclosure --json
researchspec show procedure:generation-chinese-patent-filing --json
researchspec instructions procedure:generation-chinese-patent-filing --json
researchspec instructions profile:patent-docket --json
```

具体执行命令和资源按激活后的 Procedure 加载。文本文件可直接由 Agent 生成；Word、公式、
Excel、PDF 提取、浏览器制图及 CAD 使用用户已配置的相应解释器和工具。缺少依赖时保留文本与
证据草稿，并明确未完成的格式交付。ResearchSpec 不安装依赖或创建运行环境。

Obsidian 是可选交付：先选定 vault 和允许写入的文件，再投影阅读笔记、Canvas/Bases 与相关配置。
交互地图使用明确选择的本地语料；向量模型和 IPC 数据由用户提供，本地展示仅监听 loopback。
检索服务使用宿主 Agent 获准的浏览器或连接配置。发布包不含模型权重、IPC 数据、凭据或产品示例图片。
检索默认使用中国公布站。点名海外或指定局别并授权查询时，可通过 Google Patents 检索或按公开号
读取可得全文。服务限流和全文缺失会记录在交付中，已有本地 PDF 可继续解读。

专利公开文本、申请人主张和法律状态需要分别记录。将专利资料用于论文时保留其来源类别、日期和
证据限制，已有学术文献和综合材料不会因合并而丢失。草案完成不代表提交、授权或法律结论。
研究转专利先将研究报告、综合材料、学术证据分级和实际技术材料整理成案卷索引，再进入专利子图。
专利资料支持论文时，先在来源范围 Gate 确认学术与专利材料，再并行运行两个来源子图；
两者完成后才合并证据并进入写作。
