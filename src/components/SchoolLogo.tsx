import { cn } from "@/utils/cn";

/**
 * Al-Bassam Schools logo.
 * Put the logo image at:  src/assets/logo.png   (or .jpg / .jpeg / .webp / .svg)
 * It is picked up automatically and embedded in the build.
 * If no file exists yet, a text wordmark is shown instead.
 */
const found = import.meta.glob("/src/assets/logo.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const logoUrl = Object.values(found)[0] as string | undefined;

export function SchoolLogo({ className, height = "h-12" }: { className?: string; height?: string }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="Al-Bassam Schools – مدارس البسام" className={cn("w-auto object-contain", height, className)} />;
  }
  return (
    <div className={cn("flex items-center gap-2 text-[#2a1a56] leading-none", className)} aria-label="Al-Bassam Schools">
      <div className="w-10 h-10 rounded-full border-[4px] border-[#2a1a56] flex items-center justify-center font-display text-sm">BS</div>
      <div className="text-left">
        <div className="font-extrabold text-base whitespace-nowrap">Al-Bassam Schools</div>
        <div className="font-bold text-sm text-right" dir="rtl">مدارس البسام</div>
      </div>
    </div>
  );
}
