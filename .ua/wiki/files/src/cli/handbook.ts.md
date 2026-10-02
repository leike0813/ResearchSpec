
# src/cli/handbook.ts
所属分层：[CLI 命令入口层](../../../layers/cli.md)  
所属目录：[src/cli](../../../modules/src/cli.md)
<!-- node: file:src/cli/handbook.ts -->

从 CLI 命令目录与控制选择器家族派生出 CLI 手册的 Markdown、MDX 命令页与侧边栏，是 CLI 参考文档的 canonical renderer。
源码：[src/cli/handbook.ts](../../../../../src/cli/handbook.ts)

## 符号（6）
<!-- node: function:src/cli/handbook.ts:renderCliHandbook -->
<!-- node: function:src/cli/handbook.ts:renderCommandCard -->
<!-- node: function:src/cli/handbook.ts:renderMdxCliSidebar -->
<!-- node: function:src/cli/handbook.ts:renderMdxCommandPage -->
<!-- node: function:src/cli/handbook.ts:renderMdxCommandPages -->
<!-- node: function:src/cli/handbook.ts:renderPayloadSection -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| renderCliHandbook | 函数 | 28–70 | 中等 | cli、rendering、documentation、markdown | 1 | 渲染完整的 CLI Handbook Markdown，按 bootstrap、control-plane、inspection 等命令分组组织命令卡片与选择器说明。 |
| [renderCommandCard](../../../symbols/src/cli/handbook.ts/renderCommandCard.md) | 函数 | 161–193 | 中等 | cli、rendering、markdown、component | 2 | 渲染单个命令的 Markdown 卡片，说明用途、选择器形态、支持的控制族与相关文档链接。 |
| renderMdxCliSidebar | 函数 | 90–108 | 简单 | cli、rendering、mdx、navigation | 0 | 渲染 Docusaurus 侧的 CLI 侧边栏条目，按命令分组与排序位置组织导航结构。 |
| renderMdxCommandPage | 函数 | 110–153 | 中等 | cli、rendering、mdx、documentation | 1 | 渲染单个 CLI 命令的 MDX 页面，组合命令卡片、选择器家族展示与 payload 契约段落。 |
| renderMdxCommandPages | 函数 | 72–88 | 简单 | cli、rendering、mdx、docs-site | 0 | 为每个 CLI 命令生成对应的 MDX 文档页集合，并分配稳定的侧边栏排序位置。 |
| renderPayloadSection | 函数 | 195–214 | 简单 | cli、rendering、json、documentation | 1 | 渲染命令 payload 契约段落，把 JSON 输出结构与诊断字段整理为可读表格。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [command-catalog.ts](command-catalog.ts.md) | src/cli/command-catalog.ts | CLI 命令目录 SSOT：声明 16 个顶层命令与 5 个 plugin 子命令的语法、分组、工作区要求、读写影响与选项，并据此注册 Commander 命令与帮助文本。 |
| [control-selector.ts](../core/contracts/control-selector.ts.md) | src/core/contracts/control-selector.ts | 定义 run、node、Gate、Decision、change 与各类 inspection 的选择器 Zod 契约，并给出控制族与检查族的展示名称。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adapters.test.ts](../../tests/adapters.test.ts.md) | tests/adapters.test.ts | 验证 36 个工具与 28 个命令包装器的注册表完整性、每工具路径约定、Companion 四个自包含 Skill 的渲染，以及 Navigate 单一入口在各交付模式下的投影。 |
| [render.ts](../adapters/companion/render.ts.md) | src/adapters/companion/render.ts | 把 Companion 意图渲染成可安装的 Skill 包：生成带 frontmatter 的 SKILL.md、LICENSE，并在 Navigate 情形附加 ARSU 路由与 CLI 手册两份渐进式参考。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| renderCliHandbook | 函数 | 28–70 | 渲染完整的 CLI Handbook Markdown，按 bootstrap、control-plane、inspection 等命令分组组织命令卡片与选择器说明。 |
| renderMdxCliSidebar | 函数 | 90–108 | 渲染 Docusaurus 侧的 CLI 侧边栏条目，按命令分组与排序位置组织导航结构。 |
| renderMdxCommandPages | 函数 | 72–88 | 为每个 CLI 命令生成对应的 MDX 文档页集合，并分配稳定的侧边栏排序位置。 |
