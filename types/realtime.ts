export type VoiceConnectionState =
  | "idle"
  | "requesting_permission"
  | "connecting"
  | "connected"
  | "speaking"
  | "listening"
  | "error";

export interface RealtimeSessionConfig {
  type: "realtime";
  model: string;
  output_modalities: ["audio"];
  audio: {
    output: {
      voice: string;
    };
  };
  instructions: string;
}

export interface RealtimeClientEvent<TPayload = Record<string, unknown>> {
  type: string;
  event_id?: string;
  payload?: TPayload;
}
