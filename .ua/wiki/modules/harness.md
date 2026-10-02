
# harness
> 目录聚合页：6 个文件、18 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [harness/catalog.ts](../files/harness/catalog.ts.md) | 文件 | 10 | 维护者 dogfooding harness 的目录装载器：把 Navigate 入口、ARSU/Companion/核心能力/插件 Procedure、文献 Adapter Skill 与领域分类聚合成一个带诊断的 harness 目录，并维护每个 Skill 的文件清单与文件树。 |
| [harness/README.md](../files/harness/README.md.md) | 文档 | 0 | Skill 浏览 harness 的使用说明：pnpm dev:harness 启动只读本地服务、可见入口与隐藏 Procedure 分支的区分，以及 review-workspace 交互预览页的生成方式与样例夹具。 |
| [harness/review-workspace-preview.ts](../files/harness/review-workspace-preview.ts.md) | 文件 | 2 | 维护者预览夹具：用手写手稿、冻结的 pandoc AST 和润色方案组装 7 个 review-workspace.v2 样例，并给静态工作台 HTML 注入一个样例下拉选择器与 base64 引导脚本。 |
| [harness/revision-master-preview-data.ts](../files/harness/revision-master-preview-data.ts.md) | 文件 | 1 | revision-master 预览的批准样例数据：把编辑信与两位审稿人的意见拆成 thread/原子批注/章节/计划/日志/回复，并同时产出可直接落盘的稿件文件与 revision-master.db 行数据。 |
| [harness/revision-master-preview.ts](../files/harness/revision-master-preview.ts.md) | 文件 | 1 | 用生产路径生成 revision-master 工作台的四个阶段预览页：从生产 schema 建库、写样例文件，再经只读 workbench 投影和 prepareRevisionMasterReview 输出 HTML。 |
| [harness/server.ts](../files/harness/server.ts.md) | 文件 | 4 | 只读的本地 Node HTTP 服务，把 harness 目录以 JSON API 与 Markdown 预览形式提供给浏览器，并附带严格的安全响应头。 |

## 子目录
- [dogfood/public](harness/dogfood/public.md)、[fixtures](harness/fixtures.md)、[public](harness/public.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src](src.md) | 4 |
| [src/plugins](src/plugins.md) | 2 |
| [src/adapters/companion](src/adapters/companion.md) | 1 |
| [src/arsu-converter](src/arsu-converter.md) | 1 |
| [src/core/workspace](src/core/workspace.md) | 1 |
| [src/literature-adapters](src/literature-adapters.md) | 1 |
| [src/procedures](src/procedures.md) | 1 |
