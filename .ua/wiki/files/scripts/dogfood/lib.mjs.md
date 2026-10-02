
# scripts/dogfood/lib.mjs
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[scripts/dogfood](../../../modules/scripts/dogfood.md)
<!-- node: file:scripts/dogfood/lib.mjs -->

dogfooding harness 的共享基础库：campaign/attempt/assessment/matrix 目录解析与 ID 校验、原子 JSON 写入、场景目录加载与哈希校验、构建哈希、证据哈希、宿主选择解析与 fixture 前置条件校验。
源码：[scripts/dogfood/lib.mjs](../../../../../scripts/dogfood/lib.mjs)

## 符号（17）
<!-- node: function:scripts/dogfood/lib.mjs:assessmentDir -->
<!-- node: function:scripts/dogfood/lib.mjs:attemptDir -->
<!-- node: function:scripts/dogfood/lib.mjs:buildHash -->
<!-- node: function:scripts/dogfood/lib.mjs:campaignDir -->
<!-- node: function:scripts/dogfood/lib.mjs:evidenceHash -->
<!-- node: function:scripts/dogfood/lib.mjs:loadCampaignCatalog -->
<!-- node: function:scripts/dogfood/lib.mjs:loadCatalog -->
<!-- node: function:scripts/dogfood/lib.mjs:loadConfig -->
<!-- node: function:scripts/dogfood/lib.mjs:matrixCaseDir -->
<!-- node: function:scripts/dogfood/lib.mjs:matrixState -->
<!-- node: function:scripts/dogfood/lib.mjs:resolveSelection -->
<!-- node: function:scripts/dogfood/lib.mjs:run -->
<!-- node: function:scripts/dogfood/lib.mjs:toolCatalog -->
<!-- node: function:scripts/dogfood/lib.mjs:toolIds -->
<!-- node: function:scripts/dogfood/lib.mjs:validateFirstQuery -->
<!-- node: function:scripts/dogfood/lib.mjs:validateProcedureChain -->
<!-- node: function:scripts/dogfood/lib.mjs:writeJson -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assessmentDir | 函数 | 32–35 | 简单 | path-resolution、utility、dogfooding | 0 | 顺带校验尝试 ID 后返回 assessments 子目录路径。 |
| attemptDir | 函数 | 28–31 | 简单 | path-resolution、validation、utility | 0 | 校验尝试 ID 格式并返回 campaign 下的 sessions 子目录。 |
| buildHash | 函数 | 103–118 | 中等 | hashing、integrity、build | 1 | 对 dist、skills、literature-adapters、review-workspace、harness 静态产物与基准等目录做确定性遍历哈希，冻结 campaign 依赖的构建内容。 |
| campaignDir | 函数 | 24–27 | 简单 | path-resolution、validation、utility | 0 | 校验 campaign ID 格式并返回其状态目录路径。 |
| [evidenceHash](../../../symbols/scripts/dogfood/lib.mjs/evidenceHash.md) | 函数 | 156–168 | 中等 | hashing、integrity、evidence | 2 | 对尝试目录中除 session/review 外的全部证据文件做排序哈希，形成可复核的封存指纹。 |
| loadCampaignCatalog | 函数 | 52–59 | 简单 | config、hashing、validation | 0 | 优先读取 campaign 内冻结的场景目录快照，并与 campaign 记录的哈希比对。 |
| loadCatalog | 函数 | 44–46 | 简单 | config、hashing、utility | 0 | 读取并解析 playbook 中的场景目录，返回结构与字节哈希。 |
| loadConfig | 函数 | 78–90 | 简单 | config、validation、dogfooding | 0 | 读取并校验 harness YAML 配置的 schema、宿主条目、模型与二进制字段，拒绝用 enabled 选择行为宿主。 |
| matrixCaseDir | 函数 | 36–39 | 简单 | path-resolution、validation、utility | 0 | 校验矩阵目标与交付模式后返回矩阵用例目录。 |
| matrixState | 函数 | 40–43 | 简单 | state-management、utility、dogfooding | 0 | 读取矩阵用例状态文件，缺失时视为 pending。 |
| [resolveSelection](../../../symbols/scripts/dogfood/lib.mjs/resolveSelection.md) | 函数 | 119–155 | 复杂 | validation、configuration、policy | 1 | 把 CLI 参数、配置与场景目录解析为冻结选择：拒绝多宿主旧用法，校验行为宿主、适配器、模型、场景、验收人与各类并发/超时边界。 |
| run | 函数 | 91–96 | 简单 | process、utility、dogfooding | 0 | 同步执行外部命令并在非零退出或错误时失败，返回标准输出。 |
| toolCatalog | 函数 | 97–101 | 简单 | dynamic-import、registry、utility | 0 | 动态导入构建产物中的 TOOLS 注册表，缺失构建时提示先执行 pnpm build。 |
| toolIds | 函数 | 102–102 | 简单 | registry、utility、dogfooding | 0 | 返回全部已注册宿主目标的 ID 列表。 |
| validateFirstQuery | 函数 | 60–64 | 简单 | validation、fixture-precondition、dogfooding | 0 | 断言 fixture 前置条件：首次 Procedure 查询必须返回零候选，证明检索起点未被污染。 |
| validateProcedureChain | 函数 | 65–77 | 简单 | validation、fixture-precondition、procedure-chain | 0 | 校验两个 Procedure 的共享角色 schema_ref 对齐，且其余必填输入在 fixture 中真实存在。 |
| writeJson | 函数 | 17–22 | 简单 | persistence、atomicity、utility | 0 | 先写同目录临时文件再 rename 的原子 JSON 写入，自动创建父目录。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assessment-worker.mjs](assessment-worker.mjs.md) | scripts/dogfood/assessment-worker.mjs | 验收 worker 入口：组装场景、尝试与评分量表 packet，在 bubblewrap 沙箱内以只读证据目录驱动验收 Agent，读取其 assessment.json 并交回校验落盘，失败时写入状态与原因。 |
| [assessment.mjs](assessment.mjs.md) | scripts/dogfood/assessment.mjs | 独立验收报告的校验与落盘：确认尝试证据已封存且未变更，逐项校验行动、交付物、前置条件、硬断言、四项评分与建议结论的证据引用，并渲染中文 Markdown 报告。 |
| [dogfood-harness.test.mjs](../../tests/dogfood-harness.test.mjs.md) | tests/dogfood-harness.test.mjs | dogfooding harness 的 node:test 用例：覆盖冻结场景目录校验、fixture 前置条件、宿主与模型选择、审阅服务接口与路径防护、人工 pass 门槛、验收报告证据绑定以及历史 campaign 只读约束。 |
| [dogfood.mjs](../dogfood.mjs.md) | scripts/dogfood.mjs | 维护者 dogfooding campaign 的协调器 CLI：按 plan/run/resume/retry/assess/serve/import-review/report/legacy-import 分发子命令，负责冻结场景目录与构建哈希、预检 bwrap 与宿主二进制、经 Orca 终端派发行为与验收 worker、并维护 campaign 锁与并发队列。 |
| [hosts.mjs](hosts.mjs.md) | scripts/dogfood/hosts.mjs | 宿主执行适配表：集中登记 codex、claude、opencode、oh-my-pi 的可执行文件、命令行拼装、流式事件解码、凭据路径与环境变量，并构造 bubblewrap 沙箱命令以只暴露必要运行时与本次证据。 |
| [matrix-worker.mjs](matrix-worker.mjs.md) | scripts/dogfood/matrix-worker.mjs | init 投影矩阵 worker：对单个 (target, delivery mode) 执行 init/status/check，比对安装清单中的 Navigate Skill、命令包装、项目入口规则与两个托管 profile，并校验 Procedure 的 list/show/instructions 可发现性。 |
| [review.mjs](review.mjs.md) | scripts/dogfood/review.mjs | 人工评审导入、聚合与发布：校验证据哈希、断言完整性、评分门槛与判决自洽性，汇总成 campaign 报告，并在 init 投影全通过时把脱敏证据发布到 playbook 并更新 host-verification.md。 |
| [server.mjs](server.mjs.md) | scripts/dogfood/server.mjs | 本地只读审阅服务：暴露 campaign、场景、矩阵用例与会话证据的 JSON 接口及增量事件流，审阅写入需携带本地 token 并通过同源校验，静态资源取自 harness/dogfood/public。 |
| [worker.mjs](worker.mjs.md) | scripts/dogfood/worker.mjs | 单次行为尝试 worker：在临时工作区铺设 fixture、执行 init 与必要 start/advance、记录变更前后文件清单与 status/check 输出，随后在沙箱内驱动宿主 Agent 并把事件、变更文件与诊断结果封存为证据。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| assessmentDir | 函数 | 32–35 | 顺带校验尝试 ID 后返回 assessments 子目录路径。 |
| attemptDir | 函数 | 28–31 | 校验尝试 ID 格式并返回 campaign 下的 sessions 子目录。 |
| buildHash | 函数 | 103–118 | 对 dist、skills、literature-adapters、review-workspace、harness 静态产物与基准等目录做确定性遍历哈希，冻结 campaign 依赖的构建内容。 |
| campaignDir | 函数 | 24–27 | 校验 campaign ID 格式并返回其状态目录路径。 |
| [evidenceHash](../../../symbols/scripts/dogfood/lib.mjs/evidenceHash.md) | 函数 | 156–168 | 对尝试目录中除 session/review 外的全部证据文件做排序哈希，形成可复核的封存指纹。 |
| loadCampaignCatalog | 函数 | 52–59 | 优先读取 campaign 内冻结的场景目录快照，并与 campaign 记录的哈希比对。 |
| loadCatalog | 函数 | 44–46 | 读取并解析 playbook 中的场景目录，返回结构与字节哈希。 |
| loadConfig | 函数 | 78–90 | 读取并校验 harness YAML 配置的 schema、宿主条目、模型与二进制字段，拒绝用 enabled 选择行为宿主。 |
| matrixCaseDir | 函数 | 36–39 | 校验矩阵目标与交付模式后返回矩阵用例目录。 |
| matrixState | 函数 | 40–43 | 读取矩阵用例状态文件，缺失时视为 pending。 |
| [resolveSelection](../../../symbols/scripts/dogfood/lib.mjs/resolveSelection.md) | 函数 | 119–155 | 把 CLI 参数、配置与场景目录解析为冻结选择：拒绝多宿主旧用法，校验行为宿主、适配器、模型、场景、验收人与各类并发/超时边界。 |
| run | 函数 | 91–96 | 同步执行外部命令并在非零退出或错误时失败，返回标准输出。 |
| toolCatalog | 函数 | 97–101 | 动态导入构建产物中的 TOOLS 注册表，缺失构建时提示先执行 pnpm build。 |
| toolIds | 函数 | 102–102 | 返回全部已注册宿主目标的 ID 列表。 |
| validateFirstQuery | 函数 | 60–64 | 断言 fixture 前置条件：首次 Procedure 查询必须返回零候选，证明检索起点未被污染。 |
| validateProcedureChain | 函数 | 65–77 | 校验两个 Procedure 的共享角色 schema_ref 对齐，且其余必填输入在 fixture 中真实存在。 |
| writeJson | 函数 | 17–22 | 先写同目录临时文件再 rename 的原子 JSON 写入，自动创建父目录。 |
