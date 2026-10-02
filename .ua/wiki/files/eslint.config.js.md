
# eslint.config.js
所属分层：[维护工具链与工程基础设施](../layers/tooling.md)  
所属目录：[.](../modules/index.md)
<!-- node: config:eslint.config.js -->

ESLint 扁平配置，对 src/tests/harness 下的 TypeScript 启用 strictTypeChecked 与 projectService 类型感知规则，并排除 dist、vendor、references 与两个 legacy 测试文件。
源码：[eslint.config.js](../../../eslint.config.js)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [check-authored-whitespace.mjs](scripts/check-authored-whitespace.mjs.md) | scripts/check-authored-whitespace.mjs | 行尾空白守卫：默认取 git 变更路径，加载并校验豁免目录的 sha256，跳过二进制与生成的保留 Skill，对 UTF-8 文本逐行报告尾随空白。 |
