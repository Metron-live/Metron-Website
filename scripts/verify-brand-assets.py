#!/usr/bin/env python3
"""Verify canonical favicon exports and local links without third-party tools."""

from __future__ import annotations

import re
import struct
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
EXPECTED_PNG_SIZES = {
    "favicon-16x16.png": (16, 16),
    "favicon-32x32.png": (32, 32),
    "favicon-48x48.png": (48, 48),
    "apple-touch-icon.png": (180, 180),
    "favicon-192x192.png": (192, 192),
    "favicon-512x512.png": (512, 512),
}
EXPECTED_ICO_SIZES = {(16, 16), (32, 32), (48, 48)}
SKIPPED_SCHEMES = {"data", "http", "https", "mailto", "sms", "tel"}


class LinkParser(HTMLParser):
    """Collect browser-loaded local paths from HTML attributes."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        for name in ("href", "src", "poster"):
            value = attributes.get(name)
            if value:
                self.links.append(value)


def png_size(path: Path) -> tuple[int, int]:
    header = path.read_bytes()[:24]
    if len(header) != 24 or header[:8] != PNG_SIGNATURE or header[12:16] != b"IHDR":
        raise ValueError("not a valid PNG")
    return struct.unpack(">II", header[16:24])


def ico_sizes(path: Path) -> set[tuple[int, int]]:
    data = path.read_bytes()
    if len(data) < 6:
        raise ValueError("ICO header is truncated")
    reserved, image_type, count = struct.unpack_from("<HHH", data)
    if reserved != 0 or image_type != 1 or len(data) < 6 + count * 16:
        raise ValueError("not a valid ICO")

    sizes = set()
    for index in range(count):
        width, height = struct.unpack_from("<BB", data, 6 + index * 16)
        sizes.add((width or 256, height or 256))
    return sizes


def active_html_files() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*.html")
        if not ({".git", ".graveyard", "dist", "node_modules", "test-results"} & set(path.parts))
    )


def resolve_local_link(page: Path, raw_link: str) -> Path | None:
    if raw_link.startswith(("#", "//")) or "{{" in raw_link or "${" in raw_link:
        return None
    parsed = urlsplit(raw_link)
    if parsed.scheme.lower() in SKIPPED_SCHEMES or parsed.netloc:
        return None

    link_path = unquote(parsed.path)
    if not link_path or link_path.startswith("/.netlify/"):
        return None
    candidate = ROOT / link_path.lstrip("/") if link_path.startswith("/") else page.parent / link_path
    candidate = candidate.resolve()
    if candidate.is_dir():
        candidate /= "index.html"
    elif not candidate.suffix and candidate.with_suffix(".html").exists():
        candidate = candidate.with_suffix(".html")
    return candidate


def main() -> int:
    failures: list[str] = []

    for relative_path, expected in EXPECTED_PNG_SIZES.items():
        path = ROOT / relative_path
        try:
            actual = png_size(path)
        except (OSError, ValueError) as error:
            failures.append(f"{relative_path}: {error}")
            continue
        if actual != expected:
            failures.append(f"{relative_path}: expected {expected}, found {actual}")

    try:
        actual_ico_sizes = ico_sizes(ROOT / "favicon.ico")
        if actual_ico_sizes != EXPECTED_ICO_SIZES:
            failures.append(
                f"favicon.ico: expected {sorted(EXPECTED_ICO_SIZES)}, found {sorted(actual_ico_sizes)}"
            )
    except (OSError, ValueError) as error:
        failures.append(f"favicon.ico: {error}")

    for page in active_html_files():
        text = page.read_text(encoding="utf-8")
        relative_page = page.relative_to(ROOT)
        if re.search(r"(?:^|[/'\"])(?:\.\./)*brand/", text):
            failures.append(f"{relative_page}: references an archived brand/ asset")

        parser = LinkParser()
        parser.feed(text)
        for raw_link in parser.links:
            target = resolve_local_link(page, raw_link)
            if target is not None and not target.exists():
                failures.append(f"{relative_page}: broken local link {raw_link!r}")

    if failures:
        print("Brand asset verification failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    print(
        f"Verified {len(EXPECTED_PNG_SIZES)} PNG exports, "
        f"{len(EXPECTED_ICO_SIZES)} ICO sizes, and local links in {len(active_html_files())} active pages."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
