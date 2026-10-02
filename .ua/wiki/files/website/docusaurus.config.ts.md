
# website/docusaurus.config.ts
所属分层：[文档与文档站层](../../layers/documentation.md)  
所属目录：[website](../../modules/website.md)
<!-- node: file:website/docusaurus.config.ts -->

Docusaurus 3 站点主配置：定义站点标题、GitHub Pages 地址、en/zh-Hans 双语 i18n、classic preset 与侧边栏路径，并把 CLI 侧边栏导入进来。链接策略上对断链直接抛错，站点禁用博客、只保留文档路由。
源码：[website/docusaurus.config.ts](../../../../website/docusaurus.config.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [sidebars.cli.ts](sidebars.cli.ts.md) | website/sidebars.cli.ts | 由 typed CLI catalog 生成的 CLI 参考侧边栏数据，按 Bootstrap、Control plane、Inspection、Recovery、Context、Governance、Domain Skills 七组列出全部子页面 id。文件头明确标注为生成产物，禁止手工编辑。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [sidebars.ts](sidebars.ts.md) | website/sidebars.ts | 文档站根侧边栏配置：串起 index、quick-start、installation，并内嵌生成的 CLI Reference 分类，另含 Guides、Reference 两个分类与 FAQ。 |
