import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — AFTRS" },
      {
        name: "description",
        content: "Sign in to your AFTRS account to see your tickets, pre-sale codes and guestlists.",
      },
      { property: "og:title", content: "Sign in — AFTRS" },
      { property: "og:description", content: "Access your AFTRS tickets and pre-sale codes." },
    ],
  }),
  component: LoginPage,
});

function safePath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

function LoginPage() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();
  const search = Route.useSearch();
  const target = safePath(search.redirect);

  useEffect(() => {
    if (loading || !session) return;
    void navigate({ to: target ?? (isAdmin ? "/admin" : "/tickets"), replace: true });
  }, [session, isAdmin, loading, navigate, target]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    setBusy(false);
    if (error) {
      toast.error("Couldn't sign you in", { description: error.message });
      return;
    }
    toast.success("Welcome back");
  }

  async function onGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed", { description: String(result.error) });
      return;
    }
    if (result.redirected) return;
    setBusy(false);
  }

  return (
    <AuthShell
      eyebrow="Members"
      title={
        <>
          Back for
          <br />
          <span className="brand-gradient-text">another one.</span>
        </>
      }
      subtitle="Sign in to see your tickets, pre-sale codes and guestlist spots."
      quote="The best rooms don't advertise. They just tell the list."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="text-violet-soft underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <Field label="Email">
          <Input
            name="email"
            type="email"
            placeholder="you@night.com"
            required
            autoComplete="email"
            className="h-12 rounded-2xl bg-secondary/40"
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <Input
              name="password"
              type={show ? "text" : "password"}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-12 rounded-2xl bg-secondary/40 pr-12"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Checkbox defaultChecked /> Keep me signed in
          </label>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : null} Sign in <ArrowRight />
        </Button>

        <div className="flex items-center gap-4 py-2">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button type="button" variant="glass" size="lg" className="w-full" onClick={onGoogle} disabled={busy}>
          Continue with Google
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
