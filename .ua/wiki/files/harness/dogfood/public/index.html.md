
# harness/dogfood/public/index.html
所属分层：[维护工具链与工程基础设施](../../../../layers/tooling.md)  
所属目录：[harness/dogfood/public](../../../../modules/harness/dogfood/public.md)
<!-- node: file:harness/dogfood/public/index.html -->

dogfooding 宿主验收审阅页的静态外壳：顶部展示 campaign 标识与状态徽章，中部提供运行指标概览、init 投影矩阵（36 个目标 × skills/commands/both 三种模式）和单宿主行为验收的尝试队列与报告详情面板。所有数据与交互由同目录的 app.js 在运行时拉取填充。
源码：[harness/dogfood/public/index.html](../../../../../../harness/dogfood/public/index.html)

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [app.js](app.js.md) | harness/dogfood/public/app.js | dogfood 行为验收看板的前端脚本，轮询 campaign 状态并渲染初始化投影矩阵、行为尝试队列、场景×宿主矩阵与证据片段，含大量中文状态标签映射。 |
| [matrix.css](matrix.css.md) | harness/dogfood/public/matrix.css | 只负责 init 投影矩阵区块的增量样式：矩阵卡片容器、章节标题行、单元格按钮宽度，以及 pass/fail/running 三种检查状态的按钮配色和断言链接缩进。 |
| [styles.css](styles.css.md) | harness/dogfood/public/styles.css | dogfood 验收页的基础样式表：用 :root CSS 变量定义纸感浅色主题与状态色，覆盖三栏工作区栅格、粘性队列、徽章、报告分节、审阅表单、证据折叠块和两档响应式断点。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [server.mjs](../../../scripts/dogfood/server.mjs.md) | scripts/dogfood/server.mjs | 本地只读审阅服务：暴露 campaign、场景、矩阵用例与会话证据的 JSON 接口及增量事件流，审阅写入需携带本地 token 并通过同源校验，静态资源取自 harness/dogfood/public。 |
