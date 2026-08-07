import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  paid: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  valid: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  active: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  "on sale": "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  invited: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  "almost gone": "border-amber-400/30 bg-amber-400/10 text-amber-300",
  refunded: "border-accent/40 bg-accent/10 text-accent",
  used: "border-border bg-secondary/60 text-muted-foreground",
  draft: "border-border bg-secondary/60 text-muted-foreground",
  failed: "border-destructive/40 bg-destructive/12 text-destructive",
  suspended: "border-destructive/40 bg-destructive/12 text-destructive",
  "sold out": "border-destructive/40 bg-destructive/12 text-destructive",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = tones[status.toLowerCase()] ?? "border-primary/40 bg-primary/10 text-violet-soft";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.08em] whitespace-nowrap uppercase",
        tone,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}