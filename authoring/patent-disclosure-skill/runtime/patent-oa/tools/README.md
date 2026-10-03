# 审查答复工具

`oa_history.py` 对显式选定的项目案例目录执行 `ingest`、`search` 和 `score`。
入库输入必须已脱敏并标记 `redacted: true`；保存带版本的普通案例文件。
检索读取本地文本、标签或用户已提供的向量，评分比较证据支持、答复覆盖和权要保留程度，
并分别记录已确认历史结果。评分不表示授权概率。

先读当前 Procedure 的参数、输入和路径约束，或运行对应子命令的 `--help`。
案例目录、请求文件和输出位于普通项目目录中；工具不拥有图状态。

确认采用的意见陈述草稿通过 `emit_opinion_docx.py -i <意见陈述.md>` 生成 Word；
`md_to_docx.py`、`math_to_omml.py`、`math_render.py` 和 `latex_delimiters.py`
支持正文、公式及括号检查，使用宿主已配置的依赖。
`emit_chart.py --json <payload.json> --into <本次目录>` 输出 Excel 对照表，
同目录的 `highlights.py`、`xlsx_minimal.py` 和 `write_intake.py` 提供配套处理。

案例历史、原始意见、申请材料、修改依据和草稿保持可区分的版本；缺少资料时明确列为未核查。
