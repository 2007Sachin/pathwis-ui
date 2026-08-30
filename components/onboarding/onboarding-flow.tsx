"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { CareerIntentStep } from "@/components/onboarding/career-intent-step";
import { GoalStep } from "@/components/onboarding/goal-step";
import { CareerDiscoveryStep } from "@/components/onboarding/career-discovery-step";
import { CareerMatchesStep } from "@/components/onboarding/career-matches-step";
import { RoadmapStep } from "@/components/onboarding/roadmap-step";
import { UnlockJourneyStep } from "@/components/onboarding/unlock-journey-step";
import { LearnerProfileStep } from "@/components/onboarding/learner-profile-step";
import { LearningPreferencesStep } from "@/components/onboarding/learning-preferences-step";
import { WelcomeScreen } from "@/components/onboarding/welcome-screen";
import { PathwisseVoiceAssistant } from "@/components/voice/pathwisse-voice-assistant";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function OnboardingFlow() {
  const searchParams = useSearchParams();
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);

  useEffect(() => {
    const requestedStep = Number(searchParams.get("step"));

    if (Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= 9) {
      setCurrentStep(requestedStep);
    }
  }, [searchParams, setCurrentStep]);

  let screen = <WelcomeScreen />;

  if (currentStep === 2) screen = <GoalStep />;
  if (currentStep === 3) screen = <LearnerProfileStep />;
  if (currentStep === 4) screen = <CareerIntentStep />;
  if (currentStep === 5) screen = <CareerDiscoveryStep />;
  if (currentStep === 6) screen = <CareerMatchesStep />;
  if (currentStep === 7) screen = <LearningPreferencesStep />;
  if (currentStep === 8) screen = <RoadmapStep />;
  if (currentStep >= 9) screen = <UnlockJourneyStep />;

  return (
    <>
      {screen}
      <PathwisseVoiceAssistant />
    </>
  );
}
