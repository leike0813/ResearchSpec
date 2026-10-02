
# src/arsu-converter/licensing.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/licensing.ts -->

ARSU 分组的许可与署名投影：校验上游 LICENSE 确为 Cheng-I Wu 的 CC BY-NC 4.0 授权后原样复制，并为每个分组生成独立署名 NOTICE.md。
源码：[src/arsu-converter/licensing.ts](../../../../../src/arsu-converter/licensing.ts)

## 符号（2）
<!-- node: function:src/arsu-converter/licensing.ts:emitArsuSkillLicensing -->
<!-- node: function:src/arsu-converter/licensing.ts:renderArsuSkillNotice -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| emitArsuSkillLicensing | 函数 | 9–40 | 中等 | licensing、compliance、code-generation、validation | 1 | 确认上游 LICENSE 包含约定的署名与非商业许可标识后写入分组 LICENSE 与 NOTICE.md，并返回两条带来源标注与哈希的 CopiedFile 记录。 |
| renderArsuSkillNotice | 函数 | 42–54 | 简单 | licensing、attribution、generation、template | 1 | 渲染分组署名声明：列出上游仓库、vendor 路径、CC BY-NC 4.0 许可与链接，并说明转换所做的适配不解除上游署名与非商业限制。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [fs-utils.ts](fs-utils.ts.md) | src/arsu-converter/fs-utils.ts | 转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。 |
| [types.ts](types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [emit.ts](emit.ts.md) | src/arsu-converter/emit.ts | 单个 Skill 分组的文件生成器：递归发现并改写依赖、替换锚点与运行时策略文本、保护注入的契约块免受链接重写影响，并为论文/流水线分组额外投影 revision patch、Quarto 渲染脚本与离线 Zotero 包标记。 |
| [validate.ts](validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| emitArsuSkillLicensing | 函数 | 9–40 | 确认上游 LICENSE 包含约定的署名与非商业许可标识后写入分组 LICENSE 与 NOTICE.md，并返回两条带来源标注与哈希的 CopiedFile 记录。 |
| renderArsuSkillNotice | 函数 | 42–54 | 渲染分组署名声明：列出上游仓库、vendor 路径、CC BY-NC 4.0 许可与链接，并说明转换所做的适配不解除上游署名与非商业限制。 |
