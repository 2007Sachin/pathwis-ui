"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MagnifyingGlass, SpinnerGap } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { AiUpdatedField } from "./ai-updated-field";
import { OnboardingHeader } from "./onboarding-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CAREER_PRIORITY_OPTIONS, INDUSTRY_OPTIONS, WORK_INTEREST_OPTIONS } from "@/lib/career/discovery-options";
import { MOCK_CAREER_ROLES } from "@/lib/career/mock-careers";
import { recommendCareersLocally } from "@/lib/career/recommendation-engine";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { CareerIntent, CareerOrientation } from "@/types";

const intents: Array<[Exclude<CareerIntent, null>, string]> = [["know_role", "Yes, I know my target role"], ["few_ideas", "I have a few ideas"], ["discover", "Help me discover one"]];
const orientations: Array<Exclude<CareerOrientation, null>> = ["business", "balanced", "technical"];

function Choices({ options, selected, change }: { options: readonly string[]; selected: string[]; change: (v: string[]) => void }) {
  return <div className="mt-4 flex flex-wrap gap-2">{options.map(option => <button type="button" key={option} onClick={() => change(selected.includes(option) ? selected.filter(x => x !== option) : [...selected, option])} className={`rounded-xl border px-3.5 py-2 text-sm ${selected.includes(option) ? "border-primary bg-brand-50 text-primary" : "border-border bg-card"}`}>{option}</button>)}</div>;
}

export function CareerIntentStep() {
  const router = useRouter(); const state = useOnboardingStore(); const [query, setQuery] = useState(""); const [loading, setLoading] = useState(false);
  const filtered = useMemo(() => MOCK_CAREER_ROLES.filter(r => r.title.toLowerCase().includes(query.toLowerCase())), [query]);
  const discoveryComplete = state.interests.length > 0 && state.orientation && state.industries.length > 0 && state.careerPriorities.length > 0;
  const canContinue = state.careerIntent === "know_role" ? !!state.selectedCareer : state.careerIntent === "few_ideas" ? state.careerIdeas.length > 0 : !!discoveryComplete;
  const chooseRole = (id: string) => state.careerIntent === "few_ideas" ? state.setCareerIdeas(state.careerIdeas.includes(id) ? state.careerIdeas.filter(x => x !== id) : [...state.careerIdeas, id].slice(0, 3)) : state.selectCareer(id);
  const continueFlow = async () => { if (!canContinue) return; setLoading(true); if (state.careerIntent === "few_ideas") state.selectCareer(state.careerIdeas[0]); state.setRecommendedCareers(await recommendCareersLocally(state)); state.setCurrentStep(4); router.push("/onboarding?step=4"); };
  return <main className="min-h-screen bg-background pb-40"><OnboardingHeader step={3} />
    <div className="mx-auto max-w-[1120px] px-5 pt-10 sm:px-8"><h1 className="text-4xl font-semibold tracking-tight">Do you already know your target career?</h1><p className="mt-3 text-muted-foreground">Choose a direction. Pathwisse will reveal only what it still needs.</p>
      <div className="mt-8 grid gap-3 md:grid-cols-3">{intents.map(([value,label]) => <AiUpdatedField key={value} field="careerIntent" value={value}><button type="button" onClick={() => state.setCareerIntent(value)} className={`min-h-24 w-full rounded-2xl border p-5 text-left font-semibold ${state.careerIntent === value ? "border-primary bg-brand-50 text-primary" : "border-border bg-card"}`}>{label}</button></AiUpdatedField>)}</div>
      {(state.careerIntent === "know_role" || state.careerIntent === "few_ideas") && <section className="mt-5 rounded-2xl border bg-card p-6"><div className="relative"><MagnifyingGlass className="absolute left-4 top-3.5 size-5 text-muted-foreground"/><Input className="pl-11" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search careers" /></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{filtered.map(role => { const selected = state.selectedCareer === role.id || state.careerIdeas.includes(role.id); return <AiUpdatedField key={role.id} field="selectedCareer" value={role.id}><button type="button" onClick={()=>chooseRole(role.id)} className={`flex w-full justify-between rounded-xl border p-3 text-left ${selected ? "border-primary bg-brand-50" : "border-border"}`}>{role.title}{selected && <Check/>}</button></AiUpdatedField>})}</div></section>}
      {state.careerIntent === "discover" && <div className="mt-5 grid gap-4">
        <section className="rounded-2xl border bg-card p-6"><h2 className="font-semibold">What kind of work do you enjoy?</h2><AiUpdatedField field="interests"><Choices options={WORK_INTEREST_OPTIONS} selected={state.interests} change={state.setInterests}/></AiUpdatedField></section>
        {state.interests.length > 0 && <section className="rounded-2xl border bg-card p-6"><h2 className="font-semibold">Preferred orientation</h2><div className="mt-4 flex gap-2">{orientations.map(o=><AiUpdatedField key={o} field="orientation" value={o}><button onClick={()=>state.setOrientation(o)} className={`rounded-xl border px-5 py-3 capitalize ${state.orientation===o?"border-primary bg-primary text-white":""}`}>{o}</button></AiUpdatedField>)}</div></section>}
        {state.orientation && <section className="rounded-2xl border bg-card p-6"><h2 className="font-semibold">Industries you’re interested in</h2><AiUpdatedField field="industries"><Choices options={INDUSTRY_OPTIONS} selected={state.industries} change={state.setIndustries}/></AiUpdatedField></section>}
        {state.industries.length > 0 && <section className="rounded-2xl border bg-card p-6"><h2 className="font-semibold">What matters most in your next role?</h2><AiUpdatedField field="careerPriorities"><Choices options={CAREER_PRIORITY_OPTIONS} selected={state.careerPriorities} change={state.setCareerPriorities}/></AiUpdatedField></section>}
      </div>}
      <div className="mt-8 flex justify-between border-t pt-6"><Button variant="ghost" onClick={()=>{state.setCurrentStep(2);router.push('/onboarding?step=2')}}><ArrowLeft/>Back</Button><Button disabled={!canContinue||loading} onClick={continueFlow}>{loading?<SpinnerGap className="animate-spin"/>:state.careerIntent==='discover'?'Find my matches':'Continue'}<ArrowRight/></Button></div>
    </div></main>;
}
