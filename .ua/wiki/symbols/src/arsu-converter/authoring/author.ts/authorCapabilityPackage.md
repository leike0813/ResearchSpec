
# authorCapabilityPackage
<!-- node: function:src/arsu-converter/authoring/author.ts:authorCapabilityPackage -->

能力包编写主流程：读取 extraction index 并拒绝未通过验证的产物，按声明落盘知识文件与包资源，构建 policy/script validators 与上游来源记录，最后写包并更新注册表。
类型：函数  
复杂度：复杂  
入边数：2  
标签：authoring-pipeline、entry-point、validation、serialization  
所属文件：[src/arsu-converter/authoring/author.ts](../../../../../files/src/arsu-converter/authoring/author.ts.md)
源码：[src/arsu-converter/authoring/author.ts:86](../../../../../../../src/arsu-converter/authoring/author.ts#L86)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [main](../../../../../files/src/arsu-converter/authoring/cli.ts.md) | src/arsu-converter/authoring/cli.ts:11–25 | 解析输出根目录与 --dry-run，顺序调用 authorCapabilityPackage 处理 M1–M5 授权源，并把每个能力的文件清单与注册表版本写入 stdout。 |
| [main](../../../../../files/src/arsu-converter/authoring/paper-humanizer-cli.ts.md) | src/arsu-converter/authoring/paper-humanizer-cli.ts:7–21 | 遍历 paper-humanizer 授权源并带上专属 extraction index 与 vendor-derived 来源选项调用 authorCapabilityPackage，输出统一的 JSON 结果。 |

## 调用

该符号没有记录对外调用。
