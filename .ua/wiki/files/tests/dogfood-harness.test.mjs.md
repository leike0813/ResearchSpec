
# tests/dogfood-harness.test.mjs
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/dogfood-harness.test.mjs -->

dogfooding harness 的 node:test 用例：覆盖冻结场景目录校验、fixture 前置条件、宿主与模型选择、审阅服务接口与路径防护、人工 pass 门槛、验收报告证据绑定以及历史 campaign 只读约束。
源码：[tests/dogfood-harness.test.mjs](../../../../tests/dogfood-harness.test.mjs)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assessment.mjs](../scripts/dogfood/assessment.mjs.md) | scripts/dogfood/assessment.mjs | 独立验收报告的校验与落盘：确认尝试证据已封存且未变更，逐项校验行动、交付物、前置条件、硬断言、四项评分与建议结论的证据引用，并渲染中文 Markdown 报告。 |
| [hosts.mjs](../scripts/dogfood/hosts.mjs.md) | scripts/dogfood/hosts.mjs | 宿主执行适配表：集中登记 codex、claude、opencode、oh-my-pi 的可执行文件、命令行拼装、流式事件解码、凭据路径与环境变量，并构造 bubblewrap 沙箱命令以只暴露必要运行时与本次证据。 |
| [lib.mjs](../scripts/dogfood/lib.mjs.md) | scripts/dogfood/lib.mjs | dogfooding harness 的共享基础库：campaign/attempt/assessment/matrix 目录解析与 ID 校验、原子 JSON 写入、场景目录加载与哈希校验、构建哈希、证据哈希、宿主选择解析与 fixture 前置条件校验。 |
| [review.mjs](../scripts/dogfood/review.mjs.md) | scripts/dogfood/review.mjs | 人工评审导入、聚合与发布：校验证据哈希、断言完整性、评分门槛与判决自洽性，汇总成 campaign 报告，并在 init 投影全通过时把脱敏证据发布到 playbook 并更新 host-verification.md。 |
| [server.mjs](../scripts/dogfood/server.mjs.md) | scripts/dogfood/server.mjs | 本地只读审阅服务：暴露 campaign、场景、矩阵用例与会话证据的 JSON 接口及增量事件流，审阅写入需携带本地 token 并通过同源校验，静态资源取自 harness/dogfood/public。 |
