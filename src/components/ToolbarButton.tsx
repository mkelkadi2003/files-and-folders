import { TOOLS, ToolIcon, type ToolId } from "@/lib/icons";
import { cn } from "@/utils/cn";

export function ToolbarButton({
  id,
  onClick,
  showLabel,
  active,
  glow,
  state,
  tooltip = true,
  size = "md",
}: {
  id: ToolId;
  onClick?: () => void;
  showLabel?: boolean;
  active?: boolean;
  glow?: boolean;
  state?: "good" | "bad" | null;
  tooltip?: boolean;
  size?: "md" | "lg";
}) {
  const t = TOOLS[id];
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        aria-label={t.name}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 transition-all cursor-pointer",
          size === "lg" ? "w-16 h-16 md:w-[72px] md:h-[72px]" : "w-12 h-12 md:w-14 md:h-14",
          showLabel && "h-auto py-1.5",
          active ? "bg-blue-200 border-blue-500" : "bg-white border-slate-300 hover:bg-blue-50 hover:border-blue-400 hover:-translate-y-0.5",
          glow && "ring-4 ring-yellow-400 animate-pulse",
          state === "good" && "bg-emerald-200 border-emerald-500 scale-110",
          state === "bad" && "bg-rose-200 border-rose-500 animate-shake"
        )}
      >
        <ToolIcon id={id} size={size === "lg" ? 30 : 24} className="text-slate-700" />
        {showLabel && <span className="text-[11px] font-bold text-slate-600 mt-0.5">{t.name}</span>}
      </button>
      {tooltip && (
        <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 text-white text-sm font-semibold px-3 py-1.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity delay-300 z-40">
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-slate-900" />
          <span className="relative">{t.name}</span>
        </div>
      )}
    </div>
  );
}
