"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  Clock,
  Gauge,
  Lightning,
  PlayCircle,
  PuzzlePiece,
  SquaresFour,
  Wrench,
  type Icon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { AiUpdatedField } from "@/components/onboarding/ai-updated-field";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { LearningPace } from "@/types";

const hourOptions = [
  { label: "2–3 hours", value: 3, description: "A light, steady weekly rhythm" },
  { label: "5 hours", value: 5, description: "About one hour each weekday" },
  { label: "8 hours", value: 8, description: "Focused progress across the week" },
  { label: "10+ hours", value: 10, description: "A faster, more immersive path" },
] as const;

const styleOptions: Array<{ label: string; icon: Icon; description: string }> = [
  { label: "Videos", icon: PlayCircle, description: "Learn through clear visual walkthroughs" },
  { label: "Reading", icon: BookOpenText, description: "Build depth with guides and references" },
  { label: "Hands-on projects", icon: Wrench, description: "Learn by creating real outcomes" },
  { label: "Practice exercises", icon: PuzzlePiece, description: "Reinforce concepts through repetition" },
  { label: "Mixed", icon: SquaresFour, description: "Use a balanced blend of every format" },
];

const paceOptions: Array<{
  label: string;
  value: Exclude<LearningPace, null>;
  icon: Icon;
  description: string;
}> = [
  { label: "Relaxed", value: "relaxed", icon: Gauge, description: "More breathing room between milestones" },
  { label: "Balanced", value: "balanced", icon: Clock, description: "Consistent progress at a sustainable pace" },
  { label: "Intensive", value: "intensive", icon: Lightning, description: "Move quickly with a focused schedule" },
];

function OptionCheck({ selected }: { selected: boolean }) {
  return (
    <span
      className={`grid size-6 shrink-0 place-items-center rounded-full border transition-colors ${
        selected ? "border-primary bg-primary text-primary-foreground" : "border-input text-transparent"
      }`}
    >
      <Check aria-hidden="true" className="size-3.5" weight="bold" />
    </span>
  );
}

export function LearningPreferencesStep() {
  const router = useRouter();
  const hoursPerWeek = useOnboardingStore((state) => state.hoursPerWeek);
  const learningStyles = useOnboardingStore((state) => state.learningStyles);
  const learningPace = useOnboardingStore((state) => state.learningPace);
  const setHoursPerWeek = useOnboardingStore((state) => state.setHoursPerWeek);
  const setLearningStyles = useOnboardingStore((state) => state.setLearningStyles);
  const setLearningPace = useOnboardingStore((state) => state.setLearningPace);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const generateRoadmap = useOnboardingStore((state) => state.generateRoadmap);
  const selectedStyle = learningStyles[0] ?? null;
  const isCanonicalHour = hourOptions.some(({ value }) =>
    value === 3 ? hoursPerWeek !== null && hoursPerWeek >= 2 && hoursPerWeek <= 3 : value === 10 ? hoursPerWeek !== null && hoursPerWeek >= 10 : hoursPerWeek === value,
  );
  const canContinue = hoursPerWeek !== null && learningStyles.length > 0 && learningPace !== null;

  const goBack = () => {
    setCurrentStep(6);
    router.push("/onboarding?step=6");
  };

  const buildRoadmap = () => {
    if (!canContinue) return;
    const roadmap = generateRoadmap();
    if (!roadmap) return;
    setCurrentStep(8);
    router.push("/onboarding?step=8");
  };

  return (
    <main className="min-h-[100dvh] bg-background pb-44 text-foreground sm:pb-40">
      <OnboardingHeader step={7} label="Learning preferences" />

      <div className="mx-auto w-full max-w-[1180px] px-5 pt-10 sm:px-8 sm:pt-14 lg:px-12 lg:pt-16">
        <section aria-labelledby="preferences-heading">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">Shape your learning plan</p>
            <h1 id="preferences-heading" className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-balance sm:text-5xl">
              How do you want to learn?
            </h1>
            <p className="mt-5 max-w-[720px] text-base leading-7 text-muted-foreground sm:text-lg">
              Choose a realistic commitment and the formats that work best for you. Pathwisse will adapt your roadmap around them.
            </p>
          </div>

          <div className="mt-10 grid gap-6">
            <section className="rounded-[1.65rem] border border-border bg-card p-6 sm:p-8" aria-labelledby="time-heading">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary">
                  <Clock aria-hidden="true" className="size-5" weight="duotone" />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">Weekly commitment</p>
                  <h2 id="time-heading" className="mt-1.5 text-xl font-semibold tracking-[-0.025em]">How much time can you spend each week?</h2>
                </div>
              </div>
              <div role="radiogroup" aria-labelledby="time-heading" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {hourOptions.map((option) => {
                  const selected = option.value === 3
                    ? hoursPerWeek !== null && hoursPerWeek >= 2 && hoursPerWeek <= 3
                    : option.value === 10
                      ? hoursPerWeek !== null && hoursPerWeek >= 10
                      : hoursPerWeek === option.value;
                  return (
                    <AiUpdatedField key={option.value} field="hoursPerWeek" value={option.value} className="h-full rounded-2xl">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setHoursPerWeek(option.value)}
                        className={`flex h-full min-h-32 w-full flex-col rounded-2xl border p-5 text-left transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${selected ? "border-primary bg-brand-50 shadow-[0_12px_28px_rgb(36_70_155/0.1)]" : "border-border bg-card hover:border-brand-300"}`}
                      >
                        <span className="flex w-full items-start justify-between gap-3">
                          <span className="text-lg font-semibold tracking-[-0.025em]">{option.label}</span>
                          <OptionCheck selected={selected} />
                        </span>
                        <span className="mt-3 text-sm leading-5 text-muted-foreground">{option.description}</span>
                      </button>
                    </AiUpdatedField>
                  );
                })}
                {hoursPerWeek !== null && !isCanonicalHour && (
                  <AiUpdatedField field="hoursPerWeek" value={hoursPerWeek} className="h-full rounded-2xl">
                    <button type="button" role="radio" aria-checked="true" className="flex h-full min-h-32 w-full flex-col rounded-2xl border border-primary bg-brand-50 p-5 text-left shadow-[0_12px_28px_rgb(36_70_155/0.1)]">
                      <span className="flex w-full items-start justify-between gap-3">
                        <span className="text-lg font-semibold tracking-[-0.025em]">{hoursPerWeek} hours</span>
                        <OptionCheck selected />
                      </span>
                      <span className="mt-3 text-sm leading-5 text-muted-foreground">Your custom weekly commitment</span>
                    </button>
                  </AiUpdatedField>
                )}
              </div>
            </section>

            <section className="rounded-[1.65rem] border border-border bg-card p-6 sm:p-8" aria-labelledby="style-heading">
              <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">Learning format</p>
              <h2 id="style-heading" className="mt-1.5 text-xl font-semibold tracking-[-0.025em]">Preferred learning style</h2>
              <div role="radiogroup" aria-labelledby="style-heading" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {styleOptions.map(({ label, icon: Icon, description }) => {
                  const selected = selectedStyle?.toLocaleLowerCase() === label.toLocaleLowerCase();
                  return (
                    <AiUpdatedField key={label} field="learningStyles" value={label} className="h-full rounded-2xl">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setLearningStyles([label])}
                        className={`flex h-full min-h-40 w-full flex-col rounded-2xl border p-5 text-left transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${selected ? "border-primary bg-brand-50 shadow-[0_12px_28px_rgb(36_70_155/0.1)]" : "border-border bg-card hover:border-brand-300"}`}
                      >
                        <span className="flex w-full items-start justify-between gap-3">
                          <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-primary"><Icon aria-hidden="true" className="size-5" weight="duotone" /></span>
                          <OptionCheck selected={selected} />
                        </span>
                        <span className="mt-4 font-semibold tracking-[-0.015em]">{label}</span>
                        <span className="mt-2 text-xs leading-5 text-muted-foreground">{description}</span>
                      </button>
                    </AiUpdatedField>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.65rem] border border-border bg-card p-6 sm:p-8" aria-labelledby="pace-heading">
              <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">Learning rhythm</p>
              <h2 id="pace-heading" className="mt-1.5 text-xl font-semibold tracking-[-0.025em]">Preferred pace</h2>
              <div role="radiogroup" aria-labelledby="pace-heading" className="mt-6 grid gap-3 md:grid-cols-3">
                {paceOptions.map(({ label, value, icon: Icon, description }) => {
                  const selected = learningPace === value;
                  return (
                    <AiUpdatedField key={value} field="learningPace" value={value} className="h-full rounded-2xl">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setLearningPace(value)}
                        className={`flex h-full min-h-32 w-full items-start gap-4 rounded-2xl border p-5 text-left transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${selected ? "border-primary bg-brand-50 shadow-[0_12px_28px_rgb(36_70_155/0.1)]" : "border-border bg-card hover:border-brand-300"}`}
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary"><Icon aria-hidden="true" className="size-5" weight="duotone" /></span>
                        <span className="min-w-0 flex-1"><span className="block font-semibold">{label}</span><span className="mt-2 block text-sm leading-5 text-muted-foreground">{description}</span></span>
                        <OptionCheck selected={selected} />
                      </button>
                    </AiUpdatedField>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" size="lg" className="h-12 w-full rounded-xl px-5 sm:w-auto" onClick={goBack}>
              <ArrowLeft aria-hidden="true" className="mr-2 size-4" weight="bold" />
              Back
            </Button>
            <Button size="lg" className="h-12 w-full rounded-xl px-6 sm:w-auto" disabled={!canContinue} onClick={buildRoadmap}>
              Build my roadmap
              <ArrowRight aria-hidden="true" className="ml-2 size-4" weight="bold" />
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
