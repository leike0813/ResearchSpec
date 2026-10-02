
# src/vendor-converters/histagent/source-evidence.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/histagent](../../../../modules/src/vendor-converters/histagent.md)
<!-- node: config:src/vendor-converters/histagent/source-evidence.json -->

HistAgent 上游来源证据：为 5 个被归属到 Microsoft AutoGen / Magentic-One 的脚本逐个记录固定 revision、官方路径、官方文件 sha256、声称符号、匹配结论与生产动作，全部落在 independent-reimplementation 上。
源码：[src/vendor-converters/histagent/source-evidence.json](../../../../../../src/vendor-converters/histagent/source-evidence.json)
<!-- node: resource:src/vendor-converters/histagent/source-evidence.json:agent-web-browser -->

来源证据：agent_web_browser.py 归属 autogen/browser_utils.py，声称符号 BrowserAgent 与 BrowserTool 在该文件内未找到（not-found-in-attributed-file），因此只能独立重写。
源码：[src/vendor-converters/histagent/source-evidence.json](../../../../../../src/vendor-converters/histagent/source-evidence.json)
<!-- node: resource:src/vendor-converters/histagent/source-evidence.json:image-web-browser -->

来源证据：image_web_browser.py 的 SimpleImageBrowser 在归属文件 autogen/browser_utils.py 中未找到，结论为独立重写。
源码：[src/vendor-converters/histagent/source-evidence.json](../../../../../../src/vendor-converters/histagent/source-evidence.json)
<!-- node: resource:src/vendor-converters/histagent/source-evidence.json:mdconvert -->

来源证据：mdconvert.py 归属 autogen_magentic_one 的 markdown_browser/mdconvert.py（另一 revision），MarkdownConverter 匹配为 attributed-baseline-confirmed，但仍按独立重写处理。
源码：[src/vendor-converters/histagent/source-evidence.json](../../../../../../src/vendor-converters/histagent/source-evidence.json)
<!-- node: resource:src/vendor-converters/histagent/source-evidence.json:reformulator -->

来源证据：reformulator.py 归属 GAIA Orchestrator 场景模板中的 response_preparer，匹配结论为 functional-origin-confirmed（功能来源可追溯，但实现仍独立重写）。
源码：[src/vendor-converters/histagent/source-evidence.json](../../../../../../src/vendor-converters/histagent/source-evidence.json)
<!-- node: resource:src/vendor-converters/histagent/source-evidence.json:text-web-browser -->

来源证据：text_web_browser.py 的 SimpleTextBrowser 在 autogen/browser_utils.py 中匹配为 attributed-baseline-confirmed，生产动作为独立重写。
源码：[src/vendor-converters/histagent/source-evidence.json](../../../../../../src/vendor-converters/histagent/source-evidence.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/histagent/converter.ts | HistAgent 转换主流程：在临时暂存区生成三个 Skill 树、vendor bundle 与转换清单，装配中央注册表，并提供生成物检查与幂等性校验。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/histagent/policy.ts | HistAgent 生产策略：固定 release/revision/audit 哈希，声明 120 条源条目、31 个知识面、21 项能力映射与三个 Skill 契约的条目数量。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [production-policy.json](production-policy.json.md) | src/vendor-converters/histagent/production-policy.json | HistAgent 生产策略 SSOT：在 snapshot-47bbe21 审计基线上，把 120 个源条目、31 个知识面、5 个内容来源、4 条许可声明、10 项运行时权威、16 个外部资源、10 条安全发现与 3 个候选 Skill 逐条映射为 excluded / retained-evidence / independent-reimplementation，并附带 21 项能力面映射与 3 份 Skill 契约。 |
