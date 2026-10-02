
# src/capabilities
> 目录聚合页：2 个文件、7 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/capabilities/registry.ts](../../files/src/capabilities/registry.ts.md) | 文件 | 4 | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
| [src/capabilities/validators.ts](../../files/src/capabilities/validators.ts.md) | 文件 | 3 | 能力校验器执行层：按 manifest 声明依次运行 policy 与 script 校验器；script 校验器在临时目录写入 submission.json 后按 argv 模板执行，网络型校验器失败降级为 degraded 而非 pass。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/core/contracts](core/contracts.md) | 4 |
| [src/core/validation](core/validation.md) | 1 |
