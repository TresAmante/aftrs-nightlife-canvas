import { supabase } from "@/integrations/supabase/client";

export type RevenuePoint = { month: string; revenue: number; tickets: number };
export type TopEvent = { name: string; capacity: number; sold: number; revenue: number };
export type ActivityRow = {
  who: string;
  quantity: number;
  event_name: string;
  status: string;
  total: number;
  created_at: string;
};

export type AdminStats = {
  totalRevenue: number;
  totalSales: number;
  ticketsSold: number;
  refunded: number;
  pendingPayments: number;
  activeEvents: number;
  scheduledEvents: number;
  registeredUsers: number;
  revenueSeries: RevenuePoint[];
  topEvents: TopEvent[];
  activity: ActivityRow[];
};

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabase.rpc("admin_dashboard_stats");
  if (error) throw error;
  const raw = data as unknown as AdminStats;
  return {
    ...raw,
    totalRevenue: Number(raw.totalRevenue),
    totalSales: Number(raw.totalSales),
    ticketsSold: Number(raw.ticketsSold),
    refunded: Number(raw.refunded),
    pendingPayments: Number(raw.pendingPayments),
    activeEvents: Number(raw.activeEvents),
    scheduledEvents: Number(raw.scheduledEvents),
    registeredUsers: Number(raw.registeredUsers),
    revenueSeries: (raw.revenueSeries ?? []).map((p) => ({
      month: p.month,
      revenue: Number(p.revenue),
      tickets: Number(p.tickets),
    })),
    topEvents: (raw.topEvents ?? []).map((t) => ({
      ...t,
      sold: Number(t.sold),
      capacity: Number(t.capacity),
      revenue: Number(t.revenue),
    })),
    activity: (raw.activity ?? []).map((a) => ({ ...a, quantity: Number(a.quantity), total: Number(a.total) })),
  };
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return `${days} d ago`;
}
