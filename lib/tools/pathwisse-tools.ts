import {
  INDUSTRY_OPTIONS,
  WORK_INTEREST_OPTIONS,
} from "@/lib/career/discovery-options";
import { MOCK_CAREER_ROLES } from "@/lib/career/mock-careers";
import { calculateCareerRecommendations } from "@/lib/career/recommendation-engine";
import { announceAiUiUpdate } from "@/stores/ai-ui-feedback-store";
import { onboardingStore } from "@/stores/onboarding-store";
import type {
  LearningPace,
  OnboardingStatus,
  RealtimeFunctionCall,
} from "@/types";

const goalValues = [
  "first_job",
  "career_switch",
  "upskill",
  "specific_job",
  "career_discovery",
  "practical_skills",
] as const;
const statusValues = [
  "student",
  "recent_graduate",
  "working_professional",
  "returning_to_work",
] as const;
const careerIntentValues = ["know_role", "few_ideas", "discover"] as const;
const orientationValues = ["business", "balanced", "technical"] as const;
const learningPaceValues = ["relaxed", "balanced", "intensive"] as const;

type PathwisseToolResult = {
  success: true;
  tool: string;
  message: string;
  updatedFields?: string[];
  data?: unknown;
};

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const parseArguments = (call: RealtimeFunctionCall) => {
  let value: unknown;

  try {
    value = call.arguments.trim() ? JSON.parse(call.arguments) : {};
  } catch {
    throw new Error(`${call.name} received invalid JSON arguments.`);
  }

  if (!isRecord(value)) {
    throw new Error(`${call.name} arguments must be a JSON object.`);
  }

  return value;
};

const validateKeys = (
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
  toolName: string,
) => {
  const unknownKey = Object.keys(value).find((key) => !allowedKeys.includes(key));
  if (unknownKey) {
    throw new Error(`${toolName} does not accept the field "${unknownKey}".`);
  }
};

const requiredString = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const requiredStringList = (
  value: unknown,
  field: string,
  allowedValues?: readonly string[],
) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${field} must be an array of strings.`);
  }

  return value.map((item) => {
    const trimmedItem = item.trim();
    if (!allowedValues) return trimmedItem;

    const canonicalValue = allowedValues.find(
      (allowedValue) =>
        allowedValue.toLocaleLowerCase() === trimmedItem.toLocaleLowerCase(),
    );
    if (!canonicalValue) {
      throw new Error(`${field} contains an unsupported value: ${trimmedItem}.`);
    }
    return canonicalValue;
  }).filter(Boolean);
};

const requiredEnum = <T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  field: string,
) => {
  if (typeof value !== "string" || !allowedValues.includes(value as T)) {
    throw new Error(`${field} must be one of: ${allowedValues.join(", ")}.`);
  }

  return value as T;
};

const recommendationsFromCurrentProfile = () => {
  const state = onboardingStore.getState();
  return calculateCareerRecommendations({
    goal: state.goal,
    status: state.status,
    currentRole: state.currentRole,
    skills: state.skills,
    interests: state.interests,
    orientation: state.orientation,
    industries: state.industries,
  });
};

const refreshRecommendationsIfPresent = () => {
  const state = onboardingStore.getState();
  if (state.recommendedCareers.length === 0) return false;

  state.setRecommendedCareers(recommendationsFromCurrentProfile());
  return true;
};

const resolveCareerSelection = (career: string) => {
  const comparisonValue = career.trim().toLocaleLowerCase();
  const recommendation = onboardingStore
    .getState()
    .recommendedCareers.find(
      (item) =>
        item.id.toLocaleLowerCase() === comparisonValue ||
        item.career.toLocaleLowerCase() === comparisonValue,
    );
  if (recommendation) {
    return { id: recommendation.id, title: recommendation.career };
  }

  const role = MOCK_CAREER_ROLES.find(
    (item) =>
      item.id.toLocaleLowerCase() === comparisonValue ||
      item.title.toLocaleLowerCase() === comparisonValue,
  );
  return role
    ? { id: role.id, title: role.title }
    : { id: career.trim(), title: career.trim() };
};

const success = (
  tool: string,
  message: string,
  options: Pick<PathwisseToolResult, "updatedFields" | "data"> = {},
): PathwisseToolResult => ({ success: true, tool, message, ...options });

export function executePathwisseTool(call: RealtimeFunctionCall): PathwisseToolResult {
  const input = parseArguments(call);
  const actions = onboardingStore.getState();

  switch (call.name) {
    case "set_user_goal": {
      validateKeys(input, ["goal"], call.name);
      const goal = requiredEnum(input.goal, goalValues, "goal");
      actions.setGoal(goal);
      announceAiUiUpdate("goal", [goal]);
      const recommendationsRefreshed = refreshRecommendationsIfPresent();
      return success(call.name, "The learner's goal was updated.", {
        updatedFields: ["goal"],
        data: { goal, recommendationsRefreshed },
      });
    }

    case "update_learner_profile": {
      const allowedFields = [
        "status",
        "currentRole",
        "education",
        "experienceYears",
        "skills",
      ] as const;
      validateKeys(input, allowedFields, call.name);
      const updatedFields: string[] = [];
      const nextProfile: {
        status?: OnboardingStatus;
        currentRole?: string;
        education?: string;
        experienceYears?: number;
        skills?: string[];
      } = {};

      if (hasOwn(input, "status")) {
        nextProfile.status = requiredEnum(
          input.status,
          statusValues,
          "status",
        ) as OnboardingStatus;
        updatedFields.push("status");
      }
      if (hasOwn(input, "currentRole")) {
        nextProfile.currentRole = requiredString(input.currentRole, "currentRole");
        updatedFields.push("currentRole");
      }
      if (hasOwn(input, "education")) {
        nextProfile.education = requiredString(input.education, "education");
        updatedFields.push("education");
      }
      if (hasOwn(input, "experienceYears")) {
        if (
          typeof input.experienceYears !== "number" ||
          !Number.isFinite(input.experienceYears) ||
          input.experienceYears < 0
        ) {
          throw new Error("experienceYears must be a non-negative number.");
        }
        nextProfile.experienceYears = input.experienceYears;
        updatedFields.push("experienceYears");
      }
      if (hasOwn(input, "skills")) {
        nextProfile.skills = requiredStringList(input.skills, "skills");
        updatedFields.push("skills");
      }
      if (updatedFields.length === 0) {
        throw new Error("update_learner_profile requires at least one profile field.");
      }

      if (nextProfile.status) actions.setStatus(nextProfile.status);
      if (nextProfile.currentRole) actions.setCurrentRole(nextProfile.currentRole);
      if (nextProfile.education) actions.setEducation(nextProfile.education);
      if (nextProfile.experienceYears !== undefined) {
        actions.setExperience(nextProfile.experienceYears);
      }
      if (nextProfile.skills) actions.setSkills(nextProfile.skills);

      if (nextProfile.status) announceAiUiUpdate("status", [nextProfile.status]);
      if (nextProfile.currentRole) announceAiUiUpdate("currentRole");
      if (nextProfile.education) announceAiUiUpdate("education");
      if (nextProfile.experienceYears !== undefined) {
        announceAiUiUpdate("experienceYears", [nextProfile.experienceYears]);
      }
      if (nextProfile.skills) announceAiUiUpdate("skills");

      const recommendationsRefreshed = refreshRecommendationsIfPresent();
      return success(call.name, "The learner profile was updated.", {
        updatedFields,
        data: { recommendationsRefreshed },
      });
    }

    case "add_skill": {
      validateKeys(input, ["skill"], call.name);
      const skill = requiredString(input.skill, "skill");
      actions.addSkill(skill);
      announceAiUiUpdate("skills");
      const recommendationsRefreshed = refreshRecommendationsIfPresent();
      return success(call.name, `${skill} was added to the learner's skills.`, {
        updatedFields: ["skills"],
        data: { skills: onboardingStore.getState().skills, recommendationsRefreshed },
      });
    }

    case "remove_skill": {
      validateKeys(input, ["skill"], call.name);
      const skill = requiredString(input.skill, "skill");
      actions.removeSkill(skill);
      announceAiUiUpdate("skills");
      const recommendationsRefreshed = refreshRecommendationsIfPresent();
      return success(call.name, `${skill} was removed from the learner's skills.`, {
        updatedFields: ["skills"],
        data: { skills: onboardingStore.getState().skills, recommendationsRefreshed },
      });
    }

    case "set_career_intent": {
      validateKeys(input, ["careerIntent"], call.name);
      const careerIntent = requiredEnum(
        input.careerIntent,
        careerIntentValues,
        "careerIntent",
      );
      actions.setCareerIntent(careerIntent);
      announceAiUiUpdate("careerIntent", [careerIntent]);
      return success(call.name, "The learner's career intent was updated.", {
        updatedFields: ["careerIntent"],
        data: { careerIntent },
      });
    }

    case "set_interests": {
      validateKeys(input, ["interests"], call.name);
      const interests = requiredStringList(
        input.interests,
        "interests",
        WORK_INTEREST_OPTIONS,
      );
      actions.setInterests(interests);
      announceAiUiUpdate("interests");
      const recommendationsRefreshed = refreshRecommendationsIfPresent();
      return success(call.name, "The learner's interests were updated.", {
        updatedFields: ["interests"],
        data: { interests: onboardingStore.getState().interests, recommendationsRefreshed },
      });
    }

    case "set_orientation": {
      validateKeys(input, ["orientation"], call.name);
      const orientation = requiredEnum(
        input.orientation,
        orientationValues,
        "orientation",
      );
      actions.setOrientation(orientation);
      announceAiUiUpdate("orientation", [orientation]);
      const recommendationsRefreshed = refreshRecommendationsIfPresent();
      return success(call.name, `The learner's orientation is now ${orientation}.`, {
        updatedFields: ["orientation"],
        data: { orientation, recommendationsRefreshed },
      });
    }

    case "set_industries": {
      validateKeys(input, ["industries"], call.name);
      const industries = requiredStringList(
        input.industries,
        "industries",
        INDUSTRY_OPTIONS,
      );
      actions.setIndustries(industries);
      announceAiUiUpdate("industries");
      const recommendationsRefreshed = refreshRecommendationsIfPresent();
      return success(call.name, "The learner's industries were updated.", {
        updatedFields: ["industries"],
        data: { industries: onboardingStore.getState().industries, recommendationsRefreshed },
      });
    }

    case "set_career_priorities": {
      validateKeys(input, ["priorities"], call.name);
      const priorities = requiredStringList(input.priorities, "priorities");
      actions.setCareerPriorities(priorities);
      announceAiUiUpdate("careerPriorities");
      return success(call.name, "Career priorities were updated.", { updatedFields: ["careerPriorities"] });
    }

    case "recommend_careers": {
      validateKeys(input, [], call.name);
      const recommendations = recommendationsFromCurrentProfile();
      actions.setRecommendedCareers(recommendations);
      announceAiUiUpdate("recommendedCareers");
      return success(call.name, "The top three career matches were calculated.", {
        updatedFields: ["recommendedCareers"],
        data: { recommendations },
      });
    }

    case "select_career": {
      validateKeys(input, ["career"], call.name);
      const career = requiredString(input.career, "career");
      const selection = resolveCareerSelection(career);
      actions.selectCareer(selection.id);
      announceAiUiUpdate("selectedCareer", [selection.id]);
      return success(call.name, `${selection.title} was selected.`, {
        updatedFields: ["selectedCareer"],
        data: { selectedCareer: selection.id, career: selection.title },
      });
    }

    case "set_learning_preferences": {
      const allowedFields = ["hoursPerWeek", "learningStyles", "learningPace"] as const;
      validateKeys(input, allowedFields, call.name);
      const updatedFields: string[] = [];
      const nextPreferences: {
        hoursPerWeek?: number;
        learningStyles?: string[];
        learningPace?: LearningPace;
      } = {};

      if (hasOwn(input, "hoursPerWeek")) {
        if (
          typeof input.hoursPerWeek !== "number" ||
          !Number.isFinite(input.hoursPerWeek) ||
          input.hoursPerWeek < 1 ||
          input.hoursPerWeek > 80
        ) {
          throw new Error("hoursPerWeek must be between 1 and 80.");
        }
        nextPreferences.hoursPerWeek = input.hoursPerWeek;
        updatedFields.push("hoursPerWeek");
      }
      if (hasOwn(input, "learningStyles")) {
        nextPreferences.learningStyles = requiredStringList(
          input.learningStyles,
          "learningStyles",
        );
        updatedFields.push("learningStyles");
      }
      if (hasOwn(input, "learningPace")) {
        nextPreferences.learningPace = requiredEnum(
          input.learningPace,
          learningPaceValues,
          "learningPace",
        ) as LearningPace;
        updatedFields.push("learningPace");
      }
      if (updatedFields.length === 0) {
        throw new Error("set_learning_preferences requires at least one preference.");
      }

      if (nextPreferences.hoursPerWeek !== undefined) {
        actions.setHoursPerWeek(nextPreferences.hoursPerWeek);
      }
      if (nextPreferences.learningStyles) {
        actions.setLearningStyles(nextPreferences.learningStyles);
      }
      if (nextPreferences.learningPace) {
        actions.setLearningPace(nextPreferences.learningPace);
      }

      if (nextPreferences.hoursPerWeek !== undefined) {
        announceAiUiUpdate("hoursPerWeek", [nextPreferences.hoursPerWeek]);
      }
      if (nextPreferences.learningStyles) {
        announceAiUiUpdate("learningStyles", nextPreferences.learningStyles);
      }
      if (nextPreferences.learningPace) {
        announceAiUiUpdate("learningPace", [nextPreferences.learningPace]);
      }

      return success(call.name, "The learner's learning preferences were updated.", {
        updatedFields,
      });
    }

    case "generate_roadmap": {
      validateKeys(input, [], call.name);
      const roadmap = actions.generateRoadmap();
      if (!roadmap) {
        throw new Error("A career must be selected before generating a roadmap.");
      }
      announceAiUiUpdate("roadmap");
      return success(call.name, `A roadmap for ${roadmap.career} was generated.`, {
        updatedFields: ["roadmap"],
        data: {
          career: roadmap.career,
          estimatedWeeks: roadmap.estimatedWeeks,
          stageCount: roadmap.stages.length,
        },
      });
    }

    case "navigate_to_step": {
      validateKeys(input, ["step"], call.name);
      if (!Number.isInteger(input.step) || Number(input.step) < 1 || Number(input.step) > 7) {
        throw new Error("step must be an integer from 1 to 7.");
      }
      const step = Number(input.step);
      actions.setCurrentStep(step);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("step", String(step));
        window.history.replaceState(null, "", url);
      }

      return success(call.name, `The onboarding interface moved to step ${step}.`, {
        updatedFields: ["currentStep"],
        data: { currentStep: step },
      });
    }

    default:
      throw new Error(`Unsupported Pathwisse tool: ${call.name}.`);
  }
}
