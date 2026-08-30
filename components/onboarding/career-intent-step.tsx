"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ListBullets,
  MagnifyingGlass,
  Sparkle,
  Target,
  type Icon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { AiUpdatedField } from "@/components/onboarding/ai-updated-field";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_CAREER_ROLES } from "@/lib/career/mock-careers";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { CareerIntent, CareerRole } from "@/types";

interface IntentOption {
  value: Exclude<CareerIntent, null>;
  title: string;
  description: string;
  icon: Icon;
}

const intentOptions: IntentOption[] = [
  {
    value: "know_role",
    title: "Yes, I know my target role",
    description: "Search for a role and build a roadmap around it.",
    icon: Target,
  },
  {
    value: "few_ideas",
    title: "I have a few ideas",
    description: "Compare roles side by side before deciding.",
    icon: ListBullets,
  },
  {
    value: "discover",
    title: "Help me discover one",
    description: "Answer a few quick questions and get AI recommendations.",
    icon: Sparkle,
  },
];

interface CareerIntentStepProps {
  roles?: CareerRole[];
}

export function CareerIntentStep({ roles = MOCK_CAREER_ROLES }: CareerIntentStepProps) {
  const router = useRouter();
  const careerIntent = useOnboardingStore((state) => state.careerIntent);
  const selectedCareer = useOnboardingStore((state) => state.selectedCareer);
  const careerIdeas = useOnboardingStore((state) => state.careerIdeas);
  const setCareerIntent = useOnboardingStore((state) => state.setCareerIntent);
  const setCareerIdeas = useOnboardingStore((state) => state.setCareerIdeas);
  const selectCareer = useOnboardingStore((state) => state.selectCareer);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const selectedRole = roles.find((role) => role.id === selectedCareer);
  const [careerQuery, setCareerQuery] = useState(selectedRole?.title ?? "");
  const displayedQuery = selectedRole?.title ?? careerQuery;

  const filteredRoles = useMemo(() => {
    const query = displayedQuery.trim().toLocaleLowerCase();
    if (!query || selectedRole) return roles;
    return roles.filter((role) => role.title.toLocaleLowerCase().includes(query));
  }, [displayedQuery, roles, selectedRole]);

  const selectIntent = (intent: Exclude<CareerIntent, null>) => {
    setCareerIntent(intent);
    if (intent !== "know_role") setCareerQuery("");
  };

  const updateSearch = (value: string) => {
    setCareerQuery(value);
    if (selectedCareer) selectCareer(null);
  };

  const toggleCareerIdea = (roleId: string) => {
    if (careerIdeas.includes(roleId)) {
      setCareerIdeas(careerIdeas.filter((id) => id !== roleId));
      return;
    }

    if (careerIdeas.length < 3) setCareerIdeas([...careerIdeas, roleId]);
  };

  const canContinue =
    careerIntent === "discover" ||
    (careerIntent === "know_role" && selectedCareer !== null) ||
    (careerIntent === "few_ideas" && careerIdeas.length > 0);

  const goBack = () => {
    setCurrentStep(3);
    router.push("/onboarding?step=3");
  };

  const continueToStepFive = () => {
    if (!canContinue) return;
    setCurrentStep(5);
    router.push("/onboarding?step=5");
  };

  return (
    <main className="min-h-[100dvh] bg-background pb-44 text-foreground sm:pb-40">
      <OnboardingHeader step={4} label="Career direction" />

      <div className="mx-auto w-full max-w-[1180px] px-5 pt-10 sm:px-8 sm:pt-14 lg:px-12 lg:pt-16">
        <section aria-labelledby="intent-heading">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">Your direction</p>
            <h1 id="intent-heading" className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-balance sm:text-5xl">
              Do you already know your target career?
            </h1>
            <p className="mt-5 max-w-[680px] text-base leading-7 text-muted-foreground sm:text-lg">
              Choose how much direction you have today. Pathwisse will adapt the next questions around you.
            </p>
          </div>

          <div role="radiogroup" aria-label="Career direction" className="mt-9 grid gap-4 lg:grid-cols-3">
            {intentOptions.map(({ value, title, description, icon: Icon }) => {
              const isSelected = careerIntent === value;
              return (
                <AiUpdatedField
                  key={value}
                  field="careerIntent"
                  value={value}
                  className="h-full rounded-[1.5rem]"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => selectIntent(value)}
                    className={`group h-full min-h-[196px] w-full rounded-[1.5rem] border p-6 text-left transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isSelected ? "scale-[1.01] border-primary bg-brand-50 shadow-[0_14px_34px_rgb(36_70_155/0.11)]" : "border-border bg-card hover:border-brand-300 hover:shadow-[0_12px_30px_rgb(36_70_155/0.07)]"}`}
                  >
                    <span className="flex items-start justify-between gap-4">
                      <span className={`grid size-12 place-items-center rounded-xl transition-colors ${isSelected ? "bg-primary text-primary-foreground" : "bg-brand-50 text-primary group-hover:bg-brand-100"}`}>
                        <Icon aria-hidden="true" className="size-5" weight="duotone" />
                      </span>
                      <span className={`grid size-6 place-items-center rounded-full border transition-colors ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-transparent"}`}>
                        <Check aria-hidden="true" className="size-3.5" weight="bold" />
                      </span>
                    </span>
                    <span className="mt-6 block text-lg font-semibold tracking-[-0.025em] text-foreground">{title}</span>
                    <span className="mt-2 block text-sm leading-6 text-muted-foreground">{description}</span>
                  </button>
                </AiUpdatedField>
              );
            })}
          </div>

          {careerIntent === "know_role" && (
            <section className="mt-5 rounded-[1.5rem] border border-border bg-card p-6 sm:p-8" aria-labelledby="career-search-heading">
              <h2 id="career-search-heading" className="text-xl font-semibold tracking-[-0.025em]">Find your target role</h2>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Search the current role catalogue and select one result.</p>
              <div className="relative mt-6">
                <MagnifyingGlass aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input value={displayedQuery} onChange={(event) => updateSearch(event.target.value)} placeholder="Search career roles" aria-label="Search career roles" className="pl-11" />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Career search results">
                {filteredRoles.map((role) => {
                  const isSelected = selectedCareer === role.id;
                  return (
                    <AiUpdatedField key={role.id} field="selectedCareer" value={role.id} className="rounded-xl">
                      <button type="button" aria-pressed={isSelected} onClick={() => selectCareer(role.id)} className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isSelected ? "border-primary bg-brand-50 text-primary" : "border-border bg-card text-foreground hover:border-brand-300 hover:bg-brand-50"}`}>
                        {role.title}
                        {isSelected && <Check aria-hidden="true" className="size-4" weight="bold" />}
                      </button>
                    </AiUpdatedField>
                  );
                })}
                {filteredRoles.length === 0 && <p className="py-4 text-sm text-muted-foreground sm:col-span-2">No matching roles yet. Try a broader search.</p>}
              </div>
            </section>
          )}

          {careerIntent === "few_ideas" && (
            <section className="mt-5 rounded-[1.5rem] border border-border bg-card p-6 sm:p-8" aria-labelledby="career-ideas-heading">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 id="career-ideas-heading" className="text-xl font-semibold tracking-[-0.025em]">Choose up to three roles</h2>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Pathwisse will help you compare the paths before you commit.</p>
                </div>
                <p className="text-sm font-semibold text-primary">{careerIdeas.length} / 3 selected</p>
              </div>
              <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Career ideas">
                {roles.map((role) => {
                  const isSelected = careerIdeas.includes(role.id);
                  const isDisabled = careerIdeas.length >= 3 && !isSelected;
                  return (
                    <button key={role.id} type="button" aria-pressed={isSelected} disabled={isDisabled} onClick={() => toggleCareerIdea(role.id)} className={`flex min-h-14 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-[transform,background-color,border-color] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 ${isSelected ? "border-primary bg-brand-50 text-primary" : "border-border bg-card text-foreground hover:border-brand-300 hover:bg-brand-50"}`}>
                      {role.title}
                      <span aria-hidden="true" className={`grid size-5 place-items-center rounded-md border ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input text-transparent"}`}>
                        <Check className="size-3" weight="bold" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {careerIntent === "discover" && (
            <section className="mt-5 flex gap-4 rounded-[1.5rem] border border-brand-200 bg-brand-50 p-6 sm:p-8" aria-labelledby="discovery-heading">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sparkle aria-hidden="true" className="size-5" weight="duotone" />
              </span>
              <div>
                <h2 id="discovery-heading" className="text-lg font-semibold tracking-[-0.02em]">AI-guided career discovery</h2>
                <p className="mt-1.5 max-w-[680px] text-sm leading-6 text-muted-foreground">Next, we will learn about your interests and working style before recommending careers worth exploring.</p>
              </div>
            </section>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" size="lg" className="h-12 w-full rounded-xl px-5 sm:w-auto" onClick={goBack}>
              <ArrowLeft aria-hidden="true" className="mr-2 size-4" weight="bold" />
              Back
            </Button>
            <Button size="lg" className="h-12 w-full rounded-xl px-6 sm:w-auto" disabled={!canContinue} onClick={continueToStepFive}>
              Continue
              <ArrowRight aria-hidden="true" className="ml-2 size-4" weight="bold" />
            </Button>
          </div>
        </section>
      </div>

    </main>
  );
}
