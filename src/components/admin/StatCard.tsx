import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  caption,
  icon: Icon,
  accent = "violet",
}: {
  label: string;
  value: string;
  delta?: number;
  caption?: string;
  icon: LucideIcon;
  accent?: "violet" | "electric" | "crimson";
}) {
  const up = (delta ?? 0) >= 0;
  const ring = {
    violet: "border-primary/30 bg-primary/10 text-violet-soft",
    electric: "border-accent/30 bg-accent/10 text-accent",
    crimson: "border-destructive/30 bg-destructive/10 text-destructive",
  }[accent];

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-surface/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/35">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 h-36 w-36 rounded-full bg-violet/15 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative flex items-start justify-between gap-4">
        <p className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase">{label}</p>
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl border", ring)}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="relative mt-5 font-display text-3xl leading-none font-extrabold">{value}</p>
      {delta === undefined ? (
        caption ? (
          <p className="relative mt-3 text-xs text-muted-foreground">{caption}</p>
        ) : null
      ) : (
      <p
        className={cn(
          "relative mt-3 inline-flex items-center gap-1.5 text-xs",
          up ? "text-emerald-300" : "text-destructive",
        )}
      >
        {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
        {up ? "+" : ""}
        {delta}% vs last month
      </p>
      )}
    </div>
  );
}