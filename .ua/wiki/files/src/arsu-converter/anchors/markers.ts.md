
# src/arsu-converter/anchors/markers.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors](../../../../modules/src/arsu-converter/anchors.md)
<!-- node: file:src/arsu-converter/anchors/markers.ts -->

运行时标记的单一事实源：校验锚点 ID 是否符合注册域格式，并生成包裹替换块的开闭 HTML 注释标记。
源码：[src/arsu-converter/anchors/markers.ts](../../../../../../src/arsu-converter/anchors/markers.ts)

## 符号（3）
<!-- node: function:src/arsu-converter/anchors/markers.ts:isAnchorId -->
<!-- node: function:src/arsu-converter/anchors/markers.ts:markerEnd -->
<!-- node: function:src/arsu-converter/anchors/markers.ts:markerStart -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| isAnchorId | 函数 | 3–5 | 简单 | validation、utility、contract-anchor、naming-convention | 0 | 用 ANCHOR_ID_PATTERN 判断锚点 ID 是否属于十个已注册契约域且为三位数字编号。 |
| markerEnd | 函数 | 11–13 | 简单 | marker、utility、contract-anchor、serialization | 0 | 生成 `<!--/rs:<anchor-id>-->` 闭标记，与开标记成对使用以界定替换块的终点。 |
| markerStart | 函数 | 7–9 | 简单 | marker、utility、contract-anchor、serialization | 0 | 生成 `<!--rs:<anchor-id>-->` 开标记，替换阶段用它界定受保护块的起点。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [types.ts](types.ts.md) | src/arsu-converter/anchors/types.ts | 契约锚点领域的类型与常量定义：固定 v4 替换 profile ID、锚点 ID 命名规则、可替换/诊断两类锚点的判别联合，以及覆盖决策、匹配记录与替换计划的数据结构。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [check.ts](check.ts.md) | src/arsu-converter/anchors/check.ts | 契约锚点资产的静态校验入口：读取 contract-anchors.json 与 upstream-manifest.json，校验锚点 ID 格式、替换正文完整性、匹配提示命中、替换边界、覆盖决策与上游清单漂移，并输出可由 CLI 直接消费的错误与告警列表。 |
| [replace.ts](replace.ts.md) | src/arsu-converter/anchors/replace.ts | 锚点与运行时策略的联合替换执行器：把两类重写区间按逆序合并应用以保持偏移有效，为锚点替换包裹 rs 标记、保留原有行尾风格，并回写替换后指纹与输出路径。 |
| [validate.ts](../validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| isAnchorId | 函数 | 3–5 | 用 ANCHOR_ID_PATTERN 判断锚点 ID 是否属于十个已注册契约域且为三位数字编号。 |
| markerEnd | 函数 | 11–13 | 生成 `<!--/rs:<anchor-id>-->` 闭标记，与开标记成对使用以界定替换块的终点。 |
| markerStart | 函数 | 7–9 | 生成 `<!--rs:<anchor-id>-->` 开标记，替换阶段用它界定受保护块的起点。 |
