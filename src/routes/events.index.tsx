import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { CalendarX2, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Aurora } from "@/components/site/Aurora";
import { EventCard } from "@/components/site/EventCard";
import { Reveal } from "@/components/site/Reveal";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listPublicEvents } from "@/lib/events-api";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events — AFTRS late-night calendar" },
      {
        name: "description",
        content:
          "Every AFTRS night on sale: rooftop house in Singapore, warehouse techno in Kuala Lumpur, basement sets in Bangkok and beach disco in Bali.",
      },
      { property: "og:title", content: "Events — AFTRS late-night calendar" },
      {
        property: "og:description",
        content: "Browse lineups, venues and ticket tiers for every upcoming AFTRS event.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data: events = [], isLoading } = useQuery({ queryKey: ["public-events"], queryFn: listPublicEvents });

  const [q, setQ] = useState("");
  const [city, setCity] = useState("All cities");
  const [genre, setGenre] = useState("All genres");

  const cities = ["All cities", ...Array.from(new Set(events.map((e) => e.city)))];
  const genres = ["All genres", ...Array.from(new Set(events.map((e) => e.genre ?? "Unknown")))];

  const filtered = useMemo(
    () =>
      events.filter(
        (e) =>
          (city === "All cities" || e.city === city) &&
          (genre === "All genres" || (e.genre ?? "Unknown") === genre) &&
          (q.trim() === "" ||
            `${e.name} ${e.venue ?? ""} ${e.city} ${(e.lineup ?? []).join(" ")}`
              .toLowerCase()
              .includes(q.toLowerCase())),
      ),
    [events, q, city, genre],
  );

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border">
        <Aurora dense className="opacity-80" />
        <div className="relative mx-auto max-w-6xl px-5 pt-40 pb-16 sm:px-8 sm:pt-48">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase"
          >
            {events.length} events · {cities.length - 1} cities
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-3xl font-display text-[clamp(2.4rem,7vw,5rem)] leading-[0.95] font-extrabold"
          >
            The <span className="brand-gradient-text">calendar</span>
          </motion.h1>
          <p className="mt-6 max-w-lg text-muted-foreground">
            Filter by city, sound or search a lineup. Prices are final — AFTRS never adds booking
            fees at checkout.
          </p>

          {/* Filter bar */}
          <div className="glass-strong mt-12 grid gap-3 rounded-3xl p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="relative">
              <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events, venues or artists"
                aria-label="Search events"
                className="h-12 rounded-2xl border-transparent bg-secondary/40 pl-11"
              />
            </div>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="h-12 rounded-2xl border-transparent bg-secondary/40 sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="h-12 rounded-2xl border-transparent bg-secondary/40 sm:w-48">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-3xl bg-surface-2/60" />
            ))}
          </div>
        )}

        {!isLoading && (
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div
                key="grid"
                layout
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((e, i) => (
                  <Reveal key={e.id} delay={i * 0.05}>
                    <EventCard event={e} className="h-full" />
                  </Reveal>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto max-w-md rounded-3xl border border-dashed border-border px-8 py-20 text-center"
              >
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-primary/30 bg-primary/10">
                  <CalendarX2 className="size-7 text-violet-soft" />
                </div>
                <h2 className="mt-6 font-display text-xl font-extrabold">Nothing on that night</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  No events match those filters yet. Clear them and check the full calendar.
                </p>
                <Button
                  variant="neon"
                  className="mt-7"
                  onClick={() => {
                    setQ("");
                    setCity("All cities");
                    setGenre("All genres");
                  }}
                >
                  Reset filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>
    </SiteLayout>
  );
}
