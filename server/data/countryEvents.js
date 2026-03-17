const countryEvents = [
  {
    key: "country-carbon-tax-1",
    title: "National Carbon Tax Policy",
    description: "Parliament is debating implementing a carbon tax on industrial emissions to incentivize green production.",
    options: [
      { label: "Implement a progressive carbon tax with revenue returned as green subsidies", type: "positive", waste: -3, resources: -4, cost: 3, sustainability: 6 },
      { label: "Set a modest flat carbon price with exemptions for small businesses", type: "neutral", waste: -1, resources: -2, cost: 1, sustainability: 3 },
      { label: "Reject the carbon tax to protect economic competitiveness", type: "negative", waste: 2, resources: 3, cost: -2, sustainability: -5 },
    ],
  },
  {
    key: "country-renewable-energy-1",
    title: "National Renewable Energy Target",
    description: "The energy ministry is setting targets for renewable energy adoption over the next decade.",
    options: [
      { label: "Set a 70% renewable target by 2035 with major grid investment", type: "positive", waste: -2, resources: -5, cost: 4, sustainability: 6 },
      { label: "Set a 40% target and subsidize solar panel installations", type: "neutral", waste: -1, resources: -3, cost: 2, sustainability: 3 },
      { label: "Maintain current energy mix and invest in cleaner fossil fuels", type: "negative", waste: 1, resources: 2, cost: 0, sustainability: -4 },
    ],
  },
  {
    key: "country-deforestation-1",
    title: "National Deforestation Policy",
    description: "Logging companies want to expand into protected forests. Environmental groups are pushing back.",
    options: [
      { label: "Expand protected areas and fund reforestation programs", type: "positive", waste: -3, resources: -4, cost: 3, sustainability: 6 },
      { label: "Allow limited logging with mandatory replanting requirements", type: "neutral", waste: -1, resources: -1, cost: 0, sustainability: 2 },
      { label: "Open protected forests to commercial logging for economic growth", type: "negative", waste: 3, resources: 4, cost: -3, sustainability: -6 },
    ],
  },
  {
    key: "country-plastic-regulation-1",
    title: "National Plastic Production Limits",
    description: "A bill proposes strict limits on new plastic production and mandatory recycled content in products.",
    options: [
      { label: "Pass the bill with 50% recycled content mandates by 2030", type: "positive", waste: -5, resources: -3, cost: 2, sustainability: 5 },
      { label: "Require 20% recycled content and voluntary industry targets", type: "neutral", waste: -2, resources: -1, cost: 1, sustainability: 2 },
      { label: "Let the plastics industry self-regulate", type: "negative", waste: 3, resources: 2, cost: -1, sustainability: -4 },
    ],
  },
  {
    key: "country-agriculture-1",
    title: "Sustainable Agriculture Transition",
    description: "The agriculture ministry is reviewing subsidies. Currently, most go to large-scale monoculture farms.",
    options: [
      { label: "Redirect subsidies to regenerative farming and organic producers", type: "positive", waste: -3, resources: -4, cost: 2, sustainability: 5 },
      { label: "Add new subsidies for sustainable practices alongside existing ones", type: "neutral", waste: -1, resources: -2, cost: 2, sustainability: 3 },
      { label: "Increase subsidies for industrial agriculture to boost food exports", type: "negative", waste: 3, resources: 4, cost: -2, sustainability: -5 },
    ],
  },
  {
    key: "country-ev-mandate-1",
    title: "Electric Vehicle Sales Mandate",
    description: "Transport accounts for 25% of national emissions. A law banning new petrol car sales is proposed.",
    options: [
      { label: "Ban new petrol car sales by 2030 with EV purchase incentives", type: "positive", waste: -2, resources: -4, cost: 3, sustainability: 6 },
      { label: "Set a 50% EV sales target by 2035", type: "neutral", waste: -1, resources: -2, cost: 1, sustainability: 3 },
      { label: "Leave vehicle choices to the market without mandates", type: "negative", waste: 1, resources: 2, cost: -1, sustainability: -4 },
    ],
  },
  {
    key: "country-circular-economy-1",
    title: "Circular Economy Framework",
    description: "Economists propose a national circular economy strategy to minimize waste and extend product lifecycles.",
    options: [
      { label: "Mandate right-to-repair and extended producer responsibility for all products", type: "positive", waste: -5, resources: -4, cost: 2, sustainability: 6 },
      { label: "Incentivize companies to adopt circular practices voluntarily", type: "neutral", waste: -2, resources: -2, cost: 1, sustainability: 3 },
      { label: "Focus on economic growth and let waste management catch up later", type: "negative", waste: 3, resources: 3, cost: -2, sustainability: -5 },
    ],
  },
  {
    key: "country-ocean-protection-1",
    title: "Marine Conservation Act",
    description: "Marine ecosystems are deteriorating due to overfishing and pollution. A conservation act is proposed.",
    options: [
      { label: "Establish 30% of territorial waters as marine protected areas", type: "positive", waste: -3, resources: -4, cost: 3, sustainability: 6 },
      { label: "Reduce fishing quotas by 20% and ban bottom trawling", type: "neutral", waste: -2, resources: -2, cost: 1, sustainability: 3 },
      { label: "Maintain current fishing regulations to protect livelihoods", type: "negative", waste: 2, resources: 3, cost: -1, sustainability: -4 },
    ],
  },
  {
    key: "country-green-bonds-1",
    title: "Sovereign Green Bond Issuance",
    description: "The treasury proposes issuing green bonds to fund national environmental infrastructure.",
    options: [
      { label: "Issue $10B in green bonds with strict use-of-proceeds tracking", type: "positive", waste: -2, resources: -3, cost: 3, sustainability: 5 },
      { label: "Issue $3B in green bonds as a pilot program", type: "neutral", waste: -1, resources: -1, cost: 1, sustainability: 2 },
      { label: "Issue standard bonds and allocate funds based on political priorities", type: "negative", waste: 1, resources: 2, cost: -1, sustainability: -3 },
    ],
  },
  {
    key: "country-trade-policy-1",
    title: "Green Trade Agreements",
    description: "Trade negotiations are underway. Should environmental standards be a requirement in new agreements?",
    options: [
      { label: "Require all trade partners to meet minimum environmental standards", type: "positive", waste: -2, resources: -3, cost: 2, sustainability: 5 },
      { label: "Include voluntary environmental chapters in trade agreements", type: "neutral", waste: -1, resources: -1, cost: 0, sustainability: 2 },
      { label: "Prioritize low tariffs and free trade regardless of environmental impact", type: "negative", waste: 2, resources: 3, cost: -2, sustainability: -4 },
    ],
  },
  {
    key: "country-nuclear-energy-1",
    title: "Nuclear Energy Expansion",
    description: "Nuclear provides clean baseline energy but is expensive and controversial. New reactors are proposed.",
    options: [
      { label: "Invest in small modular reactors alongside renewable expansion", type: "positive", waste: 1, resources: -5, cost: 4, sustainability: 5 },
      { label: "Extend existing nuclear plant lifespans while phasing in renewables", type: "neutral", waste: 0, resources: -2, cost: 1, sustainability: 3 },
      { label: "Shut down nuclear plants and rely on natural gas as a bridge fuel", type: "negative", waste: 2, resources: 3, cost: 0, sustainability: -5 },
    ],
  },
  {
    key: "country-digital-infrastructure-1",
    title: "Green Data Center Standards",
    description: "The tech sector's energy consumption is growing exponentially. New data center regulations are debated.",
    options: [
      { label: "Mandate 100% renewable energy for all new data centers", type: "positive", waste: -1, resources: -4, cost: 2, sustainability: 5 },
      { label: "Set energy efficiency standards and encourage renewable power contracts", type: "neutral", waste: 0, resources: -2, cost: 1, sustainability: 2 },
      { label: "Attract data center investment by offering cheap energy with no restrictions", type: "negative", waste: 1, resources: 4, cost: -2, sustainability: -4 },
    ],
  },
  {
    key: "country-mining-policy-1",
    title: "Critical Mineral Mining Regulations",
    description: "Demand for lithium and cobalt is surging for EV batteries. New mines are being proposed on sensitive land.",
    options: [
      { label: "Allow mining with strict environmental assessments and community consent", type: "positive", waste: -1, resources: -2, cost: 2, sustainability: 4 },
      { label: "Permit mining with standard environmental regulations", type: "neutral", waste: 0, resources: -1, cost: 0, sustainability: 1 },
      { label: "Fast-track mining permits to capture global demand", type: "negative", waste: 3, resources: 4, cost: -3, sustainability: -5 },
    ],
  },
  {
    key: "country-education-budget-1",
    title: "National Environmental Education Fund",
    description: "The education ministry proposes a dedicated budget for sustainability education across all schools.",
    options: [
      { label: "Allocate 2% of the education budget to environmental literacy programs", type: "positive", waste: -1, resources: -1, cost: 2, sustainability: 4 },
      { label: "Create optional online sustainability courses for students", type: "neutral", waste: 0, resources: 0, cost: 1, sustainability: 2 },
      { label: "Redirect funds to STEM and vocational training exclusively", type: "negative", waste: 0, resources: 0, cost: -1, sustainability: -2 },
    ],
  },
  {
    key: "country-waste-export-1",
    title: "Waste Export Ban",
    description: "The country currently exports large quantities of waste to developing nations. An export ban is proposed.",
    options: [
      { label: "Ban waste exports and invest in domestic recycling infrastructure", type: "positive", waste: -4, resources: -3, cost: 3, sustainability: 6 },
      { label: "Phase out waste exports over 5 years", type: "neutral", waste: -2, resources: -1, cost: 1, sustainability: 3 },
      { label: "Continue exporting waste to manage domestic costs", type: "negative", waste: 3, resources: 1, cost: -2, sustainability: -5 },
    ],
  },
  {
    key: "country-climate-fund-1",
    title: "International Climate Fund Contribution",
    description: "Global climate talks request increased contributions from developed nations to help vulnerable countries adapt.",
    options: [
      { label: "Double our contribution and champion a loss-and-damage fund", type: "positive", waste: -1, resources: -2, cost: 4, sustainability: 6 },
      { label: "Increase contribution by 25% and earmark funds for specific projects", type: "neutral", waste: 0, resources: -1, cost: 2, sustainability: 3 },
      { label: "Freeze contributions and focus on domestic priorities", type: "negative", waste: 1, resources: 1, cost: -2, sustainability: -4 },
    ],
  },
  {
    key: "country-food-security-1",
    title: "National Food Security Strategy",
    description: "Climate change is threatening crop yields. A long-term food security plan is needed.",
    options: [
      { label: "Invest in climate-resilient crops, seed banks, and local food systems", type: "positive", waste: -2, resources: -3, cost: 3, sustainability: 5 },
      { label: "Diversify food imports and stockpile strategic reserves", type: "neutral", waste: -1, resources: -1, cost: 2, sustainability: 2 },
      { label: "Rely on global markets and current agricultural practices", type: "negative", waste: 1, resources: 2, cost: -1, sustainability: -4 },
    ],
  },
  {
    key: "country-housing-policy-1",
    title: "Sustainable Housing Act",
    description: "The housing crisis needs solutions. Should new housing developments prioritize sustainability?",
    options: [
      { label: "Mandate net-zero carbon standards for all new housing developments", type: "positive", waste: -2, resources: -4, cost: 3, sustainability: 5 },
      { label: "Offer grants for energy-efficient retrofits of existing housing", type: "neutral", waste: -1, resources: -2, cost: 2, sustainability: 3 },
      { label: "Build housing as cheaply as possible to maximize supply", type: "negative", waste: 2, resources: 3, cost: -2, sustainability: -4 },
    ],
  },
  {
    key: "country-pandemic-recovery-1",
    title: "Post-Pandemic Green Recovery",
    description: "With recovery funds being allocated, there's an opportunity to build back greener — or focus purely on speed.",
    options: [
      { label: "Allocate 40% of recovery spending to green infrastructure and jobs", type: "positive", waste: -3, resources: -4, cost: 3, sustainability: 6 },
      { label: "Include green conditions for companies receiving recovery loans", type: "neutral", waste: -1, resources: -2, cost: 1, sustainability: 3 },
      { label: "Prioritize fastest economic recovery regardless of environmental impact", type: "negative", waste: 3, resources: 4, cost: -3, sustainability: -5 },
    ],
  },
  {
    key: "country-rail-network-1",
    title: "National High-Speed Rail Network",
    description: "Aviation between major cities generates significant emissions. A high-speed rail alternative is proposed.",
    options: [
      { label: "Fund a 10-year national high-speed rail construction plan", type: "positive", waste: -2, resources: -4, cost: 4, sustainability: 6 },
      { label: "Build high-speed rail between the two largest cities as a pilot", type: "neutral", waste: -1, resources: -2, cost: 2, sustainability: 3 },
      { label: "Expand airports instead to meet growing travel demand", type: "negative", waste: 2, resources: 4, cost: 1, sustainability: -5 },
    ],
  },
];

module.exports = countryEvents;
