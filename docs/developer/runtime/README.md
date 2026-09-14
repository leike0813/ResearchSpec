# ResearchSpec 与 ARSU 核心运行模型

本文档组面向维护 ResearchSpec core、ARSU converter 和 Agent guidance 的开发者。当前模型只有
一套 runtime authority：stable specs、graph profiles、frozen runs、node instances、handoff 和 project
change。

## 阅读顺序

1. [核心运行模型](core_runtime_model.md)
2. [CLI 与运行时协议](runtime_protocols.md)
3. [Deep Research](deep_research_workflow.md)
4. [Academic Paper](academic_paper_workflow.md)
5. [Academic Paper Reviewer](academic_paper_reviewer_workflow.md)
6. [Academic Pipeline](academic_pipeline_workflow.md)

## 一句话模型

> ResearchSpec CLI 是确定性 control writer；宿主只常驻 Navigate，并按需加载 Procedure；
> standalone 返回普通文件，graph 模式按冻结图组织确认和状态；文件 owner 决定持久事实。

ARSU 内部 agent、phase、checkpoint 和 panel parallelism 是学术执行方法，不会自行改变
ResearchSpec frontier。图源位于 `diagrams/src/`，同名 SVG 位于 `diagrams/rendered/`；图是解释，
不是运行权威。
