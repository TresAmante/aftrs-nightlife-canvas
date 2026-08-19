import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Eye, EyeOff, ImagePlus, Loader as Loader2, Percent, Plus, Tag, Ticket, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createEvent,
  deleteEvent,
  listEvents,
  setEventVisibility,
  visibilityOf,
  type Visibility,
} from "@/lib/events-api";
import { formatDate, money, cn } from "@/lib/utils";
import {
  listPromoCodes,
  createPromoCode,
  togglePromoCode,
  type PromoCodeRow,
} from "@/lib/promo-api";

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

type TierDraft = { name: string; price: string };

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const visibilityMeta: Record<Visibility, { label: string; className: string }> = {
  public: { label: "Public", className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" },
  private: { label: "Private", className: "border-border bg-secondary/60 text-muted-foreground" },
  scheduled: { label: "Scheduled", className: "border-accent/40 bg-accent/10 text-accent" },
};

function AdminEvents() {
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useQuery({ queryKey: ["admin-events"], queryFn: listEvents });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "",
    venue: "",
    date: "",
    time: "",
    genre: "",
    capacity: "",
    description: "",
  });
  const [tiers, setTiers] = useState<TierDraft[]>([
    { name: "General", price: "4900" },
    { name: "Priority", price: "7600" },
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [launchAt, setLaunchAt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [promos, setPromos] = useState<{ code: string; type: "percent" | "fixed"; value: string }[]>([
    { code: "EARLYBIRD", type: "percent", value: "15" },
  ]);
  const { data: codes = [], isLoading: codesLoading } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: listPromoCodes,
  });

  const setField = (key: keyof typeof form, v: string) => setForm((f) => ({ ...f, [key]: v }));
  const setTier = (i: number, key: "name" | "price", v: string) =>
    setTiers((t) => t.map((row, idx) => (idx === i ? { ...row, [key]: v } : row)));
  const setPromo = (i: number, patch: Partial<{ code: string; type: "percent" | "fixed"; value: string }>) =>
    setPromos((p) => p.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const pickImage = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file isn't an image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm({ name: "", city: "", venue: "", date: "", time: "", genre: "", capacity: "", description: "" });
    setTiers([{ name: "General", price: "" }]);
    setImageFile(null);
    setImagePreview(null);
    setVisibility("public");
    setLaunchAt("");
  };

  const create = useMutation({
    mutationFn: async () => {
      const cleanTiers = tiers
        .filter((t) => t.name.trim() && t.price)
        .map((t) => ({ name: t.name.trim(), price: Number(t.price) }));
      const result = await createEvent({
        name: form.name.trim(),
        city: form.city.trim(),
        venue: form.venue.trim(),
        genre: form.genre.trim(),
        description: form.description.trim(),
        event_date: form.date,
        start_time: form.time,
        capacity: Number(form.capacity || 0),
        status: visibility === "private" ? "Draft" : "On sale",
        publish_at:
          visibility === "scheduled" && launchAt ? new Date(launchAt).toISOString() : null,
        imageFile,
        tiers: cleanTiers,
      });
      const freshPromos = promos.filter((p) => p.code.trim() && p.value);
      for (const p of freshPromos) {
        await createPromoCode({
          code: p.code.trim(),
          promoter: "AFTRS Crew",
          event_name: form.name || null,
          type: p.type,
          value: Number(p.value),
          max_uses: 100,
          expires: new Date().toISOString().slice(0, 10),
        });
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      toast.success("Event published", { description: `${tiers.length} ticket tiers saved` });
      setOpen(false);
      resetForm();
    },
    onError: (e: Error) => toast.error("Could not publish event", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Event removed");
    },
    onError: (e: Error) => toast.error("Could not remove event", { description: e.message }),
  });

  const changeVisibility = useMutation({
    mutationFn: ({ id, vis, at }: { id: string; vis: Visibility; at?: string | null }) =>
      setEventVisibility(id, vis, at),
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success(
        v.vis === "public"
          ? "Event is now public"
          : v.vis === "private"
            ? "Event hidden from the public site"
            : "Public launch scheduled",
      );
    },
    onError: (e: Error) => toast.error("Could not update visibility", { description: e.message }),
  });

  const canSubmit = form.name.trim() && form.city.trim() && form.date && tiers.some((t) => t.name && t.price);

  return (
    <AdminShell
      title="Event management"
      subtitle={isLoading ? "Loading catalogue…" : `${events.length} events in the catalogue`}
      actions={
        <Button variant="hero" size="sm" onClick={() => setOpen(true)}>
          <Plus /> Create event
        </Button>
      }
    >
      <div className="overflow-hidden rounded-3xl border border-border">
        <div className="hidden grid-cols-[1.8fr_1fr_1fr_0.9fr_0.8fr_auto] gap-4 bg-surface-2/60 px-6 py-4 text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase lg:grid">
          <span>Event</span>
          <span>City</span>
          <span>Date</span>
          <span className="text-right">Sold</span>
          <span className="text-right">Status</span>
          <span />
        </div>

        {isLoading && (
          <div className="space-y-3 p-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-surface-2/60" />
            ))}
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="font-display text-lg font-extrabold">No events yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Publish your first event — add artwork, ticket tiers and pricing in one go.
            </p>
            <Button variant="hero" size="sm" onClick={() => setOpen(true)}>
              <Plus /> Create event
            </Button>
          </div>
        )}

        {events.map((e) => (
          <div
            key={e.id}
            className="grid gap-2 border-t border-border bg-surface/40 px-6 py-4 transition-colors hover:bg-surface-2/60 lg:grid-cols-[1.8fr_1fr_1fr_0.9fr_0.8fr_auto] lg:items-center lg:gap-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              {e.imageSrc ? (
                <img
                  src={e.imageSrc}
                  alt={`${e.name} artwork`}
                  loading="lazy"
                  className="size-11 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary/40 text-muted-foreground">
                  <ImagePlus className="size-4" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold">{e.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {e.venue ?? "Venue TBA"} · from {money(e.tiers[0]?.price ?? e.price)}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{e.city}</p>
            <p className="text-sm text-muted-foreground">{formatDate(e.event_date)}</p>
            <p className="text-sm lg:text-right">
              {e.sold.toLocaleString()} / {e.capacity.toLocaleString()}
            </p>
            <div className="flex flex-col items-start gap-2 lg:items-end">
              {(() => {
                const vis = visibilityOf(e);
                const meta = visibilityMeta[vis];
                return (
                  <>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.08em] uppercase",
                        meta.className,
                      )}
                    >
                      {vis === "public" ? (
                        <Eye className="size-3" />
                      ) : vis === "private" ? (
                        <EyeOff className="size-3" />
                      ) : (
                        <CalendarClock className="size-3" />
                      )}
                      {meta.label}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          changeVisibility.mutate({ id: e.id, vis: vis === "public" ? "private" : "public" })
                        }
                        className="rounded-full border border-border px-3 py-1 text-[0.68rem] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                      >
                        {vis === "public" ? "Make private" : "Publish now"}
                      </button>
                      <input
                        type="datetime-local"
                        aria-label={`Schedule public launch for ${e.name}`}
                        value={toLocalInput(e.publish_at)}
                        onChange={(ev) =>
                          changeVisibility.mutate({
                            id: e.id,
                            vis: ev.target.value ? "scheduled" : "public",
                            at: ev.target.value ? new Date(ev.target.value).toISOString() : null,
                          })
                        }
                        className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-[0.68rem] text-muted-foreground"
                      />
                    </div>
                  </>
                );
              })()}
            </div>
            <button
              aria-label={`Delete ${e.name}`}
              onClick={() => remove.mutate(e.id)}
              className="w-fit rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
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
          {codesLoading && (
            <p className="border-t border-border px-6 py-16 text-center text-sm text-muted-foreground">Loading promo codes…</p>
          )}
          {!codesLoading && codes.length === 0 && (
            <p className="border-t border-border px-6 py-16 text-center text-sm text-muted-foreground">
              No promo codes yet. Create one from the event form.
            </p>
          )}
          {codes.map((c) => (
            <div
              key={c.id}
              className="grid gap-2 border-t border-border bg-surface/40 px-6 py-4 transition-colors hover:bg-surface-2/60 lg:grid-cols-[1fr_1.2fr_1.2fr_0.8fr_1fr_0.7fr] lg:items-center lg:gap-4"
            >
              <span className="w-fit rounded-lg border border-border bg-secondary/40 px-2.5 py-1 font-mono text-xs tracking-[0.16em]">
                {c.code}
              </span>
              <p className="text-sm text-muted-foreground">{c.promoter}</p>
              <p className="truncate text-sm text-muted-foreground">{c.event_name ?? "All events"}</p>
              <p className="text-sm font-semibold brand-gradient-text">
                {c.type === "percent" ? `${c.value}% off` : `${money(c.value)} off`}
              </p>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {c.used} / {c.max_uses}{c.expires ? ` · expires ${formatDate(c.expires)}` : ""}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full [background-image:var(--gradient-brand)]"
                    style={{ width: `${Math.min(100, Math.round((c.used / c.max_uses) * 100))}%` }}
                  />
                </div>
              </div>
              <div className="lg:flex lg:justify-end">
                <button
                  onClick={() => {
                    togglePromoCode(c.id, !c.active)
                      .then(() => queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] }))
                      .catch((e: Error) => toast.error("Could not update promo code", { description: e.message }));
                  }}
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
              <Label>Event artwork</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/30 transition-colors hover:border-primary/60"
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Event artwork preview" className="size-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-background/70 py-2 text-xs">
                      Click to replace
                    </span>
                  </>
                ) : (
                  <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                    <ImagePlus className="size-6 text-accent" />
                    Upload a poster — JPG or PNG, up to 5 MB
                  </span>
                )}
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ev-title">Title</Label>
              <Input
                id="ev-title"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Midnight Frequency"
                className="h-11 rounded-xl bg-secondary/40"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ev-city">City</Label>
                <Input
                  id="ev-city"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  placeholder="Manila"
                  className="h-11 rounded-xl bg-secondary/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-venue">Venue</Label>
                <Input
                  id="ev-venue"
                  value={form.venue}
                  onChange={(e) => setField("venue", e.target.value)}
                  placeholder="The Vault"
                  className="h-11 rounded-xl bg-secondary/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-date">Date</Label>
                <Input
                  id="ev-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setField("date", e.target.value)}
                  className="h-11 rounded-xl bg-secondary/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-time">Start time</Label>
                <Input
                  id="ev-time"
                  type="time"
                  value={form.time}
                  onChange={(e) => setField("time", e.target.value)}
                  className="h-11 rounded-xl bg-secondary/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-genre">Genre</Label>
                <Input
                  id="ev-genre"
                  value={form.genre}
                  onChange={(e) => setField("genre", e.target.value)}
                  placeholder="Techno"
                  className="h-11 rounded-xl bg-secondary/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-cap">Capacity</Label>
                <Input
                  id="ev-cap"
                  inputMode="numeric"
                  value={form.capacity}
                  onChange={(e) => setField("capacity", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="1200"
                  className="h-11 rounded-xl bg-secondary/40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-desc">Description</Label>
              <Textarea
                id="ev-desc"
                rows={4}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                className="rounded-xl bg-secondary/40"
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-border bg-surface/50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                {visibility === "public" ? (
                  <Eye className="size-4 text-accent" />
                ) : visibility === "private" ? (
                  <EyeOff className="size-4 text-accent" />
                ) : (
                  <CalendarClock className="size-4 text-accent" />
                )}
                Visibility
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["public", "private", "scheduled"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={cn(
                      "rounded-xl border p-3 text-center text-xs font-medium transition-all",
                      visibility === v
                        ? "border-primary/60 bg-primary/12 shadow-[0_0_34px_-16px_var(--violet)]"
                        : "border-border text-muted-foreground hover:border-primary/35 hover:bg-secondary/40",
                    )}
                  >
                    {v === "public" ? "Public now" : v === "private" ? "Private" : "Schedule"}
                  </button>
                ))}
              </div>
              {visibility === "scheduled" && (
                <div className="space-y-2">
                  <Label htmlFor="ev-launch">Launch date &amp; time</Label>
                  <Input
                    id="ev-launch"
                    type="datetime-local"
                    value={launchAt}
                    onChange={(e) => setLaunchAt(e.target.value)}
                    className="h-11 rounded-xl bg-secondary/40"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-border bg-surface/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Ticket className="size-4 text-accent" /> Ticket pricing (₱)
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
                      ₱
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
                        {t === "percent" ? "%" : "₱"}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={p.value}
                    onChange={(e) => setPromo(i, { value: e.target.value.replace(/[^\d.]/g, "") })}
                    inputMode="decimal"
                    placeholder={p.type === "percent" ? "15" : "500"}
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
                disabled={!canSubmit || create.isPending}
                onClick={() => create.mutate()}
              >
                {create.isPending ? <Loader2 className="animate-spin" /> : null}
                {create.isPending ? "Publishing…" : "Publish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
