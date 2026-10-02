
# tests/quarto-delivery.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/quarto-delivery.test.ts -->

验证 Quarto 探测的可用/不可用/未知三态、单文件渲染默认不执行命令，以及执行同意、既有目标与渲染失败时的 fail-closed 行为。
源码：[tests/quarto-delivery.test.ts](../../../../tests/quarto-delivery.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](helpers/cli.ts.md) | tests/helpers/cli.ts | CLI 测试夹具：用 spawnSync 运行编译产物、解析 envelope 响应，并创建与清理临时项目目录。 |
| [index.ts](../src/arsu-converter/quarto/index.ts.md) | src/arsu-converter/quarto/index.ts | Quarto 交付子系统的 barrel 出口，re-export 探测、单文件渲染、命令执行与相关类型。 |
