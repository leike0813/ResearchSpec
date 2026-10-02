
# tests/authored-whitespace.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/authored-whitespace.test.ts -->

表格化验证 authored whitespace 检查器：字节保留且哈希一致的豁免被接受，而新增尾随空白、被改动的豁免字节和缺少小写 SHA-256 的豁免都被拒绝。
源码：[tests/authored-whitespace.test.ts](../../../../tests/authored-whitespace.test.ts)

## 符号（5）
<!-- node: function:tests/authored-whitespace.test.ts:authored-whitespace-checker-accepts-an-exact-hash-verifi -->
<!-- node: function:tests/authored-whitespace.test.ts:authored-whitespace-checker-rejects-authored-whitespace -->
<!-- node: function:tests/authored-whitespace.test.ts:createFixture -->
<!-- node: function:tests/authored-whitespace.test.ts:hash -->
<!-- node: function:tests/authored-whitespace.test.ts:runChecker -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| authored-whitespace-checker-accepts-an-exact-hash-verifi | 函数 | 14–23 | 中等 | test、用例、断言 | 0 | 测试用例：authored whitespace checker accepts an exact hash-verified byte-preserved exemption |
| authored-whitespace-checker-rejects-authored-whitespace | 函数 | 25–54 | 中等 | test、用例、断言 | 0 | 测试用例：authored whitespace checker rejects authored whitespace and invalid exemptions |
| createFixture | 函数 | 56–81 | 中等 | test、fixture、helper | 0 | 生成临时夹具：资源文件、证据账本和豁免目录三件套，可按选项控制豁免开关、声明内容或省略哈希。 |
| hash | 函数 | 90–92 | 简单 | test、hash、helper | 0 | 计算字符串的 SHA-256 十六进制摘要，用于构造豁免声明。 |
| runChecker | 函数 | 83–88 | 简单 | test、helper、subprocess | 0 | 以指定 root、catalog 和候选路径调用 authored whitespace 检查器并返回子进程结果。 |
