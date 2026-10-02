
# src/arsu-converter/runtime-policy/assets/cross-model-verification.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/runtime-policy/assets](../../../../../modules/src/arsu-converter/runtime-policy/assets.md)
<!-- node: document:src/arsu-converter/runtime-policy/assets/cross-model-verification.md -->

宿主原生独立模型复核的运行时策略资产：声明独立复核完全可选、所有 ARSU 工作流仅靠当前会话模型即可完成，并规定派发前主 Agent 必须先冻结自身判断、提出宿主确实可用的模型、披露共享材料类别与成本并取得本次 run 与 node 的同意。
源码：[src/arsu-converter/runtime-policy/assets/cross-model-verification.md](../../../../../../../src/arsu-converter/runtime-policy/assets/cross-model-verification.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [host-native-delegation.md](host-native-delegation.md.md) | src/arsu-converter/runtime-policy/assets/host-native-delegation.md | 宿主原生替身模型复核策略片段：默认使用当前会话模型，只有在宿主已通过原生 subagent 机制暴露某个模型时才可提议，并需就模型、共享内容类别与预期成本单独取得用户确认；分歧只能触发定向复核，不得投票、平均或让 subagent 静默改写已冻结的判断。 |
