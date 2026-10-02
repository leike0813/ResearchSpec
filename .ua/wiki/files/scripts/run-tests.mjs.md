
# scripts/run-tests.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/run-tests.mjs -->

递归收集 .test-dist/tests 下编译产物中的 *.test.js，交由 node --test 执行，并设置 PYTHONDONTWRITEBYTECODE 避免写出字节码。
源码：[scripts/run-tests.mjs](../../../../scripts/run-tests.mjs)

## 符号（1）
<!-- node: function:scripts/run-tests.mjs:collect -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| collect | 函数 | 17–26 | 简单 | 目录遍历、测试入口、工具函数 | 0 | 递归收集目录中的所有普通文件路径，供测试运行器枚举编译后的测试文件。 |
