
# scripts/check-authored-whitespace.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/check-authored-whitespace.mjs -->

行尾空白守卫：默认取 git 变更路径，加载并校验豁免目录的 sha256，跳过二进制与生成的保留 Skill，对 UTF-8 文本逐行报告尾随空白。
源码：[scripts/check-authored-whitespace.mjs](../../../../scripts/check-authored-whitespace.mjs)

## 符号（4）
<!-- node: function:scripts/check-authored-whitespace.mjs:changedPaths -->
<!-- node: function:scripts/check-authored-whitespace.mjs:loadVerifiedExemptions -->
<!-- node: function:scripts/check-authored-whitespace.mjs:normalizeRelativePath -->
<!-- node: function:scripts/check-authored-whitespace.mjs:parseArguments -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| changedPaths | 函数 | 90–100 | 简单 | 校验、git-diff、候选路径 | 0 | 调用 git diff 获取相对基线变更的文件列表，作为待检查候选路径。 |
| loadVerifiedExemptions | 函数 | 43–88 | 中等 | 校验、哈希校验、豁免 | 0 | 读取豁免目录并逐条重算文件 sha256，只有字节完全匹配才接受该豁免，否则报错。 |
| normalizeRelativePath | 函数 | 123–132 | 简单 | 路径处理、安全边界、校验 | 0 | 把输入路径规范化为仓库相对形式，并拒绝越界或非法的路径写法。 |
| parseArguments | 函数 | 109–121 | 简单 | 参数解析、cli、校验 | 0 | 解析 --root、--base、--catalog 与显式路径参数，缺省时回落到当前工作目录与默认目录。 |
