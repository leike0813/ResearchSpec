
# scripts/mark-cli-executable.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/mark-cli-executable.mjs -->

构建收尾脚本，把 dist/src/cli/bin.js 权限置为 0755，保证 npm 分发的 CLI 可直接执行。
源码：[scripts/mark-cli-executable.mjs](../../../../scripts/mark-cli-executable.mjs)

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [bin.ts](../src/cli/bin.ts.md) | src/cli/bin.ts | CLI 可执行入口，调用 main 并把结果退出码写入 process.exitCode。 |
