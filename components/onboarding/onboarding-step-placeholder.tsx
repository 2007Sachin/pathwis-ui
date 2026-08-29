"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { VoiceAssistantFloat } from "@/components/voice/voice-assistant-float";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function OnboardingStepPlaceholder({ step }: { step: number }) {
  const router = useRouter();
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);

  const goBack = () => {
    const previousStep = Math.max(1, step - 1);
    setCurrentStep(previousStep);
    router.push(previousStep === 1 ? "/onboarding" : `/onboarding?step=${previousStep}`);
  };

  return (
    <main className="min-h-[100dvh] bg-background pb-44 text-foreground sm:pb-40">
      <OnboardingHeader step={step} label="Coming next" />
      <div className="mx-auto w-full max-w-[1240px] px-5 pt-16 sm:px-8 lg:px-12">
        <section className="max-w-2xl rounded-[1.75rem] border border-border bg-card p-7 sm:p-10">
          <p className="text-sm font-semibold text-primary">Onboarding {step}/8</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            The next onboarding screen is ready to be added.
          </h1>
          <p className="mt-4 leading-7 text-muted-foreground">
            Your progress has been saved in the shared Pathwisse onboarding state.
          </p>
          <Button variant="outline" size="lg" className="mt-7 rounded-xl" onClick={goBack}>
            <ArrowLeft aria-hidden="true" className="mr-2 size-4" weight="bold" />
            Back
          </Button>
        </section>
      </div>
      <VoiceAssistantFloat message="I am ready to guide you through the next question." />
    </main>
  );
}
