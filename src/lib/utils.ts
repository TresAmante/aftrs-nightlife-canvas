import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(cents: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents);
}

export function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDay(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return String(date.getDate());
}

export function formatMonth(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
}

export type PromoCode = {
  id: string;
  code: string;
  promoter: string;
  event: string;
  type: "percent" | "fixed";
  value: number;
  used: number;
  limit: number;
  expires: string;
  active: boolean;
};

export const promoCodes: PromoCode[] = [
  { id: "P-01", code: "NARI20", promoter: "Nari Sun", event: "Midnight Frequency", type: "percent", value: 20, used: 128, limit: 250, expires: "2026-09-10", active: true },
  { id: "P-02", code: "SKYLINE15", promoter: "Aurora Rooftop", event: "Skyline Sessions", type: "fixed", value: 800, used: 64, limit: 200, expires: "2026-09-25", active: true },
  { id: "P-03", code: "REDLIST", promoter: "Sub Basement 9", event: "Red Room", type: "percent", value: 100, used: 40, limit: 40, expires: "2026-10-03", active: false },
  { id: "P-04", code: "SANDDISCO", promoter: "Bamboo Sound", event: "Golden Hour", type: "fixed", value: 1400, used: 212, limit: 500, expires: "2026-10-16", active: true },
  { id: "P-05", code: "FINALE10", promoter: "AFTRS Crew", event: "Afterlight Arena", type: "percent", value: 10, used: 1340, limit: 3000, expires: "2026-12-12", active: true },
];

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  city: string;
  tier: "Member" | "Priority" | "Founding";
  orders: number;
  spend: number;
  joined: string;
  status: "Active" | "Suspended" | "Invited";
};

export const adminUsers: AdminUser[] = [
  { id: "U-8812", name: "Amara Devi", email: "amara.d@mail.com", city: "Kuala Lumpur", tier: "Founding", orders: 24, spend: 265100, joined: "2024-02-11", status: "Active" },
  { id: "U-8790", name: "Théo Marchand", email: "theo.m@mail.com", city: "Singapore", tier: "Priority", orders: 12, spend: 117700, joined: "2024-06-02", status: "Active" },
  { id: "U-8744", name: "Ren Takahashi", email: "ren.t@mail.com", city: "Bangkok", tier: "Member", orders: 4, spend: 25300, joined: "2025-01-19", status: "Invited" },
  { id: "U-8701", name: "Sofia Ibrahim", email: "sofia.i@mail.com", city: "Bali", tier: "Priority", orders: 9, spend: 88550, joined: "2025-03-08", status: "Active" },
  { id: "U-8666", name: "Marcus Well", email: "m.well@mail.com", city: "Hong Kong", tier: "Member", orders: 2, spend: 9900, joined: "2025-09-21", status: "Suspended" },
  { id: "U-8620", name: "Priya Nathan", email: "priya.n@mail.com", city: "Kuala Lumpur", tier: "Founding", orders: 31, spend: 336600, joined: "2023-11-04", status: "Active" },
  { id: "U-8598", name: "Chen Yu Xin", email: "yuxin@mail.com", city: "Singapore", tier: "Member", orders: 6, spend: 39600, joined: "2025-12-15", status: "Active" },
];