
# harness/public/index.html
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[harness/public](../../../modules/harness/public.md)
<!-- node: file:harness/public/index.html -->

Skill Browser 页面骨架，提供搜索框、空域显示开关、技能导航侧栏、健康状态条与详情区，并延迟加载 app.js 与 styles.css。
源码：[harness/public/index.html](../../../../../harness/public/index.html)

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [app.js](app.js.md) | harness/public/app.js | Skill Browser 前端应用：加载 catalog、按可见入口与 ARSU/Companion/Core/Plugin Procedure 分支构建导航树、按需预览 Skill 包内文件，并支持 URL hash 定位。 |
| [styles.css](styles.css.md) | harness/public/styles.css | harness 界面样式表，用 CSS 变量定义配色、面板与状态色，规定顶栏、健康条、侧栏导航、详情区与 Markdown 预览的布局与焦点样式。 |
