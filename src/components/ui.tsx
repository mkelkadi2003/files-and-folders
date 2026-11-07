import { useEffect, useMemo, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { fmt } from "@/lib/useCountdown";
import { sfx } from "@/lib/sound";

type Variant = "yellow" | "cyan" | "pink" | "green" | "purple" | "ghost" | "red";

const variants: Record<Variant, string> = {
  yellow: "bg-yellow-400 text-slate-900",
  cyan: "bg-cyan-400 text-slate-900",
  pink: "bg-pink-500 text-white",
  green: "bg-emerald-400 text-slate-900",
  purple: "bg-violet-500 text-white",
  red: "bg-rose-500 text-white",
  ghost: "bg-white/10 text-white border-2 border-white/20",
};

export function BigButton({
  children,
  onClick,
  variant = "yellow",
  className,
  disabled,
  size = "lg",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  disabled?: boolean;
  size?: "md" | "lg" | "xl";
}) {
  const sizes = { md: "px-5 py-2.5 text-lg", lg: "px-7 py-3.5 text-xl", xl: "px-10 py-5 text-2xl md:text-3xl" };
  return (
    <button
      disabled={disabled}
      onClick={() => {
        sfx.click();
        onClick?.();
      }}
      className={cn(
        "btn-3d rounded-2xl font-bold inline-flex items-center justify-center gap-2 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}

export function TimerPill({ left, total, warnAt = 10 }: { left: number; total: number; warnAt?: number }) {
  const pct = Math.max(0, (left / total) * 100);
  const warn = left <= warnAt;
  return (
    <div className={cn("flex items-center gap-2 rounded-2xl px-4 py-2 font-display text-xl border-2", warn ? "bg-rose-500/20 border-rose-400 text-rose-200 animate-pulse" : "bg-white/10 border-white/20")}>
      <span>⏱️</span>
      <span className="tabular-nums">{fmt(left)}</span>
      <div className="w-20 h-2.5 rounded-full bg-black/30 overflow-hidden">
        <div className={cn("h-full transition-all duration-1000 ease-linear", warn ? "bg-rose-400" : "bg-cyan-300")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ScorePill({ score, label = "Score" }: { score: number | string; label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl px-4 py-2 bg-yellow-400/15 border-2 border-yellow-400/60 text-yellow-200 font-display text-xl">
      <span>⭐</span>
      <span className="text-sm font-body font-bold uppercase tracking-wide">{label}</span>
      <span className="tabular-nums">{score}</span>
    </div>
  );
}

export function MissionHeader({ number, title, subtitle, emoji }: { number: string; title: string; subtitle: string; emoji: string }) {
  return (
    <div className="text-center mb-6 animate-slide-up">
      <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/20 border border-pink-400/50 px-4 py-1 text-pink-200 font-bold uppercase tracking-widest text-sm mb-3">
        <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" /> {number}
      </div>
      <h1 className="font-display text-3xl md:text-5xl text-yellow-300 text-glow leading-tight">
        {emoji} {title}
      </h1>
      <p className="mt-2 text-lg md:text-xl text-cyan-100/90">{subtitle}</p>
    </div>
  );
}

export function AgentSays({ children, mood = "🕵️" }: { children: ReactNode; mood?: string }) {
  return (
    <div className="flex items-start gap-3 max-w-3xl mx-auto mb-5 animate-slide-up">
      <div className="text-5xl animate-float shrink-0">{mood}</div>
      <div className="relative bg-white text-slate-800 rounded-3xl rounded-tl-none px-5 py-3 text-lg md:text-xl font-semibold shadow-xl">
        {children}
      </div>
    </div>
  );
}

export function Feedback({ kind, children }: { kind: "good" | "bad" | "info" | null; children?: ReactNode }) {
  if (!kind) return null;
  const styles = {
    good: "bg-emerald-500 text-white border-emerald-300",
    bad: "bg-rose-500 text-white border-rose-300 animate-shake",
    info: "bg-cyan-500 text-slate-900 border-cyan-200",
  };
  return (
    <div key={String(children)} className={cn("rounded-2xl border-4 px-5 py-3 text-xl font-bold text-center animate-pop shadow-lg", styles[kind])}>
      {children}
    </div>
  );
}

export function Confetti({ count = 80 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        dur: 2.5 + Math.random() * 2.5,
        color: ["#facc15", "#38bdf8", "#f472b6", "#34d399", "#a78bfa", "#fb923c"][i % 6],
        rot: Math.random() * 360,
      })),
    [count]
  );
  return (
    <>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ left: `${p.left}vw`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, transform: `rotate(${p.rot}deg)` }}
        />
      ))}
    </>
  );
}

export function BadgeModal({
  open,
  emoji,
  title,
  message,
  stats,
  onContinue,
  onReplay,
  continueLabel = "NEXT MISSION ➜",
}: {
  open: boolean;
  emoji: string;
  title: string;
  message: string;
  stats?: ReactNode;
  onContinue: () => void;
  onReplay?: () => void;
  continueLabel?: string;
}) {
  useEffect(() => {
    if (open) sfx.fanfare();
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Confetti />
      <div className="relative w-full max-w-lg rounded-[2rem] bg-gradient-to-b from-indigo-600 to-violet-800 border-4 border-yellow-300 p-8 text-center animate-pop shadow-2xl">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-300 text-slate-900 font-display px-4 py-1 rounded-full text-sm tracking-wider">
          BADGE UNLOCKED!
        </div>
        <div className="relative mx-auto w-36 h-36 my-3">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-orange-500 animate-glow" />
          <div className="absolute inset-2 rounded-full border-4 border-dashed border-yellow-100/70 animate-spin-slow" />
          <div className="absolute inset-0 flex items-center justify-center text-7xl animate-wiggle">{emoji}</div>
        </div>
        <h2 className="font-display text-3xl text-yellow-300 text-glow">{title}</h2>
        <p className="mt-2 text-lg text-indigo-100">{message}</p>
        {stats && <div className="mt-4">{stats}</div>}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {onReplay && (
            <BigButton variant="ghost" onClick={onReplay}>
              🔁 REPLAY
            </BigButton>
          )}
          <BigButton variant="yellow" onClick={onContinue}>
            {continueLabel}
          </BigButton>
        </div>
      </div>
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-3xl bg-white/5 border-2 border-white/10 p-5 md:p-6 backdrop-blur", className)}>{children}</div>;
}
