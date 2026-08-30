"use client";

import { type FormEvent, useState } from "react";
import {
  ArrowsInSimple,
  ChatText,
  Keyboard,
  Microphone,
  MicrophoneSlash,
  PaperPlaneTilt,
  Stop,
  WarningCircle,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathwisseVoice } from "@/hooks/use-pathwisse-voice";
import { useOnboardingStore } from "@/stores/onboarding-store";

type VoiceAssistantState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "muted"
  | "error";

const statusCopy: Record<VoiceAssistantState, string> = {
  idle: "Ready when you are",
  connecting: "Connecting...",
  listening: "Listening...",
  thinking: "Thinking...",
  speaking: "Speaking...",
  muted: "Microphone muted",
  error: "Connection error",
};

const stepPrompts: Record<number, string> = {
  1: "Hi! I can guide you through onboarding in about 2–3 minutes.",
  2: "What would you like Pathwisse to help you achieve?",
  3: "Tell me what you do and which skills you use. I’ll help fill this in.",
  4: "Tell me how clear your target career is, and we’ll choose the right path.",
  5: "Share the work and industries that interest you. I’ll narrow down your matches.",
  6: "I can explain your strongest matches and help you choose between them.",
  7: "Tell me how much time you have, how you like to learn, and the pace that feels right.",
  8: "Your roadmap is ready. Ask me to explain any stage or skill gap.",
  9: "Your journey is ready to activate. I can answer questions about either plan.",
};

const waveformBars = [0.45, 0.75, 0.55, 1, 0.65, 0.85, 0.5, 0.95, 0.6, 0.8, 0.4, 0.7];

function Waveform({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  return (
    <div className="flex h-10 items-center justify-center gap-1" aria-label={active ? "Voice activity" : "Voice inactive"}>
      {waveformBars.map((height, index) => (
        <motion.span
          key={`${height}-${index}`}
          className="h-7 w-1 rounded-full bg-primary"
          style={{ scaleY: height }}
          animate={active && !reducedMotion
            ? { scaleY: [height, Math.min(1, height + 0.35), 0.3, height] }
            : { scaleY: height }}
          transition={active && !reducedMotion
            ? { duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.055 }
            : { duration: 0.2 }}
        />
      ))}
    </div>
  );
}

export function PathwisseVoiceAssistant() {
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const prefersReducedMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const {
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
  } = usePathwisseVoice();
  const isConnecting = ["requesting_permission", "connecting", "reconnecting"].includes(connectionStatus);
  const voiceState: VoiceAssistantState = error || connectionStatus === "error"
    ? "error"
    : isConnecting
      ? "connecting"
      : voiceStatus;
  const currentAiMessage = assistantMessage || stepPrompts[currentStep] || stepPrompts[1];
  const isWaveformActive = voiceState === "listening" || voiceState === "speaking";
  const canStop = connectionStatus !== "disconnected";
  const isListening = connectionStatus === "connected" && voiceStatus === "listening";

  const startVoice = async () => {
    setIsExpanded(true);
    setIsTyping(false);
    if (connectionStatus === "disconnected" || connectionStatus === "error") {
      await connect();
      return;
    }
    await startListening();
  };

  const toggleMute = () => {
    if (voiceStatus === "muted") unmute();
    else mute();
  };

  const submitTypedMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = typedMessage.trim();
    if (!message) return;

    if (connectionStatus !== "connected") await connect();
    sendText(message);
    setTypedMessage("");
  };

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 left-4 z-[60] flex justify-end sm:right-6 sm:bottom-6 sm:left-auto">
      <AnimatePresence mode="wait" initial={false}>
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            type="button"
            onClick={() => setIsExpanded(true)}
            className="pointer-events-auto flex h-14 items-center gap-3 rounded-2xl border border-brand-200 bg-card px-4 text-left shadow-[0_16px_42px_rgb(36_70_155/0.16)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            aria-label="Open Pathwisse voice assistant"
          >
            <span className="relative grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Microphone aria-hidden="true" className="size-5" weight="duotone" />
              {voiceState !== "idle" && (
                <span className={`absolute -top-1 -right-1 size-3 rounded-full border-2 border-card ${voiceState === "error" ? "bg-destructive" : "bg-brand-400"}`} />
              )}
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">Ask Pathwisse</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">Voice or type</span>
            </span>
          </motion.button>
        ) : (
          <motion.aside
            key="expanded"
            aria-label="Pathwisse AI voice assistant"
            className="pointer-events-auto flex max-h-[min(680px,calc(100dvh-2rem))] w-full flex-col overflow-hidden rounded-[1.5rem] border border-brand-200 bg-card shadow-[0_22px_65px_rgb(24_45_94/0.2)] sm:w-[410px]"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
          >
            <header className="flex items-center justify-between gap-4 border-b border-border bg-brand-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Microphone aria-hidden="true" className="size-5" weight="duotone" />
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-[-0.01em]">Pathwisse AI</p>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={voiceState}
                      className={`mt-0.5 text-xs ${voiceState === "error" ? "text-destructive" : "text-muted-foreground"}`}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {statusCopy[voiceState]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Minimize Pathwisse AI"
              >
                <ArrowsInSimple aria-hidden="true" className="size-4" weight="bold" />
              </button>
            </header>

            <div className="overflow-y-auto px-5 py-5">
              <div className={`rounded-2xl border p-4 transition-colors ${voiceState === "error" ? "border-destructive/30 bg-destructive/5" : "border-brand-200 bg-brand-50"}`}>
                {voiceState === "error" ? (
                  <div className="flex min-h-10 items-center justify-center gap-2 text-sm font-medium text-destructive">
                    <WarningCircle aria-hidden="true" className="size-5" weight="duotone" />
                    {error || "The realtime connection is unavailable. Try again."}
                  </div>
                ) : (
                  <Waveform active={isWaveformActive} reducedMotion={Boolean(prefersReducedMotion)} />
                )}
              </div>

              <div className="mt-4 grid gap-3">
                <section className="rounded-xl border border-border p-3.5" aria-labelledby="latest-user-heading">
                  <p id="latest-user-heading" className="text-[0.65rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">You said</p>
                  <p className={`mt-1.5 text-sm leading-5 ${transcript ? "text-foreground" : "text-muted-foreground"}`}>
                    {transcript || "Your live transcript will appear here."}
                  </p>
                </section>
                <section className="rounded-xl border border-brand-200 bg-brand-50 p-3.5" aria-labelledby="latest-ai-heading">
                  <p id="latest-ai-heading" className="flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.1em] text-primary uppercase">
                    <ChatText aria-hidden="true" className="size-3.5" weight="duotone" />
                    Pathwisse AI
                  </p>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={currentAiMessage}
                      className="mt-1.5 text-sm leading-5 text-foreground"
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {currentAiMessage}
                    </motion.p>
                  </AnimatePresence>
                </section>
              </div>

              <AnimatePresence initial={false}>
                {isTyping && (
                  <motion.form
                    className="mt-4 flex gap-2"
                    onSubmit={submitTypedMessage}
                    initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label htmlFor="pathwisse-message" className="sr-only">Type a message to Pathwisse AI</label>
                    <Input id="pathwisse-message" value={typedMessage} onChange={(event) => setTypedMessage(event.target.value)} placeholder="Type your answer..." className="h-11" />
                    <Button type="submit" className="size-11 rounded-xl px-0" disabled={!typedMessage.trim()} aria-label="Send typed message">
                      <PaperPlaneTilt aria-hidden="true" className="size-4" weight="fill" />
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="mt-5 flex items-center justify-center gap-3">
                <motion.button
                  type="button"
                  onClick={() => {
                    if (isListening) stopListening();
                    else void startVoice();
                  }}
                  disabled={isConnecting}
                  className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_24px_rgb(36_70_155/0.2)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                  aria-label={isListening ? "Stop listening" : "Start voice conversation"}
                >
                  {isListening ? <MicrophoneSlash aria-hidden="true" className="size-6" weight="fill" /> : <Microphone aria-hidden="true" className="size-6" weight="fill" />}
                </motion.button>
                <button type="button" onClick={disconnect} disabled={!canStop} className="grid size-11 place-items-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40" aria-label="Disconnect voice assistant">
                  <Stop aria-hidden="true" className="size-4" weight="fill" />
                </button>
                <button type="button" onClick={toggleMute} disabled={connectionStatus !== "connected"} className={`grid size-11 place-items-center rounded-xl border transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 ${voiceState === "muted" ? "border-primary bg-brand-50 text-primary" : "border-border bg-card text-foreground hover:bg-muted"}`} aria-label={voiceState === "muted" ? "Unmute microphone" : "Mute microphone"}>
                  {voiceState === "muted" ? <MicrophoneSlash aria-hidden="true" className="size-4" weight="fill" /> : <Microphone aria-hidden="true" className="size-4" weight="duotone" />}
                </button>
                <button type="button" onClick={() => setIsTyping((current) => !current)} className={`grid size-11 place-items-center rounded-xl border transition-colors focus-visible:ring-2 focus-visible:ring-ring ${isTyping ? "border-primary bg-brand-50 text-primary" : "border-border bg-card text-foreground hover:bg-muted"}`} aria-label={isTyping ? "Hide keyboard input" : "Type a message"} aria-expanded={isTyping}>
                  <Keyboard aria-hidden="true" className="size-4" weight="duotone" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <p className="text-[0.65rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">OpenAI Realtime</p>
                {voiceState === "error" && (
                  <button type="button" onClick={() => void startVoice()} className="text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                    Reconnect
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
