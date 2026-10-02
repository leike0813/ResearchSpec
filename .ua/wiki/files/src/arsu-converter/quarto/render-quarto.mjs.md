
# src/arsu-converter/quarto/render-quarto.mjs
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/quarto](../../../../modules/src/arsu-converter/quarto.md)
<!-- node: file:src/arsu-converter/quarto/render-quarto.mjs -->

Quarto 渲染辅助脚本：校验源文件、目标路径与输出格式后在临时目录调用 quarto render，原子落盘并返回结构化结果。
源码：[src/arsu-converter/quarto/render-quarto.mjs](../../../../../../src/arsu-converter/quarto/render-quarto.mjs)

## 符号（4）
<!-- node: function:src/arsu-converter/quarto/render-quarto.mjs:parseArgs -->
<!-- node: function:src/arsu-converter/quarto/render-quarto.mjs:probe -->
<!-- node: function:src/arsu-converter/quarto/render-quarto.mjs:render -->
<!-- node: function:src/arsu-converter/quarto/render-quarto.mjs:run -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| parseArgs | 函数 | 99–112 | 简单 | cli、argument-parsing、参数解析 | 0 | 解析命令行参数，把 --source/--output/--format/--execute 等选项归一为选项对象。 |
| probe | 函数 | 66–77 | 简单 | quarto、probe、environment、诊断 | 0 | 探测当前环境是否可用 Quarto，输出可执行文件路径与版本信息供 doctor 类检查使用。 |
| render | 函数 | 22–64 | 中等 | quarto、render、validation、临时目录 | 0 | 执行一次 Quarto 渲染：逐项校验参数、在 mkdtemp 中运行 quarto、成功后把产物链接到目标路径并清理临时目录。 |
| run | 函数 | 79–97 | 简单 | subprocess、quarto、timeout、进程管理 | 0 | 以受限超时和指定工作目录启动子进程，收集退出码与输出并统一转成结果对象。 |
