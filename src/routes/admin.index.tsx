import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, CalendarRange, CreditCard, DollarSign, Ticket, Users } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { activityFeed, money, revenueSeries, topEvents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — AFTRS console" },
      { name: "description", content: "Revenue, ticket sales and live activity across every AFTRS event." },
      { property: "og:title", content: "Admin dashboard — AFTRS console" },
      { property: "og:description", content: "Operations overview for the AFTRS ticketing platform." },
    ],
  }),
  component: AdminDashboard,
});

const tones = {
  success: "bg-emerald-400",
  warn: "bg-amber-400",
  info: "bg-accent",
  danger: "bg-destructive",
};

function AdminDashboard() {
  return (
    <AdminShell
      title="Dashboard"
      subtitle="Season 04 · live figures across four cities"
      actions={
        <Button variant="hero" size="sm">
          New event
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total revenue" value={money(60995000)} delta={18} icon={DollarSign} />
        <StatCard label="Total sales" value="14 380" delta={12} icon={CreditCard} accent="electric" />
        <StatCard label="Tickets sold" value="16 240" delta={9} icon={Ticket} />
        <StatCard label="Active events" value="6" delta={20} icon={CalendarRange} accent="electric" />
        <StatCard label="Registered users" value="42 118" delta={6} icon={Users} />
        <StatCard label="Pending payments" value={money(1014750)} delta={-4} icon={Activity} accent="crimson" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Reveal className="rounded-3xl border border-border bg-surface/60 p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-extrabold">Revenue</h2>
              <p className="mt-1 text-xs text-muted-foreground">Last 8 months, all channels</p>
            </div>
            <p className="font-display text-2xl font-extrabold brand-gradient-text">{money(12320000)}</p>
          </div>
          <div className="mt-8 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ left: -18, right: 6 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => money(v)}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--violet)" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="rounded-3xl border border-border bg-surface/60 p-6">
          <h2 className="font-display text-lg font-extrabold">Live activity</h2>
          <ul className="mt-6 space-y-5">
            {activityFeed.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", tones[a.tone])} />
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.what}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal className="mt-6 rounded-3xl border border-border bg-surface/60 p-6">
        <h2 className="font-display text-lg font-extrabold">Top selling events</h2>
        <div className="mt-6 space-y-5">
          {topEvents.map((t) => {
            const pct = Math.round((t.sold / t.capacity) * 100);
            return (
              <div key={t.name}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="truncate font-medium">{t.name}</span>
                  <span className="shrink-0 text-muted-foreground">{money(t.revenue)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full [background-image:var(--gradient-brand)]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </AdminShell>
  );
}