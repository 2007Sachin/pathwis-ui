import {
  CAREER_ROADMAP_TEMPLATES,
  GENERIC_ROADMAP_TEMPLATE,
  type CareerRoadmapTemplate,
} from "./roadmap-templates";
import type {
  CareerRoadmap,
  LearningPace,
  RoadmapGeneratorInput,
  RoadmapStage,
} from "../../types";

const STAGE_WORKLOAD_HOURS = [18, 32, 28, 34, 20] as const;
const PACE_FACTORS: Record<Exclude<LearningPace, null>, number> = {
  relaxed: 1.15,
  balanced: 1,
  intensive: 0.85,
};

const normalise = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function resolveTemplate(selectedCareer: string): CareerRoadmapTemplate {
  const careerKey = normalise(selectedCareer);
  const matchedTemplate = CAREER_ROADMAP_TEMPLATES.find((template) =>
    [template.id, template.career, ...(template.aliases ?? [])]
      .map(normalise)
      .includes(careerKey),
  );

  if (matchedTemplate) return matchedTemplate;

  const readableCareer = selectedCareer
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

  return {
    ...GENERIC_ROADMAP_TEMPLATE,
    id: selectedCareer,
    career: readableCareer || GENERIC_ROADMAP_TEMPLATE.career,
  };
}

function preferredModuleFormats(learningStyles: string[]) {
  const styles = learningStyles.map(normalise);
  const formats: string[] = [];

  if (styles.includes("mixed")) {
    return ["Visual walkthrough", "Reading guide", "Guided practice", "Practice exercise"];
  }

  if (styles.some((style) => style.includes("visual") || style.includes("video"))) {
    formats.push("Visual walkthrough");
  }
  if (styles.some((style) => style.includes("read") || style.includes("text"))) {
    formats.push("Reading guide");
  }
  if (styles.some((style) => style.includes("hands") || style.includes("project") || style.includes("practice"))) {
    formats.push("Guided practice");
  }
  if (styles.some((style) => style.includes("audio") || style.includes("listen"))) {
    formats.push("Audio lesson");
  }

  return formats.length > 0 ? formats : ["Interactive lesson"];
}

function adaptSkills(skills: string[], currentSkills: Set<string>) {
  const remainingSkills = skills.filter((skill) => !currentSkills.has(normalise(skill)));
  return remainingSkills.length > 0 ? remainingSkills : [`Advanced ${skills[0]} practice`];
}

function createStage(
  stage: Omit<RoadmapStage, "durationWeeks" | "learningModules">,
  workloadHours: number,
  input: RoadmapGeneratorInput,
  moduleFormats: string[],
): RoadmapStage {
  const currentSkills = new Set(input.currentSkills.map(normalise));
  const adaptedSkills = adaptSkills(stage.skills, currentSkills);
  const remainingRatio = adaptedSkills.length / Math.max(1, stage.skills.length);
  const priorKnowledgeFactor = 0.8 + Math.min(1, remainingRatio) * 0.2;
  const weeklyHours = Math.min(40, Math.max(1, input.hoursPerWeek ?? 8));
  const paceFactor = PACE_FACTORS[input.learningPace ?? "balanced"];

  return {
    ...stage,
    durationWeeks: Math.max(1, Math.ceil((workloadHours * priorKnowledgeFactor * paceFactor) / weeklyHours)),
    skills: adaptedSkills,
    learningModules: adaptedSkills.map(
      (skill, index) => `${moduleFormats[index % moduleFormats.length]}: ${skill}`,
    ),
  };
}

export function generateCareerRoadmap(input: RoadmapGeneratorInput): CareerRoadmap {
  const template = resolveTemplate(input.selectedCareer);
  const formats = preferredModuleFormats(input.learningStyles);
  const stageDefinitions: Array<Omit<RoadmapStage, "durationWeeks" | "learningModules">> = [
    {
      id: "foundations",
      title: "Stage 1 — Foundations",
      description: `Build the essential vocabulary and context needed to begin a ${template.career} path.`,
      skills: template.foundations,
      project: `Create a concise ${template.career} foundations map and self-assessment.`,
    },
    {
      id: "core-skills",
      title: "Stage 2 — Core Skills",
      description: `Develop the tools and methods used regularly by effective ${template.career}s.`,
      skills: template.coreSkills,
      project: `Complete a guided ${template.career} skills challenge using a realistic brief.`,
    },
    {
      id: "applied-learning",
      title: "Stage 3 — Applied Learning",
      description: "Combine your new capabilities through realistic scenarios, feedback, and iteration.",
      skills: template.appliedSkills,
      project: `Solve a cross-functional ${template.career} scenario and present your recommendation.`,
    },
    {
      id: "portfolio-project",
      title: "Stage 4 — Portfolio Project",
      description: "Turn your learning into credible evidence that demonstrates how you think and work.",
      skills: ["Case study development", "Problem framing", "Outcome storytelling"],
      project: template.portfolioProject,
    },
    {
      id: "career-readiness",
      title: "Stage 5 — Career Readiness",
      description: `Prepare to communicate your value and pursue ${template.career} opportunities confidently.`,
      skills: ["Resume writing", "Portfolio storytelling", "Interview preparation"],
      project: `Complete a tailored ${template.career} resume, portfolio narrative, and interview practice plan.`,
    },
  ];
  const stages = stageDefinitions.map((stage, index) =>
    createStage(stage, STAGE_WORKLOAD_HOURS[index], input, formats),
  );

  return {
    career: template.career,
    estimatedWeeks: stages.reduce((total, stage) => total + stage.durationWeeks, 0),
    stages,
  };
}
