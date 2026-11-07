import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/** Animated-looking vault: dial spins and door swings open when `opening` is true. */
export function Vault({ opening, children }: { opening: boolean; children?: ReactNode }) {
  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto">
      {/* Inside of vault (revealed) */}
      <div className="absolute inset-3 rounded-3xl bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 flex items-center justify-center overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-40" style={{ background: "repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,.35) 12px 14px)" }} />
        <div className="relative text-center">{children ?? <span className="text-8xl">💎</span>}</div>
      </div>
      {/* Door */}
      <div className={cn("absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600 border-[6px] border-slate-700 shadow-2xl flex items-center justify-center", opening && "animate-door-open")}>
        {/* Bolts */}
        {[["top-3 left-3"], ["top-3 right-3"], ["bottom-3 left-3"], ["bottom-3 right-3"]].map(([pos]) => (
          <span key={pos} className={cn("absolute w-5 h-5 rounded-full bg-slate-700 border-2 border-slate-500", pos)} />
        ))}
        {/* Hinges */}
        <span className="absolute -left-2 top-10 w-4 h-12 rounded bg-slate-800" />
        <span className="absolute -left-2 bottom-10 w-4 h-12 rounded bg-slate-800" />
        {/* Dial */}
        <div className={cn("relative w-40 h-40 rounded-full bg-gradient-to-br from-slate-200 to-slate-500 border-[6px] border-slate-700 shadow-xl", opening && "animate-vault-spin")}>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="absolute left-1/2 top-1 w-1 h-4 bg-slate-800 rounded" style={{ transform: `translateX(-50%) rotate(${i * 30}deg)`, transformOrigin: "50% 74px" }} />
          ))}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border-4 border-slate-400 flex items-center justify-center">
            <span className="text-4xl">{opening ? "🔓" : "🔒"}</span>
          </div>
          <span className="absolute -right-6 top-1/2 -translate-y-1/2 w-10 h-4 rounded-full bg-slate-700" />
        </div>
        {/* Handle */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-20 rounded-full bg-slate-800" />
      </div>
    </div>
  );
}

/** Treasure chest with locks that pop as progress increases; opens when `open`. */
export function TreasureChest({ open, locks = 0, totalLocks = 0, size = "md" }: { open: boolean; locks?: number; totalLocks?: number; size?: "sm" | "md" | "lg" }) {
  const w = size === "lg" ? "w-64" : size === "sm" ? "w-28" : "w-44";
  return (
    <div className={cn("relative mx-auto", w)}>
      {open && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-1 text-3xl z-0">
          <span className="animate-float">💎</span>
          <span className="animate-float" style={{ animationDelay: ".3s" }}>🪙</span>
          <span className="animate-float" style={{ animationDelay: ".6s" }}>👑</span>
          <span className="absolute -top-2 left-0 animate-sparkle">✨</span>
          <span className="absolute -top-4 right-0 animate-sparkle" style={{ animationDelay: ".8s" }}>✨</span>
        </div>
      )}
      <div className="relative z-10">
        {/* Lid */}
        <div className={cn("relative aspect-[3.4/1] w-full rounded-t-[45%] bg-gradient-to-b from-amber-600 to-amber-800 border-4 border-amber-950", open && "animate-lid-open")}>
          <div className="absolute inset-x-0 bottom-1 h-3 bg-yellow-400/90 border-y-2 border-amber-950" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-6 bg-yellow-400/90 border-x-2 border-amber-950" />
        </div>
        {/* Glow when open */}
        {open && <div className="absolute left-2 right-2 top-[30%] h-8 bg-yellow-200 blur-xl opacity-90" />}
        {/* Body */}
        <div className="relative aspect-[2/1] w-full rounded-b-xl bg-gradient-to-b from-amber-700 to-amber-900 border-4 border-t-0 border-amber-950">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-6 bg-yellow-400/90 border-x-2 border-amber-950" />
          <div className="absolute left-1/2 top-2 -translate-x-1/2 w-9 h-11 rounded-md bg-yellow-300 border-4 border-amber-950 flex items-center justify-center text-sm">
            {open ? "🔓" : "🔒"}
          </div>
        </div>
      </div>
      {totalLocks > 0 && (
        <div className="mt-2 flex justify-center gap-1 flex-wrap">
          {Array.from({ length: totalLocks }).map((_, i) => (
            <span key={i} className={cn("text-lg transition-all", i < locks ? "scale-110" : "opacity-40 grayscale")}>
              {i < locks ? "🔑" : "🔒"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
