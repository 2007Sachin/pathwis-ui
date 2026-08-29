"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Briefcase,
  Check,
  CheckCircle,
  Flask,
  FolderOpen,
  MicrophoneStage,
  SpinnerGap,
  Sparkle,
  Target,
  TrendUp,
  Trophy,
  type Icon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { VoiceAssistantFloat } from "@/components/voice/voice-assistant-float";
import { handleMockPayment } from "@/lib/payments/mock-payment";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { PaymentHandler, SubscriptionPlan } from "@/types";

interface IncludedFeature {
  label: string;
  icon: Icon;
}

const includedFeatures: IncludedFeature[] = [
  { label: "Personalised career roadmap", icon: Target },
  { label: "All required skill courses", icon: BookOpenText },
  { label: "Pathwisse AI assistant", icon: MicrophoneStage },
  { label: "Practice Labs", icon: Flask },
  { label: "Portfolio projects", icon: FolderOpen },
  { label: "Career opportunities", icon: Briefcase },
  { label: "Progress tracking", icon: TrendUp },
];

const plans = [
  {
    id: "monthly" as const,
    name: "Monthly",
    price: "₹500",
    cadence: "/ month",
    amountInPaise: 50_000,
  },
  {
    id: "annual" as const,
    name: "Annual",
    price: "₹5,000",
    cadence: "/ year",
    amountInPaise: 500_000,
    saving: "Save ₹1,000",
  },
];

function readableCareer(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

interface UnlockJourneyStepProps {
  paymentHandler?: PaymentHandler;
}

export function UnlockJourneyStep({ paymentHandler = handleMockPayment }: UnlockJourneyStepProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("annual");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const roadmap = useOnboardingStore((state) => state.roadmap);
  const selectedCareer = useOnboardingStore((state) => state.selectedCareer);
  const recommendations = useOnboardingStore((state) => state.recommendedCareers);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const selectedRecommendation = recommendations.find((item) => item.id === selectedCareer);
  const career = roadmap?.career ?? selectedRecommendation?.career ?? readableCareer(selectedCareer ?? "your career");

  const goBack = () => {
    setCurrentStep(7);
    router.push("/onboarding?step=7");
  };

  const unlockRoadmap = async () => {
    if (isProcessing) return;
    const plan = plans.find((item) => item.id === selectedPlan);
    if (!plan) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const result = await paymentHandler({
        plan: plan.id,
        amountInPaise: plan.amountInPaise,
        career,
      });

      if (!result.success) {
        setPaymentError("The mock payment could not be completed. Please try again.");
        return;
      }

      setIsComplete(true);
    } catch {
      setPaymentError("The mock payment could not be completed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startStageOne = () => {
    setCurrentStep(7);
    router.push("/onboarding?step=7#roadmap-stage-1");
  };

  if (isComplete) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-background px-5 py-12 text-foreground sm:px-8">
        <section className="w-full max-w-[680px] rounded-[2rem] border border-border bg-card p-7 text-center shadow-[0_22px_60px_rgb(36_70_155/0.12)] sm:p-12" aria-labelledby="complete-heading">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_14px_30px_rgb(36_70_155/0.22)]">
            <Trophy aria-hidden="true" className="size-9" weight="duotone" />
          </span>
          <p className="mt-7 text-sm font-semibold text-primary">Onboarding complete</p>
          <h1 id="complete-heading" className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">You&apos;re ready!</h1>
          <p className="mx-auto mt-5 max-w-[500px] text-base leading-7 text-muted-foreground sm:text-lg">
            Your {career} journey is now active.
          </p>
          <div className="mx-auto mt-7 flex max-w-md items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-left">
            <CheckCircle aria-hidden="true" className="size-6 shrink-0 text-primary" weight="fill" />
            <p className="text-sm leading-6 text-foreground">Your roadmap, learning modules and first project are ready to begin.</p>
          </div>
          <Button size="lg" className="mt-8 h-12 w-full rounded-xl sm:w-auto" onClick={startStageOne}>
            Start Stage 1
            <ArrowRight aria-hidden="true" className="ml-2 size-4" weight="bold" />
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-background pb-44 text-foreground sm:pb-40">
      <OnboardingHeader step={8} label="Unlock your journey" />

      <div className="mx-auto w-full max-w-[1180px] px-5 pt-10 sm:px-8 sm:pt-14 lg:px-12 lg:pt-16">
        <section aria-labelledby="unlock-heading">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-primary">Your path starts here</p>
            <h1 id="unlock-heading" className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-balance sm:text-5xl">
              Unlock your personalised journey
            </h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
              Everything you need to move confidently toward your next role, organised around you.
            </p>
          </div>

          <div className="mt-9 flex items-center justify-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 text-center">
            <Sparkle aria-hidden="true" className="size-5 shrink-0 text-primary" weight="fill" />
            <p className="text-base font-semibold tracking-[-0.02em] text-foreground sm:text-lg">{career} Career Journey</p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[1.65rem] border border-border bg-card p-6 sm:p-8" aria-labelledby="included-heading">
              <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">Pathwisse membership</p>
              <h2 id="included-heading" className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Everything included</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">One focused system for learning, practising, and becoming career ready.</p>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {includedFeatures.map(({ label, icon: Icon }) => (
                  <li key={label} className="flex min-h-12 items-center gap-3 rounded-xl bg-brand-50 px-4 py-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-card text-primary">
                      <Icon aria-hidden="true" className="size-4" weight="duotone" />
                    </span>
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[1.65rem] border border-border bg-card p-6 sm:p-8" aria-labelledby="pricing-heading">
              <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">Choose your plan</p>
              <h2 id="pricing-heading" className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Invest in your next chapter</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Select a plan to activate your roadmap. You can change it later.</p>

              <div role="radiogroup" aria-label="Subscription plan" className="mt-7 grid gap-3 sm:grid-cols-2">
                {plans.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  const isAnnual = plan.id === "annual";
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative min-h-[190px] rounded-2xl border p-5 text-left transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isSelected ? "border-primary bg-brand-50 shadow-[0_14px_32px_rgb(36_70_155/0.12)]" : "border-border bg-card hover:border-brand-300"}`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                        <span className={`grid size-6 place-items-center rounded-full border ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input text-transparent"}`}>
                          <Check aria-hidden="true" className="size-3.5" weight="bold" />
                        </span>
                      </span>
                      {isAnnual && <span className="mt-3 inline-flex rounded-lg bg-primary px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.08em] text-primary-foreground uppercase">Recommended</span>}
                      <span className="mt-5 flex items-end gap-1.5">
                        <span className="text-3xl font-bold tracking-[-0.045em] text-foreground">{plan.price}</span>
                        <span className="pb-1 text-sm text-muted-foreground">{plan.cadence}</span>
                      </span>
                      {plan.saving && <span className="mt-3 block text-sm font-semibold text-primary">{plan.saving}</span>}
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 border-t border-border pt-6">
                {paymentError && <p role="alert" className="mb-3 text-sm text-destructive">{paymentError}</p>}
                <Button size="lg" className="h-12 w-full rounded-xl" disabled={isProcessing} onClick={unlockRoadmap}>
                  {isProcessing ? <SpinnerGap aria-hidden="true" className="mr-2 size-4 animate-spin" weight="bold" /> : <Sparkle aria-hidden="true" className="mr-2 size-4" weight="duotone" />}
                  {isProcessing ? "Activating your journey..." : "Unlock my roadmap"}
                </Button>
                <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Demo checkout only. No payment will be collected.</p>
              </div>
            </section>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <Button variant="ghost" size="lg" className="h-12 w-full rounded-xl px-5 sm:w-auto" onClick={goBack} disabled={isProcessing}>
              <ArrowLeft aria-hidden="true" className="mr-2 size-4" weight="bold" />
              Back
            </Button>
          </div>
        </section>
      </div>

      <VoiceAssistantFloat message="Your journey is ready to activate. The annual plan gives you two months free compared with monthly billing." />
    </main>
  );
}
