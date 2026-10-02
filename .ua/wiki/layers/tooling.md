
# 维护工具链与工程基础设施

维护者专用的一次性生成器与 vendor 维护 CLI、dogfood 宿主演练 harness 与预览服务器、TypeScript/ESLint/pnpm 构建配置、GitHub Actions 流水线与许可证基线。
> 本页由知识图谱分层 `layer:tooling` 生成，共 70 个文件级节点。

## 目录分布

| 目录 | 文件数 |
| --- | --- |
| [scripts](../modules/scripts.md) | 31 |
| [scripts/dogfood](../modules/scripts/dogfood.md) | 8 |
| [.](../modules/index.md) | 7 |
| [harness](../modules/harness.md) | 6 |
| [LICENSES](../modules/LICENSES.md) | 5 |
| [harness/dogfood/public](../modules/harness/dogfood/public.md) | 4 |
| [harness/fixtures](../modules/harness/fixtures.md) | 3 |
| [harness/public](../modules/harness/public.md) | 3 |
| [.github/workflows](../modules/.github/workflows.md) | 2 |
| [scripts/lib](../modules/scripts/lib.md) | 1 |

## 关键符号

本层中被其他节点引用较多、值得单独成页的符号。

| 符号 | 类型 | 复杂度 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- |
| [createMaintenanceCommands](../symbols/scripts/lib/vendor-maintenance.mjs/createMaintenanceCommands.md) | 函数 | 复杂 | 6 | 为单个厂商组装 artifacts/records/baseline/check/diff 命令：baseline 强制语义审阅完成，check 逐字段比对锚点 manifest 与实时状态，diff 输出关键指纹变化。 |
| [sandboxCommand](../symbols/scripts/dogfood/hosts.mjs/sandboxCommand.md) | 函数 | 复杂 | 2 | 构造 bubblewrap 沙箱命令：tmpfs 覆盖家目录，仅暴露运行时、ResearchSpec 构建产物、宿主凭据与本次证据，并重写 HOME/PATH/XDG 环境。 |
| [resolveSelection](../symbols/scripts/dogfood/lib.mjs/resolveSelection.md) | 函数 | 复杂 | 1 | 把 CLI 参数、配置与场景目录解析为冻结选择：拒绝多宿主旧用法，校验行为宿主、适配器、模型、场景、验收人与各类并发/超时边界。 |
| [currentState](../symbols/scripts/education-agent-skills-maintenance.mjs/currentState.md) | 函数 | 复杂 | 1 | 汇总上游、vendor bundle、extension registry、审阅工件与维护文件指纹，构成锚点 manifest 的完整状态快照。 |
| [extensionRows](../symbols/scripts/education-agent-skills-maintenance.mjs/extensionRows.md) | 函数 | 复杂 | 1 | 逐条核对 extension package：registry 清单哈希、执行类型、文件树、脚本验证器存在性与 {outputs_json} 传参、必需 brief 字段绑定、工具文件字节一致，并校验领域 capability/profile 分配未漂移。 |
| [writeRecords](../symbols/scripts/education-agent-skills-maintenance.mjs/writeRecords.md) | 函数 | 复杂 | 1 | 渲染 01-analysis/02-ingestion/03-conversion/04-review 四份锚点记录，并在缺失时生成标记 NOT-COMPLETED 的语义审阅模板。 |
| [currentState](../symbols/scripts/finrobot-maintenance.mjs/currentState.md) | 函数 | 复杂 | 1 | 汇总上游、vendor bundle、extension registry、审阅工件与维护文件指纹，构成锚点 manifest 的完整状态快照。 |
| [extensionRows](../symbols/scripts/finrobot-maintenance.mjs/extensionRows.md) | 函数 | 复杂 | 1 | 逐条核对 extension package：registry 清单哈希、执行类型、文件树、脚本验证器存在性与 {outputs_json} 传参、必需 brief 字段绑定、工具文件字节一致，并校验领域 capability/profile 分配未漂移。 |
| [writeRecords](../symbols/scripts/finrobot-maintenance.mjs/writeRecords.md) | 函数 | 复杂 | 1 | 渲染 01-analysis/02-ingestion/03-conversion/04-review 四份锚点记录，并在缺失时生成标记 NOT-COMPLETED 的语义审阅模板。 |
| [currentState](../symbols/scripts/histagent-maintenance.mjs/currentState.md) | 函数 | 复杂 | 1 | 汇总上游、vendor bundle、extension registry、审阅工件与维护文件指纹，构成锚点 manifest 的完整状态快照。 |
| [extensionRows](../symbols/scripts/histagent-maintenance.mjs/extensionRows.md) | 函数 | 复杂 | 1 | 逐条核对 extension package：registry 清单哈希、执行类型、文件树、脚本验证器存在性与 {outputs_json} 传参、必需 brief 字段绑定、工具文件字节一致，并校验领域 capability/profile 分配未漂移。 |
| [writeRecords](../symbols/scripts/histagent-maintenance.mjs/writeRecords.md) | 函数 | 复杂 | 1 | 渲染 01-analysis/02-ingestion/03-conversion/04-review 四份锚点记录，并在缺失时生成标记 NOT-COMPLETED 的语义审阅模板。 |
| [currentState](../symbols/scripts/materials-science-skills-for-llm-maintenance.mjs/currentState.md) | 函数 | 复杂 | 1 | 汇总上游、vendor bundle、extension registry、审阅工件与维护文件指纹，构成锚点 manifest 的完整状态快照。 |
| [extensionRows](../symbols/scripts/materials-science-skills-for-llm-maintenance.mjs/extensionRows.md) | 函数 | 复杂 | 1 | 逐条核对 extension package：registry 清单哈希、执行类型、文件树、脚本验证器存在性与 {outputs_json} 传参、必需 brief 字段绑定、工具文件字节一致，并校验领域 capability/profile 分配未漂移。 |
| [writeRecords](../symbols/scripts/materials-science-skills-for-llm-maintenance.mjs/writeRecords.md) | 函数 | 复杂 | 1 | 渲染 01-analysis/02-ingestion/03-conversion/04-review 四份锚点记录，并在缺失时生成标记 NOT-COMPLETED 的语义审阅模板。 |
| [currentState](../symbols/scripts/scientific-agent-skills-maintenance.mjs/currentState.md) | 函数 | 复杂 | 1 | 汇总上游、vendor bundle、extension registry、审阅工件与维护文件指纹，构成锚点 manifest 的完整状态快照。 |
| [extensionRows](../symbols/scripts/scientific-agent-skills-maintenance.mjs/extensionRows.md) | 函数 | 复杂 | 1 | 逐条核对 extension package：registry 清单哈希、执行类型、文件树、脚本验证器存在性与 {outputs_json} 传参、必需 brief 字段绑定、工具文件字节一致，并校验领域 capability/profile 分配未漂移。 |
| [writeRecords](../symbols/scripts/scientific-agent-skills-maintenance.mjs/writeRecords.md) | 函数 | 复杂 | 1 | 渲染 01-analysis/02-ingestion/03-conversion/04-review 四份锚点记录，并在缺失时生成标记 NOT-COMPLETED 的语义审阅模板。 |
| [currentState](../symbols/scripts/tooluniverse-maintenance.mjs/currentState.md) | 函数 | 复杂 | 1 | 汇总上游、vendor bundle、extension registry、审阅工件与维护文件指纹，构成锚点 manifest 的完整状态快照。 |
| [extensionRows](../symbols/scripts/tooluniverse-maintenance.mjs/extensionRows.md) | 函数 | 复杂 | 1 | 逐条核对 extension package：registry 清单哈希、执行类型、文件树、脚本验证器存在性与 {outputs_json} 传参、必需 brief 字段绑定、工具文件字节一致，并校验领域 capability/profile 分配未漂移。 |

## 文件清单

| 文件 | 类型 | 语言 | 摘要 |
| --- | --- | --- | --- |
| [.github/workflows/ci.yml](../files/.github/workflows/ci.yml.md) | pipeline | — | PR 与 main 推送触发的验证流水线，在 ubuntu/macOS/windows × Node 22/24 的 6 组矩阵中安装锁定依赖后运行测试、lint、类型检查、ARSU 转换器 check 与幂等性、固定 Zotero 适配器 check 与幂等性、可安装包校验，并最终用 OpenSpec 严格模式校验 specs。 |
| [.github/workflows/docs.yml](../files/.github/workflows/docs.yml.md) | pipeline | — | 文档站流水线：仅在 CLI catalog、handbook、website/ 或文档生成脚本变化时触发，先跑 docs:check 与 Docusaurus build 校验，再在 main 分支把 website/build 上传并部署到 GitHub Pages。 |
| [.gitmodules](../files/.gitmodules.md) | 配置 | — | 登记八个 vendor Git submodule（ARS、ToolUniverse、Scientific Agent Skills、Materials、FinRobot、HistAgent、Education Agent Skills、Zotero bundle）及其上游 URL 与分支。 |
| [eslint.config.js](../files/eslint.config.js.md) | 配置 | — | ESLint 扁平配置，对 src/tests/harness 下的 TypeScript 启用 strictTypeChecked 与 projectService 类型感知规则，并排除 dist、vendor、references 与两个 legacy 测试文件。 |
| [harness/catalog.ts](../files/harness/catalog.ts.md) | 文件 | — | 维护者 dogfooding harness 的目录装载器：把 Navigate 入口、ARSU/Companion/核心能力/插件 Procedure、文献 Adapter Skill 与领域分类聚合成一个带诊断的 harness 目录，并维护每个 Skill 的文件清单与文件树。 |
| [harness/dogfood/public/app.js](../files/harness/dogfood/public/app.js.md) | 文件 | — | dogfood 行为验收看板的前端脚本，轮询 campaign 状态并渲染初始化投影矩阵、行为尝试队列、场景×宿主矩阵与证据片段，含大量中文状态标签映射。 |
| [harness/dogfood/public/index.html](../files/harness/dogfood/public/index.html.md) | 文件 | — | dogfooding 宿主验收审阅页的静态外壳：顶部展示 campaign 标识与状态徽章，中部提供运行指标概览、init 投影矩阵（36 个目标 × skills/commands/both 三种模式）和单宿主行为验收的尝试队列与报告详情面板。所有数据与交互由同目录的 app.js 在运行时拉取填充。 |
| [harness/dogfood/public/matrix.css](../files/harness/dogfood/public/matrix.css.md) | 文件 | — | 只负责 init 投影矩阵区块的增量样式：矩阵卡片容器、章节标题行、单元格按钮宽度，以及 pass/fail/running 三种检查状态的按钮配色和断言链接缩进。 |
| [harness/dogfood/public/styles.css](../files/harness/dogfood/public/styles.css.md) | 文件 | — | dogfood 验收页的基础样式表：用 :root CSS 变量定义纸感浅色主题与状态色，覆盖三栏工作区栅格、粘性队列、徽章、报告分节、审阅表单、证据折叠块和两档响应式断点。 |
| [harness/fixtures/article.pandoc.json](../files/harness/fixtures/article.pandoc.json.md) | 配置 | — | 文章修订场景的正文 AST 夹具：带完整标题与摘要段落，meta 为空对象，模拟 annotation-intake 流程中被逐句批注的稿件快照，用于生成冻结审阅工作台预览。 |
| [harness/fixtures/base.pandoc.json](../files/harness/fixtures/base.pandoc.json.md) | 配置 | — | 候选稿比较场景的原始稿 pandoc AST 夹具（pandoc-api-version 1.22，meta 声明 html 输出与标题“城市绿地与睡眠质量”），摘要段落含“显著改善”“证明……可以降低失眠风险”等因果化表述，用于验证改写对比预览。 |
| [harness/fixtures/candidate.pandoc.json](../files/harness/fixtures/candidate.pandoc.json.md) | 配置 | — | 与 base.pandoc.json 配对的改写后候选稿 AST 夹具：同样的 318 份问卷与关联估计，但措辞收敛为“较高绿地覆盖率与较好的自报睡眠评分相关”，并显式声明横断面资料不足以判断因果。 |
| [harness/public/app.js](../files/harness/public/app.js.md) | 文件 | — | Skill Browser 前端应用：加载 catalog、按可见入口与 ARSU/Companion/Core/Plugin Procedure 分支构建导航树、按需预览 Skill 包内文件，并支持 URL hash 定位。 |
| [harness/public/index.html](../files/harness/public/index.html.md) | 文件 | — | Skill Browser 页面骨架，提供搜索框、空域显示开关、技能导航侧栏、健康状态条与详情区，并延迟加载 app.js 与 styles.css。 |
| [harness/public/styles.css](../files/harness/public/styles.css.md) | 文件 | — | harness 界面样式表，用 CSS 变量定义配色、面板与状态色，规定顶栏、健康条、侧栏导航、详情区与 Markdown 预览的布局与焦点样式。 |
| [harness/README.md](../files/harness/README.md.md) | 文档 | — | Skill 浏览 harness 的使用说明：pnpm dev:harness 启动只读本地服务、可见入口与隐藏 Procedure 分支的区分，以及 review-workspace 交互预览页的生成方式与样例夹具。 |
| [harness/review-workspace-preview.ts](../files/harness/review-workspace-preview.ts.md) | 文件 | — | 维护者预览夹具：用手写手稿、冻结的 pandoc AST 和润色方案组装 7 个 review-workspace.v2 样例，并给静态工作台 HTML 注入一个样例下拉选择器与 base64 引导脚本。 |
| [harness/revision-master-preview-data.ts](../files/harness/revision-master-preview-data.ts.md) | 文件 | — | revision-master 预览的批准样例数据：把编辑信与两位审稿人的意见拆成 thread/原子批注/章节/计划/日志/回复，并同时产出可直接落盘的稿件文件与 revision-master.db 行数据。 |
| [harness/revision-master-preview.ts](../files/harness/revision-master-preview.ts.md) | 文件 | — | 用生产路径生成 revision-master 工作台的四个阶段预览页：从生产 schema 建库、写样例文件，再经只读 workbench 投影和 prepareRevisionMasterReview 输出 HTML。 |
| [harness/server.ts](../files/harness/server.ts.md) | 文件 | — | 只读的本地 Node HTTP 服务，把 harness 目录以 JSON API 与 Markdown 预览形式提供给浏览器，并附带严格的安全响应头。 |
| [LICENSES/AGPL-3.0.txt](../files/LICENSES/AGPL-3.0.txt.md) | 文档 | — | GNU Affero General Public License v3 全文（661 行），用于固定的 Zotero 适配器包：其网络服务场景的源码公开条款决定了该包不能按 MIT 或 CC 处理。 |
| [LICENSES/Apache-2.0.txt](../files/LICENSES/Apache-2.0.txt.md) | 文档 | — | Apache License 2.0 全文（202 行），覆盖以 Apache-2.0 授权分发的生成 Skill（如 Scientific Agent Skills 资源副本），其专利授权与 NOTICE 保留要求需要逐包署名。 |
| [LICENSES/CC-BY-NC-4.0.txt](../files/LICENSES/CC-BY-NC-4.0.txt.md) | 文档 | — | ARSU 衍生材料的许可声明短文件：指向 CC BY-NC 4.0 完整法律文本，标注上游 ARS 版权（Copyright (c) 2026 Cheng-I Wu）与仓库地址，并说明逐字许可副本保存在 vendor/ars/LICENSE 及各 Skill 目录生成的 LICENSE 中。 |
| [LICENSES/CC-BY-SA-4.0.txt](../files/LICENSES/CC-BY-SA-4.0.txt.md) | 文档 | — | Education Agent Skills 域资产的许可说明：署名 Gareth Manning，允许分享与改编（含商业用途），但要求署名、相同方式共享且不得附加额外限制，并给出完整许可文本链接。 |
| [LICENSES/MIT.txt](../files/LICENSES/MIT.txt.md) | 文档 | — | ResearchSpec 原创框架与 Companion 材料的 MIT 许可全文，版权归 ResearchSpec contributors，要求在副本中保留版权与许可声明。 |
| [package.json](../files/package.json.md) | 配置 | — | npm 包清单：声明 ESM 包、researchspec bin 入口、两个子路径导出（annotation-intake、review-workspace）、发布文件白名单（dist、skills、LICENSES、docs 等）以及约 90 条脚本，覆盖 build/test/lint、ARSU 与各 vendor 转换器的 convert/check/idempotence 及 maintenance 锚点命令。 |
| [scripts/arsu-maintenance.mjs](../files/scripts/arsu-maintenance.mjs.md) | 文件 | — | ARS/ARSU 能力维护 CLI：按 anchors baseline/records/artifacts/check/diff 固化上游 submodule 修订、抽取索引统计、能力 registry 与 parity 覆盖率，并在语义审阅完成后写出锚点 manifest。 |
| [scripts/audit-capability-parity.mjs](../files/scripts/audit-capability-parity.mjs.md) | 文件 | — | 能力包与上游抽取产物的对齐审计：按 provenance 选择 extraction-index，解析上游标题与规则，判定哪些规则在能力包文档中有覆盖并写出对齐报告。 |
| [scripts/authored-whitespace-exemptions.json](../files/scripts/authored-whitespace-exemptions.json.md) | 配置 | — | 行尾空白检查的豁免目录，为每个字节保持不变的上游资产记录 sha256 与其在 authoring 抽取索引中的 artifact_id 证据。 |
| [scripts/check-authored-whitespace.mjs](../files/scripts/check-authored-whitespace.mjs.md) | 文件 | — | 行尾空白守卫：默认取 git 变更路径，加载并校验豁免目录的 sha256，跳过二进制与生成的保留 Skill，对 UTF-8 文本逐行报告尾随空白。 |
| [scripts/clean-output.mjs](../files/scripts/clean-output.mjs.md) | 文件 | — | 构建产物清理脚本，只接受 dist 与 .test-dist 两个顶层目录名，拒绝任何其他路径后递归删除。 |
| [scripts/dogfood.mjs](../files/scripts/dogfood.mjs.md) | 文件 | — | 维护者 dogfooding campaign 的协调器 CLI：按 plan/run/resume/retry/assess/serve/import-review/report/legacy-import 分发子命令，负责冻结场景目录与构建哈希、预检 bwrap 与宿主二进制、经 Orca 终端派发行为与验收 worker、并维护 campaign 锁与并发队列。 |
| [scripts/dogfood/assessment-worker.mjs](../files/scripts/dogfood/assessment-worker.mjs.md) | 文件 | — | 验收 worker 入口：组装场景、尝试与评分量表 packet，在 bubblewrap 沙箱内以只读证据目录驱动验收 Agent，读取其 assessment.json 并交回校验落盘，失败时写入状态与原因。 |
| [scripts/dogfood/assessment.mjs](../files/scripts/dogfood/assessment.mjs.md) | 文件 | — | 独立验收报告的校验与落盘：确认尝试证据已封存且未变更，逐项校验行动、交付物、前置条件、硬断言、四项评分与建议结论的证据引用，并渲染中文 Markdown 报告。 |
| [scripts/dogfood/hosts.mjs](../files/scripts/dogfood/hosts.mjs.md) | 文件 | — | 宿主执行适配表：集中登记 codex、claude、opencode、oh-my-pi 的可执行文件、命令行拼装、流式事件解码、凭据路径与环境变量，并构造 bubblewrap 沙箱命令以只暴露必要运行时与本次证据。 |
| [scripts/dogfood/lib.mjs](../files/scripts/dogfood/lib.mjs.md) | 文件 | — | dogfooding harness 的共享基础库：campaign/attempt/assessment/matrix 目录解析与 ID 校验、原子 JSON 写入、场景目录加载与哈希校验、构建哈希、证据哈希、宿主选择解析与 fixture 前置条件校验。 |
| [scripts/dogfood/matrix-worker.mjs](../files/scripts/dogfood/matrix-worker.mjs.md) | 文件 | — | init 投影矩阵 worker：对单个 (target, delivery mode) 执行 init/status/check，比对安装清单中的 Navigate Skill、命令包装、项目入口规则与两个托管 profile，并校验 Procedure 的 list/show/instructions 可发现性。 |
| [scripts/dogfood/review.mjs](../files/scripts/dogfood/review.mjs.md) | 文件 | — | 人工评审导入、聚合与发布：校验证据哈希、断言完整性、评分门槛与判决自洽性，汇总成 campaign 报告，并在 init 投影全通过时把脱敏证据发布到 playbook 并更新 host-verification.md。 |
| [scripts/dogfood/server.mjs](../files/scripts/dogfood/server.mjs.md) | 文件 | — | 本地只读审阅服务：暴露 campaign、场景、矩阵用例与会话证据的 JSON 接口及增量事件流，审阅写入需携带本地 token 并通过同源校验，静态资源取自 harness/dogfood/public。 |
| [scripts/dogfood/worker.mjs](../files/scripts/dogfood/worker.mjs.md) | 文件 | — | 单次行为尝试 worker：在临时工作区铺设 fixture、执行 init 与必要 start/advance、记录变更前后文件清单与 status/check 输出，随后在沙箱内驱动宿主 Agent 并把事件、变更文件与诊断结果封存为证据。 |
| [scripts/education-agent-skills-maintenance.mjs](../files/scripts/education-agent-skills-maintenance.mjs.md) | 文件 | — | Education Agent Skills 扩展维护 CLI：锁定 snapshot-6bbbce4 修订与提交，核对 136 个 llm 类型 extension 的 registry 哈希、清单一致性与统一的六项 brief 字段。 |
| [scripts/education-agent-skills-validator-template.py](../files/scripts/education-agent-skills-validator-template.py.md) | 文件 | — | Education Agent Skills 插件能力的研究简报校验器模板：解析命令行给出的 JSON 输出，校验存在 research_brief 并含六个通用证据字段。 |
| [scripts/finrobot-maintenance.mjs](../files/scripts/finrobot-maintenance.mjs.md) | 文件 | — | FinRobot 扩展维护 CLI：锁定 snapshot-2717499 修订，核对 1048 个跟踪条目之上的六个 financial-research extension、四个 mixed 能力复制的入口脚本与证据验证器。 |
| [scripts/generate-arsu-capability-review-html.mjs](../files/scripts/generate-arsu-capability-review-html.mjs.md) | 文件 | — | ARSU 模式能力审阅 HTML 生成器：枚举 vendor/ars 的 SKILL、agent、reference、template 文档与转换后的能力包，按 mode 生成可折叠审阅页面。 |
| [scripts/generate-arsu-gap-semantic-review-html.mjs](../files/scripts/generate-arsu-gap-semantic-review-html.mjs.md) | 文件 | — | 把锚点目录下的 05-semantic-review.md 渲染为独立 HTML；源文件缺失时输出明确的 [NOT-COMPLETED] 占位页。 |
| [scripts/generate-arsu-graph-match-assessment-html.mjs](../files/scripts/generate-arsu-graph-match-assessment-html.mjs.md) | 文件 | — | graph 匹配评估页生成器：把上游 mode 文档锚点与 ResearchSpec graph 能力逐段对照，输出每个 mode 的匹配度、上下文片段与可选文档判定。 |
| [scripts/generate-cli-handbook.mjs](../files/scripts/generate-cli-handbook.mjs.md) | 文件 | — | 调用编译产物的 renderCliHandbook 生成或校验 docs/user/cli-handbook.md，--check 模式下逐字节比对以防文档漂移。 |
| [scripts/generate-docs.mjs](../files/scripts/generate-docs.mjs.md) | 文件 | — | 文档生成入口：先断言 CLI 恰好暴露 16 个顶层命令，再从类型化目录渲染 CLI 手册、Agent 入口矩阵、website 命令页与侧边栏，支持 --check 只校验。 |
| [scripts/generate-education-agent-skills-extensions.mjs](../files/scripts/generate-education-agent-skills-extensions.mjs.md) | 文件 | — | 把已审阅的 Education Agent Skills 逐一投影为 plugin-education-* 扩展包：复制 SKILL.md 与资源为 SHA-256 knowledge ref，按域目录派生归属并更新 registry 与审计 catalog。 |
| [scripts/generate-extraction-index.mjs](../files/scripts/generate-extraction-index.mjs.md) | 文件 | — | 从 authoring/ars 的里程碑审阅笔记与 vendor/ars 上游文件生成 extraction-index.json，逐制品记录 id、来源路径与 SHA-256，并支持 --check 只校验。 |
| [scripts/generate-scientific-agent-skills-extensions.mjs](../files/scripts/generate-scientific-agent-skills-extensions.mjs.md) | 文件 | — | 把已审阅的 Scientific Agent Skills 投影为 plugin-scientific-agent-skills-* 扩展能力：保持 SKILL.md 正文不变，复制审阅资源为字节级 knowledge ref，绑定校验器并写 registry 与 catalog。 |
| [scripts/generate-tooluniverse-extensions.mjs](../files/scripts/generate-tooluniverse-extensions.mjs.md) | 文件 | — | ToolUniverse 扩展生成器：按审计 catalog 逐个生成 plugin-tooluniverse-* 能力与 profile，复制非标准资源为 knowledge ref、按 execution_type 绑定校验器，并更新扩展 registry。 |
| [scripts/histagent-maintenance.mjs](../files/scripts/histagent-maintenance.mjs.md) | 文件 | — | HistAgent 扩展维护 CLI：锁定 snapshot-47bbe21 修订，核对三个自包含 executable Skill 的 bundle 树哈希、extension package、脚本副本与领域分配。 |
| [scripts/install-stable.mjs](../files/scripts/install-stable.mjs.md) | 文件 | — | 把当前仓库打成 tarball 并全局安装，用于验证发行版行为：先 pnpm build，再 npm pack、强制移除旧全局包、安装新包，卸载旧全局失败只告警。 |
| [scripts/lib/vendor-maintenance.mjs](../files/scripts/lib/vendor-maintenance.mjs.md) | 文件 | — | 厂商维护脚本的共享库：确定性文件清单与树哈希、git 跟踪文件盘点、锚点记录哈希、值比较、工��文件同步与审阅工件写出，并按厂商提供的状态/记录函数组装统一的 artifacts/records/baseline/check/diff 命令生命周期。 |
| [scripts/mark-cli-executable.mjs](../files/scripts/mark-cli-executable.mjs.md) | 文件 | — | 构建收尾脚本，把 dist/src/cli/bin.js 权限置为 0755，保证 npm 分发的 CLI 可直接执行。 |
| [scripts/materials-science-skills-for-llm-maintenance.mjs](../files/scripts/materials-science-skills-for-llm-maintenance.mjs.md) | 文件 | — | Materials Science 扩展维护 CLI：锁定 snapshot-fafd3ab 上游修订，核对 7 个 curated Skill 的 bundle 与 extension package、evidence 验证器绑定以及领域归属。 |
| [scripts/own-vendor-maintenance.mjs](../files/scripts/own-vendor-maintenance.mjs.md) | 文件 | — | 自有 vendor 维护 CLI：以 audits/own-vendors/catalog.json 为 SSOT 提供 records/baseline/check/diff/artifacts 子命令，核对上游清单、能力包树哈希与 parity 报告，产出维护记录与基线。 |
| [scripts/run-skill-harness.mjs](../files/scripts/run-skill-harness.mjs.md) | 文件 | — | 先用 tsc 编译 harness 源码到 .harness-dist，再按参数启动只读本地服务，或在 --review-workspace 模式下生成审阅工作台预览页并可选打开浏览器。 |
| [scripts/run-tests.mjs](../files/scripts/run-tests.mjs.md) | 文件 | — | 递归收集 .test-dist/tests 下编译产物中的 *.test.js，交由 node --test 执行，并设置 PYTHONDONTWRITEBYTECODE 避免写出字节码。 |
| [scripts/scientific-agent-skills-maintenance.mjs](../files/scripts/scientific-agent-skills-maintenance.mjs.md) | 文件 | — | Scientific Agent Skills 扩展维护 CLI：按 v2.70.0 锚点盘点上游与 vendor bundle，校验每个 extension package 的 manifest 哈希、执行类型、验证器与 knowledge refs，并重算 registry 子集、package 树与 profile 树哈希。 |
| [scripts/scientific-agent-skills-validator-template.py](../files/scripts/scientific-agent-skills-validator-template.py.md) | 文件 | — | Scientific Agent Skills 扩展能力的研究简报校验器模板：读取提交的 JSON 输出，确认 research_brief 存在并包含六个通用证据字段。 |
| [scripts/tooluniverse-maintenance.mjs](../files/scripts/tooluniverse-maintenance.mjs.md) | 文件 | — | ToolUniverse 扩展维护 CLI：校验 vendor/tooluniverse 处于目录锁定 revision 且干净，盘点 130 个 reviewed vendor-bundle Skills，并逐能力核对 registry 清单、package 树哈希、验证器必需字段与工具文件字节一致。 |
| [scripts/tooluniverse-validator-template.py](../files/scripts/tooluniverse-validator-template.py.md) | 文件 | — | ToolUniverse 扩展能力的研究简报校验器模板，校验绝对输出路径中的 research_brief JSON 是否具备 scope、source_ledger 等六项证据字段。 |
| [scripts/verify-arsu-checkers.mjs](../files/scripts/verify-arsu-checkers.mjs.md) | 文件 | — | 在不安装依赖的前提下打包当前 CLI，在临时项目中用 symlink 复用 node_modules 与用户 Python 环境，构造语料后以 --json 逐条验证打包内的 ARSU checker 行为。 |
| [scripts/verify-package.mjs](../files/scripts/verify-package.mjs.md) | 文件 | — | 发行包端到端验证脚本：核对 tarball 文件面、已安装 ARSU 规约与文档摘要、运行时图表源与渲染产物、平台对应二进制，并跑通 minimal 与 academic-pipeline 两条完整旅程。 |
| [tsconfig.build.json](../files/tsconfig.build.json.md) | 配置 | — | 发布构建配置：在基础配置上开启 emit，输出到 dist 并生成 .d.ts 声明，只编译 src 以保持发布包干净。 |
| [tsconfig.harness.json](../files/tsconfig.harness.json.md) | 配置 | — | 维护者 dogfood harness 的编译配置：编译 src 与 harness 到 .harness-dist，排除 tests，让 harness 可独立启动本地预览与验收。 |
| [tsconfig.json](../files/tsconfig.json.md) | 配置 | — | TypeScript 基础配置：ES2022 + NodeNext 模块与解析、strict 全开、skipLibCheck 关闭、noEmit 仅做类型检查，覆盖 src、tests 与 harness。 |
| [tsconfig.test.json](../files/tsconfig.test.json.md) | 配置 | — | 测试编译配置：把 src、tests、harness 一并编译到 .test-dist，关闭声明与 sourcemap 以缩短测试启动时间。 |

## 对其它分层的依赖

| 目标分层 | 边数 | 关系类型 |
| --- | --- | --- |
| [文档与文档站层](documentation.md) | 11 | depends_on×11 |
| [CLI 命令入口层](cli.md) | 9 | depends_on×5、configures×4 |
| [能力与插件目录层](capability-registry.md) | 6 | depends_on×3、imports×3 |
| [核心契约与工作流运行时](core.md) | 5 | imports×5 |
| [宿主与投递适配层](adapters.md) | 3 | imports×2、depends_on×1 |
| [ARSU 转换与 Skill 生成层](arsu-converter.md) | 2 | configures×1、imports×1 |
| [测试与验收夹具层](tests.md) | 1 | configures×1 |

## 被其它分层依赖

| 来源分层 | 边数 | 关系类型 |
| --- | --- | --- |
| [测试与验收夹具层](tests.md) | 8 | imports×8 |
