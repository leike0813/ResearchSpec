
# src/vendor-converters/shared/non-native-skill-standard/templates/extensions
> 目录聚合页：3 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/vendor-converters/shared/non-native-skill-standard/templates/extensions/resource-backed.md](../../../../../../files/src/vendor-converters/shared/non-native-skill-standard/templates/extensions/resource-backed.md.md) | 文档 | 0 | 扩展模板：为带捆绑资源的非原生 Skill 规定资源条目的写法——使用时机、消费者（Agent 流程、捆绑命令或具名外部工具）、资源贡献，以及缺失/过期/不兼容时的校验与失败行为；并禁止把未被消费的 input/output/parameter schema、runner.json、RUNTIME.json 描述成 ResearchSpec 运行时契约。 |
| [src/vendor-converters/shared/non-native-skill-standard/templates/extensions/script-assisted.md](../../../../../../files/src/vendor-converters/shared/non-native-skill-standard/templates/extensions/script-assisted.md.md) | 文档 | 0 | 扩展模板：为脚本辅助型 Skill 规定捆绑命令的完整契约——精确路径、可移植解释器调用命令、输入字段、输出与副作用（含网络、子进程、计算、文件影响）、用户自管依赖，以及失败分类与恢复方式；要求代表性离线或 mock 拷贝树测试，且命令不得导入 ResearchSpec 源码或依赖仓库本地路径。 |
| [src/vendor-converters/shared/non-native-skill-standard/templates/extensions/stateful.md](../../../../../../files/src/vendor-converters/shared/non-native-skill-standard/templates/extensions/stateful.md.md) | 文档 | 0 | 扩展模板：为带 Skill 本地状态与 gate 的 Skill 规定状态根目录、权威状态文件与所有权/写入方、状态转移表（当前状态→所需证据→允许的下一状态→阻塞处理）、gate 调用命令、四步恢复流程与完成条件；同时声明本地状态永不替代 ResearchSpec CLI 的工作流状态、Gate、Decision 与产物登记。 |
