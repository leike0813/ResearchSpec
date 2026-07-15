---
name: histagent-historical-source-analysis
description: Inspect, convert, OCR, translate, transcribe, sample, visually analyze, collate, and validate historical source files with explicit five-layer provenance. Use when an Agent must process documentary, image, audio, or video evidence without collapsing observation, correction, translation, and interpretation.
license: Apache-2.0
compatibility: Python 3.11+; optional local tools and configured HTTP adapters are user-managed.
metadata:
  vendor: histagent
  vendor-release: snapshot-47bbe21
  source-revision: 47bbe21dc81618489f5d5929358032883a3fe448
---

# Historical source analysis

## Purpose and scope

Use this Skill to produce reviewable artifacts from historical source material. It handles deterministic extraction and explicitly selected OCR, translation, transcription, frame, or vision adapters. It does not decide what a source means, fill unreadable text, choose an emendation, or turn machine output into an established historical claim.

Choose the command from the mode table before preparing inputs.

| Command | Use when | Required material |
| --- | --- | --- |
| `inspect` | Identify and extract readable content without changing the source | `--source`, `--output` |
| `convert` | Extract TXT, HTML, ZIP/basic OOXML, or PDF text | `--source`, `--output` |
| `ocr` | Produce a raw-observation-or-ocr layer | source, adapter, output |
| `translate` | Translate an existing layer without replacing it | layer file, languages, endpoint, consent, output |
| `transcribe` | Produce a transcript from audio | source, `whisper-cli`, output |
| `frames` | Sample video frames into a named directory | source, frames directory, receipt output |
| `vision` | Record configured visual analysis as interpretation | image, question, endpoint, consent, output |
| `collate` | Compare witnesses and record explicit emendations | variants file, optional emendations file, output |
| `validate` | Check layer identity, lineage fields, and content hashes | layer file |

## Inputs and prerequisites

Use Python 3.11 or newer. Python 3.11 and the standard library are sufficient for offline inspection, collation, and validation. PDF extraction additionally requires user-provided `pypdf`; OCR may require `tesseract`; transcription requires the `whisper` command; frame extraction requires `ffmpeg`. The Skill never installs them.

Inputs come from ordinary CLI options or the named layer, variants, and emendations files. Complex files are UTF-8 JSON objects, not generic runner payloads:

- a layer file contains either one layer record or `{ "layers": [...] }` as required by the command;
- a variants file contains `{ "variants": [{ "id": "...", "text": "..." }, ...] }`;
- an emendations file contains `{ "emendations": [...] }` and every item must express the Agent's proposed change and reason.

Provider credentials are read only from the environment variable named by `--credential-env`. Never put a credential in a command, input file, receipt, or artifact. External adapters require an explicit endpoint. Adapters that upload local content also require `--allow-external-upload`.

## Workflow

Use this entrypoint for every deterministic analysis command. The entrypoint imports lib/historical_support.py before parsing a command. If the support library is missing, stop because the copied tree is incomplete.

1. Select the layer you are producing and keep the source immutable.
2. Select a local or remote adapter and confirm its data flow and dependencies.
3. Run the relevant command. Typical invocations are:

```bash
python scripts/analyze_source.py inspect --source SOURCE --output RECEIPT.json
python scripts/analyze_source.py convert --source SOURCE.docx --output converted.json
python scripts/analyze_source.py ocr --source PAGE.png --adapter tesseract --output ocr.json
python scripts/analyze_source.py translate --layer-file transcription.json --adapter libretranslate --endpoint http://127.0.0.1:5000 --target-language en --allow-external-upload --output translation.json
python scripts/analyze_source.py transcribe --source interview.wav --adapter whisper-cli --output transcript.json
python scripts/analyze_source.py frames --source film.mp4 --adapter ffmpeg-cli --frames-dir frames --output frames.json
python scripts/analyze_source.py vision --source image.png --adapter vision-http --endpoint http://127.0.0.1:8000/vision --question "What is directly visible?" --allow-external-upload --output vision.json
python scripts/analyze_source.py collate --variants-file variants.json --emendations-file emendations.json --output collation.json
python scripts/analyze_source.py validate --layer-file collation.json
```

4. Inspect the receipt and artifact hashes. Run `validate` before passing layered output to another workflow.
5. Preserve the original source and every parent layer alongside derived layers.

Read this reference when selecting a format or local/remote adapter: [references/adapters-and-formats.md](references/adapters-and-formats.md).

Read this reference when preparing a layer file, collation, variant, or emendation: [references/layer-and-collation-cases.md](references/layer-and-collation-cases.md).

## Hard constraints

- Never overwrite an existing output unless the user explicitly authorizes `--overwrite`; never overwrite an input source.
- Keep `raw-observation-or-ocr`, `normalized-transcription`, `emendation`, `translation`, and `interpretation` distinct. Do not present corrected, translated, completed, or inferred content as raw evidence.
- Record a parent identifier, locator, operation, tool/provider, reason, uncertainty, review state, and content hash for every layer.
- Never infer missing characters or choose a preferred reading inside the script. Put an Agent-proposed correction in an explicit emendation record.
- Do not upload local material without `--allow-external-upload`. Disclose endpoint, material, purpose, and credential environment variable before obtaining consent.
- Do not install packages, start a service, initialize a client at import time, persist credentials, or contact a service except during the explicitly selected command.
- Treat remote output and OCR as unreviewed until an Agent evaluates it against the source.

## Responsibilities

The Agent selects sources and adapters, describes transformation reasons, judges uncertainty, proposes transcriptions and emendations, assesses translation quality, interprets historical meaning, and decides whether human review is sufficient.

The script parses inputs, performs deterministic extraction, invokes only the selected adapter, computes hashes, writes atomically, validates layer structure, and creates command receipts. It does not make academic judgments.

Do not use a temporary script to replace source criticism or historical interpretation. Do not hand-edit a command-produced authoritative JSON artifact; repair the input or rerun the formal command.

## Outputs and completion

Success writes the requested artifact and prints a command-specific receipt as one JSON object. Artifact-producing receipts contain `command`, `artifact`, and a short result summary; `validate` prints `command`, `valid`, and `layer_count`. These are command contracts, not a cross-Skill runner envelope.

The analysis is complete only when:

- the original source is unchanged;
- every produced file has a receipt hash;
- layer lineage and review state are explicit;
- `validate` succeeds for layered handoff data;
- the Agent has reviewed uncertainty, emendations, translations, and interpretations appropriate to the task.

## Failure handling

Failure exits nonzero and writes an error object to stderr without a success object on stdout. Use `error.code` to recover:

- `source_not_found`, `input_not_found`, or `invalid_input`: correct the named path or domain file;
- `artifact_exists`: choose a new path or obtain explicit overwrite authority;
- `capability_unavailable`: report the missing user-managed dependency; do not install it;
- `configuration_missing`: ask the user to configure the named environment variable;
- `consent_required`: obtain explicit upload consent or select a local command;
- `operation_failed`: retain source, endpoint, and adapter context, then ask whether to retry or use another declared adapter;
- `invalid_result`: repair lineage or hashes instead of weakening validation.

## Examples

Happy path: inspect an HTML ledger into `inspection.json`, confirm the receipt hash, and retain its raw-observation-or-ocr layer. A later translation reads that layer file and creates a separate translation artifact.

Near miss: a remote OCR request names an endpoint but omits `--allow-external-upload`. The command exits nonzero with `consent_required`, sends no request, and creates no success artifact.

Invalid collation: a variants file contains only one witness or an emendation has no explicit Agent decision. Stop and repair the domain file; do not invent a second witness or silently normalize the text.
