
# .github/workflows/docs.yml
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[.github/workflows](../../../modules/.github/workflows.md)
<!-- node: pipeline:.github/workflows/docs.yml -->

文档站流水线：仅在 CLI catalog、handbook、website/ 或文档生成脚本变化时触发，先跑 docs:check 与 Docusaurus build 校验，再在 main 分支把 website/build 上传并部署到 GitHub Pages。
源码：[.github/workflows/docs.yml](../../../../../.github/workflows/docs.yml)
