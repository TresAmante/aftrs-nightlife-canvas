import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AdminShell } from "@/components/admin/AdminShell";
import { Reveal } from "@/components/site/Reveal";
import { fetchSalesAnalytics } from "@/lib/admin-stats";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_admin/admin/sales")({
  head: () => ({
    meta: [
      { title: "Sales dashboard — AFTRS console" },
      { name: "description", content: "Monthly revenue, ticket volume and sales channel mix for AFTRS." },
      { property: "og:title", content: "Sales dashboard — AFTRS console" },
      { property: "og:description", content: "Revenue graphs and monthly sales for AFTRS events." },
    ],
  }),
  component: AdminSales,
});

const COLORS = ["var(--violet)", "var(--electric)", "var(--crimson)", "var(--muted-foreground)"];

function AdminSales() {
  const { data, isLoading } = useQuery({ queryKey: ["sales-analytics"], queryFn: fetchSalesAnalytics });

  const series = data?.revenueSeries ?? [];
  const channels = data?.channelSplit ?? [];

  return (
    <AdminShell title="Sales" subtitle="Monthly performance and channel mix">
      {isLoading && (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="h-80 animate-pulse rounded-3xl bg-surface-2/60" />
          <div className="h-80 animate-pulse rounded-3xl bg-surface-2/60" />
        </div>
      )}

      {!isLoading && (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Reveal className="rounded-3xl border border-border bg-surface/60 p-6">
              <h2 className="font-display text-lg font-extrabold">Monthly sales</h2>
              <div className="mt-8 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series} margin={{ left: -18, right: 6 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "var(--secondary)", opacity: 0.4 }}
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 16, fontSize: 12 }}
                    />
                    <Bar dataKey="tickets" fill="var(--violet)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="rounded-3xl border border-border bg-surface/60 p-6">
              <h2 className="font-display text-lg font-extrabold">Channel mix</h2>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={channels} dataKey="value" innerRadius={54} outerRadius={82} paddingAngle={3} stroke="none">
                      {channels.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 16, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-4 space-y-2">
                {channels.map((c, i) => (
                  <li key={c.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {c.name}
                    </span>
                    <span className="font-semibold">{c.value}%</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Avg. order value", money(data?.avgOrderValue ?? 0)],
              ["Refund rate", `${data?.refundRate ?? 0}%`],
              ["Best month", data?.bestMonth ?? "—"],
            ].map(([l, v]) => (
              <div key={l} className="rounded-3xl border border-border bg-surface/60 p-6">
                <p className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase">{l}</p>
                <p className="mt-3 font-display text-3xl font-extrabold">{v}</p>
              </div>
            ))}
          </Reveal>
        </>
      )}
    </AdminShell>
  );
}
