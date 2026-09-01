import type { OnboardingProfile } from "@/types";

export type RequiredOnboardingField = keyof Pick<OnboardingProfile,
  "goal" | "status" | "currentRole" | "education" | "experienceYears" | "skills" |
  "careerIntent" | "interests" | "orientation" | "industries" | "careerPriorities" |
  "selectedCareer" | "hoursPerWeek" | "learningStyles" | "learningPace"
>;

/** Returns only unanswered fields for the learner's currently selected path. */
export function getMissingOnboardingFields(profile: OnboardingProfile): RequiredOnboardingField[] {
  const missing: RequiredOnboardingField[] = [];
  const requireValue = (field: RequiredOnboardingField, value: unknown) => {
    if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) missing.push(field);
  };
  requireValue("goal", profile.goal);
  requireValue("status", profile.status);
  requireValue("currentRole", profile.currentRole);
  requireValue("education", profile.education);
  requireValue("experienceYears", profile.experienceYears);
  requireValue("skills", profile.skills);
  requireValue("careerIntent", profile.careerIntent);
  if (profile.careerIntent === "discover") {
    requireValue("interests", profile.interests); requireValue("orientation", profile.orientation);
    requireValue("industries", profile.industries); requireValue("careerPriorities", profile.careerPriorities);
  } else if (profile.careerIntent === "know_role") requireValue("selectedCareer", profile.selectedCareer);
  else if (profile.careerIntent === "few_ideas" && profile.careerIdeas.length === 0) missing.push("selectedCareer");
  requireValue("hoursPerWeek", profile.hoursPerWeek); requireValue("learningStyles", profile.learningStyles);
  requireValue("learningPace", profile.learningPace);
  return missing;
}
