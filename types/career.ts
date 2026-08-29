export type ExperienceLevel = "student" | "entry" | "mid" | "senior" | "leader";

export interface Skill {
  id: string;
  name: string;
  proficiency: "learning" | "working" | "proficient" | "expert";
}

export interface CareerGoal {
  title: string;
  targetRole?: string;
  targetDate?: string;
}

export interface CareerRole {
  id: string;
  title: string;
}

export interface CareerRecommendation {
  id: string;
  career: string;
  matchPercentage: number;
  explanation: string;
  transferableSkills: string[];
  skillsToLearn: string[];
}

export interface CareerRecommendationInput {
  goal: import("./onboarding").OnboardingGoal;
  status: import("./onboarding").OnboardingStatus;
  currentRole: string | null;
  skills: string[];
  interests: string[];
  orientation: import("./onboarding").CareerOrientation;
  industries: string[];
}

export type CareerRecommendationProvider = (
  input: CareerRecommendationInput,
) => Promise<CareerRecommendation[]>;

export interface CareerProfile {
  id: string;
  career: string;
  description: string;
  skillSignals: string[];
  interestSignals: string[];
  orientations: Array<Exclude<import("./onboarding").CareerOrientation, null>>;
  industries: string[];
  goals: Array<Exclude<import("./onboarding").OnboardingGoal, null>>;
  statuses: Array<Exclude<import("./onboarding").OnboardingStatus, null>>;
  relatedRoles: string[];
  skillsToLearn: string[];
}

export interface RoadmapStage {
  id: string;
  title: string;
  description: string;
  durationWeeks: number;
  skills: string[];
  learningModules: string[];
  project: string;
}

export interface CareerRoadmap {
  career: string;
  estimatedWeeks: number;
  stages: RoadmapStage[];
}

export interface RoadmapGeneratorInput {
  selectedCareer: string;
  currentSkills: string[];
  hoursPerWeek: number | null;
  learningStyles: string[];
  learningPace: import("./onboarding").LearningPace;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  status: "not_started" | "in_progress" | "completed";
}

export interface CareerToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}
