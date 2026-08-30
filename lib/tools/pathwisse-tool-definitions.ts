import {
  INDUSTRY_OPTIONS,
  WORK_INTEREST_OPTIONS,
} from "@/lib/career/discovery-options";
import type { RealtimeFunctionTool } from "@/types";

const stringList = {
  type: "array",
  items: { type: "string", minLength: 1 },
} as const;

export const PATHWISSE_TOOL_DEFINITIONS = [
  {
    type: "function",
    name: "set_user_goal",
    description:
      "Set the learner's main reason for using Pathwisse. Call this as soon as the learner states their goal.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        goal: {
          type: "string",
          enum: [
            "first_job",
            "career_switch",
            "upskill",
            "specific_job",
            "career_discovery",
            "practical_skills",
          ],
        },
      },
      required: ["goal"],
    },
  },
  {
    type: "function",
    name: "update_learner_profile",
    description:
      "Update profile facts the learner explicitly shared. Include every relevant fact from the current utterance, including skills when supplied.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        status: {
          type: "string",
          enum: [
            "student",
            "recent_graduate",
            "working_professional",
            "returning_to_work",
          ],
        },
        currentRole: { type: "string", minLength: 1 },
        education: { type: "string", minLength: 1 },
        experienceYears: { type: "number", minimum: 0 },
        skills: stringList,
      },
    },
  },
  {
    type: "function",
    name: "add_skill",
    description: "Add one skill to the learner's existing skills without replacing other skills.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: { skill: { type: "string", minLength: 1 } },
      required: ["skill"],
    },
  },
  {
    type: "function",
    name: "remove_skill",
    description: "Remove one skill from the learner's existing skills.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: { skill: { type: "string", minLength: 1 } },
      required: ["skill"],
    },
  },
  {
    type: "function",
    name: "set_career_intent",
    description: "Record whether the learner knows a target career, has a few ideas, or wants discovery help.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        careerIntent: {
          type: "string",
          enum: ["know_role", "few_ideas", "discover"],
        },
      },
      required: ["careerIntent"],
    },
  },
  {
    type: "function",
    name: "set_interests",
    description: "Replace the learner's work-interest selections with the interests they stated.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        interests: {
          type: "array",
          items: { type: "string", enum: WORK_INTEREST_OPTIONS },
        },
      },
      required: ["interests"],
    },
  },
  {
    type: "function",
    name: "set_orientation",
    description: "Set the learner's preferred business-to-technical orientation.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        orientation: {
          type: "string",
          enum: ["business", "balanced", "technical"],
        },
      },
      required: ["orientation"],
    },
  },
  {
    type: "function",
    name: "set_industries",
    description: "Replace the learner's selected industries with the industries they stated.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        industries: {
          type: "array",
          items: { type: "string", enum: INDUSTRY_OPTIONS },
        },
      },
      required: ["industries"],
    },
  },
  {
    type: "function",
    name: "recommend_careers",
    description:
      "Calculate and store the learner's top three deterministic career recommendations from the current onboarding profile.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
  },
  {
    type: "function",
    name: "select_career",
    description: "Select the career the learner wants Pathwisse to build a roadmap for.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: { career: { type: "string", minLength: 1 } },
      required: ["career"],
    },
  },
  {
    type: "function",
    name: "set_learning_preferences",
    description:
      "Update the learner's weekly commitment, preferred learning styles, and learning pace immediately when stated. Convert clear schedules into an approximate weekly total (for example, one hour each weekday is 5 hours per week), then briefly confirm the update instead of asking the learner to select it again.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        hoursPerWeek: { type: "number", minimum: 1, maximum: 80 },
        learningStyles: {
          type: "array",
          items: {
            type: "string",
            enum: ["Videos", "Reading", "Hands-on projects", "Practice exercises", "Mixed"],
          },
        },
        learningPace: {
          type: "string",
          enum: ["relaxed", "balanced", "intensive"],
        },
      },
    },
  },
  {
    type: "function",
    name: "generate_roadmap",
    description:
      "Generate and store a roadmap for the selected career using the current skills and learning preferences. A career must be selected first.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
  },
  {
    type: "function",
    name: "navigate_to_step",
    description:
      "Move the onboarding interface to a numbered step after the learner is ready to continue or explicitly asks to move.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        step: { type: "integer", minimum: 1, maximum: 9 },
      },
      required: ["step"],
    },
  },
] satisfies RealtimeFunctionTool[];
