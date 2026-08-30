"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PathwisseRealtimeClient } from "@/lib/realtime/realtime-client";
import { executePathwisseTool } from "@/lib/tools/pathwisse-tools";
import type {
  RealtimeConnectionStatus,
  RealtimeVoiceStatus,
} from "@/types";

export interface UsePathwisseVoiceResult {
  connect: () => Promise<void>;
  disconnect: () => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
  mute: () => void;
  unmute: () => void;
  sendText: (text: string) => void;
  connectionStatus: RealtimeConnectionStatus;
  voiceStatus: RealtimeVoiceStatus;
  transcript: string;
  assistantMessage: string;
  error: string | null;
}

export function usePathwisseVoice(): UsePathwisseVoiceResult {
  const clientRef = useRef<PathwisseRealtimeClient | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<RealtimeConnectionStatus>("disconnected");
  const [voiceStatus, setVoiceStatus] =
    useState<RealtimeVoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [assistantMessage, setAssistantMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = new PathwisseRealtimeClient({
      onConnectionStatusChange: (status) => {
        setConnectionStatus(status);
        if (status !== "error") setError(null);
      },
      onVoiceStatusChange: setVoiceStatus,
      onTranscriptChange: setTranscript,
      onAssistantMessageChange: setAssistantMessage,
      onError: setError,
      onFunctionCall: executePathwisseTool,
    });
    clientRef.current = client;

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    await clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    await clientRef.current?.startListening();
  }, []);

  const stopListening = useCallback(() => {
    clientRef.current?.stopListening();
  }, []);

  const mute = useCallback(() => clientRef.current?.mute(), []);
  const unmute = useCallback(() => clientRef.current?.unmute(), []);
  const sendText = useCallback((text: string) => {
    try {
      setError(null);
      clientRef.current?.sendText(text);
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "The message could not be sent.",
      );
    }
  }, []);

  return {
    connect,
    disconnect,
    startListening,
    stopListening,
    mute,
    unmute,
    sendText,
    connectionStatus,
    voiceStatus,
    transcript,
    assistantMessage,
    error,
  };
}
