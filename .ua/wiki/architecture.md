
# 架构全景

researchspec 被划分为 10 个分层。分层由知识图谱给出，是理解模块边界的起点。

## 分层清单

图谱把文件级节点归入分层；函数与类归属到所在文件，不重复计入分层。

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

## 层间依赖

方向为「源分层 → 目标分层」，只统计跨层的依赖类关系，不含归属类关系。

| 源分层 | 目标分层 | 边数 | 关系类型 |
| --- | --- | --- | --- |
| [测试与验收夹具层](layers/tests.md) | [厂商 Skill 转换与审计层](layers/vendor-converters.md) | 56 | imports×56 |
| [测试与验收夹具层](layers/tests.md) | [能力与插件目录层](layers/capability-registry.md) | 48 | imports×48 |
| [测试与验收夹具层](layers/tests.md) | [ARSU 转换与 Skill 生成层](layers/arsu-converter.md) | 45 | imports×45 |
| [测试与验收夹具层](layers/tests.md) | [核心契约与工作流运行时](layers/core.md) | 42 | imports×42 |
| [能力与插件目录层](layers/capability-registry.md) | [核心契约与工作流运行时](layers/core.md) | 25 | imports×25 |
| [宿主与投递适配层](layers/adapters.md) | [核心契约与工作流运行时](layers/core.md) | 20 | imports×20 |
| [CLI 命令入口层](layers/cli.md) | [核心契约与工作流运行时](layers/core.md) | 20 | imports×20 |
| [测试与验收夹具层](layers/tests.md) | [宿主与投递适配层](layers/adapters.md) | 20 | imports×20 |
| [厂商 Skill 转换与审计层](layers/vendor-converters.md) | [核心契约与工作流运行时](layers/core.md) | 18 | imports×18 |
| [厂商 Skill 转换与审计层](layers/vendor-converters.md) | [能力与插件目录层](layers/capability-registry.md) | 13 | imports×13 |
| [CLI 命令入口层](layers/cli.md) | [能力与插件目录层](layers/capability-registry.md) | 12 | imports×12 |
| [ARSU 转换与 Skill 生成层](layers/arsu-converter.md) | [核心契约与工作流运行时](layers/core.md) | 11 | imports×11 |
| [维护工具链与工程基础设施](layers/tooling.md) | [文档与文档站层](layers/documentation.md) | 11 | depends_on×11 |
| [维护工具链与工程基础设施](layers/tooling.md) | [CLI 命令入口层](layers/cli.md) | 9 | depends_on×5、configures×4 |
| [测试与验收夹具层](layers/tests.md) | [CLI 命令入口层](layers/cli.md) | 8 | imports×8 |
| [测试与验收夹具层](layers/tests.md) | [维护工具链与工程基础设施](layers/tooling.md) | 8 | imports×8 |
| [能力与插件目录层](layers/capability-registry.md) | [宿主与投递适配层](layers/adapters.md) | 7 | imports×7 |
| [CLI 命令入口层](layers/cli.md) | [宿主与投递适配层](layers/adapters.md) | 6 | imports×6 |
| [评审批注与静态工作台层](layers/review-workspace.md) | [核心契约与工作流运行时](layers/core.md) | 6 | imports×6 |
| [维护工具链与工程基础设施](layers/tooling.md) | [能力与插件目录层](layers/capability-registry.md) | 6 | depends_on×3、imports×3 |
| [ARSU 转换与 Skill 生成层](layers/arsu-converter.md) | [能力与插件目录层](layers/capability-registry.md) | 5 | imports×5 |
| [维护工具链与工程基础设施](layers/tooling.md) | [核心契约与工作流运行时](layers/core.md) | 5 | imports×5 |
| [宿主与投递适配层](layers/adapters.md) | [能力与插件目录层](layers/capability-registry.md) | 4 | imports×4 |
| [CLI 命令入口层](layers/cli.md) | [ARSU 转换与 Skill 生成层](layers/arsu-converter.md) | 3 | imports×3 |
| [测试与验收夹具层](layers/tests.md) | [评审批注与静态工作台层](layers/review-workspace.md) | 3 | imports×3 |
| [维护工具链与工程基础设施](layers/tooling.md) | [宿主与投递适配层](layers/adapters.md) | 3 | imports×2、depends_on×1 |
| [宿主与投递适配层](layers/adapters.md) | [CLI 命令入口层](layers/cli.md) | 2 | imports×2 |
| [能力与插件目录层](layers/capability-registry.md) | [ARSU 转换与 Skill 生成层](layers/arsu-converter.md) | 2 | imports×2 |
| [核心契约与工作流运行时](layers/core.md) | [宿主与投递适配层](layers/adapters.md) | 2 | imports×2 |
| [核心契约与工作流运行时](layers/core.md) | [能力与插件目录层](layers/capability-registry.md) | 2 | imports×2 |
| [评审批注与静态工作台层](layers/review-workspace.md) | [ARSU 转换与 Skill 生成层](layers/arsu-converter.md) | 2 | imports×2 |
| [维护工具链与工程基础设施](layers/tooling.md) | [ARSU 转换与 Skill 生成层](layers/arsu-converter.md) | 2 | configures×1、imports×1 |
| [宿主与投递适配层](layers/adapters.md) | [ARSU 转换与 Skill 生成层](layers/arsu-converter.md) | 1 | imports×1 |
| [ARSU 转换与 Skill 生成层](layers/arsu-converter.md) | [宿主与投递适配层](layers/adapters.md) | 1 | imports×1 |
| [能力与插件目录层](layers/capability-registry.md) | [评审批注与静态工作台层](layers/review-workspace.md) | 1 | imports×1 |
| [CLI 命令入口层](layers/cli.md) | [评审批注与静态工作台层](layers/review-workspace.md) | 1 | imports×1 |
| [核心契约与工作流运行时](layers/core.md) | [ARSU 转换与 Skill 生成层](layers/arsu-converter.md) | 1 | imports×1 |
| [维护工具链与工程基础设施](layers/tooling.md) | [测试与验收夹具层](layers/tests.md) | 1 | configures×1 |
| [厂商 Skill 转换与审计层](layers/vendor-converters.md) | [宿主与投递适配层](layers/adapters.md) | 1 | imports×1 |

## 双向依赖

[能力与插件目录层](layers/capability-registry.md) ↔ [核心契约与工作流运行时](layers/core.md)；[宿主与投递适配层](layers/adapters.md) ↔ [核心契约与工作流运行时](layers/core.md)；[ARSU 转换与 Skill 生成层](layers/arsu-converter.md) ↔ [核心契约与工作流运行时](layers/core.md)；[测试与验收夹具层](layers/tests.md) ↔ [维护工具链与工程基础设施](layers/tooling.md)；[ARSU 转换与 Skill 生成层](layers/arsu-converter.md) ↔ [能力与插件目录层](layers/capability-registry.md)；[宿主与投递适配层](layers/adapters.md) ↔ [能力与插件目录层](layers/capability-registry.md)；[宿主与投递适配层](layers/adapters.md) ↔ [CLI 命令入口层](layers/cli.md)；[宿主与投递适配层](layers/adapters.md) ↔ [ARSU 转换与 Skill 生成层](layers/arsu-converter.md)。改动这些分层时需要同时检查两侧。

## 关系类型口径

| 关系 | 含义 |
| --- | --- |
| imports | 文件之间的 import 关系 |
| calls | 符号之间的调用关系 |
| depends_on | 显式记录的依赖 |
| configures | 配置作用于目标 |
| defines_schema | 定义目标的结构约束 |
| implements | 实现目标声明的接口 |

归属类关系（`contains`、`exports`、`documents`）不计入层间依赖，它们只表示内容归属。
