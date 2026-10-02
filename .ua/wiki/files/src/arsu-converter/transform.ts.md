
# src/arsu-converter/transform.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/transform.ts -->

转换期文本变换层：扫描平台词、历史词、schema 版本与 issue 引用等风险信号，发现 Skill 间的文件依赖并判定 shared/cross_skill/local 类别，重写 Markdown 链接到生成目录结构，并把无法解析的链接就地中和为纯文本。
源码：[src/arsu-converter/transform.ts](../../../../../src/arsu-converter/transform.ts)

## 符号（10）
<!-- node: function:src/arsu-converter/transform.ts:discoverDependencies -->
<!-- node: function:src/arsu-converter/transform.ts:discoverMarkdownDependencies -->
<!-- node: function:src/arsu-converter/transform.ts:discoverMarkdownSourceLinks -->
<!-- node: function:src/arsu-converter/transform.ts:discoverMissingDependencies -->
<!-- node: function:src/arsu-converter/transform.ts:neutralizeUnresolvedMarkdownLinks -->
<!-- node: function:src/arsu-converter/transform.ts:normalizeSourceLink -->
<!-- node: function:src/arsu-converter/transform.ts:relativeLink -->
<!-- node: function:src/arsu-converter/transform.ts:rewriteMarkdownLinks -->
<!-- node: function:src/arsu-converter/transform.ts:rewriteText -->
<!-- node: function:src/arsu-converter/transform.ts:scanFindings -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| discoverDependencies | 函数 | 49–69 | 中等 | 依赖发现、链接解析、转换器 | 0 | 从文本中同时按裸路径与 Markdown 链接发现属于当前 Skill 组的跨文件依赖，去重后返回 source_path、output_path 与依赖类别。 |
| discoverMarkdownDependencies | 函数 | 71–87 | 中等 | 依赖发现、markdown-解析、链接 | 0 | 专门解析 Markdown 链接形式的依赖，区分可解析的重写目标与需要中和的失效链接。 |
| discoverMarkdownSourceLinks | 函数 | 153–162 | 简单 | markdown-解析、路径归一、依赖发现 | 0 | 从 Markdown 链接中递归提取相对源路径，为跨文件依赖发现提供候选集合。 |
| discoverMissingDependencies | 函数 | 89–98 | 简单 | 依赖发现、缺口报告、转换器 | 0 | 汇总所有指向未知源路径的跨文件引用，按 owner 分组产出待人工复核的缺失依赖记录。 |
| neutralizeUnresolvedMarkdownLinks | 函数 | 117–132 | 中等 | 链接重写、容错、文本变换 | 0 | 把无法解析到生成产物的 Markdown 链接就地转为纯文本，避免在生成包中留下指向缺失文件的死链。 |
| normalizeSourceLink | 函数 | 202–215 | 简单 | 路径归一、安全边界、工具函数 | 0 | 把链接或裸路径归一化为 posix 风格的上游源路径，剥离锚点与查询片段并拒绝越过目录的引用。 |
| relativeLink | 函数 | 188–200 | 简单 | 路径计算、工具函数、链接 | 0 | 按源文件与目标文件位置计算生成树中的相对链接，必要时补上 ./ 前缀。 |
| rewriteMarkdownLinks | 函数 | 100–115 | 中等 | 链接重写、文本变换、markdown-解析 | 0 | 把指向已随包复制依赖的 Markdown 链接改写为生成目录下的相对路径，其余链接保持原样。 |
| rewriteText | 函数 | 134–143 | 简单 | 文本变换、编排、转换器 | 0 | 对单文件内容执行完整的文本重写流程：发现并改写依赖链接，同时中和未解析链接。 |
| scanFindings | 函数 | 19–47 | 中等 | 风险扫描、文本扫描、转换器 | 1 | 逐行扫描源文件，登记平台术语、历史术语、schema 版本标记、version 标记与 issue/PR 引用五类风险发现。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [config.ts](config.ts.md) | src/arsu-converter/config.ts | 转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。 |
| [types.ts](types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [emit.ts](emit.ts.md) | src/arsu-converter/emit.ts | 单个 Skill 分组的文件生成器：递归发现并改写依赖、替换锚点与运行时策略文本、保护注入的契约块免受链接重写影响，并为论文/流水线分组额外投影 revision patch、Quarto 渲染脚本与离线 Zotero 包标记。 |
| [validate.ts](validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| discoverDependencies | 函数 | 49–69 | 从文本中同时按裸路径与 Markdown 链接发现属于当前 Skill 组的跨文件依赖，去重后返回 source_path、output_path 与依赖类别。 |
| discoverMarkdownDependencies | 函数 | 71–87 | 专门解析 Markdown 链接形式的依赖，区分可解析的重写目标与需要中和的失效链接。 |
| discoverMissingDependencies | 函数 | 89–98 | 汇总所有指向未知源路径的跨文件引用，按 owner 分组产出待人工复核的缺失依赖记录。 |
| neutralizeUnresolvedMarkdownLinks | 函数 | 117–132 | 把无法解析到生成产物的 Markdown 链接就地转为纯文本，避免在生成包中留下指向缺失文件的死链。 |
| rewriteMarkdownLinks | 函数 | 100–115 | 把指向已随包复制依赖的 Markdown 链接改写为生成目录下的相对路径，其余链接保持原样。 |
| rewriteText | 函数 | 134–143 | 对单文件内容执行完整的文本重写流程：发现并改写依赖链接，同时中和未解析链接。 |
| scanFindings | 函数 | 19–47 | 逐行扫描源文件，登记平台术语、历史术语、schema 版本标记、version 标记与 issue/PR 引用五类风险发现。 |
