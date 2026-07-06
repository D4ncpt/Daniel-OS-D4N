from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from renderers import render_telegram_message


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
TIMEZONE = "Asia/Tokyo"


def today_in_tokyo() -> str:
    return datetime.now(ZoneInfo(TIMEZONE)).strftime("%Y-%m-%d")


def load_almanac(target_date: str) -> dict:
    path = DATA_DIR / f"{target_date}.json"
    if not path.exists():
        raise FileNotFoundError(f"Almanac JSON not found: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def send_telegram_message(message: str) -> dict:
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if not token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not set")
    if not chat_id:
        raise RuntimeError("TELEGRAM_CHAT_ID is not set")

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = urllib.parse.urlencode(
        {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "HTML",
            "disable_web_page_preview": "true",
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Telegram API request failed: {exc.code} {error_body}") from exc

    result = json.loads(raw)
    if not result.get("ok"):
        raise RuntimeError(f"Telegram API returned ok=false: {result}")
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Send today's almanac through Telegram.")
    parser.add_argument("--date", default=today_in_tokyo(), help="Target date in YYYY-MM-DD format.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Render the Telegram message without sending it.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    almanac = load_almanac(args.date)
    message = render_telegram_message(almanac)

    if args.dry_run:
        print(message)
        return

    result = send_telegram_message(message)
    print(json.dumps({"ok": True, "message_id": result["result"]["message_id"]}, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Failed to send Telegram message: {exc}", file=sys.stderr)
        raise
