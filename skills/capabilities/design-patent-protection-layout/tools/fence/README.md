# 专利保护布局工具

`check_layout.py` 校验分解、突围、矩阵和族树；`check_scorecard.py` 校验立项后的作答表。
`layout_lib.py`、`family_lib.py` 与 `scorecard_lib.py` 为入口提供支持，不独立运行。

从当前包目录执行：

```sh
python tools/fence/check_layout.py --decompose <目录>/fence/decompose.yaml
python tools/fence/check_layout.py --family <目录>/fence/family.yaml --matrix <目录>/fence/matrix.yaml
python tools/fence/check_scorecard.py --answers <目录>/fence/scorecard.yaml --case-dir <目录>
```

说明稿由当前 Procedure 根据实际材料编写。机器结果回写说明稿的立项校验部分，
不得作为人工布局 Gate 的替代，也不得自行启动交底或申请任务。
