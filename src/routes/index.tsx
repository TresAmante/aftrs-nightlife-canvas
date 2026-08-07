import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import { useRef } from "react";

import heroImg from "@/assets/hero.jpg";
import { Aurora } from "@/components/site/Aurora";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { SiteLayout } from "@/components/site/SiteLayout";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { events, formatDate, formatDay, formatMonth, type EventItem } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AFTRS — Where the real party starts" },
      {
        name: "description",
        content:
          "AFTRS curates late-night events across Asia. Browse rooftop sessions, warehouse techno and arena finales, then claim your ticket in seconds.",
      },
      { property: "og:title", content: "AFTRS — Where the real party starts" },
      {
        property: "og:description",
        content:
          "Late-night events across Kuala Lumpur, Singapore, Bangkok and Bali. Tickets, lineups and guestlists in one place.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = events.filter((e) => e.featured);
  const upcoming = events.slice(0, 5);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <SiteLayout>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden">
        <motion.div style={{ y: imgY }} className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Crowd under purple and blue lasers at an AFTRS night"
            width={1920}
            height={1200}
            className="h-[118%] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/45 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,transparent,var(--background)_92%)]" />
        </motion.div>
        <Aurora className="-z-10 opacity-70" />

        <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pt-32 pb-16 sm:px-8 sm:pb-24">
          <motion.div style={{ opacity: fade }}>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-[0.7rem] tracking-[0.2em] uppercase backdrop-blur-md"
            >
              <Sparkles className="size-3.5 text-violet-soft" />
              Season 04 · Now on sale
            </motion.p>

            <h1 className="mt-7 max-w-4xl font-display text-[clamp(2.6rem,9vw,6.5rem)] leading-[0.92] font-extrabold">
              {["Where the", "real party", "starts."].map((line, i) => (
                <motion.span
                  key={line}
                  initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="block"
                >
                  {i === 1 ? <span className="brand-gradient-text">{line}</span> : line}
                </motion.span>
              ))}
            </h1>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.6 }}
                className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
              >
                AFTRS books the rooms worth staying up for — rooftops, basements, arenas. One
                account, every door.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-wrap gap-3"
              >
                <Button asChild variant="hero" size="xl">
                  <Link to="/events">
                    Browse events <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="glass" size="xl">
                  <Link to="/tickets">My tickets</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Marquee ticker */}
        <div className="absolute inset-x-0 bottom-0 overflow-hidden border-y border-border bg-ink/60 py-3 backdrop-blur-md">
          <div className="flex w-max animate-[sheen_0s] gap-10">
            <motion.div
              className="flex gap-10 pr-10"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            >
              {[...events, ...events].map((e, i) => (
                <span
                  key={i}
                  className="flex items-center gap-3 text-[0.7rem] tracking-[0.22em] whitespace-nowrap text-muted-foreground uppercase"
                >
                  <span className="h-1 w-1 rounded-full bg-violet" />
                  {e.city} · {e.name} · {formatDate(e.date)}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Featured ─────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
              Featured
            </p>
            <h2 className="mt-4 max-w-xl font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1] font-extrabold">
              Four nights we'd cancel plans for
            </h2>
          </div>
          <Link
            to="/events"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            All {events.length} events
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>

        {/* Asymmetric editorial grid */}
        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <FeatureTile event={featured[0]} tall />
          </Reveal>
          <div className="grid gap-5 lg:col-span-5">
            <Reveal delay={0.08}>
              <FeatureTile event={featured[1]} />
            </Reveal>
            <Reveal delay={0.16}>
              <FeatureTile event={featured[2]} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-border bg-ink">
        <Aurora dense className="opacity-60" />
        <div className="relative mx-auto grid max-w-6xl gap-16 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
              About AFTRS
            </p>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.6vw,3.2rem)] leading-[1.02] font-extrabold">
              A promoter, not a<br />
              <span className="brand-gradient-text">marketplace.</span>
            </h2>
          </Reveal>

          <div>
            <Reveal delay={0.1}>
              <p className="text-lg leading-relaxed text-muted-foreground">
                We started in 2019 with one basement room and a borrowed sound system. Seven years
                later we programme four cities and still book every act ourselves. No resellers, no
                dynamic pricing, no surprise fees at checkout.
              </p>
            </Reveal>

            <Stagger className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-3">
              {[
                { k: "142", l: "Nights programmed" },
                { k: "310k", l: "Tickets issued" },
                { k: "0", l: "Booking fees" },
              ].map((s) => (
                <StaggerItem key={s.l}>
                  <p className="font-display text-[clamp(2.4rem,6vw,3.6rem)] leading-none font-extrabold brand-gradient-text">
                    {s.k}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{s.l}</p>
                </StaggerItem>
              ))}
            </Stagger>

            <Stagger className="mt-14 space-y-px overflow-hidden rounded-2xl border border-border">
              {[
                ["Curation", "Every lineup is booked in-house by our residents."],
                ["Access", "Members get pre-sale 48 hours before public release."],
                ["Care", "Trained welfare team and free water at every event."],
              ].map(([t, d]) => (
                <StaggerItem
                  key={t}
                  className="grid gap-1 bg-surface/60 px-6 py-5 transition-colors hover:bg-surface-2/70 sm:grid-cols-[10rem_1fr] sm:gap-6"
                >
                  <span className="text-[0.7rem] tracking-[0.2em] text-violet-soft uppercase">
                    {t}
                  </span>
                  <span className="text-sm text-muted-foreground">{d}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ── Upcoming (list) ──────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
            Upcoming
          </p>
          <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.4rem)] leading-none font-extrabold">
            The calendar
          </h2>
        </Reveal>

        <Stagger className="mt-12 border-t border-border">
          {upcoming.map((e) => (
            <StaggerItem key={e.id}>
              <Link
                to="/events/$eventId"
                params={{ eventId: e.id }}
                className="group grid grid-cols-[3.2rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-border py-6 transition-colors hover:bg-surface/50 sm:grid-cols-[4rem_minmax(0,1.4fr)_minmax(0,1fr)_auto_auto] sm:gap-8 sm:px-4"
              >
                <div className="text-center">
                  <p className="font-display text-2xl leading-none font-extrabold">
                    {formatDay(e.date)}
                  </p>
                  <p className="mt-1 text-[0.6rem] tracking-[0.16em] text-muted-foreground">
                    {formatMonth(e.date)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-extrabold sm:text-xl">
                    {e.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{e.lineup.join(" · ")}</p>
                </div>
                <p className="hidden min-w-0 items-center gap-1.5 text-sm text-muted-foreground sm:flex">
                  <MapPin className="size-3.5 shrink-0 text-violet-soft" />
                  <span className="truncate">
                    {e.venue}, {e.city}
                  </span>
                </p>
                <div className="hidden sm:block">
                  <StatusBadge status={e.status} />
                </div>
                <span className="flex items-center gap-2 font-display text-sm font-extrabold">
                  {e.currency}
                  {e.price}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="px-5 pb-28 sm:px-8">
        <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-primary/25 bg-surface/60 px-6 py-20 text-center sm:px-16">
          <div
            aria-hidden
            className="animate-drift absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-violet/25 blur-[130px]"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-[clamp(2rem,5.4vw,3.6rem)] leading-[1.02] font-extrabold">
              Doors open at 23:00.
              <br />
              <span className="brand-gradient-text">Don't be the one outside.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-md text-muted-foreground">
              Create an account and get 48-hour pre-sale access to every AFTRS night.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/register">Join the list</Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/events">See what's on</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}

function FeatureTile({ event, tall = false }: { event: EventItem | undefined; tall?: boolean }) {
  if (!event) return null;
  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className={`group relative block overflow-hidden rounded-3xl border border-border ${
        tall ? "h-[26rem] lg:h-[38rem]" : "h-[18rem]"
      }`}
    >
      <img
        src={event.image}
        alt={`${event.name} — ${event.venue}`}
        loading="lazy"
        width={1200}
        height={900}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 [background-image:var(--gradient-brand)] group-hover:opacity-[0.14]" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
        <div className="min-w-0">
          <p className="text-[0.66rem] tracking-[0.2em] text-violet-soft uppercase">
            {formatDate(event.date)} · {event.city}
          </p>
          <h3
            className={`mt-2 font-display leading-[1.02] font-extrabold ${tall ? "text-3xl sm:text-5xl" : "text-2xl sm:text-3xl"}`}
          >
            {event.name}
          </h3>
          {tall && (
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">{event.tagline}</p>
          )}
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-background/50 backdrop-blur-md transition-all group-hover:border-primary/60 group-hover:bg-primary/25">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}