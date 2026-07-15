# Adapters and formats

Read this file only when selecting a source format or a local/remote adapter. The non-negotiable upload, credential, non-overwrite, and source-layer rules remain in `SKILL.md`.

## Offline formats

`inspect` and `convert` use the standard library for UTF-8 TXT, Markdown, CSV, JSON, XML, HTML, ZIP, DOCX, PPTX, and XLSX containers. HTML extraction records visible text. ZIP-family extraction reads XML and text members in stable filename order.

Containers are rejected when encrypted, when they contain more than 1,000 entries, or when declared uncompressed content exceeds 50 MB. The script does not execute macros, embedded programs, links, or package relationships.

PDF extraction uses `pypdf` only when the user has already provided it. A missing package produces `capability_unavailable`; the Skill neither chooses nor runs an installer.

## Local adapters

| Adapter | Command | User-managed dependency | Data flow | Result layer |
| --- | --- | --- | --- | --- |
| `tesseract` | `ocr` | `tesseract` executable | local file to local process | raw-observation-or-ocr |
| `whisper-cli` | `transcribe` | `whisper` executable | local file to local process | raw-observation-or-ocr |
| `ffmpeg-cli` | `frames` | `ffmpeg` executable | local video to local images | frame artifacts |

Local subprocesses run only during the named command. Failure preserves the input and returns the process exit code, not the subprocess output body, in the error details.

## Configured HTTP adapters

| Adapter | Command | Request material | Expected response |
| --- | --- | --- | --- |
| `transkribus` | `ocr` | base64 source bytes | JSON containing `text`, `result`, or `answer` |
| `libretranslate` | `translate` | source-layer text and language codes | JSON containing `translatedText` |
| `vision-http` | `vision` | base64 image and the Agent's question | JSON containing `text`, `result`, or `answer` |

The endpoint is user-selected. The optional credential is read from the environment variable named by `--credential-env` and sent as a bearer token. Receipts never contain its value.

Before a remote request, record:

- endpoint owner and jurisdiction when known;
- exact source or layer that will leave the host;
- purpose of processing;
- retention or confidentiality concern;
- explicit user consent.

## Format decisions

Prefer `inspect` when the purpose is source identity and readable content. Use `convert` when the extracted text is itself a downstream artifact. Use OCR only when text is not already available as reliable embedded text. Use `vision` for an Agent-framed interpretive observation, never as an unmarked transcription.

If a format is unsupported, preserve the source and report its suffix. Do not rename the file to force a parser or invoke an undeclared external converter.
