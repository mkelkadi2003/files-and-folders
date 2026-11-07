import { useEffect } from "react";
import type { Badge } from "@/App";
import { BigButton, Confetti } from "@/components/ui";
import { SchoolLogo } from "@/components/SchoolLogo";
import { sfx } from "@/lib/sound";

const LEARNED = [
  "I can find commands in the File, Edit and View menus.",
  "I can match toolbar icons to menu commands.",
  "I can use toolbar buttons to do jobs quickly.",
  "I can hover to read tooltips on unfamiliar buttons.",
  "I can use the Help option when I am stuck.",
];

export default function Certificate({ agent, badges, totalScore, onRestart }: { agent: string; badges: Badge[]; totalScore: number; onRestart: () => void }) {
  useEffect(() => {
    sfx.fanfare();
  }, []);
  const date = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <div className="print:hidden">
        <Confetti count={100} />
      </div>
      <div className="relative mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 text-slate-800 p-3 shadow-2xl animate-pop print:shadow-none">
        <div className="rounded-[1.6rem] border-[6px] border-double border-amber-500 p-6 md:p-10 text-center relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-yellow-300/40" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-pink-300/30" />
          <div className="relative">
            <div className="flex justify-center mb-3">
              <SchoolLogo height="h-16 md:h-24" className="max-w-full" />
            </div>
            <div className="text-5xl">🕵️‍♀️🏆🕵️</div>
            <div className="font-display text-amber-600 tracking-widest text-sm md:text-base mt-2">TOP SECRET · AGENT HQ</div>
            <h1 className="font-display text-3xl md:text-5xl text-indigo-800 mt-2">Certificate of Achievement</h1>
            <p className="text-lg md:text-xl mt-4">This certifies that</p>
            <div className="font-display text-4xl md:text-6xl text-pink-600 my-3 break-words">{agent || "Agent X"}</div>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              has completed every mission of <b>The Menu & Toolbar Treasure Hunt</b> and is now an official
            </p>
            <div className="mt-3 inline-block rounded-2xl bg-indigo-700 text-yellow-300 font-display text-2xl md:text-3xl px-6 py-3 shadow-lg">👑 MASTER CODE BREAKER 👑</div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {badges.map((b) => (
                <div key={b.title} className="flex flex-col items-center w-24">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center text-3xl shadow-md border-4 border-white">{b.emoji}</div>
                  <span className="text-xs font-bold mt-1 leading-tight">{b.title}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-2 text-left max-w-3xl mx-auto">
              {LEARNED.map((l) => (
                <div key={l} className="flex gap-2 items-start bg-white/70 rounded-xl px-3 py-2 text-sm md:text-base font-semibold">
                  <span>✅</span> {l}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-6 text-left">
              <div>
                <div className="text-sm text-slate-500 font-semibold">Total Mission Points</div>
                <div className="font-display text-3xl text-indigo-700">⭐ {totalScore}</div>
              </div>
              <div className="text-center">
                <div className="font-display text-xl text-slate-700 italic">Chief Pixel</div>
                <div className="w-44 border-t-2 border-slate-500 mt-1 pt-1 text-sm text-slate-500 font-semibold">Chief of Computer Spies</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500 font-semibold">Date</div>
                <div className="font-bold text-lg">{date}</div>
              </div>
            </div>
          </div>
          <div className="absolute top-6 right-6 w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-rose-500 to-red-700 text-white flex flex-col items-center justify-center rotate-12 shadow-lg border-4 border-rose-300">
            <span className="text-2xl">🔐</span>
            <span className="font-display text-[10px]">APPROVED</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
        <BigButton variant="cyan" onClick={() => window.print()}>🖨️ PRINT CERTIFICATE</BigButton>
        <BigButton variant="pink" onClick={onRestart}>🔁 PLAY THE WHOLE HUNT AGAIN</BigButton>
      </div>
    </div>
  );
}
