
# scripts/generate-cli-handbook.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/generate-cli-handbook.mjs -->

调用编译产物的 renderCliHandbook 生成或校验 docs/user/cli-handbook.md，--check 模式下逐字节比对以防文档漂移。
源码：[scripts/generate-cli-handbook.mjs](../../../../scripts/generate-cli-handbook.mjs)

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [handbook.ts](../src/cli/handbook.ts.md) | src/cli/handbook.ts | 从 CLI 命令目录与控制选择器家族派生出 CLI 手册的 Markdown、MDX 命令页与侧边栏，是 CLI 参考文档的 canonical renderer。 |
