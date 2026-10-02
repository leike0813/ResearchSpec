
# 仓库根目录
> 目录聚合页：12 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [.gitmodules](../files/.gitmodules.md) | 配置 | 0 | 登记八个 vendor Git submodule（ARS、ToolUniverse、Scientific Agent Skills、Materials、FinRobot、HistAgent、Education Agent Skills、Zotero bundle）及其上游 URL 与分支。 |
| [AGENTS.md](../files/AGENTS.md.md) | 文档 | 0 | 维护者与 Agent 的顶层契约文档：定义项目使命、产品方向、canonical 用户使用模型、ARSU 关系、contract 架构方向与设计原则，以及每个 vendor 转换器的 pin、审计锚点与禁止事项。被截断前已覆盖 ARS/ARSU、ToolUniverse、Scientific Agent Skills、Materials、FinRobot、HistAgent、Education Agent Skills 等全部域资产。 |
| [CHANGELOG.md](../files/CHANGELOG.md.md) | 文档 | 0 | 简短的版本记录：Unreleased 段说明使用规格改为围绕自然研究任务与可用交付物，0.1.0 记录 schema 0.2 workspace、15 命令 CLI、控制面能力与发布矩阵，并标注发布尚未授权。 |
| [eslint.config.js](../files/eslint.config.js.md) | 配置 | 0 | ESLint 扁平配置，对 src/tests/harness 下的 TypeScript 启用 strictTypeChecked 与 projectService 类型感知规则，并排除 dist、vendor、references 与两个 legacy 测试文件。 |
| [NOTICE](../files/NOTICE.md) | 文档 | 0 | 归属与许可声明文件，逐项列出 ARS（CC BY-NC 4.0）、Zotero Adapter（AGPL-3.0）、ANZSRC 分类名称与各 vendor Skill 的来源、release-set、revision 和许可。 |
| [package.json](../files/package.json.md) | 配置 | 0 | npm 包清单：声明 ESM 包、researchspec bin 入口、两个子路径导出（annotation-intake、review-workspace）、发布文件白名单（dist、skills、LICENSES、docs 等）以及约 90 条脚本，覆盖 build/test/lint、ARSU 与各 vendor 转换器的 convert/check/idempotence 及 maintenance 锚点命令。 |
| [README.md](../files/README.md.md) | 文档 | 0 | 项目对外说明：解释要解决的平台锁定、状态碎片化与人工决策不可追溯三个问题，介绍 OpenSpec 灵感、Zotero Adapter、已吸纳的各上游 Skills 数量、环境与安装方式、16 个顶层命令的运行时协议、隐私安全边界以及混合许可模型。 |
| [SECURITY.md](../files/SECURITY.md.md) | 文档 | 0 | 安全策略：只支持最新 0.1.x 与 Node 22/24，说明漏洞报告渠道尚未建立这一未签署的管理项，并列出本地文件控制面、外部模型提供方、Skills 安装范围与 context pack 内容四类信任边界。 |
| [tsconfig.build.json](../files/tsconfig.build.json.md) | 配置 | 0 | 发布构建配置：在基础配置上开启 emit，输出到 dist 并生成 .d.ts 声明，只编译 src 以保持发布包干净。 |
| [tsconfig.harness.json](../files/tsconfig.harness.json.md) | 配置 | 0 | 维护者 dogfood harness 的编译配置：编译 src 与 harness 到 .harness-dist，排除 tests，让 harness 可独立启动本地预览与验收。 |
| [tsconfig.json](../files/tsconfig.json.md) | 配置 | 0 | TypeScript 基础配置：ES2022 + NodeNext 模块与解析、strict 全开、skipLibCheck 关闭、noEmit 仅做类型检查，覆盖 src、tests 与 harness。 |
| [tsconfig.test.json](../files/tsconfig.test.json.md) | 配置 | 0 | 测试编译配置：把 src、tests、harness 一并编译到 .test-dist，关闭声明与 sourcemap 以缩短测试启动时间。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [LICENSES](LICENSES.md) | 5 |
| [src/cli](src/cli.md) | 4 |
| [scripts](scripts.md) | 2 |
| [harness](harness.md) | 1 |
| [src/arsu-converter](src/arsu-converter.md) | 1 |
| [tests](tests.md) | 1 |
