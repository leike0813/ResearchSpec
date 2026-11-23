"""Compare CLI output with the two official-tool sample packages."""

from contextlib import redirect_stderr
import importlib.util
from io import BytesIO, StringIO
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from xml.etree import ElementTree as ET
from unittest.mock import patch
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "chinese-patent-helper/scripts/docx_to_cnipa_zip.py"
BUILD_SCRIPT = SCRIPT.with_name("build_filing.py")
SAMPLES = ROOT / "references/验证样稿"
NEW_SAMPLES = SAMPLES / "两类申请"
NO_FIGURE = SAMPLES / "synthetic-no-figure.docx"
WITH_FIGURE = SAMPLES / "synthetic-with-figure.docx"
HAVE_IMAGES = all(importlib.util.find_spec(name) is not None for name in ("PIL", "matplotlib"))
HAVE_PILLOW = importlib.util.find_spec("PIL") is not None
HAVE_MARKDOWN = importlib.util.find_spec("markdown_it") is not None
HAVE_DOCX_WRITER = importlib.util.find_spec("lxml") is not None
HAVE_DESIGN = HAVE_MARKDOWN and HAVE_DOCX_WRITER and HAVE_PILLOW
DOCUMENT_XML = "word/document.xml"


def run_cli(source, output, *, env=None, no_site=False, patent_type=None):
    interpreter = [sys.executable, "-S"] if no_site else [sys.executable]
    category = ["--patent-type", patent_type] if patent_type else []
    return subprocess.run(
        [*interpreter, str(SCRIPT), str(source), str(output), *category],
        cwd=output.parent if output.parent.is_dir() else output.parent.parent,
        capture_output=True,
        text=True,
        timeout=60,
        env=env,
    )


def text(node):
    return " ".join("".join(node.itertext()).split())


def book(archive, code):
    return ET.fromstring(archive.read(f"{code}/{code}.xml"))


def description_blocks(description):
    blocks = []
    for node in description:
        rows = node.findall("tables/table/tgroup/tbody/row")
        if rows:
            blocks.append(("table", [[text(entry) for entry in row] for row in rows]))
        elif node.find("maths/img") is not None:
            blocks.append(("maths", text(node)))
        else:
            blocks.append((node.tag, text(node)))
    return blocks


def markdown_sample(directory, *, has_figure):
    source = directory / ("synthetic-with-figure.md" if has_figure else "synthetic-no-figure.md")
    content = """# 双点采样位移计算方法

## 权利要求书

1. 一种双点采样位移计算方法，其特征在于，包括：采集运动件在第一时刻的位置s₁和第二时刻的位置s₂，取得两次采样的时间间隔Δt；以s₂−s₁作为位移量，并按v=(s₂−s₁)/Δt计算平均速度。
2. 根据权利要求1所述的双点采样位移计算方法，其特征在于，所述时间间隔Δt由同一计时器对两次采样计时得到，s₁和s₂采用相同的长度单位。

## 说明书

### 技术领域

本发明涉及位移测量技术领域，具体涉及双点采样位移计算。

### 背景技术

连续采集多个位置点会增加直线运动件位移测量的数据量。

### 发明内容

采集两个位置点及采样间隔，求两个位置点之差作为位移量，以位移量除以采样间隔作为平均速度。
"""
    if has_figure:
        content += """
### 附图说明

图1为采样位置示意图。
"""
    content += "\n### 具体实施方式\n\n"
    if has_figure:
        content += r"""参见图1，101表示第一次采样位置，102表示第二次采样位置。第一次采样记录s₁=12.0 mm，第二次采样记录s₂=36.0 mm，两次采样间隔Δt=0.40 s。

表1 双点采样结果

| 采样项目 | 第一次采样 | 第二次采样 |
| --- | --- | --- |
| 位置 s/mm | 12.0 | 36.0 |

```math
v=\frac{s_{2}−s_{1}}{Δt}
```

"""
    else:
        content += "第一次采样记录s₁=12.0 mm，第二次采样记录s₂=36.0 mm，两次采样间隔Δt=0.40 s。平均速度由v=(s₂−s₁)/Δt计算。\n\n"
    content += """该时段的位移量为24.0 mm，平均速度为60.0 mm/s。

## 说明书摘要

本发明公开一种双点采样位移计算方法。采集运动件在两个时刻的位置s₁、s₂和两次采样间隔Δt，以s₂−s₁作为位移量，并按v=(s₂−s₁)/Δt计算平均速度。该方法用于直线运动件的位移测量。
"""
    if has_figure:
        content += '\n## 说明书附图\n\n![图1](synthetic-figure.png "width-mm=141.6666667")\n'
        with ZipFile(WITH_FIGURE) as archive:
            (directory / "synthetic-figure.png").write_bytes(archive.read("word/media/synthetic-figure.png"))
    source.write_text(content, encoding="utf-8")
    return source


class ConversionTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory(prefix="cnipa-test-")
        self.addCleanup(directory.cleanup)
        self.workdir = Path(directory.name)
        self.output = self.workdir / "out.zip"

    def assert_sample(self, source, *, has_figure):
        result = run_cli(source, self.output, no_site=not has_figure)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assert_package(self.output, source.with_suffix(".zip"), has_figure=has_figure)

    def assert_package(self, actual, reference, *, has_figure):
        with ZipFile(actual) as generated, ZipFile(reference) as official:
            self.assertIsNone(generated.testzip())
            self.assertEqual(set(generated.namelist()), set(official.namelist()))
            for code in ("100001", "100002", "100004", *(("100003",) if has_figure else ())):
                root = book(generated, code)
                self.assertEqual(root.tag, "cn-application-body")
                self.assertEqual(root.attrib, book(official, code).attrib)
            for code, path, project in (
                ("100001", "cn-claims/claim", lambda node: (node.get("num"), text(node))),
                ("100002", "description", description_blocks),
                ("100004", "cn-abstract/p", text),
                ("100003", "cn-drawings/figure", lambda node: node.get("figure-labels")),
            ):
                if code == "100003" and not has_figure:
                    continue
                with self.subTest(volume=code):
                    self.assertEqual(
                        [project(node) for node in book(generated, code).findall(path)],
                        [project(node) for node in book(official, code).findall(path)],
                    )
            if has_figure:
                from PIL import Image

                for code, path in (("100002", ".//maths/img"), ("100003", ".//figure/img")):
                    images = book(generated, code).findall(path)
                    self.assertEqual(len(images), 1)
                    with Image.open(BytesIO(generated.read(f"{code}/{images[0].attrib['file']}"))) as image:
                        self.assertEqual(image.format, "JPEG")
                        image.load()
                        self.assertLess(image.convert("L").getextrema()[0], 128)

    def test_text_only_without_optional_dependencies(self):
        self.assert_sample(NO_FIGURE, has_figure=False)

    @unittest.skipUnless(HAVE_IMAGES, "含图样稿需要 Pillow 与 Matplotlib")
    def test_table_formula_and_figure(self):
        self.assert_sample(WITH_FIGURE, has_figure=True)

    def rewrite(self, source, mutate=None, *, drop=()):
        target = self.workdir / "mutated.docx"
        with ZipFile(source) as original, ZipFile(target, "w") as copy:
            for member in original.namelist():
                if member in drop:
                    continue
                data = original.read(member)
                if mutate is not None and member == DOCUMENT_XML:
                    updated = mutate(data.decode("utf-8")).encode("utf-8")
                    self.assertNotEqual(data, updated)
                    data = updated
                copy.writestr(member, data)
        return target

    def assert_failure(self, source, code, *, output=None, env=None, location=None):
        target = output or self.output
        result = run_cli(source, target, env=env)
        self.assertEqual(result.returncode, code, result.stderr)
        self.assertFalse(target.exists())
        if location:
            self.assertIn(location, result.stderr)

    def test_invalid_input_and_output(self):
        broken = self.workdir / "broken.docx"
        broken.write_bytes(b"not a DOCX")
        self.assert_failure(broken, 1)
        self.assert_failure(self.workdir / "absent.docx", 1)
        self.assert_failure(NO_FIGURE, 1, output=self.workdir / "absent" / "out.zip")

    def test_existing_target_is_preserved(self):
        source = self.workdir / "source.docx"
        shutil.copyfile(NO_FIGURE, source)
        self.output.write_bytes(b"sentinel")
        for target in (self.output, source):
            with self.subTest(target=target):
                before = target.read_bytes()
                result = run_cli(source, target)
                self.assertEqual(result.returncode, 1, result.stderr)
                self.assertEqual(target.read_bytes(), before)

    def test_missing_claims(self):
        def without_claims(xml):
            return re.sub(r"<w:p[ >].*?</w:p>", lambda m: "" if "其特征在于" in m[0] else m[0], xml, flags=re.S)

        self.assert_failure(self.rewrite(NO_FIGURE, without_claims), 1, location="权利要求书")

    @unittest.skipUnless(HAVE_IMAGES, "含图样稿需要 Pillow 与 Matplotlib")
    def test_missing_image(self):
        source = self.rewrite(WITH_FIGURE, drop={"word/media/synthetic-figure.png"})
        self.assert_failure(source, 1, location="说明书附图")

    def test_unsupported_objects(self):
        for name, mutate, location in (
            ("根式", lambda xml: xml.replace("m:f>", "m:rad>"), "说明书"),
            ("合并单元格", lambda xml: xml.replace("<w:tcPr>", '<w:tcPr><w:gridSpan w:val="2"/>', 1), "说明书"),
            ("浮动图形", lambda xml: xml.replace("wp:inline", "wp:anchor"), "说明书附图"),
        ):
            if name == "浮动图形" and not HAVE_IMAGES:
                continue
            with self.subTest(object=name):
                self.assert_failure(self.rewrite(WITH_FIGURE, mutate), 3, location=location)

    def test_missing_formula_dependency(self):
        (self.workdir / "matplotlib.py").write_text("raise ImportError('test')\n", encoding="utf-8")
        env = os.environ | {"PYTHONPATH": str(self.workdir)}
        self.assert_failure(WITH_FIGURE, 3, env=env, location="说明书")

    def run_build(self, source, *args):
        return subprocess.run(
            [sys.executable, str(BUILD_SCRIPT), str(source), *map(str, args)],
            cwd=self.workdir, capture_output=True, text=True, timeout=60,
        )

    @unittest.skipUnless(HAVE_MARKDOWN and HAVE_DOCX_WRITER and HAVE_PILLOW, "实用新型工作稿需要读写及图像依赖")
    def test_utility_model_requires_ordered_drawings(self):
        sample = NEW_SAMPLES / "实用新型-可调节夹持支架"
        source = sample / "审定稿.md"
        docx = self.workdir / "utility.docx"
        result = self.run_build(source, "--patent-type", "utility-model", "--docx", docx, "--zip", self.output)
        self.assertEqual(result.returncode, 0, result.stderr)
        with ZipFile(self.output) as archive:
            self.assertEqual({name.split("/")[0] for name in archive.namelist()}, {"100001", "100002", "100003", "100004"})
            self.assertIn("实用新型内容", [text(h) for h in book(archive, "100002").findall(".//heading")])
            drawings = book(archive, "100003").findall(".//figure")
            self.assertEqual([node.get("figure-labels") for node in drawings], ["图1", "图2"])
        zipped_again = self.workdir / "utility-again.zip"
        result = run_cli(docx, zipped_again, patent_type="utility-model")
        self.assertEqual(result.returncode, 0, result.stderr)
        target = self.workdir / "missing-drawings.zip"
        result = self.run_build(NO_FIGURE, "--patent-type", "utility-model", "--zip", target)
        self.assertEqual(result.returncode, 1)
        self.assertIn("说明书附图", result.stderr)
        self.assertFalse(target.exists())
        shutil.copytree(sample / "figures", self.workdir / "figures")
        markdown = source.read_text(encoding="utf-8")
        for name, labels, actual, expected in (
            ("duplicate", ("图1", "图1"), "图1", "图2"),
            ("gap", ("图1", "图3"), "图3", "图2"),
        ):
            replacements = iter(labels)
            variant = self.workdir / f"md-{name}.md"
            variant.write_text(
                re.sub(
                    r"(!\[)图[12](\]\()",
                    lambda match: f"{match[1]}{next(replacements)}{match[2]}",
                    markdown,
                ),
                encoding="utf-8",
            )
            target = self.workdir / f"md-{name}.zip"
            result = self.run_build(variant, "--patent-type", "invention", "--zip", target)
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertIn("说明书附图", result.stderr)
            self.assertIn(f"实际为{actual}", result.stderr)
            self.assertIn(f"应为{expected}", result.stderr)
            self.assertFalse(target.exists())

        broken = self.rewrite(
            docx,
            lambda xml: re.sub(
                r">图([12])</",
                lambda match: f">{'图2' if match[1] == '1' else '图1'}</",
                xml,
            ),
        )
        target = self.workdir / "docx-out-of-order.zip"
        result = run_cli(broken, target, patent_type="utility-model")
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertIn("说明书附图正文块", result.stderr)
        self.assertIn("实际为图2", result.stderr)
        self.assertIn("应为图1", result.stderr)
        self.assertFalse(target.exists())

    @unittest.skipUnless(HAVE_DESIGN, "外观设计工作稿需要读写及图像依赖")
    def test_design_preserves_views_and_brief_across_inputs(self):
        sample = NEW_SAMPLES / "外观设计-03-相似书签"
        source = sample / "审定稿.md"
        docx = self.workdir / "design.docx"
        from_docx = self.workdir / "design-again.zip"
        result = self.run_build(source, "--patent-type", "design", "--docx", docx, "--zip", self.output)
        self.assertEqual(result.returncode, 0, result.stderr)
        result = run_cli(docx, from_docx, patent_type="design")
        self.assertEqual(result.returncode, 0, result.stderr)

        from PIL import Image

        with ZipFile(self.output) as generated, ZipFile(from_docx) as round_trip:
            self.assertIsNone(generated.testzip())
            self.assertEqual({name.split("/")[0] for name in generated.namelist()}, {"130001", "130002"})
            for member in generated.namelist():
                self.assertEqual(generated.read(member), round_trip.read(member))
            drawings = book(generated, "130001")
            self.assertEqual(drawings.tag, "authorization")
            views = drawings.findall("image")
            self.assertEqual([view.findtext("logical-name") for view in views], ["设计1主视图", "设计2主视图"])
            self.assertEqual([view.findtext("fengpi-flag") for view in views], ["1", "0"])
            for view in views:
                with Image.open(BytesIO(generated.read(f"130001/{view.findtext('physical-name')}"))) as raster:
                    self.assertEqual(raster.format, "JPEG")
                    raster.load()
            brief = text(book(generated, "130002"))
            self.assertIn("用于标记书页位置", brief)
            self.assertIn("最能表明设计要点的图片或照片：设计1主视图", brief)
            self.assertIn("基本设计：设计1", brief)

    @unittest.skipUnless(HAVE_DESIGN, "外观设计工作稿需要读写及图像依赖")
    def test_design_cmyk_color(self):
        from PIL import Image

        try:
            from PIL import ImageCms
        except ImportError:
            self.skipTest("CMYK 配置对照需要 Pillow ImageCms")
        # CC0 fixture from https://github.com/saucecontrol/Compact-ICC-Profiles
        profile = (ROOT / "tests/fixtures/CGATS001Compat-v2-micro.icc").read_bytes()
        source = self.workdir / "design.md"
        source.write_text(
            '# 杯垫\n\n## 外观设计图片或照片\n\n![主视图](view.jpg "width-mm=50")\n'
            '\n## 外观设计简要说明\n\n产品用途：承托杯具。\n\n设计要点：颜色。\n'
            '\n最能表明设计要点的图片或照片：主视图\n', encoding="utf-8",
        )
        view = self.workdir / "view.jpg"
        sample = Image.new("CMYK", (40, 40), (255, 0, 0, 0))
        sample.save(view, icc_profile=profile)
        with Image.open(view) as image:
            expected = ImageCms.profileToProfile(
                image, BytesIO(profile), ImageCms.createProfile("sRGB"), outputMode="RGB"
            ).getpixel((20, 20))
        docx = self.workdir / "design.docx"
        result = self.run_build(source, "--patent-type", "design", "--docx", docx, "--zip", self.output)
        self.assertEqual(result.returncode, 0, result.stderr)
        again = self.workdir / "again.zip"
        result = run_cli(docx, again, patent_type="design")
        self.assertEqual(result.returncode, 0, result.stderr)
        with ZipFile(self.output) as archive, ZipFile(again) as rebuilt:
            member = "130001/" + book(archive, "130001").findtext("image/physical-name")
            data = archive.read(member)
            self.assertEqual(data, rebuilt.read(member))
        with Image.open(BytesIO(data)) as converted:
            actual = converted.getpixel((converted.width // 2, converted.height // 2))
            self.assertLessEqual(max(abs(a - b) for a, b in zip(actual, expected)), 3)
            self.assertIn("srgb", ImageCms.getProfileDescription(BytesIO(converted.info["icc_profile"])).lower())

        for invalid in (b"", b"damaged ICC"):
            with self.subTest(profile=invalid):
                sample.save(view, icc_profile=invalid)
                pending = self.workdir / "pending.docx"
                target = self.workdir / "invalid.zip"
                result = self.run_build(source, "--patent-type", "design", "--docx", pending, "--zip", target)
                self.assertEqual(result.returncode, 3, result.stderr)
                self.assertIn("主视图", result.stderr)
                self.assertFalse(target.exists())
                self.assertFalse(pending.exists())
        result = self.run_build(source, "--patent-type", "design", "--docx", pending)
        self.assertEqual(result.returncode, 0, result.stderr)
        with ZipFile(pending) as archive:
            self.assertIn(view.read_bytes(), [archive.read(n) for n in archive.namelist() if n.startswith("word/media/")])

    @unittest.skipUnless(HAVE_DESIGN, "外观设计工作稿需要读写及图像依赖")
    def test_design_rejects_unresolved_references(self):
        sample = NEW_SAMPLES / "外观设计-03-相似书签"
        shutil.copytree(sample / "images", self.workdir / "images")
        markdown = (sample / "审定稿.md").read_text(encoding="utf-8")
        path = self.workdir / "design.md"
        for old, wrong in (
            ("照片：设计1主视图", "照片：设计3主视图"),
            ("基本设计：设计1", "基本设计：设计3"),
            ("![设计2主视图]", "![设计1主视图]"),
        ):
            with self.subTest(field=old):
                path.write_text(markdown.replace(old, wrong), encoding="utf-8")
                result = self.run_build(path, "--patent-type", "design", "--zip", self.output)
                self.assertEqual(result.returncode, 1, result.stderr)
                self.assertFalse(self.output.exists())

    @unittest.skipUnless(HAVE_MARKDOWN and HAVE_DOCX_WRITER, "Markdown 和 DOCX 生成需要 markdown-it-py 和 lxml")
    def test_both_inputs_and_docx_round_trip(self):
        for original in (NO_FIGURE, WITH_FIGURE):
            has_figure = original == WITH_FIGURE
            if has_figure and not HAVE_IMAGES:
                continue
            for markdown in (False, True):
                with self.subTest(sample=original.stem, markdown=markdown):
                    source = markdown_sample(self.workdir, has_figure=has_figure) if markdown else original
                    prefix = f"{original.stem}-{markdown}"
                    docx = self.workdir / f"{prefix}.docx"
                    xml_zip = self.workdir / f"{prefix}.zip"
                    result = self.run_build(source, "--docx", docx, "--zip", xml_zip)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    reference = original.with_suffix(".zip")
                    self.assert_package(xml_zip, reference, has_figure=has_figure)

                    if has_figure:
                        with ZipFile(docx) as archive:
                            root = ET.fromstring(archive.read(DOCUMENT_XML))
                        namespace = {"m": "http://schemas.openxmlformats.org/officeDocument/2006/math"}
                        fraction = root.find(".//m:oMathPara/m:oMath/m:f", namespace)
                        self.assertIsNotNone(fraction)
                        self.assertEqual(text(fraction.find("m:num", namespace)), "s2−s1")
                        self.assertEqual(text(fraction.find("m:den", namespace)), "Δt")
                        self.assertEqual(len(fraction.findall(".//m:sSub", namespace)), 2)

                    round_trip = self.workdir / f"{prefix}-round-trip.zip"
                    result = run_cli(docx, round_trip, no_site=not has_figure)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assert_package(round_trip, reference, has_figure=has_figure)

    @unittest.skipUnless(HAVE_MARKDOWN and HAVE_DOCX_WRITER, "Markdown 和 DOCX 生成需要 markdown-it-py 和 lxml")
    def test_docx_only_preserves_formatted_scripts_and_breaks(self):
        source = markdown_sample(self.workdir, has_figure=False)
        contents = source.read_text(encoding="utf-8")
        source.write_text(
            contents.replace("s₁=12.0", "s<sub>1</sub>=12.0", 1).replace(
                "背景技术\n\n", "背景技术\n\n上标x<sup>2</sup>  \n下一行。\n\n", 1
            ),
            encoding="utf-8",
        )
        docx = self.workdir / "out.docx"
        result = self.run_build(source, "--docx", docx)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse(self.output.exists())
        result = run_cli(docx, self.output, no_site=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        with ZipFile(self.output) as archive:
            description = book(archive, "100002")
        self.assertEqual(description.findtext(".//sub"), "1")
        self.assertEqual(description.findtext(".//sup"), "2")
        self.assertEqual(description.find(".//br").tail, "下一行。")

    def test_claim_character_styles(self):
        w = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
        with ZipFile(NO_FIGURE) as archive:
            members = {name: archive.read(name) for name in archive.namelist()}
        document = ET.fromstring(members[DOCUMENT_XML])
        claim = next(p for p in document.iter(w + "p") if text(p).startswith("1."))
        for literal, style_id, direct in (
            ("面积10 m", None, None), ("2", "RaisedUnit", None), ("，位置s", None, None),
            ("1", "Index", None), ("，x", "RaisedUnit", "baseline"),
            ("2", "Index", "superscript"), ("。", None, None),
        ):
            run = ET.SubElement(claim, w + "r")
            if style_id:
                props = ET.SubElement(run, w + "rPr")
                ET.SubElement(props, w + "rStyle", {w + "val": style_id})
                if direct:
                    ET.SubElement(props, w + "vertAlign", {w + "val": direct})
            ET.SubElement(run, w + "t").text = literal
        members[DOCUMENT_XML] = ET.tostring(document)
        styles = ET.fromstring(members["word/styles.xml"])
        exponent = ET.SubElement(styles, w + "style", {w + "type": "character", w + "styleId": "Exponent"})
        ET.SubElement(ET.SubElement(exponent, w + "rPr"), w + "vertAlign", {w + "val": "superscript"})
        index = ET.SubElement(styles, w + "style", {w + "type": "character", w + "styleId": "Index"})
        ET.SubElement(ET.SubElement(index, w + "rPr"), w + "vertAlign", {w + "val": "subscript"})
        raised = ET.SubElement(styles, w + "style", {w + "type": "character", w + "styleId": "RaisedUnit"})
        parent = ET.SubElement(raised, w + "basedOn")
        for base in ("Exponent", "Missing", "RaisedUnit"):
            with self.subTest(base=base):
                parent.set(w + "val", base)
                members["word/styles.xml"] = ET.tostring(styles)
                source = self.workdir / f"{base}.docx"
                with ZipFile(source, "w") as archive:
                    for name, data in members.items():
                        archive.writestr(name, data)
                target = source.with_suffix(".zip")
                if base != "Exponent":
                    self.assert_failure(source, 1, output=target, location="权利要求书")
                    continue
                result = run_cli(source, target, no_site=True)
                self.assertEqual(result.returncode, 0, result.stderr)
                with ZipFile(target) as archive:
                    paragraph = book(archive, "100001").find(".//claim-text")
                self.assertTrue(paragraph.text.endswith("面积10 m"))
                self.assertEqual(
                    [(part.tag, part.text, part.tail) for part in paragraph],
                    [("sup", "2", "，位置s"), ("sub", "1", "，x"), ("sup", "2", "。")],
                )

    @unittest.skipUnless(HAVE_MARKDOWN, "Markdown 读入需要 markdown-it-py")
    def test_markdown_rejects_missing_or_unsupported_objects(self):
        for name, old, new, code, section in (
            ("表格缺列", "| 位置 s/mm | 12.0 | 36.0 |", "| 位置 s/mm | 12.0 |", 3, "说明书"),
            ("不支持的公式", r"\frac", r"\sqrt", 3, "说明书"),
            ("缺图", "synthetic-figure.png", "absent.png", 1, "说明书附图"),
        ):
            with self.subTest(case=name):
                source = markdown_sample(self.workdir, has_figure=True)
                contents = source.read_text(encoding="utf-8").replace(old, new, 1)
                source.write_text(contents, encoding="utf-8")
                result = self.run_build(source, "--zip", self.output)
                self.assertEqual(result.returncode, code, result.stderr)
                self.assertIn(section, result.stderr)
                self.assertFalse(self.output.exists())
                self.assertEqual(source.read_text(encoding="utf-8"), contents)

    @unittest.skipUnless(HAVE_DOCX_WRITER, "DOCX 写出需要 lxml")
    def test_multi_output_conflict_and_write_failure(self):
        docx = self.workdir / "out.docx"
        self.output.write_bytes(b"existing")
        result = self.run_build(NO_FIGURE, "--docx", docx, "--zip", self.output)
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertEqual(self.output.read_bytes(), b"existing")
        self.assertFalse(docx.exists())
        self.output.unlink()

        sys.path.insert(0, str(SCRIPT.parent))
        self.addCleanup(sys.path.remove, str(SCRIPT.parent))
        from build_filing import build

        open_path = Path.open

        def fail_on_zip(target, mode, *args, **kwargs):
            if target == self.output and mode == "xb":
                raise PermissionError("simulated second output failure")
            return open_path(target, mode, *args, **kwargs)

        with patch.object(Path, "open", fail_on_zip), redirect_stderr(StringIO()):
            self.assertEqual(build(NO_FIGURE, docx=docx, zip_path=self.output), 1)
        self.assertFalse(docx.exists())
        self.assertFalse(self.output.exists())


if __name__ == "__main__":
    unittest.main()
