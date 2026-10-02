
# scripts/generate-extraction-index.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/generate-extraction-index.mjs -->

从 authoring/ars 的里程碑审阅笔记与 vendor/ars 上游文件生成 extraction-index.json，逐制品记录 id、来源路径与 SHA-256，并支持 --check 只校验。
源码：[scripts/generate-extraction-index.mjs](../../../../scripts/generate-extraction-index.mjs)

## 符号（5）
<!-- node: function:scripts/generate-extraction-index.mjs:buildIndex -->
<!-- node: function:scripts/generate-extraction-index.mjs:collectArtifacts -->
<!-- node: function:scripts/generate-extraction-index.mjs:parseHeader -->
<!-- node: function:scripts/generate-extraction-index.mjs:parseUpstreamSource -->
<!-- node: function:scripts/generate-extraction-index.mjs:verifyArtifact -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| buildIndex | 函数 | 149–177 | 中等 | 生成器、索引输出、抽取索引 | 0 | 汇总制品、上游 commit 与里程碑统计，序列化写入 extraction-index.json 或在 --check 下比对。 |
| collectArtifacts | 函数 | 109–147 | 中等 | 目录扫描、抽取索引、收集 | 0 | 递归扫描各里程碑笔记目录，收集并验证所有制品条目及其去重后的 id 集合。 |
| parseHeader | 函数 | 31–59 | 中等 | 解析、frontmatter、抽取索引 | 0 | 解析审阅笔记的 YAML frontmatter，提取 artifact id、来源与判定字段。 |
| parseUpstreamSource | 函数 | 67–81 | 简单 | 解析、上游来源、抽取索引 | 0 | 从 frontmatter 的 source 字段解析上游相对路径与制品类别。 |
| verifyArtifact | 函数 | 83–107 | 中等 | 哈希校验、抽取索引、审计证据 | 0 | 重算上游制品的 SHA-256 并与笔记记录比对，不一致时拒绝纳入索引。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [audit-capability-parity.mjs](audit-capability-parity.mjs.md) | scripts/audit-capability-parity.mjs | 能力包与上游抽取产物的对齐审计：按 provenance 选择 extraction-index，解析上游标题与规则，判定哪些规则在能力包文档中有覆盖并写出对齐报告。 |
