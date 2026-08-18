import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";

import { StatusBadge } from "@/components/site/StatusBadge";
import { formatDay, formatMonth, cn } from "@/lib/utils";
import type { EventWithTiers } from "@/lib/events-api";

export function EventCard({ event, className }: { event: EventWithTiers; className?: string }) {
  const pct = event.capacity > 0 ? Math.round((event.sold / event.capacity) * 100) : 0;
  const image = event.image_url ?? "";

  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.slug }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-surface/60 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_40px_90px_-50px_var(--violet)]",
        className,
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        {image ? (
          <img src={image} alt={`${event.name} at ${event.venue ?? ""}`} loading="lazy" width={1200} height={900} className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]" />
        ) : (
          <div className="h-full w-full bg-secondary/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/25 to-transparent" />
        <div className="absolute top-4 left-4 flex flex-col items-center rounded-2xl border border-border bg-background/70 px-3 py-2 backdrop-blur-md">
          <span className="font-display text-xl leading-none font-extrabold">{formatDay(event.event_date)}</span>
          <span className="mt-1 text-[0.6rem] tracking-[0.18em] text-muted-foreground">{formatMonth(event.event_date)}</span>
        </div>
        <div className="absolute top-4 right-4"><StatusBadge status={event.status} /></div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">{event.genre ?? ""}</p>
        <h3 className="mt-2 font-display text-xl leading-tight font-extrabold sm:text-2xl">{event.name}</h3>
        <p className="mt-2.5 line-clamp-1 text-sm leading-relaxed text-muted-foreground">{event.tagline ?? ""} — {event.description ?? ""}</p>
        <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0 text-violet-soft" />
          <span className="truncate">{event.venue ?? "TBA"}, {event.city}</span>
        </div>
        <div className="mt-5">
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full [background-image:var(--gradient-brand)]" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[0.7rem] text-muted-foreground">{pct}% claimed</p>
        </div>
        <div className="mt-5 flex items-end justify-between border-t border-border pt-5">
          <div>
            <p className="text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase">From</p>
            <p className="font-display text-xl font-extrabold">₱{event.price.toLocaleString()}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium transition-all group-hover:border-primary/50 group-hover:bg-primary/15">
            View details <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
