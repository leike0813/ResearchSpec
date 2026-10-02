
# website/package.json
所属分层：[文档与文档站层](../../layers/documentation.md)  
所属目录：[website](../../modules/website.md)
<!-- node: config:website/package.json -->

Docusaurus 3.7 文档站的包定义：固定 start/build/deploy/serve/typecheck 脚本、React 18 与 preset-classic 依赖，以及生产与开发两套 browserslist。
源码：[website/package.json](../../../../website/package.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [custom.css](src/css/custom.css.md) | website/src/css/custom.css | 站点主题覆盖样式：定义浅色与深色两套 Docusaurus 主色变量、代码字号和高亮行背景色。 |
| [docusaurus.config.ts](docusaurus.config.ts.md) | website/docusaurus.config.ts | Docusaurus 3 站点主配置：定义站点标题、GitHub Pages 地址、en/zh-Hans 双语 i18n、classic preset 与侧边栏路径，并把 CLI 侧边栏导入进来。链接策略上对断链直接抛错，站点禁用博客、只保留文档路由。 |
