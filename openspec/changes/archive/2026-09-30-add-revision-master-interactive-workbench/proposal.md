# Proposal

## Why

revision-master 当前通过 SQLite 派生 Markdown 并在对话中审阅，用户难以同时核对原始意见、拆分与合并后的修订事项、稿件位置和回复。经过实际原型试用和逐项决策，四阶段工作台的交接、确认、冻结快照与首版范围已明确，可以进入正式实现设计。

## What Changes

- 引入独立的 `revision-master-review-workspace.v1` 和 `revision-master-review-result.v1`：保留业务对象、多对多关联、图谱上下文、完整冻结内容及逐范围语义基线，复用现有文档区块、批注锚点和源文件捕获能力。
- 将已批准的 B「工件台账」体验用于意见覆盖、工作板、当前策略卡和每轮改稿/回复审阅。Agent 主动交付已嵌入数据、可直接打开的本地 HTML；完整原文按目录可达，提供搜索、筛选和双向关联导航。
- 页面分别记录处置与调整请求、独立批注、显式内部确认、看完标记和焦点请求。补材文件交给 Agent；正式 Gate/Decision 在对话中单独确认。
- 增加只读快照准备与结果检查；Agent 按相关字段、关联和材料核对范围，处理有效反馈后生成新快照。SQLite 保存最小交回处理记录，并与数据库语义写入同事务提交，防止重复处理。
- 恢复新 review-response 的静态工作台指引，补齐原子化、工作板和 round 包资源；扩展开发预览、真实数据闭环及浏览器验收，更新用户模型和漂移文档。
- 首版不提供附件打包、领域结构直接编辑、关系图排程、全文自动对齐、历史差异浏览器或实时同步。

## Capabilities

### New Capabilities

- `revision-master-review-workspace`: 独立业务快照/结果、四阶段冻结 HTML、范围核对、内部确认、最小 SQLite 处理记录及完整交回闭环。

### Modified Capabilities

- `review-response`: 用独立业务工作台承载四个审阅交接点；明确包内资源、私有材料和现有语义写入的归属。
- `cli-interface`: 将新 review-response 的页面排除规则改为有界静态指引，区分实际包路径与 profile/run/control 上下文说明。
- `review-workspace-preview-harness`: 增加独立工作台的四阶段及风险样例，通过生产准备/页面路径预览，继续隔离开发控件与生产资产。

## Impact

- 核心涉及 `src/review-workspace/`、`review-workspace/`、revision-master 的作者源、包资源声明、相关 Procedure、Navigate renderer、现有预览与测试。
- 更新 `docs/user/usage-model.md`、`docs/user/review-workspace.md`、`docs/developer/manuscript-annotations.md` 与项目 `AGENTS.md`；能力包、manifest、registry 和维护锚点从现有生成链更新。
- 增加独立业务协议和任务 SQLite 内的最小处理记录。复用已安装依赖与 Python 标准库，不新增宿主 Skill、Companion、profile、公开 CLI 命令或模型服务。
- 通用 v2 和已交付旧审阅件继续走原路径。图谱、run/node/Gate/Decision 权威及既有正式确认规则保持原归属。
- 决策依据：[设计路线图](https://github.com/leike0813/ResearchSpec/issues/11)、[快照与交回契约](https://github.com/leike0813/ResearchSpec/issues/15#issuecomment-5903525188)、[首版范围与验收](https://github.com/leike0813/ResearchSpec/issues/16#issuecomment-5903719691)。已批准交互参考为本地未提交的 `review-workspace/prototype-revision-master.html`。
