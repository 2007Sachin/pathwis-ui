import { CAREER_PROFILES } from "./career-profiles";
import type {
  CareerProfile,
  CareerRecommendation,
  CareerRecommendationInput,
  CareerRecommendationProvider,
} from "../../types";

export const RECOMMENDATION_WEIGHTS = {
  skills: 0.28,
  currentRole: 0.07,
  interests: 0.25,
  orientation: 0.2,
  industries: 0.1,
  goal: 0.08,
  status: 0.02,
} as const;

const normalise = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const exactListMatch = (selected: string[], signals: string[]) => {
  if (selected.length === 0) return 0;
  const normalisedSignals = new Set(signals.map(normalise));
  return selected.filter((value) => normalisedSignals.has(normalise(value))).length / selected.length;
};

const singleMatch = (selected: string | null, signals: string[]) => {
  if (!selected) return 0;
  return signals.map(normalise).includes(normalise(selected)) ? 1 : 0;
};

const roleSimilarity = (currentRole: string | null, profile: CareerProfile) => {
  if (!currentRole) return 0;
  const role = normalise(currentRole);
  const roleTokens = new Set(role.split(" ").filter((token) => token.length > 2));

  return Math.max(
    ...[profile.career, ...profile.relatedRoles].map((relatedRole) => {
      const candidate = normalise(relatedRole);
      if (role.includes(candidate) || candidate.includes(role)) return 1;
      const candidateTokens = candidate.split(" ").filter((token) => token.length > 2);
      if (candidateTokens.length === 0) return 0;
      return candidateTokens.filter((token) => roleTokens.has(token)).length / candidateTokens.length;
    }),
  );
};

const matchedSkills = (skills: string[], profile: CareerProfile) => {
  const signals = new Set(profile.skillSignals.map(normalise));
  return skills.filter((skill) => signals.has(normalise(skill)));
};

const buildExplanation = (
  profile: CareerProfile,
  input: CareerRecommendationInput,
  components: Record<keyof typeof RECOMMENDATION_WEIGHTS, number>,
) => {
  const strongestSignals = Object.entries(components)
    .filter(([, score]) => score > 0)
    .sort((first, second) => second[1] - first[1])
    .slice(0, 2)
    .map(([signal]) => signal === "currentRole" ? "current role" : signal);
  const basis = strongestSignals.length > 0
    ? strongestSignals.join(" and ")
    : "the information shared so far";
  const context = input.currentRole
    ? ` Your experience around ${input.currentRole} also contributes to the fit.`
    : "";

  return `${profile.career} is a strong option for ${profile.description}, with the closest alignment coming from your ${basis}.${context}`;
};

export function scoreCareerProfile(
  profile: CareerProfile,
  input: CareerRecommendationInput,
): CareerRecommendation {
  const components = {
    skills: exactListMatch(input.skills, profile.skillSignals) * RECOMMENDATION_WEIGHTS.skills,
    currentRole: roleSimilarity(input.currentRole, profile) * RECOMMENDATION_WEIGHTS.currentRole,
    interests: exactListMatch(input.interests, profile.interestSignals) * RECOMMENDATION_WEIGHTS.interests,
    orientation: singleMatch(input.orientation, profile.orientations) * RECOMMENDATION_WEIGHTS.orientation,
    industries: exactListMatch(input.industries, profile.industries) * RECOMMENDATION_WEIGHTS.industries,
    goal: singleMatch(input.goal, profile.goals) * RECOMMENDATION_WEIGHTS.goal,
    status: singleMatch(input.status, profile.statuses) * RECOMMENDATION_WEIGHTS.status,
  };
  const transferableSkills = matchedSkills(input.skills, profile);
  const transferableKeys = new Set(transferableSkills.map(normalise));
  const totalScore = Object.values(components).reduce((sum, score) => sum + score, 0);

  return {
    id: profile.id,
    career: profile.career,
    matchPercentage: Math.round(totalScore * 100),
    explanation: buildExplanation(profile, input, components),
    transferableSkills,
    skillsToLearn: profile.skillsToLearn
      .filter((skill) => !transferableKeys.has(normalise(skill)))
      .slice(0, 4),
  };
}

export function calculateCareerRecommendations(
  input: CareerRecommendationInput,
  profiles: CareerProfile[] = CAREER_PROFILES,
) {
  return profiles
    .map((profile) => scoreCareerProfile(profile, input))
    .sort((first, second) =>
      second.matchPercentage - first.matchPercentage || first.career.localeCompare(second.career),
    )
    .slice(0, 3);
}

// The UI depends on this provider contract, not the scoring implementation.
// A backend or LLM provider can replace it without changing the form component.
export const recommendCareersLocally: CareerRecommendationProvider = async (input) =>
  calculateCareerRecommendations(input);
