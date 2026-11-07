import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import type { MissionProps } from "@/App";
import { AgentSays, BadgeModal, BigButton, Feedback, MissionHeader, Panel, ScorePill, TimerPill } from "@/components/ui";
import { TOOLS, ToolIcon, shuffle, type ToolId } from "@/lib/icons";
import { useCountdown } from "@/lib/useCountdown";
import { sfx } from "@/lib/sound";
import { cn } from "@/utils/cn";

const IDS: ToolId[] = ["save", "print", "cut", "copy", "paste", "undo", "redo"];
const TOTAL_TIME = 120;

interface Drag {
  id: ToolId;
  x: number;
  y: number;
  sx: number;
  sy: number;
  moved: boolean;
}

export default function Mission2({ onComplete, goNext }: MissionProps) {
  const [phase, setPhase] = useState<"ready" | "play" | "end">("ready");
  const [iconOrder, setIconOrder] = useState<ToolId[]>(() => shuffle(IDS));
  const [wordOrder, setWordOrder] = useState<ToolId[]>(() => shuffle(IDS));
  const [matched, setMatched] = useState<Set<ToolId>>(new Set());
  const [wrong, setWrong] = useState(0);
  const [points, setPoints] = useState(0);
  const [selected, setSelected] = useState<ToolId | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hoverSlot, setHoverSlot] = useState<ToolId | null>(null);
  const [fb, setFb] = useState<{ kind: "good" | "bad"; msg: string } | null>(null);
  const [shakeSlot, setShakeSlot] = useState<ToolId | null>(null);
  const [bonus, setBonus] = useState(0);
  const dragRef = useRef<Drag | null>(null);


  const timer = useCountdown(TOTAL_TIME, () => finish(false));
  const pointsRef = useRef(0);
  const leftRef = useRef(TOTAL_TIME);
  pointsRef.current = points;
  leftRef.current = timer.left;

  const finish = (allDone: boolean) => {
    timer.stop();
    const b = allDone ? leftRef.current : 0;
    setBonus(b);
    setPhase("end");
    onComplete(pointsRef.current + b);
  };

  const start = () => {
    setIconOrder(shuffle(IDS));
    setWordOrder(shuffle(IDS));
    setMatched(new Set());
    setWrong(0);
    setPoints(0);
    setBonus(0);
    setFb(null);
    setSelected(null);
    setPhase("play");
    timer.start(TOTAL_TIME);
    sfx.unlock();
  };

  const tryMatch = (icon: ToolId, slot: ToolId) => {
    if (matched.has(slot)) return;
    if (icon === slot) {
      sfx.correct();
      const n = new Set(matched);
      n.add(icon);
      setMatched(n);
      setPoints((p) => p + 10);
      setFb({ kind: "good", msg: `✅ Yes! ${TOOLS[icon].looksLike} = ${TOOLS[icon].name.toUpperCase()}! +10` });
      setSelected(null);
      if (n.size === IDS.length) {
        timer.stop();
        setTimeout(() => finish(true), 600);
      }
    } else {
      sfx.wrong();
      setWrong((w) => w + 1);
      setPoints((p) => Math.max(0, p - 2));
      setShakeSlot(slot);
      setTimeout(() => setShakeSlot(null), 500);
      setFb({ kind: "bad", msg: `❌ Oops! ${TOOLS[icon].looksLike} is NOT ${TOOLS[slot].name}. Try again! (-2)` });
    }
  };

  // Pointer-based drag (works for mouse + touch)
  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const moved = d.moved || Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 8;
      const nd = { ...d, x: e.clientX, y: e.clientY, moved };
      dragRef.current = nd;
      setDrag(nd);
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-slot]") as HTMLElement | null;
      setHoverSlot(el ? (el.dataset.slot as ToolId) : null);
    };
    const up = (e: PointerEvent) => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      setHoverSlot(null);
      if (!d) return;
      if (!d.moved) {
        // tap = select
        sfx.click();
        setSelected((s) => (s === d.id ? null : d.id));
        return;
      }
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-slot]") as HTMLElement | null;
      if (el) tryMatch(d.id, el.dataset.slot as ToolId);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag !== null, matched]);

  const onIconDown = (id: ToolId, e: RPointerEvent) => {
    if (phase !== "play") return;
    e.preventDefault();
    const d = { id, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false };
    dragRef.current = d;
    setDrag(d);
  };

  const stars = phase === "end" ? (matched.size === IDS.length ? (wrong <= 1 ? 3 : wrong <= 4 ? 2 : 1) : matched.size >= 4 ? 1 : 0) : 0;

  return (
    <div className="select-none">
      <MissionHeader number="MISSION 2" emoji="🧪" title="The Icon & Word Matching Lab" subtitle="Every toolbar icon has a matching menu command. Can you connect them?" />

      {phase === "ready" && (
        <div className="animate-slide-up">
          <AgentSays mood="🧑‍🔬">
            Professor Pixel mixed up the lab! <b>Drag</b> each icon onto its matching word. (Or <b>tap</b> an icon, then tap the word.) You have <b>2 minutes</b>!
          </AgentSays>
          <Panel className="max-w-4xl mx-auto">
            <div className="text-center font-display text-cyan-300 mb-4">STUDY THE ICONS FIRST 👀</div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {IDS.map((id) => (
                <div key={id} className="flex flex-col items-center gap-2 group">
                  <div className="w-16 h-16 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" style={{ boxShadow: `0 5px 0 ${TOOLS[id].color}` }}>
                    <ToolIcon id={id} size={32} />
                  </div>
                  <div className="font-bold">{TOOLS[id].name}</div>
                  <div className="text-xs text-white/60 text-center leading-tight">{TOOLS[id].looksLike}</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <BigButton size="xl" onClick={start}>
                ▶ START THE LAB
              </BigButton>
            </div>
          </Panel>
        </div>
      )}

      {phase !== "ready" && (
        <>
          <div className="flex flex-wrap justify-center gap-3 mb-5">
            <TimerPill left={timer.left} total={TOTAL_TIME} warnAt={20} />
            <ScorePill score={points} />
            <div className="rounded-2xl px-4 py-2 bg-emerald-500/20 border-2 border-emerald-400/60 font-display text-xl text-emerald-200">
              ✅ {matched.size}/{IDS.length}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Icon tray */}
            <Panel>
              <div className="font-display text-cyan-300 mb-3 text-center">🧰 TOOLBAR ICONS</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 min-h-40">
                {iconOrder.map((id) =>
                  matched.has(id) ? (
                    <div key={id} className="aspect-square rounded-2xl border-2 border-dashed border-white/15 flex items-center justify-center text-2xl opacity-50">✔️</div>
                  ) : (
                    <button
                      key={id}
                      onPointerDown={(e) => onIconDown(id, e)}
                      style={{ touchAction: "none", boxShadow: `0 6px 0 ${TOOLS[id].color}` }}
                      className={cn(
                        "aspect-square rounded-2xl bg-white text-slate-800 flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:-translate-y-1 animate-pop",
                        selected === id && "ring-4 ring-yellow-300 scale-110",
                        drag?.id === id && drag.moved && "opacity-30"
                      )}
                      aria-label="toolbar icon"
                    >
                      <ToolIcon id={id} size={40} />
                    </button>
                  )
                )}
              </div>
              {selected && <p className="text-center mt-3 text-yellow-200 font-semibold animate-pop">Now tap the matching word ➜</p>}
            </Panel>

            {/* Word slots */}
            <Panel>
              <div className="font-display text-pink-300 mb-3 text-center">📜 MENU COMMANDS</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wordOrder.map((id) => {
                  const isMatched = matched.has(id);
                  return (
                    <div
                      key={id}
                      data-slot={id}
                      onClick={() => selected && tryMatch(selected, id)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border-4 px-4 py-3 transition-all min-h-[68px]",
                        isMatched ? "bg-emerald-500 border-emerald-300" : "bg-indigo-900/60 border-dashed border-indigo-300/50",
                        !isMatched && (hoverSlot === id || selected) && "border-yellow-300 bg-yellow-400/10 cursor-pointer",
                        hoverSlot === id && "scale-105",
                        shakeSlot === id && "animate-shake border-rose-400 bg-rose-500/30"
                      )}
                    >
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", isMatched ? "bg-white text-slate-800 animate-pop" : "bg-white/10 border-2 border-dashed border-white/30")}>
                        {isMatched ? <ToolIcon id={id} size={26} /> : <span className="text-white/40">?</span>}
                      </div>
                      <span className="font-display text-xl">{TOOLS[id].name.toUpperCase()}</span>
                      {isMatched && <span className="ml-auto text-2xl">✅</span>}
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          <div className="mt-5 max-w-2xl mx-auto">{fb && <Feedback kind={fb.kind}>{fb.msg}</Feedback>}</div>
        </>
      )}

      {/* Drag ghost */}
      {drag && drag.moved && (
        <div className="fixed z-[60] pointer-events-none w-20 h-20 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-2xl ring-4 ring-yellow-300 rotate-6" style={{ left: drag.x - 40, top: drag.y - 40 }}>
          <ToolIcon id={drag.id} size={42} />
        </div>
      )}

      <BadgeModal
        open={phase === "end"}
        emoji="🏆"
        title="MASTER MATCHMAKER"
        message={matched.size === IDS.length ? "You matched every icon to its command! Amazing detective work!" : "Time's up! You did great – press REPLAY to beat your score!"}
        stats={
          <div className="space-y-3">
            <div className="text-4xl">{[0, 1, 2].map((i) => (i < stars ? "⭐" : "☆")).join(" ")}</div>
            <div className="grid grid-cols-2 gap-2 text-left bg-black/20 rounded-2xl p-3 font-semibold">
              <span>✅ Matches</span>
              <span className="text-right">{matched.size} / 7</span>
              <span>❌ Wrong tries</span>
              <span className="text-right">{wrong}</span>
              <span>⏱️ Time bonus</span>
              <span className="text-right">+{bonus}</span>
              <span className="font-display text-yellow-300">FINAL SCORE</span>
              <span className="text-right font-display text-yellow-300">{points + bonus}</span>
            </div>
          </div>
        }
        onContinue={goNext}
        onReplay={start}
      />
    </div>
  );
}
