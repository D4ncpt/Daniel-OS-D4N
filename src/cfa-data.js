// The study path is intentionally ordered. Topic IDs stay stable so saved progress survives copy edits.
export const cfaModules = [
  {
    id: "ethics",
    title: "CFA Section 1: Ethics and Professional Standards",
    shortTitle: "Ethics",
    label: "职业伦理与标准",
    description: "从投资行业信任、职业准则、Standards I-VII 到 GIPS，先把行为边界立住。",
    topics: [
      ["ethics-trust", "Ethics in the investments industry"],
      ["ethics-code", "Ethics and professional standards"],
      ["ethics-guidance", "CFA guidance standards"],
      ["ethics-gips", "Global investment performance standards"],
      ["ethics-quiz", "Chapter Quiz"]
    ]
  },
  {
    id: "quantitative-methods",
    title: "CFA Section 2: Quantitative Methods",
    shortTitle: "Quant",
    label: "数量方法",
    description: "按课程顺序建立 TVM、DCF、统计、概率、抽样和技术分析工具箱。",
    topics: [
      ["qm-tvm", "Time value of money on the CFA"],
      ["qm-dcf", "Discounted cash flow and investments"],
      ["qm-statistics", "Statistics in financial markets"],
      ["qm-distributions", "Probability distributions in investments"],
      ["qm-sampling", "Sampling and estimation"],
      ["qm-technical-analysis", "Technical analysis"],
      ["qm-key-topics", "Key topics in quantitative methods"],
      ["qm-quiz", "Chapter Quiz"]
    ]
  },
  {
    id: "economics",
    title: "CFA Section 3: Economics",
    label: "经济学",
    description: "从供需、市场结构、GDP 增长、国际贸易到汇率，建立宏观和微观的考试骨架。",
    topics: [
      ["econ-supply-demand", "Supply and demand analysis on the CFA"],
      ["econ-market-structures", "Competition and market structures"],
      ["econ-growth", "GDP and economic growth on the CFA"],
      ["econ-trade", "International trade and capital flows"],
      ["econ-fx", "Currencies and foreign exchange rates"],
      ["econ-key-topics", "Key topics: Economics"],
      ["econ-quiz", "Chapter Quiz"]
    ]
  },
  {
    id: "financial-statement-analysis",
    title: "CFA Section 4: Financial Statement Analysis",
    shortTitle: "FSA",
    label: "财务报表分析",
    description: "围绕报表准则、三张表、比率和重点题型，把 FSA 变成可复盘的框架。",
    topics: [
      ["fsa-standards", "Financial statement reporting standards"],
      ["fsa-income", "Income statement essentials on the CFA"],
      ["fsa-balance", "Balance sheet basics on the CFA"],
      ["fsa-cash-flow", "Cash flow statement fundamentals"],
      ["fsa-ratios", "Ratios in financial statement analysis"],
      ["fsa-key-topics", "Key topics: Financial statement analysis"],
      ["fsa-quiz", "Chapter Quiz"]
    ]
  },
  {
    id: "corporate-issuers",
    title: "CFA Section 5: Corporate Finance/Issuers",
    shortTitle: "Issuers",
    label: "公司金融与发行人",
    description: "集中处理资本预算、WACC、杠杆、风险管理和公司金融题型。",
    topics: [
      ["ci-capital-investments", "Capital budgeting on the CFA"],
      ["ci-wacc", "Weighted average cost of capital (WACC)"],
      ["ci-leverage", "Leverage and risk management on the CFA"],
      ["ci-key-topics", "Key topics: Corporate finance problems"],
      ["ci-quiz", "Chapter Quiz"]
    ]
  },
  {
    id: "equity-investments",
    title: "CFA Section 6: Equity Investments",
    label: "权益投资",
    description: "从市场结构、指数、有效市场、权益证券到股票估值，形成 equity 的核心题感。",
    topics: [
      ["equity-markets", "Market structure on the CFA"],
      ["equity-indexes", "Equity market indexes on the CFA"],
      ["equity-efficiency", "Market efficiency on the CFA"],
      ["equity-overview", "Equity securities"],
      ["equity-valuation", "Stock valuation methods on the CFA"],
      ["equity-key-topics", "Key topic: Equity markets"],
      ["equity-quiz", "Chapter Quiz"]
    ]
  },
  {
    id: "fixed-income",
    title: "CFA Section 7: Fixed Income",
    label: "固定收益",
    description: "按市场、估值、风险收益、信用分析和重点题型整理债券部分。",
    topics: [
      ["fi-issuance", "Fixed income markets on the CFA"],
      ["fi-valuation", "Fixed income analysis and bond valuation"],
      ["fi-yield", "Fixed income risk and return on the CFA"],
      ["fi-credit", "Credit analysis on the CFA"],
      ["fi-key-topics", "Key topics: Fixed income"],
      ["fi-quiz", "Chapter Quiz"]
    ]
  },
  {
    id: "derivatives",
    title: "CFA Section 8: Derivatives",
    label: "衍生品",
    description: "从衍生品市场基础、定价、期权、远期合约到重点题型，先抓考点再做题。",
    topics: [
      ["derivatives-markets", "Derivative markets basics"],
      ["derivatives-pricing", "Derivative pricing fundamentals"],
      ["derivatives-options", "Options valuation on the CFA"],
      ["derivatives-forwards", "Forward contracts on the CFA"],
      ["derivatives-key-topics", "Key topics: Derivatives"],
      ["derivatives-quiz", "Chapter Quiz"]
    ]
  },
  {
    id: "alternative-investments",
    title: "CFA Section 9: Alternative Investments",
    label: "另类投资",
    description: "围绕对冲基金、私募、组合用途、费用和重点题型快速建立另类投资地图。",
    topics: [
      ["ai-hedge-funds", "Hedge funds and private equity funds"],
      ["ai-features", "Alternative investments on the CFA"],
      ["ai-portfolio", "Alternative investments in a portfolio"],
      ["ai-fees", "Fees on alternative investments"],
      ["ai-key-topics", "Key topics: Alternative investments"],
      ["ai-quiz", "Chapter Quiz"]
    ]
  },
  {
    id: "portfolio-management",
    title: "CFA Section 10: Portfolio Management",
    label: "投资组合管理",
    description: "把绩效指标、Beta/CAPM、风险管理、FinTech 和组合管理重点题串起来。",
    topics: [
      ["pm-performance", "Investment performance metrics"],
      ["pm-risk-return", "Understanding beta and CAPM on the CFA"],
      ["pm-risk-management", "Risk management in investing on the CFA"],
      ["pm-fintech", "Fintech on the CFA exam"],
      ["pm-key-topics", "Key topics: Portfolio management"],
      ["pm-quiz", "Chapter Quiz"]
    ]
  }
].map((module) => ({
  ...module,
  topics: module.topics.map(([id, title]) => ({ id, title }))
}));

export const cfaTopicCount = cfaModules.reduce((total, module) => total + module.topics.length, 0);
