
# scripts/dogfood/hosts.mjs
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[scripts/dogfood](../../../modules/scripts/dogfood.md)
<!-- node: file:scripts/dogfood/hosts.mjs -->

宿主执行适配表：集中登记 codex、claude、opencode、oh-my-pi 的可执行文件、命令行拼装、流式事件解码、凭据路径与环境变量，并构造 bubblewrap 沙箱命令以只暴露必要运行时与本次证据。
源码：[scripts/dogfood/hosts.mjs](../../../../../scripts/dogfood/hosts.mjs)

## 符号（2）
<!-- node: function:scripts/dogfood/hosts.mjs:resolveBinary -->
<!-- node: function:scripts/dogfood/hosts.mjs:sandboxCommand -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| resolveBinary | 函数 | 63–70 | 简单 | utility、process、dogfooding | 0 | 在 PATH 中定位可执行文件，绝对路径需实际存在。 |
| [sandboxCommand](../../../symbols/scripts/dogfood/hosts.mjs/sandboxCommand.md) | 函数 | 74–128 | 复杂 | sandbox、security、adapter、isolation | 2 | 构造 bubblewrap 沙箱命令：tmpfs 覆盖家目录，仅暴露运行时、ResearchSpec 构建产物、宿主凭据与本次证据，并重写 HOME/PATH/XDG 环境。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [lib.mjs](lib.mjs.md) | scripts/dogfood/lib.mjs | dogfooding harness 的共享基础库：campaign/attempt/assessment/matrix 目录解析与 ID 校验、原子 JSON 写入、场景目录加载与哈希校验、构建哈希、证据哈希、宿主选择解析与 fixture 前置条件校验。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assessment-worker.mjs](assessment-worker.mjs.md) | scripts/dogfood/assessment-worker.mjs | 验收 worker 入口：组装场景、尝试与评分量表 packet，在 bubblewrap 沙箱内以只读证据目录驱动验收 Agent，读取其 assessment.json 并交回校验落盘，失败时写入状态与原因。 |
| [dogfood-harness.test.mjs](../../tests/dogfood-harness.test.mjs.md) | tests/dogfood-harness.test.mjs | dogfooding harness 的 node:test 用例：覆盖冻结场景目录校验、fixture 前置条件、宿主与模型选择、审阅服务接口与路径防护、人工 pass 门槛、验收报告证据绑定以及历史 campaign 只读约束。 |
| [dogfood.mjs](../dogfood.mjs.md) | scripts/dogfood.mjs | 维护者 dogfooding campaign 的协调器 CLI：按 plan/run/resume/retry/assess/serve/import-review/report/legacy-import 分发子命令，负责冻结场景目录与构建哈希、预检 bwrap 与宿主二进制、经 Orca 终端派发行为与验收 worker、并维护 campaign 锁与并发队列。 |
| [server.mjs](server.mjs.md) | scripts/dogfood/server.mjs | 本地只读审阅服务：暴露 campaign、场景、矩阵用例与会话证据的 JSON 接口及增量事件流，审阅写入需携带本地 token 并通过同源校验，静态资源取自 harness/dogfood/public。 |
| [worker.mjs](worker.mjs.md) | scripts/dogfood/worker.mjs | 单次行为尝试 worker：在临时工作区铺设 fixture、执行 init 与必要 start/advance、记录变更前后文件清单与 status/check 输出，随后在沙箱内驱动宿主 Agent 并把事件、变更文件与诊断结果封存为证据。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| resolveBinary | 函数 | 63–70 | 在 PATH 中定位可执行文件，绝对路径需实际存在。 |
| [sandboxCommand](../../../symbols/scripts/dogfood/hosts.mjs/sandboxCommand.md) | 函数 | 74–128 | 构造 bubblewrap 沙箱命令：tmpfs 覆盖家目录，仅暴露运行时、ResearchSpec 构建产物、宿主凭据与本次证据，并重写 HOME/PATH/XDG 环境。 |
