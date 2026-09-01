"use client";

import {
  ArrowRight,
  ArrowsLeftRight,
  Binoculars,
  Briefcase,
  Hammer,
  Target,
  TrendUp,
  type Icon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { AiUpdatedField } from "@/components/onboarding/ai-updated-field";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { OnboardingGoal } from "@/types";

interface GoalOption {
  value: Exclude<OnboardingGoal, null>;
  title: string;
  description: string;
  icon: Icon;
}

const goalOptions: GoalOption[] = [
  {
    value: "first_job",
    title: "Get my first job",
    description: "Build the skills, proof of work and confidence to start your career.",
    icon: Briefcase,
  },
  {
    value: "career_switch",
    title: "Switch careers",
    description: "Translate your experience and move into a role that fits your next chapter.",
    icon: ArrowsLeftRight,
  },
  {
    value: "upskill",
    title: "Upskill for my current role",
    description: "Strengthen the skills that help you perform, grow and take on more responsibility.",
    icon: TrendUp,
  },
  {
    value: "specific_job",
    title: "Prepare for a specific job",
    description: "Focus your learning around the exact requirements of a target role.",
    icon: Target,
  },
  {
    value: "career_discovery",
    title: "Explore career options",
    description: "Discover paths that match your interests, strengths and preferred way of working.",
    icon: Binoculars,
  },
  {
    value: "practical_skills",
    title: "Build practical skills",
    description: "Learn by doing through guided projects, exercises and practice labs.",
    icon: Hammer,
  },
];

export function GoalStep() {
  const router = useRouter();
  const selectedGoal = useOnboardingStore((state) => state.goal);
  const setGoal = useOnboardingStore((state) => state.setGoal);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);

  const continueToStepThree = () => {
    if (!selectedGoal) return;
    setCurrentStep(2);
    router.push("/onboarding?step=2");
  };

  return (
    <main className="min-h-[100dvh] bg-background pb-44 text-foreground sm:pb-40">
      <OnboardingHeader step={1} label="Your goal" />

      <div className="mx-auto w-full max-w-[1240px] px-5 pt-10 sm:px-8 sm:pt-14 lg:px-12 lg:pt-16">
        <section aria-labelledby="goal-heading">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">Choose your outcome</p>
            <h1 id="goal-heading" className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-balance sm:text-5xl">
              Build a career path around you
            </h1>
            <p className="mt-5 max-w-[700px] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Tell Pathwisse what you want to achieve and we’ll personalise your journey.
            </p>
          </div>

          <div role="radiogroup" aria-label="Onboarding goal" className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {goalOptions.map(({ value, title, description, icon: Icon }) => {
              const isSelected = selectedGoal === value;

              return (
                <AiUpdatedField
                  key={value}
                  field="goal"
                  value={value}
                  className="h-full"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setGoal(value)}
                    className={`group h-full min-h-[178px] w-full rounded-2xl border p-5 text-left shadow-[0_8px_24px_rgb(36_70_155/0.035)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-6 ${
                      isSelected
                        ? "scale-[1.012] border-primary bg-brand-50 shadow-[0_14px_34px_rgb(36_70_155/0.12)]"
                        : "border-border bg-card hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_12px_30px_rgb(36_70_155/0.08)]"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-4">
                      <span className={`grid size-11 place-items-center rounded-xl transition-colors duration-200 ${isSelected ? "bg-primary text-primary-foreground" : "bg-brand-50 text-primary group-hover:bg-brand-100"}`}>
                        <Icon aria-hidden="true" className="size-5" weight="duotone" />
                      </span>
                      <span aria-hidden="true" className={`grid size-6 place-items-center rounded-full border transition-colors duration-200 ${isSelected ? "border-primary bg-primary" : "border-input bg-card"}`}>
                        <span className={`size-2 rounded-full bg-primary-foreground transition-transform duration-200 ${isSelected ? "scale-100" : "scale-0"}`} />
                      </span>
                    </span>
                    <span className="mt-5 block text-base font-semibold tracking-[-0.02em] text-foreground sm:text-lg">{title}</span>
                    <span className="mt-2 block text-sm leading-6 text-muted-foreground">{description}</span>
                  </button>
                </AiUpdatedField>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span />
            <Button size="lg" className="h-12 w-full rounded-xl px-6 sm:w-auto" disabled={!selectedGoal} onClick={continueToStepThree}>
              Continue
              <ArrowRight aria-hidden="true" className="ml-2 size-4" weight="bold" />
            </Button>
          </div>
        </section>
      </div>

    </main>
  );
}
