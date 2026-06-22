import { HEXAGRAMS, HEXAGRAM_MATRIX } from "./hexagrams.js";

// Earlier Heaven numbers and line patterns are recorded bottom-to-top.
export const TRIGRAMS = [
  { number: 1, name: "乾", image: "天", element: "金", color: "象牙白", lines: [1,1,1] },
  { number: 2, name: "兑", image: "泽", element: "金", color: "柔金色", lines: [1,1,0] },
  { number: 3, name: "离", image: "火", element: "火", color: "暖朱色", lines: [1,0,1] },
  { number: 4, name: "震", image: "雷", element: "木", color: "青绿色", lines: [1,0,0] },
  { number: 5, name: "巽", image: "风", element: "木", color: "松柏绿", lines: [0,1,1] },
  { number: 6, name: "坎", image: "水", element: "水", color: "深海蓝", lines: [0,1,0] },
  { number: 7, name: "艮", image: "山", element: "土", color: "岩土黄", lines: [0,0,1] },
  { number: 8, name: "坤", image: "地", element: "土", color: "燕麦白", lines: [0,0,0] }
];

const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const modNumber = (value, base) => ((value - 1) % base + base) % base + 1;
const trigramByLines = (lines) => TRIGRAMS.find((item) => item.lines.every((line, index) => line === lines[index]));
const hexagramFor = (upperNumber, lowerNumber) => HEXAGRAMS[HEXAGRAM_MATRIX[upperNumber - 1][lowerNumber - 1]];

export function doubleHour(date = new Date()) {
  const number = Math.floor(((date.getHours() + 1) % 24) / 2) + 1;
  return { number, name: BRANCHES[number - 1] };
}

function bodyUseReading(body, use) {
  if (body.element === use.element) return `体用同属${body.element}，宜保持稳定与协同。`;
  const generates = { 金: "水", 水: "木", 木: "火", 火: "土", 土: "金" };
  const controls = { 金: "木", 木: "土", 土: "水", 水: "火", 火: "金" };
  if (generates[use.element] === body.element) return `用${use.element}生体${body.element}，外部条件对你较有助力。`;
  if (generates[body.element] === use.element) return `体${body.element}生用${use.element}，投入较多，注意保存精力。`;
  if (controls[body.element] === use.element) return `体${body.element}克用${use.element}，主动规划较能掌握局面。`;
  return `用${use.element}克体${body.element}，阻力偏强，宜谨慎借力。`;
}

const BUSINESS_MODES = {
  growth: new Set([1, 11, 14, 19, 35, 42, 46, 55]),
  wait: new Set([5, 9, 12, 23, 33, 36, 39, 47, 52]),
  change: new Set([18, 21, 40, 41, 43, 49, 59, 60]),
  partnership: new Set([7, 8, 13, 17, 31, 37, 45, 58, 61]),
  risk: new Set([3, 6, 10, 28, 29, 38, 44, 54, 62, 64])
};

const TRAVEL_MODES = {
  favorable: new Set([1, 11, 14, 17, 19, 24, 35, 40, 42, 46, 53]),
  companion: new Set([2, 7, 8, 13, 31, 45, 58, 61]),
  delay: new Set([3, 5, 6, 12, 23, 29, 33, 36, 39, 47, 52])
};

function businessReading(hexagram) {
  if (BUSINESS_MODES.growth.has(hexagram.number)) return `外部空间较好，可在风险可控的前提下主动争取机会；${hexagram.action}`;
  if (BUSINESS_MODES.wait.has(hexagram.number)) return `宜守住现金流与核心资源，暂缓高杠杆或重投入；${hexagram.action}`;
  if (BUSINESS_MODES.change.has(hexagram.number)) return `先处理旧问题与低效环节，再谈扩张；交易条件和退出边界要写清楚。`;
  if (BUSINESS_MODES.partnership.has(hexagram.number)) return `合作能放大机会，但应先确认利益一致、权责清楚；${hexagram.caution}`;
  if (BUSINESS_MODES.risk.has(hexagram.number)) return `市场变量较多，适合小规模验证、分段投入，并预留止损空间。`;
  return `以稳健经营和真实需求为先，先验证价值再增加投入；${hexagram.caution}`;
}

function travelReading(hexagram) {
  if (TRAVEL_MODES.favorable.has(hexagram.number)) return `出行总体可行，适合带着明确目标行动；仍应提前确认时间、路线与关键预约。`;
  if (TRAVEL_MODES.companion.has(hexagram.number)) return `宜结伴或提前联系当地可靠的人，合作与照应会让行程更顺。`;
  if (TRAVEL_MODES.delay.has(hexagram.number)) return `非必要行程可稍缓；必须出行时，应准备备选路线并避免赶时间、涉险或临时改动。`;
  return `可安排短程或准备充分的行程，轻装守时，不因一时兴起打乱主要计划。`;
}

// Detailed readings are generated from the stored hexagram data so older saved casts also gain the new notes.
export function practicalGuidance(cast) {
  const hexagram = cast.original;
  return {
    structure: `${cast.upper.name}上${cast.lower.name}下 · ${cast.upper.image}上${cast.lower.image}下`,
    overview: `${hexagram.meaning}${cast.relation}`,
    change: `${cast.movingLine}爻动，后势转为${cast.changed.name}。${cast.changed.meaning}`,
    decision: `${hexagram.action} 判断时以事实和长期后果为先；${hexagram.caution}`,
    career: `事业上宜围绕“${hexagram.theme}”安排节奏。${hexagram.action} 推进过程中，${hexagram.caution}`,
    business: businessReading(hexagram),
    travel: travelReading(hexagram)
  };
}

/**
 * Classical 物数占例: number -> upper; number + double-hour -> lower;
 * number + double-hour -> moving line. Source: 梅花易数·卷一.
 */
export function castNumberWithTime(input, date = new Date()) {
  const number = Math.abs(Math.trunc(Number(input)));
  if (!Number.isSafeInteger(number) || number < 1) throw new Error("请输入大于 0 的整数");
  const hour = doubleHour(date);
  const upperNumber = modNumber(number, 8);
  const combined = number + hour.number;
  const lowerNumber = modNumber(combined, 8);
  const movingLine = modNumber(combined, 6);
  const upper = TRIGRAMS[upperNumber - 1];
  const lower = TRIGRAMS[lowerNumber - 1];
  const original = hexagramFor(upperNumber, lowerNumber);
  const changedLines = [...lower.lines, ...upper.lines];
  changedLines[movingLine - 1] = changedLines[movingLine - 1] ? 0 : 1;
  const changedLower = trigramByLines(changedLines.slice(0, 3));
  const changedUpper = trigramByLines(changedLines.slice(3));
  const changed = hexagramFor(changedUpper.number, changedLower.number);
  const movingInLower = movingLine <= 3;
  const body = movingInLower ? upper : lower;
  const use = movingInLower ? lower : upper;

  return {
    method: "meihua-number-time-v1",
    castAt: date.toISOString(),
    input: number,
    hour,
    upper,
    lower,
    movingLine,
    original,
    changed,
    body,
    use,
    relation: bodyUseReading(body, use),
    formula: {
      upper: `${number} ÷ 8，余 ${upperNumber} → ${upper.name}`,
      lower: `(${number} + ${hour.number}) ÷ 8，余 ${lowerNumber} → ${lower.name}`,
      moving: `(${number} + ${hour.number}) ÷ 6，余 ${movingLine} → ${movingLine}爻动`
    }
  };
}

export function castToDailyCard(cast, date) {
  return {
    method: cast.method,
    date,
    cast,
    gua: cast.original.name,
    symbol: cast.original.symbol,
    reading: `${cast.original.meaning}${cast.relation}`,
    quote: cast.original.theme,
    goodColor: cast.body.color,
    avoidColor: "高饱和冲突色",
    do: cast.original.action,
    caution: cast.original.caution
  };
}
