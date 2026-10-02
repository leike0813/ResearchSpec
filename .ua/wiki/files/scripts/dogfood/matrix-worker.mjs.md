
# scripts/dogfood/matrix-worker.mjs
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[scripts/dogfood](../../../modules/scripts/dogfood.md)
<!-- node: file:scripts/dogfood/matrix-worker.mjs -->

init 投影矩阵 worker：对单个 (target, delivery mode) 执行 init/status/check，比对安装清单中的 Navigate Skill、命令包装、项目入口规则与两个托管 profile，并校验 Procedure 的 list/show/instructions 可发现性。
源码：[scripts/dogfood/matrix-worker.mjs](../../../../../scripts/dogfood/matrix-worker.mjs)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [lib.mjs](lib.mjs.md) | scripts/dogfood/lib.mjs | dogfooding harness 的共享基础库：campaign/attempt/assessment/matrix 目录解析与 ID 校验、原子 JSON 写入、场景目录加载与哈希校验、构建哈希、证据哈希、宿主选择解析与 fixture 前置条件校验。 |
