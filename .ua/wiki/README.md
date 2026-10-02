
# researchspec 代码知识 wiki

ResearchSpec 是一个 Agent 中立的、spec 驱动的学术研究工作流框架层：用户用自然语言描述研究目标，Agent 通过能力（Procedure）发现与执行来交付成果，CLI 作为工作流状态的唯一写入入口。正式的 graph run 提供 Gates、Decisions、并行执行、修订轮次与可审计状态。

## 数据来源

本页及全部子页面均由知识图谱自动生成，是该图谱的人读投影。

图谱是唯一事实源：正文不复制既有设计文档与规格，只链接过去，避免出现第二事实源。

| 项 | 值 |
| --- | --- |
| 图谱版本 | 1.0.0 |
| 分析时间 | 2026-10-02T03:18:12.257Z |
| 代码提交 | `2d22c0da6ccf74ef2153a757873fa491daab2045` |
| 分析文件数 | 659 |
| 节点数 | 1917 |
| 关系边数 | 3863 |
| 分层数 | 10 |
| 导览步数 | 14 |
| 文件页数 | 659 |
| 目录页数 | 124 |
| 独立符号页数 | 117 |

## 三条阅读路径
- **第一次接触本项目**：[导览](tour.md) → [架构全景与层间依赖](architecture.md)
- **要改动某个子系统**：先在 [架构全景](architecture.md) 找到所属层，再沿该层的文件页与目录页进入。
- **要找某个具体符号**：[符号目录](catalog.md)，或直接在 `files/` 下按仓库目录结构定位。

## 分层一览

| 分层 | 文件数 | 定位 |
| --- | --- | --- |
| [宿主与投递适配层](layers/adapters.md) | 27 | 把文件契约投影到 24 个 class-A Agent 宿主与 commands/skills/both 三种投递模式，管理安装清单、区域哈希、Companion 包装，以及可选 zotero-library 文献适配器目录。 |
| [ARSU 转换与 Skill 生成层](layers/arsu-converter.md) | 178 | 把吸收进来的 ARSU 上游技能转换为 ResearchSpec 自有能力包：anchor 与 authoring 模板、workflow/revision/quarto 路由、运行时策略、manifest 产出与幂等性校验。 |
| [能力与插件目录层](layers/capability-registry.md) | 18 | 运行期派生的 Procedure/能力目录、核心能力注册与校验、图 profile 注册表，以及插件注册、装配、领域分类（213 学科域 + 5 工具域）与图状态检查。 |
| [CLI 命令入口层](layers/cli.md) | 12 | Commander 驱动的十六个顶层命令入口，负责参数解析、交互式选择、presenter 渲染与 handbook 渲染，并向核心层派发唯一的写事务。 |
| [核心契约与工作流运行时](layers/core.md) | 27 | ResearchSpec 的规格事实源：workspace/graph/run 契约定义、Zod 解析校验、写入计划与路径边界、批注溯源等纯运行时逻辑，CLI 与转换器都只经由此层改变工作流状态。 |
| [文档与文档站层](layers/documentation.md) | 96 | 面向用户与维护者的规范文档（docs/user、developer、maintainer）、仓库根部说明与变更记录，以及 Docusaurus 3.7 文档站和 zh-Hans 国际化副本。 |
| [评审批注与静态工作台层](layers/review-workspace.md) | 27 | 可选的交互式稿件评审工作台：冻结文档准备、静态 HTML/工作台投影、revision-master 工作台与批注导入的来源解释、差异与会话管理，全程只读。 |
| [测试与验收夹具层](layers/tests.md) | 94 | vitest 验收与单元测试、公共测试助手（CLI 驱动、图工作区、vendor 审计），以及 pandoc 与 vendor 准入用的静态夹具数据。 |
| [维护工具链与工程基础设施](layers/tooling.md) | 70 | 维护者专用的一次性生成器与 vendor 维护 CLI、dogfood 宿主演练 harness 与预览服务器、TypeScript/ESLint/pnpm 构建配置、GitHub Actions 流水线与许可证基线。 |
| [厂商 Skill 转换与审计层](layers/vendor-converters.md) | 340 | 各 vendor 上游的准入审计与确定性生成器（ToolUniverse、Scientific Agent Skills、Materials Science、FinRobot、HistAgent、Education Agent Skills），含审核决策、hash 绑定知识引用与插件扩展包投影。 |
