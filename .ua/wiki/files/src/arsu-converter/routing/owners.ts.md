
# src/arsu-converter/routing/owners.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/routing](../../../../modules/src/arsu-converter/routing.md)
<!-- node: file:src/arsu-converter/routing/owners.ts -->

ARSU 路由归属判定的极小实现：从 routeRef 取出 owner 并判断该路由是否由独立 profile 拥有，当前独立路由集合为空。
源码：[src/arsu-converter/routing/owners.ts](../../../../../../src/arsu-converter/routing/owners.ts)

## 符号（3）
<!-- node: function:src/arsu-converter/routing/owners.ts:isStandaloneRoute -->
<!-- node: function:src/arsu-converter/routing/owners.ts:routeOwner -->
<!-- node: function:src/arsu-converter/routing/owners.ts:standaloneProfileOwner -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| isStandaloneRoute | 函数 | 14–16 | 简单 | routing、predicate、工具函数 | 0 | 判断给定路由是否由独立 profile 拥有，是则返回 true。 |
| routeOwner | 函数 | 5–7 | 简单 | routing、owner、工具函数 | 0 | 取 routeRef 的冒号前缀作为归属 owner。 |
| standaloneProfileOwner | 函数 | 9–12 | 简单 | routing、profile、工具函数 | 0 | 仅当 owner 已登记在独立路由表中时返回该 owner，否则返回 undefined。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| isStandaloneRoute | 函数 | 14–16 | 判断给定路由是否由独立 profile 拥有，是则返回 true。 |
| routeOwner | 函数 | 5–7 | 取 routeRef 的冒号前缀作为归属 owner。 |
| standaloneProfileOwner | 函数 | 9–12 | 仅当 owner 已登记在独立路由表中时返回该 owner，否则返回 undefined。 |
