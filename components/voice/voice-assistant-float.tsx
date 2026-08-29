"use client";

import { MicrophoneStage } from "@phosphor-icons/react";

interface VoiceAssistantFloatProps {
  message: string;
}

export function VoiceAssistantFloat({ message }: VoiceAssistantFloatProps) {
  return (
    <aside
      aria-label="Pathwisse AI voice assistant"
      className="fixed right-4 bottom-4 left-4 rounded-2xl border border-border bg-card p-4 shadow-[0_14px_40px_rgb(36_70_155/0.12)] sm:right-6 sm:bottom-6 sm:left-auto sm:w-[360px] sm:p-5"
    >
      <div className="flex items-start gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <MicrophoneStage aria-hidden="true" className="size-5" weight="duotone" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-sm font-semibold tracking-[-0.01em] text-foreground">Pathwisse AI</p>
            <p className="text-xs text-muted-foreground">Voice assistant</p>
          </div>
          <p className="mt-2 text-sm leading-5 text-muted-foreground">{message}</p>
        </div>
      </div>
    </aside>
  );
}
