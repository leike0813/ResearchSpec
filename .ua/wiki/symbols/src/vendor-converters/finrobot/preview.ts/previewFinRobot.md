
# previewFinRobot
<!-- node: function:src/vendor-converters/finrobot/preview.ts:previewFinRobot -->

校验预览根归属后渲染候选树，逐一核对上游源码存在性与字节一致，并输出候选树哈希、审核状态与扩展注册表校验结果。
类型：函数  
复杂度：复杂  
入边数：1  
标签：预览、校验、哈希绑定、vendor-converter  
所属文件：[src/vendor-converters/finrobot/preview.ts](../../../../../files/src/vendor-converters/finrobot/preview.ts.md)
源码：[src/vendor-converters/finrobot/preview.ts:34](../../../../../../../src/vendor-converters/finrobot/preview.ts#L34)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [main](../../../../../files/src/vendor-converters/finrobot/cli.ts.md) | src/vendor-converters/finrobot/cli.ts:11–34 | 解析子命令与 --force/--dry-run/--json 标志，向上定位仓库根后分派转换或预览，并以进程退出码反映结果。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [renderFinRobotCompleteTrees](../complete-tree.ts/renderFinRobotCompleteTrees.md) | src/vendor-converters/finrobot/complete-tree.ts:31–101 | 加载策略后按 Skill 契约排序渲染全部完整树，注入 LICENSE/NOTICE/DERIVATION 与共享支持库，并汇总出整组树哈希与审核状态。 |
