
# src/arsu-converter/quarto/delivery.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/quarto](../../../../modules/src/arsu-converter/quarto.md)
<!-- node: file:src/arsu-converter/quarto/delivery.ts -->

Quarto 交付层：探测本机 Quarto 可用性，并把单个 .qmd 渲染结果以「临时暂存 + 硬链接」方式原子落地；默认禁用代码执行，执行需独立人工同意记录。
源码：[src/arsu-converter/quarto/delivery.ts](../../../../../../src/arsu-converter/quarto/delivery.ts)

## 符号（5）
<!-- node: function:src/arsu-converter/quarto/delivery.ts:probeQuarto -->
<!-- node: class:src/arsu-converter/quarto/delivery.ts:QuartoDeliveryError -->
<!-- node: function:src/arsu-converter/quarto/delivery.ts:regularFile -->
<!-- node: function:src/arsu-converter/quarto/delivery.ts:renderQuartoSingleFile -->
<!-- node: function:src/arsu-converter/quarto/delivery.ts:runQuartoCommand -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| probeQuarto | 函数 | 64–86 | 中等 | quarto、probe、capability-detection | 0 | 执行 quarto --version 判定可用性，区分 available、unavailable（ENOENT）与 unknown 三种状态并压缩失败原因。 |
| QuartoDeliveryError | 类 | 57–62 | 中等 | error-type、quarto | 0 | 带 code 与可选 details 的 Quarto 交付错误类型。 |
| regularFile | 函数 | 207–217 | 中等 | filesystem、validation、utility | 0 | 以 lstat 断言路径为普通文件，缺失或非普通文件统一抛 QuartoDeliveryError。 |
| renderQuartoSingleFile | 函数 | 88–166 | 复杂 | quarto、render、atomic-write、delivery | 0 | 校验扩展名、符号链接与目标占用后渲染 QMD：先在临时目录产出，再硬链接到目标路径，保证只新增一个文件。 |
| runQuartoCommand | 函数 | 168–205 | 中等 | process-spawn、quarto、timeout | 0 | 基于 spawn 的 Quarto 命令执行器，带超时 SIGKILL、stdout/stderr 收集与 settled 幂等收敛。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [stable-specs.ts](../../core/contracts/stable-specs.ts.md) | src/core/contracts/stable-specs.ts | 稳定 spec 契约：project / sources / claims / manuscript 四类 spec 的 Zod schema、StableId 命名规则与 YAML frontmatter 解析入口。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| probeQuarto | 函数 | 64–86 | 执行 quarto --version 判定可用性，区分 available、unavailable（ENOENT）与 unknown 三种状态并压缩失败原因。 |
| QuartoDeliveryError | 类 | 57–62 | 带 code 与可选 details 的 Quarto 交付错误类型。 |
| regularFile | 函数 | 207–217 | 以 lstat 断言路径为普通文件，缺失或非普通文件统一抛 QuartoDeliveryError。 |
| renderQuartoSingleFile | 函数 | 88–166 | 校验扩展名、符号链接与目标占用后渲染 QMD：先在临时目录产出，再硬链接到目标路径，保证只新增一个文件。 |
| runQuartoCommand | 函数 | 168–205 | 基于 spawn 的 Quarto 命令执行器，带超时 SIGKILL、stdout/stderr 收集与 settled 幂等收敛。 |
