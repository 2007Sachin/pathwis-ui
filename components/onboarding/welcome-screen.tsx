"use client";

import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  Compass,
  Flask,
  Path,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboarding-store";

const benefits = [
  { label: "AI career recommendations", icon: Compass },
  { label: "Personalised skill roadmap", icon: Path },
  { label: "Projects + practice labs", icon: Flask },
  { label: "Career readiness guidance", icon: Briefcase },
];

export function WelcomeScreen() {
  const router = useRouter();
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);

  const continueToStepTwo = (mode?: "manual") => {
    setCurrentStep(2);
    router.push(mode ? "/onboarding?step=2&mode=manual" : "/onboarding?step=2");
  };

  return (
    <main className="min-h-[100dvh] bg-background pb-44 text-foreground sm:pb-40">
      <OnboardingHeader step={1} label="Welcome" />

      <div className="mx-auto w-full max-w-[1240px] px-5 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
        <section className="max-w-4xl" aria-labelledby="welcome-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Welcome to Pathwisse
          </p>
          <h1
            id="welcome-heading"
            className="mt-5 max-w-[820px] text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-balance sm:text-5xl lg:text-[3.75rem]"
          >
            Build a career path around you
          </h1>
          <p className="mt-6 max-w-[720px] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            A short AI-guided onboarding helps us understand your goal, experience and preferred learning style.
          </p>
        </section>

        <section
          aria-labelledby="roadmap-heading"
          className="mt-10 overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_16px_50px_rgb(36_70_155/0.06)] sm:mt-12"
        >
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-6 sm:p-9 lg:p-12">
              <h2
                id="roadmap-heading"
                className="max-w-[600px] text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl lg:text-[2.5rem]"
              >
                Your roadmap. Your pace. Your next role.
              </h2>
              <p className="mt-5 max-w-[610px] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                Answer a few questions and Pathwisse will recommend the right career, map your skill gaps and create a personalised learning journey.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-xl px-6 sm:w-auto"
                  onClick={() => continueToStepTwo()}
                >
                  Get started
                  <ArrowRight aria-hidden="true" className="ml-2 size-4" weight="bold" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-xl px-6 sm:w-auto"
                  onClick={() => continueToStepTwo("manual")}
                >
                  Explore on my own
                </Button>
              </div>
            </div>

            <div className="border-t border-border bg-brand-50/75 p-6 sm:p-9 lg:border-t-0 lg:border-l lg:p-12">
              <p className="text-sm font-semibold text-foreground">Built around your goals</p>
              <ul className="mt-6 grid gap-3.5" aria-label="Pathwisse onboarding benefits">
                {benefits.map(({ label, icon: Icon }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 rounded-xl border border-brand-100 bg-card px-4 py-3.5"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-primary">
                      <Icon aria-hidden="true" className="size-[1.125rem]" weight="duotone" />
                    </span>
                    <span className="text-sm font-medium text-foreground sm:text-base">{label}</span>
                    <CheckCircle
                      aria-hidden="true"
                      className="ml-auto size-5 shrink-0 text-primary"
                      weight="fill"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

    </main>
  );
}
