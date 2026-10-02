
# scripts/dogfood/worker.mjs
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[scripts/dogfood](../../../modules/scripts/dogfood.md)
<!-- node: file:scripts/dogfood/worker.mjs -->

单次行为尝试 worker：在临时工作区铺设 fixture、执行 init 与必要 start/advance、记录变更前后文件清单与 status/check 输出，随后在沙箱内驱动宿主 Agent 并把事件、变更文件与诊断结果封存为证据。
源码：[scripts/dogfood/worker.mjs](../../../../../scripts/dogfood/worker.mjs)

## 符号（6）
<!-- node: function:scripts/dogfood/worker.mjs:hostRun -->
<!-- node: function:scripts/dogfood/worker.mjs:inventory -->
<!-- node: function:scripts/dogfood/worker.mjs:stageGraph -->
<!-- node: function:scripts/dogfood/worker.mjs:stageNotes -->
<!-- node: function:scripts/dogfood/worker.mjs:stageScenario -->
<!-- node: function:scripts/dogfood/worker.mjs:validateRunPrecedenceFixture -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| hostRun | 函数 | 132–173 | 中等 | agent-execution、stream-processing、evidence-capture | 0 | 在 bubblewrap 沙箱内驱动宿主 Agent 流式执行，按适配器解码事件、记录有意义的行动与观测模型，并处理超时与协议失败。 |
| inventory | 函数 | 30–44 | 简单 | filesystem、hashing、snapshot | 0 | 递归记录工作区文件的大小、SHA-256 与符号链接目标，构成变更前后的对照基线。 |
| stageGraph | 函数 | 65–97 | 中等 | fixture-staging、cli、graph-workflow | 0 | 为需要图工作流的场景通过 CLI instructions/start/advance 铺设最小或学术流水线运行，并返回入口必需输出角色。 |
| stageNotes | 函数 | 52–64 | 简单 | fixture-staging、scenario、dogfooding | 0 | 按场景铺设 work/researchspec-notes 下的普通任务笔记，区分歧义、材料变化与 run 优先级等变体。 |
| stageScenario | 函数 | 111–125 | 简单 | fixture-staging、validation、dogfooding | 0 | 按场景声明校验首次检索结果与 Procedure 串接输入，满足后才允许宿主开始行为测试。 |
| validateRunPrecedenceFixture | 函数 | 98–110 | 简单 | validation、fixture-precondition、dogfooding | 0 | 校验 run 优先级 fixture：项目意图、笔记中的 run 选择器、入口输出角色与 status 中的可运行前沿必须一致。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [hosts.mjs](hosts.mjs.md) | scripts/dogfood/hosts.mjs | 宿主执行适配表：集中登记 codex、claude、opencode、oh-my-pi 的可执行文件、命令行拼装、流式事件解码、凭据路径与环境变量，并构造 bubblewrap 沙箱命令以只暴露必要运行时与本次证据。 |
| [lib.mjs](lib.mjs.md) | scripts/dogfood/lib.mjs | dogfooding harness 的共享基础库：campaign/attempt/assessment/matrix 目录解析与 ID 校验、原子 JSON 写入、场景目录加载与哈希校验、构建哈希、证据哈希、宿主选择解析与 fixture 前置条件校验。 |
