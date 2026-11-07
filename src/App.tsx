import { useState } from "react";
import { cn } from "@/utils/cn";
import { sfx, setMuted } from "@/lib/sound";
import Intro from "@/missions/Intro";
import Mission1 from "@/missions/Mission1";
import Mission2 from "@/missions/Mission2";
import Mission3 from "@/missions/Mission3";
import Mission4 from "@/missions/Mission4";
import FinalMission from "@/missions/FinalMission";
import Certificate from "@/missions/Certificate";
import { SchoolLogo } from "@/components/SchoolLogo";

export type StepId = "intro" | "m1" | "m2" | "m3" | "m4" | "final" | "cert";

export interface Badge {
  emoji: string;
  title: string;
}

export const STEPS: { id: StepId; label: string; emoji: string; badge?: Badge }[] = [
  { id: "intro", label: "Briefing", emoji: "🚨", badge: { emoji: "🕶️", title: "Rookie Agent" } },
  { id: "m1", label: "Menu Vault", emoji: "🔓", badge: { emoji: "🔓", title: "Vault Cracker" } },
  { id: "m2", label: "Match Lab", emoji: "🧪", badge: { emoji: "🏆", title: "Master Matchmaker" } },
  { id: "m3", label: "Toolbar Clock", emoji: "⚡", badge: { emoji: "⚡", title: "Lightning Clicker" } },
  { id: "m4", label: "Whisper Mystery", emoji: "🔍", badge: { emoji: "🔍", title: "Whisper Detective" } },
  { id: "final", label: "Treasure Hunt", emoji: "💎", badge: { emoji: "👑", title: "Master Code Breaker" } },
  { id: "cert", label: "Certificate", emoji: "📜" },
];

export interface MissionProps {
  agent: string;
  onComplete: (score: number) => void;
  goNext: () => void;
}

export default function App() {
  const [step, setStep] = useState(0);
  const [unlocked, setUnlocked] = useState(0);
  const [completed, setCompleted] = useState<Record<string, number>>({});
  const [agent, setAgent] = useState("");
  const [muted, setMute] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const current = STEPS[step];

  const complete = (score: number) => {
    setCompleted((c) => ({ ...c, [current.id]: Math.max(score, c[current.id] ?? 0) }));
    setUnlocked((u) => Math.max(u, step + 1));
  };

  const go = (i: number) => {
    if (i < 0 || i >= STEPS.length || i > unlocked) return;
    sfx.whoosh();
    setStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => go(step + 1);

  const [confirmRestart, setConfirmRestart] = useState(false);

  const restartAll = () => {
    sfx.whoosh();
    setConfirmRestart(false);
    setStep(0);
    setUnlocked(0);
    setCompleted({});
    setAgent("");
    setRunKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const badges = STEPS.filter((s) => s.badge && completed[s.id] !== undefined).map((s) => s.badge!);
  const totalScore = Object.values(completed).reduce((a, b) => a + b, 0);

  const props: MissionProps = { agent, onComplete: complete, goNext };

  return (
    <div className="min-h-screen agent-bg relative overflow-x-hidden">
      <div className="absolute inset-0 grid-overlay pointer-events-none" />

      {/* TOP BAR */}
      <header className="z-30 sticky top-0 bg-[#0b1026]/85 backdrop-blur border-b-2 border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-2.5 flex items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-white rounded-xl px-2 py-1 shadow-lg flex items-center">
              <SchoolLogo height="h-9 md:h-10" className="max-w-[120px] md:max-w-[190px]" />
            </div>
            <div className="hidden xl:block leading-tight">
              <div className="font-display text-yellow-300 text-sm">🕵️ TREASURE HUNT</div>
              <div className="text-xs text-cyan-200/80 font-semibold">Menus & Toolbars HQ</div>
            </div>
          </div>

          {/* Progress tracker */}
          <nav className="flex-1 flex items-center justify-center gap-1 md:gap-1.5 overflow-x-auto py-1">
            {STEPS.map((s, i) => {
              const done = completed[s.id] !== undefined;
              const locked = i > unlocked;
              const active = i === step;
              return (
                <div key={s.id} className="flex items-center">
                  <button
                    onClick={() => go(i)}
                    disabled={locked}
                    title={locked ? "Locked – finish the mission before!" : s.label}
                    className={cn(
                      "relative flex flex-col items-center rounded-xl px-1.5 md:px-2.5 py-1 transition-all min-w-[48px]",
                      active && "bg-yellow-400/20 ring-2 ring-yellow-300 scale-105",
                      !locked && !active && "hover:bg-white/10 cursor-pointer",
                      locked && "opacity-45 cursor-not-allowed"
                    )}
                  >
                    <span
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-lg border-2",
                        done ? "bg-emerald-400 border-emerald-200" : locked ? "bg-slate-700 border-slate-500" : "bg-indigo-500 border-indigo-300"
                      )}
                    >
                      {locked ? "🔒" : done ? "✅" : s.emoji}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold mt-0.5 whitespace-nowrap hidden sm:block">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && <div className={cn("w-2 md:w-5 h-1 rounded-full", i < unlocked ? "bg-emerald-400" : "bg-white/15")} />}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                sfx.click();
                setConfirmRestart(true);
              }}
              className="h-11 px-3 rounded-xl bg-rose-500/80 hover:bg-rose-500 font-bold flex items-center gap-1.5 cursor-pointer btn-3d"
              title="Start the whole treasure hunt again from the beginning"
            >
              <span className="text-xl">🔁</span>
              <span className="hidden md:inline text-sm">START OVER</span>
            </button>
            <div className="hidden md:flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5" title="Badges collected">
              <span className="text-xl">🎖️</span>
              <span className="font-display text-yellow-300">{badges.length}</span>
              <span className="text-xs text-white/60">/6</span>
            </div>
            <button
              onClick={() => {
                setMute(!muted);
                setMuted(!muted);
              }}
              className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 text-xl cursor-pointer"
              title={muted ? "Sound off" : "Sound on"}
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
        </div>
      </header>

      {/* Badge shelf */}
      {badges.length > 0 && current.id !== "cert" && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-3 flex flex-wrap gap-2 justify-center print:hidden">
          {badges.map((b) => (
            <span key={b.title} className="animate-pop inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400/25 to-orange-400/25 border border-yellow-300/50 px-3 py-1 text-sm font-bold text-yellow-100">
              <span className="text-lg">{b.emoji}</span> {b.title}
            </span>
          ))}
        </div>
      )}

      <main className="relative z-10 max-w-6xl mx-auto px-3 md:px-6 py-6 md:py-8" key={`${current.id}-${runKey}`}>
        {current.id === "intro" && <Intro {...props} setAgent={setAgent} />}
        {current.id === "m1" && <Mission1 {...props} />}
        {current.id === "m2" && <Mission2 {...props} />}
        {current.id === "m3" && <Mission3 {...props} />}
        {current.id === "m4" && <Mission4 {...props} />}
        {current.id === "final" && <FinalMission {...props} />}
        {current.id === "cert" && <Certificate agent={agent} badges={badges} totalScore={totalScore} onRestart={restartAll} />}
      </main>

      {/* Bottom navigation */}
      <footer className="relative z-10 max-w-6xl mx-auto px-4 pb-8 flex items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => go(step - 1)}
          disabled={step === 0}
          className="btn-3d rounded-2xl bg-white/10 border-2 border-white/20 px-6 py-3 text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          ⬅ BACK
        </button>
        <div className="flex flex-col items-center gap-2">
          <div className="text-center text-sm text-white/60 font-semibold">
            Step {step + 1} of {STEPS.length} · {current.label}
          </div>
          {step > 0 || unlocked > 0 ? (
            <button
              onClick={() => {
                sfx.click();
                setConfirmRestart(true);
              }}
              className="btn-3d rounded-2xl bg-rose-500 text-white px-5 py-2.5 text-base md:text-lg font-bold cursor-pointer"
            >
              🔁 RETRY FROM THE START
            </button>
          ) : null}
        </div>
        <button
          onClick={goNext}
          disabled={step + 1 > unlocked || step === STEPS.length - 1}
          className={cn(
            "btn-3d rounded-2xl px-6 py-3 text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer",
            step + 1 <= unlocked && step < STEPS.length - 1 ? "bg-yellow-400 text-slate-900 animate-glow" : "bg-white/10 border-2 border-white/20"
          )}
          title={step + 1 > unlocked ? "Finish this mission to unlock NEXT" : "Next"}
        >
          NEXT ➜
        </button>
      </footer>

      {/* Restart confirmation */}
      {confirmRestart && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 print:hidden" onClick={() => setConfirmRestart(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-[2rem] bg-gradient-to-b from-rose-600 to-indigo-800 border-4 border-yellow-300 p-7 text-center animate-pop shadow-2xl"
          >
            <div className="text-7xl animate-wiggle">🔁</div>
            <h2 className="font-display text-2xl md:text-3xl text-yellow-300 text-glow mt-3">START OVER, AGENT?</h2>
            <p className="mt-3 text-lg text-white/90">
              You will go back to the very first briefing. Your badges, points and code name will be cleared so you can play the whole treasure hunt again!
            </p>
            {badges.length > 0 && (
              <div className="mt-3 text-sm text-yellow-100/90 font-semibold">
                You have {badges.length} badge{badges.length > 1 ? "s" : ""} and ⭐ {totalScore} points right now.
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => {
                  sfx.click();
                  setConfirmRestart(false);
                }}
                className="btn-3d rounded-2xl bg-white/15 border-2 border-white/30 px-6 py-3 text-lg font-bold cursor-pointer"
              >
                ✋ NO, KEEP PLAYING
              </button>
              <button onClick={restartAll} className="btn-3d rounded-2xl bg-yellow-400 text-slate-900 px-6 py-3 text-lg font-bold cursor-pointer">
                🚀 YES, START AGAIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
