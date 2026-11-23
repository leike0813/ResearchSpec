"""Verify the generated filing package with the pinned synthetic cases."""

import os
from pathlib import Path
from shutil import copytree
import subprocess
import sys
from tempfile import TemporaryDirectory
from xml.etree import ElementTree as ET
from zipfile import ZipFile


def main():
    root = Path(__file__).resolve().parents[1]
    package = root / "skills/capabilities/generation-chinese-patent-filing"
    snapshot = root / "vendor/chinese-patent-helper/upstream"
    env = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1"}
    with TemporaryDirectory(prefix="researchspec-cnipa-") as temporary:
        work = Path(temporary)
        copytree(package, work / "chinese-patent-helper")
        copytree(snapshot / "tests", work / "tests")
        copytree(snapshot / "references", work / "references")
        subprocess.run(
            [sys.executable, "-m", "unittest", "discover", "-s", "tests", "-v"],
            cwd=work, env=env, check=True,
        )

        source = work / "references/验证样稿/PCT中国国家阶段/译文审定稿.md"
        docx, archive = work / "中文译文.docx", work / "申请文件.zip"
        subprocess.run(
            [sys.executable, "chinese-patent-helper/scripts/build_filing.py", source,
             "--patent-type", "invention", "--docx", docx, "--zip", archive],
            cwd=work, env=env, check=True,
        )
        with ZipFile(docx) as document:
            properties = ET.fromstring(document.read("docProps/core.xml"))
            private_fields = {"title", "creator", "lastModifiedBy"}
            assert not {field.tag.rsplit("}", 1)[-1] for field in properties} & private_fields
        with ZipFile(archive) as result:
            for code in ("100001", "100002", "100003", "100004"):
                assert ET.fromstring(result.read(f"{code}/{code}.xml")).tag == "cn-application-body"
        print("Verified PCT translation DOCX metadata and all four CNIPA XML sections.")


if __name__ == "__main__":
    main()
