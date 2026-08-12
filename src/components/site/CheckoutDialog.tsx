import { Building2, Check, Copy, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { money } from "@/lib/mock-data";
import { createOrder } from "@/lib/orders-api";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  eventName: string;
  eventId?: string | null;
  tier: string;
  qty: number;
  total: number;
};

const methods = [
  {
    id: "gcash" as const,
    name: "GCash",
    hint: "Instant · e-wallet",
    icon: Smartphone,
  },
  {
    id: "bank" as const,
    name: "Bank transfer",
    hint: "InstaPay / PESONet",
    icon: Building2,
  },
];

const banks = ["BPI", "BDO", "UnionBank", "Metrobank", "Landbank"];

export function CheckoutDialog({ open, onOpenChange, eventName, eventId, tier, qty, total }: Props) {
  const { user, profile } = useAuth();
  const [method, setMethod] = useState<"gcash" | "bank">("gcash");
  const [mobile, setMobile] = useState("");
  const [bank, setBank] = useState("BPI");
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState(0);
  const [attendee, setAttendee] = useState("");
  const [saving, setSaving] = useState(false);

  const defaultAttendee =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
    profile?.email ||
    user?.email ||
    "";

  const pay = async () => {
    if (!user) {
      toast.error("Sign in to complete your purchase");
      return;
    }
    setSaving(true);
    try {
      const order = await createOrder({
        eventId: eventId ?? null,
        eventName,
        tierName: tier,
        attendeeName: attendee.trim() || defaultAttendee,
        quantity: qty,
        unitPrice: qty > 0 ? Math.round(total / qty) : total,
        discount,
        total: due,
        paymentMethod: method === "gcash" ? "GCash" : `${bank} transfer`,
        promoCode: applied > 0 ? promo.trim().toUpperCase() : null,
        status: method === "gcash" ? "Paid" : "Pending",
      });
      onOpenChange(false);
      toast.success(`Order ${order.order_ref} recorded`, {
        description:
          method === "gcash"
            ? `Approve ${money(due)} in your GCash app${mobile ? ` (${mobile})` : ""}.`
            : `Send ${money(due)} from ${bank} using ref ${reference}.`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record that order");
    } finally {
      setSaving(false);
    }
  };

  const discount = Math.round(total * applied);
  const due = total - discount;
  const reference = "AFTRS-" + String(Math.abs(total * qty)).padStart(6, "0").slice(-6);

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    const table: Record<string, number> = { NARI20: 0.2, FINALE10: 0.1, EARLYBIRD: 0.15 };
    if (table[code]) {
      setApplied(table[code]);
      toast.success(`Promo ${code} applied`, { description: `${table[code] * 100}% off this order` });
    } else {
      setApplied(0);
      toast.error("That promo code isn't valid for this event");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-3xl border-border bg-popover sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold">Checkout</DialogTitle>
        </DialogHeader>

        <p className="-mt-2 text-sm text-muted-foreground">
          {qty} × {tier} · {eventName}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {methods.map((m) => {
            const active = m.id === method;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all duration-300",
                  active
                    ? "border-primary/60 bg-primary/12 shadow-[0_0_34px_-16px_var(--violet)]"
                    : "border-border hover:border-primary/35 hover:bg-secondary/40",
                )}
              >
                <m.icon className={cn("size-5", active ? "text-accent" : "text-muted-foreground")} />
                <p className="mt-3 text-sm font-semibold">{m.name}</p>
                <p className="text-[0.7rem] text-muted-foreground">{m.hint}</p>
              </button>
            );
          })}
        </div>

        {method === "gcash" ? (
          <div className="space-y-4 rounded-2xl border border-border bg-surface/50 p-4">
            <div className="space-y-2">
              <Label htmlFor="gcash-no">GCash mobile number</Label>
              <Input
                id="gcash-no"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, "").slice(0, 11))}
                inputMode="numeric"
                placeholder="09XX XXX XXXX"
                className="h-11 rounded-xl bg-secondary/40"
              />
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-border bg-secondary/30 p-3">
              <div className="grid size-16 shrink-0 grid-cols-4 gap-0.5 rounded-lg bg-foreground/90 p-1.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn("rounded-[1px]", i % 3 === 0 ? "bg-background" : "bg-transparent")}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Scan the QR in your GCash app or approve the push request sent to your number.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-border bg-surface/50 p-4">
            <div className="space-y-2">
              <Label>Sending bank</Label>
              <div className="flex flex-wrap gap-2">
                {banks.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBank(b)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition-colors",
                      bank === b
                        ? "border-accent/50 bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5 rounded-xl border border-border bg-secondary/30 p-3 text-xs">
              <Line label="Account name" value="AFTRS Live Events Inc." />
              <Line label="Account no." value="1234 5678 9012" />
              <Line label="Reference" value={reference} />
            </div>
            <Button
              variant="glass"
              size="sm"
              className="w-full"
              onClick={() => {
                void navigator.clipboard?.writeText(reference);
                toast.success("Reference copied");
              }}
            >
              <Copy /> Copy reference
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="attendee">Ticket under the name of</Label>
          <Input
            id="attendee"
            value={attendee}
            onChange={(e) => setAttendee(e.target.value)}
            placeholder={defaultAttendee || "Full name on the ticket"}
            className="h-11 rounded-xl bg-secondary/40"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promo">Promo code</Label>
          <div className="flex gap-2">
            <Input
              id="promo"
              value={promo}
              onChange={(e) => setPromo(e.target.value.toUpperCase())}
              placeholder="PROMOCODE"
              className="h-11 rounded-xl bg-secondary/40 font-mono tracking-[0.14em]"
            />
            <Button variant="glass" size="sm" className="h-11" onClick={applyPromo}>
              Apply
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <Line label="Subtotal" value={money(total)} />
          {discount > 0 && <Line label="Discount" value={`- ${money(discount)}`} />}
          <div className="flex items-center justify-between pt-1">
            <span className="text-muted-foreground">Amount due</span>
            <span className="font-display text-xl font-extrabold brand-gradient-text">
              {money(due)}
            </span>
          </div>
        </div>

        <Button
          variant="hero"
          size="lg"
          className="w-full"
          disabled={saving}
          onClick={() => void pay()}
        >
          {saving ? <Loader2 className="animate-spin" /> : <Check />} Pay {money(due)}
        </Button>
        <p className="text-center text-[0.7rem] text-muted-foreground">
          Prototype checkout — no live payment is processed.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
