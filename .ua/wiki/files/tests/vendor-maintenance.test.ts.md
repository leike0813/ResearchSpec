
# tests/vendor-maintenance.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/vendor-maintenance.test.ts -->

校验共享 vendor 维护库：文件哈希能区分非法 UTF-8 字节，且未审阅基线被保护、显式锚点才会生成产物与记录。
源码：[tests/vendor-maintenance.test.ts](../../../../tests/vendor-maintenance.test.ts)

## 符号（3）
<!-- node: function:tests/vendor-maintenance.test.ts:loadMaintenanceModule -->
<!-- node: function:tests/vendor-maintenance.test.ts:maintenance-protects-an-unreviewed-baseline-and-honors-t -->
<!-- node: function:tests/vendor-maintenance.test.ts:shared-maintenance-file-hashes-distinguish-invalid-utf-8 -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| loadMaintenanceModule | 函数 | 32–35 | 简单 | test、helper、dynamic-import | 0 | 以 file URL 动态导入共享维护库并返回其类型化接口。 |
| maintenance-protects-an-unreviewed-baseline-and-honors-t | 函数 | 59–91 | 中等 | test、用例、断言 | 0 | 测试用例：maintenance protects an unreviewed baseline and honors the artifact anchor |
| shared-maintenance-file-hashes-distinguish-invalid-utf-8 | 函数 | 37–57 | 中等 | test、用例、断言 | 0 | 测试用例：shared maintenance file hashes distinguish invalid UTF-8 bytes |
