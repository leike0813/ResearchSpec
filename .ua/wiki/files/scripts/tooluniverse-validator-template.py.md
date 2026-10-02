
# scripts/tooluniverse-validator-template.py
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/tooluniverse-validator-template.py -->

ToolUniverse 扩展能力的研究简报校验器模板，校验绝对输出路径中的 research_brief JSON 是否具备 scope、source_ledger 等六项证据字段。
源码：[scripts/tooluniverse-validator-template.py](../../../../scripts/tooluniverse-validator-template.py)

## 符号（1）
<!-- node: function:scripts/tooluniverse-validator-template.py:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| main | 函数 | 42–86 | 中等 | 校验器、入口点、证据字段 | 0 | 读取 runner 产出的提交 JSON，定位 research_brief 输出并逐项检查通用证据字段。 |
