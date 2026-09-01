const milestones = ["Goal", "You", "Career", "Match", "Learning", "Roadmap", "Start"];

interface OnboardingHeaderProps { step: number; label?: string }

export function OnboardingHeader({ step }: OnboardingHeaderProps) {
  return (
    <header className="border-b border-border/80 bg-card/90">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">P</span>
          <div><p className="font-semibold">Pathwisse</p><p className="text-xs text-muted-foreground sm:text-sm">Your AI-powered career companion</p></div>
        </div>
        <nav aria-label="Onboarding progress" className="mt-4 grid grid-cols-7 gap-1 sm:gap-3">
          {milestones.map((milestone, index) => {
            const state = index + 1 < step ? "complete" : index + 1 === step ? "current" : "upcoming";
            return <div key={milestone} className="relative text-center">
              {index > 0 && <span className={`absolute right-1/2 top-2 h-0.5 w-full ${index + 1 <= step ? "bg-primary" : "bg-border"}`} />}
              <span className={`relative mx-auto block size-4 rounded-full border-2 ${state === "upcoming" ? "border-border bg-card" : "border-primary bg-primary"}`} />
              <span className={`mt-1.5 block text-[0.62rem] font-medium sm:text-xs ${state === "upcoming" ? "text-muted-foreground" : "text-primary"}`}>{milestone}</span>
            </div>;
          })}
        </nav>
      </div>
    </header>
  );
}
