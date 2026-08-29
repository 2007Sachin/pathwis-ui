interface CareerRoadmapTemplate {
  id: string;
  career: string;
  aliases?: string[];
  foundations: string[];
  coreSkills: string[];
  appliedSkills: string[];
  portfolioProject: string;
}

export const CAREER_ROADMAP_TEMPLATES: CareerRoadmapTemplate[] = [
  {
    id: "product-manager",
    career: "Product Manager",
    aliases: ["product owner", "product management"],
    foundations: ["Product fundamentals", "Customer problems", "Market understanding"],
    coreSkills: ["Product discovery", "Roadmapping", "Prioritisation", "Product metrics"],
    appliedSkills: ["Product analytics", "UX collaboration", "Experimentation"],
    portfolioProject: "Create an end-to-end product case study for a validated customer problem.",
  },
  {
    id: "business-analyst",
    career: "Business Analyst",
    foundations: ["Business process fundamentals", "Problem framing", "Stakeholder context"],
    coreSkills: ["Requirements analysis", "Process mapping", "SQL", "Business case development"],
    appliedSkills: ["Data interpretation", "Solution evaluation", "Stakeholder facilitation"],
    portfolioProject: "Create a business improvement case study with requirements, process maps, and measurable outcomes.",
  },
  {
    id: "product-analyst",
    career: "Product Analyst",
    foundations: ["Product fundamentals", "Analytics foundations", "Customer behaviour"],
    coreSkills: ["Product metrics", "Advanced SQL", "Event tracking", "Data visualisation"],
    appliedSkills: ["Funnel analysis", "Experimentation", "Insight storytelling"],
    portfolioProject: "Analyse a sample digital product and present a metrics-led growth recommendation.",
  },
  {
    id: "data-analyst",
    career: "Data Analyst",
    foundations: ["Data literacy", "Spreadsheet analysis", "Statistics fundamentals"],
    coreSkills: ["SQL", "Data cleaning", "Data visualisation", "Dashboard design"],
    appliedSkills: ["Exploratory analysis", "Business metrics", "Insight storytelling"],
    portfolioProject: "Build an interactive analysis and dashboard that answers a real business question.",
  },
  {
    id: "data-scientist",
    career: "Data Scientist",
    foundations: ["Python for data", "Statistics", "Data preparation"],
    coreSkills: ["Machine learning", "Feature engineering", "Model evaluation", "SQL"],
    appliedSkills: ["Experiment design", "Predictive modelling", "Model communication"],
    portfolioProject: "Build, evaluate, and document a predictive model using a real-world dataset.",
  },
  {
    id: "software-engineer",
    career: "Software Engineer",
    aliases: ["developer", "software developer"],
    foundations: ["Programming fundamentals", "Data structures", "Git workflows"],
    coreSkills: ["Application architecture", "APIs", "Databases", "Testing"],
    appliedSkills: ["System design", "Debugging", "Production deployment"],
    portfolioProject: "Design, build, test, and deploy a production-ready full-stack application.",
  },
  {
    id: "project-manager",
    career: "Project Manager",
    aliases: ["program manager", "delivery manager"],
    foundations: ["Project lifecycle", "Scope definition", "Stakeholder mapping"],
    coreSkills: ["Project planning", "Risk management", "Agile delivery", "Budgeting"],
    appliedSkills: ["Team facilitation", "Delivery reporting", "Change management"],
    portfolioProject: "Create a complete delivery plan for a cross-functional project, including scope, risks, and governance.",
  },
  {
    id: "ux-designer",
    career: "UX Designer",
    aliases: ["product designer", "ui ux designer"],
    foundations: ["Human-centred design", "Design principles", "User research"],
    coreSkills: ["Interaction design", "Wireframing", "Prototyping", "Usability testing"],
    appliedSkills: ["Information architecture", "Design systems", "UX storytelling"],
    portfolioProject: "Research, prototype, and test a complete user experience case study.",
  },
  {
    id: "operations-manager",
    career: "Operations Manager",
    aliases: ["business operations", "operations analyst"],
    foundations: ["Operations fundamentals", "Process thinking", "Performance metrics"],
    coreSkills: ["Process improvement", "Resource planning", "Operations analytics", "Quality systems"],
    appliedSkills: ["Capacity planning", "Team leadership", "Continuous improvement"],
    portfolioProject: "Redesign an operating process and quantify its impact on cost, quality, and delivery.",
  },
  {
    id: "marketing-manager",
    career: "Marketing Manager",
    aliases: ["digital marketing manager", "growth marketer", "brand manager"],
    foundations: ["Marketing fundamentals", "Customer segmentation", "Brand positioning"],
    coreSkills: ["Campaign strategy", "Content planning", "Channel selection", "Marketing analytics"],
    appliedSkills: ["Growth experimentation", "Budget optimisation", "Performance storytelling"],
    portfolioProject: "Create an integrated go-to-market campaign with audience, channel, creative, and measurement plans.",
  },
];

export const GENERIC_ROADMAP_TEMPLATE: CareerRoadmapTemplate = {
  id: "custom-career",
  career: "Target Career",
  foundations: ["Industry fundamentals", "Role fundamentals", "Professional vocabulary"],
  coreSkills: ["Role-specific methods", "Common tools", "Problem solving", "Communication"],
  appliedSkills: ["Applied practice", "Cross-functional collaboration", "Outcome measurement"],
  portfolioProject: "Complete a realistic role-based project that demonstrates end-to-end capability.",
};

export type { CareerRoadmapTemplate };
