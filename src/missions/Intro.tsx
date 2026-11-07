import { useEffect, useState, type ReactNode } from "react";
import type { MissionProps } from "@/App";
import { AgentSays, BadgeModal, BigButton, Feedback, Panel } from "@/components/ui";
import { Vault } from "@/components/Vault";
import { SchoolLogo } from "@/components/SchoolLogo";
import { sfx } from "@/lib/sound";
import { cn } from "@/utils/cn";
import { Bold, Italic, Underline, Save, Printer } from "lucide-react";

type Phase = "alert" | "opening" | "name" | "quiz";

interface GuessQ {
  q: string;
  options: { key: string; visual: ReactNode; label: string }[];
  correct: string;
  good: string;
  bad: string;
}

const MiniWindow = ({ children }: { children: ReactNode }) => (
  <div className="w-full rounded-lg bg-white text-slate-800 overflow-hidden border-2 border-slate-300 text-sm shadow">
    <div className="h-4 bg-slate-200 flex items-center gap-1 px-1.5">
      <span className="w-2 h-2 rounded-full bg-rose-400" />
      <span className="w-2 h-2 rounded-full bg-yellow-400" />
      <span className="w-2 h-2 rounded-full bg-emerald-400" />
    </div>
    {children}
  </div>
);

const QUESTIONS: GuessQ[] = [
  {
    q: "Which one looks like a FILE MENU?",
    correct: "a",
    good: "Correct, Agent! A menu is a list of words that drops down. 📂",
    bad: "Hmm, not quite! Look for a LIST of commands that drops down.",
    options: [
      {
        key: "a",
        label: "A dropdown list",
        visual: (
          <MiniWindow>
            <div className="flex gap-3 px-2 py-1 bg-slate-100 font-semibold text-xs">
              <span className="bg-blue-500 text-white px-1 rounded">File</span>
              <span>Edit</span>
              <span>View</span>
            </div>
            <div className="ml-2 mb-2 w-24 bg-white border border-slate-300 shadow text-xs text-left">
              {["New", "Open", "Save", "Print"].map((x) => (
                <div key={x} className="px-2 py-0.5 hover:bg-blue-100">{x}</div>
              ))}
            </div>
          </MiniWindow>
        ),
      },
      {
        key: "b",
        label: "A picture of a cat",
        visual: (
          <MiniWindow>
            <div className="h-24 flex items-center justify-center text-5xl bg-sky-100">🐱</div>
          </MiniWindow>
        ),
      },
      {
        key: "c",
        label: "A page of writing",
        visual: (
          <MiniWindow>
            <div className="p-2 space-y-1">
              {[90, 100, 80, 95, 60].map((w, i) => (
                <div key={i} className="h-2 bg-slate-300 rounded" style={{ width: `${w}%` }} />
              ))}
            </div>
          </MiniWindow>
        ),
      },
    ],
  },
  {
    q: "Which one looks like a TOOLBAR BUTTON?",
    correct: "b",
    good: "Brilliant! Toolbar buttons are small pictures you can click. 🖱️",
    bad: "Oops! Toolbar buttons are small PICTURE buttons in a row.",
    options: [
      {
        key: "a",
        label: "A scroll bar",
        visual: (
          <MiniWindow>
            <div className="h-24 flex justify-end p-1">
              <div className="w-4 h-full bg-slate-200 rounded relative">
                <div className="absolute top-3 inset-x-0 h-8 bg-slate-400 rounded" />
              </div>
            </div>
          </MiniWindow>
        ),
      },
      {
        key: "b",
        label: "A row of icon buttons",
        visual: (
          <MiniWindow>
            <div className="flex gap-1 p-2 bg-slate-100 justify-center">
              {[Save, Printer, Bold, Italic, Underline].map((I, i) => (
                <span key={i} className="w-7 h-7 rounded bg-white border border-slate-300 flex items-center justify-center">
                  <I size={16} />
                </span>
              ))}
            </div>
            <div className="h-12" />
          </MiniWindow>
        ),
      },
      {
        key: "c",
        label: "The clock",
        visual: (
          <MiniWindow>
            <div className="h-24 flex items-center justify-center text-3xl font-bold">10:45</div>
          </MiniWindow>
        ),
      },
    ],
  },
  {
    q: "What happens when we HOVER (rest the mouse) over a button?",
    correct: "b",
    good: "Yes! A little label called a TOOLTIP whispers the button's name. 💬",
    bad: "Funny guess! 😄 Try again – something small pops up…",
    options: [
      { key: "a", label: "The computer turns off", visual: <div className="text-6xl py-4">💥</div> },
      {
        key: "b",
        label: "A small label pops up",
        visual: (
          <div className="py-3 flex flex-col items-center">
            <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded mb-1">Save (Ctrl+S)</span>
            <span className="w-10 h-10 rounded bg-white text-slate-800 flex items-center justify-center relative">
              <Save size={22} />
              <span className="absolute -bottom-2 -right-2 text-xl">👆</span>
            </span>
          </div>
        ),
      },
      { key: "c", label: "The button disappears", visual: <div className="text-6xl py-4">👻</div> },
    ],
  },
];

export default function Intro({ onComplete, goNext, setAgent, agent }: MissionProps & { setAgent: (n: string) => void }) {
  const [phase, setPhase] = useState<Phase>("alert");
  const [count, setCount] = useState(10);
  const [name, setName] = useState(agent);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [done, setDone] = useState(false);

  // Countdown on alert screen
  useEffect(() => {
    if (phase !== "alert" || count <= 0) return;
    const t = setTimeout(() => {
      setCount((c) => c - 1);
      sfx.tick();
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, count]);

  const startMission = () => {
    sfx.unlock();
    setPhase("opening");
    setTimeout(() => setPhase("name"), 3000);
  };

  const q = QUESTIONS[qi];
  const answer = (key: string) => {
    if (picked === q.correct) return;
    setPicked(key);
    if (key === q.correct) {
      sfx.correct();
      if (firstTry) setScore((s) => s + 10);
    } else {
      sfx.wrong();
      setFirstTry(false);
    }
  };
  const nextQ = () => {
    if (qi < QUESTIONS.length - 1) {
      setQi(qi + 1);
      setPicked(null);
      setFirstTry(true);
    } else {
      onComplete(score);
      setDone(true);
    }
  };

  if (phase === "alert" || phase === "opening") {
    return (
      <div className="text-center">
        <div className="inline-flex bg-white rounded-2xl px-4 py-2 shadow-xl mb-5 animate-slide-up">
          <SchoolLogo height="h-16 md:h-24" className="max-w-[88vw] md:max-w-md" />
        </div>
        <div className="block"></div>
        <div className="inline-block rounded-2xl bg-rose-600 border-4 border-rose-300 px-6 py-2 font-display text-2xl md:text-4xl animate-pulse shadow-[0_0_40px_rgba(244,63,94,.6)]">
          ATTENTION, SECRET AGENTS! 🚨
        </div>
        <div className="mt-8 grid md:grid-cols-2 gap-8 items-center">
          <div className="relative">
            <Vault opening={phase === "opening"}>
              <div className="text-7xl">🗝️</div>
              <div className="font-display text-slate-900 text-xl mt-2">ACCESS GRANTED</div>
            </Vault>
            <div className="absolute -top-4 -right-2 text-5xl animate-float">🔎</div>
          </div>
          <Panel className="relative overflow-hidden scanline text-left">
            <div className="text-cyan-300 font-display text-sm tracking-widest mb-2">📡 INCOMING TRANSMISSION…</div>
            <p className="text-xl md:text-2xl leading-relaxed font-semibold">
              Your mission is to discover the <span className="text-yellow-300">hidden secrets</span> of computer programs.
            </p>
            <p className="text-xl md:text-2xl leading-relaxed font-semibold mt-3">
              Can you find the <span className="text-pink-300">commands</span>, recognise the <span className="text-cyan-300">icons</span>, and unlock the <span className="text-emerald-300">toolbar mysteries</span>?
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className={cn("w-24 h-24 rounded-full border-[6px] flex flex-col items-center justify-center font-display", count > 0 ? "border-yellow-300 text-yellow-300" : "border-emerald-400 text-emerald-300 animate-glow")}>
                <span className="text-4xl leading-none">{count}</span>
                <span className="text-[10px] tracking-wider">SECONDS</span>
              </div>
              <div className="text-lg text-white/80">{count > 0 ? "The vault is warming up… Get ready, Agent!" : "Vault ready! Press START MISSION!"}</div>
            </div>
            <div className="mt-6">
              <BigButton size="xl" onClick={startMission} disabled={phase === "opening"} className={cn("w-full", count === 0 && "animate-glow")}>
                {phase === "opening" ? "🔓 OPENING VAULT…" : "🚀 START MISSION"}
              </BigButton>
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  if (phase === "name") {
    return (
      <div className="max-w-xl mx-auto text-center animate-pop">
        <div className="text-7xl mb-3">🪪</div>
        <h2 className="font-display text-3xl md:text-4xl text-yellow-300 text-glow">AGENT ID CARD</h2>
        <p className="text-xl mt-2 text-cyan-100">Every secret agent needs a code name. What is yours?</p>
        <Panel className="mt-6">
          <input
            autoFocus
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setAgent(name.trim() || "Agent X");
                setPhase("quiz");
              }
            }}
            placeholder="Type your name…"
            className="w-full rounded-2xl bg-white text-slate-900 text-2xl font-bold px-5 py-4 text-center outline-none ring-4 ring-transparent focus:ring-yellow-300"
          />
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {["Agent Owl", "Captain Click", "Shadow Fox", "Pixel Ninja"].map((n) => (
              <button key={n} onClick={() => setName(n)} className="rounded-full bg-white/10 hover:bg-white/20 px-4 py-1.5 font-semibold cursor-pointer">
                {n}
              </button>
            ))}
          </div>
          <BigButton
            size="lg"
            className="mt-6 w-full"
            onClick={() => {
              setAgent(name.trim() || "Agent X");
              setPhase("quiz");
            }}
          >
            ✅ CONFIRM IDENTITY
          </BigButton>
        </Panel>
      </div>
    );
  }

  // QUIZ
  const isRight = picked === q.correct;
  return (
    <div>
      <div className="text-center mb-4">
        <div className="font-display text-cyan-300 tracking-widest text-sm">DECODER RING TRAINING · QUESTION {qi + 1} / 3</div>
        <div className="flex justify-center gap-2 mt-2">
          {QUESTIONS.map((_, i) => (
            <span key={i} className={cn("w-10 h-3 rounded-full", i < qi ? "bg-emerald-400" : i === qi ? "bg-yellow-300" : "bg-white/20")} />
          ))}
        </div>
      </div>
      <AgentSays mood="🕵️">
        Welcome, <span className="text-pink-600">{agent || "Agent"}</span>! Quick test before your first mission. Pick the right answer!
      </AgentSays>
      <h2 className="font-display text-2xl md:text-4xl text-center text-yellow-300 text-glow mb-6" key={qi}>
        {q.q}
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {q.options.map((o) => {
          const chosen = picked === o.key;
          return (
            <button
              key={o.key}
              onClick={() => answer(o.key)}
              className={cn(
                "btn-3d rounded-3xl p-4 border-4 bg-indigo-900/60 cursor-pointer flex flex-col items-center gap-3 animate-slide-up",
                chosen && o.key === q.correct && "border-emerald-400 bg-emerald-500/30",
                chosen && o.key !== q.correct && "border-rose-400 bg-rose-500/20 animate-shake",
                !chosen && "border-indigo-400/40 hover:border-yellow-300"
              )}
            >
              <div className="w-full min-h-28 flex items-center justify-center">{o.visual}</div>
              <span className="text-lg font-bold">{o.label}</span>
              {chosen && <span className="text-3xl">{o.key === q.correct ? "✅" : "❌"}</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-6 max-w-2xl mx-auto space-y-4">
        {picked && <Feedback kind={isRight ? "good" : "bad"}>{isRight ? q.good : q.bad}</Feedback>}
        {isRight && (
          <div className="text-center">
            <BigButton onClick={nextQ} variant="green">
              {qi < QUESTIONS.length - 1 ? "NEXT QUESTION ➜" : "FINISH TRAINING 🎉"}
            </BigButton>
          </div>
        )}
      </div>
      <BadgeModal
        open={done}
        emoji="🕶️"
        title="ROOKIE AGENT"
        message={`Training complete, ${agent || "Agent"}! You scored ${score} / 30. Mission 1 is now UNLOCKED!`}
        onContinue={goNext}
        onReplay={() => {
          setDone(false);
          setQi(0);
          setPicked(null);
          setScore(0);
          setFirstTry(true);
        }}
      />
    </div>
  );
}
