
# src/arsu-converter/authoring/paper-humanizer-sources.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring](../../../../modules/src/arsu-converter/authoring.md)
<!-- node: file:src/arsu-converter/authoring/paper-humanizer-sources.ts -->

paper-humanizer 四个能力（参考模式、评审、修订、验证）的授权源声明，MIT 许可、vendor-derived 来源，并把文档流水线脚本与本地静态评审页面作为随包资源。
源码：[src/arsu-converter/authoring/paper-humanizer-sources.ts](../../../../../../src/arsu-converter/authoring/paper-humanizer-sources.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [paper-humanizer-cli.ts](paper-humanizer-cli.ts.md) | src/arsu-converter/authoring/paper-humanizer-cli.ts | paper-humanizer 能力族的独立编写入口，使用 vendor-derived 来源选项生成四个能力包。 |
| [paper-humanizer.test.ts](../../../tests/paper-humanizer.test.ts.md) | tests/paper-humanizer.test.ts | paper-humanizer 测试：验证提取索引对固定 vendor 的哈希绑定、能力包已创作并注册、图谱可对内置注册表解析，以及 authoring 幂等与 Reference-mode 入口存在。 |
