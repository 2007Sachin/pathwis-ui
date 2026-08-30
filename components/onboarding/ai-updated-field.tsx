"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Sparkle } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import {
  useAiUiFeedbackStore,
  type AiUpdatedField as AiUpdatedFieldName,
  type AiUpdatedValue,
} from "@/stores/ai-ui-feedback-store";

const UPDATE_VISIBILITY_MS = 2_200;
const EVENT_FRESHNESS_MS = 6_000;

interface AiUpdatedFieldProps {
  field: AiUpdatedFieldName;
  value?: AiUpdatedValue;
  children: ReactNode;
  className?: string;
  showIndicator?: boolean;
}

const normaliseValue = (value: AiUpdatedValue) =>
  typeof value === "string" ? value.trim().toLocaleLowerCase() : value;

export function AiUpdatedField({
  field,
  value,
  children,
  className,
  showIndicator = true,
}: AiUpdatedFieldProps) {
  const events = useAiUiFeedbackStore((state) => state.events);
  const prefersReducedMotion = useReducedMotion();
  const elementRef = useRef<HTMLDivElement>(null);
  const handledEventId = useRef<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const latestMatchingEvent = [...events].reverse().find((event) => {
    if (event.field !== field) return false;
    if (value === undefined) return true;

    return event.values?.some(
      (eventValue) => normaliseValue(eventValue) === normaliseValue(value),
    );
  });

  useEffect(() => {
    if (
      !latestMatchingEvent ||
      handledEventId.current === latestMatchingEvent.id ||
      Date.now() - latestMatchingEvent.createdAt > EVENT_FRESHNESS_MS
    ) {
      return;
    }

    handledEventId.current = latestMatchingEvent.id;
    setIsActive(true);

    const element = elementRef.current;
    const isLatestUpdate = events.at(-1)?.id === latestMatchingEvent.id;
    if (element && isLatestUpdate) {
      const bounds = element.getBoundingClientRect();
      const isOutsideComfortableViewport =
        bounds.top < 96 || bounds.bottom > window.innerHeight - 112;

      if (isOutsideComfortableViewport) {
        element.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "center",
        });
      }
    }

    const timeout = window.setTimeout(
      () => setIsActive(false),
      UPDATE_VISIBILITY_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [events, latestMatchingEvent, prefersReducedMotion]);

  return (
    <motion.div
      ref={elementRef}
      className={cn("relative min-w-0 rounded-2xl", className)}
      animate={
        isActive && !prefersReducedMotion
          ? {
              scale: [1, 1.008, 1],
              boxShadow: [
                "0 0 0 0 rgb(36 70 155 / 0)",
                "0 0 0 3px rgb(36 70 155 / 0.22)",
                "0 0 0 0 rgb(36 70 155 / 0)",
              ],
            }
          : { scale: 1, boxShadow: "0 0 0 0 rgb(36 70 155 / 0)" }
      }
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      data-ai-updated={isActive ? "true" : undefined}
    >
      {children}

      <AnimatePresence initial={false}>
        {isActive && showIndicator && (
          <motion.span
            role="status"
            className="pointer-events-none absolute -top-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.03em] whitespace-nowrap text-primary shadow-[0_6px_18px_rgb(36_70_155/0.12)]"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -2 }}
          >
            <Sparkle aria-hidden="true" className="size-3" weight="fill" />
            Updated by Pathwisse AI
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
