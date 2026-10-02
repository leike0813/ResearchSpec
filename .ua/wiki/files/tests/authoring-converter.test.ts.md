
# tests/authoring-converter.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/authoring-converter.test.ts -->

验证能力编写器的输出可被注册表加载、manifest 指纹与注册表一致，并断言重复生成完全幂等。
源码：[tests/authoring-converter.test.ts](../../../../tests/authoring-converter.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](../src/arsu-converter/authoring/author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |
| [m1-sources.ts](../src/arsu-converter/authoring/m1-sources.ts.md) | src/arsu-converter/authoring/m1-sources.ts | M1 里程碑六个能力的授权源声明，覆盖研究问题构建、方法设计、文献检索筛选、来源质量分级、证据综合与研究报告撰写，并绑定各自的抽取产物与知识文件。 |
| [registry.ts](../src/capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
