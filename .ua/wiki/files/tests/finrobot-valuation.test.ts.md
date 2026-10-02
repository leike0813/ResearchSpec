
# tests/finrobot-valuation.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/finrobot-valuation.test.ts -->

验证相对估值候选脚本：复合估值只在方法可比且权重理由声明充分时认证，敏感性网格复用主入口的取值校验并保持网格形状。
源码：[tests/finrobot-valuation.test.ts](../../../../tests/finrobot-valuation.test.ts)

## 符号（8）
<!-- node: function:tests/finrobot-valuation.test.ts:assertClose -->
<!-- node: function:tests/finrobot-valuation.test.ts:finrobot-relative-valuation-certifies-a-composite-only-f -->
<!-- node: function:tests/finrobot-valuation.test.ts:finrobot-sensitivity-shares-the-value-validation-and-gri -->
<!-- node: function:tests/finrobot-valuation.test.ts:readJson -->
<!-- node: function:tests/finrobot-valuation.test.ts:runValuation -->
<!-- node: function:tests/finrobot-valuation.test.ts:runValue -->
<!-- node: function:tests/finrobot-valuation.test.ts:stagedTree -->
<!-- node: function:tests/finrobot-valuation.test.ts:writeJson -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assertClose | 函数 | 180–182 | 简单 | test、helper、assert | 0 | 断言两个浮点数在容差内相等。 |
| finrobot-relative-valuation-certifies-a-composite-only-f | 函数 | 47–128 | 中等 | test、用例、断言 | 0 | 测试用例：FinRobot relative valuation certifies a composite only for comparable, declared methods |
| finrobot-sensitivity-shares-the-value-validation-and-gri | 函数 | 129–150 | 中等 | test、用例、断言 | 0 | 测试用例：FinRobot sensitivity shares the value validation and grid shape |
| readJson | 函数 | 176–178 | 简单 | test、helper、io | 0 | 读取子命令产出的 JSON 结果文件。 |
| runValuation | 函数 | 161–164 | 简单 | test、helper、subprocess | 0 | 以 sensitivity 子命令运行暂存技能并读取结果。 |
| runValue | 函数 | 166–170 | 简单 | test、helper、subprocess | 0 | 以 value 子命令运行暂存技能并读取结果。 |
| stagedTree | 函数 | 152–159 | 简单 | test、helper、fixture | 0 | 把候选估值脚本与共享支撑库暂存到临时技能目录。 |
| writeJson | 函数 | 172–174 | 简单 | test、helper、io | 0 | 把测试载荷写为 JSON 输入文件。 |
