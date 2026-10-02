
# scripts/scientific-agent-skills-validator-template.py
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/scientific-agent-skills-validator-template.py -->

Scientific Agent Skills 扩展能力的研究简报校验器模板：读取提交的 JSON 输出，确认 research_brief 存在并包含六个通用证据字段。
源码：[scripts/scientific-agent-skills-validator-template.py](../../../../scripts/scientific-agent-skills-validator-template.py)

## 符号（1）
<!-- node: function:scripts/scientific-agent-skills-validator-template.py:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| main | 函数 | 42–86 | 中等 | 校验器、入口点、证据字段 | 0 | 解析命令行输出路径，读取并解析提交 JSON，校验 research_brief 存在且六个证据字段齐全，否则返回非零。 |
