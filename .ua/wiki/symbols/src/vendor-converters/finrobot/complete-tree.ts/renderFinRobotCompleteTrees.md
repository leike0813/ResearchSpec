
# renderFinRobotCompleteTrees
<!-- node: function:src/vendor-converters/finrobot/complete-tree.ts:renderFinRobotCompleteTrees -->

加载策略后按 Skill 契约排序渲染全部完整树，注入 LICENSE/NOTICE/DERIVATION 与共享支持库，并汇总出整组树哈希与审核状态。
类型：函数  
复杂度：复杂  
入边数：3  
标签：代码生成、orchestration、哈希绑定  
所属文件：[src/vendor-converters/finrobot/complete-tree.ts](../../../../../files/src/vendor-converters/finrobot/complete-tree.ts.md)
源码：[src/vendor-converters/finrobot/complete-tree.ts:31](../../../../../../../src/vendor-converters/finrobot/complete-tree.ts#L31)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [finrobot-converter.test.ts](../../../../../files/tests/finrobot-converter.test.ts.md) | tests/finrobot-converter.test.ts:— | FinRobot 生产转换测试：断言已发布 bundle 是经批准的 version 2 六 Skill 投影、树集合哈希匹配、域归属正确，并验证 Tier 3 脚本的离线执行与转换幂等性。 |
| [convertFinRobot](../../../../../files/src/vendor-converters/finrobot/converter.ts.md) | src/vendor-converters/finrobot/converter.ts:80–102 | 执行一次 FinRobot 转换：断言策略已批准、校验前置条件、渲染完整树，在暂存目录生成后装配注册表，检测漂移后提交或仅返回 dry-run 清单。 |
| [previewFinRobot](../preview.ts/previewFinRobot.md) | src/vendor-converters/finrobot/preview.ts:34–139 | 校验预览根归属后渲染候选树，逐一核对上游源码存在性与字节一致，并输出候选树哈希、审核状态与扩展注册表校验结果。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [loadFinRobotDraftPolicies](../policy.ts/loadFinRobotDraftPolicies.md) | src/vendor-converters/finrobot/policy.ts:225–246 | 读取生产策略目录下的全部策略 JSON 与固定审计文件，并计算各策略文件的 SHA-256 供清单绑定。 |
| [finRobotSkillDefinition](../../../../../files/src/vendor-converters/finrobot/skill-definitions.ts.md) | src/vendor-converters/finrobot/skill-definitions.ts:219–223 | 按 Skill ID 取出定义，未登记的 ID 直接抛错，供转换器与检查器共用同一入口。 |
