import { createFileRoute } from "@tanstack/react-router";
import { Download, Receipt, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Aurora } from "@/components/site/Aurora";
import { Reveal } from "@/components/site/Reveal";
import { SiteLayout } from "@/components/site/SiteLayout";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, money, purchases } from "@/lib/mock-data";

export const Route = createFileRoute("/purchases")({
  head: () => ({
    meta: [
      { title: "Purchase history — AFTRS" },
      {
        name: "description",
        content: "Every AFTRS order, payment status and receipt in one running statement.",
      },
      { property: "og:title", content: "Purchase history — AFTRS" },
      { property: "og:description", content: "Orders, payment statuses and downloadable receipts." },
    ],
  }),
  component: PurchasesPage,
});

function PurchasesPage() {
  const [q, setQ] = useState("");
  const rows = useMemo(
    () =>
      purchases.filter((p) =>
        `${p.id} ${p.event} ${p.method} ${p.status}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );
  const total = purchases.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border">
        <Aurora className="opacity-60" />
        <div className="relative mx-auto max-w-6xl px-5 pt-40 pb-14 sm:px-8 sm:pt-48">
          <p className="text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">Account</p>
          <h1 className="mt-5 font-display text-[clamp(2.4rem,7vw,4.6rem)] leading-[0.95] font-extrabold">
            Purchase <span className="brand-gradient-text">history</span>
          </h1>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { l: "Lifetime spend", v: money(total) },
              { l: "Orders", v: String(purchases.length) },
              { l: "Nights attended", v: "11" },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 0.06} className="rounded-3xl border border-border bg-surface/60 p-6">
                <p className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase">
                  {s.l}
                </p>
                <p className="mt-3 font-display text-3xl font-extrabold">{s.v}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search orders"
              aria-label="Search orders"
              className="h-11 rounded-full bg-secondary/40 pl-11"
            />
          </div>
          <Button variant="glass" size="sm">
            <Download /> Export statement
          </Button>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-border">
          <div className="hidden grid-cols-[1fr_1.4fr_1.2fr_0.8fr_0.9fr] gap-4 bg-surface-2/60 px-6 py-4 text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase md:grid">
            <span>Order</span>
            <span>Event</span>
            <span>Method</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Status</span>
          </div>

          {rows.length === 0 && (
            <div className="px-6 py-20 text-center">
              <Receipt className="mx-auto size-7 text-muted-foreground" />
              <p className="mt-4 font-display font-extrabold">No orders match that search</p>
            </div>
          )}

          {rows.map((p, i) => (
            <Reveal
              key={p.id}
              delay={i * 0.04}
              className="grid gap-2 border-t border-border bg-surface/40 px-6 py-5 transition-colors hover:bg-surface-2/50 md:grid-cols-[1fr_1.4fr_1.2fr_0.8fr_0.9fr] md:items-center md:gap-4"
            >
              <div>
                <p className="font-mono text-xs text-muted-foreground">{p.id}</p>
                <p className="mt-1 text-xs text-muted-foreground md:hidden">{formatDate(p.date)}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{p.event}</p>
                <p className="mt-0.5 hidden text-xs text-muted-foreground md:block">
                  {formatDate(p.date)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{p.method}</p>
              <p className="font-display font-extrabold md:text-right">{money(p.amount)}</p>
              <div className="md:flex md:justify-end">
                <StatusBadge status={p.status} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}