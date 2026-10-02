
# scripts/generate-arsu-capability-review-html.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/generate-arsu-capability-review-html.mjs -->

ARSU 模式能力审阅 HTML 生成器：枚举 vendor/ars 的 SKILL、agent、reference、template 文档与转换后的能力包，按 mode 生成可折叠审阅页面。
源码：[scripts/generate-arsu-capability-review-html.mjs](../../../../scripts/generate-arsu-capability-review-html.mjs)

## 符号（3）
<!-- node: function:scripts/generate-arsu-capability-review-html.mjs:capabilityCard -->
<!-- node: function:scripts/generate-arsu-capability-review-html.mjs:convertedSection -->
<!-- node: function:scripts/generate-arsu-capability-review-html.mjs:modePanel -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| capabilityCard | 函数 | 590–618 | 中等 | html-渲染、能力包、卡片 | 0 | 渲染单个能力包卡片，含名称、路由、来源与文件清单。 |
| convertedSection | 函数 | 620–651 | 中等 | html-渲染、转换对照、审阅 | 0 | 生成上游文档与转换后文档的并排对照区块，标注保留、适配或未采纳的差异。 |
| modePanel | 函数 | 653–686 | 中等 | html-渲染、模式、聚合 | 0 | 按 mode 汇总应审阅的文档集合、各类文档计数与转换后能力，输出一个折叠面板。 |
