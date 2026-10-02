
# scripts
> 目录聚合页：31 个文件、146 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [scripts/arsu-maintenance.mjs](../files/scripts/arsu-maintenance.mjs.md) | 文件 | 14 | ARS/ARSU 能力维护 CLI：按 anchors baseline/records/artifacts/check/diff 固化上游 submodule 修订、抽取索引统计、能力 registry 与 parity 覆盖率，并在语义审阅完成后写出锚点 manifest。 |
| [scripts/audit-capability-parity.mjs](../files/scripts/audit-capability-parity.mjs.md) | 文件 | 3 | 能力包与上游抽取产物的对齐审计：按 provenance 选择 extraction-index，解析上游标题与规则，判定哪些规则在能力包文档中有覆盖并写出对齐报告。 |
| [scripts/authored-whitespace-exemptions.json](../files/scripts/authored-whitespace-exemptions.json.md) | 配置 | 0 | 行尾空白检查的豁免目录，为每个字节保持不变的上游资产记录 sha256 与其在 authoring 抽取索引中的 artifact_id 证据。 |
| [scripts/check-authored-whitespace.mjs](../files/scripts/check-authored-whitespace.mjs.md) | 文件 | 4 | 行尾空白守卫：默认取 git 变更路径，加载并校验豁免目录的 sha256，跳过二进制与生成的保留 Skill，对 UTF-8 文本逐行报告尾随空白。 |
| [scripts/clean-output.mjs](../files/scripts/clean-output.mjs.md) | 文件 | 0 | 构建产物清理脚本，只接受 dist 与 .test-dist 两个顶层目录名，拒绝任何其他路径后递归删除。 |
| [scripts/dogfood.mjs](../files/scripts/dogfood.mjs.md) | 文件 | 10 | 维护者 dogfooding campaign 的协调器 CLI：按 plan/run/resume/retry/assess/serve/import-review/report/legacy-import 分发子命令，负责冻结场景目录与构建哈希、预检 bwrap 与宿主二进制、经 Orca 终端派发行为与验收 worker、并维护 campaign 锁与并发队列。 |
| [scripts/education-agent-skills-maintenance.mjs](../files/scripts/education-agent-skills-maintenance.mjs.md) | 文件 | 9 | Education Agent Skills 扩展维护 CLI：锁定 snapshot-6bbbce4 修订与提交，核对 136 个 llm 类型 extension 的 registry 哈希、清单一致性与统一的六项 brief 字段。 |
| [scripts/education-agent-skills-validator-template.py](../files/scripts/education-agent-skills-validator-template.py.md) | 文件 | 1 | Education Agent Skills 插件能力的研究简报校验器模板：解析命令行给出的 JSON 输出，校验存在 research_brief 并含六个通用证据字段。 |
| [scripts/finrobot-maintenance.mjs](../files/scripts/finrobot-maintenance.mjs.md) | 文件 | 11 | FinRobot 扩展维护 CLI：锁定 snapshot-2717499 修订，核对 1048 个跟踪条目之上的六个 financial-research extension、四个 mixed 能力复制的入口脚本与证据验证器。 |
| [scripts/generate-arsu-capability-review-html.mjs](../files/scripts/generate-arsu-capability-review-html.mjs.md) | 文件 | 3 | ARSU 模式能力审阅 HTML 生成器：枚举 vendor/ars 的 SKILL、agent、reference、template 文档与转换后的能力包，按 mode 生成可折叠审阅页面。 |
| [scripts/generate-arsu-gap-semantic-review-html.mjs](../files/scripts/generate-arsu-gap-semantic-review-html.mjs.md) | 文件 | 0 | 把锚点目录下的 05-semantic-review.md 渲染为独立 HTML；源文件缺失时输出明确的 [NOT-COMPLETED] 占位页。 |
| [scripts/generate-arsu-graph-match-assessment-html.mjs](../files/scripts/generate-arsu-graph-match-assessment-html.mjs.md) | 文件 | 2 | graph 匹配评估页生成器：把上游 mode 文档锚点与 ResearchSpec graph 能力逐段对照，输出每个 mode 的匹配度、上下文片段与可选文档判定。 |
| [scripts/generate-cli-handbook.mjs](../files/scripts/generate-cli-handbook.mjs.md) | 文件 | 0 | 调用编译产物的 renderCliHandbook 生成或校验 docs/user/cli-handbook.md，--check 模式下逐字节比对以防文档漂移。 |
| [scripts/generate-docs.mjs](../files/scripts/generate-docs.mjs.md) | 文件 | 0 | 文档生成入口：先断言 CLI 恰好暴露 16 个顶层命令，再从类型化目录渲染 CLI 手册、Agent 入口矩阵、website 命令页与侧边栏，支持 --check 只校验。 |
| [scripts/generate-education-agent-skills-extensions.mjs](../files/scripts/generate-education-agent-skills-extensions.mjs.md) | 文件 | 6 | 把已审阅的 Education Agent Skills 逐一投影为 plugin-education-* 扩展包：复制 SKILL.md 与资源为 SHA-256 knowledge ref，按域目录派生归属并更新 registry 与审计 catalog。 |
| [scripts/generate-extraction-index.mjs](../files/scripts/generate-extraction-index.mjs.md) | 文件 | 5 | 从 authoring/ars 的里程碑审阅笔记与 vendor/ars 上游文件生成 extraction-index.json，逐制品记录 id、来源路径与 SHA-256，并支持 --check 只校验。 |
| [scripts/generate-scientific-agent-skills-extensions.mjs](../files/scripts/generate-scientific-agent-skills-extensions.mjs.md) | 文件 | 6 | 把已审阅的 Scientific Agent Skills 投影为 plugin-scientific-agent-skills-* 扩展能力：保持 SKILL.md 正文不变，复制审阅资源为字节级 knowledge ref，绑定校验器并写 registry 与 catalog。 |
| [scripts/generate-tooluniverse-extensions.mjs](../files/scripts/generate-tooluniverse-extensions.mjs.md) | 文件 | 6 | ToolUniverse 扩展生成器：按审计 catalog 逐个生成 plugin-tooluniverse-* 能力与 profile，复制非标准资源为 knowledge ref、按 execution_type 绑定校验器，并更新扩展 registry。 |
| [scripts/histagent-maintenance.mjs](../files/scripts/histagent-maintenance.mjs.md) | 文件 | 9 | HistAgent 扩展维护 CLI：锁定 snapshot-47bbe21 修订，核对三个自包含 executable Skill 的 bundle 树哈希、extension package、脚本副本与领域分配。 |
| [scripts/install-stable.mjs](../files/scripts/install-stable.mjs.md) | 文件 | 2 | 把当前仓库打成 tarball 并全局安装，用于验证发行版行为：先 pnpm build，再 npm pack、强制移除旧全局包、安装新包，卸载旧全局失败只告警。 |
| [scripts/mark-cli-executable.mjs](../files/scripts/mark-cli-executable.mjs.md) | 文件 | 0 | 构建收尾脚本，把 dist/src/cli/bin.js 权限置为 0755，保证 npm 分发的 CLI 可直接执行。 |
| [scripts/materials-science-skills-for-llm-maintenance.mjs](../files/scripts/materials-science-skills-for-llm-maintenance.mjs.md) | 文件 | 9 | Materials Science 扩展维护 CLI：锁定 snapshot-fafd3ab 上游修订，核对 7 个 curated Skill 的 bundle 与 extension package、evidence 验证器绑定以及领域归属。 |
| [scripts/own-vendor-maintenance.mjs](../files/scripts/own-vendor-maintenance.mjs.md) | 文件 | 12 | 自有 vendor 维护 CLI：以 audits/own-vendors/catalog.json 为 SSOT 提供 records/baseline/check/diff/artifacts 子命令，核对上游清单、能力包树哈希与 parity 报告，产出维护记录与基线。 |
| [scripts/run-skill-harness.mjs](../files/scripts/run-skill-harness.mjs.md) | 文件 | 0 | 先用 tsc 编译 harness 源码到 .harness-dist，再按参数启动只读本地服务，或在 --review-workspace 模式下生成审阅工作台预览页并可选打开浏览器。 |
| [scripts/run-tests.mjs](../files/scripts/run-tests.mjs.md) | 文件 | 1 | 递归收集 .test-dist/tests 下编译产物中的 *.test.js，交由 node --test 执行，并设置 PYTHONDONTWRITEBYTECODE 避免写出字节码。 |
| [scripts/scientific-agent-skills-maintenance.mjs](../files/scripts/scientific-agent-skills-maintenance.mjs.md) | 文件 | 9 | Scientific Agent Skills 扩展维护 CLI：按 v2.70.0 锚点盘点上游与 vendor bundle，校验每个 extension package 的 manifest 哈希、执行类型、验证器与 knowledge refs，并重算 registry 子集、package 树与 profile 树哈希。 |
| [scripts/scientific-agent-skills-validator-template.py](../files/scripts/scientific-agent-skills-validator-template.py.md) | 文件 | 1 | Scientific Agent Skills 扩展能力的研究简报校验器模板：读取提交的 JSON 输出，确认 research_brief 存在并包含六个通用证据字段。 |
| [scripts/tooluniverse-maintenance.mjs](../files/scripts/tooluniverse-maintenance.mjs.md) | 文件 | 9 | ToolUniverse 扩展维护 CLI：校验 vendor/tooluniverse 处于目录锁定 revision 且干净，盘点 130 个 reviewed vendor-bundle Skills，并逐能力核对 registry 清单、package 树哈希、验证器必需字段与工具文件字节一致。 |
| [scripts/tooluniverse-validator-template.py](../files/scripts/tooluniverse-validator-template.py.md) | 文件 | 1 | ToolUniverse 扩展能力的研究简报校验器模板，校验绝对输出路径中的 research_brief JSON 是否具备 scope、source_ledger 等六项证据字段。 |
| [scripts/verify-arsu-checkers.mjs](../files/scripts/verify-arsu-checkers.mjs.md) | 文件 | 0 | 在不安装依赖的前提下打包当前 CLI，在临时项目中用 symlink 复用 node_modules 与用户 Python 环境，构造语料后以 --json 逐条验证打包内的 ARSU checker 行为。 |
| [scripts/verify-package.mjs](../files/scripts/verify-package.mjs.md) | 文件 | 13 | 发行包端到端验证脚本：核对 tarball 文件面、已安装 ARSU 规约与文档摘要、运行时图表源与渲染产物、平台对应二进制，并跑通 minimal 与 academic-pipeline 两条完整旅程。 |

## 子目录
- [dogfood](scripts/dogfood.md)、[lib](scripts/lib.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [scripts/lib](scripts/lib.md) | 13 |
| [docs/developer/runtime/diagrams/src](docs/developer/runtime/diagrams/src.md) | 11 |
| [scripts/dogfood](scripts/dogfood.md) | 6 |
| [src/cli](src/cli.md) | 5 |
| [src/plugins](src/plugins.md) | 3 |
| [harness](harness.md) | 1 |
| [src/adapters](src/adapters.md) | 1 |
