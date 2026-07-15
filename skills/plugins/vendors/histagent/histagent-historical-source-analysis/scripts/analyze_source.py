#!/usr/bin/env python3
"""Analyze historical sources with explicit layers and adapter boundaries."""

from __future__ import annotations

import argparse
import base64
import difflib
import html.parser
import json
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from historical_support import (  # noqa: E402
    SkillError,
    SkillArgumentParser,
    artifact,
    credential_from_env,
    layer_record,
    read_json,
    request_json,
    run_cli,
    sha256_bytes,
    sha256_file,
    validate_layer_records,
    write_json,
)


class _TextExtractor(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        if data.strip():
            self.parts.append(data.strip())


def _source(value: str) -> tuple[Path, dict[str, Any]]:
    source = Path(value).expanduser().resolve()
    if not source.is_file():
        raise SkillError("source_not_found", "Source file does not exist.", {"path": str(source)})
    return source, {"path": str(source), "sha256": sha256_file(source), "locator": str(source)}


def _extract(source: Path) -> tuple[str, str]:
    suffix = source.suffix.lower()
    if suffix in {".txt", ".md", ".csv", ".json", ".xml"}:
        return source.read_text(encoding="utf-8"), "plain-text"
    if suffix in {".html", ".htm"}:
        parser = _TextExtractor()
        parser.feed(source.read_text(encoding="utf-8"))
        return "\n".join(parser.parts), "html"
    if suffix in {".zip", ".docx", ".pptx", ".xlsx"}:
        parts: list[str] = []
        with zipfile.ZipFile(source) as archive:
            entries = archive.infolist()
            if len(entries) > 1000 or sum(item.file_size for item in entries) > 50_000_000:
                raise SkillError("invalid_input", "ZIP container exceeds the safe inspection limit.", {"entries": len(entries)})
            for item in sorted(entries, key=lambda value: value.filename):
                if item.flag_bits & 0x1:
                    raise SkillError("invalid_input", "Encrypted ZIP entries are not inspected.", {"entry": item.filename})
                if item.filename.endswith((".xml", ".txt")):
                    parser = _TextExtractor()
                    parser.feed(archive.read(item.filename).decode("utf-8", errors="replace"))
                    parts.extend(parser.parts)
        return "\n".join(parts), "zip-xml"
    if suffix == ".pdf":
        try:
            from pypdf import PdfReader  # type: ignore
        except ImportError as exc:
            raise SkillError("capability_unavailable", "PDF conversion requires user-provided pypdf.", {"dependency": "pypdf"}) from exc
        return "\n".join(page.extract_text() or "" for page in PdfReader(str(source)).pages), "pypdf"
    raise SkillError("unsupported_format", "No converter is declared for this file format.", {"suffix": suffix})


def _consent(args: argparse.Namespace) -> None:
    if not args.allow_external_upload:
        raise SkillError("consent_required", "This adapter uploads task material and requires --allow-external-upload.", {"adapter": args.adapter})


def _headers(credential_env: str | None) -> dict[str, str]:
    credential = credential_from_env(credential_env)
    return {"Authorization": f"Bearer {credential}"} if credential else {}


def _response_text(response: Any) -> str:
    if isinstance(response, dict):
        for key in ("text", "result", "answer"):
            if isinstance(response.get(key), str):
                return response[key]
    raise SkillError("operation_failed", "Adapter response does not contain text.")


def _persist(command: str, output: str, result: dict[str, Any], overwrite: bool) -> dict[str, Any]:
    saved = write_json(Path(output), result, overwrite=overwrite)
    return {"command": command, "artifact": saved, "result_summary": {"keys": sorted(result), "layer_count": len(result.get("layers", []))}}


def _handle(args: argparse.Namespace) -> dict[str, Any]:
    command = args.command
    if command in {"inspect", "convert"}:
        source, source_ref = _source(args.source)
        text, adapter = _extract(source)
        result = {
            "format": source.suffix.lower() or "unknown",
            "bytes": source.stat().st_size,
            "layers": [layer_record("raw-observation-or-ocr", text, source_ref, tool_or_provider=adapter, reason="direct-file-inspection", uncertainty="format-dependent")],
        }
    elif command == "ocr":
        source, source_ref = _source(args.source)
        if args.adapter == "tesseract":
            executable = shutil.which("tesseract")
            if not executable:
                raise SkillError("capability_unavailable", "OCR requires user-provided tesseract.", {"dependency": "tesseract"})
            completed = subprocess.run([executable, str(source), "stdout"], capture_output=True, text=True, check=False)
            if completed.returncode != 0:
                raise SkillError("operation_failed", "Tesseract OCR failed.", {"returncode": completed.returncode})
            text = completed.stdout
        else:
            _consent(args)
            if not args.endpoint:
                raise SkillError("invalid_input", "transkribus requires --endpoint.")
            response = request_json(args.endpoint, method="POST", body={"content_base64": base64.b64encode(source.read_bytes()).decode("ascii")}, headers=_headers(args.credential_env))
            text = _response_text(response)
        result = {"layers": [layer_record("raw-observation-or-ocr", text, source_ref, operations=[{"type": "ocr", "adapter": args.adapter}], tool_or_provider=args.adapter, reason="optical-character-recognition", uncertainty=args.uncertainty, review_state=args.review_state)]}
    elif command == "translate":
        _consent(args)
        source_layer = read_json(args.layer_file, "Layer file")
        content = source_layer.get("content")
        if not isinstance(content, str):
            raise SkillError("invalid_input", "Layer file requires string content.")
        endpoint = args.endpoint.rstrip("/") + "/translate"
        response = request_json(endpoint, method="POST", body={"q": content, "source": args.source_language, "target": args.target_language, "format": "text"}, headers=_headers(args.credential_env))
        translated = response.get("translatedText") if isinstance(response, dict) else None
        if not isinstance(translated, str):
            raise SkillError("operation_failed", "Translation adapter did not return translatedText.")
        source = {"parent_id": source_layer.get("content_sha256") or sha256_bytes(content.encode("utf-8")), "locator": source_layer.get("locator") or args.layer_file}
        result = {"layers": [layer_record("translation", translated, source, operations=[{"type": "translation", "source_language": args.source_language, "target_language": args.target_language}], tool_or_provider=args.adapter, reason=args.reason, uncertainty=args.uncertainty, review_state=args.review_state)]}
    elif command == "transcribe":
        source, source_ref = _source(args.source)
        executable = shutil.which("whisper")
        if not executable:
            raise SkillError("capability_unavailable", "Transcription requires user-provided whisper.", {"dependency": "whisper"})
        with tempfile.TemporaryDirectory() as directory:
            completed = subprocess.run([executable, str(source), "--output_format", "txt", "--output_dir", directory], capture_output=True, text=True, check=False)
            if completed.returncode != 0:
                raise SkillError("operation_failed", "Whisper transcription failed.", {"returncode": completed.returncode})
            outputs = list(Path(directory).glob("*.txt"))
            if len(outputs) != 1:
                raise SkillError("operation_failed", "Whisper did not produce exactly one transcript.")
            text = outputs[0].read_text(encoding="utf-8")
        result = {"layers": [layer_record("raw-observation-or-ocr", text, source_ref, operations=[{"type": "transcription", "adapter": "whisper-cli"}], tool_or_provider="whisper-cli", reason="speech-transcription", uncertainty=args.uncertainty, review_state=args.review_state)]}
    elif command == "frames":
        source, source_ref = _source(args.source)
        executable = shutil.which("ffmpeg")
        if not executable:
            raise SkillError("capability_unavailable", "Frame extraction requires user-provided ffmpeg.", {"dependency": "ffmpeg"})
        frames_dir = Path(args.frames_dir).expanduser().resolve()
        if frames_dir.exists() and any(frames_dir.iterdir()) and not args.overwrite:
            raise SkillError("artifact_exists", "Refusing to write into a non-empty frames directory.", {"path": str(frames_dir)})
        frames_dir.mkdir(parents=True, exist_ok=True)
        completed = subprocess.run([executable, "-nostdin", "-i", str(source), "-vf", f"fps={args.frames_per_second}", str(frames_dir / "frame-%06d.jpg")], capture_output=True, text=True, check=False)
        if completed.returncode != 0:
            raise SkillError("operation_failed", "FFmpeg frame extraction failed.", {"returncode": completed.returncode})
        result = {"source": source_ref, "frames": [artifact(frame, "image/jpeg") for frame in sorted(frames_dir.glob("frame-*.jpg"))]}
    elif command == "vision":
        _consent(args)
        source, source_ref = _source(args.source)
        response = request_json(args.endpoint, method="POST", body={"question": args.question, "image_base64": base64.b64encode(source.read_bytes()).decode("ascii")}, headers=_headers(args.credential_env))
        result = {"layers": [layer_record("interpretation", _response_text(response), source_ref, operations=[{"type": "vision-analysis", "question": args.question}], tool_or_provider=args.adapter, reason="visual-source-interpretation", uncertainty=args.uncertainty, review_state=args.review_state)]}
    elif command == "collate":
        variants_value = read_json(args.variants_file, "Variants file")
        variants = variants_value.get("variants")
        if not isinstance(variants, list) or len(variants) < 2 or not all(isinstance(item, dict) and isinstance(item.get("id"), str) and isinstance(item.get("text"), str) for item in variants):
            raise SkillError("invalid_input", "Variants file requires at least two {id,text} records.")
        emendations = [] if args.emendations_file is None else read_json(args.emendations_file, "Emendations file").get("emendations")
        if not isinstance(emendations, list):
            raise SkillError("invalid_input", "Emendations file requires an emendations array.")
        base = variants[0]
        comparisons = [{"variant_id": item["id"], "opcodes": [list(op) for op in difflib.SequenceMatcher(None, base["text"], item["text"]).get_opcodes()]} for item in variants[1:]]
        result = {"base_variant_id": base["id"], "variants": variants, "comparisons": comparisons, "emendations": emendations, "layers": [layer_record("emendation", json.dumps(emendations, ensure_ascii=False, sort_keys=True), {"parent_id": base["id"], "locator": "variant-collation"}, operations=[{"type": "explicit-emendation-only"}], tool_or_provider="stdlib-difflib", reason=args.reason, uncertainty=args.uncertainty, review_state=args.review_state)]}
    elif command == "validate":
        value = read_json(args.layer_file, "Layer file")
        records = value.get("layers")
        validate_layer_records(records)
        return {"command": command, "valid": True, "layer_count": len(records)}
    else:
        raise SkillError("unknown_command", "Unknown source-analysis command.", {"command": command})
    return _persist(command, args.output, result, args.overwrite)


def _common_output(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--output", required=True)
    parser.add_argument("--overwrite", action="store_true")


def _layer_options(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--uncertainty", default="machine-generated")
    parser.add_argument("--review-state", default="unreviewed")


def parser() -> argparse.ArgumentParser:
    root = SkillArgumentParser()
    commands = root.add_subparsers(dest="command", required=True)
    for name in ("inspect", "convert"):
        item = commands.add_parser(name)
        item.add_argument("--source", required=True)
        _common_output(item)
    ocr = commands.add_parser("ocr")
    ocr.add_argument("--source", required=True)
    ocr.add_argument("--adapter", choices=("tesseract", "transkribus"), required=True)
    ocr.add_argument("--endpoint")
    ocr.add_argument("--credential-env")
    ocr.add_argument("--allow-external-upload", action="store_true")
    _layer_options(ocr)
    _common_output(ocr)
    translate = commands.add_parser("translate")
    translate.add_argument("--layer-file", required=True)
    translate.add_argument("--adapter", choices=("libretranslate",), required=True)
    translate.add_argument("--endpoint", required=True)
    translate.add_argument("--source-language", default="auto")
    translate.add_argument("--target-language", required=True)
    translate.add_argument("--credential-env")
    translate.add_argument("--allow-external-upload", action="store_true")
    translate.add_argument("--reason", default="language-translation")
    _layer_options(translate)
    _common_output(translate)
    transcribe = commands.add_parser("transcribe")
    transcribe.add_argument("--source", required=True)
    transcribe.add_argument("--adapter", choices=("whisper-cli",), required=True)
    _layer_options(transcribe)
    _common_output(transcribe)
    frames = commands.add_parser("frames")
    frames.add_argument("--source", required=True)
    frames.add_argument("--adapter", choices=("ffmpeg-cli",), required=True)
    frames.add_argument("--frames-dir", required=True)
    frames.add_argument("--frames-per-second", type=float, default=1.0)
    _common_output(frames)
    vision = commands.add_parser("vision")
    vision.add_argument("--source", required=True)
    vision.add_argument("--adapter", choices=("vision-http",), required=True)
    vision.add_argument("--endpoint", required=True)
    vision.add_argument("--question", required=True)
    vision.add_argument("--credential-env")
    vision.add_argument("--allow-external-upload", action="store_true")
    _layer_options(vision)
    _common_output(vision)
    collate = commands.add_parser("collate")
    collate.add_argument("--variants-file", required=True)
    collate.add_argument("--emendations-file")
    collate.add_argument("--reason", default="variant-collation")
    collate.add_argument("--uncertainty", default="requires-human-review")
    collate.add_argument("--review-state", default="proposed")
    _common_output(collate)
    validate = commands.add_parser("validate")
    validate.add_argument("--layer-file", required=True)
    return root


def main() -> int:
    args = parser().parse_args()
    return run_cli(lambda: _handle(args))


if __name__ == "__main__":
    raise SystemExit(main())
