# ARSU Workflow Contract Mapping

## 1. 目的

本文定义四个 ARSU Skills 如何使用 ResearchSpec current contracts。Routing catalog 拥有 25 个
standalone modes 和 2 个 pipeline entries 的前置、输出、Gate、risk/cost 与确认摘要；converter
workflow source 拥有 academic-pipeline graph。

## 2. 统一 route 边界

每条 route 声明：

- stable-spec prerequisites；
- upstream handoff input roles；
- boundary output role、type、purpose、structure 与 validation profile；
- formal Gates；
- effort 与 interaction cost；
- `start_confirmation: required`。

Catalog 不声明 artifact ID、固定输出路径或运行状态。实际路径由用户/Agent 选择，并写入 producing
subflow 的 handoff。

## 3. Skill 映射

- `deep-research` 读取 project/source/claim contracts，产生 RQ brief、bibliography、corpus、
  synthesis 或 research report；接受的 stable facts 再进入 owning specs。
- `academic-paper` 读取 project/claims/manuscript 与 handoff inputs，产生 outline、draft、audit、
  revision、response 或 formatted output。Revision mode 可产生 ARSU revision patch。
- `academic-paper-reviewer` 对 handoff-referenced manuscript 做只读 review/re-review，输出 report、
  editorial decision 和 roadmap，不直接修改稿件或 control。
- `academic-pipeline` parent 只协调 profile frontier；每个 child、branch 和 revision round 独立确认。

## 4. Pipeline graph

Project profile 声明 end-to-end、mid-entry、research、write、integrity、review、revision、finalize 和
summary 之间的 nodes、joins、Gates 与 transitions。Child control 的 parent reference 是唯一存储的
关系；parent 不维护 children 列表。Dynamic revision round 由 profile template 实例化，并分别
启动 revision 与 re-review child。

## 5. 权威边界

ARSU producer 可以直接写 stable specs、project change、handoff 和外部语义文件；工作材料保存在
owning subflow 的 `work/`。它不能手改 control。Formal Gate findings 由 Verify 准备、用户确认，
再由 Decide/CLI 写入 owning control；advance 是独立动作。

Provider、plugin、Zotero 与 upstream ARS payload 都是工作输入。它们不能创建 ResearchSpec
authority，也不能跳过当前 profile、Gate、Decision 或 confirmation。

## 6. Converter 约束

Converter 只注入 current preflight、route summary 和 anchor replacement。它保留不在替换范围内的
upstream ARSU 历史文字，不把历史 markers 当作运行权威。Generated Skills、routing catalog、
profile projection、replacement report 和 manifest 必须通过 coverage 与 idempotence 检查。
