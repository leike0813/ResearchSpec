
# docs/developer/runtime
> 目录聚合页：7 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [docs/developer/runtime/academic_paper_reviewer_workflow.md](../../../files/docs/developer/runtime/academic_paper_reviewer_workflow.md.md) | 文档 | 0 | academic-paper-reviewer 路由说明：只读评审 handoff 引用的稿件，可产出 review report、editorial decision 与 revision roadmap，但内部 PASS 不等于 formal Gate pass，改稿必须另启 revision。 |
| [docs/developer/runtime/academic_paper_workflow.md](../../../files/docs/developer/runtime/academic_paper_workflow.md.md) | 文档 | 0 | academic-paper 路由说明：定义 writer/evaluator 分离只是语义纪律、Markdown 与 QMD 双源稿的 revision 保真要求、format-convert 的 no-execute Quarto 渲染链，以及 annotation intake 的分层存放。 |
| [docs/developer/runtime/academic_pipeline_workflow.md](../../../files/docs/developer/runtime/academic_pipeline_workflow.md.md) | 文档 | 0 | academic-pipeline 组合图的运行时说明：给出 research→write→review→revision/re-review 轮次→format→final-integrity 的图主干、subgraph 节点的 role binding、七种 mid-entry 入口、动态 revision round 实例化规则，以及 Quarto 只阻塞 format 节点的收尾语义。 |
| [docs/developer/runtime/core_runtime_model.md](../../../files/docs/developer/runtime/core_runtime_model.md.md) | 文档 | 0 | 核心运行模型：逐层说明文件 owner（stable specs、profiles、frozen runs、node instances、handoff、project change）、由扫描派生的只读视图、Agent 与 CLI 的能力分工，以及仓库 openspec 与用户 researchspec/changes 两层治理。 |
| [docs/developer/runtime/deep_research_workflow.md](../../../files/docs/developer/runtime/deep_research_workflow.md.md) | 文档 | 0 | deep-research 路由说明：13 个 agent 与六个 phase 属语义方法而非 CLI 状态机，route instructions 从 specs 与 handoff roles 解析前置，用户确认后创建 standalone run，改稿需经 project change。 |
| [docs/developer/runtime/README.md](../../../files/docs/developer/runtime/README.md.md) | 文档 | 0 | ResearchSpec 与 ARSU 核心运行模型文档组的入口，给出六篇必读顺序与一句话模型：CLI 是确定性 control writer、宿主只常驻 Navigate、文件 owner 决定持久事实。 |
| [docs/developer/runtime/runtime_protocols.md](../../../files/docs/developer/runtime/runtime_protocols.md.md) | 文档 | 0 | CLI 与运行时协议：展开 list→show→instructions 的只读发现链、standalone 与 graph 两种 packet 语义、Quarto 探测时机、boundary file 的 role/type/path 记录方式、Gate 与 change 生命周期，以及恢复与失败时的只读 doctor 边界。 |

## 子目录
- [diagrams/src](runtime/diagrams/src.md)
