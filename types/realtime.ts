export type RealtimeConnectionStatus =
  | "disconnected"
  | "requesting_permission"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export type RealtimeVoiceStatus =
  | "idle"
  | "speaking"
  | "listening"
  | "thinking"
  | "muted";

export interface RealtimeFunctionTool {
  type: "function";
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface RealtimeSessionConfig {
  type: "realtime";
  model: string;
  output_modalities: ["audio"];
  audio: {
    input: {
      noise_reduction: {
        type: "near_field" | "far_field";
      };
      transcription: {
        model: string;
        language?: string;
        prompt?: string;
      };
      turn_detection: {
        type: "semantic_vad" | "server_vad";
        create_response: boolean;
        interrupt_response: boolean;
        eagerness?: "low" | "medium" | "high" | "auto";
      };
    };
    output: {
      voice: string;
    };
  };
  instructions: string;
  tools: RealtimeFunctionTool[];
  tool_choice: "auto" | "none" | "required";
}

export interface RealtimeSessionCredential {
  value: string;
  expiresAt?: number;
}

export interface RealtimeClientEvent {
  type: string;
  event_id?: string;
  [key: string]: unknown;
}

export interface RealtimeFunctionCall {
  callId: string;
  name: string;
  arguments: string;
}
