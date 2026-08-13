import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, CalendarClock, CalendarRange, CreditCard, DollarSign, Ticket, Users } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { fetchAdminStats, relativeTime } from "@/lib/admin-stats";
import { money } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_admin/admin/")({
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

const statusTone: Record<string, string> = {
  Paid: "bg-emerald-400",
  Pending: "bg-amber-400",
  Refunded: "bg-accent",
  Cancelled: "bg-destructive",
};

function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    refetchInterval: 60_000,
  });

  const series = data?.revenueSeries ?? [];
  const thisMonth = series.length ? series[series.length - 1]!.revenue : 0;

  return (
    <AdminShell
      title="Dashboard"
      subtitle={isLoading ? "Crunching live figures…" : "Live figures straight from the ticketing database"}
      actions={
        <Button variant="hero" size="sm" asChild>
          <Link to="/admin/events">New event</Link>
        </Button>
      }
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load statistics: {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-3xl bg-surface-2/60" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total revenue" value={money(data?.totalRevenue ?? 0)} delta={0} icon={DollarSign} />
          <StatCard
            label="Paid orders"
            value={(data?.totalSales ?? 0).toLocaleString()}
            icon={CreditCard}
            accent="electric"
          />
          <StatCard label="Tickets sold" value={(data?.ticketsSold ?? 0).toLocaleString()} delta={0} icon={Ticket} />
          <StatCard
            label="Live events"
            value={(data?.activeEvents ?? 0).toLocaleString()}
            icon={CalendarRange}
            accent="electric"
          />
          <StatCard
            label="Scheduled / private"
            value={(data?.scheduledEvents ?? 0).toLocaleString()}
            icon={CalendarClock}
          />
          <StatCard
            label="Registered users"
            value={(data?.registeredUsers ?? 0).toLocaleString()}
            icon={Users}
            accent="electric"
          />
          <StatCard
            label="Pending payments"
            value={money(data?.pendingPayments ?? 0)}
            icon={Activity}
            accent="crimson"
          />
          <StatCard label="Refunded" value={money(data?.refunded ?? 0)} delta={0} icon={CreditCard} accent="crimson" />
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Reveal className="rounded-3xl border border-border bg-surface/60 p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-extrabold">Revenue</h2>
              <p className="mt-1 text-xs text-muted-foreground">Last 8 months, all channels</p>
            </div>
            <p className="font-display text-2xl font-extrabold brand-gradient-text">{money(thisMonth)}</p>
          </div>
          <div className="mt-8 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: -18, right: 6 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
                />
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
          {!isLoading && (data?.activity.length ?? 0) === 0 && (
            <p className="mt-6 text-sm text-muted-foreground">No orders yet — activity will appear here.</p>
          )}
          <ul className="mt-6 space-y-5">
            {(data?.activity ?? []).map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", statusTone[a.status] ?? "bg-accent")} />
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{a.who}</span>{" "}
                    <span className="text-muted-foreground">
                      {a.status.toLowerCase()} {a.quantity} × {a.event_name} · {money(a.total)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{relativeTime(a.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal className="mt-6 rounded-3xl border border-border bg-surface/60 p-6">
        <h2 className="font-display text-lg font-extrabold">Top selling events</h2>
        {!isLoading && (data?.topEvents.length ?? 0) === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">Publish an event to start tracking sales.</p>
        )}
        <div className="mt-6 space-y-5">
          {(data?.topEvents ?? []).map((t) => {
            const pct = t.capacity > 0 ? Math.min(100, Math.round((t.sold / t.capacity) * 100)) : 0;
            return (
              <div key={t.name}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="truncate font-medium">{t.name}</span>
                  <span className="shrink-0 text-muted-foreground">{money(t.revenue)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full [background-image:var(--gradient-brand)]" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {t.sold.toLocaleString()} / {t.capacity.toLocaleString()} tickets
                </p>
              </div>
            );
          })}
        </div>
      </Reveal>
    </AdminShell>
  );
}
