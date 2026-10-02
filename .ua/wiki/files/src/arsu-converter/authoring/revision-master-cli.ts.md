
# src/arsu-converter/authoring/revision-master-cli.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring](../../../../modules/src/arsu-converter/authoring.md)
<!-- node: file:src/arsu-converter/authoring/revision-master-cli.ts -->

revision-master 能力族的独立编写入口，使用专属 extraction index 与 vendor-derived 来源生成审稿回复能力包。
源码：[src/arsu-converter/authoring/revision-master-cli.ts](../../../../../../src/arsu-converter/authoring/revision-master-cli.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/authoring/revision-master-cli.ts:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| main | 函数 | 7–21 | 简单 | entry-point、cli、batch-authoring | 0 | 遍历 revision-master 授权源并以 REVISION_MASTER_AUTHORING_OPTIONS 调用 authorCapabilityPackage，输出 JSON 结果或 dry-run 预检。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |
| [revision-master-sources.ts](revision-master-sources.ts.md) | src/arsu-converter/authoring/revision-master-sources.ts | revision-master 五个能力（接入、稿件分析、评语原子化、工作板规划、轮次执行）的授权源声明，以模板数组与共享 Gate 运行时资产组装大量 Jinja 模板、SQLite 脚本和 workbench 资源。 |
