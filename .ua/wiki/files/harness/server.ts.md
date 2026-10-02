
# harness/server.ts
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[harness](../../modules/harness.md)
<!-- node: file:harness/server.ts -->

只读的本地 Node HTTP 服务，把 harness 目录以 JSON API 与 Markdown 预览形式提供给浏览器，并附带严格的安全响应头。
源码：[harness/server.ts](../../../../harness/server.ts)

## 符号（4）
<!-- node: function:harness/server.ts:createSkillHarnessServer -->
<!-- node: function:harness/server.ts:handleRequest -->
<!-- node: function:harness/server.ts:renderHarnessMarkdown -->
<!-- node: function:harness/server.ts:sendFilePreview -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| createSkillHarnessServer | 函数 | 26–39 | 简单 | harness、factory、http-server、caching | 0 | 创建 harness HTTP 服务器实例，缓存已装载的目录快照并按需刷新，把请求交给统一的请求处理器。 |
| handleRequest | 函数 | 41–90 | 中等 | harness、routing、http-handler、validation | 0 | 分发只读请求：拒绝非 GET 方法与非法 URL，将目录 API、Skill 路由、文件预览和静态资源分别路由到对应处理分支。 |
| renderHarnessMarkdown | 函数 | 121–146 | 中等 | harness、markdown、rendering、link-rewriting | 1 | 把 Skill 内的 Markdown 渲染为 HTML 预览，并重写其中的相对链接以指向 harness 的文件预览路由。 |
| sendFilePreview | 函数 | 92–113 | 简单 | harness、preview、size-limit、http-handler | 1 | 返回单个 Skill 文件的预览内容，对文本类文件施加 1 MiB 上限，超出时按字节边界安全截断。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](catalog.ts.md) | harness/catalog.ts | 维护者 dogfooding harness 的目录装载器：把 Navigate 入口、ARSU/Companion/核心能力/插件 Procedure、文献 Adapter Skill 与领域分类聚合成一个带诊断的 harness 目录，并维护每个 Skill 的文件清单与文件树。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [skill-harness.test.ts](../tests/skill-harness.test.ts.md) | tests/skill-harness.test.ts | Skill harness 端到端测试：校验可见入口与隐藏 Procedure 的分离、目录诊断、文件树结构、路径越界防护以及只读 HTTP 服务的响应。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| createSkillHarnessServer | 函数 | 26–39 | 创建 harness HTTP 服务器实例，缓存已装载的目录快照并按需刷新，把请求交给统一的请求处理器。 |
| renderHarnessMarkdown | 函数 | 121–146 | 把 Skill 内的 Markdown 渲染为 HTML 预览，并重写其中的相对链接以指向 harness 的文件预览路由。 |
