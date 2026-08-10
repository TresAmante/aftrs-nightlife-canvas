import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { adminTickets, formatDate, money, type AdminTicket } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/_admin/admin/tickets")({
  head: () => ({
    meta: [
      { title: "Ticket management — AFTRS console" },
      { name: "description", content: "Every AFTRS ticket order with payment status and channel." },
      { property: "og:title", content: "Ticket management — AFTRS console" },
      { property: "og:description", content: "Order-level ticket operations and refunds." },
    ],
  }),
  component: AdminTickets,
});

function AdminTickets() {
  const [active, setActive] = useState<AdminTicket | null>(null);

  return (
    <AdminShell title="Ticket management" subtitle={`${adminTickets.length} recent orders`}>
      <div className="overflow-hidden rounded-3xl border border-border">
        <div className="hidden grid-cols-[0.9fr_1.2fr_1.4fr_0.6fr_0.9fr_0.8fr] gap-4 bg-surface-2/60 px-6 py-4 text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase lg:grid">
          <span>Ticket</span>
          <span>Buyer</span>
          <span>Event</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Status</span>
        </div>
        {adminTickets.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t)}
            className="grid w-full gap-2 border-t border-border bg-surface/40 px-6 py-4 text-left transition-colors hover:bg-surface-2/60 lg:grid-cols-[0.9fr_1.2fr_1.4fr_0.6fr_0.9fr_0.8fr] lg:items-center lg:gap-4"
          >
            <p className="font-mono text-xs text-muted-foreground">{t.id}</p>
            <p className="truncate text-sm font-semibold">{t.buyer}</p>
            <p className="truncate text-sm text-muted-foreground">
              {t.event} · {t.tier}
            </p>
            <p className="text-sm lg:text-right">{t.qty}</p>
            <p className="font-display text-sm font-extrabold lg:text-right">{money(t.amount)}</p>
            <div className="lg:flex lg:justify-end">
              <StatusBadge status={t.status} />
            </div>
          </button>
        ))}
      </div>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full border-border bg-popover sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl font-extrabold">{active?.id}</SheetTitle>
          </SheetHeader>
          {active && (
            <div className="space-y-4 px-4 pb-6">
              {[
                ["Buyer", active.buyer],
                ["Event", active.event],
                ["Tier", active.tier],
                ["Quantity", String(active.qty)],
                ["Amount", money(active.amount)],
                ["Channel", active.channel],
                ["Ordered", formatDate(active.date)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{k}</span>
                  <span className="text-sm font-semibold">{v}</span>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="hero" size="sm">Resend ticket</Button>
                <Button variant="outline" size="sm" className="text-destructive">Refund</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
}