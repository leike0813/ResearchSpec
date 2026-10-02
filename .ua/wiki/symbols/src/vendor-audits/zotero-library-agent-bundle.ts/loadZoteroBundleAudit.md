
# loadZoteroBundleAudit
<!-- node: function:src/vendor-audits/zotero-library-agent-bundle.ts:loadZoteroBundleAudit -->

从固定发布集路径读取并按契约解析 Zotero Bundle 审计 JSON。
类型：函数  
复杂度：简单  
入边数：2  
标签：vendor-audit、loading、validation  
所属文件：[src/vendor-audits/zotero-library-agent-bundle.ts](../../../../files/src/vendor-audits/zotero-library-agent-bundle.ts.md)
源码：[src/vendor-audits/zotero-library-agent-bundle.ts:186](../../../../../../src/vendor-audits/zotero-library-agent-bundle.ts#L186)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [checkZoteroBundleAudit](checkZoteroBundleAudit.md) | src/vendor-audits/zotero-library-agent-bundle.ts:190–227 | 执行离线审计检查：确认发布集 ID 一致、文件清单有序、聚合哈希匹配，并可选校验上游 vendor 目录身份。 |
| [renderZoteroBundleAuditReport](../../../../files/src/vendor-audits/zotero-library-agent-bundle.ts.md) | src/vendor-audits/zotero-library-agent-bundle.ts:229–231 | 把已加载的审计结果渲染为可提交的 Markdown 报告正文。 |

## 调用

该符号没有记录对外调用。
