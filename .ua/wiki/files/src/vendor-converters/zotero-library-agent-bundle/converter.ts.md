
# src/vendor-converters/zotero-library-agent-bundle/converter.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/zotero-library-agent-bundle](../../../../modules/src/vendor-converters/zotero-library-agent-bundle.md)
<!-- node: file:src/vendor-converters/zotero-library-agent-bundle/converter.ts -->

把 vendor 的 Zotero Bundle 转换为 `literature-adapters/zotero` 下的发布包，产出转换清单、Skill 树与派生说明，并提供输出检查与幂等性检查。
源码：[src/vendor-converters/zotero-library-agent-bundle/converter.ts](../../../../../../src/vendor-converters/zotero-library-agent-bundle/converter.ts)

## 符号（7）
<!-- node: function:src/vendor-converters/zotero-library-agent-bundle/converter.ts:adaptIncludedFile -->
<!-- node: function:src/vendor-converters/zotero-library-agent-bundle/converter.ts:checkZoteroIdempotence -->
<!-- node: function:src/vendor-converters/zotero-library-agent-bundle/converter.ts:checkZoteroOutput -->
<!-- node: function:src/vendor-converters/zotero-library-agent-bundle/converter.ts:convertZoteroBundle -->
<!-- node: function:src/vendor-converters/zotero-library-agent-bundle/converter.ts:directoryDiff -->
<!-- node: function:src/vendor-converters/zotero-library-agent-bundle/converter.ts:generateZoteroTree -->
<!-- node: function:src/vendor-converters/zotero-library-agent-bundle/converter.ts:renderDerivation -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| adaptIncludedFile | 函数 | 154–170 | 简单 | converter、adaptation、file-handling | 1 | 按审计准入决定把单个上游文件原样复制或按适配规则改写，并保留其可执行位与相对路径。 |
| checkZoteroIdempotence | 函数 | 86–101 | 简单 | converter、idempotence、validation、regression | 0 | 在临时目录重跑转换并与当前输出做目录 diff，验证增量再生成不会改变任何字节。 |
| checkZoteroOutput | 函数 | 68–84 | 简单 | validation、converter、integrity、hashing | 0 | 校验已生成的适配包是否与转换清单逐文件一致，报告缺失、多余或哈希不符的文件。 |
| convertZoteroBundle | 函数 | 46–66 | 中等 | converter、entry-point、generation、validation | 0 | 执行完整转换：先跑不可变审计作为前置门禁，再生成 Zotero 适配包并写出转换清单，支持 dry-run 与 force 覆盖。 |
| directoryDiff | 函数 | 224–236 | 简单 | diff、validation、filesystem、utility | 1 | 递归比较两个目录树的相对路径与文件内容，返回新增、缺失与内容不一致的差异清单。 |
| [generateZoteroTree](../../../../symbols/src/vendor-converters/zotero-library-agent-bundle/converter.ts/generateZoteroTree.md) | 函数 | 103–152 | 复杂 | converter、generation、file-manifest、delivery | 1 | 构建 `literature-adapters/zotero` 完整输出树，包含七个 Skill 包、profile 模板、AGPL 许可证与转换清单的写入计划。 |
| renderDerivation | 函数 | 182–203 | 中等 | converter、provenance、rendering、metadata | 1 | 渲染每个生成 Skill 的派生说明，记录上游来源、发布集、审计哈希与授权边界等不可变溯源元数据。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |
| [zotero-library-agent-bundle.ts](../../vendor-audits/zotero-library-agent-bundle.ts.md) | src/vendor-audits/zotero-library-agent-bundle.ts | Zotero Library Agent Bundle 的不可变审计 SSOT：定义审计 JSON 契约、固定发布集 ID 与路径常量，并校验上游身份、文件哈希与排序一致性。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](cli.ts.md) | src/vendor-converters/zotero-library-agent-bundle/cli.ts | Zotero Bundle 转换器的维护者 CLI 入口，向上查找仓库根并分派 generate、check 与 idempotence 三个维护命令。 |
| [zotero-adapter-converter.test.ts](../../../tests/zotero-adapter-converter.test.ts.md) | tests/zotero-adapter-converter.test.ts | Zotero Adapter 转换链的集成测试：运行不可变审计、转换、输出检查与幂等性检查，并核对生成树的文件清单与哈希。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| checkZoteroIdempotence | 函数 | 86–101 | 在临时目录重跑转换并与当前输出做目录 diff，验证增量再生成不会改变任何字节。 |
| checkZoteroOutput | 函数 | 68–84 | 校验已生成的适配包是否与转换清单逐文件一致，报告缺失、多余或哈希不符的文件。 |
| convertZoteroBundle | 函数 | 46–66 | 执行完整转换：先跑不可变审计作为前置门禁，再生成 Zotero 适配包并写出转换清单，支持 dry-run 与 force 覆盖。 |
