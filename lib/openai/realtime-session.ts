import "server-only";

import { PATHWISSE_SYSTEM_PROMPT } from "@/lib/openai/pathwisse-system-prompt";
import { PATHWISSE_TOOL_DEFINITIONS } from "@/lib/tools/pathwisse-tool-definitions";
import type { RealtimeSessionConfig } from "@/types";

export const REALTIME_SESSION_CONFIG = {
  type: "realtime",
  model: "gpt-realtime-2.1",
  output_modalities: ["audio"],
  audio: {
    input: {
      noise_reduction: {
        type: "near_field",
      },
      transcription: {
        model: "gpt-live-transcribe",
        language: "en",
        prompt:
          "Expect career, education, technology, business, product, data, and skills terminology.",
      },
      turn_detection: {
        type: "semantic_vad",
        eagerness: "auto",
        create_response: true,
        // Cancels an in-progress assistant response when the learner starts speaking.
        interrupt_response: true,
      },
    },
    output: {
      voice: "marin",
    },
  },
  instructions: PATHWISSE_SYSTEM_PROMPT,
  tools: PATHWISSE_TOOL_DEFINITIONS,
  tool_choice: "auto",
} satisfies RealtimeSessionConfig;
