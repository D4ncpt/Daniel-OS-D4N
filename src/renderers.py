from __future__ import annotations

from datetime import date, datetime
from html import escape
from typing import Any


def parse_iso_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def weekday_zh(day: date) -> str:
    weekdays = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
    return weekdays[day.weekday()]


def join_items(items: list[str], fallback: str = "无") -> str:
    cleaned = [item.strip() for item in items if item and item.strip()]
    return "、".join(cleaned) if cleaned else fallback


def render_telegram_message(almanac: dict[str, Any]) -> str:
    day = parse_iso_date(almanac["date"])
    directions = almanac["directions"]
    colors = almanac["colors"]
    learning = almanac["daily_learning"]
    ganzhi = almanac["ganzhi"]

    maxim = almanac["maxim"]

    lines = [
        "🌿 <b>D4N Daily</b>",
        "",
        f"📅 <b>{escape(almanac['date'])}（{weekday_zh(day)}）</b>",
        f"农历：{escape(almanac['lunar_date'])}",
        f"干支：{escape(ganzhi['year'])}｜{escape(ganzhi['month'])}｜{escape(ganzhi['day'])}",
        f"节气：{escape(almanac['solar_term'])}",
        "",
        f"⭐ <b>今日评级：{escape(almanac['rating_stars'])}</b>",
        escape(almanac["summary"]),
        "",
        f"✅ 宜：{escape(join_items(almanac['suitable']))}",
        f"❌ 忌：{escape(join_items(almanac['avoid']))}",
        "",
        "🧭 <b>方位</b>",
        f"财神：{escape(directions['wealth'])}",
        f"喜神：{escape(directions['joy'])}",
        f"福神：{escape(directions['blessing'])}",
        "",
        "👔 <b>颜色</b>",
        f"宜：{escape(join_items(colors['lucky']))}",
        f"忌：{escape(join_items(colors['avoid']))}",
        "",
        f"📚 学习：{escape(almanac['study_advice'])}",
        f"💼 工作：{escape(almanac['work_advice'])}",
        f"💰 财务：{escape(almanac['finance_advice'])}",
        "",
        "🌱 <b>今日一学</b>",
        f"{escape(learning['topic'])}：{escape(learning['text'])}",
        "",
        "💬 <b>今日金句</b>",
        f"{escape(maxim['text'])} —— {escape(maxim['author'])}",
    ]
    return "\n".join(lines)


def render_markdown_log(almanac: dict[str, Any]) -> str:
    day = parse_iso_date(almanac["date"])
    directions = almanac["directions"]
    colors = almanac["colors"]
    learning = almanac["daily_learning"]
    ganzhi = almanac["ganzhi"]

    maxim = almanac["maxim"]

    return "\n".join(
        [
            "# 🌿 D4N Daily",
            "",
            f"📅 **{almanac['date']}（{weekday_zh(day)}）**",
            f"农历：{almanac['lunar_date']}",
            f"干支：{ganzhi['year']}｜{ganzhi['month']}｜{ganzhi['day']}",
            f"节气：{almanac['solar_term']}",
            "",
            f"⭐ **今日评级：{almanac['rating_stars']}**",
            almanac["summary"],
            "",
            f"✅ 宜：{join_items(almanac['suitable'])}",
            f"❌ 忌：{join_items(almanac['avoid'])}",
            "",
            "## 🧭 方位",
            f"财神：{directions['wealth']}",
            f"喜神：{directions['joy']}",
            f"福神：{directions['blessing']}",
            "",
            "## 👔 颜色",
            f"宜：{join_items(colors['lucky'])}",
            f"忌：{join_items(colors['avoid'])}",
            "",
            f"📚 学习：{almanac['study_advice']}",
            f"💼 工作：{almanac['work_advice']}",
            f"💰 财务：{almanac['finance_advice']}",
            "",
            "## 🌱 今日一学",
            f"{learning['topic']}：{learning['text']}",
            "",
            "## 💬 今日金句",
            f"{maxim['text']} —— {maxim['author']}（{maxim['domain']}｜{maxim['source']}）",
            "",
        ]
    )
