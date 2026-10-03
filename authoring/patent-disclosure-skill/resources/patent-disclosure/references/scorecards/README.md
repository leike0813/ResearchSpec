# 保护布局评分表

`gbt42748_fence.yaml` 提供法律、技术、经济与布局可行性维度的弱校验。
用于立项之后判断至少一篇外围是否可写、材料是否足够，结果与作答表写入布局说明稿。
未决项不得正分，评分不表示高价值认证，也不代替人工布局确认。

按下列顺序加载整张表，后者整表替换前者：

1. 包内 `references/scorecards/gbt42748_fence.yaml`；
2. 明确配置的 `PATENT_DISCLOSURE_SCORECARD` YAML；
3. 案件根目录或 `fence/` 下的 `fence_scorecard.yaml`。

换表保持 `id`、`items`、`thresholds` 形状，详细结构见 `references/schemas/scorecard.schema.yaml`。

```sh
python tools/fence/check_scorecard.py --table
python tools/fence/check_scorecard.py --answers <案件目录>/fence/scorecard.yaml --case-dir <案件目录>
```
