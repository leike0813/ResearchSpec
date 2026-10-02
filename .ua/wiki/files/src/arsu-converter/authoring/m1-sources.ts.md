
# src/arsu-converter/authoring/m1-sources.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring](../../../../modules/src/arsu-converter/authoring.md)
<!-- node: file:src/arsu-converter/authoring/m1-sources.ts -->

M1 里程碑六个能力的授权源声明，覆盖研究问题构建、方法设计、文献检索筛选、来源质量分级、证据综合与研究报告撰写，并绑定各自的抽取产物与知识文件。
源码：[src/arsu-converter/authoring/m1-sources.ts](../../../../../../src/arsu-converter/authoring/m1-sources.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [authoring-converter.test.ts](../../../tests/authoring-converter.test.ts.md) | tests/authoring-converter.test.ts | 验证能力编写器的输出可被注册表加载、manifest 指纹与注册表一致，并断言重复生成完全幂等。 |
| [cli.ts](cli.ts.md) | src/arsu-converter/authoring/cli.ts | ARSU 能力编写的批处理入口，遍历 M1–M5 全部授权源生成能力包，并以 JSON 输出结果，支持 --dry-run 预检。 |
