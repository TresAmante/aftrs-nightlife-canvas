import { supabase } from "@/integrations/supabase/client";

export type AdminUserRow = {
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

type RawAdminUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  city: string | null;
  tier: string | null;
  orders: string | number;
  spend: string | number;
  joined: string;
  status: string | null;
};

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const { data, error } = await supabase.rpc("admin_users_list");
  if (error) throw error;
  if (!data) return [];
  return (data as RawAdminUserRow[]).map((r) => ({
    id: r.id,
    name: r.name ?? "",
    email: r.email ?? "",
    city: r.city ?? "",
    tier: (r.tier as AdminUserRow["tier"]) ?? "Member",
    orders: Number(r.orders) || 0,
    spend: Number(r.spend) || 0,
    joined: r.joined,
    status: (r.status as AdminUserRow["status"]) ?? "Active",
  }));
}

export async function updateUserTier(
  userId: string,
  tier: "Member" | "Priority" | "Founding",
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ tier })
    .eq("id", userId);
  if (error) throw error;
}

export async function updateUserStatus(
  userId: string,
  status: "Active" | "Suspended" | "Invited",
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", userId);
  if (error) throw error;
}
