
# getCliPayloadDefinition
<!-- node: function:src/cli/payload-catalog.ts:getCliPayloadDefinition -->

按命令 ID 取出 payload 定义，缺失即抛错。
类型：函数  
复杂度：简单  
入边数：2  
标签：accessor、payload-catalog、validation、utility  
所属文件：[src/cli/payload-catalog.ts](../../../../files/src/cli/payload-catalog.ts.md)
源码：[src/cli/payload-catalog.ts:132](../../../../../../src/cli/payload-catalog.ts#L132)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [getCliCommandDefinition](../../../../files/src/cli/command-catalog.ts.md) | src/cli/command-catalog.ts:152–156 | 按 ID 取出命令定义，未知 ID 立即抛错。 |
| [registerCliCommand](../../../../files/src/cli/command-catalog.ts.md) | src/cli/command-catalog.ts:158–174 | 依据目录定义注册 Commander 子命令，包括必填标记、自定义参数解析器与 payload 帮助文本。 |

## 调用

该符号没有记录对外调用。
