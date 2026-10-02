
# src/arsu-converter/authoring/checkers/runner.py
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/checkers](../../../../../modules/src/arsu-converter/authoring/checkers.md)
<!-- node: file:src/arsu-converter/authoring/checkers/runner.py -->

七个内建检查器的统一命令行入口：既可按 --generate 打印计算报告，也可只读比对已提交报告是否与当前输入一致。
源码：[src/arsu-converter/authoring/checkers/runner.py](../../../../../../../src/arsu-converter/authoring/checkers/runner.py)

## 符号（3）
<!-- node: function:src/arsu-converter/authoring/checkers/runner.py:main -->
<!-- node: function:src/arsu-converter/authoring/checkers/runner.py:paths -->
<!-- node: function:src/arsu-converter/authoring/checkers/runner.py:strict_json -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| main | 函数 | 56–86 | 中等 | cli、entrypoint、checker、报告比对 | 0 | 解析 check 与 submission 参数，动态导入对应检查模块、计算报告并与已提交输出做规范化比对，失败时输出 checker_input_invalid。 |
| paths | 函数 | 38–53 | 简单 | validation、paths、input、校验 | 0 | 校验 role/path 数组：要求绝对路径、材料存在、role 非空且不重复，返回 role 到 Path 的映射。 |
| strict_json | 函数 | 25–35 | 简单 | json、strict、validation、解析 | 0 | 严格 JSON 解析：拒绝重复键与非有限数字，避免规范化比对时被静默改写。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| main | 函数 | 56–86 | 解析 check 与 submission 参数，动态导入对应检查模块、计算报告并与已提交输出做规范化比对，失败时输出 checker_input_invalid。 |
| paths | 函数 | 38–53 | 校验 role/path 数组：要求绝对路径、材料存在、role 非空且不重复，返回 role 到 Path 的映射。 |
| strict_json | 函数 | 25–35 | 严格 JSON 解析：拒绝重复键与非有限数字，避免规范化比对时被静默改写。 |
