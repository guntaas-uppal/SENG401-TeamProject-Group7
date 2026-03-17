const cityEvents = [
  {
    key: "city-public-transit-1",
    title: "Public Transit Expansion",
    description: "The city council is debating whether to invest in expanding the public transit system to reduce car dependency.",
    options: [
      { label: "Fund a new light rail line connecting suburbs to downtown", type: "positive", waste: -2, resources: -3, cost: 3, sustainability: 5 },
      { label: "Add a few more bus routes to underserved areas", type: "neutral", waste: -1, resources: -1, cost: 1, sustainability: 2 },
      { label: "Postpone transit investment and widen highways instead", type: "negative", waste: 2, resources: 3, cost: 2, sustainability: -4 },
    ],
  },
  {
    key: "city-recycling-program-1",
    title: "Citywide Recycling Overhaul",
    description: "Current recycling rates are low. A proposal has been submitted to redesign the municipal recycling program.",
    options: [
      { label: "Implement curbside sorting with educational outreach campaign", type: "positive", waste: -5, resources: -2, cost: 2, sustainability: 5 },
      { label: "Increase recycling bin availability in public areas", type: "neutral", waste: -2, resources: -1, cost: 1, sustainability: 2 },
      { label: "Maintain current system and focus budget elsewhere", type: "negative", waste: 2, resources: 1, cost: -1, sustainability: -3 },
    ],
  },
  {
    key: "city-green-buildings-1",
    title: "Green Building Standards",
    description: "New construction permits are being reviewed. Should the city mandate green building standards?",
    options: [
      { label: "Require all new buildings to meet LEED certification standards", type: "positive", waste: -2, resources: -4, cost: 3, sustainability: 5 },
      { label: "Offer tax incentives for developers who voluntarily go green", type: "neutral", waste: -1, resources: -2, cost: 1, sustainability: 2 },
      { label: "Keep current building codes to avoid discouraging construction", type: "negative", waste: 1, resources: 2, cost: -1, sustainability: -3 },
    ],
  },
  {
    key: "city-food-waste-1",
    title: "Food Waste Reduction Initiative",
    description: "Restaurants and grocery stores in the city generate massive amounts of food waste each week.",
    options: [
      { label: "Launch a composting program and mandate food donation for unsold goods", type: "positive", waste: -5, resources: -2, cost: 1, sustainability: 4 },
      { label: "Partner with food banks for voluntary donations", type: "neutral", waste: -2, resources: -1, cost: 0, sustainability: 2 },
      { label: "Leave waste management to individual businesses", type: "negative", waste: 3, resources: 1, cost: -1, sustainability: -3 },
    ],
  },
  {
    key: "city-water-management-1",
    title: "Urban Water Conservation",
    description: "Water usage has spiked during summer months, straining the city's supply.",
    options: [
      { label: "Install smart water meters and implement tiered pricing", type: "positive", waste: -1, resources: -5, cost: 2, sustainability: 5 },
      { label: "Run a public awareness campaign about water conservation", type: "neutral", waste: 0, resources: -2, cost: 1, sustainability: 2 },
      { label: "Increase water imports from neighboring regions", type: "negative", waste: 1, resources: 3, cost: 3, sustainability: -4 },
    ],
  },
  {
    key: "city-solar-farms-1",
    title: "Community Solar Farm Proposal",
    description: "A developer has proposed building a community solar farm on vacant city land.",
    options: [
      { label: "Approve the project and co-invest with public funds", type: "positive", waste: -1, resources: -4, cost: 3, sustainability: 5 },
      { label: "Approve but let the developer fund it privately", type: "neutral", waste: 0, resources: -2, cost: 0, sustainability: 3 },
      { label: "Reject the proposal and sell the land for commercial development", type: "negative", waste: 2, resources: 2, cost: -2, sustainability: -4 },
    ],
  },
  {
    key: "city-bike-lanes-1",
    title: "Protected Bike Lane Network",
    description: "Cycling advocates are pushing for protected bike lanes on major streets to reduce traffic and emissions.",
    options: [
      { label: "Build a connected network of protected lanes across the city", type: "positive", waste: -1, resources: -3, cost: 2, sustainability: 4 },
      { label: "Add painted bike lanes on a few key corridors", type: "neutral", waste: 0, resources: -1, cost: 1, sustainability: 1 },
      { label: "Prioritize car lanes and parking instead", type: "negative", waste: 1, resources: 2, cost: 0, sustainability: -3 },
    ],
  },
  {
    key: "city-urban-farming-1",
    title: "Urban Agriculture Program",
    description: "Vacant lots could be converted into community gardens and urban farms.",
    options: [
      { label: "Fund a city-managed urban farming program with free plots for residents", type: "positive", waste: -3, resources: -3, cost: 2, sustainability: 4 },
      { label: "Allow community groups to use some vacant lots for gardens", type: "neutral", waste: -1, resources: -1, cost: 0, sustainability: 2 },
      { label: "Sell all vacant lots to developers for housing", type: "negative", waste: 1, resources: 2, cost: -2, sustainability: -3 },
    ],
  },
  {
    key: "city-electric-fleet-1",
    title: "Municipal Fleet Electrification",
    description: "The city's fleet of buses and service vehicles is aging and due for replacement.",
    options: [
      { label: "Replace the entire fleet with electric vehicles over 3 years", type: "positive", waste: -2, resources: -4, cost: 4, sustainability: 5 },
      { label: "Replace half the fleet with hybrids", type: "neutral", waste: -1, resources: -2, cost: 2, sustainability: 2 },
      { label: "Buy the cheapest conventional vehicles available", type: "negative", waste: 2, resources: 3, cost: -1, sustainability: -4 },
    ],
  },
  {
    key: "city-plastic-ban-1",
    title: "Single-Use Plastic Ban",
    description: "Environmental groups are lobbying for a ban on single-use plastics in restaurants and retail stores.",
    options: [
      { label: "Implement a full ban with subsidies for businesses to switch to alternatives", type: "positive", waste: -5, resources: -1, cost: 2, sustainability: 5 },
      { label: "Ban plastic bags only but allow other single-use plastics", type: "neutral", waste: -2, resources: 0, cost: 1, sustainability: 2 },
      { label: "Reject the ban to avoid burdening businesses", type: "negative", waste: 3, resources: 1, cost: -1, sustainability: -3 },
    ],
  },
  {
    key: "city-stormwater-1",
    title: "Stormwater Management Upgrade",
    description: "Heavy rains are causing flooding in low-lying neighborhoods. The drainage system needs attention.",
    options: [
      { label: "Install green infrastructure: rain gardens, permeable pavements, and bioswales", type: "positive", waste: -2, resources: -3, cost: 3, sustainability: 4 },
      { label: "Upgrade existing storm drains and pipes", type: "neutral", waste: -1, resources: -1, cost: 2, sustainability: 1 },
      { label: "Defer maintenance and deal with floods reactively", type: "negative", waste: 2, resources: 2, cost: 1, sustainability: -4 },
    ],
  },
  {
    key: "city-air-quality-1",
    title: "Air Quality Monitoring Initiative",
    description: "Residents near industrial zones have complained about poor air quality and respiratory issues.",
    options: [
      { label: "Deploy a sensor network and enforce stricter emission limits on factories", type: "positive", waste: -2, resources: -2, cost: 2, sustainability: 5 },
      { label: "Set up a few monitoring stations and publish data publicly", type: "neutral", waste: -1, resources: -1, cost: 1, sustainability: 2 },
      { label: "Advise residents to stay indoors on bad air days", type: "negative", waste: 1, resources: 1, cost: 0, sustainability: -3 },
    ],
  },
  {
    key: "city-school-programs-1",
    title: "Sustainability Education in Schools",
    description: "The school board is considering adding sustainability modules to the curriculum.",
    options: [
      { label: "Fund a comprehensive K-12 sustainability curriculum with hands-on projects", type: "positive", waste: -1, resources: -1, cost: 2, sustainability: 4 },
      { label: "Create optional after-school environment clubs", type: "neutral", waste: 0, resources: 0, cost: 1, sustainability: 2 },
      { label: "Focus educational funds on STEM and traditional subjects only", type: "negative", waste: 0, resources: 0, cost: -1, sustainability: -2 },
    ],
  },
  {
    key: "city-ev-charging-1",
    title: "Electric Vehicle Charging Network",
    description: "Electric car adoption is growing but public charging stations are scarce.",
    options: [
      { label: "Install a city-funded network of fast chargers across all districts", type: "positive", waste: -1, resources: -3, cost: 3, sustainability: 4 },
      { label: "Partner with private companies to co-fund charging stations", type: "neutral", waste: 0, resources: -1, cost: 1, sustainability: 2 },
      { label: "Let the private market handle EV charging on its own", type: "negative", waste: 0, resources: 1, cost: -1, sustainability: -2 },
    ],
  },
  {
    key: "city-heat-island-1",
    title: "Urban Heat Island Mitigation",
    description: "Summer temperatures in the city center are 5°C higher than surrounding areas due to concrete and asphalt.",
    options: [
      { label: "Plant 10,000 trees and mandate cool roofs on commercial buildings", type: "positive", waste: -1, resources: -3, cost: 3, sustainability: 5 },
      { label: "Paint main roads with reflective coating", type: "neutral", waste: 0, resources: -1, cost: 1, sustainability: 2 },
      { label: "Install more air conditioners in public buildings", type: "negative", waste: 1, resources: 3, cost: 2, sustainability: -3 },
    ],
  },
  {
    key: "city-waste-to-energy-1",
    title: "Waste-to-Energy Plant",
    description: "A company proposes building a waste-to-energy incineration plant to process the city's non-recyclable waste.",
    options: [
      { label: "Approve with strict emission controls and prioritize waste reduction first", type: "positive", waste: -4, resources: -2, cost: 2, sustainability: 3 },
      { label: "Approve the plant as proposed", type: "neutral", waste: -3, resources: 0, cost: 1, sustainability: 1 },
      { label: "Reject the plant and continue landfilling", type: "negative", waste: 3, resources: 1, cost: 0, sustainability: -4 },
    ],
  },
  {
    key: "city-noise-pollution-1",
    title: "Noise Pollution Regulations",
    description: "Downtown residents are petitioning for noise limits during construction and nightlife hours.",
    options: [
      { label: "Implement comprehensive noise ordinance with monitoring and fines", type: "positive", waste: 0, resources: -1, cost: 1, sustainability: 3 },
      { label: "Set voluntary guidelines for businesses and construction firms", type: "neutral", waste: 0, resources: 0, cost: 0, sustainability: 1 },
      { label: "Dismiss the petition to avoid limiting economic activity", type: "negative", waste: 0, resources: 1, cost: -1, sustainability: -2 },
    ],
  },
  {
    key: "city-local-procurement-1",
    title: "Local Procurement Policy",
    description: "The city currently buys supplies from the cheapest global vendors. Should it switch to local?",
    options: [
      { label: "Mandate 60% local procurement for all city purchases", type: "positive", waste: -2, resources: -2, cost: 2, sustainability: 4 },
      { label: "Set a 25% local procurement target", type: "neutral", waste: -1, resources: -1, cost: 1, sustainability: 2 },
      { label: "Continue lowest-bidder procurement policy", type: "negative", waste: 1, resources: 2, cost: -2, sustainability: -3 },
    ],
  },
  {
    key: "city-park-revitalization-1",
    title: "Abandoned Park Revitalization",
    description: "A neglected 20-acre park could be revitalized. There are competing proposals for the land.",
    options: [
      { label: "Transform it into an eco-park with native plants, wetlands, and walking trails", type: "positive", waste: -2, resources: -3, cost: 2, sustainability: 5 },
      { label: "Renovate it as a standard recreational park", type: "neutral", waste: -1, resources: -1, cost: 1, sustainability: 2 },
      { label: "Sell the land to a developer for a shopping center", type: "negative", waste: 2, resources: 3, cost: -3, sustainability: -5 },
    ],
  },
  {
    key: "city-traffic-management-1",
    title: "Smart Traffic Management",
    description: "Rush hour congestion is worsening, increasing fuel consumption and emissions.",
    options: [
      { label: "Deploy AI traffic management and congestion pricing in the downtown core", type: "positive", waste: -2, resources: -3, cost: 2, sustainability: 4 },
      { label: "Optimize traffic light timing on major corridors", type: "neutral", waste: -1, resources: -1, cost: 1, sustainability: 1 },
      { label: "Build more parking garages downtown", type: "negative", waste: 1, resources: 3, cost: 2, sustainability: -3 },
    ],
  },
];

module.exports = cityEvents;
