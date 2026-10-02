
# scripts/authored-whitespace-exemptions.json
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: config:scripts/authored-whitespace-exemptions.json -->

行尾空白检查的豁免目录，为每个字节保持不变的上游资产记录 sha256 与其在 authoring 抽取索引中的 artifact_id 证据。
源码：[scripts/authored-whitespace-exemptions.json](../../../../scripts/authored-whitespace-exemptions.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [check-authored-whitespace.mjs](check-authored-whitespace.mjs.md) | scripts/check-authored-whitespace.mjs | 行尾空白守卫：默认取 git 变更路径，加载并校验豁免目录的 sha256，跳过二进制与生成的保留 Skill，对 UTF-8 文本逐行报告尾随空白。 |
