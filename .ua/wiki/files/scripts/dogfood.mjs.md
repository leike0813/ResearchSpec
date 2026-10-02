
# scripts/dogfood.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/dogfood.mjs -->

维护者 dogfooding campaign 的协调器 CLI：按 plan/run/resume/retry/assess/serve/import-review/report/legacy-import 分发子命令，负责冻结场景目录与构建哈希、预检 bwrap 与宿主二进制、经 Orca 终端派发行为与验收 worker、并维护 campaign 锁与并发队列。
源码：[scripts/dogfood.mjs](../../../../scripts/dogfood.mjs)

## 符号（10）
<!-- node: function:scripts/dogfood.mjs:assessQueue -->
<!-- node: function:scripts/dogfood.mjs:drive -->
<!-- node: function:scripts/dogfood.mjs:execute -->
<!-- node: function:scripts/dogfood.mjs:executeAssessment -->
<!-- node: function:scripts/dogfood.mjs:lock -->
<!-- node: function:scripts/dogfood.mjs:main -->
<!-- node: function:scripts/dogfood.mjs:newAttempt -->
<!-- node: function:scripts/dogfood.mjs:parse -->
<!-- node: function:scripts/dogfood.mjs:runMatrix -->
<!-- node: function:scripts/dogfood.mjs:verifyPrerequisites -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assessQueue | 函数 | 167–180 | 中等 | concurrency、queue、rate-limiting | 0 | 以受限并发消费验收队列，识别宿主限流信号并提前收敛整批验收。 |
| drive | 函数 | 181–238 | 复杂 | orchestration、state-machine、campaign | 0 | campaign 主循环：加锁、可选启动审阅服务、跑 init 矩阵、按宿主串行派发行为尝试并并行排队验收，最终写入 campaign 终态。 |
| execute | 函数 | 114–140 | 中等 | orchestration、agent-execution、timeout | 0 | 通过 Orca 终端创建承载 worker 的执行会话，轮询 session 状态直到封存或超时，超时则中断并标记 interrupted。 |
| executeAssessment | 函数 | 141–166 | 中等 | orchestration、assessment、agent-execution | 1 | 为已封存的尝试派发独立验收 worker，轮询验收状态直至 ready/failed，并在失败时记录原因。 |
| lock | 函数 | 78–87 | 简单 | concurrency、lock、state-management | 0 | 以 wx 标志创建 pid 锁文件保护 campaign，陈旧锁（进程已不存在）会被回收，并返回解锁回调。 |
| main | 函数 | 240–326 | 复杂 | entry-point、cli、dispatch | 0 | 按子命令分发 plan/run/serve/resume/retry/import-review/assess/report/legacy-import，并在运行前校验 schema、目录哈希与构建哈希。 |
| newAttempt | 函数 | 68–77 | 简单 | state-management、session、idempotency | 0 | 为一次 (host, scenario, ordinal) 组合创建尝试记录，重试时追加 retry 后缀并落盘 session.json。 |
| parse | 函数 | 18–33 | 简单 | cli、parsing、validation | 0 | 解析 CLI 选项为选择对象，区分数组型与标量型参数并拒绝缺失值、重复行为宿主与未知开关。 |
| runMatrix | 函数 | 98–113 | 中等 | orchestration、concurrency、matrix | 0 | 按目标×模式并发拉起 matrix-worker，跳过已判定 pass/fail 的用例，并把中断或异常退出记为 fail。 |
| verifyPrerequisites | 函数 | 44–59 | 简单 | preflight、validation、sandbox | 1 | 预检 Linux 平台、bwrap 沙箱可用性、oh-my-pi 所需 sqlite3，以及每个宿主二进制与其 --version。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assessment.mjs](dogfood/assessment.mjs.md) | scripts/dogfood/assessment.mjs | 独立验收报告的校验与落盘：确认尝试证据已封存且未变更，逐项校验行动、交付物、前置条件、硬断言、四项评分与建议结论的证据引用，并渲染中文 Markdown 报告。 |
| [hosts.mjs](dogfood/hosts.mjs.md) | scripts/dogfood/hosts.mjs | 宿主执行适配表：集中登记 codex、claude、opencode、oh-my-pi 的可执行文件、命令行拼装、流式事件解码、凭据路径与环境变量，并构造 bubblewrap 沙箱命令以只暴露必要运行时与本次证据。 |
| [lib.mjs](dogfood/lib.mjs.md) | scripts/dogfood/lib.mjs | dogfooding harness 的共享基础库：campaign/attempt/assessment/matrix 目录解析与 ID 校验、原子 JSON 写入、场景目录加载与哈希校验、构建哈希、证据哈希、宿主选择解析与 fixture 前置条件校验。 |
| [review.mjs](dogfood/review.mjs.md) | scripts/dogfood/review.mjs | 人工评审导入、聚合与发布：校验证据哈希、断言完整性、评分门槛与判决自洽性，汇总成 campaign 报告，并在 init 投影全通过时把脱敏证据发布到 playbook 并更新 host-verification.md。 |
| [server.mjs](dogfood/server.mjs.md) | scripts/dogfood/server.mjs | 本地只读审阅服务：暴露 campaign、场景、矩阵用例与会话证据的 JSON 接口及增量事件流，审阅写入需携带本地 token 并通过同源校验，静态资源取自 harness/dogfood/public。 |
