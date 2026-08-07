import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Instagram, Music2, Send } from "lucide-react";

import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const columns = [
  {
    title: "Explore",
    items: [
      { label: "All events", to: "/events" },
      { label: "My tickets", to: "/tickets" },
      { label: "Purchase history", to: "/purchases" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Sign in", to: "/login" },
      { label: "Create account", to: "/register" },
      { label: "Organiser console", to: "/admin" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-ink">
      <div
        aria-hidden
        className="animate-pulse-glow pointer-events-none absolute -bottom-56 left-1/2 h-[32rem] w-[70rem] -translate-x-1/2 rounded-full bg-violet/20 blur-[150px]"
      />
      <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-10 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs font-display text-2xl leading-[1.15] font-extrabold">
              Where the real <span className="brand-gradient-text">party</span> starts.
            </p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Music2, Send].map((Icon, i) => (
                <span
                  key={i}
                  className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground hover:shadow-[0_0_24px_-8px_var(--violet)]"
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[0.7rem] tracking-[0.22em] text-muted-foreground uppercase">
                {col.title}
              </p>
              <ul className="mt-5 space-y-3">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                      <ArrowUpRight className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-[0.7rem] tracking-[0.22em] text-muted-foreground uppercase">
              The list
            </p>
            <p className="mt-5 text-sm text-muted-foreground">
              Drops, guestlists and pre-sale codes. Sent the night before, never more.
            </p>
            <form
              className="mt-5 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <Input
                type="email"
                placeholder="you@night.com"
                aria-label="Email address"
                className="h-11 rounded-full border-border bg-secondary/40"
              />
              <Button type="submit" variant="hero" size="icon" className="h-11 w-11 shrink-0">
                <ArrowUpRight />
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AFTRS Collective. All rights reserved.</p>
          <p className="tracking-[0.18em] uppercase">Kuala Lumpur · Singapore · Bangkok · Bali</p>
        </div>
      </div>
    </footer>
  );
}