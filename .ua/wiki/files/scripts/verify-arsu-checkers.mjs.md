
# scripts/verify-arsu-checkers.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/verify-arsu-checkers.mjs -->

在不安装依赖的前提下打包当前 CLI，在临时项目中用 symlink 复用 node_modules 与用户 Python 环境，构造语料后以 --json 逐条验证打包内的 ARSU checker 行为。
源码：[scripts/verify-arsu-checkers.mjs](../../../../scripts/verify-arsu-checkers.mjs)
