
# tests/revision-master-audit.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/revision-master-audit.test.ts -->

校验 revision-master 的固定快照证据：SOURCE.json 声明的上游提交、upstream 各 blob 就位、审计 JSON 的计数与 8 条已批准适配，以及 45 个抽取产物逐个哈希复现。
源码：[tests/revision-master-audit.test.ts](../../../../tests/revision-master-audit.test.ts)

## 符号（6）
<!-- node: function:tests/revision-master-audit.test.ts:audits-revision-master-snapshot-13e69610-holds-immutable -->
<!-- node: function:tests/revision-master-audit.test.ts:audits-revision-master-snapshot-13e69610-set-hash-reprod -->
<!-- node: function:tests/revision-master-audit.test.ts:revision-master-extraction-index-verifies-against-the-pi -->
<!-- node: function:tests/revision-master-audit.test.ts:sha256 -->
<!-- node: function:tests/revision-master-audit.test.ts:vendor-revision-master-source-json-declares-the-upstream -->
<!-- node: function:tests/revision-master-audit.test.ts:vendor-revision-master-upstream-stages-every-tracked-blo -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| audits-revision-master-snapshot-13e69610-holds-immutable | 函数 | 35–57 | 中等 | test、用例、断言 | 0 | 测试用例：audits/revision-master/snapshot-13e69610 holds immutable machine evidence |
| audits-revision-master-snapshot-13e69610-set-hash-reprod | 函数 | 59–64 | 中等 | test、用例、断言 | 0 | 测试用例：audits/revision-master/snapshot-13e69610 set hash reproduces from staged bytes |
| revision-master-extraction-index-verifies-against-the-pi | 函数 | 66–77 | 中等 | test、用例、断言 | 0 | 测试用例：revision-master extraction index verifies against the pinned snapshot |
| sha256 | 函数 | 10–12 | 简单 | test、hash、helper | 0 | 计算文本或字节缓冲的 SHA-256 十六进制摘要。 |
| vendor-revision-master-source-json-declares-the-upstream | 函数 | 14–23 | 中等 | test、用例、断言 | 0 | 测试用例：vendor/revision-master/SOURCE.json declares the upstream snapshot |
| vendor-revision-master-upstream-stages-every-tracked-blo | 函数 | 25–33 | 中等 | test、用例、断言 | 0 | 测试用例：vendor/revision-master/upstream stages every tracked blob |
