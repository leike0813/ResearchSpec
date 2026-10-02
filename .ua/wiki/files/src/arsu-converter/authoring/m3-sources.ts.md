
# src/arsu-converter/authoring/m3-sources.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring](../../../../modules/src/arsu-converter/authoring.md)
<!-- node: file:src/arsu-converter/authoring/m3-sources.ts -->

M3 评审里程碑七个能力的授权源声明，覆盖参考文献完整性核验、评审小组配置、编辑判断、专项评审、反方压力测试、评审综合与投稿前自检。
源码：[src/arsu-converter/authoring/m3-sources.ts](../../../../../../src/arsu-converter/authoring/m3-sources.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](cli.ts.md) | src/arsu-converter/authoring/cli.ts | ARSU 能力编写的批处理入口，遍历 M1–M5 全部授权源生成能力包，并以 JSON 输出结果，支持 --dry-run 预检。 |
