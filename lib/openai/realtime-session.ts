import type { RealtimeSessionConfig } from "@/types";

export const REALTIME_SESSION_CONFIG = {
  type: "realtime",
  model: "gpt-realtime",
  output_modalities: ["audio"],
  audio: {
    output: {
      voice: "marin",
    },
  },
  instructions:
    "You are the Pathwisse onboarding guide. Be warm, concise, and focused on understanding the learner's background and career goals.",
} satisfies RealtimeSessionConfig;
