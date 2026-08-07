import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
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

function LoginPage() {
  const [show, setShow] = useState(false);

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
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Welcome back", { description: "This is a UI prototype — no session created." });
        }}
      >
        <Field label="Email">
          <Input type="email" placeholder="you@night.com" required className="h-12 rounded-2xl bg-secondary/40" />
        </Field>

        <Field label="Password">
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              required
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
            <Checkbox /> Keep me signed in
          </label>
          <span className="cursor-pointer text-sm text-violet-soft underline-offset-4 hover:underline">
            Forgot?
          </span>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full">
          Sign in <ArrowRight />
        </Button>

        <div className="flex items-center gap-4 py-2">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="button" variant="glass" size="lg">
            Continue with Google
          </Button>
          <Button type="button" variant="glass" size="lg">
            Continue with Apple
          </Button>
        </div>
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