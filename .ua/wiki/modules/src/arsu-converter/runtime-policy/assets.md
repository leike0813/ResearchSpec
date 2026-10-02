
# src/arsu-converter/runtime-policy/assets
> 目录聚合页：3 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/arsu-converter/runtime-policy/assets/cross-model-verification.md](../../../../files/src/arsu-converter/runtime-policy/assets/cross-model-verification.md.md) | 文档 | 0 | 宿主原生独立模型复核的运行时策略资产：声明独立复核完全可选、所有 ARSU 工作流仅靠当前会话模型即可完成，并规定派发前主 Agent 必须先冻结自身判断、提出宿主确实可用的模型、披露共享材料类别与成本并取得本次 run 与 node 的同意。 |
| [src/arsu-converter/runtime-policy/assets/host-native-delegation.md](../../../../files/src/arsu-converter/runtime-policy/assets/host-native-delegation.md.md) | 文档 | 0 | 宿主原生替身模型复核策略片段：默认使用当前会话模型，只有在宿主已通过原生 subagent 机制暴露某个模型时才可提议，并需就模型、共享内容类别与预期成本单独取得用户确认；分歧只能触发定向复核，不得投票、平均或让 subagent 静默改写已冻结的判断。 |
| [src/arsu-converter/runtime-policy/assets/model-tiering.md](../../../../files/src/arsu-converter/runtime-policy/assets/model-tiering.md.md) | 文档 | 0 | 宿主原生模型选型策略：ResearchSpec 不推断厂商模型阵容、不为质量档位指派固定模型族，economy 与 quality-boost 建议只有在 Agent 能指名宿主已暴露的模型、且用户单独确认模型与成本时才可用，未知或不可用时回退当前会话模型并披露说明。 |
