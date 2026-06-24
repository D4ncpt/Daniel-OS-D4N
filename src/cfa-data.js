// The study path follows Daniel's preferred prep order. Topic IDs stay stable so saved progress survives copy edits.
export const cfaModules = [
  {
    id: "quantitative-methods",
    title: "Quantitative Methods",
    shortTitle: "Quant",
    label: "数量方法",
    description: "先建立时间价值、概率、统计推断与回归的工具箱。",
    topics: [
      ["qm-tvm", "Time value of money on the CFA"],
      ["qm-statistics", "Statistics in financial markets"],
      ["qm-probability", "Probability Concepts"],
      ["qm-distributions", "Probability distributions in investments"],
      ["qm-sampling", "Sampling and Estimation"],
      ["qm-hypothesis", "Hypothesis Testing"],
      ["qm-regression", "Simple Linear Regression"]
    ]
  },
  {
    id: "economics",
    title: "Economics",
    label: "经济学",
    description: "从供需与市场结构，走到宏观周期、政策、贸易和汇率。",
    topics: [
      ["econ-supply-demand", "Supply and demand analysis on the CFA"],
      ["econ-market-structures", "Competition and market structures"],
      ["econ-growth", "GDP and economic growth on the CFA"],
      ["econ-cycles", "Understanding Business Cycles"],
      ["econ-policy", "Monetary and Fiscal Policy"],
      ["econ-trade", "International trade and capital flows"],
      ["econ-fx", "Currencies and foreign exchange rates"]
    ]
  },
  {
    id: "financial-statement-analysis",
    title: "Financial Statement Analysis",
    shortTitle: "FSA",
    label: "财务报表分析",
    description: "把三张报表、会计项目与分析方法连成完整判断框架。",
    topics: [
      ["fsa-introduction", "Financial Statement Analysis: An Introduction"],
      ["fsa-standards", "Financial statement reporting standards"],
      ["fsa-income", "Income statement essentials on the CFA"],
      ["fsa-balance", "Balance sheet basics on the CFA"],
      ["fsa-cash-flow", "Cash flow statement fundamentals"],
      ["fsa-techniques", "Ratios in financial statement analysis"],
      ["fsa-inventories", "Inventories"],
      ["fsa-long-lived-assets", "Long-Lived Assets"],
      ["fsa-income-taxes", "Income Taxes"],
      ["fsa-liabilities", "Non-Current Liabilities"],
      ["fsa-quality", "Financial Reporting Quality"]
    ]
  },
  {
    id: "corporate-issuers",
    title: "Corporate Finance/Issuers",
    shortTitle: "Issuers",
    label: "公司金融与发行人",
    description: "进入治理、营运资本、资本预算、资本结构与企业经营决策。",
    topics: [
      ["ci-organizations", "Organizational Forms and Ownership"],
      ["ci-stakeholders", "Investors and Other Stakeholders"],
      ["ci-governance", "Corporate Governance"],
      ["ci-working-capital", "Working Capital and Liquidity"],
      ["ci-capital-investments", "Capital budgeting on the CFA"],
      ["ci-capital-structure", "Capital Structure"],
      ["ci-business-models", "Business Models"]
    ]
  },
  {
    id: "equity-investments",
    title: "Equity Investments",
    label: "权益投资",
    description: "理解股票市场、行业公司分析与权益估值的核心方法。",
    topics: [
      ["equity-markets", "Market structure on the CFA"],
      ["equity-indexes", "Equity market indexes on the CFA"],
      ["equity-efficiency", "Market efficiency on the CFA"],
      ["equity-overview", "Equity securities"],
      ["equity-company-analysis", "Industry and Company Analysis"],
      ["equity-valuation", "Stock valuation methods on the CFA"]
    ]
  },
  {
    id: "fixed-income",
    title: "Fixed Income",
    label: "固定收益",
    description: "建立债券市场、债券估值、风险收益、久期与信用分析框架。",
    topics: [
      ["fi-features", "Fixed-Income Security Features"],
      ["fi-issuance", "Fixed income markets on the CFA"],
      ["fi-valuation", "Fixed income analysis and bond valuation"],
      ["fi-yield", "Fixed income risk and return on the CFA"],
      ["fi-duration", "Duration and Convexity"],
      ["fi-credit", "Credit analysis on the CFA"]
    ]
  },
  {
    id: "derivatives",
    title: "Derivatives",
    label: "衍生品",
    description: "掌握衍生品市场、远期、期权、套利复制与基本定价。",
    topics: [
      ["derivatives-markets", "Derivative markets basics"],
      ["derivatives-forwards", "Forward contracts on the CFA"],
      ["derivatives-options", "Options valuation on the CFA"],
      ["derivatives-arbitrage", "Arbitrage, Replication, and Cost of Carry"],
      ["derivatives-pricing", "Derivative pricing fundamentals"]
    ]
  },
  {
    id: "alternative-investments",
    title: "Alternative Investments",
    label: "另类投资",
    description: "认识私募、房地产、基础设施、自然资源与对冲基金。",
    topics: [
      ["ai-features", "Alternative investments on the CFA"],
      ["ai-private-capital", "Private Capital"],
      ["ai-real-estate", "Real Estate and Infrastructure"],
      ["ai-natural-resources", "Natural Resources"],
      ["ai-hedge-funds", "Hedge funds and private equity funds"]
    ]
  },
  {
    id: "portfolio-management",
    title: "Portfolio Management",
    label: "投资组合管理",
    description: "把风险收益、分散化、资产配置与投资者需求整合起来。",
    topics: [
      ["pm-overview", "Portfolio Management: An Overview"],
      ["pm-risk-return", "Portfolio Risk and Return"],
      ["pm-planning", "Basics of Portfolio Planning and Construction"],
      ["pm-behavioral", "The Behavioral Biases of Individuals"],
      ["pm-risk-management", "Risk management in investing on the CFA"]
    ]
  },
  {
    id: "ethics",
    title: "Ethical and Professional Standards",
    shortTitle: "Ethics",
    label: "道德与职业标准",
    description: "最后用职业操守、行为准则与 GIPS 统一所有分析和决策。",
    topics: [
      ["ethics-code", "Ethics in the investments industry"],
      ["ethics-standards", "Ethics and professional standards"],
      ["ethics-guidance", "CFA guidance standards"],
      ["ethics-application", "Application of the Standards"],
      ["ethics-gips", "Global investment performance standards"]
    ]
  }
].map((module) => ({
  ...module,
  topics: module.topics.map(([id, title]) => ({ id, title }))
}));

export const cfaTopicCount = cfaModules.reduce((total, module) => total + module.topics.length, 0);
