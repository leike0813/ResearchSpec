
# .github/workflows/ci.yml
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[.github/workflows](../../../modules/.github/workflows.md)
<!-- node: pipeline:.github/workflows/ci.yml -->

PR 与 main 推送触发的验证流水线，在 ubuntu/macOS/windows × Node 22/24 的 6 组矩阵中安装锁定依赖后运行测试、lint、类型检查、ARSU 转换器 check 与幂等性、固定 Zotero 适配器 check 与幂等性、可安装包校验，并最终用 OpenSpec 严格模式校验 specs。
源码：[.github/workflows/ci.yml](../../../../../.github/workflows/ci.yml)
