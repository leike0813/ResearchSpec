
# scripts/dogfood
> 目录聚合页：8 个文件、38 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [scripts/dogfood/assessment-worker.mjs](../../files/scripts/dogfood/assessment-worker.mjs.md) | 文件 | 0 | 验收 worker 入口：组装场景、尝试与评分量表 packet，在 bubblewrap 沙箱内以只读证据目录驱动验收 Agent，读取其 assessment.json 并交回校验落盘，失败时写入状态与原因。 |
| [scripts/dogfood/assessment.mjs](../../files/scripts/dogfood/assessment.mjs.md) | 文件 | 5 | 独立验收报告的校验与落盘：确认尝试证据已封存且未变更，逐项校验行动、交付物、前置条件、硬断言、四项评分与建议结论的证据引用，并渲染中文 Markdown 报告。 |
| [scripts/dogfood/hosts.mjs](../../files/scripts/dogfood/hosts.mjs.md) | 文件 | 2 | 宿主执行适配表：集中登记 codex、claude、opencode、oh-my-pi 的可执行文件、命令行拼装、流式事件解码、凭据路径与环境变量，并构造 bubblewrap 沙箱命令以只暴露必要运行时与本次证据。 |
| [scripts/dogfood/lib.mjs](../../files/scripts/dogfood/lib.mjs.md) | 文件 | 17 | dogfooding harness 的共享基础库：campaign/attempt/assessment/matrix 目录解析与 ID 校验、原子 JSON 写入、场景目录加载与哈希校验、构建哈希、证据哈希、宿主选择解析与 fixture 前置条件校验。 |
| [scripts/dogfood/matrix-worker.mjs](../../files/scripts/dogfood/matrix-worker.mjs.md) | 文件 | 0 | init 投影矩阵 worker：对单个 (target, delivery mode) 执行 init/status/check，比对安装清单中的 Navigate Skill、命令包装、项目入口规则与两个托管 profile，并校验 Procedure 的 list/show/instructions 可发现性。 |
| [scripts/dogfood/review.mjs](../../files/scripts/dogfood/review.mjs.md) | 文件 | 6 | 人工评审导入、聚合与发布：校验证据哈希、断言完整性、评分门槛与判决自洽性，汇总成 campaign 报告，并在 init 投影全通过时把脱敏证据发布到 playbook 并更新 host-verification.md。 |
| [scripts/dogfood/server.mjs](../../files/scripts/dogfood/server.mjs.md) | 文件 | 2 | 本地只读审阅服务：暴露 campaign、场景、矩阵用例与会话证据的 JSON 接口及增量事件流，审阅写入需携带本地 token 并通过同源校验，静态资源取自 harness/dogfood/public。 |
| [scripts/dogfood/worker.mjs](../../files/scripts/dogfood/worker.mjs.md) | 文件 | 6 | 单次行为尝试 worker：在临时工作区铺设 fixture、执行 init 与必要 start/advance、记录变更前后文件清单与 status/check 输出，随后在沙箱内驱动宿主 Agent 并把事件、变更文件与诊断结果封存为证据。 |
