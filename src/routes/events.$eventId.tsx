import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  Minus,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Aurora } from "@/components/site/Aurora";
import { CheckoutDialog } from "@/components/site/CheckoutDialog";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { SiteLayout } from "@/components/site/SiteLayout";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { events, formatDate, getEvent, money, schedule, tiers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events/$eventId")({
  loader: ({ params }) => {
    const event = getEvent(params.eventId);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Event not found — AFTRS" }, { name: "robots", content: "noindex" }],
      };
    }
    const { event } = loaderData;
    const title = `${event.name} — ${event.venue}, ${event.city} | AFTRS`;
    const description = `${event.tagline}. ${formatDate(event.date)} at ${event.venue}, ${event.city}. Tickets from ${event.currency}${event.price}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: EventDetail,
  notFoundComponent: EventMissing,
});

function EventMissing() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-5 pt-48 pb-32 text-center">
        <h1 className="font-display text-4xl font-extrabold">This night has passed</h1>
        <p className="mt-4 text-muted-foreground">
          We couldn't find that event. It may have finished or moved.
        </p>
        <Button asChild variant="hero" size="lg" className="mt-8">
          <Link to="/events">Back to the calendar</Link>
        </Button>
      </div>
    </SiteLayout>
  );
}

function EventDetail() {
  const { event } = Route.useLoaderData();
  const [tier, setTier] = useState(tiers[1]!.name);
  const [qty, setQty] = useState(2);
  const selected = tiers.find((t) => t.name === tier)!;
  const related = events.filter((e) => e.id !== event.id).slice(0, 3);

  return (
    <SiteLayout>
      {/* Banner */}
      <section className="relative h-[68svh] min-h-[30rem] overflow-hidden">
        <img
          src={event.image}
          alt={`${event.name} at ${event.venue}`}
          width={1200}
          height={900}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/70" />
        <Aurora className="opacity-50" />

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-14 sm:px-8">
          <Link
            to="/events"
            className="mb-8 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> All events
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={event.status} />
              <span className="text-[0.7rem] tracking-[0.2em] text-muted-foreground uppercase">
                {event.genre}
              </span>
            </div>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.4rem,7.5vw,5.4rem)] leading-[0.94] font-extrabold">
              {event.name}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">{event.tagline}</p>
          </motion.div>
        </div>
      </section>

      {/* Quick facts strip */}
      <div className="border-y border-border bg-ink">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 sm:px-8 lg:grid-cols-4">
          {[
            { icon: CalendarDays, label: "Date", value: formatDate(event.date) },
            { icon: Clock, label: "Doors", value: `${event.doors} — late` },
            { icon: Users, label: "Capacity", value: event.capacity.toLocaleString() },
            { icon: ShieldCheck, label: "Entry", value: "18+ · ID required" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-4 py-7">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10">
                <f.icon className="size-4 text-violet-soft" />
              </span>
              <div className="min-w-0">
                <p className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase">
                  {f.label}
                </p>
                <p className="mt-1 truncate text-sm font-semibold">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.55fr_1fr] lg:gap-20">
        {/* Left column */}
        <div className="min-w-0">
          <Reveal>
            <h2 className="font-display text-2xl font-extrabold">The night</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          </Reveal>

          <Reveal className="mt-14">
            <h3 className="text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
              Lineup
            </h3>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {event.lineup.map((a: string, i: number) => (
                <span
                  key={a}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    i === 0
                      ? "border-primary/50 bg-primary/15 font-semibold"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {a}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Schedule */}
          <div className="mt-16">
            <Reveal>
              <h3 className="text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
                Running order
              </h3>
            </Reveal>
            <Stagger className="mt-8 space-y-0 border-l border-border pl-6">
              {schedule.map((s) => (
                <StaggerItem key={s.time} className="relative pb-8 last:pb-0">
                  <span className="absolute top-1.5 -left-[1.83rem] h-2.5 w-2.5 rounded-full bg-violet shadow-[0_0_14px_var(--violet)]" />
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="font-display text-sm font-extrabold text-violet-soft">
                      {s.time}
                    </span>
                    <span className="font-semibold">{s.title}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.detail}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          {/* Venue */}
          <Reveal className="mt-16 overflow-hidden rounded-3xl border border-border bg-surface/60">
            <div className="relative h-44 bg-[radial-gradient(120%_120%_at_20%_0%,color-mix(in_oklab,var(--violet)_35%,transparent),transparent_65%)]">
              <div className="absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:34px_34px]" />
              <span className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-crimson shadow-[0_0_26px_var(--crimson)]" />
            </div>
            <div className="p-7">
              <h3 className="font-display text-xl font-extrabold">{event.venue}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{event.address}</p>
              <p className="mt-1 text-sm text-muted-foreground">{event.city}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Cloakroom", "Step-free access", "Card only bar", "Smoking terrace"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Organiser */}
          <Reveal className="mt-8 flex flex-wrap items-center gap-5 rounded-3xl border border-border bg-surface/60 p-7">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl [background-image:var(--gradient-brand)] font-display text-sm font-extrabold text-primary-foreground">
              AF
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase">
                Organiser
              </p>
              <p className="mt-1 font-display text-lg font-extrabold">AFTRS Collective</p>
              <p className="mt-1 text-sm text-muted-foreground">
                142 events · 4.9 average rating · Verified promoter
              </p>
            </div>
            <Button variant="glass" size="sm">
              Follow
            </Button>
          </Reveal>
        </div>

        {/* Purchase panel */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Reveal className="glass-strong overflow-hidden rounded-3xl">
            <div className="border-b border-border p-6">
              <p className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
                Tickets
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold">
                {event.currency}
                {event.price}
                <span className="ml-2 text-sm font-normal text-muted-foreground">onwards</span>
              </p>
            </div>

            <div className="space-y-3 p-6">
              {tiers.map((t) => {
                const active = t.name === tier;
                return (
                  <button
                    key={t.name}
                    onClick={() => setTier(t.name)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-all duration-300",
                      active
                        ? "border-primary/60 bg-primary/12 shadow-[0_0_34px_-14px_var(--violet)]"
                        : "border-border hover:border-primary/35 hover:bg-secondary/40",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{t.name}</span>
                      <span className="font-display font-extrabold">{money(t.price)}</span>
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {t.perks.map((p) => (
                        <li
                          key={p}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <Check className="mt-0.5 size-3 shrink-0 text-violet-soft" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[0.68rem] tracking-[0.12em] text-crimson uppercase">
                      {t.left} left
                    </p>
                  </button>
                );
              })}

              <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="glass"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Decrease quantity"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus />
                  </Button>
                  <span className="w-6 text-center font-display font-extrabold">{qty}</span>
                  <Button
                    variant="glass"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Increase quantity"
                    onClick={() => setQty((q) => Math.min(8, q + 1))}
                  >
                    <Plus />
                  </Button>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2 text-sm">
                <Row label={`${selected.name} × ${qty}`} value={money(selected.price * qty)} />
                <Row label="Booking fee" value="Free" muted />
                <Row label="Total" value={money(selected.price * qty)} bold />
              </div>

              <Button
                variant="hero"
                size="lg"
                className="mt-2 w-full"
                disabled={event.status === "Sold out"}
                onClick={() => setCheckout(true)}
              >
                {event.status === "Sold out" ? "Sold out" : "Pay with GCash or bank"}
              </Button>
              <Button
                variant="glass"
                size="sm"
                className="w-full"
                disabled={event.status === "Sold out"}
                onClick={() =>
                  toast.success("Added to your basket", {
                    description: `${qty} × ${selected.name} · ${event.name}`,
                  })
                }
              >
                Save for later
              </Button>
              <p className="text-center text-[0.7rem] text-muted-foreground">
                GCash · InstaPay · PESONet — prototype only, no payment is taken.
              </p>

              <CheckoutDialog
                open={checkout}
                onOpenChange={setCheckout}
                eventName={event.name}
                tier={selected.name}
                qty={qty}
                total={selected.price * qty}
              />
            </div>
          </Reveal>
        </aside>
      </div>

      {/* Related */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-extrabold">You might also stay up for</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {related.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.07}>
                <Link
                  to="/events/$eventId"
                  params={{ eventId: r.id }}
                  className="group relative block h-56 overflow-hidden rounded-3xl border border-border"
                >
                  <img
                    src={r.image}
                    alt={r.name}
                    loading="lazy"
                    width={1200}
                    height={900}
                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-[1200ms] group-hover:scale-105 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
                  <div className="absolute bottom-0 p-5">
                    <p className="text-[0.62rem] tracking-[0.18em] text-violet-soft uppercase">
                      {formatDate(r.date)}
                    </p>
                    <p className="mt-1.5 font-display text-lg font-extrabold">{r.name}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Row({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-muted-foreground", bold && "text-foreground")}>{label}</span>
      <span
        className={cn(
          muted && "text-muted-foreground",
          bold && "font-display text-lg font-extrabold",
        )}
      >
        {value}
      </span>
    </div>
  );
}