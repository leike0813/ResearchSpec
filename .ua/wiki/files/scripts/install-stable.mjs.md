
# scripts/install-stable.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/install-stable.mjs -->

把当前仓库打成 tarball 并全局安装，用于验证发行版行为：先 pnpm build，再 npm pack、强制移除旧全局包、安装新包，卸载旧全局失败只告警。
源码：[scripts/install-stable.mjs](../../../../scripts/install-stable.mjs)

## 符号（2）
<!-- node: function:scripts/install-stable.mjs:run -->
<!-- node: function:scripts/install-stable.mjs:runBestEffort -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| run | 函数 | 19–28 | 简单 | 子进程、构建工具、错误处理 | 0 | 以 stdio 继承方式执行子命令，退出码非零时抛出带标签的错误。 |
| runBestEffort | 函数 | 30–42 | 简单 | 子进程、容错、构建工具 | 0 | 执行可选子命令（如 which researchspec），启动失败或非零退出只写告警而不中断流程。 |
