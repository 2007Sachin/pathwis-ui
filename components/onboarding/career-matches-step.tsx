"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Eye,
  SealCheck,
  Sparkle,
  TrendUp,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { VoiceAssistantFloat } from "@/components/voice/voice-assistant-float";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { CareerRecommendation } from "@/types";

function SkillList({ skills, emptyLabel }: { skills: string[]; emptyLabel: string }) {
  if (skills.length === 0) {
    return <p className="text-sm leading-6 text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="grid gap-2.5">
      {skills.slice(0, 4).map((skill) => (
        <li key={skill} className="flex items-start gap-2.5 text-sm leading-5 text-foreground">
          <CheckCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" weight="fill" />
          {skill}
        </li>
      ))}
    </ul>
  );
}

interface RecommendationCardProps {
  recommendation: CareerRecommendation;
  isBestMatch: boolean;
  isSelected: boolean;
  isPreviewed: boolean;
  onPreview: () => void;
  onSelect: () => void;
}

function RecommendationCard({
  recommendation,
  isBestMatch,
  isSelected,
  isPreviewed,
  onPreview,
  onSelect,
}: RecommendationCardProps) {
  return (
    <article
      className={`relative flex h-full flex-col rounded-[1.65rem] border bg-card p-6 transition-[transform,border-color,box-shadow] duration-200 sm:p-7 ${
        isSelected
          ? "scale-[1.01] border-primary shadow-[0_18px_45px_rgb(36_70_155/0.14)]"
          : isBestMatch
            ? "border-brand-300 shadow-[0_14px_36px_rgb(36_70_155/0.1)]"
            : "border-border hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_14px_34px_rgb(36_70_155/0.08)]"
      }`}
      aria-label={`${recommendation.career}, ${recommendation.matchPercentage}% match`}
    >
      {isBestMatch && (
        <div className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-primary uppercase">
          <SealCheck aria-hidden="true" className="size-4" weight="fill" />
          Recommended for you
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Career match</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.035em] text-foreground">
            {recommendation.career}
          </h2>
        </div>
        <div className="shrink-0 rounded-xl bg-brand-50 px-3 py-2 text-right">
          <p className="text-xl font-bold tracking-[-0.035em] text-primary">{recommendation.matchPercentage}%</p>
          <p className="text-[0.65rem] font-semibold tracking-[0.08em] text-primary uppercase">Match</p>
        </div>
      </div>

      <p className="mt-5 min-h-[6.5rem] text-sm leading-6 text-muted-foreground">
        {recommendation.explanation}
      </p>

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="mb-3 text-xs font-semibold tracking-[0.1em] text-foreground uppercase">
          Transferable skills
        </h3>
        <SkillList
          skills={recommendation.transferableSkills}
          emptyLabel="Your existing strengths still contribute to this path."
        />
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="mb-3 text-xs font-semibold tracking-[0.1em] text-foreground uppercase">
          Skills to develop
        </h3>
        <SkillList skills={recommendation.skillsToLearn} emptyLabel="No immediate skill gaps identified." />
      </div>

      <div className="mt-auto grid gap-2.5 pt-7">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl"
          aria-expanded={isPreviewed}
          onClick={onPreview}
        >
          <Eye aria-hidden="true" className="mr-2 size-4" weight="duotone" />
          {isPreviewed ? "Close career preview" : "View career"}
        </Button>
        <Button
          type="button"
          variant={isSelected ? "secondary" : "default"}
          className="h-11 rounded-xl"
          onClick={onSelect}
        >
          {isSelected && <Check aria-hidden="true" className="mr-2 size-4" weight="bold" />}
          {isSelected ? "Career selected" : "Choose this career"}
        </Button>
      </div>
    </article>
  );
}

export function CareerMatchesStep() {
  const router = useRouter();
  const [previewedCareer, setPreviewedCareer] = useState<string | null>(null);
  const storedRecommendations = useOnboardingStore((state) => state.recommendedCareers);
  const selectedCareer = useOnboardingStore((state) => state.selectedCareer);
  const selectCareer = useOnboardingStore((state) => state.selectCareer);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const generateRoadmap = useOnboardingStore((state) => state.generateRoadmap);
  const recommendations = storedRecommendations
    .filter(
      (recommendation) =>
        typeof recommendation.career === "string" &&
        typeof recommendation.matchPercentage === "number",
    )
    .slice(0, 3);
  const preview = recommendations.find((recommendation) => recommendation.id === previewedCareer);
  const hasSelectedMatch = recommendations.some((recommendation) => recommendation.id === selectedCareer);

  const goBack = () => {
    setCurrentStep(5);
    router.push("/onboarding?step=5");
  };

  const buildRoadmap = () => {
    if (!hasSelectedMatch) return;
    const roadmap = generateRoadmap();
    if (!roadmap) return;
    setCurrentStep(7);
    router.push("/onboarding?step=7");
  };

  return (
    <main className="min-h-[100dvh] bg-background pb-44 text-foreground sm:pb-40">
      <OnboardingHeader step={6} label="Career matches" />

      <div className="mx-auto w-full max-w-[1320px] px-5 pt-10 sm:px-8 sm:pt-14 lg:px-12 lg:pt-16">
        <section aria-labelledby="matches-heading">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">Your recommendations</p>
            <h1 id="matches-heading" className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-balance sm:text-5xl">
              Your strongest career matches
            </h1>
            <p className="mt-5 max-w-[700px] text-base leading-7 text-muted-foreground sm:text-lg">
              Based on your background, interests and skills, Pathwisse found these roles for you.
            </p>
          </div>

          {recommendations.length === 0 ? (
            <section className="mt-10 max-w-2xl rounded-[1.5rem] border border-border bg-card p-7 sm:p-9" aria-labelledby="no-matches-heading">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-primary">
                <Sparkle aria-hidden="true" className="size-5" weight="duotone" />
              </span>
              <h2 id="no-matches-heading" className="mt-5 text-2xl font-semibold tracking-[-0.03em]">Your matches are ready to calculate</h2>
              <p className="mt-3 leading-7 text-muted-foreground">Complete the discovery questions so Pathwisse can calculate and rank your strongest career options.</p>
              <Button className="mt-6 h-12 rounded-xl" onClick={goBack}>
                Return to discovery
                <ArrowRight aria-hidden="true" className="ml-2 size-4" weight="bold" />
              </Button>
            </section>
          ) : (
            <>
              <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
                {recommendations.map((recommendation, index) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    isBestMatch={index === 0}
                    isSelected={selectedCareer === recommendation.id}
                    isPreviewed={previewedCareer === recommendation.id}
                    onPreview={() => setPreviewedCareer((current) => current === recommendation.id ? null : recommendation.id)}
                    onSelect={() => selectCareer(recommendation.id)}
                  />
                ))}
              </div>

              {preview && (
                <section className="mt-5 rounded-[1.5rem] border border-brand-200 bg-brand-50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8" aria-live="polite">
                  <div className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                      <TrendUp aria-hidden="true" className="size-5" weight="duotone" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">Career preview</p>
                      <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.025em]">Your path into {preview.career}</h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        Start by applying {preview.transferableSkills.slice(0, 2).join(" and ") || "your existing experience"}, then build confidence in {preview.skillsToLearn.slice(0, 2).join(" and ") || "the core role skills"} through guided projects and practice.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" size="lg" className="h-12 w-full rounded-xl px-5 sm:w-auto" onClick={goBack}>
              <ArrowLeft aria-hidden="true" className="mr-2 size-4" weight="bold" />
              Back
            </Button>
            <Button size="lg" className="h-12 w-full rounded-xl px-6 sm:w-auto" disabled={!hasSelectedMatch} onClick={buildRoadmap}>
              Build my roadmap
              <ArrowRight aria-hidden="true" className="ml-2 size-4" weight="bold" />
            </Button>
          </div>
        </section>
      </div>

      <VoiceAssistantFloat message="These are your strongest matches. I can explain the trade-offs or select the career that feels right for you." />
    </main>
  );
}
