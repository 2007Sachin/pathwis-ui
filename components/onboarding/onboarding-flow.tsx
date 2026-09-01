"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { CareerIntentStep } from "@/components/onboarding/career-intent-step";
import { GoalStep } from "@/components/onboarding/goal-step";
import { CareerMatchesStep } from "@/components/onboarding/career-matches-step";
import { RoadmapStep } from "@/components/onboarding/roadmap-step";
import { UnlockJourneyStep } from "@/components/onboarding/unlock-journey-step";
import { LearnerProfileStep } from "@/components/onboarding/learner-profile-step";
import { LearningPreferencesStep } from "@/components/onboarding/learning-preferences-step";
import { PathwisseVoiceAssistant } from "@/components/voice/pathwisse-voice-assistant";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function OnboardingFlow() {
  const searchParams = useSearchParams();
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);

  useEffect(() => {
    const requestedStep = Number(searchParams.get("step"));

    if (Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= 7) {
      setCurrentStep(requestedStep);
    }
  }, [searchParams, setCurrentStep]);

  let screen = <GoalStep />;
  if (currentStep === 2) screen = <LearnerProfileStep />;
  if (currentStep === 3) screen = <CareerIntentStep />;
  if (currentStep === 4) screen = <CareerMatchesStep />;
  if (currentStep === 5) screen = <LearningPreferencesStep />;
  if (currentStep === 6) screen = <RoadmapStep />;
  if (currentStep >= 7) screen = <UnlockJourneyStep />;

  return (
    <>
      {screen}
      <PathwisseVoiceAssistant />
    </>
  );
}
