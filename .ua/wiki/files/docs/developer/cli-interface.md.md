
# docs/developer/cli-interface.md
所属分层：[文档与文档站层](../../../layers/documentation.md)  
所属目录：[docs/developer](../../../modules/docs/developer.md)
<!-- node: document:docs/developer/cli-interface.md -->

CLI 控制面契约：给出 status→instructions→start/decide/advance 的调用协议、十六个顶层命令的职责表、start 的根 run 与 child subgraph 两种形态、安全项目相对路径合同，以及 Gate/Decision/Plugin 的独立确认边界。
源码：[docs/developer/cli-interface.md](../../../../../docs/developer/cli-interface.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [runtime_protocols.md](runtime/runtime_protocols.md.md) | docs/developer/runtime/runtime_protocols.md | CLI 与运行时协议：展开 list→show→instructions 的只读发现链、standalone 与 graph 两种 packet 语义、Quarto 探测时机、boundary file 的 role/type/path 记录方式、Gate 与 change 生命周期，以及恢复与失败时的只读 doctor 边界。 |
