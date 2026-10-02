
# .github/workflows
> 目录聚合页：2 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [.github/workflows/ci.yml](../../files/.github/workflows/ci.yml.md) | pipeline | 0 | PR 与 main 推送触发的验证流水线，在 ubuntu/macOS/windows × Node 22/24 的 6 组矩阵中安装锁定依赖后运行测试、lint、类型检查、ARSU 转换器 check 与幂等性、固定 Zotero 适配器 check 与幂等性、可安装包校验，并最终用 OpenSpec 严格模式校验 specs。 |
| [.github/workflows/docs.yml](../../files/.github/workflows/docs.yml.md) | pipeline | 0 | 文档站流水线：仅在 CLI catalog、handbook、website/ 或文档生成脚本变化时触发，先跑 docs:check 与 Docusaurus build 校验，再在 main 分支把 website/build 上传并部署到 GitHub Pages。 |
