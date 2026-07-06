from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from renderers import render_markdown_log


PROJECT_ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = PROJECT_ROOT / "config" / "profile.json"
DATA_DIR = PROJECT_ROOT / "data"
LOGS_DIR = PROJECT_ROOT / "logs"
TIMEZONE = "Asia/Tokyo"

VALID_RATINGS = {"大吉", "吉", "平", "小凶"}
RATING_STARS = {
    "大吉": "★★★★★",
    "吉": "★★★★☆",
    "平": "★★★☆☆",
    "小凶": "★★☆☆☆",
}

CONCEPTS = [
    ("干支", "干支由十天干与十二地支组合而成，用来标记年月日。看它不必迷信，可当作每日节奏的传统标签。"),
    ("节气", "节气反映太阳运行带来的季节变化。它适合提醒自己顺势调整作息、复盘节奏和安排长期计划。"),
    ("宜忌", "宜忌是传统日课的行动提示。今天只取其轻量参考，把它转成学习、沟通和财务上的小提醒。"),
    ("财神方位", "财神方位是传统黄历里的象征方位。现实里更重要的是资金纪律：先研究，再决策，别被情绪带走。"),
    ("喜神方位", "喜神常被理解为顺畅与好心情的象征。今天可把它当作沟通提醒：少争高下，多争清楚。"),
    ("福神方位", "福神偏向稳定与积累。对学习和职业发展来说，真正的福气常来自持续复盘和按时交付。"),
    ("建除十二神", "建除十二神是传统择日系统的一部分，用十二种状态描述日子的倾向。这里只做轻量学习，不作绝对判断。"),
]

COLOR_SETS = [
    (["墨绿", "米白"], ["大红"]),
    (["藏青", "银灰"], ["亮橙"]),
    (["深蓝", "白色"], ["紫色"]),
    (["橄榄绿", "浅灰"], ["正红"]),
    (["黑色", "米白"], ["荧光色"]),
]

SUMMARY_BY_RATING = {
    "大吉": "适合推进关键事项，但仍要先确认边界和节奏。",
    "吉": "今日宜稳步推进，不宜仓促决策。",
    "平": "适合整理、复盘和打基础，少做高风险动作。",
    "小凶": "今天以保守为主，先稳住情绪和现金流。",
}

STUDY_LINES = [
    "适合做财务分析、案例拆解和错题复盘。",
    "适合整理简历素材、项目记录和面试要点。",
    "适合读研报、做笔记，把观点压缩成三句话。",
    "适合补基础概念，不急着追新知识。",
]

WORK_LINES = [
    "推进已有事项，重要沟通先写清楚结论。",
    "适合做收尾和对齐，不急于开启新项目。",
    "适合检查材料细节，减少低级错误。",
    "把任务拆小，先交付一个可验证版本。",
]

FINANCE_LINES = [
    "以观察为主，不宜冲动交易。",
    "适合研究标的和复盘账本，不适合重仓。",
    "可小额尝试，但要提前写下止损条件。",
    "保守处理现金流，先看风险再看收益。",
]

MAXIMS = [
    {
        "text": "千里之行，始于足下。",
        "author": "老子",
        "domain": "道家",
        "source": "《道德经》第六十四章",
    },
    {
        "text": "不积跬步，无以至千里。",
        "author": "荀子",
        "domain": "儒家",
        "source": "《荀子·劝学》",
    },
    {
        "text": "胜兵先胜而后战。",
        "author": "孙子",
        "domain": "兵家",
        "source": "《孙子兵法·形篇》",
    },
    {
        "text": "应无所住，而生其心。",
        "author": "《金刚经》",
        "domain": "佛家",
        "source": "《金刚经》",
    },
    {
        "text": "发展才是硬道理。",
        "author": "邓小平",
        "domain": "政界",
        "source": "南方谈话相关表述",
    },
    {
        "text": "价格是你付出的，价值是你得到的。",
        "author": "沃伦·巴菲特",
        "domain": "商界",
        "source": "价值投资名言",
    },
    {
        "text": "反过来想，总是反过来想。",
        "author": "查理·芒格",
        "domain": "商界",
        "source": "逆向思维名言",
    },
]


def today_in_tokyo() -> str:
    return datetime.now(ZoneInfo(TIMEZONE)).strftime("%Y-%m-%d")


def load_profile() -> dict[str, Any]:
    if not CONFIG_PATH.exists():
        return {}
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def call_first(obj: Any, names: list[str], default: Any = "") -> Any:
    for name in names:
        method = getattr(obj, name, None)
        if callable(method):
            value = method()
            if value:
                return value
    return default


def normalize_items(value: Any, limit: int = 3) -> list[str]:
    if isinstance(value, str):
        items = [value]
    elif isinstance(value, list):
        items = value
    elif isinstance(value, tuple):
        items = list(value)
    else:
        items = []
    cleaned = [str(item).strip() for item in items if str(item).strip()]
    return cleaned[:limit]


def normalize_direction(value: Any, fallback: str) -> str:
    text = str(value or fallback).strip()
    return text.removesuffix("方") or fallback


def solar_term_from_lunar(lunar: Any) -> str:
    term = call_first(lunar, ["getJieQi"], "")
    if term:
        return str(term)

    prev_jie_qi = call_first(lunar, ["getPrevJieQi", "getPrevJie"], None)
    if prev_jie_qi:
        name = call_first(prev_jie_qi, ["getName"], "")
        if name:
            return f"近{name}"
    return "无"


def get_lunar_data(target_date: str) -> dict[str, Any]:
    year, month, day = [int(part) for part in target_date.split("-")]

    try:
        from lunar_python import Solar
    except ImportError:
        return fallback_lunar_data(target_date)

    solar = Solar.fromYmd(year, month, day)
    lunar = solar.getLunar()

    lunar_year = f"{call_first(lunar, ['getYearInGanZhiExact', 'getYearInGanZhi'], '')}年"
    lunar_month_day = f"{call_first(lunar, ['getMonthInChinese'], '')}月{call_first(lunar, ['getDayInChinese'], '')}"
    ganzhi = {
        "year": f"{call_first(lunar, ['getYearInGanZhiExact', 'getYearInGanZhi'], '')}年",
        "month": f"{call_first(lunar, ['getMonthInGanZhiExact', 'getMonthInGanZhi'], '')}月",
        "day": f"{call_first(lunar, ['getDayInGanZhiExact', 'getDayInGanZhi'], '')}日",
    }
    suitable = normalize_items(call_first(lunar, ["getDayYi"], []), limit=3)
    avoid = normalize_items(call_first(lunar, ["getDayJi"], []), limit=3)

    return {
        "lunar_date": f"{lunar_year} {lunar_month_day}",
        "ganzhi": ganzhi,
        "solar_term": solar_term_from_lunar(lunar),
        "suitable": suitable or ["学习", "整理", "沟通"],
        "avoid": avoid or ["争执", "冲动消费", "仓促决策"],
        "directions": {
            "wealth": normalize_direction(
                call_first(lunar, ["getDayPositionCaiDesc", "getDayPositionCai"], ""),
                "正东",
            ),
            "joy": normalize_direction(
                call_first(lunar, ["getDayPositionXiDesc", "getDayPositionXi"], ""),
                "东南",
            ),
            "blessing": normalize_direction(
                call_first(lunar, ["getDayPositionFuDesc", "getDayPositionFu"], ""),
                "正北",
            ),
        },
        "source": "lunar-python",
    }


def fallback_lunar_data(target_date: str) -> dict[str, Any]:
    seed = date_seed(target_date)
    stems = "甲乙丙丁戊己庚辛壬癸"
    branches = "子丑寅卯辰巳午未申酉戌亥"

    def gz(offset: int) -> str:
        return f"{stems[(seed + offset) % 10]}{branches[(seed + offset) % 12]}"

    directions = ["正东", "东南", "正南", "西南", "正西", "西北", "正北", "东北"]
    return {
        "lunar_date": "本地黄历库未安装",
        "ganzhi": {
            "year": f"{gz(0)}年",
            "month": f"{gz(1)}月",
            "day": f"{gz(2)}日",
        },
        "solar_term": "本地推算",
        "suitable": ["学习", "整理", "沟通"],
        "avoid": ["争执", "冲动消费", "仓促承诺"],
        "directions": {
            "wealth": directions[seed % len(directions)],
            "joy": directions[(seed + 2) % len(directions)],
            "blessing": directions[(seed + 4) % len(directions)],
        },
        "source": "local-fallback",
    }


def date_seed(target_date: str) -> int:
    return sum(int(part) for part in target_date.split("-"))


def pick_rating(seed: int) -> str:
    ratings = ["平", "吉", "吉", "大吉", "平", "小凶"]
    return ratings[seed % len(ratings)]


def generate_daily_almanac(target_date: str) -> dict[str, Any]:
    load_profile()
    seed = date_seed(target_date)
    lunar_data = get_lunar_data(target_date)
    rating = pick_rating(seed)
    lucky_colors, avoid_colors = COLOR_SETS[seed % len(COLOR_SETS)]
    concept_title, concept_text = CONCEPTS[seed % len(CONCEPTS)]

    almanac = {
        "date": target_date,
        "timezone": TIMEZONE,
        "lunar_date": lunar_data["lunar_date"],
        "ganzhi": lunar_data["ganzhi"],
        "solar_term": lunar_data["solar_term"],
        "overall_rating": rating,
        "rating_stars": RATING_STARS[rating],
        "summary": SUMMARY_BY_RATING[rating],
        "suitable": lunar_data["suitable"],
        "avoid": lunar_data["avoid"],
        "directions": lunar_data["directions"],
        "colors": {
            "lucky": lucky_colors,
            "avoid": avoid_colors,
        },
        "study_advice": STUDY_LINES[seed % len(STUDY_LINES)],
        "work_advice": WORK_LINES[(seed + 1) % len(WORK_LINES)],
        "finance_advice": FINANCE_LINES[(seed + 2) % len(FINANCE_LINES)],
        "daily_learning": {
            "topic": concept_title,
            "text": concept_text[:80],
        },
        "maxim": MAXIMS[seed % len(MAXIMS)],
        "source": lunar_data["source"],
    }
    validate_almanac(almanac, target_date)
    save_outputs(almanac)
    return almanac


def validate_almanac(almanac: dict[str, Any], target_date: str) -> None:
    required = [
        "date",
        "timezone",
        "lunar_date",
        "ganzhi",
        "solar_term",
        "overall_rating",
        "rating_stars",
        "summary",
        "suitable",
        "avoid",
        "directions",
        "colors",
        "study_advice",
        "work_advice",
        "finance_advice",
        "daily_learning",
        "maxim",
        "source",
    ]
    missing = [key for key in required if key not in almanac]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")
    if almanac["date"] != target_date:
        raise ValueError("Generated date does not match target date")
    if almanac["overall_rating"] not in VALID_RATINGS:
        raise ValueError("overall_rating must be one of 大吉 / 吉 / 平 / 小凶")
    for key in ["suitable", "avoid"]:
        if not isinstance(almanac[key], list) or not almanac[key]:
            raise ValueError(f"{key} must be a non-empty list")
    if len(almanac["daily_learning"]["text"]) > 80:
        raise ValueError("daily_learning.text must be 80 characters or fewer")
    maxim = almanac["maxim"]
    for key in ["text", "author", "domain", "source"]:
        if not str(maxim.get(key, "")).strip():
            raise ValueError(f"maxim.{key} cannot be empty")


def save_outputs(almanac: dict[str, Any]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    LOGS_DIR.mkdir(parents=True, exist_ok=True)

    json_path = DATA_DIR / f"{almanac['date']}.json"
    markdown_path = LOGS_DIR / f"{almanac['date']}.md"

    json_path.write_text(json.dumps(almanac, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    markdown_path.write_text(render_markdown_log(almanac), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate a local daily Chinese almanac JSON object.")
    parser.add_argument("--date", default=today_in_tokyo(), help="Target date in YYYY-MM-DD format.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    almanac = generate_daily_almanac(args.date)
    print(json.dumps(almanac, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
