
# tests/arsu-anchors.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/arsu-anchors.test.ts -->

anchor 资产测试：校验 contract-anchors.json 对上游 vendored 文件仍然有效、可替换 anchor 声明了当前 owner 且不含旧控制权路径，并确认上游 manifest 把来源观察与现行替换策略分离。
源码：[tests/arsu-anchors.test.ts](../../../../tests/arsu-anchors.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [check.ts](../src/arsu-converter/anchors/check.ts.md) | src/arsu-converter/anchors/check.ts | 契约锚点资产的静态校验入口：读取 contract-anchors.json 与 upstream-manifest.json，校验锚点 ID 格式、替换正文完整性、匹配提示命中、替换边界、覆盖决策与上游清单漂移，并输出可由 CLI 直接消费的错误与告警列表。 |
| [coverage.ts](../src/arsu-converter/anchors/coverage.ts.md) | src/arsu-converter/anchors/coverage.ts | 覆盖缺口检测：对每个可替换锚点检查是否声明 ResearchSpec 归属目标、正文是否真的提到这些目标，并用一组遗留权威模式（Material Passport、旧 ledger 路径等）拦截过时契约文本。 |
| [manifest.ts](../src/arsu-converter/anchors/manifest.ts.md) | src/arsu-converter/anchors/manifest.ts | 上游审计清单的生成与数据结构定义：声明受审计的根目录与契约风险关键词，扫描 vendor/ars 为每个文件记录归一化哈希、frontmatter、标题树和风险命中，并固定锚点资产路径常量。 |
| [match.ts](../src/arsu-converter/anchors/match.ts.md) | src/arsu-converter/anchors/match.ts | 契约锚点匹配与替换计划的核心：先校验全部替换正文再逐锚点定位真实区间，检测同源文件内的区间重叠，产出带 before/after 指纹的 AnchorReplacementPlan，任何阻塞失败都在写入生成产物之前抛错。 |
| [types.ts](../src/arsu-converter/anchors/types.ts.md) | src/arsu-converter/anchors/types.ts | 契约锚点领域的类型与常量定义：固定 v4 替换 profile ID、锚点 ID 命名规则、可替换/诊断两类锚点的判别联合，以及覆盖决策、匹配记录与替换计划的数据结构。 |
