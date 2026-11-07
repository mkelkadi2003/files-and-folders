import type { ReactNode } from "react";

export function AppWindow({ title, children, status }: { title: string; children: ReactNode; status?: ReactNode }) {
  return (
    <div className="rounded-2xl overflow-visible bg-slate-100 text-slate-800 shadow-2xl border-4 border-slate-700">
      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-3 py-2 rounded-t-xl">
        <span className="text-lg">📝</span>
        <span className="font-bold text-sm md:text-base truncate flex-1">{title}</span>
        <span className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-xs">—</span>
        <span className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-xs">▢</span>
        <span className="w-6 h-6 rounded bg-rose-500 flex items-center justify-center text-xs">✕</span>
      </div>
      {children}
      {status !== undefined && (
        <div className="bg-slate-200 border-t border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 rounded-b-xl min-h-8">{status}</div>
      )}
    </div>
  );
}
