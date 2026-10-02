
# tsconfig.harness.json
所属分层：[维护工具链与工程基础设施](../layers/tooling.md)  
所属目录：[.](../modules/index.md)
<!-- node: config:tsconfig.harness.json -->

维护者 dogfood harness 的编译配置：编译 src 与 harness 到 .harness-dist，排除 tests，让 harness 可独立启动本地预览与验收。
源码：[tsconfig.harness.json](../../../tsconfig.harness.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [server.ts](harness/server.ts.md) | harness/server.ts | 只读的本地 Node HTTP 服务，把 harness 目录以 JSON API 与 Markdown 预览形式提供给浏览器，并附带严格的安全响应头。 |
