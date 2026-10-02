
# tsconfig.json
所属分层：[维护工具链与工程基础设施](../layers/tooling.md)  
所属目录：[.](../modules/index.md)
<!-- node: config:tsconfig.json -->

TypeScript 基础配置：ES2022 + NodeNext 模块与解析、strict 全开、skipLibCheck 关闭、noEmit 仅做类型检查，覆盖 src、tests 与 harness。
源码：[tsconfig.json](../../../tsconfig.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [bin.ts](src/cli/bin.ts.md) | src/cli/bin.ts | CLI 可执行入口，调用 main 并把结果退出码写入 process.exitCode。 |
