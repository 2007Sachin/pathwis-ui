"use client";

import { create } from "zustand";

import type { OnboardingProfile } from "@/types";

export type AiUpdatedField = keyof OnboardingProfile;
export type AiUpdatedValue = string | number;

export interface AiFieldUpdateEvent {
  id: number;
  field: AiUpdatedField;
  values?: AiUpdatedValue[];
  createdAt: number;
}

interface AiUiFeedbackState {
  events: AiFieldUpdateEvent[];
  announceUpdate: (field: AiUpdatedField, values?: AiUpdatedValue[]) => void;
}

let nextEventId = 0;
const MAX_RETAINED_EVENTS = 24;

export const useAiUiFeedbackStore = create<AiUiFeedbackState>((set) => ({
  events: [],
  announceUpdate: (field, values) =>
    set((state) => ({
      events: [
        ...state.events.slice(-(MAX_RETAINED_EVENTS - 1)),
        {
          id: ++nextEventId,
          field,
          values,
          createdAt: Date.now(),
        },
      ],
    })),
}));

// Voice tools call this after a successful Zustand mutation. Manual controls do
// not, which keeps AI attribution accurate while both paths share profile state.
export const announceAiUiUpdate = (
  field: AiUpdatedField,
  values?: AiUpdatedValue[],
) => useAiUiFeedbackStore.getState().announceUpdate(field, values);
