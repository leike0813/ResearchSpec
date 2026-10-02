
# tsconfig.build.json
所属分层：[维护工具链与工程基础设施](../layers/tooling.md)  
所属目录：[.](../modules/index.md)
<!-- node: config:tsconfig.build.json -->

发布构建配置：在基础配置上开启 emit，输出到 dist 并生成 .d.ts 声明，只编译 src 以保持发布包干净。
源码：[tsconfig.build.json](../../../tsconfig.build.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [bin.ts](src/cli/bin.ts.md) | src/cli/bin.ts | CLI 可执行入口，调用 main 并把结果退出码写入 process.exitCode。 |
