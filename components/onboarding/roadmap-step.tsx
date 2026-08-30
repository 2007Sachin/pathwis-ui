"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Briefcase,
  CheckCircle,
  Clock,
  Flag,
  FolderOpen,
  Gauge,
  GraduationCap,
  Lightning,
  Sparkle,
  Target,
  UserCircle,
  Wrench,
  type Icon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { AiUpdatedField } from "@/components/onboarding/ai-updated-field";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { RoadmapStage } from "@/types";

interface RoadmapStatProps {
  label: string;
  value: string;
  icon: Icon;
}

function RoadmapStat({ label, value, icon: Icon }: RoadmapStatProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-lg font-semibold tracking-[-0.025em] text-foreground" title={value}>
            {value}
          </p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary">
          <Icon aria-hidden="true" className="size-5" weight="duotone" />
        </span>
      </div>
    </div>
  );
}

function stageName(stage: RoadmapStage, index: number) {
  return stage.title.replace(new RegExp(`^Stage ${index + 1}\\s+[—-]\\s+`), "");
}

function RoadmapStageCard({ stage, index, isLast }: { stage: RoadmapStage; index: number; isLast: boolean }) {
  return (
    <article className="relative grid grid-cols-[3.25rem_minmax(0,1fr)] gap-4 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-6">
      <div className="relative flex justify-center">
        {!isLast && <span aria-hidden="true" className="absolute top-12 bottom-[-1.5rem] w-px bg-brand-200" />}
        <span className="relative z-10 grid size-11 place-items-center rounded-full border-4 border-background bg-primary text-sm font-bold text-primary-foreground shadow-[0_8px_20px_rgb(36_70_155/0.18)] sm:size-12">
          {index + 1}
        </span>
      </div>

      <section className="mb-6 rounded-[1.5rem] border border-border bg-card p-6 sm:p-8" aria-labelledby={`roadmap-stage-${index + 1}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">Stage {index + 1}</p>
            <h2 id={`roadmap-stage-${index + 1}`} className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
              {stageName(stage, index)}
            </h2>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2 text-sm font-semibold text-primary">
            <Clock aria-hidden="true" className="size-4" weight="duotone" />
            {stage.durationWeeks} {stage.durationWeeks === 1 ? "week" : "weeks"}
          </span>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{stage.description}</p>

        <div className="mt-6 grid gap-6 border-t border-border pt-6 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-foreground uppercase">
              <Wrench aria-hidden="true" className="size-4 text-primary" weight="duotone" />
              Required skills
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {stage.skills.map((skill) => (
                <span key={skill} className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-foreground uppercase">
              <BookOpenText aria-hidden="true" className="size-4 text-primary" weight="duotone" />
              Learning modules
            </h3>
            <ul className="mt-3 grid gap-2">
              {stage.learningModules.map((module) => (
                <li key={module} className="flex items-start gap-2 text-sm leading-5 text-muted-foreground">
                  <CheckCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" weight="fill" />
                  {module}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {stage.project && (
          <div className="mt-6 flex gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4">
            <FolderOpen aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" weight="duotone" />
            <div>
              <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">Stage project</p>
              <p className="mt-1.5 text-sm leading-6 text-foreground">{stage.project}</p>
            </div>
          </div>
        )}
      </section>
    </article>
  );
}

const journeySteps = [
  { label: "Current profile", icon: UserCircle },
  { label: "Skill development", icon: GraduationCap },
  { label: "Portfolio", icon: Briefcase },
  { label: "Career ready", icon: Flag },
];

export function RoadmapStep() {
  const router = useRouter();
  const roadmap = useOnboardingStore((state) => state.roadmap);
  const hoursPerWeek = useOnboardingStore((state) => state.hoursPerWeek);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const skillGapCount = roadmap
    ? new Set(roadmap.stages.flatMap((stage) => stage.skills.map((skill) => skill.toLocaleLowerCase()))).size
    : 0;
  const weeklyCommitment = hoursPerWeek ?? 8;

  const goBack = () => {
    setCurrentStep(7);
    router.push("/onboarding?step=7");
  };

  const unlockRoadmap = () => {
    if (!roadmap) return;
    setCurrentStep(9);
    router.push("/onboarding?step=9");
  };

  return (
    <main className="min-h-[100dvh] bg-background pb-44 text-foreground sm:pb-40">
      <OnboardingHeader step={8} label="Your roadmap" />

      <div className="mx-auto w-full max-w-[1280px] px-5 pt-10 sm:px-8 sm:pt-14 lg:px-12 lg:pt-16">
        <section aria-labelledby="roadmap-heading">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">Your learning plan</p>
            <h1 id="roadmap-heading" className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-balance sm:text-5xl">
              Your personalised roadmap is ready
            </h1>
            <p className="mt-5 max-w-[720px] text-base leading-7 text-muted-foreground sm:text-lg">
              A focused, stage-by-stage journey built around your career choice, existing strengths and available time.
            </p>
          </div>

          {!roadmap ? (
            <section className="mt-10 max-w-2xl rounded-[1.5rem] border border-border bg-card p-7 sm:p-9" aria-labelledby="roadmap-empty-heading">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-primary">
                <Sparkle aria-hidden="true" className="size-5" weight="duotone" />
              </span>
              <h2 id="roadmap-empty-heading" className="mt-5 text-2xl font-semibold tracking-[-0.03em]">Choose a career to build your roadmap</h2>
              <p className="mt-3 leading-7 text-muted-foreground">Return to your matches, select one career, and Pathwisse will generate your personalised learning journey.</p>
              <Button className="mt-6 h-12 rounded-xl" onClick={goBack}>
                Return to career matches
                <ArrowRight aria-hidden="true" className="ml-2 size-4" weight="bold" />
              </Button>
            </section>
          ) : (
            <AiUpdatedField field="roadmap" className="mt-10 rounded-[1.5rem]">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <RoadmapStat label="Selected career" value={roadmap.career} icon={Target} />
                <RoadmapStat label="Estimated duration" value={`${roadmap.estimatedWeeks} weeks`} icon={Clock} />
                <RoadmapStat label="Weekly commitment" value={`${weeklyCommitment} hours / week`} icon={Gauge} />
                <RoadmapStat label="Skill gap count" value={`${skillGapCount} skills`} icon={Lightning} />
              </div>

              <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
                <section aria-label="Career roadmap stages">
                  {roadmap.stages.map((stage, index) => (
                    <RoadmapStageCard
                      key={stage.id}
                      stage={stage}
                      index={index}
                      isLast={index === roadmap.stages.length - 1}
                    />
                  ))}
                </section>

                <aside className="rounded-[1.5rem] border border-border bg-card p-6 lg:sticky lg:top-6" aria-labelledby="journey-heading">
                  <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">Roadmap summary</p>
                  <h2 id="journey-heading" className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Your journey</h2>
                  <div className="mt-6">
                    {journeySteps.map(({ label, icon: Icon }, index) => (
                      <div key={label}>
                        <div className="flex items-center gap-3 rounded-xl bg-brand-50 p-3.5">
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-card text-primary">
                            <Icon aria-hidden="true" className="size-4" weight="duotone" />
                          </span>
                          <p className="text-sm font-semibold">{label}</p>
                        </div>
                        {index < journeySteps.length - 1 && (
                          <div className="flex h-8 items-center pl-6 text-brand-400">
                            <ArrowDown aria-hidden="true" className="size-4" weight="bold" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </AiUpdatedField>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" size="lg" className="h-12 w-full rounded-xl px-5 sm:w-auto" onClick={goBack}>
              <ArrowLeft aria-hidden="true" className="mr-2 size-4" weight="bold" />
              Back
            </Button>
            <Button size="lg" className="h-12 w-full rounded-xl px-6 sm:w-auto" disabled={!roadmap} onClick={unlockRoadmap}>
              Unlock my roadmap
              <ArrowRight aria-hidden="true" className="ml-2 size-4" weight="bold" />
            </Button>
          </div>
        </section>
      </div>

    </main>
  );
}
