import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your AFTRS account" },
      {
        name: "description",
        content:
          "Join AFTRS for 48-hour pre-sale access, guestlist invites and one wallet for every ticket.",
      },
      { property: "og:title", content: "Create your AFTRS account" },
      {
        property: "og:description",
        content: "Pre-sale access, guestlist invites and every ticket in one place.",
      },
    ],
  }),
  component: RegisterPage,
});

const perks = [
  "48-hour pre-sale on every night",
  "Guestlist invites for residencies",
  "One wallet for every ticket",
];

function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Join the list"
      title={
        <>
          Get in before
          <br />
          <span className="brand-gradient-text">everyone else.</span>
        </>
      }
      subtitle="One account for four cities. No fees, no resellers, no queue."
      quote="We keep the list short so the room stays right."
      footer={
        <>
          Already a member?{" "}
          <Link to="/login" className="text-violet-soft underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <ul className="mb-8 space-y-2.5">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15">
              <Check className="size-3 text-violet-soft" />
            </span>
            {p}
          </li>
        ))}
      </ul>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("You're on the list", {
            description: "Prototype only — no account was created.",
          });
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name">
            <Input required placeholder="Amara" className="h-12 rounded-2xl bg-secondary/40" />
          </Field>
          <Field label="Last name">
            <Input required placeholder="Devi" className="h-12 rounded-2xl bg-secondary/40" />
          </Field>
        </div>

        <Field label="Email">
          <Input
            type="email"
            required
            placeholder="you@night.com"
            className="h-12 rounded-2xl bg-secondary/40"
          />
        </Field>

        <Field label="Home city">
          <Select defaultValue="Kuala Lumpur">
            <SelectTrigger className="h-12 rounded-2xl bg-secondary/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Kuala Lumpur", "Singapore", "Bangkok", "Bali", "Hong Kong"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Password">
          <Input
            type="password"
            required
            placeholder="At least 8 characters"
            className="h-12 rounded-2xl bg-secondary/40"
          />
        </Field>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
          <Checkbox className="mt-0.5" /> I'm over 18 and accept the AFTRS terms and door policy.
        </label>

        <Button type="submit" variant="hero" size="lg" className="w-full">
          Create account <ArrowRight />
        </Button>
      </form>
    </AuthShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </Label>
      {children}
    </div>
  );
}