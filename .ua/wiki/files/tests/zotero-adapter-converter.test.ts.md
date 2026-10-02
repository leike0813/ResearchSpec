
# tests/zotero-adapter-converter.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/zotero-adapter-converter.test.ts -->

Zotero Adapter 转换链的集成测试：运行不可变审计、转换、输出检查与幂等性检查，并核对生成树的文件清单与哈希。
源码：[tests/zotero-adapter-converter.test.ts](../../../../tests/zotero-adapter-converter.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](../src/vendor-converters/zotero-library-agent-bundle/converter.ts.md) | src/vendor-converters/zotero-library-agent-bundle/converter.ts | 把 vendor 的 Zotero Bundle 转换为 `literature-adapters/zotero` 下的发布包，产出转换清单、Skill 树与派生说明，并提供输出检查与幂等性检查。 |
| [write-plan.ts](../src/core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |
| [zotero-library-agent-bundle.ts](../src/vendor-audits/zotero-library-agent-bundle.ts.md) | src/vendor-audits/zotero-library-agent-bundle.ts | Zotero Library Agent Bundle 的不可变审计 SSOT：定义审计 JSON 契约、固定发布集 ID 与路径常量，并校验上游身份、文件哈希与排序一致性。 |
