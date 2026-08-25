# 稿件批注 Intake Adapter

## 1. 定位

Annotation intake 是 `researchspec/` 外的普通工作材料。建议保存在明确的项目路径：

```text
work/annotation-intake/<session-id>/
```

它把原稿、自由格式反馈、机械 block delta、Agent interpretation 和 revision patch mapping 分开保存，
但不拥有 Gate、Decision、node lifecycle 或稿件版本。

## 2. 数据分层

- Raw source 保存用户实际提供的反馈或审阅文件，不补写缺失内容。
- Review copy 可加入便于人类批注的提示，但提示不是解析语法。
- Mechanical delta 只记录可确定的 block change。
- Normalized interpretation 保存 stable annotation ID、解释、歧义和所需澄清。
- Patch mapping 将 annotation IDs 映射到 ARSU revision patch operations。

Raw observation、normalized interpretation 和最终学术判断必须明确分开。模糊或高影响批注在用户
确认前保持 pending。

## 3. 跨边界使用

另一个 run 需要消费 annotation set 时，Agent 在 producing run handoff 中记录 role、type、path、
purpose 和 consumer。Working directory 本身不会自动成为接口。

## 4. Headless API

公开 `researchspec/annotation-intake` export 接受显式 source/destination paths，生成 review copy、
机械 delta 或 normalized candidate，并返回结构化 diagnostics。API 不加载 workspace runtime state，
也不推进 graph。输入无效、source drift、path escape 或 mapping 缺失时不写 completed output。

## 5. Revision helper

ARSU revision patch 是唯一稿件 patch contract。Stateless helper 在写 destination 前校验全部 block、
old hash 和 annotation mapping。Mechanical application 成功不等于 revision completeness；formal
verdict 仍由 Verify、用户和 owning node 完成。
