import { storage, uid, initializeStorage } from "./store.js?v=5";
import { castNumberWithTime, castToDailyCard, doubleHour, practicalGuidance } from "./meihua.js?v=4";
import { cfaModules, cfaTopicCount } from "./cfa-data.js?v=3";
import { DANIEL_SCENARIOS, buildDanielReading } from "./daniel-toolkit.js?v=5";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const main = $("#main-content");
const modalLayer = $("#modal-layer");
let lastFocus = null;
let taskFilter = "all";
let summaryFilter = "daily";
let dailyMode = "daily";
let toolkitActiveId = null;
let toolkitType = "lost";
let deferredInstallPrompt = null;

const iconPaths = {
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
  note: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>',
  chart: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z"/><path d="M4 6.5v13M8 8h8M8 12h6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m15 9 6-6"/>',
  location: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5"/>'
  ,spark: '<path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8ZM5 14l.7 1.8 1.8.7-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7Z"/>'
};

function hydrateIcons(root = document) {
  $$('[data-icon]', root).forEach((node) => {
    node.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[node.dataset.icon] || ""}</svg>`;
  });
}

const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
const isoDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fromISO = (value) => new Date(`${value}T12:00:00`);
const today = () => isoDate();
const addDays = (value, days) => { const date = fromISO(value); date.setDate(date.getDate() + days); return isoDate(date); };
const dateLabel = (value, options = {}) => fromISO(value).toLocaleDateString("zh-CN", options);
const nowLabel = (value) => new Date(value).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const categoryLabels = { Daily: "日常事项", Quiz: "Quiz", Exam: "Exam", Presentation: "Presentation", Assignment: "Assignment", Career: "Career", Personal: "Personal" };
const priorities = { high: "高优先级", medium: "中优先级", low: "低优先级" };
const statuses = ["想投递", "准备材料", "已投递", "面试中", "Follow-up", "Offer", "Rejected"];
const statusClasses = { "想投递": "wish", "准备材料": "preparing", "已投递": "applied", "面试中": "interview", "Follow-up": "followup", "Offer": "offer", "Rejected": "rejected" };
const summaryLabels = { daily: "每日总结", weekly: "每周总结", monthly: "月度总结" };

function detectSmartType(text) {
  const value = text.trim();
  if (/^(投递|申请|职业)[：:]/i.test(value) || /(投递|申请|面试|offer|公司|岗位|职位)/i.test(value)) return "application";
  if (/^(总结|复盘)[：:]/.test(value) || /(每日总结|本周总结|周总结|月度总结|本月总结|复盘)/.test(value)) return "summary";
  if (/^(备忘|笔记|记录|想法)[：:]/.test(value) || /(备忘|记下来|记一下|灵感|想法)/.test(value)) return "note";
  return "task";
}

const smartLabels = { task: "日历与任务", application: "职业投递", note: "备忘录", summary: "进度总结" };
const cleanPrefix = (text) => text.replace(/^(任务|待办|提醒|投递|申请|职业|备忘|笔记|记录|想法|总结|复盘)[：:]\s*/i, "").trim();

function inferredDate(text) {
  if (/后天/.test(text)) return addDays(today(), 2);
  if (/明天/.test(text)) return addDays(today(), 1);
  const iso = text.match(/\b(20\d{2}-\d{1,2}-\d{1,2})\b/);
  if (iso) return iso[1].split("-").map((part, index) => index ? part.padStart(2, "0") : part).join("-");
  const monthDay = text.match(/(\d{1,2})月(\d{1,2})[日号]?/);
  if (monthDay) return `${new Date().getFullYear()}-${monthDay[1].padStart(2,"0")}-${monthDay[2].padStart(2,"0")}`;
  return today();
}

function parseSmartEntry(raw) {
  const type = detectSmartType(raw);
  const content = cleanPrefix(raw);
  if (type === "application") {
    const parts = content.split(/[｜|]/).map((part) => part.trim()).filter(Boolean);
    const sentence = content.match(/^(?:投递|申请)?\s*([^，,的]+?)(?:的|[-—])\s*([^，,]+)(?:[，,]\s*([^，,]+))?/);
    const detectedStatus = statuses.find((status) => new RegExp(status, "i").test(raw)) || (/面试/i.test(raw) ? "面试中" : "想投递");
    return { type, item: { id: uid(), company: parts[0] || sentence?.[1] || "待补充公司", role: parts[1] || sentence?.[2] || "待补充岗位", location: parts[2] || sentence?.[3] || "", applicationDate: today(), deadline: "", status: statuses.includes(parts[3]) ? parts[3] : detectedStatus, contact: "", notes: raw, nextAction: "补充申请信息", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } };
  }
  if (type === "summary") {
    const summaryType = /(月度|本月|月总结)/.test(raw) ? "monthly" : /(本周|周总结)/.test(raw) ? "weekly" : "daily";
    return { type, item: { id: uid(), type: summaryType, date: today(), content, createdAt: new Date().toISOString() } };
  }
  if (type === "note") {
    const title = content.split(/[。！!？?\n]/)[0].slice(0, 24) || "新备忘";
    return { type, item: { id: uid(), title, content, createdAt: new Date().toISOString() } };
  }
  const category = /quiz/i.test(raw) ? "Quiz" : /exam|考试/i.test(raw) ? "Exam" : /presentation|演讲|展示/i.test(raw) ? "Presentation" : /assignment|作业/i.test(raw) ? "Assignment" : /求职|简历|面试|career/i.test(raw) ? "Career" : /个人|健身|生活/i.test(raw) ? "Personal" : "Daily";
  const priority = /紧急|重要|高优先|urgent/i.test(raw) ? "high" : /不急|低优先/i.test(raw) ? "low" : "medium";
  const title = content.replace(/\b20\d{2}-\d{1,2}-\d{1,2}\b|\d{1,2}月\d{1,2}[日号]?|今天|明天|后天/g, "").replace(/[#＃](高|中|低)优先级?/g, "").trim() || content;
  return { type, item: { id: uid(), title, date: inferredDate(raw), category, priority, completed: false, note: `由智能速记添加：${raw}`, createdAt: new Date().toISOString() } };
}

function getDailyCard(number) {
  const date = today();
  const saved = storage.get("dailyCards");
  if (number !== undefined) {
    saved[date] = castToDailyCard(castNumberWithTime(number), date);
    storage.set("dailyCards", saved);
  }
  if (saved[date]?.method === "meihua-number-time-v1") return saved[date];
  return { method: "awaiting-number", date, symbol: "易", gua: "静候一念", reading: "输入此刻自然想到的一个正整数，以当前时辰配数起卦。", quote: "数由心起，卦以时成。", goodColor: "沉静蓝", avoidColor: "无", do: "先安静片刻，再写下第一个浮现的数字", caution: "同一件事不宜短时间内反复起卦" };
}

function dailyCardHTML(card, expanded = false) {
  const awaiting = card.method === "awaiting-number";
  const cast = card.cast;
  const guidance = cast ? practicalGuidance(cast) : null;
  return `<article class="card daily-card" data-symbol="${card.symbol}">
    <div class="daily-card-head"><div><p class="eyebrow">DAILY GUIDANCE</p><h2>${escapeHTML(card.gua)}</h2></div><span class="gua-symbol" aria-hidden="true">${card.symbol}</span></div>
    <p class="daily-reading">${escapeHTML(card.reading)}</p>
    <blockquote class="daily-quote">“${escapeHTML(card.quote)}”</blockquote>
    ${cast ? `<div class="cast-route" aria-label="本卦与变卦"><div><small>本卦</small><strong>${cast.original.symbol} ${escapeHTML(cast.original.name)}</strong></div><span>${cast.movingLine}爻动 →</span><div><small>变卦</small><strong>${cast.changed.symbol} ${escapeHTML(cast.changed.name)}</strong></div></div>` : ""}
    <div class="daily-advice">
      <div class="advice-box"><span>适合颜色</span><strong>${escapeHTML(card.goodColor)}</strong></div>
      <div class="advice-box"><span>不建议颜色</span><strong>${escapeHTML(card.avoidColor)}</strong></div>
      <div class="advice-box"><span>今日适合</span><strong>${escapeHTML(card.do)}</strong></div>
      <div class="advice-box"><span>今日留意</span><strong>${escapeHTML(card.caution)}</strong></div>
    </div>${expanded && cast ? `<section class="hexagram-commentary"><header><div><span>《周易》卦象详解</span><h3>${escapeHTML(cast.original.name)}</h3></div><strong>${escapeHTML(guidance.structure)}</strong></header><div class="hexagram-overview"><span>卦意</span><p>${escapeHTML(guidance.overview)}</p></div><div class="hexagram-change"><span>${cast.movingLine}爻动</span><p>${escapeHTML(guidance.change)}</p></div><div class="guidance-grid"><article><span>决策</span><p>${escapeHTML(guidance.decision)}</p></article><article><span>事业</span><p>${escapeHTML(guidance.career)}</p></article><article><span>经商</span><p>${escapeHTML(guidance.business)}</p></article><article><span>出行</span><p>${escapeHTML(guidance.travel)}</p></article></div></section><div class="cast-formula"><div class="cast-formula-head"><div><span>起卦公式</span><strong>物数占例 · ${cast.hour.name}时（${cast.hour.number}）</strong></div><span>${dateLabel(card.date, {year:"numeric",month:"long",day:"numeric"})}</span></div><ol><li><span>上卦</span>${escapeHTML(cast.formula.upper)}</li><li><span>下卦</span>${escapeHTML(cast.formula.lower)}</li><li><span>动爻</span>${escapeHTML(cast.formula.moving)}</li></ol><p>体卦：${cast.body.name}（${cast.body.element}） · 用卦：${cast.use.name}（${cast.use.element}） · ${escapeHTML(cast.relation)}</p></div>` : ""}
    ${expanded ? `<p class="notice">${awaiting ? "输入一个自然浮现的数字，即可生成本卦、动爻与变卦。" : "公式采用《梅花易数》卷一“物数占例”，本卦、变卦与详细注释均在本机生成。"}</p>` : ""}
  </article>`;
}

function taskRows(tasks, full = false) {
  if (!tasks.length) return '<div class="empty-state"><div><strong>这里还很安静</strong>添加第一项任务，给今天一个清晰起点。</div></div>';
  return `<div class="task-list ${full ? "full-task-list" : ""}">${tasks.map((task) => `<div class="task-row ${task.completed ? "completed" : ""}" data-id="${task.id}">
    <button class="task-check ${task.completed ? "done" : ""}" data-action="toggle-task" aria-label="${task.completed ? "标记为未完成" : "标记为完成"}">${task.completed ? `<svg viewBox="0 0 24 24">${iconPaths.check}</svg>` : ""}</button>
    <div class="task-copy"><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML(categoryLabels[task.category] || task.category)}${task.note ? ` · ${escapeHTML(task.note)}` : ""}</small></div>
    ${full ? `<span class="date-label">${dateLabel(task.date, { month: "short", day: "numeric", weekday: "short" })}</span>` : ""}
    <span class="badge"><span class="priority-dot ${task.priority}"></span>&nbsp;${priorities[task.priority]}</span>
    ${full ? '<button class="icon-button small" data-action="delete-task" aria-label="删除任务"><span data-icon="trash"></span></button>' : ""}
  </div>`).join("")}</div>`;
}

function cfaState() {
  const completed = new Set(storage.get("cfaProgress"));
  const moduleStats = cfaModules.map((module) => {
    const done = module.topics.filter((topic) => completed.has(topic.id)).length;
    return { ...module, done, complete: done === module.topics.length };
  });
  const currentIndex = moduleStats.findIndex((module) => !module.complete);
  const done = completed.size;
  return { completed, moduleStats, currentIndex, done, percent: Math.round((done / cfaTopicCount) * 100) };
}

function cfaProgressCard() {
  const { moduleStats, currentIndex, done, percent } = cfaState();
  const current = moduleStats[currentIndex] || moduleStats.at(-1);
  return `<article class="card cfa-card"><div class="card-head"><div><h2>CFA 学习路径</h2><p>${currentIndex === -1 ? "四个阶段已完成" : `当前：${escapeHTML(current.shortTitle || current.title)}`}</p></div><button class="text-link" data-route-link="cfa">继续学习<span data-icon="arrow"></span></button></div><div class="cfa-mini-progress"><strong>${percent}%</strong><span>${done} / ${cfaTopicCount} topics</span></div><div class="progress-track"><span style="width:${percent}%"></span></div><div class="cfa-mini-steps">${moduleStats.map((module, index) => `<span class="${module.complete ? "done" : index === currentIndex ? "current" : ""}" title="${escapeHTML(module.title)}">${index + 1}</span>`).join("")}</div></article>`;
}

// Views only read state and return markup; shared event handlers perform all mutations.
function dashboardView() {
  const tasks = storage.get("tasks");
  const apps = storage.get("applications");
  const summaries = storage.get("summaries");
  const todayTasks = tasks.filter((task) => task.date === today()).sort((a, b) => a.completed - b.completed);
  const nextWeek = tasks.filter((task) => !task.completed && task.date > today() && task.date <= addDays(today(), 7)).sort((a, b) => a.date.localeCompare(b.date));
  const focus = todayTasks.find((task) => !task.completed) || nextWeek[0];
  const completed = todayTasks.filter((task) => task.completed).length;
  const interviews = apps.filter((app) => app.status === "面试中").length;
  const active = apps.filter((app) => !["Rejected", "Offer"].includes(app.status)).length;
  const offers = apps.filter((app) => app.status === "Offer").length;
  const latestSummary = summaries.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const d = new Date();
  const card = getDailyCard();
  return `<section class="dashboard-grid">
    <div class="dashboard-stack">
      <article class="card hero-card">
        <div class="date-stamp"><span class="month">${d.toLocaleDateString("en-US", { month: "short" })}</span><div class="day">${d.getDate()}</div><span class="weekday">${d.toLocaleDateString("zh-CN", { weekday: "long" })}</span></div>
        <div class="hero-focus"><p class="eyebrow">TODAY'S NORTH STAR</p><h2>${focus ? escapeHTML(focus.title) : "今天，先定义一件值得完成的事。"}</h2><p>${focus?.note ? escapeHTML(focus.note) : "清晰比忙碌更重要。添加今日重点，让注意力有一个落点。"}</p>
          <div class="hero-meta"><span class="hero-pill"><span data-icon="check"></span>${completed}/${todayTasks.length} 今日完成</span><span class="hero-pill"><span data-icon="calendar"></span>${nextWeek.length} 个近期节点</span><span class="hero-pill"><span data-icon="briefcase"></span>${interviews} 个面试进展</span></div>
        </div>
      </article>
      <article class="card tasks-card"><div class="card-head"><div><h2>今日任务</h2><p>${todayTasks.length ? `还剩 ${Math.max(0, todayTasks.length - completed)} 项待完成` : "从最重要的一项开始"}</p></div><button class="text-link" data-route-link="tasks">查看全部<span data-icon="arrow"></span></button></div>${taskRows(todayTasks.slice(0, 5))}</article>
      <article class="card deadline-card"><div class="card-head"><div><h2>未来 7 天</h2><p>提前看见，减少临时应对</p></div><span class="badge gold">${nextWeek.length} DEADLINES</span></div>${nextWeek.length ? `<div class="deadline-list">${nextWeek.slice(0, 4).map((task) => `<div class="deadline-item"><div class="deadline-date">${fromISO(task.date).getDate()}<small>${fromISO(task.date).toLocaleDateString("en-US", {month:"short"}).toUpperCase()}</small></div><div><strong>${escapeHTML(task.title)}</strong><span>${escapeHTML(categoryLabels[task.category] || task.category)} · ${priorities[task.priority]}</span></div></div>`).join("")}</div>` : '<div class="empty-state"><div><strong>未来一周暂无截止项</strong>现在是安排长期事项的好时间。</div></div>'}</article>
    </div>
    <div class="dashboard-stack">
      ${dailyCardHTML(card)}
      ${cfaProgressCard()}
      <article class="card career-card"><div class="card-head"><div><h2>投递进度</h2><p>Career pipeline</p></div><button class="text-link" data-route-link="career">进入看板<span data-icon="arrow"></span></button></div><div class="mini-stats"><div class="mini-stat"><strong>${apps.length}</strong><span>总记录</span></div><div class="mini-stat"><strong>${active}</strong><span>推进中</span></div><div class="mini-stat"><strong>${offers}</strong><span>Offer</span></div></div><div class="progress-track"><span style="width:${apps.length ? Math.round(((offers + interviews) / apps.length) * 100) : 0}%"></span></div></article>
      <article class="card latest-summary"><div class="card-head"><div><h2>最近总结</h2><p>${latestSummary ? summaryLabels[latestSummary.type] : "沉淀今天的收获"}</p></div><button class="text-link" data-route-link="summary">写总结<span data-icon="arrow"></span></button></div>${latestSummary ? `<blockquote>“${escapeHTML(latestSummary.content)}”</blockquote><footer>${dateLabel(latestSummary.date, { year:"numeric", month:"long", day:"numeric" })}</footer>` : '<div class="empty-state"><div><strong>还没有总结</strong>写下今天最值得记住的一件事。</div></div>'}</article>
    </div>
  </section>`;
}

function tasksView() {
  const all = storage.get("tasks").sort((a,b) => a.date.localeCompare(b.date));
  const tasks = all.filter((task) => taskFilter === "all" || (taskFilter === "open" ? !task.completed : taskFilter === "done" ? task.completed : task.category === taskFilter));
  return `<div class="page-intro"><div><h2>日历与任务</h2><p>把计划变成明确、可完成的下一步。</p></div><button class="primary-button" data-open="task"><span data-icon="plus"></span>添加任务</button></div>
    <div class="toolbar"><div class="filter-group">${[["all","全部"],["open","待完成"],["done","已完成"],["Career","Career"],["Personal","Personal"]].map(([key,label]) => `<button class="filter-button ${taskFilter === key ? "active" : ""}" data-task-filter="${key}">${label}</button>`).join("")}</div><span class="badge">${tasks.length} 项</span></div>
    <article class="card content-card">${taskRows(tasks, true)}</article>`;
}

function cfaView() {
  const { completed, moduleStats, currentIndex, done, percent } = cfaState();
  const current = moduleStats[currentIndex];
  return `<div class="page-intro cfa-intro"><div><p class="eyebrow">CFA STUDY PATH</p><h2>按顺序建立金融分析框架</h2><p>10 stages · Quant → Economics → FSA → Issuers → Investments → Ethics</p></div><span class="badge jade">${done} / ${cfaTopicCount} TOPICS</span></div>
    <section class="card cfa-hero"><div><span class="cfa-kicker">${current ? `PHASE ${String(currentIndex + 1).padStart(2, "0")}` : "PATH COMPLETE"}</span><h3>${current ? escapeHTML(current.shortTitle || current.title) : "学习路径已完成"}</h3><p>${current ? escapeHTML(current.description) : "四个阶段均已完成，可以从第一阶段开始循环复习。"}</p></div><div class="cfa-overall"><strong>${percent}%</strong><span>Overall progress</span><div class="progress-track"><span style="width:${percent}%"></span></div></div></section>
    <section class="cfa-roadmap">${moduleStats.map((module, index) => {
      const locked = currentIndex !== -1 && index > currentIndex;
      const isCurrent = index === currentIndex;
      const status = module.complete ? "已完成" : isCurrent ? "进行中" : locked ? "待解锁" : "可复习";
      return `<article class="card cfa-module ${module.complete ? "complete" : ""} ${isCurrent ? "current" : ""} ${locked ? "locked" : ""}"><header><div class="cfa-step">${String(index + 1).padStart(2, "0")}</div><div><p>${escapeHTML(module.label)}</p><h3>${escapeHTML(module.title)}</h3></div><span class="cfa-status">${status}</span></header><p class="cfa-description">${escapeHTML(module.description)}</p><div class="cfa-module-progress"><span>${module.done} / ${module.topics.length}</span><div class="progress-track"><span style="width:${Math.round((module.done / module.topics.length) * 100)}%"></span></div></div><div class="cfa-topics">${module.topics.map((topic) => {
        const checked = completed.has(topic.id);
        return `<button class="cfa-topic ${checked ? "done" : ""}" type="button" data-action="toggle-cfa-topic" data-topic-id="${topic.id}" ${locked ? "disabled" : ""}><span class="cfa-topic-check">${checked ? `<svg viewBox="0 0 24 24">${iconPaths.check}</svg>` : ""}</span><span>${escapeHTML(topic.title)}</span></button>`;
      }).join("")}</div>${locked ? '<footer>完成上一阶段后自动解锁</footer>' : ""}</article>`;
    }).join("")}</section>`;
}

function statusOptions(selected) { return statuses.map((status) => `<option ${status === selected ? "selected" : ""}>${status}</option>`).join(""); }
function careerView() {
  const apps = storage.get("applications");
  return `<div class="page-intro"><div><h2>职业投递</h2><p>让每一次申请都有记录，也都有明确的下一步。</p></div><button class="primary-button" data-open="application"><span data-icon="plus"></span>新增投递</button></div>
    <div class="pipeline-legend" aria-label="投递阶段颜色说明">${statuses.map((status) => `<span class="legend-item status-${statusClasses[status]}"><i></i>${status}</span>`).join("")}</div>
    <div class="kanban">${statuses.map((status) => { const entries = apps.filter((app) => app.status === status); return `<section class="kanban-column status-${statusClasses[status]}"><div class="kanban-head"><h3><i></i>${status}</h3><span class="kanban-count">${entries.length}</span></div><div class="application-list">${entries.map((app) => applicationCard(app)).join("") || '<div class="empty-state">暂无记录</div>'}</div></section>`; }).join("")}</div>`;
}

function applicationCard(app) {
  return `<article class="application-card" data-id="${app.id}"><h4>${escapeHTML(app.company)}</h4><div class="role">${escapeHTML(app.role)}</div><div class="application-meta"><span><span data-icon="location"></span>${escapeHTML(app.location || "地点待定")}</span><span><span data-icon="calendar"></span>${app.deadline ? dateLabel(app.deadline, {month:"short",day:"numeric"}) : "无截止日"}</span></div>${app.nextAction ? `<div class="application-next"><strong>Next action</strong>${escapeHTML(app.nextAction)}</div>` : ""}<div class="application-actions"><select data-action="status-application" aria-label="修改 ${escapeHTML(app.company)} 的状态">${statusOptions(app.status)}</select><button class="icon-button small" data-action="edit-application" aria-label="编辑投递"><span data-icon="edit"></span></button><button class="icon-button small" data-action="delete-application" aria-label="删除投递"><span data-icon="trash"></span></button></div></article>`;
}

function notesView() {
  const notes = storage.get("notes").sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  return `<div class="page-intro"><div><h2>备忘录</h2><p>捕捉还没来得及成为计划的想法。</p></div><button class="primary-button" data-open="note"><span data-icon="plus"></span>新建备忘</button></div>
    <section class="notes-grid">${notes.map((note) => `<article class="card note-card" data-id="${note.id}"><h3>${escapeHTML(note.title)}</h3><p>${escapeHTML(note.content)}</p><footer><time>${nowLabel(note.createdAt)}</time><button class="icon-button small" data-action="delete-note" aria-label="删除备忘录"><span data-icon="trash"></span></button></footer></article>`).join("") || '<div class="empty-state"><div><strong>没有备忘录</strong>随手记下一条想法，不必先把它想完整。</div></div>'}</section>`;
}

function dailyModeSwitch() {
  return `<div class="daily-mode-switch" role="tablist" aria-label="每日卡片模式"><button type="button" role="tab" aria-selected="${dailyMode === "daily"}" class="${dailyMode === "daily" ? "active" : ""}" data-daily-mode="daily"><span data-icon="sun"></span><span><strong>每日一卦</strong><small>今天的固定卡片</small></span></button><button type="button" role="tab" aria-selected="${dailyMode === "toolkit"}" class="${dailyMode === "toolkit" ? "active" : ""}" data-daily-mode="toolkit"><span data-icon="spark"></span><span><strong>Daniel 妙妙工具台</strong><small>针对一件具体的事</small></span></button></div>`;
}

function dailyHexagramView() {
  const card = getDailyCard();
  const hour = doubleHour();
  return `<section class="daily-page-grid">${dailyCardHTML(card, true)}<aside class="card number-panel"><div class="number-panel-head"><p class="eyebrow">MEIHUA NUMBER CAST</p>${card.cast ? '<button class="text-link" type="button" data-action="clear-daily">清除今日卦</button>' : ""}</div><h3>输入此刻想到的数字</h3><p>当前为${hour.name}时，时辰序数 ${hour.number}。数字定上卦，数字加时辰定下卦与动爻。</p><form id="daily-number-form" class="inline-form"><label class="field"><span class="skip-link">正整数</span><input name="number" type="number" min="1" step="1" inputmode="numeric" required placeholder="例如：8" aria-label="输入一个正整数" /></label><button class="primary-button">按此数起卦</button></form><div class="method-steps"><div><span>1</span><p><strong>上卦</strong>数字 ÷ 8 取余</p></div><div><span>2</span><p><strong>下卦</strong>数字 + 时辰，再 ÷ 8 取余</p></div><div><span>3</span><p><strong>动爻</strong>数字 + 时辰，再 ÷ 6 取余</p></div></div><div class="notice">余数为 0 时，八卦取 8（坤），动爻取 6。结果和 64 卦解释均离线保存在网站中。</div></aside></section>`;
}

function toolkitResultHTML(record) {
  if (!record) return `<article class="card toolkit-empty"><span data-icon="spark"></span><p class="eyebrow">DANIEL / READY</p><h3>你问清楚，我把卦拆成人话。</h3><p>选择问题类型，写下具体问题，再输入此刻自然想到的数字。结论会出现在这里。</p><div class="toolkit-empty-list"><span>失物：方位、材质、遮挡、搜索顺序</span><span>进退：A/B 方向、原因、后续信号</span><span>其他：结论、卡点、走势、下一步</span></div></article>`;
  const { cast, reading } = record;
  return `<article class="card toolkit-result" data-id="${record.id}"><header><div><p class="eyebrow">DANIEL / FIELD NOTE</p><span>${escapeHTML(DANIEL_SCENARIOS[record.type]?.label || "通用问事")} · ${nowLabel(record.createdAt)}</span></div><div class="toolkit-glyph" aria-hidden="true">${cast.original.symbol}</div></header><div class="toolkit-question"><span>你问</span><h3>${escapeHTML(record.question)}</h3></div><div class="toolkit-verdict"><span>直接结论</span><strong>${escapeHTML(reading.verdict)}</strong></div><div class="toolkit-cast-route"><div><small>本卦</small><strong>${cast.original.symbol} ${escapeHTML(cast.original.name)}</strong></div><span>${cast.movingLine}爻动</span><div><small>变卦</small><strong>${cast.changed.symbol} ${escapeHTML(cast.changed.name)}</strong></div><span>体${cast.body.name} · 用${cast.use.name}</span></div><p class="toolkit-summary">${escapeHTML(reading.summary)}</p><section class="toolkit-analysis">${reading.sections.map((section) => `<article><span>${escapeHTML(section.title)}</span><p>${escapeHTML(section.body)}</p></article>`).join("")}</section><section class="toolkit-steps"><div><p class="eyebrow">DO THIS NEXT</p><h4>按这个顺序做</h4></div><ol>${reading.nextSteps.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}</ol></section><details class="toolkit-formula"><summary>查看起卦细节</summary><div><span>${escapeHTML(cast.formula.upper)}</span><span>${escapeHTML(cast.formula.lower)}</span><span>${escapeHTML(cast.formula.moving)}</span><span>${escapeHTML(cast.relation)}</span></div></details></article>`;
}

function danielToolkitView() {
  const records = storage.get("divinations").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const active = records.find((record) => record.id === toolkitActiveId) || records[0];
  if (active && !toolkitActiveId) toolkitType = active.type;
  if (active) toolkitActiveId = active.id;
  return `<section class="toolkit-intro"><div><p class="eyebrow">DANIEL'S TOOLKIT</p><h2>把一件事问具体</h2><p>选对问题类型，回答会直接进入对应模板，不再只给泛泛的卦意。</p></div><span class="toolkit-online"><i></i>本机运行</span></section><section class="toolkit-workbench"><aside class="card toolkit-console"><div class="toolkit-console-brand"><span>D</span><div><strong>Daniel</strong><small>妙妙工具台</small></div></div><form id="daniel-toolkit-form"><div class="field"><label for="toolkit-type">你要问什么</label><select id="toolkit-type" name="type">${Object.entries(DANIEL_SCENARIOS).map(([key, item]) => `<option value="${key}" ${key === toolkitType ? "selected" : ""}>${item.label}</option>`).join("")}</select></div><div class="field"><label for="toolkit-question">具体问题</label><textarea id="toolkit-question" name="question" required placeholder="${DANIEL_SCENARIOS[toolkitType].prompt}"></textarea><small>一次只问一件事，问题越具体，回答越有用。</small></div><div class="toolkit-choice-fields" ${toolkitType === "decision" ? "" : "hidden"}><div class="field"><label for="toolkit-option-a">方案 A</label><input id="toolkit-option-a" name="optionA" placeholder="例如：现在主动推进" /></div><div class="field"><label for="toolkit-option-b">方案 B</label><input id="toolkit-option-b" name="optionB" placeholder="例如：再等一周" /></div></div><div class="field"><label for="toolkit-number">此刻想到的数字</label><input id="toolkit-number" name="number" type="number" min="1" step="1" inputmode="numeric" required placeholder="正整数" /></div><button class="primary-button toolkit-cast-button"><span data-icon="spark"></span>让 Daniel 拆解</button></form><div class="toolkit-scope"><span>回答模板</span><p>方位 · 材质 · 遮挡 · 进退 · 原因 · 走势 · 行动</p></div></aside><div class="toolkit-output">${toolkitResultHTML(active)}</div></section><section class="toolkit-history"><div class="card-head"><div><h2>问事记录</h2><p>${records.length ? `${records.length} 条，仅保存在这台设备` : "还没有记录"}</p></div></div><div class="toolkit-history-list">${records.slice(0, 12).map((record) => `<article class="${record.id === active?.id ? "active" : ""}" data-id="${record.id}"><button type="button" data-action="open-divination"><span>${escapeHTML(DANIEL_SCENARIOS[record.type]?.label || "通用问事")}</span><strong>${escapeHTML(record.question)}</strong><small>${record.cast.original.name} → ${record.cast.changed.name} · ${nowLabel(record.createdAt)}</small></button><button type="button" class="icon-button small" data-action="delete-divination" aria-label="删除问事记录"><span data-icon="trash"></span></button></article>`).join("") || '<div class="empty-state"><div><strong>第一条问题会留在这里</strong>以后可以回来对照实际结果。</div></div>'}</div></section>`;
}

function dailyView() {
  return `<div class="page-intro daily-intro"><div><h2>每日与问事</h2><p>一个看今天，一个解决眼前这件具体的事。</p></div></div>${dailyModeSwitch()}${dailyMode === "toolkit" ? danielToolkitView() : dailyHexagramView()}`;
}

function summaryView() {
  const entries = storage.get("summaries").filter((item) => item.type === summaryFilter).sort((a,b) => b.date.localeCompare(a.date));
  return `<div class="page-intro"><div><h2>进度总结</h2><p>记录发生过的进步，也为下一阶段留下线索。</p></div></div><div class="summary-tabs">${Object.entries(summaryLabels).map(([key,label]) => `<button class="filter-button ${summaryFilter === key ? "active" : ""}" data-summary-filter="${key}">${label}</button>`).join("")}</div><section class="summary-layout"><article class="card summary-form-card"><div class="card-head"><div><h2>${summaryLabels[summaryFilter]}</h2><p>不必完整，真实就好</p></div></div><form id="summary-form"><div class="field"><label for="summary-date">日期</label><input id="summary-date" name="date" type="date" value="${today()}" required /></div><div class="field" style="margin-top:15px"><label for="summary-content">总结内容</label><textarea id="summary-content" name="content" required placeholder="完成了什么？学到了什么？接下来要调整什么？"></textarea></div><div class="form-actions"><button class="primary-button">保存总结</button></div></form></article><article class="card summary-history"><div class="card-head"><div><h2>历史记录</h2><p>${entries.length} 条 ${summaryLabels[summaryFilter]}</p></div></div><div class="summary-history-list">${entries.map((entry) => `<div class="summary-entry" data-id="${entry.id}"><header><strong>${summaryLabels[entry.type]}</strong><time>${dateLabel(entry.date, {year:"numeric",month:"long",day:"numeric"})}</time></header><p>${escapeHTML(entry.content)}</p><button class="text-link" data-action="delete-summary">删除</button></div>`).join("") || '<div class="empty-state"><div><strong>暂无记录</strong>第一篇总结会成为未来回看的坐标。</div></div>'}</div></article></section>`;
}

const views = { dashboard: dashboardView, tasks: tasksView, cfa: cfaView, career: careerView, notes: notesView, daily: dailyView, summary: summaryView };
const pageMeta = { dashboard: ["D4NOS / TODAY", "今日总览"], tasks: ["PLANNING / CALENDAR", "日历与任务"], cfa: ["LEARNING / CFA", "CFA 学习"], career: ["CAREER / PIPELINE", "职业投递"], notes: ["THOUGHTS / MEMO", "备忘录"], daily: ["D4NOS / DANIEL", "每日与问事"], summary: ["REFLECTION / PROGRESS", "进度总结"] };

function route() {
  const name = location.hash.slice(1) || "dashboard";
  const current = views[name] ? name : "dashboard";
  const [eyebrow, title] = pageMeta[current];
  $("#page-eyebrow").textContent = eyebrow;
  $("#page-title").textContent = title;
  $$(".nav-item").forEach((item) => {
    const active = item.dataset.route === current;
    item.classList.toggle("active", active);
    active ? item.setAttribute("aria-current", "page") : item.removeAttribute("aria-current");
  });
  $$(".bottom-nav-item[data-route]").forEach((item) => {
    const active = item.dataset.route === current;
    item.classList.toggle("active", active);
    active ? item.setAttribute("aria-current", "page") : item.removeAttribute("aria-current");
  });
  const moreItem = $("[data-mobile-more]");
  moreItem.classList.toggle("active", ["notes", "daily", "summary"].includes(current));
  ["notes", "daily", "summary"].includes(current) ? moreItem.setAttribute("aria-current", "page") : moreItem.removeAttribute("aria-current");
  main.innerHTML = views[current]();
  hydrateIcons(main);
  document.body.classList.remove("nav-open");
  $("#mobile-menu").setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function field(name, label, type = "text", value = "", options = "") {
  if (type === "textarea") return `<div class="field ${options}"><label for="${name}">${label}</label><textarea id="${name}" name="${name}">${escapeHTML(value)}</textarea></div>`;
  return `<div class="field ${options}"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${escapeHTML(value)}" /></div>`;
}

function openModal(type, item = null) {
  lastFocus = document.activeElement;
  const content = $("#modal-content");
  const title = $("#modal-title");
  $("#modal-eyebrow").textContent = item ? "EDIT ENTRY" : "NEW ENTRY";
  if (type === "smart") {
    title.textContent = "智能速记";
    $("#modal-eyebrow").textContent = "SMART CAPTURE";
    content.innerHTML = `<form id="smart-form"><div class="smart-capture"><div class="field"><label for="smart-content">写下你想添加的内容</label><textarea id="smart-content" name="content" required placeholder="例如：明天完成 ECON 作业，高优先级"></textarea><small>也可以用：投递：Apple｜Product Intern｜上海｜已投递</small></div><div class="smart-detection" aria-live="polite"><span data-icon="spark"></span><div><small>将自动添加到</small><strong id="smart-destination">日历与任务</strong></div></div><div class="smart-examples"><span>识别范围</span><button type="button" data-smart-example="明天完成 ECON 作业，高优先级">任务</button><button type="button" data-smart-example="投递：Apple｜Product Intern｜上海｜已投递">投递</button><button type="button" data-smart-example="备忘：整理下学期选课想法">备忘</button><button type="button" data-smart-example="本周总结：按计划完成了三项重点">总结</button></div></div><div class="form-actions"><button type="button" class="secondary-button" data-close-modal>取消</button><button class="primary-button">识别并添加</button></div></form>`;
  } else if (type === "task") {
    title.textContent = "添加任务";
    content.innerHTML = `<form id="task-form"><div class="form-grid">${field("title","任务标题","text","","full")}${field("date","日期","date",today())}<div class="field"><label for="category">分类</label><select id="category" name="category">${Object.entries(categoryLabels).map(([key,label]) => `<option value="${key}">${label}</option>`).join("")}</select></div><div class="field"><label for="priority">优先级</label><select id="priority" name="priority"><option value="high">高</option><option value="medium" selected>中</option><option value="low">低</option></select></div>${field("note","备注","textarea","","full")}</div><div class="form-actions"><button type="button" class="secondary-button" data-close-modal>取消</button><button class="primary-button">保存任务</button></div></form>`;
  } else if (type === "note") {
    title.textContent = "新建备忘录";
    content.innerHTML = `<form id="note-form"><div class="form-grid">${field("title","标题","text","","full")}${field("content","内容","textarea","","full")}</div><div class="form-actions"><button type="button" class="secondary-button" data-close-modal>取消</button><button class="primary-button">保存备忘</button></div></form>`;
  } else {
    title.textContent = item ? "编辑投递" : "新增投递";
    content.innerHTML = `<form id="application-form" data-id="${item?.id || ""}"><div class="form-grid">${field("company","公司名","text",item?.company || "")}${field("role","岗位名称","text",item?.role || "")}${field("location","地点","text",item?.location || "")}${field("applicationDate","申请日期","date",item?.applicationDate || today())}${field("deadline","截止日期","date",item?.deadline || "")}<div class="field"><label for="status">状态</label><select id="status" name="status">${statusOptions(item?.status || "想投递")}</select></div>${field("contact","联系人","text",item?.contact || "")}${field("nextAction","下一步行动","text",item?.nextAction || "")}${field("notes","备注","textarea",item?.notes || "","full")}</div><div class="form-actions"><button type="button" class="secondary-button" data-close-modal>取消</button><button class="primary-button">保存投递</button></div></form>`;
  }
  modalLayer.hidden = false;
  document.body.classList.add("modal-open");
  hydrateIcons(modalLayer);
  setTimeout(() => $("input, select, textarea", content)?.focus(), 20);
}

function closeModal() {
  modalLayer.hidden = true;
  document.body.classList.remove("modal-open");
  lastFocus?.focus();
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  $("#toast-region").append(node);
  setTimeout(() => node.remove(), 2600);
}

function setNavigationOpen(open) {
  document.body.classList.toggle("nav-open", open);
  $("#mobile-menu").setAttribute("aria-expanded", String(open));
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function showInstallPrompt(mode = "browser") {
  if (isStandalone() || localStorage.getItem("d4nOS.installPromptDismissed") === "1") return;
  if (!window.matchMedia("(max-width: 780px)").matches) return;
  const prompt = $("#install-prompt");
  $("#install-action").textContent = mode === "native" ? "Install" : "How to add";
  prompt.hidden = false;
}

function dismissInstallPrompt(remember = true) {
  $("#install-prompt").hidden = true;
  if (remember) localStorage.setItem("d4nOS.installPromptDismissed", "1");
}

// Event delegation keeps dynamically rendered pages free of repeated listeners.
document.addEventListener("click", (event) => {
  const routeLink = event.target.closest("[data-route-link]");
  if (routeLink) location.hash = routeLink.dataset.routeLink;
  const opener = event.target.closest("[data-open]");
  if (opener) openModal(opener.dataset.open);
  const smartExample = event.target.closest("[data-smart-example]");
  if (smartExample) { const input = $("#smart-content"); input.value = smartExample.dataset.smartExample; input.dispatchEvent(new Event("input", { bubbles: true })); input.focus(); }
  if (event.target.closest("[data-close-modal]")) closeModal();
  const filter = event.target.closest("[data-task-filter]");
  if (filter) { taskFilter = filter.dataset.taskFilter; route(); }
  const summaryTab = event.target.closest("[data-summary-filter]");
  if (summaryTab) { summaryFilter = summaryTab.dataset.summaryFilter; route(); }
  const dailyTab = event.target.closest("[data-daily-mode]");
  if (dailyTab) { dailyMode = dailyTab.dataset.dailyMode; route(); }
  const action = event.target.closest("[data-action]");
  if (!action) return;
  const item = action.closest("[data-id]");
  const id = item?.dataset.id;
  if (action.dataset.action === "toggle-task") { const task = storage.get("tasks").find((entry) => entry.id === id); storage.update("tasks", id, { completed: !task.completed }); toast(task.completed ? "任务已恢复" : "任务已完成"); route(); }
  if (action.dataset.action === "toggle-cfa-topic") { const topicId = action.dataset.topicId; const progress = storage.get("cfaProgress"); const next = progress.includes(topicId) ? progress.filter((entry) => entry !== topicId) : [...progress, topicId]; storage.set("cfaProgress", next); toast(progress.includes(topicId) ? "已取消完成标记" : "学习进度已保存"); route(); }
  if (action.dataset.action === "delete-task") { storage.remove("tasks", id); toast("任务已删除"); route(); }
  if (action.dataset.action === "delete-note") { storage.remove("notes", id); toast("备忘录已删除"); route(); }
  if (action.dataset.action === "delete-application") { storage.remove("applications", id); toast("投递记录已删除"); route(); }
  if (action.dataset.action === "edit-application") openModal("application", storage.get("applications").find((entry) => entry.id === id));
  if (action.dataset.action === "delete-summary") { storage.remove("summaries", id); toast("总结已删除"); route(); }
  if (action.dataset.action === "clear-daily") { const cards = storage.get("dailyCards"); delete cards[today()]; storage.set("dailyCards", cards); toast("今日卦已清除"); route(); }
  if (action.dataset.action === "open-divination") { const record = storage.get("divinations").find((entry) => entry.id === id); toolkitActiveId = id; toolkitType = record?.type || "general"; dailyMode = "toolkit"; route(); }
  if (action.dataset.action === "delete-divination") { storage.remove("divinations", id); if (toolkitActiveId === id) toolkitActiveId = null; toast("问事记录已删除"); route(); }
});

document.addEventListener("change", (event) => {
  const action = event.target.closest('[data-action="status-application"]');
  if (action) { storage.update("applications", action.closest("[data-id]").dataset.id, { status: action.value }); toast(`状态已更新为 ${action.value}`); route(); }
  if (event.target.id === "toolkit-type") {
    toolkitType = event.target.value;
    const choices = $(".toolkit-choice-fields");
    choices.hidden = event.target.value !== "decision";
    const question = $("#toolkit-question");
    if (question) question.placeholder = DANIEL_SCENARIOS[event.target.value].prompt;
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "smart-content") {
    const destination = $("#smart-destination");
    if (destination) destination.textContent = smartLabels[detectSmartType(event.target.value)];
  }
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  if (form.id === "smart-form") {
    if (!data.content.trim()) return toast("请先写下要添加的内容");
    const parsed = parseSmartEntry(data.content.trim());
    const key = parsed.type === "application" ? "applications" : parsed.type === "summary" ? "summaries" : parsed.type === "note" ? "notes" : "tasks";
    storage.add(key, parsed.item);
    closeModal(); toast(`已识别为${smartLabels[parsed.type]}并添加`); location.hash = parsed.type === "application" ? "career" : parsed.type === "summary" ? "summary" : parsed.type === "note" ? "notes" : "tasks"; route();
  }
  if (form.id === "task-form") { if (!data.title.trim() || !data.date) return toast("请填写任务标题和日期"); storage.add("tasks", { id: uid(), ...data, title: data.title.trim(), completed: false, createdAt: new Date().toISOString() }); closeModal(); toast("任务已保存"); route(); }
  if (form.id === "note-form") { if (!data.title.trim() || !data.content.trim()) return toast("请填写标题和内容"); storage.add("notes", { id: uid(), title: data.title.trim(), content: data.content.trim(), createdAt: new Date().toISOString() }); closeModal(); toast("备忘录已保存"); route(); }
  if (form.id === "application-form") { if (!data.company.trim() || !data.role.trim()) return toast("请填写公司和岗位"); const item = { ...data, company: data.company.trim(), role: data.role.trim(), updatedAt: new Date().toISOString() }; form.dataset.id ? storage.update("applications", form.dataset.id, item) : storage.add("applications", { id: uid(), ...item, createdAt: new Date().toISOString() }); closeModal(); toast("投递记录已保存"); route(); }
  if (form.id === "summary-form") { if (!data.content.trim()) return toast("请写下总结内容"); storage.add("summaries", { id: uid(), type: summaryFilter, date: data.date, content: data.content.trim(), createdAt: new Date().toISOString() }); toast("总结已保存"); route(); }
  if (form.id === "daily-number-form") { const number = Number(data.number); if (!Number.isSafeInteger(number) || number < 1) return toast("请输入大于 0 的整数"); getDailyCard(number); toast("起卦完成，已生成本卦与变卦"); route(); }
  if (form.id === "daniel-toolkit-form") {
    const question = data.question.trim();
    const number = Number(data.number);
    if (!question) return toast("先把要问的事情写清楚");
    if (!Number.isSafeInteger(number) || number < 1) return toast("请输入大于 0 的整数");
    const cast = castNumberWithTime(number);
    const record = { id: uid(), type: data.type, question, optionA: data.optionA?.trim() || "", optionB: data.optionB?.trim() || "", cast, reading: buildDanielReading(cast, data.type, question, data), createdAt: new Date().toISOString() };
    storage.add("divinations", record);
    toolkitActiveId = record.id;
    toolkitType = data.type;
    dailyMode = "toolkit";
    toast("Daniel 已完成拆解");
    route();
  }
});

$("#quick-add").addEventListener("click", () => openModal("smart"));
$("#mobile-menu").addEventListener("click", () => setNavigationOpen(!document.body.classList.contains("nav-open")));
$("[data-mobile-more]").addEventListener("click", () => setNavigationOpen(!document.body.classList.contains("nav-open")));
$("#install-dismiss").addEventListener("click", () => dismissInstallPrompt());
$("#install-action").addEventListener("click", async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    dismissInstallPrompt();
    return;
  }
  toast("请在 Safari 分享菜单中选择“添加到主屏幕”");
  dismissInstallPrompt();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  showInstallPrompt("native");
});
window.addEventListener("appinstalled", () => dismissInstallPrompt());
window.addEventListener("hashchange", route);
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modalLayer.hidden) closeModal(); });

initializeStorage();
hydrateIcons();
$("#today-chip").textContent = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
route();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => console.warn("Service worker registration failed", error));
  });
}

const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
if (isiOS && !isStandalone()) setTimeout(() => showInstallPrompt("browser"), 2200);
