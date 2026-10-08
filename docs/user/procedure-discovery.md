# Procedure 发现

直接用原始任务检索，无需先翻译成英文关键词：

```sh
researchspec list procedures --query "整理这一领域的文献，并找出研究空白" --json
researchspec show procedure:<返回的ID> --json
researchspec instructions procedure:<返回的ID> --json
```

紧凑卡片包含用途、输入输出角色和匹配依据。选择时检查实际材料能否满足输入，以及输出能否完成
任务。相似度只辅助排序，不能证明适用或授权执行。完整执行契约来自最后一步的 activation packet。
相关未完成 run 仍优先于新的 standalone 检索。

卡片的静态 eligibility 说明是否需要工作区、选择域，或选中域是否不可用。它不授权插件安装，也不
保证当前材料适合执行。选择上下文变化后重新分页，不能继续使用旧 cursor。

普通工作在材料不明、交接或恢复时可按需检查，不需要每次都运行检查：

```sh
researchspec instructions procedure:<id> --input materials.yaml --json
researchspec check procedure:<id> --input delivered.yaml --json
```

```yaml
inputs:
  - role: manuscript_source
    path: work/article.md
  - role: user_notes
    value: 请保留结论的证据限制。
outputs:
  - role: intake_report
    path: work/intake.md
```

`instructions` 中的输出是计划位置，文件可以尚未生成；`check` 核对实际交付文件。省略一个数组
表示未检查，显式空数组会检查声明缺项。未知、重复或缺少角色默认产生非阻塞观察；显式
`--strict` 可以让本次 check 因警告失败。检查不执行 validator 脚本、不证明学术充分性，也不
产生执行或完成凭证。没有 manifest 的 Procedure 会说明声明范围未知。

缺材料只暂停依赖它的工作。普通任务可以交付有明确限制的部分成果；没有现成角色衔接时，Agent
可以核对内容并用原生能力转换或继续，同时说明未满足的 Procedure 契约。

省略 `--query` 会分页浏览。显式空白、标点或仅停用词的查询返回 `procedure_query_empty`；
正常离线查询无匹配返回空列表。中文、英文及混合语言是内置词表的优先范围；其他文字仍保留，
跨语言近义表达可由可选本地模型补充。分页 cursor 绑定查询、目录、实际后端和排序；这些变化后
重新检索，不能沿用旧 cursor。

## 选择检索方式

离线检索无需下载，使用 Unicode 分词、概念别名与加权 BM25。首次交互式初始化会分行说明用途、
下载量、额外 runtime 空间和共享缓存路径，再询问是否开启 hybrid；非交互模式默认 offline，
`--yes` 本身不代表同意下载。也可明确选择：

```sh
researchspec init --tools codex --procedure-search hybrid
researchspec update --procedure-search hybrid
researchspec update --procedure-search offline
```

hybrid 使用固定版本的 `Xenova/multilingual-e5-small`，在 CPU 上将词法和语义候选合并排序。
模型与 tokenizer 约 140 MB，独立 runtime 还需要额外下载和磁盘空间。准备包含下载、锁定依赖安装、
模型自检和公开目录向量生成，每次准备最长十分钟。过程中显示当前阶段、实际下载字节与百分比，
以及目录向量生成进度；安装 runtime 和自检使用阶段提示。下载只在这个明确准备步骤发生，研究材料和查询文本
不会上传。已有工作区省略选项保留模式，也不会隐式准备。`--dry-run` 只预览。

## 缓存与恢复

缓存位于用户 OS 缓存目录，命令输出中的 `cache_root` 给出实际路径；可用
`RESEARCHSPEC_SEARCH_CACHE` 指定其他共享位置。模型与 runtime 不属于项目依赖，不进入
`researchspec/`、安装 manifest 或 context pack。查询只读，禁止联网、安装或修复缓存。

同一用户的多个项目共享这个缓存：模型和 runtime 版本相同时直接复用，公开目录相同时也复用
向量索引。目录变化只生成对应的新索引，不重复下载模型。同一缓存中的准备和清理操作互斥，
另一个进程正在操作时会提示稍后重试。

结果的 `retrieval.requested_mode` 表示配置选择，`effective_mode` 表示本次实际后端，
`fallback_reason` 解释回退。缺失或不适用的缓存、不可加载的 CPU runtime，以及十秒内未完成的
推理都会回退 offline；超时子进程会被终止。准备失败仍保留 hybrid 选择并交付可用的离线初始化。

交互准备失败会显示原因，并提供“重试”或“暂时使用离线检索”，默认选择后者。
每次主动重试都有新的十分钟预算，已成功发布的资源可以复用；失败的模型阶段会重新下载，
不提供断点续传。选择暂时离线仍保留 hybrid 偏好，非交互模式不自动重试。

`status`、`check` 和普通 `doctor` 只检查缓存与目录身份，不加载模型。目录更新或缓存异常时，明确运行
`update --procedure-search hybrid` 重新准备；不需要模型时选择 offline。无需为继续学术工作修复模型。

查看和清理缓存不需要 ResearchSpec 工作区：

```sh
researchspec doctor search-cache
researchspec doctor search-cache --json
researchspec doctor search-cache --clear --dry-run
researchspec doctor search-cache --clear
researchspec doctor search-cache --clear --yes --json
```

查看报告实际路径、受管条目及空间占用。`--clear` 删除所有版本的受管模型、runtime、目录索引和
准备残留，保留缓存根目录和未识别文件；不跟随删除路径中的符号链接，也不修改项目配置或研究文件。
交互清理先说明共享影响，确认默认否；非交互清理必须同时提供 `--yes`，`--force` 不能替代确认。
`--dry-run` 只预览，不创建目录、锁文件或执行删除。

清理会影响所有共享此缓存的项目。它们保留 hybrid 偏好并回退离线；在需要恢复的项目运行
`researchspec update --procedure-search hybrid` 即可重新准备。清理未完成时会报告已清理和失败的路径。
