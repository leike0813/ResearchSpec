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

省略 `--query` 会分页浏览。显式空白、标点或仅停用词的查询返回 `procedure_query_empty`；
正常离线查询无匹配返回空列表。中文、英文及混合语言是内置词表的优先范围；其他文字仍保留，
跨语言近义表达可由可选本地模型补充。分页 cursor 绑定查询、目录、实际后端和排序；这些变化后
重新检索，不能沿用旧 cursor。

## 选择检索方式

离线检索无需下载，使用 Unicode 分词、概念别名与加权 BM25。首次交互式初始化会询问是否开启
hybrid；非交互模式默认 offline，`--yes` 本身不代表同意下载。也可明确选择：

```sh
researchspec init --tools codex --procedure-search hybrid
researchspec update --procedure-search hybrid
researchspec update --procedure-search offline
```

hybrid 使用固定版本的 `Xenova/multilingual-e5-small`，在 CPU 上将词法和语义候选合并排序。
模型与 tokenizer 约 140 MB，独立 runtime 还需要额外下载和磁盘空间。准备包含下载、锁定依赖安装、
模型自检和公开目录向量生成，最长十分钟。下载只在这个明确准备步骤发生，研究材料和查询文本
不会上传。已有工作区省略选项保留模式，也不会隐式准备。`--dry-run` 只预览。

## 缓存与恢复

缓存位于用户 OS 缓存目录，命令输出中的 `cache_root` 给出实际路径；可用
`RESEARCHSPEC_SEARCH_CACHE` 指定其他共享位置。模型与 runtime 不属于项目依赖，不进入
`researchspec/`、安装 manifest 或 context pack。查询只读，禁止联网、安装或修复缓存。

结果的 `retrieval.requested_mode` 表示配置选择，`effective_mode` 表示本次实际后端，
`fallback_reason` 解释回退。缺失或不适用的缓存、不可加载的 CPU runtime，以及十秒内未完成的
推理都会回退 offline；超时子进程会被终止。准备失败仍保留 hybrid 选择并交付可用的离线初始化。

`status`、`check` 和 `doctor` 只检查缓存与目录身份，不加载模型。目录更新或缓存异常时，明确运行
`update --procedure-search hybrid` 重新准备；不需要模型时选择 offline。无需为继续学术工作修复模型。
