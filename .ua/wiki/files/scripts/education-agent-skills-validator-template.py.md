
# scripts/education-agent-skills-validator-template.py
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/education-agent-skills-validator-template.py -->

Education Agent Skills 插件能力的研究简报校验器模板：解析命令行给出的 JSON 输出，校验存在 research_brief 并含六个通用证据字段。
源码：[scripts/education-agent-skills-validator-template.py](../../../../scripts/education-agent-skills-validator-template.py)

## 符号（1）
<!-- node: function:scripts/education-agent-skills-validator-template.py:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| main | 函数 | 41–85 | 中等 | 校验器、入口点、证据字段 | 0 | 解析参数、读取提交 JSON、确认 research_brief 输出存在并逐个校验必需证据键，失败时以非零状态退出。 |
