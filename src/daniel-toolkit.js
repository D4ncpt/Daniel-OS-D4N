export const DANIEL_SCENARIOS = {
  lost: { label: "寻找失物", prompt: "例如：我的耳机放在哪里了？" },
  decision: { label: "进退 / 二选一", prompt: "例如：我应该现在推进，还是再等一周？" },
  career: { label: "事业 / 学业", prompt: "例如：这次申请应该怎么推进？" },
  relationship: { label: "关系 / 沟通", prompt: "例如：这段关系下一步怎么处理？" },
  travel: { label: "出行 / 安排", prompt: "例如：这次出行是否顺利，需注意什么？" },
  finance: { label: "财务 / 交易", prompt: "例如：这个项目现在适合投入吗？" },
  general: { label: "通用问事", prompt: "把你真正想问的事情写清楚。" }
};

const PROFILES = {
  乾: { direction: "西北", material: "金属、硬壳、圆形或有机械结构的物件", places: ["较高处、柜顶或架子上层", "办公桌、文件或电子设备附近"], quality: "位置偏高，周围较整齐" },
  兑: { direction: "正西", material: "金属、小型配件、带开口或发声部件的物件", places: ["开口容器、抽屉口或袋子边缘", "杯子、音响、工具或零碎物件附近"], quality: "位置偏低或靠近开口" },
  离: { direction: "正南", material: "电子、玻璃、塑料、发光或颜色显眼的物件", places: ["灯、屏幕、充电设备或电器附近", "视线能到但容易被其他亮眼物品干扰的位置"], quality: "并不深藏，更像是看过却忽略" },
  震: { direction: "正东", material: "木质、长条形、带声音或会移动的物件", places: ["门口、通道、鞋柜或常走动的位置", "车内、包的外层或刚移动过的物件旁"], quality: "有被顺手带走或挪动的迹象" },
  巽: { direction: "东南", material: "木、纸、布、线材或细长柔软的物件", places: ["抽屉深处、夹层、缝隙或文件之间", "衣物、布袋、纸张和线缆附近"], quality: "容易卡在夹层或被轻物覆盖" },
  坎: { direction: "正北", material: "液体容器、深色、柔软或与水相关的物件", places: ["洗手间、厨房、水杯或清洁用品附近", "低处、床底、桌底或光线较暗的位置"], quality: "位置偏低、偏暗，可能落入凹处" },
  艮: { direction: "东北", material: "石、陶瓷、硬塑料、方正厚重的物件", places: ["墙角、柜角、固定家具或架子末端", "背包、盒子、收纳筐或堆叠物旁"], quality: "被卡住或停在边角，没有继续移动" },
  坤: { direction: "西南", material: "布料、皮革、纸盒、陶土或方形容器", places: ["地面、床边、沙发旁或收纳箱内", "衣物、被子、袋子或其他柔软物下面"], quality: "很可能被覆盖、压在下面或混入成堆物品" }
};

const ADVANCE = new Set([1, 11, 14, 19, 24, 32, 35, 42, 46, 55]);
const WAIT = new Set([3, 5, 9, 12, 23, 29, 33, 36, 39, 47, 52, 64]);

function elementRelation(body, use) {
  const generates = { 金: "水", 水: "木", 木: "火", 火: "土", 土: "金" };
  const controls = { 金: "木", 木: "土", 土: "水", 水: "火", 火: "金" };
  if (body.element === use.element) return "same";
  if (generates[use.element] === body.element) return "supported";
  if (generates[body.element] === use.element) return "draining";
  if (controls[body.element] === use.element) return "controlling";
  return "pressured";
}

function baseSignals(cast) {
  const relation = elementRelation(cast.body, cast.use);
  const relationText = {
    supported: "外部条件在帮你，顺势做会比硬扛省力",
    controlling: "主动权在你这边，但需要明确动作和边界",
    same: "局面可控，关键是保持节奏，不要反复改主意",
    draining: "这件事会明显消耗你的时间或精力，必须设上限",
    pressured: "阻力比表面更强，硬推容易付出过多"
  }[relation];
  const pace = WAIT.has(cast.original.number) ? "wait" : ADVANCE.has(cast.original.number) ? "advance" : "measured";
  return { relation, relationText, pace };
}

function commonReading(cast, question) {
  const signals = baseSignals(cast);
  const verdict = signals.pace === "advance" && !["draining", "pressured"].includes(signals.relation)
    ? "可以往前走，但要把第一步做具体。"
    : signals.pace === "wait" || signals.relation === "pressured"
      ? "先别硬推，补条件比抢时间更重要。"
      : "可以试探性推进，边走边验证，不要一次押满。";
  return {
    verdict,
    summary: `${cast.original.name}讲的是“${cast.original.theme}”。对“${question}”这件事，${signals.relationText}。${cast.changed.name}提示后续会转向“${cast.changed.theme}”。`,
    sections: [
      { title: "现在的局面", body: `${cast.original.meaning}${cast.relation}` },
      { title: "真正的卡点", body: `${cast.original.caution} 你需要处理的不是表面情绪，而是资源、边界或时机里最弱的一项。` },
      { title: "后续走势", body: `${cast.movingLine}爻动，事情会从${cast.original.name}转到${cast.changed.name}。${cast.changed.meaning}` },
      { title: "直白建议", body: `${cast.original.action} 先做一个能在 24 小时内验证的信息或动作，再决定是否加码。` }
    ],
    nextSteps: ["写下你真正要的结果", "补齐一个关键事实", "做一次低成本试探", "根据反馈决定继续、调整或停止"]
  };
}

function lostReading(cast, question) {
  const profile = PROFILES[cast.use.name];
  const level = cast.movingLine <= 2 ? "低处、里面或靠近地面" : cast.movingLine <= 4 ? "腰部到桌面高度、房间交界处" : "较高处、外层或你平时不常抬眼看的位置";
  const yinCount = cast.use.lines.filter((line) => line === 0).length;
  const cover = yinCount >= 2 ? "被衣物、纸张、袋子或其他物品盖住" : "没有完全被盖住，但被相似颜色或杂物挡住视线";
  const signals = baseSignals(cast);
  const recovery = signals.relation === "supported" || signals.relation === "same" ? "还在熟悉范围内，找回机会高" : signals.relation === "controlling" ? "能找回，但要按顺序翻找，不能只凭印象" : "位置有过移动，搜索范围要扩大一圈";
  return {
    verdict: `先找${profile.direction}方向：${profile.places[0]}。`,
    summary: `这件失物以用卦${cast.use.name}为主要线索。判断是：${recovery}；${profile.quality}，并且${cover}。`,
    sections: [
      { title: "方位与范围", body: `从你最后一次确定见到它的位置出发，优先查${profile.direction}。先查同一房间，再扩大到相邻空间，不要一上来全屋乱翻。` },
      { title: "高低与遮挡", body: `重点是${level}。${profile.quality}，更像是${cover}。` },
      { title: "材质与周边", body: `卦象指向${profile.material}；周边重点看${profile.places[1]}。如果物件本身不是这种材质，就找这些材质的容器或邻近物。` },
      { title: "是否被移动", body: `${cast.changed.name}显示后续线索是“${cast.changed.theme}”。${cast.movingLine >= 4 ? "有人顺手整理、移动或放高的可能更大。" : "更像是自己随手放下后被遮住，没有离开原本活动范围。"}` }
    ],
    nextSteps: [
      `站在最后确认位置，面向${profile.direction}开始`,
      `先查${profile.places[0]}`,
      `再查${profile.places[1]}`,
      "把覆盖物完整拿开，不要只用眼睛扫",
      "仍未找到时，按最近 3 次移动路线倒序重走"
    ]
  };
}

function decisionReading(cast, question, options) {
  const signals = baseSignals(cast);
  const optionA = options.optionA || "主动推进";
  const optionB = options.optionB || "暂缓或换一种做法";
  const favorA = signals.pace === "advance" && ["supported", "controlling", "same"].includes(signals.relation);
  const favorB = signals.pace === "wait" || ["draining", "pressured"].includes(signals.relation);
  const verdict = favorA ? `更倾向 A：${optionA}。` : favorB ? `更倾向 B：${optionB}。` : `先小规模走 A，再保留转向 B 的出口。`;
  return {
    verdict,
    summary: `${cast.original.name}给出的核心不是“赌哪边”，而是${signals.pace === "wait" ? "先解决条件不足" : signals.pace === "advance" ? "抓住窗口并主动执行" : "用试探换取更多信息"}。${signals.relationText}。`,
    sections: [
      { title: `走 A · ${optionA}`, body: favorA ? `顺着本卦的“${cast.original.theme}”走，短期更容易形成进展。前提是先定目标、截止点和失败后的退出方式。` : `A 会带来更快反馈，但消耗也更明显。若要走 A，只做可撤回的第一步，不要一次投入全部资源。` },
      { title: `走 B · ${optionB}`, body: favorB ? `B 更符合当前节奏，能先避开主要阻力。它不是放弃，而是用时间换条件；必须设重新评估的日期。` : `B 会更稳，但也可能错过窗口。只有当关键事实仍不清楚，或 A 的代价不可逆时才选 B。` },
      { title: "为什么", body: `体用关系显示：${signals.relationText}。${cast.movingLine}爻动后转为${cast.changed.name}，后续主题是“${cast.changed.theme}”，说明当前选择还会引出下一阶段调整。` },
      { title: "观察信号", body: `接下来重点看三件事：对方是否给出明确回应、关键资源是否按时到位、你做完第一步后精力是增加还是明显被抽空。三项中有两项为正，就继续。` }
    ],
    nextSteps: ["分别写出 A/B 最坏结果", "找出一项不可逆成本", "为倾向方案设计一个小测试", "设定明确的复盘日期"]
  };
}

function scenarioReading(cast, type, question) {
  const signals = baseSignals(cast);
  const maps = {
    career: {
      verdict: signals.pace === "wait" ? "先补能力、材料或关键关系，再正式推进。" : "可以推进，重点不是更忙，而是让成果被正确的人看见。",
      focus: "职位要求、可证明的成果、关键联系人与下一次明确跟进",
      avoid: "同时铺太多方向，或者在没有反馈标准时反复修改"
    },
    relationship: {
      verdict: signals.relation === "pressured" ? "先拉开一点距离，不要在情绪最高点逼答案。" : "可以沟通，但要谈具体行为，不要猜对方心思。",
      focus: "对方实际投入、回应是否稳定、边界是否被尊重",
      avoid: "用试探、冷处理或过度解释代替直接表达"
    },
    travel: {
      verdict: signals.pace === "wait" ? "行程能缓则缓；必须走就准备完整备选方案。" : "可以出行，提前确认时间、路线和关键预约。",
      focus: "交通衔接、证件、天气、充电与备用联络方式",
      avoid: "卡点过密、临时改路线或为了赶时间忽略细节"
    },
    finance: {
      verdict: ["draining", "pressured"].includes(signals.relation) ? "现在不适合重仓或一次投入，先保现金和退出能力。" : "可以小额验证，但先算清最坏损失和回收周期。",
      focus: "现金流、真实需求、退出条件、对方履约能力",
      avoid: "被已经投入的成本绑架，或把乐观预期当成确定收入"
    }
  };
  const chosen = maps[type];
  if (!chosen) return commonReading(cast, question);
  return {
    verdict: chosen.verdict,
    summary: `${cast.original.name}对应“${cast.original.theme}”。${signals.relationText}；变卦${cast.changed.name}说明后续会进入“${cast.changed.theme}”的阶段。`,
    sections: [
      { title: "核心判断", body: `${cast.original.meaning}${cast.relation}` },
      { title: "重点看什么", body: chosen.focus },
      { title: "别做什么", body: `${chosen.avoid}。${cast.original.caution}` },
      { title: "后续变化", body: `${cast.movingLine}爻动转为${cast.changed.name}。${cast.changed.meaning}` }
    ],
    nextSteps: [cast.original.action, `核对：${chosen.focus}`, "先做一个可验证且可撤回的动作", "根据真实反馈决定是否继续"]
  };
}

export function buildDanielReading(cast, type, question, options = {}) {
  if (type === "lost") return lostReading(cast, question);
  if (type === "decision") return decisionReading(cast, question, options);
  return scenarioReading(cast, type, question);
}
