
# scripts/dogfood/assessment-worker.mjs
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[scripts/dogfood](../../../modules/scripts/dogfood.md)
<!-- node: file:scripts/dogfood/assessment-worker.mjs -->

验收 worker 入口：组装场景、尝试与评分量表 packet，在 bubblewrap 沙箱内以只读证据目录驱动验收 Agent，读取其 assessment.json 并交回校验落盘，失败时写入状态与原因。
源码：[scripts/dogfood/assessment-worker.mjs](../../../../../scripts/dogfood/assessment-worker.mjs)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assessment.mjs](assessment.mjs.md) | scripts/dogfood/assessment.mjs | 独立验收报告的校验与落盘：确认尝试证据已封存且未变更，逐项校验行动、交付物、前置条件、硬断言、四项评分与建议结论的证据引用，并渲染中文 Markdown 报告。 |
| [hosts.mjs](hosts.mjs.md) | scripts/dogfood/hosts.mjs | 宿主执行适配表：集中登记 codex、claude、opencode、oh-my-pi 的可执行文件、命令行拼装、流式事件解码、凭据路径与环境变量，并构造 bubblewrap 沙箱命令以只暴露必要运行时与本次证据。 |
| [lib.mjs](lib.mjs.md) | scripts/dogfood/lib.mjs | dogfooding harness 的共享基础库：campaign/attempt/assessment/matrix 目录解析与 ID 校验、原子 JSON 写入、场景目录加载与哈希校验、构建哈希、证据哈希、宿主选择解析与 fixture 前置条件校验。 |
