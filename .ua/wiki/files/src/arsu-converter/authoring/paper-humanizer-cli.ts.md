
# src/arsu-converter/authoring/paper-humanizer-cli.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring](../../../../modules/src/arsu-converter/authoring.md)
<!-- node: file:src/arsu-converter/authoring/paper-humanizer-cli.ts -->

paper-humanizer 能力族的独立编写入口，使用 vendor-derived 来源选项生成四个能力包。
源码：[src/arsu-converter/authoring/paper-humanizer-cli.ts](../../../../../../src/arsu-converter/authoring/paper-humanizer-cli.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/authoring/paper-humanizer-cli.ts:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| main | 函数 | 7–21 | 简单 | entry-point、cli、batch-authoring | 0 | 遍历 paper-humanizer 授权源并带上专属 extraction index 与 vendor-derived 来源选项调用 authorCapabilityPackage，输出统一的 JSON 结果。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |
| [paper-humanizer-sources.ts](paper-humanizer-sources.ts.md) | src/arsu-converter/authoring/paper-humanizer-sources.ts | paper-humanizer 四个能力（参考模式、评审、修订、验证）的授权源声明，MIT 许可、vendor-derived 来源，并把文档流水线脚本与本地静态评审页面作为随包资源。 |
