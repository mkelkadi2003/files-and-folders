import { useRef, useState } from "react";
import type { MissionProps } from "@/App";
import { AgentSays, BadgeModal, BigButton, Feedback, MissionHeader, Panel, ScorePill, TimerPill } from "@/components/ui";
import { AppWindow } from "@/components/AppWindow";
import { ToolbarButton } from "@/components/ToolbarButton";
import { TOOLS, shuffle, type ToolId } from "@/lib/icons";
import { useCountdown } from "@/lib/useCountdown";
import { sfx } from "@/lib/sound";
import { cn } from "@/utils/cn";

const TOOLBAR: ToolId[] = ["new", "open", "save", "print", "undo", "redo", "cut", "copy", "paste", "bold", "italic", "underline", "center", "highlight", "find"];

interface Task {
  tool: ToolId;
  prompt: string;
  level: 1 | 2 | 3;
}

const TASKS: Task[] = [
  { tool: "bold", prompt: "AGENT! Make the secret place BOLD!", level: 1 },
  { tool: "save", prompt: "Quick! SAVE the secret report!", level: 1 },
  { tool: "undo", prompt: "Oh no, a messy mistake! UNDO it!", level: 1 },
  { tool: "print", prompt: "PRINT the mission map for HQ!", level: 2 },
  { tool: "copy", prompt: "COPY the secret code!", level: 2 },
  { tool: "paste", prompt: "Now PASTE the code into the report!", level: 2 },
  { tool: "italic", prompt: "Make the secret place ITALIC (leaning)!", level: 2 },
  { tool: "underline", prompt: "UNDERLINE the secret place!", level: 3 },
  { tool: "highlight", prompt: "HIGHLIGHT the clue like a marker pen!", level: 3 },
  { tool: "center", prompt: "Put the title in the CENTER!", level: 3 },
];

const LEVEL_TIME = { 1: 15, 2: 11, 3: 8 } as const;
const LEVEL_INFO = {
  1: { name: "LEVEL 1 · ROOKIE", desc: "Button names are showing.", color: "bg-emerald-500" },
  2: { name: "LEVEL 2 · AGENT", desc: "Names are hidden! Hover for tooltips.", color: "bg-orange-500" },
  3: { name: "LEVEL 3 · SUPER SPY", desc: "Buttons are shuffled and time is short!", color: "bg-rose-500" },
};

interface Doc {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  highlight: boolean;
  centered: boolean;
  saved: boolean;
  mess: boolean;
  copied: boolean;
  pasted: boolean;
  printing: boolean;
}

const START_DOC: Doc = { bold: false, italic: false, underline: false, highlight: false, centered: false, saved: false, mess: false, copied: false, pasted: false, printing: false };

export default function Mission3({ onComplete, goNext }: MissionProps) {
  const [phase, setPhase] = useState<"ready" | "play" | "end">("ready");
  const [ti, setTi] = useState(0);
  const [doc, setDoc] = useState<Doc>(START_DOC);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<null | "good" | "timeout">(null);
  const [fb, setFb] = useState<{ kind: "good" | "bad" | "info"; msg: string } | null>(null);
  const [btnState, setBtnState] = useState<{ id: ToolId; s: "good" | "bad" } | null>(null);
  const [order, setOrder] = useState<ToolId[]>(TOOLBAR);
  const [correctCount, setCorrectCount] = useState(0);
  const scoreRef = useRef(0);
  scoreRef.current = score;

  const task = TASKS[ti];
  const timer = useCountdown(LEVEL_TIME[task.level], () => {
    sfx.wrong();
    setResult("timeout");
    setFb({ kind: "info", msg: `⏰ Time's up! The ${TOOLS[task.tool].name.toUpperCase()} button is glowing – remember it!` });
  });

  const setupTask = (i: number) => {
    const t = TASKS[i];
    setTi(i);
    setResult(null);
    setFb(null);
    setBtnState(null);
    if (t.tool === "undo") setDoc((d) => ({ ...d, mess: true }));
    setOrder(t.level === 3 ? shuffle(TOOLBAR) : TOOLBAR);
    timer.start(LEVEL_TIME[t.level]);
  };

  const start = () => {
    setDoc(START_DOC);
    setScore(0);
    setCorrectCount(0);
    setPhase("play");
    sfx.unlock();
    setupTask(0);
  };

  const applyAction = (id: ToolId) => {
    setDoc((d) => {
      switch (id) {
        case "bold": return { ...d, bold: true, saved: false };
        case "italic": return { ...d, italic: true, saved: false };
        case "underline": return { ...d, underline: true, saved: false };
        case "highlight": return { ...d, highlight: true, saved: false };
        case "center": return { ...d, centered: true, saved: false };
        case "save": return { ...d, saved: true };
        case "undo": return { ...d, mess: false };
        case "copy": return { ...d, copied: true };
        case "paste": return { ...d, pasted: true, saved: false };
        case "print": return { ...d, printing: true };
        default: return d;
      }
    });
    if (id === "print") setTimeout(() => setDoc((d) => ({ ...d, printing: false })), 2500);
  };

  const clickTool = (id: ToolId) => {
    if (phase !== "play" || result) return;
    if (id === task.tool) {
      timer.stop();
      sfx.correct();
      applyAction(id);
      const pts = 10 + timer.left;
      setScore((s) => s + pts);
      setCorrectCount((c) => c + 1);
      setResult("good");
      setBtnState({ id, s: "good" });
      setFb({ kind: "good", msg: `⚡ SUPER FAST! You clicked ${TOOLS[id].name.toUpperCase()}! +10 points +${timer.left} speed bonus` });
    } else {
      sfx.wrong();
      setBtnState({ id, s: "bad" });
      setTimeout(() => setBtnState(null), 500);
      setFb({ kind: "bad", msg: `❌ That's the ${TOOLS[id].name.toUpperCase()} button! Keep looking, Agent!` });
    }
  };

  const next = () => {
    if (ti < TASKS.length - 1) {
      const nextLevel = TASKS[ti + 1].level;
      if (nextLevel !== task.level) sfx.unlock();
      setupTask(ti + 1);
    } else {
      setPhase("end");
      onComplete(scoreRef.current);
    }
  };

  const showLabels = task.level === 1;
  const lvl = LEVEL_INFO[task.level];

  const word = (
    <span
      className={cn(
        "px-0.5 rounded transition-all",
        doc.bold && "font-extrabold",
        doc.italic && "italic",
        doc.underline && "underline decoration-4 decoration-blue-500",
        doc.highlight && "bg-yellow-300",
        ["bold", "italic", "underline"].includes(task.tool) && !result && phase === "play" && "outline-2 outline-dashed outline-blue-400 bg-blue-100"
      )}
    >
      under the old oak tree
    </span>
  );

  return (
    <div>
      <MissionHeader number="MISSION 3" emoji="⚡" title="Beat the Toolbar Clock!" subtitle="Toolbar buttons are shortcuts. Click the right button before time runs out!" />

      {phase === "ready" && (
        <div className="animate-slide-up max-w-3xl mx-auto">
          <AgentSays mood="🦸">
            HQ needs you to fix the secret report – FAST! A task will appear. Find and click the right <b>toolbar button</b> before the clock hits zero!
          </AgentSays>
          <Panel>
            <div className="grid sm:grid-cols-3 gap-3">
              {([1, 2, 3] as const).map((l) => (
                <div key={l} className={cn("rounded-2xl p-4 text-center", LEVEL_INFO[l].color)}>
                  <div className="font-display text-lg">{LEVEL_INFO[l].name}</div>
                  <div className="text-sm font-semibold mt-1">{LEVEL_INFO[l].desc}</div>
                  <div className="font-display text-2xl mt-2">⏱️ {LEVEL_TIME[l]}s</div>
                </div>
              ))}
            </div>
            <p className="text-center mt-4 text-lg">⭐ 10 points for each correct click + bonus points for every second left!</p>
            <div className="text-center mt-5">
              <BigButton size="xl" onClick={start}>⚡ START THE CLOCK</BigButton>
            </div>
          </Panel>
        </div>
      )}

      {phase !== "ready" && (
        <>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <div className={cn("rounded-2xl px-4 py-2 font-display", lvl.color)}>{lvl.name}</div>
            <TimerPill left={timer.left} total={LEVEL_TIME[task.level]} warnAt={4} />
            <ScorePill score={score} />
            <div className="rounded-2xl px-4 py-2 bg-white/10 font-bold">Task {ti + 1}/{TASKS.length}</div>
          </div>

          <div key={ti} className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-6 py-4 text-center text-2xl md:text-3xl font-display shadow-xl animate-pop mb-4">
            🚨 {task.prompt}
          </div>
          {task.level >= 2 && !result && <p className="text-center text-cyan-200 mb-3 font-semibold">💡 Tip: rest your mouse on a button to see its name!</p>}

          <AppWindow
            title={`AgentWriter – Secret_Report.doc${doc.saved ? "" : " *"}`}
            status={
              <div className="flex flex-wrap gap-4">
                <span>{doc.saved ? "💾 Saved! Your work is safe." : "✏️ Not saved yet"}</span>
                {doc.copied && <span>📋 Clipboard: RAINBOW-42</span>}
                {doc.printing && <span className="text-blue-600 animate-pulse">🖨️ Printing…</span>}
              </div>
            }
          >
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1.5 md:gap-2 bg-slate-100 border-b border-slate-300 p-2 md:p-3 justify-center">
              {order.map((id) => (
                <ToolbarButton
                  key={id}
                  id={id}
                  showLabel={showLabels}
                  onClick={() => clickTool(id)}
                  glow={result === "timeout" && id === task.tool}
                  state={btnState?.id === id ? btnState.s : null}
                  active={(id === "bold" && doc.bold) || (id === "italic" && doc.italic) || (id === "underline" && doc.underline) || (id === "center" && doc.centered)}
                />
              ))}
            </div>
            {/* Document */}
            <div className="relative bg-slate-300 p-4 md:p-6 min-h-72 overflow-hidden">
              <div className="bg-white mx-auto max-w-2xl rounded shadow-lg p-6 md:p-8 text-lg leading-relaxed">
                <h3 className={cn("text-2xl font-bold transition-all duration-500", doc.centered ? "text-center" : "text-left", task.tool === "center" && !result && "outline-2 outline-dashed outline-blue-400 bg-blue-50")}>
                  🔐 TOP SECRET REPORT
                </h3>
                <p className="mt-3">
                  The treasure is hidden {word}.{" "}
                  <span className={cn("transition-all", doc.highlight && "bg-yellow-300", task.tool === "highlight" && !result && "outline-2 outline-dashed outline-blue-400")}>
                    Clue: look for the red stone.
                  </span>
                </p>
                <p className={cn("mt-3 font-mono inline-block px-2 rounded", task.tool === "copy" && !result && "outline-2 outline-dashed outline-blue-400 bg-blue-100")}>
                  Secret code: <b>RAINBOW-42</b>
                </p>
                {doc.mess && <p className="mt-2 text-rose-600 font-bold animate-shake">asdfgh jklll qwertyyy 🐒🐒🐒 (oops!)</p>}
                <p className="mt-3">
                  Code for HQ:{" "}
                  {doc.pasted ? (
                    <b className="font-mono bg-emerald-100 px-2 rounded animate-pop inline-block">RAINBOW-42</b>
                  ) : (
                    <span className={cn("inline-block w-28 border-b-2 border-dashed border-slate-400", task.tool === "paste" && !result && "border-blue-500 bg-blue-50")}>&nbsp;</span>
                  )}
                </p>
              </div>
              {doc.printing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="relative">
                    <div className="text-8xl">🖨️</div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-16 w-16 bg-white rounded shadow-lg animate-slide-up p-1 text-[8px] text-slate-500">
                      🗺️ MISSION MAP ✓
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AppWindow>

          <div className="mt-5 max-w-3xl mx-auto space-y-3 text-center">
            {fb && <Feedback kind={fb.kind}>{fb.msg}</Feedback>}
            {result && (
              <BigButton variant="green" onClick={next}>
                {ti < TASKS.length - 1 ? (TASKS[ti + 1].level !== task.level ? "LEVEL UP! ⬆️" : "NEXT TASK ➜") : "SEE MY SCORE 🏁"}
              </BigButton>
            )}
          </div>
        </>
      )}

      <BadgeModal
        open={phase === "end"}
        emoji="⚡"
        title="LIGHTNING CLICKER"
        message={`You beat the toolbar clock! ${correctCount} out of ${TASKS.length} buttons found in time.`}
        stats={<ScorePill score={score} />}
        onContinue={goNext}
        onReplay={start}
      />
    </div>
  );
}
