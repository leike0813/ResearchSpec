
# website
> 目录聚合页：5 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [website/docusaurus.config.ts](../files/website/docusaurus.config.ts.md) | 文件 | 0 | Docusaurus 3 站点主配置：定义站点标题、GitHub Pages 地址、en/zh-Hans 双语 i18n、classic preset 与侧边栏路径，并把 CLI 侧边栏导入进来。链接策略上对断链直接抛错，站点禁用博客、只保留文档路由。 |
| [website/package.json](../files/website/package.json.md) | 配置 | 0 | Docusaurus 3.7 文档站的包定义：固定 start/build/deploy/serve/typecheck 脚本、React 18 与 preset-classic 依赖，以及生产与开发两套 browserslist。 |
| [website/sidebars.cli.ts](../files/website/sidebars.cli.ts.md) | 文件 | 0 | 由 typed CLI catalog 生成的 CLI 参考侧边栏数据，按 Bootstrap、Control plane、Inspection、Recovery、Context、Governance、Domain Skills 七组列出全部子页面 id。文件头明确标注为生成产物，禁止手工编辑。 |
| [website/sidebars.ts](../files/website/sidebars.ts.md) | 文件 | 0 | 文档站根侧边栏配置：串起 index、quick-start、installation，并内嵌生成的 CLI Reference 分类，另含 Guides、Reference 两个分类与 FAQ。 |
| [website/tsconfig.json](../files/website/tsconfig.json.md) | 配置 | 0 | 文档站的 TypeScript 配置：继承 @docusaurus/tsconfig 并把 baseUrl 设为站点根目录。 |

## 子目录
- [docs/cli](website/docs/cli.md)、[docs/guides](website/docs/guides.md)、[docs/reference](website/docs/reference.md)、[i18n/zh-Hans/docusaurus-plugin-content-docs/current/guides](website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/guides.md)、[src/css](website/src/css.md)、[static](website/static.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [website/src/css](website/src/css.md) | 1 |
