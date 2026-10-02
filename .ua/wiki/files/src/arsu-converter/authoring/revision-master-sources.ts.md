
# src/arsu-converter/authoring/revision-master-sources.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring](../../../../modules/src/arsu-converter/authoring.md)
<!-- node: file:src/arsu-converter/authoring/revision-master-sources.ts -->

revision-master 五个能力（接入、稿件分析、评语原子化、工作板规划、轮次执行）的授权源声明，以模板数组与共享 Gate 运行时资产组装大量 Jinja 模板、SQLite 脚本和 workbench 资源。
源码：[src/arsu-converter/authoring/revision-master-sources.ts](../../../../../../src/arsu-converter/authoring/revision-master-sources.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [review-response.test.ts](../../../tests/review-response.test.ts.md) | tests/review-response.test.ts | review-response 测试：验证能力包已创作注册、图谱解析并声明修订回路、运行可经轮次 Decision 推进至完成，以及 handoff 物化出 revision-master 工作台资源、authoring 幂等。 |
| [revision-master-cli.ts](revision-master-cli.ts.md) | src/arsu-converter/authoring/revision-master-cli.ts | revision-master 能力族的独立编写入口，使用专属 extraction index 与 vendor-derived 来源生成审稿回复能力包。 |
| [revision-master-runtime.test.ts](../../../tests/revision-master-runtime.test.ts.md) | tests/revision-master-runtime.test.ts | revision-master workbench 运行时的端到端测试：在临时目录建 SQLite 工作区，经 uv 共享 Python 环境调用包内工具，校验投影、写入计划、回执与生成的能力包行为。 |
