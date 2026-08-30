"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Factory,
  Heartbeat,
  Lightbulb,
  SpinnerGap,
  Sparkle,
  type Icon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { AiUpdatedField } from "@/components/onboarding/ai-updated-field";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import {
  CAREER_PRIORITY_OPTIONS,
  INDUSTRY_OPTIONS,
  WORK_INTEREST_OPTIONS,
} from "@/lib/career/discovery-options";
import { recommendCareersLocally } from "@/lib/career/recommendation-engine";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type {
  CareerOrientation,
  CareerRecommendationProvider,
} from "@/types";

const orientations: Array<{ value: Exclude<CareerOrientation, null>; label: string }> = [
  { value: "business", label: "Business" },
  { value: "balanced", label: "Balanced" },
  { value: "technical", label: "Technical" },
];

interface DiscoverySectionProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: Icon;
  children: React.ReactNode;
}

function DiscoverySection({ eyebrow, title, description, icon: Icon, children }: DiscoverySectionProps) {
  return (
    <section className="rounded-[1.5rem] border border-border bg-card p-6 sm:p-8" aria-labelledby={`${eyebrow}-heading`}>
      <div className="flex gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary">
          <Icon aria-hidden="true" className="size-5" weight="duotone" />
        </span>
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">{eyebrow}</p>
          <h2 id={`${eyebrow}-heading`} className="mt-1.5 text-lg font-semibold tracking-[-0.02em] sm:text-xl">{title}</h2>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

interface ChoiceGridProps {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

function ChoiceGrid({ label, options, selected, onChange }: ChoiceGridProps) {
  const toggle = (option: string) =>
    onChange(selected.includes(option) ? selected.filter((value) => value !== option) : [...selected, option]);

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label={label}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggle(option)}
            className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isSelected ? "border-primary bg-brand-50 text-primary shadow-[0_8px_20px_rgb(36_70_155/0.08)]" : "border-border bg-card text-foreground hover:border-brand-300 hover:bg-brand-50"}`}
          >
            {option}
            <span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded-md border ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input text-transparent"}`}>
              <Check className="size-3" weight="bold" />
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface CareerDiscoveryStepProps {
  recommendCareers?: CareerRecommendationProvider;
}

export function CareerDiscoveryStep({ recommendCareers = recommendCareersLocally }: CareerDiscoveryStepProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const interests = useOnboardingStore((state) => state.interests);
  const goal = useOnboardingStore((state) => state.goal);
  const status = useOnboardingStore((state) => state.status);
  const currentRole = useOnboardingStore((state) => state.currentRole);
  const skills = useOnboardingStore((state) => state.skills);
  const orientation = useOnboardingStore((state) => state.orientation);
  const selectedIndustries = useOnboardingStore((state) => state.industries);
  const priorities = useOnboardingStore((state) => state.careerPriorities);
  const setInterests = useOnboardingStore((state) => state.setInterests);
  const setOrientation = useOnboardingStore((state) => state.setOrientation);
  const setIndustries = useOnboardingStore((state) => state.setIndustries);
  const setCareerPriorities = useOnboardingStore((state) => state.setCareerPriorities);
  const setRecommendedCareers = useOnboardingStore((state) => state.setRecommendedCareers);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);

  const canShowMatches =
    interests.length > 0 &&
    orientation !== null &&
    selectedIndustries.length > 0 &&
    priorities.length > 0;

  const goBack = () => {
    setCurrentStep(4);
    router.push("/onboarding?step=4");
  };

  const showMatches = async () => {
    if (!canShowMatches || orientation === null || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const recommendations = await recommendCareers({
        goal,
        status,
        currentRole,
        skills,
        interests,
        orientation,
        industries: selectedIndustries,
      });
      setRecommendedCareers(recommendations);
      setCurrentStep(6);
      router.push("/onboarding?step=6");
    } catch {
      setError("We could not build your matches just now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-background pb-44 text-foreground sm:pb-40">
      <OnboardingHeader step={5} label="Career discovery" />

      <div className="mx-auto w-full max-w-[1120px] px-5 pt-10 sm:px-8 sm:pt-14 lg:px-12 lg:pt-16">
        <section aria-labelledby="discovery-heading">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">Find your fit</p>
            <h1 id="discovery-heading" className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-balance sm:text-5xl">
              Let&apos;s narrow down what fits you.
            </h1>
            <p className="mt-5 max-w-[700px] text-base leading-7 text-muted-foreground sm:text-lg">
              Tell us what energises you and what you want from your next role. Choose as many as feel relevant.
            </p>
          </div>

          <div className="mt-10 grid gap-5">
            <DiscoverySection eyebrow="Question 1" title="What kind of work do you enjoy?" description="Select every type of work you would like to do more often." icon={Lightbulb}>
              <AiUpdatedField field="interests" className="rounded-xl">
                <ChoiceGrid label="Work you enjoy" options={WORK_INTEREST_OPTIONS} selected={interests} onChange={setInterests} />
              </AiUpdatedField>
            </DiscoverySection>

            <DiscoverySection eyebrow="Question 2" title="Your preferred orientation" description="Choose where you feel most comfortable today." icon={Sparkle}>
              <div role="radiogroup" aria-label="Preferred orientation" className="grid gap-3 sm:grid-cols-3">
                {orientations.map(({ value, label }) => {
                  const isSelected = orientation === value;
                  return (
                    <AiUpdatedField
                      key={value}
                      field="orientation"
                      value={value}
                      className="rounded-xl"
                    >
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setOrientation(value)}
                        className={`min-h-16 w-full rounded-xl border px-5 text-left text-sm font-semibold transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isSelected ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_rgb(36_70_155/0.15)]" : "border-border bg-card text-foreground hover:border-brand-300 hover:bg-brand-50"}`}
                      >
                        {label}
                      </button>
                    </AiUpdatedField>
                  );
                })}
              </div>
            </DiscoverySection>

            <DiscoverySection eyebrow="Question 3" title="Industries you are interested in" description="Pick the spaces you would be excited to learn about or work in." icon={Factory}>
              <AiUpdatedField field="industries" className="rounded-xl">
                <ChoiceGrid label="Industries of interest" options={INDUSTRY_OPTIONS} selected={selectedIndustries} onChange={setIndustries} />
              </AiUpdatedField>
            </DiscoverySection>

            <DiscoverySection eyebrow="Question 4" title="What matters most in your next role?" description="Select the outcomes and qualities you care about most." icon={Heartbeat}>
              <ChoiceGrid label="Career priorities" options={CAREER_PRIORITY_OPTIONS} selected={priorities} onChange={setCareerPriorities} />
            </DiscoverySection>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" size="lg" className="h-12 w-full rounded-xl px-5 sm:w-auto" onClick={goBack} disabled={isLoading}>
              <ArrowLeft aria-hidden="true" className="mr-2 size-4" weight="bold" />
              Back
            </Button>
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button size="lg" className="h-12 w-full rounded-xl px-6 sm:w-auto" disabled={!canShowMatches || isLoading} onClick={showMatches}>
                {isLoading ? <SpinnerGap aria-hidden="true" className="mr-2 size-4 animate-spin" weight="bold" /> : <Briefcase aria-hidden="true" className="mr-2 size-4" weight="duotone" />}
                {isLoading ? "Finding matches..." : "Show my matches"}
                {!isLoading && <ArrowRight aria-hidden="true" className="ml-2 size-4" weight="bold" />}
              </Button>
            </div>
          </div>
        </section>
      </div>

    </main>
  );
}
