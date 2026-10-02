
# gitResult
<!-- node: function:src/arsu-converter/git.ts:gitResult -->

在给定目录执行 git 命令并把成功与失败统一归一为 GitResult，失败时从错误对象中提取退出码与已产生的输出而非直接抛出。
类型：函数  
复杂度：中等  
入边数：2  
标签：git、subprocess、error-handling、wrapper  
所属文件：[src/arsu-converter/git.ts](../../../../files/src/arsu-converter/git.ts.md)
源码：[src/arsu-converter/git.ts:12](../../../../../../src/arsu-converter/git.ts#L12)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [gitOutput](../../../../files/src/arsu-converter/git.ts.md) | src/arsu-converter/git.ts:34–37 | 在 gitResult 之上只返回成功时的 stdout，失败一律返回空串，供只需尽力获取值的调用方使用。 |
| [listTrackedFiles](../../../../files/src/arsu-converter/git.ts.md) | src/arsu-converter/git.ts:39–51 | 用 NUL 分隔的 ls-files --stage 输出解析受版本控制的文件，只保留 100644/100755 普通文件模式并排序，命令失败时抛出明确错误。 |

## 调用

该符号没有记录对外调用。
