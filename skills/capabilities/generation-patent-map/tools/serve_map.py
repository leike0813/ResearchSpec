#!/usr/bin/env python
"""本机随机端口提供专利地图页面。只绑 127.0.0.1。"""
from __future__ import annotations

import argparse
import json
import sys
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"

_TOOLS = Path(__file__).resolve().parent
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from ipc_titles import load_ipc_subclasses  # noqa: E402
from model_store import default_model_dir, find_local_model  # noqa: E402
from vault_index import apply_domain_filter, build_payload, note_files_from_index, resolve_corpus  # noqa: E402

CONNECTION_ERRORS = (
    ConnectionAbortedError,
    ConnectionResetError,
    BrokenPipeError,
    TimeoutError,
)
PROBE_PATHS = {"/favicon.ico", "/json", "/json/version", "/json/list"}


def _is_probe(path: str) -> bool:
    return path in PROBE_PATHS or path.startswith("/json/")


class MapHandler(SimpleHTTPRequestHandler):
    corpus: Path | None = None
    files: list[Path] | None = None
    skip_embed: bool = False

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB), **kwargs)

    def handle(self) -> None:
        try:
            super().handle()
        except CONNECTION_ERRORS:
            pass

    def copyfile(self, source, outputfile) -> None:
        try:
            super().copyfile(source, outputfile)
        except CONNECTION_ERRORS:
            pass

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("MAP_LOG: " + (fmt % args) + "\n")

    def log_request(self, code: int | str = "-", size: str | int = "-") -> None:
        if _is_probe(urlparse(self.path).path):
            return
        super().log_request(code, size)

    def log_error(self, fmt: str, *args) -> None:
        if _is_probe(urlparse(self.path).path):
            return
        self.log_message(fmt, *args)

    def _drop(self, status: int = 404) -> None:
        try:
            self.send_response(status)
            self.send_header("Content-Length", "0")
            self.send_header("Connection", "close")
            self.end_headers()
        except CONNECTION_ERRORS:
            pass

    def end_headers(self) -> None:
        path = urlparse(self.path).path
        if path in ("/", "/index.html") or path.endswith(".html"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _send_json(self, body: dict, status: int = 200) -> None:
        raw = json.dumps(body, ensure_ascii=False).encode("utf-8")
        try:
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)
        except CONNECTION_ERRORS:
            pass

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if _is_probe(parsed.path):
            self._drop(404)
            return
        if parsed.path == "/api/ipc-subclasses":
            self._send_json(load_ipc_subclasses())
            return
        if parsed.path in ("/api/patents", "/api/health", "/api/domains"):
            qs = parse_qs(parsed.query)
            domain = (qs.get("domain") or [""])[0]
            domain_id = (qs.get("domain_id") or [""])[0]
            embed = parsed.path == "/api/patents" and not self.skip_embed
            payload = build_payload(self.corpus, files=self.files, embed=embed)
            if parsed.path == "/api/health":
                body = {
                    "ok": True,
                    "port": self.server.server_address[1],
                    "vault": payload.get("vault"),
                    "source": payload.get("source"),
                    "count": payload.get("count"),
                    "domains": payload.get("domains") or [],
                    "embedding": payload.get("embedding"),
                }
            elif parsed.path == "/api/domains":
                body = {
                    "domains": payload.get("domains") or [],
                    "count": payload.get("count"),
                }
            else:
                body = apply_domain_filter(payload, domain=domain, domain_id=domain_id)
            self._send_json(body)
            return
        if parsed.path == "/":
            self.path = "/index.html"
        return super().do_GET()


class MapServer(ThreadingHTTPServer):
    daemon_threads = True

    def handle_error(self, request, client_address) -> None:
        err = sys.exception() if hasattr(sys, "exception") else sys.exc_info()[1]
        if isinstance(err, CONNECTION_ERRORS):
            return
        super().handle_error(request, client_address)


def serve(
    host: str = "127.0.0.1",
    corpus: Path | None = None,
    files: list[Path] | None = None,
    open_browser: bool = False,
    skip_embed: bool = False,
) -> None:
    if host not in ("127.0.0.1", "localhost"):
        raise ValueError("patent map binds loopback only")
    MapHandler.corpus = corpus
    MapHandler.files = files
    MapHandler.skip_embed = skip_embed
    httpd = MapServer((host, 0), MapHandler)
    port = httpd.server_address[1]
    url = f"http://{host}:{port}/"
    local = find_local_model(corpus)
    print(f"MAP_PORT:{port}")
    print(f"MAP_URL:{url}")
    print(f"MAP_CORPUS:{corpus or ''}")
    print(f"MAP_MODEL:{local or default_model_dir()}")
    # 启动时不跑向量，先把 URL 打出来；首次 /api/patents 再算
    payload = build_payload(corpus, files=files, embed=False)
    print(f"MAP_SOURCE:{payload.get('source')}")
    print(f"MAP_CACHE:{payload.get('cache')}")
    print(f"MAP_COUNT:{payload.get('count')}")
    sys.stdout.flush()
    if open_browser:
        threading.Timer(0.4, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("MAP_STOP:1")
    finally:
        httpd.server_close()


def main(argv: list[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--corpus-dir", default="", help="显式冻结的专利笔记目录")
    ap.add_argument("--vault", default="", help="显式选定的冻结笔记目录")
    ap.add_argument("--index", default="", help="专利文件索引 JSON（配合 --project-root）")
    ap.add_argument("--project-root", default="", help="索引项目根")
    ap.add_argument("--open", action="store_true", help="启动后打开本机浏览器")
    ap.add_argument("--skip-embed", action="store_true", help="跳过本地模型计算，使用 IPC 布局")
    args = ap.parse_args(argv)
    corpus = resolve_corpus(args.corpus_dir or args.vault or None)
    files = None
    if args.index:
        if not args.project_root:
            print("错误：--index 需要同时提供 --project-root", file=sys.stderr)
            return 2
        try:
            corpus, files = note_files_from_index(Path(args.index), Path(args.project_root))
        except (OSError, ValueError) as exc:
            print(f"错误：专利文件索引无效：{exc}", file=sys.stderr)
            return 2
    if corpus is None and not files:
        print("错误：需要 --corpus-dir（或 --vault），或 --index 与 --project-root", file=sys.stderr)
        return 2
    serve(corpus=corpus, files=files, open_browser=args.open, skip_embed=args.skip_embed)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
