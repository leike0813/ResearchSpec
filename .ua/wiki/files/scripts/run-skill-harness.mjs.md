
# scripts/run-skill-harness.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/run-skill-harness.mjs -->

先用 tsc 编译 harness 源码到 .harness-dist，再按参数启动只读本地服务，或在 --review-workspace 模式下生成审阅工作台预览页并可选打开浏览器。
源码：[scripts/run-skill-harness.mjs](../../../../scripts/run-skill-harness.mjs)

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [server.ts](../harness/server.ts.md) | harness/server.ts | 只读的本地 Node HTTP 服务，把 harness 目录以 JSON API 与 Markdown 预览形式提供给浏览器，并附带严格的安全响应头。 |
