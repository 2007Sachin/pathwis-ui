"use client";

import { type FormEvent, useState } from "react";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Certificate,
  Plus,
  Student,
  X,
  type Icon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";

import { AiUpdatedField } from "@/components/onboarding/ai-updated-field";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { OnboardingStatus } from "@/types";

interface StatusOption {
  value: Exclude<OnboardingStatus, null>;
  label: string;
  icon: Icon;
}

interface ExperienceOption {
  id: "none" | "less_than_one" | "one_to_three" | "three_to_five" | "five_plus";
  label: string;
  value: number;
}

const statusOptions: StatusOption[] = [
  { value: "student", label: "Student", icon: Student },
  { value: "recent_graduate", label: "Recent graduate", icon: Certificate },
  { value: "working_professional", label: "Working professional", icon: Briefcase },
  { value: "returning_to_work", label: "Returning to work", icon: ArrowCounterClockwise },
];

const experienceOptions: ExperienceOption[] = [
  { id: "none", label: "0", value: 0 },
  { id: "less_than_one", label: "<1", value: 0.5 },
  { id: "one_to_three", label: "1-3", value: 2 },
  { id: "three_to_five", label: "3-5", value: 4 },
  { id: "five_plus", label: "5+", value: 5 },
];

const skillSuggestions = [
  "Excel",
  "SQL",
  "Market Research",
  "Data Analysis",
  "Product Strategy",
  "Python",
  "Power BI",
  "Presentation",
  "Project Management",
];

function isExperienceSelected(option: ExperienceOption, experienceYears: number | null) {
  if (experienceYears === null) return false;

  switch (option.id) {
    case "none":
      return experienceYears === 0;
    case "less_than_one":
      return experienceYears > 0 && experienceYears < 1;
    case "one_to_three":
      return experienceYears >= 1 && experienceYears < 3;
    case "three_to_five":
      return experienceYears >= 3 && experienceYears < 5;
    case "five_plus":
      return experienceYears >= 5;
  }
}

export function LearnerProfileStep() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [customSkill, setCustomSkill] = useState("");
  const status = useOnboardingStore((state) => state.status);
  const currentRole = useOnboardingStore((state) => state.currentRole);
  const experienceYears = useOnboardingStore((state) => state.experienceYears);
  const skills = useOnboardingStore((state) => state.skills);
  const setStatus = useOnboardingStore((state) => state.setStatus);
  const setCurrentRole = useOnboardingStore((state) => state.setCurrentRole);
  const setExperience = useOnboardingStore((state) => state.setExperience);
  const addSkill = useOnboardingStore((state) => state.addSkill);
  const removeSkill = useOnboardingStore((state) => state.removeSkill);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);

  const hasSkill = (skill: string) =>
    skills.some((selectedSkill) => selectedSkill.toLocaleLowerCase() === skill.toLocaleLowerCase());

  const toggleSkill = (skill: string) => {
    if (hasSkill(skill)) {
      removeSkill(skill);
      return;
    }

    addSkill(skill);
  };

  const submitCustomSkill = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSkill = customSkill.trim();

    if (!nextSkill) return;
    addSkill(nextSkill);
    setCustomSkill("");
  };

  const goBack = () => {
    setCurrentStep(1);
    router.push("/onboarding?step=1");
  };

  const continueToStepFour = () => {
    setCurrentStep(3);
    router.push("/onboarding?step=3");
  };

  return (
    <main className="min-h-[100dvh] bg-background pb-44 text-foreground sm:pb-40">
      <OnboardingHeader step={2} label="About you" />

      <div className="mx-auto w-full max-w-[1080px] px-5 pt-10 sm:px-8 sm:pt-14 lg:px-12 lg:pt-16">
        <section aria-labelledby="profile-heading">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">Your background</p>
            <h1 id="profile-heading" className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-balance sm:text-5xl">
              Tell me a little about yourself.
            </h1>
            <p className="mt-5 max-w-[680px] text-base leading-7 text-muted-foreground sm:text-lg">
              Share what you do today and the skills you already bring. You can update this anytime.
            </p>
          </div>

          <div className="mt-10 grid gap-5">
            <section className="rounded-[1.5rem] border border-border bg-card p-6 sm:p-8" aria-labelledby="status-heading">
              <h2 id="status-heading" className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">Current status</h2>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Choose the option that best describes where you are now.</p>
              <div role="radiogroup" aria-label="Current status" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {statusOptions.map(({ value, label, icon: Icon }) => {
                  const isSelected = status === value;
                  return (
                    <AiUpdatedField
                      key={value}
                      field="status"
                      value={value}
                      className="h-full"
                    >
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setStatus(value)}
                        className={`flex h-full min-h-24 w-full flex-col items-start justify-between rounded-2xl border p-4 text-left transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isSelected ? "border-primary bg-brand-50 shadow-[0_10px_26px_rgb(36_70_155/0.1)]" : "border-border bg-card hover:border-brand-300"}`}
                      >
                        <Icon aria-hidden="true" className={`size-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} weight="duotone" />
                        <span className="mt-4 text-sm font-semibold text-foreground">{label}</span>
                      </button>
                    </AiUpdatedField>
                  );
                })}
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <AiUpdatedField field="currentRole" className="h-full rounded-[1.5rem]">
                <section className="h-full rounded-[1.5rem] border border-border bg-card p-6 sm:p-8" aria-labelledby="role-heading">
                  <label id="role-heading" htmlFor="current-role" className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">Current role / field</label>
                  <p id="role-help" className="mt-1.5 text-sm leading-6 text-muted-foreground">Use your role, field of study or area of focus.</p>
                  <Input
                    id="current-role"
                    className="mt-6"
                    value={currentRole ?? ""}
                    onChange={(event) => setCurrentRole(event.target.value || null)}
                    placeholder="Product Planning - Electric Mobility"
                    aria-describedby="role-help"
                  />
                </section>
              </AiUpdatedField>

              <section className="rounded-[1.5rem] border border-border bg-card p-6 sm:p-8" aria-labelledby="experience-heading">
                <h2 id="experience-heading" className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">Years of experience</h2>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">A rough estimate is perfect.</p>
                <div role="radiogroup" aria-label="Years of experience" className="mt-6 grid grid-cols-5 gap-2">
                  {experienceOptions.map((option) => {
                    const isSelected = isExperienceSelected(option, experienceYears);
                    return (
                      <AiUpdatedField
                        key={option.id}
                        field="experienceYears"
                        value={option.value}
                        className="rounded-xl"
                      >
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setExperience(option.value)}
                          className={`h-11 w-full rounded-xl border text-sm font-semibold transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-brand-300 hover:bg-brand-50"}`}
                        >
                          {option.label}
                        </button>
                      </AiUpdatedField>
                    );
                  })}
                </div>
              </section>
            </div>

            <AiUpdatedField field="skills" className="rounded-[1.5rem]">
            <section className="rounded-[1.5rem] border border-border bg-card p-6 sm:p-8" aria-labelledby="skills-heading">
              <h2 id="skills-heading" className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">Skills you already use</h2>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Select suggestions or add anything that is part of your current toolkit.</p>

              {skills.length > 0 && (
                <motion.div layout className="mt-6 flex flex-wrap gap-2" aria-label="Selected skills">
                  <AnimatePresence initial={false}>
                  {skills.map((skill) => (
                    <motion.span
                      layout
                      key={skill}
                      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 3 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="rounded-md p-0.5 transition-colors hover:bg-primary-foreground/15 focus-visible:ring-2 focus-visible:ring-primary-foreground" aria-label={`Remove ${skill}`}>
                        <X aria-hidden="true" className="size-3.5" weight="bold" />
                      </button>
                    </motion.span>
                  ))}
                  </AnimatePresence>
                </motion.div>
              )}

              <div className="mt-6 flex flex-wrap gap-2" aria-label="Skill suggestions">
                {skillSuggestions.map((skill) => {
                  const isSelected = hasSkill(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleSkill(skill)}
                      className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isSelected ? "border-brand-300 bg-brand-50 text-primary" : "border-border bg-card text-foreground hover:border-brand-300 hover:bg-brand-50"}`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={submitCustomSkill}>
                <label htmlFor="custom-skill" className="sr-only">Add a custom skill</label>
                <Input id="custom-skill" value={customSkill} onChange={(event) => setCustomSkill(event.target.value)} placeholder="Type another skill" />
                <Button type="submit" variant="secondary" className="h-12 rounded-xl px-5" disabled={!customSkill.trim()}>
                  <Plus aria-hidden="true" className="mr-2 size-4" weight="bold" />
                  Add skill
                </Button>
              </form>
            </section>
            </AiUpdatedField>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" size="lg" className="h-12 w-full rounded-xl px-5 sm:w-auto" onClick={goBack}>
              <ArrowLeft aria-hidden="true" className="mr-2 size-4" weight="bold" />
              Back
            </Button>
            <Button size="lg" className="h-12 w-full rounded-xl px-6 sm:w-auto" onClick={continueToStepFour}>
              Continue
              <ArrowRight aria-hidden="true" className="ml-2 size-4" weight="bold" />
            </Button>
          </div>
        </section>
      </div>

    </main>
  );
}
