import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, QrCode } from "lucide-react";

import { StatusBadge } from "@/components/site/StatusBadge";
import { formatDate, getEvent, type MyTicket } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function TicketStub({ ticket }: { ticket: MyTicket }) {
  const event = getEvent(ticket.eventId);
  if (!event) return null;
  const dimmed = ticket.state !== "Valid";

  return (
    <article
      className={cn(
        "group relative grid overflow-hidden rounded-3xl border border-border bg-surface/70 transition-all duration-500 sm:grid-cols-[1.35fr_auto_0.85fr]",
        dimmed ? "opacity-60" : "hover:border-primary/40 hover:shadow-[0_36px_90px_-50px_var(--violet)]",
      )}
    >
      <div className="relative">
        <img
          src={event.image}
          alt={event.name}
          loading="lazy"
          width={1200}
          height={900}
          className="absolute inset-0 h-full w-full object-cover opacity-35 transition-transform duration-[1400ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-surface/40" />
        <div className="relative p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">
              {event.genre}
            </p>
            <StatusBadge status={ticket.state} />
          </div>
          <h3 className="mt-3 font-display text-2xl leading-tight font-extrabold">{event.name}</h3>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-3.5 text-violet-soft" />
              {formatDate(event.date)} · {event.time}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-3.5 text-violet-soft" />
              {event.venue}, {event.city}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-6">
            <Stat label="Tier" value={ticket.tier} />
            <Stat label="Qty" value={String(ticket.qty)} />
            <Stat label="Seat" value={ticket.seat} />
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="relative hidden w-px bg-[repeating-linear-gradient(to_bottom,var(--border)_0_8px,transparent_8px_16px)] sm:block"
      >
        <span className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-background" />
        <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-background" />
      </div>

      <div className="flex flex-col items-center justify-center gap-4 border-t border-border p-6 sm:border-t-0">
        <div className="grid h-28 w-28 place-items-center rounded-2xl border border-primary/30 bg-background/70 shadow-[0_0_40px_-18px_var(--violet)]">
          <QrCode className="size-16 text-violet-soft" strokeWidth={1.1} />
        </div>
        <p className="font-mono text-[0.72rem] tracking-[0.14em] text-muted-foreground">
          {ticket.code}
        </p>
        <Link
          to="/events/$eventId"
          params={{ eventId: event.id }}
          className="text-xs text-violet-soft underline-offset-4 hover:underline"
        >
          Event details
        </Link>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}