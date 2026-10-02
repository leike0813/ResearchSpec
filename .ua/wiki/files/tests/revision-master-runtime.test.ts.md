
# tests/revision-master-runtime.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/revision-master-runtime.test.ts -->

revision-master workbench 运行时的端到端测试：在临时目录建 SQLite 工作区，经 uv 共享 Python 环境调用包内工具，校验投影、写入计划、回执与生成的能力包行为。
源码：[tests/revision-master-runtime.test.ts](../../../../tests/revision-master-runtime.test.ts)

## 符号（6）
<!-- node: function:tests/revision-master-runtime.test.ts:createWorkspace -->
<!-- node: function:tests/revision-master-runtime.test.ts:packageWriteModule -->
<!-- node: function:tests/revision-master-runtime.test.ts:receiptRows -->
<!-- node: function:tests/revision-master-runtime.test.ts:resultFor -->
<!-- node: function:tests/revision-master-runtime.test.ts:snapshotFrom -->
<!-- node: function:tests/revision-master-runtime.test.ts:writeCallback -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| createWorkspace | 函数 | 66–150 | 中等 | test-helper、integration、fixture | 0 | 在临时目录创建任务工作区：按 Schema DDL 或包内 workspace_db 初始化 SQLite，并可通过选项注入缺表、缺列或自定义脚本以覆盖降级路径。 |
| packageWriteModule | 函数 | 764–826 | 中等 | test-helper、integration、packaging | 0 | 生成临时的包内写入模块脚本，用生成后的真实能力包路径运行写入，验证 ResearchSpec 不会执行未声明的资源。 |
| receiptRows | 函数 | 235–246 | 简单 | test-helper、assertion、transaction | 0 | 从写回任务中提取处理回执行，验证处理记录与语义写入绑定提交。 |
| resultFor | 函数 | 194–205 | 简单 | test-helper、factory、review-workspace | 0 | 以工作区快照、反馈与目标评语列表生成导出结果，批量装配同一结构的处置条目。 |
| snapshotFrom | 函数 | 164–188 | 简单 | test-helper、fixture、projection | 0 | 由只读投影构造带指定快照 ID 的 revision-master 工作区，作为各场景的评审基线。 |
| writeCallback | 函数 | 211–223 | 简单 | test-helper、assertion、transaction | 0 | 作为写回回调记录任务级写入计划的关键字段，用于断言语义写入与回执提交在同一事务内完成。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](../src/arsu-converter/authoring/author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |
| [registry.ts](../src/capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
| [revision-master-sources.ts](../src/arsu-converter/authoring/revision-master-sources.ts.md) | src/arsu-converter/authoring/revision-master-sources.ts | revision-master 五个能力（接入、稿件分析、评语原子化、工作板规划、轮次执行）的授权源声明，以模板数组与共享 Gate 运行时资产组装大量 Jinja 模板、SQLite 脚本和 workbench 资源。 |
| [revision-master.ts](../src/review-workspace/revision-master.ts.md) | src/review-workspace/revision-master.ts | revision-master 评审工作区 v1 契约：显式业务表快照、阶段作用域与其基线、文档与定位、反馈结构，以及带严格确认规则的导出结果 Schema。 |
| [revision-master.ts](helpers/revision-master.ts.md) | tests/helpers/revision-master.ts | revision-master 测试夹具：读取包内 Schema 的建表 DDL，并构造一个覆盖评语、线索、作用域、阻塞与策略卡的工作区样本。 |
