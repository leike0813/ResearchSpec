
# src/vendor-audits/zotero-library-agent-bundle.ts
所属分层：[厂商 Skill 转换与审计层](../../../layers/vendor-converters.md)  
所属目录：[src/vendor-audits](../../../modules/src/vendor-audits.md)
<!-- node: file:src/vendor-audits/zotero-library-agent-bundle.ts -->

Zotero Library Agent Bundle 的不可变审计 SSOT：定义审计 JSON 契约、固定发布集 ID 与路径常量，并校验上游身份、文件哈希与排序一致性。
源码：[src/vendor-audits/zotero-library-agent-bundle.ts](../../../../../src/vendor-audits/zotero-library-agent-bundle.ts)

## 符号（4）
<!-- node: function:src/vendor-audits/zotero-library-agent-bundle.ts:checkZoteroBundleAudit -->
<!-- node: function:src/vendor-audits/zotero-library-agent-bundle.ts:loadZoteroBundleAudit -->
<!-- node: function:src/vendor-audits/zotero-library-agent-bundle.ts:renderZoteroBundleAuditReport -->
<!-- node: function:src/vendor-audits/zotero-library-agent-bundle.ts:validateUpstreamIdentity -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [checkZoteroBundleAudit](../../../symbols/src/vendor-audits/zotero-library-agent-bundle.ts/checkZoteroBundleAudit.md) | 函数 | 190–227 | 中等 | vendor-audit、validation、integrity、hashing | 2 | 执行离线审计检查：确认发布集 ID 一致、文件清单有序、聚合哈希匹配，并可选校验上游 vendor 目录身份。 |
| [loadZoteroBundleAudit](../../../symbols/src/vendor-audits/zotero-library-agent-bundle.ts/loadZoteroBundleAudit.md) | 函数 | 186–188 | 简单 | vendor-audit、loading、validation | 2 | 从固定发布集路径读取并按契约解析 Zotero Bundle 审计 JSON。 |
| renderZoteroBundleAuditReport | 函数 | 229–231 | 简单 | vendor-audit、rendering、documentation | 0 | 把已加载的审计结果渲染为可提交的 Markdown 报告正文。 |
| validateUpstreamIdentity | 函数 | 233–267 | 中等 | vendor-audit、validation、hashing、provenance | 1 | 在 vendor 检出目录中核对上游提交与文件树聚合哈希，确认审计对应的正是被审核的那一份上游字节。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](../literature-adapters/contracts.ts.md) | src/literature-adapters/contracts.ts | 文献 Adapter 的 Zod 契约层：约束 Skill 角色、可见性、权限边界与已审能力枚举，并校验目录中硬依赖不构成环。 |
| [write-plan.ts](../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](../vendor-converters/zotero-library-agent-bundle/cli.ts.md) | src/vendor-converters/zotero-library-agent-bundle/cli.ts | Zotero Bundle 转换器的维护者 CLI 入口，向上查找仓库根并分派 generate、check 与 idempotence 三个维护命令。 |
| [converter.ts](../vendor-converters/zotero-library-agent-bundle/converter.ts.md) | src/vendor-converters/zotero-library-agent-bundle/converter.ts | 把 vendor 的 Zotero Bundle 转换为 `literature-adapters/zotero` 下的发布包，产出转换清单、Skill 树与派生说明，并提供输出检查与幂等性检查。 |
| [zotero-adapter-converter.test.ts](../../tests/zotero-adapter-converter.test.ts.md) | tests/zotero-adapter-converter.test.ts | Zotero Adapter 转换链的集成测试：运行不可变审计、转换、输出检查与幂等性检查，并核对生成树的文件清单与哈希。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [checkZoteroBundleAudit](../../../symbols/src/vendor-audits/zotero-library-agent-bundle.ts/checkZoteroBundleAudit.md) | 函数 | 190–227 | 执行离线审计检查：确认发布集 ID 一致、文件清单有序、聚合哈希匹配，并可选校验上游 vendor 目录身份。 |
| [loadZoteroBundleAudit](../../../symbols/src/vendor-audits/zotero-library-agent-bundle.ts/loadZoteroBundleAudit.md) | 函数 | 186–188 | 从固定发布集路径读取并按契约解析 Zotero Bundle 审计 JSON。 |
| renderZoteroBundleAuditReport | 函数 | 229–231 | 把已加载的审计结果渲染为可提交的 Markdown 报告正文。 |
