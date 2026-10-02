
# checkFinRobotIdempotence
<!-- node: function:src/vendor-converters/finrobot/converter.ts:checkFinRobotIdempotence -->

重新生成一遍并与已提交输出比对，返回漂移路径列表以确认转换可重复。
类型：函数  
复杂度：简单  
入边数：2  
标签：幂等性、校验、vendor-converter  
所属文件：[src/vendor-converters/finrobot/converter.ts](../../../../../files/src/vendor-converters/finrobot/converter.ts.md)
源码：[src/vendor-converters/finrobot/converter.ts:148](../../../../../../../src/vendor-converters/finrobot/converter.ts#L148)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [finrobot-converter.test.ts](../../../../../files/tests/finrobot-converter.test.ts.md) | tests/finrobot-converter.test.ts:— | FinRobot 生产转换测试：断言已发布 bundle 是经批准的 version 2 六 Skill 投影、树集合哈希匹配、域归属正确，并验证 Tier 3 脚本的离线执行与转换幂等性。 |
| [main](../../../../../files/src/vendor-converters/finrobot/cli.ts.md) | src/vendor-converters/finrobot/cli.ts:11–34 | 解析子命令与 --force/--dry-run/--json 标志，向上定位仓库根后分派转换或预览，并以进程退出码反映结果。 |

## 调用

该符号没有记录对外调用。
