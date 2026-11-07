import { useEffect, useRef, useState } from "react";
import type { MissionProps } from "@/App";
import { AgentSays, BadgeModal, BigButton, Feedback, MissionHeader, Panel, ScorePill } from "@/components/ui";
import { AppWindow } from "@/components/AppWindow";
import { TOOLS, ToolIcon, shuffle, type ToolId } from "@/lib/icons";
import { sfx } from "@/lib/sound";
import { cn } from "@/utils/cn";

const MYSTERY: ToolId[] = ["spell", "painter", "table", "link", "highlight", "list"];

const WHO_QS: { q: string; answer: ToolId }[] = [
  { q: "Which button checks your SPELLING?", answer: "spell" },
  { q: "Which button adds a TABLE with rows and columns?", answer: "table" },
  { q: "Which button connects to a WEBSITE?", answer: "link" },
];

const HELP_CHOICES = [
  { key: "guess", label: "Guess randomly", emoji: "🎲", msg: "Guessing might break something! 😬 An agent needs a smarter plan." },
  { key: "help", label: "Search the program's Help option", emoji: "❓", msg: "" },
  { key: "close", label: "Close the program", emoji: "🚪", msg: "Then all your work disappears! 😱 Try again, Agent." },
];

interface Article {
  id: string;
  title: string;
  keywords: string[];
  steps: string[];
}

const ARTICLES: Article[] = [
  { id: "table", title: "How do I insert a table?", keywords: ["table", "tables", "insert", "rows", "columns", "grid"], steps: ["Click the INSERT menu.", "Click TABLE.", "Choose how many rows and columns.", "🔑 Secret code word: GRIDLOCK"] },
  { id: "save", title: "How do I save my work?", keywords: ["save", "saving", "keep", "floppy", "disk"], steps: ["Click the FILE menu, then SAVE.", "Or click the 💾 Save button on the toolbar.", "Or press Ctrl + S."] },
  { id: "print", title: "How do I print?", keywords: ["print", "printer", "printing", "paper"], steps: ["Click FILE ➜ PRINT.", "Or click the 🖨️ Print button.", "Choose your printer and click OK."] },
  { id: "bold", title: "How do I make text bold?", keywords: ["bold", "thick", "dark", "text", "font"], steps: ["Select (highlight) the words.", "Click the B button on the toolbar.", "Or press Ctrl + B."] },
  { id: "undo", title: "How do I undo a mistake?", keywords: ["undo", "mistake", "back", "oops", "wrong"], steps: ["Click EDIT ➜ UNDO.", "Or click the ↩️ Undo button.", "Or press Ctrl + Z."] },
  { id: "copy", title: "How do I copy and paste?", keywords: ["copy", "paste", "duplicate", "clipboard"], steps: ["Select the words.", "Click COPY (two pages icon).", "Click where you want them.", "Click PASTE (clipboard icon)."] },
  { id: "tooltip", title: "What is a tooltip?", keywords: ["tooltip", "tooltips", "hover", "mouseover", "button", "name", "icon"], steps: ["A tooltip is a small label.", "Rest your mouse over a button – don't click!", "Wait a moment and read its name."] },
  { id: "zoom", title: "How do I zoom in?", keywords: ["zoom", "bigger", "smaller", "see", "view", "magnify"], steps: ["Click the VIEW menu.", "Click ZOOM.", "Choose a bigger number to see more clearly."] },
  { id: "spell", title: "How do I check spelling?", keywords: ["spell", "spelling", "check", "grammar", "words"], steps: ["Click the Spelling (ABC ✓) button.", "Read each red word.", "Click the correct spelling."] },
];

function searchHelp(q: string): Article[] {
  const words = q.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !["how", "the", "and", "can", "what", "make", "add", "use", "does", "you"].includes(w));
  if (!words.length) return [];
  return ARTICLES.map((a) => ({ a, n: words.filter((w) => a.keywords.some((k) => k.startsWith(w) || w.startsWith(k))).length }))
    .filter((x) => x.n > 0)
    .sort((x, y) => y.n - x.n)
    .map((x) => x.a);
}

/** Mystery button that reveals a tooltip after hovering (or long-pressing). */
function WhisperButton({ id, onReveal, revealed }: { id: ToolId; onReveal: (id: ToolId) => void; revealed: boolean }) {
  const [show, setShow] = useState(false);
  const [charging, setCharging] = useState(false);
  const [nope, setNope] = useState(false);
  const t = useRef<number | undefined>(undefined);

  const begin = () => {
    setCharging(true);
    t.current = window.setTimeout(() => {
      setShow(true);
      setCharging(false);
      sfx.hover();
      onReveal(id);
    }, 800);
  };
  const end = () => {
    window.clearTimeout(t.current);
    setCharging(false);
    setShow(false);
  };
  useEffect(() => () => window.clearTimeout(t.current), []);

  return (
    <div className="relative">
      <button
        onMouseEnter={begin}
        onMouseLeave={end}
        onFocus={begin}
        onBlur={end}
        onTouchStart={begin}
        onTouchEnd={() => setTimeout(end, 1500)}
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => {
          sfx.wrong();
          setNope(true);
          setTimeout(() => setNope(false), 1400);
        }}
        className={cn(
          "relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white text-slate-700 border-4 flex items-center justify-center transition-all cursor-help",
          revealed ? "border-emerald-400" : "border-violet-300",
          nope && "animate-shake border-rose-500"
        )}
        style={{ touchAction: "manipulation" }}
      >
        <ToolIcon id={id} size={34} />
        {!revealed && <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-violet-500 text-white text-sm font-bold flex items-center justify-center">?</span>}
        {revealed && <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white text-sm flex items-center justify-center">✓</span>}
        {charging && <span className="absolute inset-0 rounded-xl border-4 border-yellow-300 animate-ping" />}
      </button>
      {show && (
        <div className="animate-tooltip absolute left-1/2 top-full mt-3 z-40 w-max max-w-56 rounded-xl bg-slate-900 text-white text-sm md:text-base font-semibold px-3 py-2 shadow-2xl border-2 border-yellow-300 text-center">
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-slate-900 border-l-2 border-t-2 border-yellow-300" />
          💬 {TOOLS[id].tip}
        </div>
      )}
      {nope && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-12 z-40 whitespace-nowrap rounded-xl bg-rose-500 text-white text-sm font-bold px-3 py-1.5 animate-pop">
          🙅 No clicking! Just hover!
        </div>
      )}
    </div>
  );
}

export default function Mission4({ onComplete, goNext }: MissionProps) {
  const [part, setPart] = useState<"hover" | "who" | "helpq" | "helpwin">("hover");
  const [found, setFound] = useState<ToolId[]>([]);
  const [score, setScore] = useState(0);
  const [wi, setWi] = useState(0);
  const [whoPick, setWhoPick] = useState<ToolId | null>(null);
  const [whoFirst, setWhoFirst] = useState(true);
  const [whoOrder, setWhoOrder] = useState<ToolId[]>(() => shuffle(MYSTERY));
  const [helpPick, setHelpPick] = useState<string | null>(null);
  const [helpFirst, setHelpFirst] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[] | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [helpDone, setHelpDone] = useState(false);
  const [done, setDone] = useState(false);

  const foundRef = useRef<ToolId[]>([]);
  foundRef.current = found;
  const reveal = (id: ToolId) => {
    if (foundRef.current.includes(id)) return;
    foundRef.current = [...foundRef.current, id];
    setFound(foundRef.current);
    setScore((s) => s + 5);
  };

  const whoQ = WHO_QS[wi];
  const pickWho = (id: ToolId) => {
    if (whoPick === whoQ.answer) return;
    setWhoPick(id);
    if (id === whoQ.answer) {
      sfx.correct();
      if (whoFirst) setScore((s) => s + 10);
    } else {
      sfx.wrong();
      setWhoFirst(false);
    }
  };
  const nextWho = () => {
    if (wi < WHO_QS.length - 1) {
      setWi(wi + 1);
      setWhoPick(null);
      setWhoFirst(true);
      setWhoOrder(shuffle(MYSTERY));
    } else {
      sfx.whoosh();
      setPart("helpq");
    }
  };

  const pickHelp = (k: string) => {
    if (helpPick === "help") return;
    setHelpPick(k);
    if (k === "help") {
      sfx.correct();
      if (helpFirst) setScore((s) => s + 10);
    } else {
      sfx.wrong();
      setHelpFirst(false);
    }
  };

  const doSearch = (q = query) => {
    setQuery(q);
    setArticle(null);
    sfx.click();
    setResults(searchHelp(q));
  };

  const openArticle = (a: Article) => {
    setArticle(a);
    sfx.click();
    if (a.id === "table" && !helpDone) {
      sfx.correct();
      setHelpDone(true);
      setScore((s) => s + 20);
    }
  };

  const finish = () => {
    onComplete(score);
    setDone(true);
  };

  const replay = () => {
    setPart("hover");
    setFound([]);
    setScore(0);
    setWi(0);
    setWhoPick(null);
    setWhoFirst(true);
    setHelpPick(null);
    setHelpFirst(true);
    setQuery("");
    setResults(null);
    setArticle(null);
    setHelpDone(false);
    setDone(false);
  };

  return (
    <div>
      <MissionHeader number="MISSION 4" emoji="🔍" title="The Whispering Button Mystery" subtitle="Some buttons hide their names. Rest your mouse on them and they will whisper!" />

      <div className="flex justify-center gap-2 mb-5 flex-wrap">
        {[
          ["hover", "1. Hover Hunt"],
          ["who", "2. Who Am I?"],
          ["helpq", "3. Agent Choice"],
          ["helpwin", "4. Help Window"],
        ].map(([k, l], i) => {
          const order = ["hover", "who", "helpq", "helpwin"];
          const idx = order.indexOf(part);
          return (
            <span key={k} className={cn("rounded-full px-4 py-1.5 font-bold text-sm", i < idx ? "bg-emerald-500" : i === idx ? "bg-yellow-400 text-slate-900" : "bg-white/10 text-white/50")}>
              {i < idx ? "✓ " : ""}{l}
            </span>
          );
        })}
        <ScorePill score={score} />
      </div>

      {part === "hover" && (
        <div className="animate-slide-up">
          <AgentSays mood="🤫">
            These buttons are hiding their identities! Can you discover their secrets <b>without clicking</b>? Rest your mouse on each one and wait… (On a tablet, press and hold.)
          </AgentSays>
          <AppWindow title="Mystery Program – ???.doc" status={<span>🕵️ Discovered {found.length} of {MYSTERY.length} secret buttons</span>}>
            <div className="bg-gradient-to-b from-violet-100 to-slate-100 p-5 md:p-8 pb-24 md:pb-28">
              <div className="text-center text-slate-500 font-bold mb-4 text-sm tracking-widest">— MYSTERY TOOLBAR —</div>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {MYSTERY.map((id) => (
                  <WhisperButton key={id} id={id} onReveal={reveal} revealed={found.includes(id)} />
                ))}
              </div>
            </div>
          </AppWindow>

          <Panel className="mt-5">
            <div className="font-display text-yellow-300 mb-3">📁 CASE FILE: SECRET IDENTITIES</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MYSTERY.map((id) => {
                const f = found.includes(id);
                return (
                  <div key={id} className={cn("flex items-center gap-3 rounded-2xl p-3 border-2", f ? "bg-emerald-500/20 border-emerald-400 animate-pop" : "bg-white/5 border-dashed border-white/20")}>
                    <div className="w-12 h-12 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0">
                      <ToolIcon id={id} size={26} />
                    </div>
                    <div>
                      <div className="font-display">{f ? TOOLS[id].name.toUpperCase() : "??? UNKNOWN"}</div>
                      <div className="text-sm text-white/70">{f ? TOOLS[id].tip.split("–")[1]?.trim() : "Hover to reveal"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {found.length === MYSTERY.length && (
            <div className="mt-5 text-center space-y-3 animate-pop">
              <Feedback kind="good">🎉 All secrets discovered! Tooltips are an agent's best friend!</Feedback>
              <BigButton onClick={() => { sfx.whoosh(); setPart("who"); }}>NEXT: WHO AM I? ➜</BigButton>
            </div>
          )}
        </div>
      )}

      {part === "who" && (
        <div className="animate-slide-up max-w-3xl mx-auto">
          <AgentSays mood="🧐">Use your tooltip powers! Hover if you forget, then click the right button.</AgentSays>
          <Panel className="text-center">
            <div className="text-sm font-bold text-cyan-300 tracking-widest">QUESTION {wi + 1} / {WHO_QS.length}</div>
            <h2 key={wi} className="font-display text-2xl md:text-3xl text-yellow-300 my-4 animate-pop">{whoQ.q}</h2>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 pb-10">
              {whoOrder.map((id) => (
                <div key={id} className="relative group">
                  <button
                    onClick={() => pickWho(id)}
                    className={cn(
                      "w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white text-slate-700 border-4 flex items-center justify-center btn-3d cursor-pointer",
                      whoPick === id && id === whoQ.answer && "border-emerald-500 bg-emerald-100",
                      whoPick === id && id !== whoQ.answer && "border-rose-500 animate-shake",
                      whoPick !== id && "border-transparent"
                    )}
                  >
                    <ToolIcon id={id} size={34} />
                  </button>
                  <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded-lg bg-slate-900 border border-yellow-300 text-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity delay-500 z-30">
                    {TOOLS[id].name}
                  </div>
                </div>
              ))}
            </div>
            {whoPick && (
              <Feedback kind={whoPick === whoQ.answer ? "good" : "bad"}>
                {whoPick === whoQ.answer ? `✅ Correct! That's the ${TOOLS[whoQ.answer].name} button.` : `❌ That's ${TOOLS[whoPick].name}. Hover to read the tooltips!`}
              </Feedback>
            )}
            {whoPick === whoQ.answer && (
              <BigButton className="mt-4" variant="green" onClick={nextWho}>
                {wi < WHO_QS.length - 1 ? "NEXT QUESTION ➜" : "NEXT PART ➜"}
              </BigButton>
            )}
          </Panel>
        </div>
      )}

      {part === "helpq" && (
        <div className="animate-slide-up max-w-4xl mx-auto">
          <AgentSays mood="🤔">Uh-oh! You need to add a TABLE but you can't find how. 😟</AgentSays>
          <h2 className="font-display text-2xl md:text-4xl text-center text-yellow-300 text-glow mb-6">What should an agent do when they cannot find an answer?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {HELP_CHOICES.map((c) => (
              <button
                key={c.key}
                onClick={() => pickHelp(c.key)}
                className={cn(
                  "btn-3d rounded-3xl p-6 border-4 cursor-pointer flex flex-col items-center gap-3 bg-indigo-900/60",
                  helpPick === c.key && c.key === "help" && "border-emerald-400 bg-emerald-500/30",
                  helpPick === c.key && c.key !== "help" && "border-rose-400 bg-rose-500/20 animate-shake",
                  helpPick !== c.key && "border-indigo-400/40 hover:border-yellow-300"
                )}
              >
                <span className="text-6xl">{c.emoji}</span>
                <span className="text-xl font-bold">{c.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 text-center space-y-3">
            {helpPick && (
              <Feedback kind={helpPick === "help" ? "good" : "bad"}>
                {helpPick === "help" ? "✅ Smart agent! The HELP option (or pressing F1) has answers to your questions!" : HELP_CHOICES.find((c) => c.key === helpPick)!.msg}
              </Feedback>
            )}
            {helpPick === "help" && (
              <BigButton onClick={() => { sfx.unlock(); setPart("helpwin"); }}>❓ OPEN THE HELP WINDOW</BigButton>
            )}
          </div>
        </div>
      )}

      {part === "helpwin" && (
        <div className="animate-slide-up">
          <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 px-6 py-3 text-center text-xl md:text-2xl font-display shadow-xl mb-4">
            🎯 Use HELP to find out: How do I insert a TABLE?
          </div>
          <AppWindow title="❓ AgentWriter Help" status={<span>{helpDone ? "✅ Answer found! Secret code: GRIDLOCK" : "Type a question and press Search"}</span>}>
            <div className="bg-white p-4 md:p-6">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-xl border-4 border-blue-400 px-3 bg-white">
                  <span className="text-2xl">🔎</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                    placeholder="Type your question… e.g. table"
                    className="flex-1 py-3 text-lg md:text-xl outline-none text-slate-800 bg-transparent"
                  />
                </div>
                <button onClick={() => doSearch()} className="btn-3d rounded-xl bg-blue-600 text-white px-5 md:px-8 text-lg font-bold cursor-pointer">
                  Search
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <span className="text-slate-500 text-sm font-semibold">Try:</span>
                {["insert table", "save", "undo mistake", "what is a tooltip", "zoom"].map((s) => (
                  <button key={s} onClick={() => doSearch(s)} className="rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 text-sm font-semibold cursor-pointer">
                    {s}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid md:grid-cols-[1fr_1.3fr] gap-4 min-h-56">
                <div className="space-y-2">
                  {results === null && <div className="text-slate-400 text-lg p-4 text-center">🤖 Hi! I'm the Help Bot. Ask me anything!</div>}
                  {results !== null && results.length === 0 && (
                    <div className="rounded-xl bg-orange-100 text-orange-800 p-4 font-semibold animate-pop">😕 No results. Try one simple word, like “table”.</div>
                  )}
                  {results?.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => openArticle(a)}
                      className={cn("w-full text-left rounded-xl px-4 py-3 font-bold text-lg border-2 cursor-pointer animate-slide-up", article?.id === a.id ? "bg-blue-600 text-white border-blue-700" : "bg-slate-50 text-blue-700 border-slate-200 hover:bg-blue-50")}
                    >
                      📄 {a.title}
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl bg-slate-50 border-2 border-slate-200 p-4 text-slate-800">
                  {article ? (
                    <div className="animate-pop">
                      <h4 className="text-xl font-bold text-blue-700">{article.title}</h4>
                      <ol className="mt-3 space-y-2">
                        {article.steps.map((s, i) => (
                          <li key={i} className={cn("flex gap-3 text-lg", s.startsWith("🔑") && "bg-yellow-200 rounded-lg p-2 font-bold")}>
                            {!s.startsWith("🔑") && <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>}
                            {s}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-center py-10 text-lg">Click a result to read it 📖</div>
                  )}
                </div>
              </div>
            </div>
          </AppWindow>
          <div className="mt-5 text-center space-y-3">
            {helpDone && (
              <>
                <Feedback kind="good">🎉 You used Help like a pro and found the secret code: GRIDLOCK!</Feedback>
                <BigButton size="lg" onClick={finish}>🏅 CLAIM MY BADGE</BigButton>
              </>
            )}
          </div>
        </div>
      )}

      <BadgeModal
        open={done}
        emoji="🔍"
        title="WHISPER DETECTIVE"
        message="You uncovered secret tooltips and used Help to find answers. Next: the Ultimate Treasure Hunt!"
        stats={<ScorePill score={score} />}
        onContinue={goNext}
        onReplay={replay}
        continueLabel="FINAL MISSION 💎"
      />
    </div>
  );
}
