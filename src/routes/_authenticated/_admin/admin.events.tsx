import { createFileRoute } from "@tanstack/react-router";
import { Percent, Plus, Tag, Ticket, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { events, formatDate, money, promoCodes as seedPromos, type PromoCode } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_admin/admin/events")({
  head: () => ({
    meta: [
      { title: "Event management — AFTRS console" },
      { name: "description", content: "Create, edit and publish AFTRS events across every city." },
      { property: "og:title", content: "Event management — AFTRS console" },
      { property: "og:description", content: "The AFTRS event catalogue and publishing controls." },
    ],
  }),
  component: AdminEvents,
});

function AdminEvents() {
  const [open, setOpen] = useState(false);
  const [tiers, setTiers] = useState([
    { name: "General", price: "89" },
    { name: "Priority", price: "139" },
  ]);
  const [promos, setPromos] = useState<{ code: string; type: "percent" | "fixed"; value: string }[]>([
    { code: "EARLYBIRD", type: "percent", value: "15" },
  ]);
  const [codes, setCodes] = useState<PromoCode[]>(seedPromos);

  const setTier = (i: number, key: "name" | "price", v: string) =>
    setTiers((t) => t.map((row, idx) => (idx === i ? { ...row, [key]: v } : row)));
  const setPromo = (i: number, patch: Partial<{ code: string; type: "percent" | "fixed"; value: string }>) =>
    setPromos((p) => p.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  return (
    <AdminShell
      title="Event management"
      subtitle={`${events.length} events in the catalogue`}
      actions={
        <Button variant="hero" size="sm" onClick={() => setOpen(true)}>
          <Plus /> Create event
        </Button>
      }
    >
      <div className="overflow-hidden rounded-3xl border border-border">
        <div className="hidden grid-cols-[1.8fr_1fr_1fr_0.9fr_0.8fr] gap-4 bg-surface-2/60 px-6 py-4 text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase lg:grid">
          <span>Event</span>
          <span>City</span>
          <span>Date</span>
          <span className="text-right">Sold</span>
          <span className="text-right">Status</span>
        </div>
        {events.map((e) => (
          <div
            key={e.id}
            className="grid gap-2 border-t border-border bg-surface/40 px-6 py-4 transition-colors hover:bg-surface-2/60 lg:grid-cols-[1.8fr_1fr_1fr_0.9fr_0.8fr] lg:items-center lg:gap-4"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold">{e.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {e.venue} · from {money(e.price)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{e.city}</p>
            <p className="text-sm text-muted-foreground">{formatDate(e.date)}</p>
            <p className="text-sm lg:text-right">
              {e.sold.toLocaleString()} / {e.capacity.toLocaleString()}
            </p>
            <div className="lg:flex lg:justify-end">
              <StatusBadge status={e.status} />
            </div>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-extrabold">Promoter codes</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Discounts promoters can hand out. {codes.filter((c) => c.active).length} live right now.
            </p>
          </div>
          <Button variant="glass" size="sm" onClick={() => setOpen(true)}>
            <Tag /> New code
          </Button>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-border">
          <div className="hidden grid-cols-[1fr_1.2fr_1.2fr_0.8fr_1fr_0.7fr] gap-4 bg-surface-2/60 px-6 py-4 text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase lg:grid">
            <span>Code</span>
            <span>Promoter</span>
            <span>Event</span>
            <span>Discount</span>
            <span>Redeemed</span>
            <span className="text-right">State</span>
          </div>
          {codes.map((c) => (
            <div
              key={c.id}
              className="grid gap-2 border-t border-border bg-surface/40 px-6 py-4 transition-colors hover:bg-surface-2/60 lg:grid-cols-[1fr_1.2fr_1.2fr_0.8fr_1fr_0.7fr] lg:items-center lg:gap-4"
            >
              <span className="w-fit rounded-lg border border-border bg-secondary/40 px-2.5 py-1 font-mono text-xs tracking-[0.16em]">
                {c.code}
              </span>
              <p className="text-sm text-muted-foreground">{c.promoter}</p>
              <p className="truncate text-sm text-muted-foreground">{c.event}</p>
              <p className="text-sm font-semibold brand-gradient-text">
                {c.type === "percent" ? `${c.value}% off` : `${money(c.value)} off`}
              </p>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {c.used} / {c.limit} · expires {formatDate(c.expires)}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full [background-image:var(--gradient-brand)]"
                    style={{ width: `${Math.min(100, Math.round((c.used / c.limit) * 100))}%` }}
                  />
                </div>
              </div>
              <div className="lg:flex lg:justify-end">
                <button
                  onClick={() =>
                    setCodes((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-[0.68rem] tracking-[0.12em] uppercase transition-colors",
                    c.active
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-border bg-secondary/40 text-muted-foreground",
                  )}
                >
                  {c.active ? "Active" : "Paused"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto rounded-3xl border-border bg-popover sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-extrabold">Create event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ev-title">Title</Label>
              <Input id="ev-title" placeholder="Midnight Frequency" className="h-11 rounded-xl bg-secondary/40" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ev-city">City</Label>
                <Input id="ev-city" placeholder="Singapore" className="h-11 rounded-xl bg-secondary/40" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-date">Date</Label>
                <Input id="ev-date" type="date" className="h-11 rounded-xl bg-secondary/40" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-desc">Description</Label>
              <Textarea id="ev-desc" rows={4} className="rounded-xl bg-secondary/40" />
            </div>

            <div className="space-y-3 rounded-2xl border border-border bg-surface/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Ticket className="size-4 text-accent" /> Ticket pricing
                </p>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setTiers((t) => [...t, { name: "", price: "" }])}
                >
                  <Plus /> Tier
                </Button>
              </div>
              {tiers.map((t, i) => (
                <div key={i} className="grid grid-cols-[1.4fr_1fr_auto] items-center gap-2">
                  <Input
                    value={t.name}
                    onChange={(e) => setTier(i, "name", e.target.value)}
                    placeholder="Tier name"
                    className="h-11 rounded-xl bg-secondary/40"
                  />
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      value={t.price}
                      onChange={(e) => setTier(i, "price", e.target.value.replace(/[^\d.]/g, ""))}
                      inputMode="decimal"
                      placeholder="0"
                      className="h-11 rounded-xl bg-secondary/40 pl-7"
                    />
                  </div>
                  <button
                    aria-label="Remove tier"
                    onClick={() => setTiers((rows) => rows.filter((_, idx) => idx !== i))}
                    className="rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-2xl border border-border bg-surface/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Percent className="size-4 text-accent" /> Promoter discount codes
                </p>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setPromos((p) => [...p, { code: "", type: "percent", value: "" }])}
                >
                  <Plus /> Code
                </Button>
              </div>
              {promos.map((p, i) => (
                <div key={i} className="grid grid-cols-[1.3fr_auto_0.8fr_auto] items-center gap-2">
                  <Input
                    value={p.code}
                    onChange={(e) => setPromo(i, { code: e.target.value.toUpperCase() })}
                    placeholder="PROMOCODE"
                    className="h-11 rounded-xl bg-secondary/40 font-mono tracking-[0.14em]"
                  />
                  <div className="flex h-11 items-center rounded-xl border border-border bg-secondary/40 p-1">
                    {(["percent", "fixed"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setPromo(i, { type: t })}
                        className={cn(
                          "rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                          p.type === t ? "bg-primary/20 text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {t === "percent" ? "%" : "$"}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={p.value}
                    onChange={(e) => setPromo(i, { value: e.target.value.replace(/[^\d.]/g, "") })}
                    inputMode="decimal"
                    placeholder={p.type === "percent" ? "15" : "20"}
                    className="h-11 rounded-xl bg-secondary/40"
                  />
                  <button
                    aria-label="Remove code"
                    onClick={() => setPromos((rows) => rows.filter((_, idx) => idx !== i))}
                    className="rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Codes are shareable by promoters and apply on checkout.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="glass" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={() => {
                  const fresh = promos
                    .filter((p) => p.code.trim() && p.value)
                    .map((p, i) => ({
                      id: `P-new-${Date.now()}-${i}`,
                      code: p.code.trim(),
                      promoter: "AFTRS Crew",
                      event: "New event",
                      type: p.type,
                      value: Number(p.value),
                      used: 0,
                      limit: 100,
                      expires: new Date().toISOString().slice(0, 10),
                      active: true,
                    }));
                  if (fresh.length) setCodes((c) => [...fresh, ...c]);
                  setOpen(false);
                  toast.success("Event published", {
                    description: `${tiers.length} ticket tiers · ${fresh.length} promo codes live`,
                  });
                }}
              >
                Publish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}