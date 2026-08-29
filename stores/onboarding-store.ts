"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  CareerIntent,
  CareerOrientation,
  CareerRecommendation,
  CareerRoadmap,
  LearningPace,
  OnboardingProfile,
  OnboardingGoal,
  OnboardingStatus,
} from "@/types";
import { generateCareerRoadmap } from "@/lib/career/roadmap-generator";

export interface OnboardingActions {
  setCurrentStep: (currentStep: number) => void;
  setGoal: (goal: OnboardingGoal) => void;
  setStatus: (status: OnboardingStatus) => void;
  setCurrentRole: (currentRole: string | null) => void;
  setEducation: (education: string | null) => void;
  setExperience: (experienceYears: number | null) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  setSkills: (skills: string[]) => void;
  setCareerIntent: (careerIntent: CareerIntent) => void;
  setCareerIdeas: (careerIdeas: string[]) => void;
  setInterests: (interests: string[]) => void;
  setOrientation: (orientation: CareerOrientation) => void;
  setIndustries: (industries: string[]) => void;
  setCareerPriorities: (careerPriorities: string[]) => void;
  setRecommendedCareers: (recommendedCareers: CareerRecommendation[]) => void;
  selectCareer: (selectedCareer: string | null) => void;
  setHoursPerWeek: (hoursPerWeek: number | null) => void;
  setLearningStyles: (learningStyles: string[]) => void;
  setLearningPace: (learningPace: LearningPace) => void;
  setRoadmap: (roadmap: CareerRoadmap | null) => void;
  generateRoadmap: () => CareerRoadmap | null;
  resetOnboarding: () => void;
}

export type OnboardingStore = OnboardingProfile & OnboardingActions;

const normaliseStringList = (values: string[]) => {
  const seen = new Set<string>();

  return values.reduce<string[]>((result, value) => {
    const normalisedValue = value.trim();
    const comparisonKey = normalisedValue.toLocaleLowerCase();

    if (!normalisedValue || seen.has(comparisonKey)) {
      return result;
    }

    seen.add(comparisonKey);
    result.push(normalisedValue);
    return result;
  }, []);
};

export const createInitialOnboardingProfile = (): OnboardingProfile => ({
  currentStep: 1,
  goal: null,
  status: null,
  currentRole: null,
  education: null,
  experienceYears: null,
  skills: [],
  careerIntent: null,
  careerIdeas: [],
  interests: [],
  orientation: null,
  industries: [],
  careerPriorities: [],
  recommendedCareers: [],
  selectedCareer: null,
  hoursPerWeek: null,
  learningStyles: [],
  learningPace: null,
  roadmap: null,
});

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...createInitialOnboardingProfile(),
      setCurrentStep: (currentStep) => set({ currentStep }),
      setGoal: (goal) => set({ goal }),
      setStatus: (status) => set({ status }),
      setCurrentRole: (currentRole) => set({ currentRole }),
      setEducation: (education) => set({ education }),
      setExperience: (experienceYears) => set({ experienceYears }),
      addSkill: (skill) =>
        set((state) => ({ skills: normaliseStringList([...state.skills, skill]) })),
      removeSkill: (skill) =>
        set((state) => ({
          skills: state.skills.filter(
            (currentSkill) => currentSkill.toLocaleLowerCase() !== skill.trim().toLocaleLowerCase(),
          ),
        })),
      setSkills: (skills) => set({ skills: normaliseStringList(skills) }),
      setCareerIntent: (careerIntent) =>
        set((state) => ({
          careerIntent,
          selectedCareer: careerIntent === "know_role" ? state.selectedCareer : null,
          careerIdeas: careerIntent === "few_ideas" ? state.careerIdeas : [],
        })),
      setCareerIdeas: (careerIdeas) =>
        set({ careerIdeas: normaliseStringList(careerIdeas).slice(0, 3) }),
      setInterests: (interests) => set({ interests: normaliseStringList(interests) }),
      setOrientation: (orientation) => set({ orientation }),
      setIndustries: (industries) => set({ industries: normaliseStringList(industries) }),
      setCareerPriorities: (careerPriorities) =>
        set({ careerPriorities: normaliseStringList(careerPriorities) }),
      setRecommendedCareers: (recommendedCareers) => set({ recommendedCareers }),
      selectCareer: (selectedCareer) => set({ selectedCareer }),
      setHoursPerWeek: (hoursPerWeek) => set({ hoursPerWeek }),
      setLearningStyles: (learningStyles) =>
        set({ learningStyles: normaliseStringList(learningStyles) }),
      setLearningPace: (learningPace) => set({ learningPace }),
      setRoadmap: (roadmap) => set({ roadmap }),
      generateRoadmap: () => {
        const state = get();
        if (!state.selectedCareer) return null;

        const roadmap = generateCareerRoadmap({
          selectedCareer: state.selectedCareer,
          currentSkills: state.skills,
          hoursPerWeek: state.hoursPerWeek,
          learningStyles: state.learningStyles,
          learningPace: state.learningPace,
        });
        set({ roadmap });
        return roadmap;
      },
      resetOnboarding: () => set(createInitialOnboardingProfile()),
    }),
    {
      name: "pathwisse-onboarding",
      version: 1,
    },
  ),
);

// Non-React callers, including future OpenAI tool executors, use this same store.
export const onboardingStore = useOnboardingStore;
