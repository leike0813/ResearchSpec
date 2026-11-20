# ToolUniverse v1.5.10 语义审阅

本次审阅以 `v1.5.4-8ec5d4b` 为比较基线。逐能力比对审定 vendor 正文与实际生成的 extension，记录了 130 项能力的 260 个语义点。每项的上游来源、承载文件、相关章节、语义判定和遗留问题见 [absorption-review.json](artifacts/absorption-review.json)。新上游工具声明和调用关系见 [upstream-analysis.md](artifacts/upstream-analysis.md)。

## 投影与内容判定

| 项目 | 结论 |
| --- | --- |
| 准入与领域 | 保留 130 个已准入 ID 和 30 个领域的成员关系 |
| 正文与包树 | 88 个包更新，42 个包与上一锚点逐包哈希相同 |
| Graph profiles | 130 个文件与上一锚点逐字节相同 |
| 知识文件 | 350 个文件与审定 vendor 来源逐字节相同，路径及 manifest 哈希匹配 |
| 执行与验证 | 42 个 mixed、88 个 llm，130 个能力均绑定六字段 brief validator |

本轮修正了退役疾病端点、COSMIC 部分结果、Orange Book 产品级返回、试验注册库去重和证据解释。输入目录中的表格和 notebook 产出可作为证据核验，执行其中的代码须有独立授权。个体因果、病例风险、临床分型及变体良性比例按各自的证据条件报告。蛋白质治疗设计保留上次发布的审定包，当前上游变更仅登记在审计中。

## 流程权威

生成后的能力仅承接一个 advisory node，读取 `task_request` 并输出 `research_brief`。本轮静态扫描覆盖 130 个 `SKILL.md`，正文完整投影到扩展，附加的节点契约、知识索引与资源清单一致。图配置、validator 和工作流写入权限沿用原约束。

## 遗留边界

逐项记录列出了仍需单独验证的继承问题，包括部分跨包引用、某些临床或统计评分的证据口径，以及既有脚本的失败或输入边界。审阅依据固定源码和生成文件。工具凭证、实时接口返回、宿主配置及上游脚本的执行行为未经实测。自动验证项目见 [OpenSpec 任务](../../../openspec/changes/update-tooluniverse-to-v1-5-10/tasks.md)。

## 结论

`declared-fit-with-notes`。静态投影、领域和流程契约通过审阅。遗留条目是现有方法或资源层面的限制，在 [逐能力记录](artifacts/absorption-review.json) 中定位并标注处理情况。
