
# harness/public/app.js
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[harness/public](../../../modules/harness/public.md)
<!-- node: file:harness/public/app.js -->

Skill Browser 前端应用：加载 catalog、按可见入口与 ARSU/Companion/Core/Plugin Procedure 分支构建导航树、按需预览 Skill 包内文件，并支持 URL hash 定位。
源码：[harness/public/app.js](../../../../../harness/public/app.js)

## 符号（12）
<!-- node: function:harness/public/app.js:applyHash -->
<!-- node: function:harness/public/app.js:buildPluginBranch -->
<!-- node: function:harness/public/app.js:domainBranch -->
<!-- node: function:harness/public/app.js:familyBranch -->
<!-- node: function:harness/public/app.js:loadCatalog -->
<!-- node: function:harness/public/app.js:renderFile -->
<!-- node: function:harness/public/app.js:renderFileTreeNode -->
<!-- node: function:harness/public/app.js:renderHealth -->
<!-- node: function:harness/public/app.js:renderNavigation -->
<!-- node: function:harness/public/app.js:renderSkillWorkspace -->
<!-- node: function:harness/public/app.js:skillGroup -->
<!-- node: function:harness/public/app.js:summaryNode -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| applyHash | 函数 | 164–181 | 中等 | frontend、路由、hash、状态同步 | 0 | 解析 URL hash 中的技能与文件定位，同步当前选择状态并触发对应工作区或文件视图渲染。 |
| buildPluginBranch | 函数 | 94–121 | 中等 | frontend、插件域、聚合、渲染 | 0 | 构建插件扩展的领域分支：按 domain 聚合 Procedure，计算每个领域的技能数与空域可见性。 |
| domainBranch | 函数 | 123–138 | 中等 | frontend、领域、渲染 | 0 | 渲染单个领域节点及其下属技能按钮，遵循空域默认隐藏的规则。 |
| familyBranch | 函数 | 83–92 | 简单 | frontend、导航树、分组 | 0 | 生成某一技能家族（可见入口或隐藏 Procedure 家族）的导航分支节点。 |
| loadCatalog | 函数 | 25–37 | 简单 | frontend、数据加载、错误处理 | 0 | 从 /api/catalog 拉取目录数据，依次渲染健康状态与导航树并应用当前 hash，失败时展示错误信息。 |
| renderFile | 函数 | 259–296 | 中等 | frontend、文件预览、markdown、转义 | 0 | 在预览与原始源码两种模式间切换渲染选中文件，Markdown 走安全预览，其余类型显示转义后的文本。 |
| renderFileTreeNode | 函数 | 230–247 | 中等 | frontend、文件树、递归、安全边界 | 0 | 递归渲染单个目录或文件节点，可执行类型不提供嵌入而只显示名称。 |
| renderHealth | 函数 | 39–49 | 简单 | frontend、渲染、健康状态 | 0 | 把 catalog 的 summary 与 diagnostics 渲染成顶部健康条文案。 |
| renderNavigation | 函数 | 51–81 | 中等 | frontend、导航树、过滤、渲染 | 0 | 按搜索词与空域开关构建侧栏导航树，分支包含可见入口、ARSU、Companion、Core 与 Plugin 域分组。 |
| renderSkillWorkspace | 函数 | 183–222 | 中等 | frontend、工作区、预览、渲染 | 0 | 渲染选中技能的工作区视图：元信息、文件树与默认选中的 SKILL.md 预览。 |
| skillGroup | 函数 | 140–153 | 简单 | frontend、分组、元信息 | 0 | 把一组技能包组织成可折叠分组，附带 vendor、来源与文件数等元信息。 |
| summaryNode | 函数 | 313–322 | 简单 | frontend、dom-构建、折叠 | 0 | 构造可折叠的 details/summary 节点，用于包裹长内容区块。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [server.ts](../server.ts.md) | harness/server.ts | 只读的本地 Node HTTP 服务，把 harness 目录以 JSON API 与 Markdown 预览形式提供给浏览器，并附带严格的安全响应头。 |
