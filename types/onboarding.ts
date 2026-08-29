import type { CareerRecommendation, CareerRoadmap } from "./career";

export type OnboardingStepId = "welcome" | "profile" | "goals" | "skills" | "review";

export type OnboardingGoal =
  | "first_job"
  | "career_switch"
  | "upskill"
  | "specific_job"
  | "career_discovery"
  | "practical_skills"
  | null;

export type OnboardingStatus =
  | "student"
  | "recent_graduate"
  | "working_professional"
  | "returning_to_work"
  | null;

export type CareerIntent = "know_role" | "few_ideas" | "discover" | null;

export type CareerOrientation = "business" | "balanced" | "technical" | null;

export type LearningPace = "relaxed" | "balanced" | "intensive" | null;

export interface LearningPreference {
  hoursPerWeek: number | null;
  learningStyles: string[];
  learningPace: LearningPace;
}

export interface OnboardingStep {
  id: OnboardingStepId;
  label: string;
  description: string;
}

export interface OnboardingProfile {
  currentStep: number;
  goal: OnboardingGoal;
  status: OnboardingStatus;
  currentRole: string | null;
  education: string | null;
  experienceYears: number | null;
  skills: string[];
  careerIntent: CareerIntent;
  careerIdeas: string[];
  interests: string[];
  orientation: CareerOrientation;
  industries: string[];
  careerPriorities: string[];
  recommendedCareers: CareerRecommendation[];
  selectedCareer: string | null;
  hoursPerWeek: number | null;
  learningStyles: string[];
  learningPace: LearningPace;
  roadmap: CareerRoadmap | null;
}
