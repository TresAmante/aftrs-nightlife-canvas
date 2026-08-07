import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { events, formatDate, money } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/events")({
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
              <p className="truncate font-semibold">{e.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {e.venue} · from {money(e.priceFrom)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{e.city}</p>
            <p className="text-sm text-muted-foreground">{formatDate(e.date)}</p>
            <p className="text-sm lg:text-right">
              {e.sold.toLocaleString()} / {e.capacity.toLocaleString()}
            </p>
            <div className="lg:flex lg:justify-end">
              <StatusBadge status={e.sold >= e.capacity ? "Sold out" : "Published"} />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl border-border bg-popover sm:max-w-lg">
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
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="glass" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="hero" size="sm" onClick={() => setOpen(false)}>
                Publish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}