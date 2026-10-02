
# src/arsu-converter/runtime-policy/assets/model-tiering.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/runtime-policy/assets](../../../../../modules/src/arsu-converter/runtime-policy/assets.md)
<!-- node: document:src/arsu-converter/runtime-policy/assets/model-tiering.md -->

宿主原生模型选型策略：ResearchSpec 不推断厂商模型阵容、不为质量档位指派固定模型族，economy 与 quality-boost 建议只有在 Agent 能指名宿主已暴露的模型、且用户单独确认模型与成本时才可用，未知或不可用时回退当前会话模型并披露说明。
源码：[src/arsu-converter/runtime-policy/assets/model-tiering.md](../../../../../../../src/arsu-converter/runtime-policy/assets/model-tiering.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [host-native-delegation.md](host-native-delegation.md.md) | src/arsu-converter/runtime-policy/assets/host-native-delegation.md | 宿主原生替身模型复核策略片段：默认使用当前会话模型，只有在宿主已通过原生 subagent 机制暴露某个模型时才可提议，并需就模型、共享内容类别与预期成本单独取得用户确认；分歧只能触发定向复核，不得投票、平均或让 subagent 静默改写已冻结的判断。 |
