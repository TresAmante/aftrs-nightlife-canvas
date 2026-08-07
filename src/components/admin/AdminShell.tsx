import { Link } from "@tanstack/react-router";
import { BarChart3, CalendarRange, LayoutDashboard, Search, Ticket, Users } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/site/Logo";
import { Input } from "@/components/ui/input";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users, exact: false },
  { to: "/admin/events", label: "Events", icon: CalendarRange, exact: false },
  { to: "/admin/tickets", label: "Tickets", icon: Ticket, exact: false },
  { to: "/admin/sales", label: "Sales", icon: BarChart3, exact: false },
] as const;

export function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grain relative min-h-screen bg-ink lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 z-40 hidden h-screen flex-col border-r border-border bg-sidebar p-5 lg:flex">
        <Link to="/" className="mb-10 block">
          <Logo />
        </Link>
        <nav className="space-y-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.exact }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-foreground"
              activeProps={{
                className:
                  "bg-primary/15 text-foreground border border-primary/35 shadow-[0_0_26px_-14px_var(--violet)]",
              }}
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-border p-4">
          <p className="text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase">
            Signed in
          </p>
          <p className="mt-2 text-sm font-semibold">Ops · Amara D.</p>
          <Link to="/" className="mt-3 inline-block text-xs text-violet-soft hover:underline">
            Back to site
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 glass-strong border-b border-border">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8">
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-extrabold sm:text-2xl">{title}</h1>
              <p className="mt-1 truncate text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search console"
                  aria-label="Search console"
                  className="h-10 w-56 rounded-full bg-secondary/40 pl-10"
                />
              </div>
              {actions}
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 lg:hidden">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.exact }}
                className="rounded-full px-4 py-2 text-xs whitespace-nowrap text-muted-foreground"
                activeProps={{ className: "bg-primary/15 text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}