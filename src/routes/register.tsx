import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Loader2, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

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
  const [busy, setBusy] = useState(false);
  const [city, setCity] = useState("Kuala Lumpur");
  const [sent, setSent] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading || !session) return;
    void navigate({ to: isAdmin ? "/admin" : "/tickets", replace: true });
  }, [session, isAdmin, loading, navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: String(form.get("first_name") ?? "").trim(),
          last_name: String(form.get("last_name") ?? "").trim(),
          home_city: city,
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Couldn't create your account", { description: error.message });
      return;
    }
    if (!data.session) {
      setSent(email);
      return;
    }
    toast.success("You're on the list");
  }

  async function onGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-up failed", { description: String(result.error) });
      return;
    }
    if (result.redirected) return;
    setBusy(false);
  }

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
      {sent ? (
        <div className="rounded-3xl border border-border bg-secondary/30 p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/15">
            <MailCheck className="size-5 text-violet-soft" />
          </span>
          <h2 className="mt-5 font-display text-xl font-extrabold">Confirm your email</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We sent a confirmation link to <span className="text-foreground">{sent}</span>. Click it
            to activate your AFTRS account, then sign in.
          </p>
          <Button asChild variant="glass" size="lg" className="mt-6 w-full">
            <Link to="/login">Go to sign in</Link>
          </Button>
        </div>
      ) : (
        <>
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

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name">
                <Input
                  name="first_name"
                  required
                  placeholder="Amara"
                  className="h-12 rounded-2xl bg-secondary/40"
                />
              </Field>
              <Field label="Last name">
                <Input
                  name="last_name"
                  required
                  placeholder="Devi"
                  className="h-12 rounded-2xl bg-secondary/40"
                />
              </Field>
            </div>

            <Field label="Email">
              <Input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@night.com"
                className="h-12 rounded-2xl bg-secondary/40"
              />
            </Field>

            <Field label="Home city">
              <Select value={city} onValueChange={setCity}>
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
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="h-12 rounded-2xl bg-secondary/40"
              />
            </Field>

            <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
              <Checkbox required className="mt-0.5" /> I'm over 18 and accept the AFTRS terms and
              door policy.
            </label>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : null} Create account <ArrowRight />
            </Button>

            <Button
              type="button"
              variant="glass"
              size="lg"
              className="w-full"
              onClick={onGoogle}
              disabled={busy}
            >
              Continue with Google
            </Button>
          </form>
        </>
      )}
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
