<!-- ResearchSpec patent contract: ordinary-file index, versioned, outside researchspec/ -->

# 专利文件索引合同 (Patent file index contract, v1)

专利各阶段用一份版本化索引交换普通项目文件。索引写在工作区的普通目录下，不在
`researchspec/` 内，也从不拥有 run、节点、Gate、Decision 或 frontier 状态。

## 索引文档

```json
{
  "schema_version": "1",
  "kind": "case|corpus|disclosure|application|notes|response",
  "files": [{ "role": "<input or output role>", "path": "<project-relative>" }],
  "limitations": [],
  "metadata": {}
}
```

五个字段都是必需字段：`schema_version` 固定 `"1"`，`kind` 取下表六个值之一，
`files` 至少一项且 `role` 不重复，`limitations` 是字符串数组，
`metadata` 是对象——即使是 `{}` 也要写出来。`path` 是项目相对路径。

## kind 只有六个值

| kind | 用于哪个角色 |
|------|--------------|
| `case` | `patent_case` |
| `corpus` | `patent_corpus` |
| `disclosure` | `disclosure_bundle` |
| `application` | `application_bundle` |
| `notes` | `patent_notes` |
| `response` | `oa_response` |

其余角色（`invention_brief`、`search_request`、`search_results`、
`claim_features`、`prior_art_report`、`comparison_materials`、`claim_chart`、
`chart_evidence`、各类 review、`protection_plan`、`patent_map`、
`office_action`、`policy_brief`、`annotated_bibliography`、
`synthesis_report`、`graded_sources`）不是这六种之一，直接产出有语义的普通文件，
不要套用 `kind`。

## schema_ref 与 kind 是两件事

`schema_ref` 是能力清单里的角色契约标识，`kind` 是索引文档自身的分类值；两者
取值不同，互不替代：

| 角色 | `schema_ref` | 索引 `kind` |
|------|---------------|--------------|
| `patent_case` | `patent-case.v1` | `case` |
| `patent_corpus` | `patent-corpus.v1` | `corpus` |
| `disclosure_bundle` | `disclosure-bundle.v1` | `disclosure` |
| `application_bundle` | `application-bundle.v1` | `application` |
| `patent_notes` | `patent-notes.v1` | `notes` |
| `oa_response` | `oa-response.v1` | `response` |

完整角色表见 `contracts/patent-role-schemas.v1.md`。写索引用右列的 `kind`，
汇报角色用左列的 `schema_ref`。

## 规则

- `path` 解析后必须位于 `--project-root` 之内，且不在 `researchspec/` 内。
- `limitations` 逐条记录证据限制与缺失材料；空数组表示本次未识别到限制。
- `metadata` 放本阶段的附加事实，例如 `patent_type`、`case_id`、`round`、
  地图的 `url`。它是自由对象，但只放真实取到的值。
- 版本化修订只新增带时间戳的文件，绝不覆盖已交付文件。
- 索引与笔记都不证明图运行完成；消费方先解析所需文件，产出前报告缺失材料。

## 工具

规范索引由本包 `tools/patent_files.py` 读写，它复用同一份校验：

```bash
python tools/patent_files.py create --project-root <root> --kind disclosure \
  --out <out>/disclosure.index.json --file disclosure=<root>/交底书.md \
  --limitation "附图 2 为手绘草图"
python tools/patent_files.py validate --project-root <root> <out>/disclosure.index.json --kind disclosure
python tools/patent_files.py project --project-root <root> <out>/disclosure.index.json --dest <out>/bundle
```

`create` 只登记已存在的文件，缺文件即报错；`validate` 可加 `--kind` 复核分类；
`project` 按原字节复制到交付目录，保留来源格式边界。两者默认不覆盖既有产物。

## 非索引交接

一个阶段的输出若是普通文件，写一份普通交接说明交给下游即可：列出每个输出角色的
实际路径、生成时的输入与 `limitations`。不要为此发明新的索引 `kind`，也不要写入
run、节点、Gate 或 Decision 字段。
