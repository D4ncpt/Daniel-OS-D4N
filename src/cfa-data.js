// The study path is intentionally ordered. Topic IDs stay stable so saved progress survives copy edits.
export const cfaModules = [
  {
    id: "quantitative-methods",
    title: "Quantitative Methods",
    label: "数量方法",
    description: "先建立时间价值、概率与统计推断的工具箱。",
    topics: [
      ["qm-tvm", "Time Value of Money"],
      ["qm-statistics", "Statistical Concepts and Market Returns"],
      ["qm-probability", "Probability Concepts"],
      ["qm-distributions", "Common Probability Distributions"],
      ["qm-sampling", "Sampling and Estimation"],
      ["qm-hypothesis", "Hypothesis Testing"],
      ["qm-regression", "Simple Linear Regression"]
    ]
  },
  {
    id: "economics",
    title: "Economics",
    label: "经济学",
    description: "从供需与市场结构，走到宏观政策、贸易和汇率。",
    topics: [
      ["econ-supply-demand", "Market Forces of Supply and Demand"],
      ["econ-market-structures", "The Firm and Market Structures"],
      ["econ-growth", "Aggregate Output, Prices, and Economic Growth"],
      ["econ-cycles", "Understanding Business Cycles"],
      ["econ-policy", "Monetary and Fiscal Policy"],
      ["econ-trade", "International Trade and Capital Flows"],
      ["econ-fx", "Currency Exchange Rates"]
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
      ["fsa-standards", "Financial Reporting Standards"],
      ["fsa-income", "Understanding Income Statements"],
      ["fsa-balance", "Understanding Balance Sheets"],
      ["fsa-cash-flow", "Understanding Cash Flow Statements"],
      ["fsa-techniques", "Financial Analysis Techniques"],
      ["fsa-inventories", "Inventories"],
      ["fsa-long-lived-assets", "Long-Lived Assets"],
      ["fsa-income-taxes", "Income Taxes"],
      ["fsa-liabilities", "Non-Current Liabilities"],
      ["fsa-quality", "Financial Reporting Quality"]
    ]
  },
  {
    id: "corporate-issuers",
    title: "Corporate Finance / Issuers",
    label: "公司金融与发行人",
    description: "最后进入治理、资本预算、资本结构与企业经营决策。",
    topics: [
      ["ci-organizations", "Organizational Forms and Ownership"],
      ["ci-stakeholders", "Investors and Other Stakeholders"],
      ["ci-governance", "Corporate Governance"],
      ["ci-working-capital", "Working Capital and Liquidity"],
      ["ci-capital-investments", "Capital Investments"],
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
      ["equity-markets", "Market Organization and Structure"],
      ["equity-indexes", "Security Market Indexes"],
      ["equity-efficiency", "Market Efficiency"],
      ["equity-overview", "Overview of Equity Securities"],
      ["equity-company-analysis", "Industry and Company Analysis"],
      ["equity-valuation", "Equity Valuation: Concepts and Basic Tools"]
    ]
  },
  {
    id: "fixed-income",
    title: "Fixed Income",
    label: "固定收益",
    description: "建立债券定价、收益率、久期与信用风险的分析框架。",
    topics: [
      ["fi-features", "Fixed-Income Security Features"],
      ["fi-issuance", "Fixed-Income Markets and Issuance"],
      ["fi-valuation", "Fixed-Income Valuation"],
      ["fi-yield", "Understanding Fixed-Income Risk and Return"],
      ["fi-duration", "Duration and Convexity"],
      ["fi-credit", "Fundamentals of Credit Analysis"]
    ]
  },
  {
    id: "derivatives",
    title: "Derivatives",
    label: "衍生品",
    description: "掌握远期、期货、互换与期权的基本定价和风险用途。",
    topics: [
      ["derivatives-markets", "Derivative Instrument and Market Features"],
      ["derivatives-forwards", "Forward Commitments"],
      ["derivatives-options", "Contingent Claims"],
      ["derivatives-arbitrage", "Arbitrage, Replication, and Cost of Carry"],
      ["derivatives-pricing", "Pricing and Valuation of Derivatives"]
    ]
  },
  {
    id: "alternative-investments",
    title: "Alternative Investments",
    label: "另类投资",
    description: "认识私募、房地产、基础设施、自然资源与对冲基金。",
    topics: [
      ["ai-features", "Alternative Investment Features and Methods"],
      ["ai-private-capital", "Private Capital"],
      ["ai-real-estate", "Real Estate and Infrastructure"],
      ["ai-natural-resources", "Natural Resources"],
      ["ai-hedge-funds", "Hedge Funds"]
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
      ["pm-risk-management", "Introduction to Risk Management"]
    ]
  },
  {
    id: "ethics",
    title: "Ethical and Professional Standards",
    shortTitle: "Ethics",
    label: "道德与职业标准",
    description: "最后用职业操守、行为准则与 GIPS 统一所有分析和决策。",
    topics: [
      ["ethics-code", "Ethics and Trust in the Investment Profession"],
      ["ethics-standards", "Code of Ethics and Standards of Professional Conduct"],
      ["ethics-guidance", "Guidance for Standards I–VII"],
      ["ethics-application", "Application of the Standards"],
      ["ethics-gips", "Introduction to the Global Investment Performance Standards"]
    ]
  }
].map((module) => ({
  ...module,
  topics: module.topics.map(([id, title]) => ({ id, title }))
}));

export const cfaTopicCount = cfaModules.reduce((total, module) => total + module.topics.length, 0);
