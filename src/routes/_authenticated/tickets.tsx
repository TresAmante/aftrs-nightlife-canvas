import { createFileRoute, Link } from "@tanstack/react-router";
import { Ticket as TicketIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Aurora } from "@/components/site/Aurora";
import { Reveal } from "@/components/site/Reveal";
import { SiteLayout } from "@/components/site/SiteLayout";
import { TicketStub } from "@/components/site/TicketStub";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listPublicEvents, type EventWithTiers } from "@/lib/events-api";
import { listAllOrders, type TicketOrder } from "@/lib/orders-api";

export const Route = createFileRoute("/_authenticated/tickets")({
  head: () => ({
    meta: [
      { title: "My tickets — AFTRS wallet" },
      {
        name: "description",
        content:
          "Your AFTRS wallet: upcoming entries, QR codes and past nights, all in one place.",
      },
      { property: "og:title", content: "My tickets — AFTRS wallet" },
      { property: "og:description", content: "Every AFTRS entry you hold, with QR codes ready at the door." },
    ],
  }),
  component: TicketsPage,
});

type TicketView = { order: TicketOrder; event: EventWithTiers | null };

function TicketsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const { data: orders = [] } = useQuery({ queryKey: ["ticket-orders"], queryFn: listAllOrders });
  const { data: events = [] } = useQuery({ queryKey: ["public-events"], queryFn: listPublicEvents });

  const eventMap = useMemo(() => {
    const m = new Map<string, EventWithTiers>();
    for (const e of events) m.set(e.id, e);
    return m;
  }, [events]);

  const tickets: TicketView[] = useMemo(
    () =>
      orders.map((order) => ({
        order,
        event: order.event_id ? (eventMap.get(order.event_id) ?? null) : null,
      })),
    [orders, eventMap],
  );

  const list = tickets.filter((t) =>
    tab === "upcoming" ? t.order.status === "Paid" : t.order.status !== "Paid",
  );

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border">
        <Aurora className="opacity-70" />
        <div className="relative mx-auto max-w-6xl px-5 pt-40 pb-14 sm:px-8 sm:pt-48">
          <p className="text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">Wallet</p>
          <h1 className="mt-5 font-display text-[clamp(2.4rem,7vw,4.6rem)] leading-[0.95] font-extrabold">
            My <span className="brand-gradient-text">tickets</span>
          </h1>
          <p className="mt-5 max-w-md text-muted-foreground">
            Show the QR at the door. Screenshots work — but the wallet updates if a set time moves.
          </p>

          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-10">
            <TabsList className="rounded-full bg-secondary/50 p-1">
              <TabsTrigger value="upcoming" className="rounded-full px-5">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="rounded-full px-5">
                Past
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        {list.length > 0 ? (
          <div className="space-y-6">
            {list.map((t, i) => (
              <Reveal key={t.order.id} delay={i * 0.06}>
                <TicketStub ticket={t} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyWallet />
        )}
      </section>
    </SiteLayout>
  );
}

function EmptyWallet() {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border px-8 py-20 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-primary/30 bg-primary/10">
        <TicketIcon className="size-7 text-violet-soft" />
      </div>
      <h2 className="mt-6 font-display text-xl font-extrabold">Nothing in the wallet</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        You haven't been to an AFTRS night yet. That's fixable.
      </p>
      <Button asChild variant="hero" className="mt-7">
        <Link to="/events">Find a night</Link>
      </Button>
    </div>
  );
}
