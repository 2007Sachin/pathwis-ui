import type { Metadata } from "next";
import { Suspense } from "react";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Set up your Pathwisse learning and career profile.",
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>
      <OnboardingFlow />
    </Suspense>
  );
}

function OnboardingLoading() {
  return (
    <main className="min-h-[100dvh] bg-background text-foreground">
      <OnboardingHeader step={1} label="Welcome" />
      <div className="mx-auto w-full max-w-[1240px] px-5 pt-12 sm:px-8 sm:pt-16 lg:px-12">
        <div className="animate-pulse" aria-label="Loading onboarding">
          <div className="h-3 w-36 rounded bg-brand-100" />
          <div className="mt-6 h-12 max-w-2xl rounded-xl bg-muted" />
          <div className="mt-5 h-6 max-w-xl rounded-lg bg-muted" />
          <div className="mt-12 h-80 rounded-[1.75rem] border border-border bg-card" />
        </div>
      </div>
    </main>
  );
}
