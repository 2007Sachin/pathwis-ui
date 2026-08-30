interface OnboardingHeaderProps {
  step: number;
  label: string;
}

export function OnboardingHeader({ step, label }: OnboardingHeaderProps) {
  return (
    <header className="border-b border-border/80 bg-card/90">
      <div className="mx-auto flex min-h-20 w-full max-w-[1400px] items-center justify-between gap-5 px-5 py-4 sm:px-8 lg:px-12">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-base font-bold tracking-[-0.03em] text-primary-foreground">
            P
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-[-0.02em]">Pathwisse</p>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              Your AI-powered career companion
            </p>
          </div>
        </div>

        <div className="shrink-0 border-l border-border pl-4 text-right sm:pl-6">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            Onboarding {step}/9
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{label}</p>
        </div>
      </div>
    </header>
  );
}
