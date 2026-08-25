# ResearchSpec Contract Schema Design

## 1. 设计原则

Current workspace 使用 schema `"2"`。合同面向人类可读、Agent 可维护、脚本可校验：领域事实有
唯一 owner；早期研究允许内容不完整；稳定事实与运行状态分离；外部交付物通过 handoff role/path
传递；高影响变化保留 current/proposed 分离。

## 2. Workspace

```text
researchspec/
  config.yaml
  tool-installation-manifest.json
  profiles/<profile-id>.yaml
  specs/project.md
  specs/sources.yaml
  specs/claims.yaml
  specs/manuscript.yaml
  changes/<change-id>/
  runs/<run-id>/run.yaml
  runs/<run-id>/graph.yaml
  runs/<run-id>/handoff.md
  runs/<run-id>/nodes/<node-instance>.yaml
```

`config.yaml` 保存 schema version 和静态选择。Manifest 只拥有生成投影，不拥有 stable specs、
runs、nodes、handoffs、changes 或外部文件。

## 3. Stable specs

- `project.md` 保存 project ID、研究问题、范围、约束和贡献意图。
- `sources.yaml` 保存 source ID、bibliographic identifiers、用途和限制。
- `claims.yaml` 保存 claim ID、允许措辞、强度、support source IDs、scope 和 limits。
- `manuscript.yaml` 保存体裁、语言、受众、venue、格式约束、结构意图和 delivery 选择。

Sources 和 claims 允许空数组，manuscript 的 intake 字段可为空。已经存在的引用必须解析到已知 ID。

## 4. Graph profiles 与 runtime state

Converter-owned profile registry 是 preset graphs 的生成事实源。Profile 声明 entries、nodes、
dependencies、parallel/join、Gates、Decisions、child profile bindings 和 repeatable templates。

根 run 的 `run.yaml` 保存入口、授权来源和生命周期；`graph.yaml` 冻结启动时 profile。Child run 记录
typed parent binding 并继承父 graph 授权。每个 node instance 保存自己的状态、outputs、Gate
attempts、overrides 和 Decisions。只有 CLI 可以修改这些运行状态。

## 5. Handoff

Run `handoff.md` 使用 machine-readable YAML frontmatter 和自由 Markdown。Input/output 包含唯一
role、semantic type、安全项目相对 path 和 purpose；稿件条目还声明 format。Input 可声明 source
run，output 可声明 intended consumer 与 limits。

路径必须位于项目内且在 `researchspec/` 外，不能包含 traversal、反斜杠歧义或 symlink escape。
普通结构检查不要求文件存在；消费动作才验证目标可读。

## 6. Project change 与 revision patch

Project change 至少包含 `change.md`，可选 `design.md`、`tasks.md` 和 `delta.yaml`。Accepted 只记录
决定；目标 spec 显式修改并验证后才能标记 applied。

ARSU `revision_patch` 是唯一稿件 patch 合同。它是外部边界文件，可由 stateless helper 根据显式
base、patch、output 和 report path 应用，不进入 ResearchSpec lifecycle。

## 7. 校验

Validation 覆盖 schema、cross-reference、safe path、duplicate ID、profile registry、frozen graph、
parent binding、node/handoff 关系和 manifest drift。诊断指出具体 owner 与路径，不修改语义文件，
也不推断学术判断。

Quarto helper 只处理项目外 `.qmd` 和一个目标，默认 no-execute；代码执行 consent 按当前 run/node
单独确认。Helper 在 staging 输出通过后原子交付，失败或目标已存在时不覆盖、不更新成功 handoff。
