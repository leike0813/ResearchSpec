
# loadFinRobotDraftPolicies
<!-- node: function:src/vendor-converters/finrobot/policy.ts:loadFinRobotDraftPolicies -->

读取生产策略目录下的全部策略 JSON 与固定审计文件，并计算各策略文件的 SHA-256 供清单绑定。
类型：函数  
复杂度：中等  
入边数：2  
标签：策略、加载器、哈希绑定  
所属文件：[src/vendor-converters/finrobot/policy.ts](../../../../../files/src/vendor-converters/finrobot/policy.ts.md)
源码：[src/vendor-converters/finrobot/policy.ts:225](../../../../../../../src/vendor-converters/finrobot/policy.ts#L225)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [renderFinRobotCompleteTrees](../complete-tree.ts/renderFinRobotCompleteTrees.md) | src/vendor-converters/finrobot/complete-tree.ts:31–101 | 加载策略后按 Skill 契约排序渲染全部完整树，注入 LICENSE/NOTICE/DERIVATION 与共享支持库，并汇总出整组树哈希与审核状态。 |
| [convertFinRobot](../../../../../files/src/vendor-converters/finrobot/converter.ts.md) | src/vendor-converters/finrobot/converter.ts:80–102 | 执行一次 FinRobot 转换：断言策略已批准、校验前置条件、渲染完整树，在暂存目录生成后装配注册表，检测漂移后提交或仅返回 dry-run 清单。 |

## 调用

该符号没有记录对外调用。
