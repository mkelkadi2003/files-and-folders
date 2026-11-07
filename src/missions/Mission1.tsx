import { useEffect, useRef, useState } from "react";
import type { MissionProps } from "@/App";
import { AgentSays, BadgeModal, BigButton, Feedback, MissionHeader, Panel, ScorePill } from "@/components/ui";
import { AppWindow } from "@/components/AppWindow";
import { sfx } from "@/lib/sound";
import { cn } from "@/utils/cn";

type MenuName = "File" | "Edit" | "View" | "Insert" | "Help";

const MENUS: Record<MenuName, { cmd: string; key?: string; icon: string }[]> = {
  File: [
    { cmd: "New", key: "Ctrl+N", icon: "📄" },
    { cmd: "Open", key: "Ctrl+O", icon: "📂" },
    { cmd: "Save", key: "Ctrl+S", icon: "💾" },
    { cmd: "Save As", icon: "🗂️" },
    { cmd: "Print", key: "Ctrl+P", icon: "🖨️" },
    { cmd: "Close", icon: "❌" },
  ],
  Edit: [
    { cmd: "Undo", key: "Ctrl+Z", icon: "↩️" },
    { cmd: "Redo", key: "Ctrl+Y", icon: "↪️" },
    { cmd: "Cut", key: "Ctrl+X", icon: "✂️" },
    { cmd: "Copy", key: "Ctrl+C", icon: "📑" },
    { cmd: "Paste", key: "Ctrl+V", icon: "📋" },
    { cmd: "Select All", key: "Ctrl+A", icon: "🔲" },
  ],
  View: [
    { cmd: "Zoom", icon: "🔍" },
    { cmd: "Ruler", icon: "📏" },
    { cmd: "Full Screen", icon: "🖥️" },
    { cmd: "Print Layout", icon: "📃" },
    { cmd: "Gridlines", icon: "#️⃣" },
  ],
  Insert: [
    { cmd: "Picture", icon: "🖼️" },
    { cmd: "Table", icon: "▦" },
    { cmd: "Link", icon: "🔗" },
    { cmd: "Page Number", icon: "🔢" },
  ],
  Help: [
    { cmd: "Help Topics", key: "F1", icon: "❓" },
    { cmd: "Search Help", icon: "🔎" },
    { cmd: "About", icon: "ℹ️" },
  ],
};

const MENU_INFO: Record<"File" | "Edit" | "View", { emoji: string; text: string; color: string }> = {
  File: { emoji: "📁", text: "Things you do to the WHOLE file: New, Open, Save, Print.", color: "from-sky-500 to-blue-600" },
  Edit: { emoji: "✏️", text: "Change your work: Undo, Cut, Copy, Paste.", color: "from-pink-500 to-rose-600" },
  View: { emoji: "👀", text: "Change how you SEE the page: Zoom, Ruler, Full Screen.", color: "from-emerald-500 to-teal-600" },
};

const TASKS: { cmd: string; menu: MenuName; result: string }[] = [
  { cmd: "Open", menu: "File", result: "📂 Secret_Map.doc has been OPENED!" },
  { cmd: "Copy", menu: "Edit", result: "📑 The secret code was COPIED to the clipboard!" },
  { cmd: "Zoom", menu: "View", result: "🔍 ZOOMED in! Now you can see the tiny clues!" },
  { cmd: "Print", menu: "File", result: "🖨️ The map is PRINTING… brrrrr!" },
  { cmd: "Undo", menu: "Edit", result: "↩️ UNDO! The last mistake has vanished!" },
  { cmd: "Full Screen", menu: "View", result: "🖥️ FULL SCREEN mode – super big view!" },
];

const FUNNY = [
  "Oops! That button makes pancakes, not secrets! 🥞",
  "Nope! The computer is giggling at you. 😂",
  "Whoa! That's a banana, Agent! 🍌 Try again!",
  "Wrong drawer! You found my old socks! 🧦",
  "Beep boop! Not that one! 🤖",
  "Close, but the treasure isn't there! 🏝️",
];

export default function Mission1({ onComplete, goNext }: MissionProps) {
  const [explored, setExplored] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<"explore" | "hunt">("explore");
  const [open, setOpen] = useState<MenuName | null>(null);
  const [ti, setTi] = useState(0);
  const [fb, setFb] = useState<{ kind: "good" | "bad" | "info"; msg: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [taskMistakes, setTaskMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("Ready, Agent.");
  const [zoomed, setZoomed] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [done, setDone] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const task = TASKS[ti];

  const clickMenu = (m: MenuName) => {
    sfx.click();
    setOpen(open === m ? null : m);
    if (phase === "explore") {
      const n = new Set(explored);
      n.add(m);
      setExplored(n);
    }
  };

  const pickCommand = (m: MenuName, cmd: string) => {
    setOpen(null);
    if (phase === "explore") {
      setStatus(`You clicked ${m} ➜ ${cmd}`);
      return;
    }
    if (waiting) return;
    if (cmd === task.cmd && m === task.menu) {
      sfx.correct();
      const pts = taskMistakes === 0 ? 20 : 10;
      setScore((s) => s + pts);
      setFb({ kind: "good", msg: `✅ MISSION SUCCESS! You found ${cmd.toUpperCase()} in the ${m} menu! +${pts}` });
      setStatus(task.result);
      if (cmd === "Zoom") setZoomed(true);
      setWaiting(true);
    } else {
      sfx.wrong();
      setMistakes((x) => x + 1);
      setTaskMistakes((x) => x + 1);
      const hint = taskMistakes >= 1 ? ` Hint: look in the ${task.menu.toUpperCase()} menu!` : "";
      setFb({ kind: "bad", msg: FUNNY[Math.floor(Math.random() * FUNNY.length)] + hint });
      setStatus(`You clicked ${m} ➜ ${cmd}. That's not it!`);
    }
  };

  const nextTask = () => {
    setWaiting(false);
    setFb(null);
    setTaskMistakes(0);
    if (ti < TASKS.length - 1) {
      setTi(ti + 1);
    } else {
      onComplete(score);
      setDone(true);
    }
  };

  const replay = () => {
    setDone(false);
    setTi(0);
    setScore(0);
    setMistakes(0);
    setTaskMistakes(0);
    setFb(null);
    setZoomed(false);
    setWaiting(false);
    setStatus("Ready, Agent.");
  };

  const exploredMain = ["File", "Edit", "View"].filter((m) => explored.has(m)).length;

  return (
    <div>
      <MissionHeader number="MISSION 1" emoji="🔓" title="The Menu Vault Crackers" subtitle="Menus hide commands inside them. Click a menu name to open it!" />

      {phase === "explore" ? (
        <AgentSays>
          First, explore! Click on <b>File</b>, <b>Edit</b> and <b>View</b> to peek inside each menu. ({exploredMain}/3 explored)
        </AgentSays>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
          <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 px-5 py-3 text-xl md:text-2xl font-bold shadow-lg animate-pop" key={ti}>
            🎯 Task {ti + 1}/{TASKS.length}: Find <span className="font-display text-yellow-200">{task.cmd.toUpperCase()}</span> inside the <span className="underline">{task.menu}</span> menu!
          </div>
          <ScorePill score={score} />
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <AppWindow title="AgentWriter – Top_Secret_Mission.doc" status={<span>💬 {status}</span>}>
          {/* Menu bar */}
          <div ref={barRef} className="relative flex gap-1 bg-white border-b border-slate-300 px-2 py-1 z-20">
            {(Object.keys(MENUS) as MenuName[]).map((m) => (
              <div key={m} className="relative">
                <button
                  onClick={() => clickMenu(m)}
                  className={cn(
                    "px-3 md:px-4 py-2 rounded-lg text-base md:text-lg font-bold cursor-pointer transition-colors",
                    open === m ? "bg-blue-600 text-white" : "hover:bg-blue-100",
                    phase === "explore" && ["File", "Edit", "View"].includes(m) && !explored.has(m) && "ring-2 ring-yellow-400 animate-pulse"
                  )}
                >
                  {m}
                </button>
                {open === m && (
                  <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-xl shadow-2xl border-2 border-slate-300 py-1 animate-pop origin-top-left z-30">
                    {MENUS[m].map((c) => (
                      <button
                        key={c.cmd}
                        onClick={() => pickCommand(m, c.cmd)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-base md:text-lg hover:bg-blue-600 hover:text-white cursor-pointer group"
                      >
                        <span className="w-6 text-center">{c.icon}</span>
                        <span className="flex-1 font-semibold">{c.cmd}</span>
                        {c.key && <span className="text-xs text-slate-400 group-hover:text-blue-100">{c.key}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Document */}
          <div className="bg-slate-300 p-4 md:p-6 min-h-72 overflow-hidden">
            <div className={cn("bg-white mx-auto max-w-xl rounded shadow-lg p-6 transition-all duration-700 origin-top", zoomed && "scale-110")}>
              <h3 className="text-2xl font-bold text-center text-slate-900">🗺️ TOP SECRET MISSION</h3>
              <p className="mt-3 text-lg leading-relaxed">
                Dear Agent, the treasure is hidden inside the computer. Use the <b>menus</b> to find each command. Every command you find gets you closer to the vault!
              </p>
              <p className={cn("mt-3 text-center font-mono transition-all", zoomed ? "text-xl text-pink-600 font-bold" : "text-[9px] text-slate-400")}>
                tiny clue: menus = lists of commands
              </p>
              <div className="mt-4 flex gap-2 justify-center">
                {TASKS.map((t, i) => (
                  <span key={t.cmd} className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm", i < ti || (i === ti && waiting) ? "bg-emerald-400" : "bg-slate-200")}>
                    {i < ti || (i === ti && waiting) ? "🔑" : "🔒"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AppWindow>

        {/* Side info */}
        <div className="space-y-3">
          {(Object.keys(MENU_INFO) as (keyof typeof MENU_INFO)[]).map((m) => {
            const seen = explored.has(m);
            return (
              <div key={m} className={cn("rounded-2xl p-4 transition-all", seen ? `bg-gradient-to-br ${MENU_INFO[m].color} animate-pop` : "bg-white/5 border-2 border-dashed border-white/20")}>
                <div className="font-display text-xl">
                  {seen ? MENU_INFO[m].emoji : "❔"} {m} menu
                </div>
                <p className="text-base font-semibold mt-1">{seen ? MENU_INFO[m].text : "Click this menu to unlock its secret!"}</p>
              </div>
            );
          })}
          {phase === "hunt" && (
            <Panel className="!p-4 text-center">
              <div className="text-sm text-white/70">Oopsies so far</div>
              <div className="font-display text-3xl text-rose-300">{mistakes}</div>
            </Panel>
          )}
        </div>
      </div>

      <div className="mt-5 max-w-3xl mx-auto space-y-4 text-center">
        {phase === "explore" && exploredMain === 3 && (
          <div className="animate-pop space-y-3">
            <Feedback kind="good">🎉 Great exploring! You know where commands live. Now the real hunt begins!</Feedback>
            <BigButton size="lg" onClick={() => { sfx.unlock(); setPhase("hunt"); setStatus("Find the hidden command!"); }}>
              🔍 START THE HUNT
            </BigButton>
          </div>
        )}
        {fb && <Feedback kind={fb.kind}>{fb.msg}</Feedback>}
        {waiting && (
          <BigButton variant="green" onClick={nextTask}>
            {ti < TASKS.length - 1 ? "NEXT TASK ➜" : "CRACK THE VAULT 🔓"}
          </BigButton>
        )}
      </div>

      <BadgeModal
        open={done}
        emoji="🔓"
        title="VAULT CRACKER"
        message="You found every hidden command in the File, Edit and View menus!"
        stats={
          <div className="flex justify-center gap-3">
            <ScorePill score={score} />
            <div className="rounded-2xl px-4 py-2 bg-white/10 font-bold">Oopsies: {mistakes}</div>
          </div>
        }
        onContinue={goNext}
        onReplay={replay}
      />
    </div>
  );
}
