import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { LogOut, Menu, Ticket, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const baseLinks = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/tickets", label: "My tickets" },
  { to: "/purchases", label: "Purchases" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { session, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const links = isAdmin ? [...baseLinks, { to: "/admin", label: "Admin" } as const] : baseLinks;

  const handleSignOut = async () => {
    setOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/", replace: true });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "mx-auto flex max-w-6xl items-center gap-4 rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5",
          scrolled
            ? "glass-strong shadow-[0_20px_60px_-30px_oklch(0_0_0/0.9)]"
            : "border border-transparent bg-transparent",
        )}
      >
        <Link to="/" className="shrink-0" aria-label="AFTRS home">
          <Logo />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="relative rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <span className="hidden text-xs text-muted-foreground lg:inline">
                {profile?.first_name ?? session.user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={handleSignOut}
              >
                <LogOut /> Sign out
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
          <Button asChild variant="hero" size="sm" className="hidden sm:inline-flex">
            <Link to="/events">
              <Ticket /> Get tickets
            </Link>
          </Button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-full border border-border lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </motion.div>

      {open && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong mx-auto mt-2 max-w-6xl rounded-3xl p-3 lg:hidden"
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary/50" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 px-1 pb-1">
            {session ? (
              <Button variant="glass" size="sm" className="col-span-2" onClick={handleSignOut}>
                <LogOut /> Sign out
              </Button>
            ) : (
              <>
                <Button asChild variant="glass" size="sm">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild variant="hero" size="sm">
                  <Link to="/register" onClick={() => setOpen(false)}>
                    Join
                  </Link>
                </Button>
              </>
            )}
          </div>
        </motion.nav>
      )}
    </header>
  );
}