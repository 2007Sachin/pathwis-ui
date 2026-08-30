import {
  OPENAI_REALTIME_CALLS_ENDPOINT,
  REALTIME_DATA_CHANNEL_LABEL,
  REALTIME_SESSION_ENDPOINT,
} from "@/lib/realtime/constants";
import type {
  RealtimeClientEvent,
  RealtimeConnectionStatus,
  RealtimeFunctionCall,
  RealtimeSessionCredential,
  RealtimeVoiceStatus,
} from "@/types";

interface RealtimeErrorEvent extends RealtimeClientEvent {
  error?: {
    message?: string;
  };
}

export interface PathwisseRealtimeClientOptions {
  onConnectionStatusChange?: (status: RealtimeConnectionStatus) => void;
  onVoiceStatusChange?: (status: RealtimeVoiceStatus) => void;
  onTranscriptChange?: (transcript: string) => void;
  onAssistantMessageChange?: (message: string) => void;
  onError?: (message: string) => void;
  onFunctionCall?: (call: RealtimeFunctionCall) => Promise<unknown> | unknown;
}

const MAX_RECONNECT_ATTEMPTS = 4;
const RECONNECT_DELAYS_MS = [1_000, 2_000, 4_000, 8_000];

const getMicrophoneErrorMessage = (error: unknown) => {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "Microphone access was denied. Allow microphone access and try again.";
    }

    if (error.name === "NotFoundError") {
      return "No microphone was found on this device.";
    }

    if (error.name === "NotReadableError" || error.name === "AbortError") {
      return "The microphone is already in use or unavailable.";
    }
  }

  return "Pathwisse could not access your microphone.";
};

const readJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const getString = (value: unknown) =>
  typeof value === "string" ? value : undefined;

export class PathwisseRealtimeClient {
  private readonly options: PathwisseRealtimeClientOptions;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private microphoneStream: MediaStream | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private requestController: AbortController | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private shouldReconnect = false;
  private manuallyMuted = false;
  private listeningEnabled = true;
  private userTranscript = "";
  private assistantTranscript = "";
  private voiceStatus: RealtimeVoiceStatus = "idle";

  constructor(options: PathwisseRealtimeClientOptions = {}) {
    this.options = options;
  }

  async connect() {
    if (this.peerConnection?.connectionState === "connected") return;
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      this.fail("Realtime voice requires a browser with microphone and WebRTC support.");
      return;
    }

    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.clearReconnectTimer();
    this.listeningEnabled = true;
    this.setConnectionStatus("requesting_permission");

    if (!this.microphoneStream?.active) {
      this.stopMicrophone();
      try {
        this.microphoneStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (error) {
        this.shouldReconnect = false;
        this.fail(getMicrophoneErrorMessage(error));
        return;
      }
    }

    try {
      await this.establishConnection(false);
    } catch (error) {
      this.fail(
        error instanceof Error
          ? error.message
          : "Pathwisse could not connect to the realtime voice service.",
      );
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    this.reconnectAttempts = 0;
    this.clearReconnectTimer();
    this.closeTransport();
    this.stopMicrophone();
    this.userTranscript = "";
    this.assistantTranscript = "";
    this.listeningEnabled = true;
    this.manuallyMuted = false;
    this.setVoiceStatus("idle");
    this.setConnectionStatus("disconnected");
  }

  async startListening() {
    if (this.peerConnection?.connectionState !== "connected") {
      await this.connect();
      return;
    }

    this.manuallyMuted = false;
    this.listeningEnabled = true;
    this.setMicrophoneEnabled(true);
    this.setVoiceStatus("listening");
  }

  stopListening() {
    this.listeningEnabled = false;
    this.setMicrophoneEnabled(false);
    this.setVoiceStatus("idle");
  }

  mute() {
    this.manuallyMuted = true;
    this.setMicrophoneEnabled(false);
    this.setVoiceStatus("muted");
  }

  unmute() {
    this.manuallyMuted = false;
    this.listeningEnabled = true;
    this.setMicrophoneEnabled(true);
    this.setVoiceStatus("listening");
  }

  sendText(text: string) {
    const message = text.trim();
    if (!message) return;

    this.sendEvent({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: message }],
      },
    });
    this.sendEvent({ type: "response.create" });
    this.options.onTranscriptChange?.(message);
    this.setVoiceStatus("thinking");
  }

  private async establishConnection(isReconnect: boolean) {
    if (!this.microphoneStream?.active) {
      throw new Error("The microphone is no longer available.");
    }

    this.closeTransport();
    this.setConnectionStatus(isReconnect ? "reconnecting" : "connecting");
    this.requestController = new AbortController();

    const credentialResponse = await fetch(REALTIME_SESSION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: this.requestController.signal,
    });
    const credential = await readJson<RealtimeSessionCredential & { error?: string }>(
      credentialResponse,
    );

    if (!credentialResponse.ok || !credential?.value) {
      throw new Error(
        credential?.error ?? "Pathwisse could not create a realtime session.",
      );
    }

    const peerConnection = new RTCPeerConnection();
    this.peerConnection = peerConnection;
    this.bindPeerConnection(peerConnection);

    this.audioElement = new Audio();
    this.audioElement.autoplay = true;

    for (const track of this.microphoneStream.getAudioTracks()) {
      track.enabled = this.listeningEnabled && !this.manuallyMuted;
      track.onended = () => {
        if (!this.shouldReconnect) return;
        this.shouldReconnect = false;
        this.closeTransport();
        this.fail("The microphone was disconnected. Reconnect it and try again.");
      };
      peerConnection.addTrack(track, this.microphoneStream);
    }

    const dataChannel = peerConnection.createDataChannel(
      REALTIME_DATA_CHANNEL_LABEL,
    );
    this.dataChannel = dataChannel;
    this.bindDataChannel(dataChannel);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const sdpResponse = await fetch(OPENAI_REALTIME_CALLS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credential.value}`,
        "Content-Type": "application/sdp",
      },
      body: offer.sdp,
      signal: this.requestController.signal,
    });

    if (!sdpResponse.ok) {
      throw new Error("OpenAI rejected the realtime WebRTC connection.");
    }

    await peerConnection.setRemoteDescription({
      type: "answer",
      sdp: await sdpResponse.text(),
    });

    await this.waitForDataChannelOpen(dataChannel);
  }

  private waitForDataChannelOpen(dataChannel: RTCDataChannel) {
    if (dataChannel.readyState === "open") return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("The realtime event channel did not open in time."));
      }, 10_000);
      const cleanup = () => {
        clearTimeout(timeout);
        dataChannel.removeEventListener("open", handleOpen);
        dataChannel.removeEventListener("close", handleClose);
        dataChannel.removeEventListener("error", handleError);
      };
      const handleOpen = () => {
        cleanup();
        resolve();
      };
      const handleClose = () => {
        cleanup();
        reject(new Error("The realtime event channel closed while connecting."));
      };
      const handleError = () => {
        cleanup();
        reject(new Error("The realtime event channel failed while connecting."));
      };

      dataChannel.addEventListener("open", handleOpen, { once: true });
      dataChannel.addEventListener("close", handleClose, { once: true });
      dataChannel.addEventListener("error", handleError, { once: true });
    });
  }

  private bindPeerConnection(peerConnection: RTCPeerConnection) {
    peerConnection.ontrack = ({ streams }) => {
      if (!this.audioElement || !streams[0]) return;
      this.audioElement.srcObject = streams[0];
      void this.resumeAssistantAudio();
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection !== this.peerConnection) return;

      if (peerConnection.connectionState === "connected") {
        this.reconnectAttempts = 0;
        this.setConnectionStatus("connected");
        this.setVoiceStatus(this.connectedVoiceStatus());
      }

      if (
        peerConnection.connectionState === "failed" ||
        peerConnection.connectionState === "disconnected"
      ) {
        this.scheduleReconnect();
      }
    };
  }

  private bindDataChannel(dataChannel: RTCDataChannel) {
    dataChannel.onopen = () => {
      this.setConnectionStatus("connected");
      this.setVoiceStatus(this.connectedVoiceStatus());
    };
    dataChannel.onmessage = (message) => this.handleServerEvent(message.data);
    dataChannel.onerror = () => {
      this.options.onError?.("The realtime event channel encountered an error.");
    };
    dataChannel.onclose = () => {
      if (this.shouldReconnect) this.scheduleReconnect();
    };
  }

  private handleServerEvent(rawEvent: unknown) {
    if (typeof rawEvent !== "string") return;

    let event: RealtimeClientEvent;
    try {
      event = JSON.parse(rawEvent) as RealtimeClientEvent;
    } catch {
      return;
    }

    switch (event.type) {
      case "input_audio_buffer.speech_started":
        if (this.voiceStatus === "speaking" || this.voiceStatus === "thinking") {
          this.interruptAssistant();
        }
        this.userTranscript = "";
        this.setVoiceStatus("listening");
        break;
      case "input_audio_buffer.speech_stopped":
        this.setVoiceStatus("thinking");
        break;
      case "conversation.item.input_audio_transcription.delta": {
        const delta = getString(event.delta);
        if (delta) {
          this.userTranscript += delta;
          this.options.onTranscriptChange?.(this.userTranscript.trim());
        }
        break;
      }
      case "conversation.item.input_audio_transcription.completed": {
        const transcript = getString(event.transcript);
        if (transcript) {
          this.userTranscript = transcript;
          this.options.onTranscriptChange?.(transcript.trim());
        }
        break;
      }
      case "response.created":
        this.assistantTranscript = "";
        this.setVoiceStatus("thinking");
        break;
      case "response.output_audio_transcript.delta":
      case "response.output_text.delta": {
        const delta = getString(event.delta);
        if (delta) {
          this.assistantTranscript += delta;
          this.options.onAssistantMessageChange?.(
            this.assistantTranscript.trimStart(),
          );
        }
        break;
      }
      case "response.output_audio_transcript.done":
      case "response.output_text.done": {
        const transcript =
          getString(event.transcript) ?? getString(event.text);
        if (transcript) {
          this.assistantTranscript = transcript;
          this.options.onAssistantMessageChange?.(transcript.trim());
        }
        break;
      }
      case "response.output_audio.delta":
      case "output_audio_buffer.started":
        this.setVoiceStatus("speaking");
        void this.resumeAssistantAudio();
        break;
      case "output_audio_buffer.stopped":
        this.setVoiceStatus(this.connectedVoiceStatus());
        break;
      case "response.done":
        void this.handleResponseDone(event);
        break;
      case "error": {
        const realtimeError = event as RealtimeErrorEvent;
        this.options.onError?.(
          realtimeError.error?.message ?? "The realtime session returned an error.",
        );
        break;
      }
    }
  }

  private async handleResponseDone(event: RealtimeClientEvent) {
    const response = event.response;
    if (!response || typeof response !== "object") return;
    const output = (response as { output?: unknown }).output;
    if (!Array.isArray(output)) return;

    const functionCalls: RealtimeFunctionCall[] = [];

    for (const item of output) {
      if (!item || typeof item !== "object") continue;
      const record = item as Record<string, unknown>;
      if (record.type !== "function_call") continue;

      const callId = getString(record.call_id);
      const name = getString(record.name);
      const args = getString(record.arguments);
      if (!callId || !name || args === undefined) continue;

      functionCalls.push({ callId, name, arguments: args });
    }

    if (functionCalls.length === 0) return;

    for (const call of functionCalls) {
      let output: unknown;

      try {
        output =
          (await this.options.onFunctionCall?.(call)) ?? { success: true };
      } catch (error) {
        output = {
          success: false,
          tool: call.name,
          error: error instanceof Error ? error.message : "Tool execution failed.",
        };
      }

      this.sendEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: call.callId,
          output: JSON.stringify(output),
        },
      });
    }

    // All results are present in the conversation before the model is asked to
    // speak, so multi-tool turns receive one coherent verbal acknowledgement.
    this.sendEvent({ type: "response.create" });
  }

  private interruptAssistant() {
    // With WebRTC and interrupt_response enabled, OpenAI clears and truncates the
    // server output buffer. Pausing locally removes any residual playback latency.
    this.audioElement?.pause();
  }

  private async resumeAssistantAudio() {
    if (!this.audioElement?.srcObject) return;
    try {
      await this.audioElement.play();
    } catch {
      this.options.onError?.(
        "Browser autoplay is blocked. Interact with the assistant to play audio.",
      );
    }
  }

  private sendEvent(event: Record<string, unknown>) {
    if (this.dataChannel?.readyState !== "open") {
      throw new Error("The realtime session is not connected.");
    }
    this.dataChannel.send(JSON.stringify(event));
  }

  private setMicrophoneEnabled(enabled: boolean) {
    for (const track of this.microphoneStream?.getAudioTracks() ?? []) {
      track.enabled = enabled;
    }
  }

  private connectedVoiceStatus(): RealtimeVoiceStatus {
    if (this.manuallyMuted) return "muted";
    return this.listeningEnabled ? "listening" : "idle";
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect || this.reconnectTimer) return;

    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.shouldReconnect = false;
      this.closeTransport();
      this.stopMicrophone();
      this.fail("The realtime connection was lost. Please reconnect.");
      return;
    }

    const delay = RECONNECT_DELAYS_MS[this.reconnectAttempts];
    this.reconnectAttempts += 1;
    this.setConnectionStatus("reconnecting");
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.establishConnection(true).catch((error) => {
        this.options.onError?.(
          error instanceof Error ? error.message : "Reconnect failed.",
        );
        this.scheduleReconnect();
      });
    }, delay);
  }

  private closeTransport() {
    this.requestController?.abort();
    this.requestController = null;

    if (this.dataChannel) {
      this.dataChannel.onclose = null;
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.ontrack = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.srcObject = null;
      this.audioElement = null;
    }
  }

  private stopMicrophone() {
    for (const track of this.microphoneStream?.getTracks() ?? []) {
      track.onended = null;
      track.stop();
    }
    this.microphoneStream = null;
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private fail(message: string) {
    this.setConnectionStatus("error");
    this.setVoiceStatus("idle");
    this.options.onError?.(message);
  }

  private setConnectionStatus(status: RealtimeConnectionStatus) {
    this.options.onConnectionStatusChange?.(status);
  }

  private setVoiceStatus(status: RealtimeVoiceStatus) {
    this.voiceStatus = status;
    this.options.onVoiceStatusChange?.(status);
  }
}
