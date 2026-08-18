import { createFileRoute } from "@tanstack/react-router";
import { Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, money, adminUsers, type AdminUser } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_admin/admin/users")({
  head: () => ({
    meta: [
      { title: "User management — AFTRS console" },
      { name: "description", content: "Search, filter and inspect AFTRS member accounts and spend." },
      { property: "og:title", content: "User management — AFTRS console" },
      { property: "og:description", content: "Member accounts, tiers and lifetime spend." },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("All tiers");
  const [active, setActive] = useState<AdminUser | null>(null);

  const rows = useMemo(
    () =>
      adminUsers.filter(
        (u) =>
          (tier === "All tiers" || u.tier === tier) &&
          `${u.name} ${u.email} ${u.city} ${u.id}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, tier],
  );

  return (
    <AdminShell
      title="User management"
      subtitle={`${adminUsers.length} member accounts`}
      actions={
        <Button variant="hero" size="sm">
          <UserPlus /> Invite
        </Button>
      }
    >
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search members"
            aria-label="Search members"
            className="h-11 rounded-full bg-secondary/40 pl-11"
          />
        </div>
        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger className="h-11 w-44 rounded-full bg-secondary/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["All tiers", "Member", "Priority", "Founding"].map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border">
        <div className="hidden grid-cols-[1.5fr_1fr_0.8fr_0.7fr_0.9fr_0.8fr] gap-4 bg-surface-2/60 px-6 py-4 text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase lg:grid">
          <span>Member</span>
          <span>City</span>
          <span>Tier</span>
          <span className="text-right">Orders</span>
          <span className="text-right">Spend</span>
          <span className="text-right">Status</span>
        </div>
        {rows.map((u) => (
          <button
            key={u.id}
            onClick={() => setActive(u)}
            className="grid w-full gap-2 border-t border-border bg-surface/40 px-6 py-4 text-left transition-colors hover:bg-surface-2/60 lg:grid-cols-[1.5fr_1fr_0.8fr_0.7fr_0.9fr_0.8fr] lg:items-center lg:gap-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold">
                {u.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{u.city}</p>
            <p className="text-sm">{u.tier}</p>
            <p className="text-sm lg:text-right">{u.orders}</p>
            <p className="font-display text-sm font-extrabold lg:text-right">{money(u.spend)}</p>
            <div className="lg:flex lg:justify-end">
              <StatusBadge status={u.status} />
            </div>
          </button>
        ))}
        {rows.length === 0 && (
          <p className="border-t border-border px-6 py-16 text-center text-sm text-muted-foreground">
            No members match that search.
          </p>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="rounded-3xl border-border bg-popover sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-extrabold">{active?.name}</DialogTitle>
          </DialogHeader>
          {active && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">{active.email}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Member ID", active.id],
                  ["City", active.city],
                  ["Tier", active.tier],
                  ["Joined", formatDate(active.joined)],
                  ["Orders", String(active.orders)],
                  ["Lifetime spend", money(active.spend)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-border p-4">
                    <p className="text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase">{k}</p>
                    <p className="mt-1.5 text-sm font-semibold">{v}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="hero" size="sm">Grant Priority</Button>
                <Button variant="glass" size="sm">Send message</Button>
                <Button variant="outline" size="sm" className="text-destructive">Suspend</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}