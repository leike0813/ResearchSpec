
# checkZoteroBundleAudit
<!-- node: function:src/vendor-audits/zotero-library-agent-bundle.ts:checkZoteroBundleAudit -->

执行离线审计检查：确认发布集 ID 一致、文件清单有序、聚合哈希匹配，并可选校验上游 vendor 目录身份。
类型：函数  
复杂度：中等  
入边数：2  
标签：vendor-audit、validation、integrity、hashing  
所属文件：[src/vendor-audits/zotero-library-agent-bundle.ts](../../../../files/src/vendor-audits/zotero-library-agent-bundle.ts.md)
源码：[src/vendor-audits/zotero-library-agent-bundle.ts:190](../../../../../../src/vendor-audits/zotero-library-agent-bundle.ts#L190)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [checkZoteroOutput](../../../../files/src/vendor-converters/zotero-library-agent-bundle/converter.ts.md) | src/vendor-converters/zotero-library-agent-bundle/converter.ts:68–84 | 校验已生成的适配包是否与转换清单逐文件一致，报告缺失、多余或哈希不符的文件。 |
| [convertZoteroBundle](../../../../files/src/vendor-converters/zotero-library-agent-bundle/converter.ts.md) | src/vendor-converters/zotero-library-agent-bundle/converter.ts:46–66 | 执行完整转换：先跑不可变审计作为前置门禁，再生成 Zotero 适配包并写出转换清单，支持 dry-run 与 force 覆盖。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [loadZoteroBundleAudit](loadZoteroBundleAudit.md) | src/vendor-audits/zotero-library-agent-bundle.ts:186–188 | 从固定发布集路径读取并按契约解析 Zotero Bundle 审计 JSON。 |
| [validateUpstreamIdentity](../../../../files/src/vendor-audits/zotero-library-agent-bundle.ts.md) | src/vendor-audits/zotero-library-agent-bundle.ts:233–267 | 在 vendor 检出目录中核对上游提交与文件树聚合哈希，确认审计对应的正是被审核的那一份上游字节。 |
