import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import heroImg from "@/assets/hero.jpg";
import { Aurora } from "@/components/site/Aurora";
import { Logo } from "@/components/site/Logo";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  quote,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  quote: string;
}) {
  return (
    <div className="grain relative min-h-screen bg-background lg:grid lg:grid-cols-[1fr_1.05fr]">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={heroImg}
          alt="AFTRS dancefloor"
          width={1920}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/55 to-background" />
        <Aurora dense className="opacity-70" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/">
            <Logo />
          </Link>
          <div>
            <p className="max-w-md font-display text-3xl leading-[1.1] font-extrabold">{quote}</p>
            <p className="mt-6 text-sm tracking-[0.2em] text-muted-foreground uppercase">
              AFTRS Collective
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="relative flex min-h-screen items-center justify-center px-5 py-16 sm:px-10">
        <Aurora className="opacity-40 lg:hidden" />
        <motion.div
          initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md"
        >
          <Link to="/" className="mb-10 inline-block lg:hidden">
            <Logo />
          </Link>
          <p className="text-[0.68rem] tracking-[0.24em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,2.8rem)] leading-[1.03] font-extrabold">
            {title}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">{subtitle}</p>

          <div className="mt-10">{children}</div>
          <div className="mt-8 text-sm text-muted-foreground">{footer}</div>
        </motion.div>
      </div>
    </div>
  );
}