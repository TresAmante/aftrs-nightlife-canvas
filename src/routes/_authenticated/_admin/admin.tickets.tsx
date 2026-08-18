import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Banknote, Loader as Loader2, Search, Ticket, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatDate, money } from "@/lib/utils";
import { listAllOrders, summariseBuyers, updateOrderStatus, type TicketOrder } from "@/lib/orders-api";


export const Route = createFileRoute("/_authenticated/_admin/admin/tickets")({
  head: () => ({
    meta: [
      { title: "Ticket sales tracking — AFTRS console" },
      {
        name: "description",
        content: "Track every AFTRS ticket sale: buyer, name on the ticket, quantity and amount.",
      },
      { property: "og:title", content: "Ticket sales tracking — AFTRS console" },
      { property: "og:description", content: "Order-level ticket sales, buyers and refunds." },
    ],
  }),
  component: AdminTickets,
});

function AdminTickets() {
  const qc = useQueryClient();
  const [active, setActive] = useState<TicketOrder | null>(null);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"orders" | "buyers">("orders");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["ticket-orders"],
    queryFn: listAllOrders,
  });

  const refund = useMutation({
    mutationFn: (o: TicketOrder) => updateOrderStatus(o.id, "Refunded"),
    onSuccess: () => {
      toast.success("Order refunded");
      setActive(null);
      void qc.invalidateQueries({ queryKey: ["ticket-orders"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Refund failed"),
  });

  const rows = useMemo(
    () =>
      orders.filter((o) =>
        `${o.order_ref} ${o.buyer_name} ${o.buyer_email ?? ""} ${o.attendee_name} ${o.event_name} ${o.tier_name} ${o.status}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [orders, q],
  );

  const buyers = useMemo(() => summariseBuyers(orders), [orders]);
  const paid = orders.filter((o) => o.status !== "Refunded" && o.status !== "Cancelled");
  const ticketsSold = paid.reduce((s, o) => s + o.quantity, 0);
  const revenue = paid.reduce((s, o) => s + o.total, 0);

  return (
    <AdminShell title="Ticket sales" subtitle={`${orders.length} orders recorded`}>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tickets sold" value={String(ticketsSold)} delta={0} icon={Ticket} />
        <StatCard label="Gross revenue" value={money(revenue)} delta={0} icon={Banknote} accent="electric" />
        <StatCard label="Unique buyers" value={String(buyers.length)} delta={0} icon={Users} accent="crimson" />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(["orders", "buyers"] as const).map((v) => (
            <Button
              key={v}
              variant={view === v ? "hero" : "glass"}
              size="sm"
              onClick={() => setView(v)}
              className="capitalize"
            >
              {v === "orders" ? "Orders" : "By buyer"}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search buyer, ticket name, event"
            aria-label="Search orders"
            className="h-11 rounded-full bg-secondary/40 pl-11"
          />
        </div>
      </div>

      {isLoading && (
        <div className="mt-10 flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="mt-8 rounded-3xl border border-border px-6 py-20 text-center">
          <Ticket className="mx-auto size-7 text-muted-foreground" />
          <p className="mt-4 font-display font-extrabold">No ticket sales yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Orders appear here the moment a guest checks out.
          </p>
        </div>
      )}

      {!isLoading && orders.length > 0 && view === "orders" && (
        <div className="mt-8 overflow-hidden rounded-3xl border border-border">
          <div className="hidden grid-cols-[0.9fr_1.1fr_1.1fr_1.2fr_0.5fr_0.9fr_0.8fr] gap-4 bg-surface-2/60 px-6 py-4 text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase lg:grid">
            <span>Order</span>
            <span>Buyer</span>
            <span>Ticket name</span>
            <span>Event</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Status</span>
          </div>
          {rows.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t)}
              className="grid w-full gap-2 border-t border-border bg-surface/40 px-6 py-4 text-left transition-colors hover:bg-surface-2/60 lg:grid-cols-[0.9fr_1.1fr_1.1fr_1.2fr_0.5fr_0.9fr_0.8fr] lg:items-center lg:gap-4"
            >
              <p className="font-mono text-xs text-muted-foreground">{t.order_ref}</p>
              <p className="truncate text-sm font-semibold">{t.buyer_name}</p>
              <p className="truncate text-sm">{t.attendee_name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {t.event_name} · {t.tier_name}
              </p>
              <p className="text-sm lg:text-right">{t.quantity}</p>
              <p className="font-display text-sm font-extrabold lg:text-right">{money(t.total)}</p>
              <div className="lg:flex lg:justify-end">
                <StatusBadge status={t.status} />
              </div>
            </button>
          ))}
        </div>
      )}

      {!isLoading && orders.length > 0 && view === "buyers" && (
        <div className="mt-8 overflow-hidden rounded-3xl border border-border">
          <div className="hidden grid-cols-[1.4fr_1.4fr_0.6fr_0.6fr_0.9fr] gap-4 bg-surface-2/60 px-6 py-4 text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase lg:grid">
            <span>Buyer</span>
            <span>Email</span>
            <span className="text-right">Orders</span>
            <span className="text-right">Tickets</span>
            <span className="text-right">Spend</span>
          </div>
          {buyers
            .filter((b) => `${b.buyerName} ${b.buyerEmail ?? ""}`.toLowerCase().includes(q.toLowerCase()))
            .map((b) => (
              <div
                key={b.userId}
                className="grid gap-2 border-t border-border bg-surface/40 px-6 py-4 lg:grid-cols-[1.4fr_1.4fr_0.6fr_0.6fr_0.9fr] lg:items-center lg:gap-4"
              >
                <p className="truncate text-sm font-semibold">{b.buyerName}</p>
                <p className="truncate text-sm text-muted-foreground">{b.buyerEmail ?? "—"}</p>
                <p className="text-sm lg:text-right">{b.orders}</p>
                <p className="text-sm lg:text-right">{b.tickets}</p>
                <p className="font-display text-sm font-extrabold lg:text-right">{money(b.spend)}</p>
              </div>
            ))}
        </div>
      )}

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full border-border bg-popover sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl font-extrabold">{active?.order_ref}</SheetTitle>
          </SheetHeader>
          {active && (
            <div className="space-y-4 px-4 pb-6">
              {[
                ["Buyer", active.buyer_name],
                ["Email", active.buyer_email ?? "—"],
                ["Ticket under", active.attendee_name],
                ["Event", active.event_name],
                ["Tier", active.tier_name],
                ["Quantity", String(active.quantity)],
                ["Unit price", money(active.unit_price)],
                ["Discount", money(active.discount)],
                ["Total paid", money(active.total)],
                ["Promo code", active.promo_code ?? "—"],
                ["Method", active.payment_method],
                ["Ordered", formatDate(active.created_at)],
                ["Status", active.status],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{k}</span>
                  <span className="text-right text-sm font-semibold">{v}</span>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="hero" size="sm" onClick={() => toast.success("Ticket resent by email")}>
                  Resend ticket
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  disabled={active.status === "Refunded" || refund.isPending}
                  onClick={() => refund.mutate(active)}
                >
                  Refund
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
}
