
# src/arsu-converter/authoring/checkers/temporal.py
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/checkers](../../../../../modules/src/arsu-converter/authoring/checkers.md)
<!-- node: file:src/arsu-converter/authoring/checkers/temporal.py -->

离线时间完整性审计：五遍确定性扫描草稿与时间线，产出时间算术不可能、时代错置引用、比较级未落实、因果倒置、指示词和元数据缺失六类 finding。
源码：[src/arsu-converter/authoring/checkers/temporal.py](../../../../../../../src/arsu-converter/authoring/checkers/temporal.py)

## 符号（11）
<!-- node: function:src/arsu-converter/authoring/checkers/temporal.py:_date_to_interval -->
<!-- node: function:src/arsu-converter/authoring/checkers/temporal.py:_finding -->
<!-- node: function:src/arsu-converter/authoring/checkers/temporal.py:_load_optional -->
<!-- node: function:src/arsu-converter/authoring/checkers/temporal.py:_metadata -->
<!-- node: function:src/arsu-converter/authoring/checkers/temporal.py:_next_id -->
<!-- node: function:src/arsu-converter/authoring/checkers/temporal.py:_pass_1 -->
<!-- node: function:src/arsu-converter/authoring/checkers/temporal.py:_pass_2 -->
<!-- node: function:src/arsu-converter/authoring/checkers/temporal.py:_pass_3 -->
<!-- node: function:src/arsu-converter/authoring/checkers/temporal.py:_pass_4 -->
<!-- node: function:src/arsu-converter/authoring/checkers/temporal.py:_pass_5 -->
<!-- node: function:src/arsu-converter/authoring/checkers/temporal.py:compute -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| _date_to_interval | 函数 | 93–118 | 简单 | date、normalize、temporal、工具函数 | 0 | 把 2025、2025-03、March 2025 等多种日期写法归一为可比的时间区间，供算术与先后判断使用。 |
| _finding | 函数 | 149–183 | 中等 | temporal、finding、结构化输出、工具函数 | 0 | 构造一条时间类 finding：填充 kind、severity、定位句、匹配片段、绑定引用与事件日期和修复建议。 |
| _load_optional | 函数 | 551–572 | 简单 | temporal、input、optional、加载 | 0 | 按需加载可选输入材料（时间线、来源溯源），缺失时返回不可用标记而不是抛错。 |
| _metadata | 函数 | 186–197 | 简单 | temporal、metadata、finding、工具函数 | 0 | 为时间类 finding 组装 metadata 字段，绑定草稿 slug、字符位置与判定理由。 |
| _next_id | 函数 | 137–146 | 简单 | temporal、finding、id、工具函数 | 0 | 为同一类 finding 生成稳定递增编号，保证多次扫描的输出可逐条对照。 |
| _pass_1 | 函数 | 200–249 | 中等 | temporal、pass-1、日期解析、扫描 | 0 | 第一遍：扫描草稿中的显式日期、锚定式过去完成结构与引用标记，建立可用的日期基线。 |
| _pass_2 | 函数 | 260–363 | 复杂 | temporal、pass-2、时间线、扫描 | 0 | 第二遍：结合时间线与来源证据检查时间算术不可能、时代错置引用和指示词表述。 |
| _pass_3 | 函数 | 366–431 | 中等 | temporal、pass-3、因果、扫描 | 0 | 第三遍：只依据时间线检查比较级表述与因果方向是否与已确立的事件顺序一致。 |
| _pass_4 | 函数 | 434–531 | 复杂 | temporal、pass-4、provenance、扫描 | 0 | 第四遍：结合来源溯源检查引用材料的可核查性，产出元数据缺失类 finding。 |
| _pass_5 | 函数 | 534–548 | 简单 | temporal、pass-5、扫描、收尾 | 0 | 第五遍：收尾扫描，检查前四遍遗留的结构性问题并补齐 finding 序号。 |
| compute | 函数 | 575–629 | 中等 | entrypoint、temporal、checker、report | 0 | 时间完整性审计公开入口：加载草稿与可选材料、执行五遍扫描并输出 temporal_audit_report。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| compute | 函数 | 575–629 | 时间完整性审计公开入口：加载草稿与可选材料、执行五遍扫描并输出 temporal_audit_report。 |
