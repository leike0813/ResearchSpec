
# scripts/generate-docs.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/generate-docs.mjs -->

文档生成入口：先断言 CLI 恰好暴露 16 个顶层命令，再从类型化目录渲染 CLI 手册、Agent 入口矩阵、website 命令页与侧边栏，支持 --check 只校验。
源码：[scripts/generate-docs.mjs](../../../../scripts/generate-docs.mjs)

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [command-catalog.ts](../src/cli/command-catalog.ts.md) | src/cli/command-catalog.ts | CLI 命令目录 SSOT：声明 16 个顶层命令与 5 个 plugin 子命令的语法、分组、工作区要求、读写影响与选项，并据此注册 Commander 命令与帮助文本。 |
| [handbook.ts](../src/cli/handbook.ts.md) | src/cli/handbook.ts | 从 CLI 命令目录与控制选择器家族派生出 CLI 手册的 Markdown、MDX 命令页与侧边栏，是 CLI 参考文档的 canonical renderer。 |
| [project-entry-matrix.ts](../src/adapters/project-entry-matrix.ts.md) | src/adapters/project-entry-matrix.ts | 从工具目录渲染《Agent 项目入口矩阵》Markdown 表格，逐宿主列出入口机制、路径、官方文档依据与限制。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [generate-cli-handbook.mjs](generate-cli-handbook.mjs.md) | scripts/generate-cli-handbook.mjs | 调用编译产物的 renderCliHandbook 生成或校验 docs/user/cli-handbook.md，--check 模式下逐字节比对以防文档漂移。 |
