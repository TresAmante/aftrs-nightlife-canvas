import { cn } from "@/lib/utils";

/** Floating, blurred gradient field used behind dark sections. */
export function Aurora({ className, dense = false }: { className?: string; dense?: boolean }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="animate-drift absolute -top-40 -left-32 h-[46rem] w-[46rem] rounded-full bg-violet/25 blur-[140px]" />
      <div className="animate-drift-slow absolute -top-24 right-[-10rem] h-[38rem] w-[38rem] rounded-full bg-electric/20 blur-[150px]" />
      {dense && (
        <div className="animate-pulse-glow absolute bottom-[-14rem] left-1/3 h-[34rem] w-[34rem] rounded-full bg-crimson/15 blur-[160px]" />
      )}
      <div className="absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:88px_88px] opacity-[0.35] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
    </div>
  );
}