
# harness/dogfood/public
> 目录聚合页：4 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [harness/dogfood/public/app.js](../../../files/harness/dogfood/public/app.js.md) | 文件 | 0 | dogfood 行为验收看板的前端脚本，轮询 campaign 状态并渲染初始化投影矩阵、行为尝试队列、场景×宿主矩阵与证据片段，含大量中文状态标签映射。 |
| [harness/dogfood/public/index.html](../../../files/harness/dogfood/public/index.html.md) | 文件 | 0 | dogfooding 宿主验收审阅页的静态外壳：顶部展示 campaign 标识与状态徽章，中部提供运行指标概览、init 投影矩阵（36 个目标 × skills/commands/both 三种模式）和单宿主行为验收的尝试队列与报告详情面板。所有数据与交互由同目录的 app.js 在运行时拉取填充。 |
| [harness/dogfood/public/matrix.css](../../../files/harness/dogfood/public/matrix.css.md) | 文件 | 0 | 只负责 init 投影矩阵区块的增量样式：矩阵卡片容器、章节标题行、单元格按钮宽度，以及 pass/fail/running 三种检查状态的按钮配色和断言链接缩进。 |
| [harness/dogfood/public/styles.css](../../../files/harness/dogfood/public/styles.css.md) | 文件 | 0 | dogfood 验收页的基础样式表：用 :root CSS 变量定义纸感浅色主题与状态色，覆盖三栏工作区栅格、粘性队列、徽章、报告分节、审阅表单、证据折叠块和两档响应式断点。 |
