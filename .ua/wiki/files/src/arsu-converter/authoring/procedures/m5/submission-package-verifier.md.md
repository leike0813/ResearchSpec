
# src/arsu-converter/authoring/procedures/m5/submission-package-verifier.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring/procedures/m5](../../../../../../modules/src/arsu-converter/authoring/procedures/m5.md)
<!-- node: document:src/arsu-converter/authoring/procedures/m5/submission-package-verifier.md -->

m5 提交包校验 Procedure（绑定 validators/submission-package-verifier.py）。读取 submission_package 清单与文件，核验必需文件、已声明校验和、许可、披露与终端策略戳记的存在性，在不改动包内字节的前提下保留 fail / warn / NOT-CHECKED 三类发现。
源码：[src/arsu-converter/authoring/procedures/m5/submission-package-verifier.md](../../../../../../../../src/arsu-converter/authoring/procedures/m5/submission-package-verifier.md)
