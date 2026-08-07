import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 transition-shadow duration-500 group-hover:shadow-[0_0_26px_-4px_var(--violet)]">
        <span className="font-display text-[0.72rem] leading-none font-extrabold brand-gradient-text">
          AF
        </span>
        <span className="absolute inset-0 rounded-xl [background-image:var(--gradient-brand)] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-40" />
      </span>
      {!compact && (
        <span className="font-display text-lg leading-none font-extrabold tracking-[-0.06em]">
          AFTRS
        </span>
      )}
    </span>
  );
}