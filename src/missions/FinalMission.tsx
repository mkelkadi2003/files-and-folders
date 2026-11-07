import { useMemo, useRef, useState } from "react";
import type { MissionProps } from "@/App";
import { AgentSays, BigButton, Confetti, Feedback, MissionHeader, Panel, ScorePill, TimerPill } from "@/components/ui";
import { TreasureChest } from "@/components/Vault";
import { ToolbarButton } from "@/components/ToolbarButton";
import { TOOLS, ToolIcon, shuffle, type ToolId } from "@/lib/icons";
import { useCountdown } from "@/lib/useCountdown";
import { sfx } from "@/lib/sound";
import { cn } from "@/utils/cn";

type Q =
  | { type: "mc"; tag: string; q: string; options: string[]; answer: number; visual?: "tooltip" | "help" }
  | { type: "tf"; tag: string; q: string; answer: boolean; tool?: ToolId }
  | { type: "icon"; tag: string; q: string; tool: ToolId; options: ToolId[] }
  | { type: "pickIcon"; tag: string; q: string; answer: ToolId; options: ToolId[] }
  | { type: "menu"; tag: string; q: string; answer: "File" | "Edit" | "View" }
  | { type: "toolbar"; tag: string; q: string; answer: ToolId };

const QUESTIONS: Q[] = [
  { type: "mc", tag: "MULTIPLE CHOICE", q: "Which menu has the SAVE command?", options: ["📁 File", "✏️ Edit", "👀 View"], answer: 0 },
  { type: "icon", tag: "MATCH THE ICON", q: "What is this icon called?", tool: "cut", options: ["copy", "cut", "paste"] },
  { type: "menu", tag: "IDENTIFY THE MENU", q: "Click the menu where you find ZOOM.", answer: "View" },
  { type: "toolbar", tag: "FIND THE BUTTON", q: "AGENT! Click the PRINT button!", answer: "print" },
  { type: "tf", tag: "TRUE OR FALSE", q: "The floppy disk icon means SAVE.", answer: true, tool: "save" },
  { type: "mc", tag: "IDENTIFY THE TOOLTIP", q: "You hover over a button and see this tooltip. What does the button do?", options: ["Goes back one step", "Prints the page", "Makes text bold"], answer: 0, visual: "tooltip" },
  { type: "mc", tag: "ONLINE HELP", q: "You can't find how to add a picture. What is the BEST thing to do?", options: ["Close the program 🚪", "Search the Help option ❓", "Click every button 🎲"], answer: 1, visual: "help" },
  { type: "pickIcon", tag: "MATCH THE ICON", q: "Which icon is COPY?", answer: "copy", options: ["paste", "copy", "save", "redo"] },
  { type: "tf", tag: "TRUE OR FALSE", q: "You must CLICK a button to see its tooltip.", answer: false },
  { type: "toolbar", tag: "FIND THE BUTTON", q: "Make the text BOLD!", answer: "bold" },
];

const TOTAL = 240;
const BAR: ToolId[] = ["new", "open", "save", "print", "undo", "redo", "cut", "copy", "paste", "bold", "italic", "underline"];

export default function FinalMission({ onComplete, goNext, agent }: MissionProps) {
  const [phase, setPhase] = useState<"ready" | "play" | "end">("ready");
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [tries, setTries] = useState(0);
  const [state, setState] = useState<"ask" | "good" | "retry" | "reveal">("ask");
  const [picked, setPicked] = useState<string | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const scoreRef = useRef(0);
  scoreRef.current = score;

  const timer = useCountdown(TOTAL, () => {
    setTimeUp(true);
    end();
  });

  const end = () => {
    timer.stop();
    setPhase("end");
    sfx.fanfare();
    onComplete(scoreRef.current);
  };

  const q = QUESTIONS[qi];
  const shuffledBar = useMemo(() => shuffle(BAR), [qi]);

  const start = () => {
    setQi(0);
    setScore(0);
    setCorrect(0);
    setTries(0);
    setState("ask");
    setPicked(null);
    setTimeUp(false);
    setPhase("play");
    timer.start(TOTAL);
    sfx.unlock();
  };

  const answer = (key: string, isRight: boolean) => {
    if (state === "good" || state === "reveal") return;
    setPicked(key);
    if (isRight) {
      sfx.correct();
      setScore((s) => s + (tries === 0 ? 10 : 5));
      setCorrect((c) => c + 1);
      setState("good");
    } else {
      sfx.wrong();
      if (tries === 0) {
        setTries(1);
        setState("retry");
      } else {
        setState("reveal");
      }
    }
  };

  const next = () => {
    if (qi < QUESTIONS.length - 1) {
      setQi(qi + 1);
      setTries(0);
      setState("ask");
      setPicked(null);
    } else {
      end();
    }
  };

  const correctLabel = (): string => {
    switch (q.type) {
      case "mc": return q.options[q.answer];
      case "tf": return q.answer ? "TRUE" : "FALSE";
      case "icon": return TOOLS[q.tool].name;
      case "pickIcon": return TOOLS[q.answer].name;
      case "menu": return q.answer;
      case "toolbar": return TOOLS[q.answer].name;
    }
  };

  const optCls = (key: string, right: boolean) =>
    cn(
      "btn-3d rounded-2xl border-4 cursor-pointer font-bold transition-all",
      picked === key && right && "border-emerald-400 bg-emerald-500/40",
      picked === key && !right && "border-rose-400 bg-rose-500/30 animate-shake",
      state === "reveal" && right && "border-emerald-400 bg-emerald-500/40 animate-pulse",
      picked !== key && !(state === "reveal" && right) && "border-indigo-300/40 bg-indigo-900/60 hover:border-yellow-300"
    );

  const renderQuestion = () => {
    switch (q.type) {
      case "mc":
        return (
          <>
            {q.visual === "tooltip" && (
              <div className="flex flex-col items-center mb-5">
                <div className="w-14 h-14 rounded-xl bg-white text-slate-700 flex items-center justify-center relative">
                  <span className="text-2xl">❔</span>
                  <span className="absolute -bottom-3 -right-3 text-2xl">👆</span>
                </div>
                <div className="mt-4 rounded-xl bg-slate-900 border-2 border-yellow-300 px-4 py-2 font-semibold animate-pop relative">
                  💬 Undo (Ctrl+Z)
                </div>
              </div>
            )}
            {q.visual === "help" && <div className="text-6xl text-center mb-4 animate-float">🖼️❓</div>}
            <div className="grid sm:grid-cols-3 gap-3">
              {q.options.map((o, i) => (
                <button key={o} onClick={() => answer(String(i), i === q.answer)} className={cn(optCls(String(i), i === q.answer), "px-4 py-5 text-xl")}>
                  {o}
                </button>
              ))}
            </div>
          </>
        );
      case "tf":
        return (
          <>
            {q.tool && (
              <div className="flex justify-center mb-5">
                <div className="w-20 h-20 rounded-2xl bg-white text-slate-700 flex items-center justify-center"><ToolIcon id={q.tool} size={44} /></div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              {[true, false].map((v) => (
                <button key={String(v)} onClick={() => answer(String(v), v === q.answer)} className={cn(optCls(String(v), v === q.answer), "py-6 text-3xl font-display")}>
                  {v ? "✅ TRUE" : "❌ FALSE"}
                </button>
              ))}
            </div>
          </>
        );
      case "icon":
        return (
          <>
            <div className="flex justify-center mb-5">
              <div className="w-24 h-24 rounded-3xl bg-white text-slate-700 flex items-center justify-center animate-pop shadow-[0_0_30px_rgba(250,204,21,.5)]"><ToolIcon id={q.tool} size={54} /></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {q.options.map((o) => (
                <button key={o} onClick={() => answer(o, o === q.tool)} className={cn(optCls(o, o === q.tool), "py-5 text-2xl font-display")}>
                  {TOOLS[o].name.toUpperCase()}
                </button>
              ))}
            </div>
          </>
        );
      case "pickIcon":
        return (
          <div className="flex flex-wrap justify-center gap-4">
            {q.options.map((o) => (
              <button key={o} onClick={() => answer(o, o === q.answer)} className={cn(optCls(o, o === q.answer), "w-24 h-24 flex items-center justify-center !bg-white text-slate-700")}>
                <ToolIcon id={o} size={48} />
              </button>
            ))}
          </div>
        );
      case "menu":
        return (
          <div className="max-w-xl mx-auto rounded-2xl bg-white text-slate-800 overflow-hidden border-4 border-slate-600">
            <div className="h-7 bg-gradient-to-r from-blue-700 to-indigo-700" />
            <div className="flex gap-2 p-3 bg-slate-50 justify-center flex-wrap">
              {(["File", "Edit", "View", "Insert", "Help"] as const).map((m) => {
                const right = m === q.answer;
                return (
                  <button
                    key={m}
                    onClick={() => answer(m, right)}
                    className={cn(
                      "px-5 py-3 rounded-xl text-xl font-bold border-4 cursor-pointer",
                      picked === m && right && "bg-emerald-400 border-emerald-600",
                      picked === m && !right && "bg-rose-300 border-rose-500 animate-shake",
                      state === "reveal" && right && "bg-emerald-400 border-emerald-600 animate-pulse",
                      picked !== m && !(state === "reveal" && right) && "border-transparent hover:bg-blue-100"
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
            <div className="h-20 bg-slate-200" />
          </div>
        );
      case "toolbar":
        return (
          <div className="max-w-3xl mx-auto rounded-2xl bg-slate-100 border-4 border-slate-600 p-3 pb-12">
            <p className="text-slate-500 text-sm text-center font-semibold mb-2">💡 Hover for tooltips!</p>
            <div className="flex flex-wrap justify-center gap-2">
              {shuffledBar.map((id) => (
                <ToolbarButton
                  key={id}
                  id={id}
                  size="lg"
                  onClick={() => answer(id, id === q.answer)}
                  state={picked === id ? (id === q.answer ? "good" : "bad") : null}
                  glow={state === "reveal" && id === q.answer}
                />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <MissionHeader number="FINAL MISSION" emoji="💎" title="The Ultimate Treasure Hunt" subtitle="Answer every question to collect keys and unlock the treasure chest!" />

      {phase === "ready" && (
        <div className="text-center animate-slide-up">
          <AgentSays mood="🏴‍☠️">This is it, {agent || "Agent"}! 10 questions. Every right answer gives you a 🔑 key. Collect them all to open the treasure!</AgentSays>
          <div className="my-16">
            <TreasureChest open={false} size="lg" />
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-6 text-lg font-semibold">
            <span className="rounded-full bg-white/10 px-4 py-2">⏱️ 4 minutes</span>
            <span className="rounded-full bg-white/10 px-4 py-2">⭐ 10 points first try</span>
            <span className="rounded-full bg-white/10 px-4 py-2">🔁 5 points second try</span>
          </div>
          <BigButton size="xl" onClick={start}>💎 BEGIN THE HUNT</BigButton>
        </div>
      )}

      {phase === "play" && (
        <div className="grid lg:grid-cols-[1fr_230px] gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4 justify-center lg:justify-start">
              <TimerPill left={timer.left} total={TOTAL} warnAt={30} />
              <ScorePill score={score} />
            </div>
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm font-bold text-white/70 mb-1">
                <span>Question {qi + 1} of {QUESTIONS.length}</span>
                <span>{Math.round((qi / QUESTIONS.length) * 100)}%</span>
              </div>
              <div className="h-4 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 via-yellow-300 to-pink-400 transition-all duration-500" style={{ width: `${((qi + (state === "good" || state === "reveal" ? 1 : 0)) / QUESTIONS.length) * 100}%` }} />
              </div>
            </div>
            <Panel key={qi} className="animate-slide-up">
              <div className="text-center">
                <span className="inline-block rounded-full bg-pink-500 px-4 py-1 text-sm font-bold tracking-wider">{q.tag}</span>
                <h2 className="font-display text-2xl md:text-3xl text-yellow-300 mt-3 mb-6">{q.q}</h2>
              </div>
              {renderQuestion()}
              <div className="mt-6 space-y-3 text-center">
                {state === "good" && <Feedback kind="good">✅ Correct! You earned a key! 🔑 {tries === 0 ? "+10" : "+5"}</Feedback>}
                {state === "retry" && <Feedback kind="bad">❌ Not quite, Agent! Have one more try!</Feedback>}
                {state === "reveal" && <Feedback kind="info">💡 The answer was: {correctLabel()}. You'll get it next time!</Feedback>}
                {(state === "good" || state === "reveal") && (
                  <BigButton variant="green" onClick={next}>
                    {qi < QUESTIONS.length - 1 ? "NEXT QUESTION ➜" : "OPEN THE CHEST! 🔓"}
                  </BigButton>
                )}
              </div>
            </Panel>
          </div>
          <Panel className="text-center h-fit lg:sticky lg:top-28">
            <div className="font-display text-yellow-300 mb-16">TREASURE</div>
            <TreasureChest open={false} locks={correct} totalLocks={QUESTIONS.length} size="sm" />
            <div className="mt-3 font-bold">{correct} / {QUESTIONS.length} keys</div>
          </Panel>
        </div>
      )}

      {phase === "end" && (
        <div className="text-center animate-pop">
          <Confetti count={120} />
          {timeUp && <div className="mb-4 text-xl font-bold text-orange-300">⏰ Time's up – but look what you collected!</div>}
          <div className="mt-20 mb-6">
            <TreasureChest open size="lg" locks={correct} totalLocks={QUESTIONS.length} />
          </div>
          <h2 className="font-display text-3xl md:text-5xl text-yellow-300 text-glow leading-tight">CONGRATULATIONS,<br />MASTER CODE BREAKER!</h2>
          <p className="text-xl mt-3 text-cyan-100">You unlocked the treasure with {correct} out of {QUESTIONS.length} keys!</p>
          <div className="flex justify-center gap-3 mt-4">
            <ScorePill score={score} label="Final" />
            <div className="rounded-2xl px-4 py-2 bg-violet-500/30 border-2 border-violet-300 font-display text-xl">👑 BADGE EARNED</div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <BigButton variant="ghost" onClick={start}>🔁 REPLAY</BigButton>
            <BigButton size="xl" onClick={goNext}>📜 GET MY CERTIFICATE</BigButton>
          </div>
        </div>
      )}
    </div>
  );
}
