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
import { WelcomeScreen } from "@/components/onboarding/welcome-screen";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function OnboardingFlow() {
  const searchParams = useSearchParams();
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);

  useEffect(() => {
    const requestedStep = Number(searchParams.get("step"));

    if (Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= 8) {
      setCurrentStep(requestedStep);
    }
  }, [searchParams, setCurrentStep]);

  if (currentStep === 2) {
    return <GoalStep />;
  }

  if (currentStep === 3) {
    return <LearnerProfileStep />;
  }

  if (currentStep === 4) {
    return <CareerIntentStep />;
  }

  if (currentStep === 5) {
    return <CareerDiscoveryStep />;
  }

  if (currentStep === 6) {
    return <CareerMatchesStep />;
  }

  if (currentStep === 7) {
    return <RoadmapStep />;
  }

  if (currentStep >= 8) {
    return <UnlockJourneyStep />;
  }

  return <WelcomeScreen />;
}
