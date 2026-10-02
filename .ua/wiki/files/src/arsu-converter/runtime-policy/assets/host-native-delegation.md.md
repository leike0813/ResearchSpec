
# src/arsu-converter/runtime-policy/assets/host-native-delegation.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/runtime-policy/assets](../../../../../modules/src/arsu-converter/runtime-policy/assets.md)
<!-- node: document:src/arsu-converter/runtime-policy/assets/host-native-delegation.md -->

宿主原生替身模型复核策略片段：默认使用当前会话模型，只有在宿主已通过原生 subagent 机制暴露某个模型时才可提议，并需就模型、共享内容类别与预期成本单独取得用户确认；分歧只能触发定向复核，不得投票、平均或让 subagent 静默改写已冻结的判断。
源码：[src/arsu-converter/runtime-policy/assets/host-native-delegation.md](../../../../../../../src/arsu-converter/runtime-policy/assets/host-native-delegation.md)
