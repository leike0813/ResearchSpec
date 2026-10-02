
# sandboxCommand
<!-- node: function:scripts/dogfood/hosts.mjs:sandboxCommand -->

构造 bubblewrap 沙箱命令：tmpfs 覆盖家目录，仅暴露运行时、ResearchSpec 构建产物、宿主凭据与本次证据，并重写 HOME/PATH/XDG 环境。
类型：函数  
复杂度：复杂  
入边数：2  
标签：sandbox、security、adapter、isolation  
所属文件：[scripts/dogfood/hosts.mjs](../../../../files/scripts/dogfood/hosts.mjs.md)
源码：[scripts/dogfood/hosts.mjs:74](../../../../../../scripts/dogfood/hosts.mjs#L74)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [assessment-worker.mjs](../../../../files/scripts/dogfood/assessment-worker.mjs.md) | scripts/dogfood/assessment-worker.mjs:— | 验收 worker 入口：组装场景、尝试与评分量表 packet，在 bubblewrap 沙箱内以只读证据目录驱动验收 Agent，读取其 assessment.json 并交回校验落盘，失败时写入状态与原因。 |
| [hostRun](../../../../files/scripts/dogfood/worker.mjs.md) | scripts/dogfood/worker.mjs:132–173 | 在 bubblewrap 沙箱内驱动宿主 Agent 流式执行，按适配器解码事件、记录有意义的行动与观测模型，并处理超时与协议失败。 |

## 调用

该符号没有记录对外调用。
