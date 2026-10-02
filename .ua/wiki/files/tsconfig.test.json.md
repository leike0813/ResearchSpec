
# tsconfig.test.json
所属分层：[维护工具链与工程基础设施](../layers/tooling.md)  
所属目录：[.](../modules/index.md)
<!-- node: config:tsconfig.test.json -->

测试编译配置：把 src、tests、harness 一并编译到 .test-dist，关闭声明与 sourcemap 以缩短测试启动时间。
源码：[tsconfig.test.json](../../../tsconfig.test.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adapters.test.ts](tests/adapters.test.ts.md) | tests/adapters.test.ts | 验证 36 个工具与 28 个命令包装器的注册表完整性、每工具路径约定、Companion 四个自包含 Skill 的渲染，以及 Navigate 单一入口在各交付模式下的投影。 |
