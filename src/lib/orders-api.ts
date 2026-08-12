import { supabase } from "@/integrations/supabase/client";

export type TicketOrder = {
  id: string;
  order_ref: string;
  user_id: string;
  event_id: string | null;
  event_name: string;
  tier_name: string;
  attendee_name: string;
  buyer_name: string;
  buyer_email: string | null;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
  payment_method: string;
  promo_code: string | null;
  status: string;
  created_at: string;
};

export type NewOrderInput = {
  eventId?: string | null;
  eventName: string;
  tierName: string;
  attendeeName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  paymentMethod: string;
  promoCode?: string | null;
  status?: string;
};

function toOrder(row: Record<string, unknown>): TicketOrder {
  return {
    ...(row as unknown as TicketOrder),
    quantity: Number(row["quantity"]),
    unit_price: Number(row["unit_price"]),
    discount: Number(row["discount"]),
    total: Number(row["total"]),
  };
}

export function makeOrderRef() {
  return `AFT-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

export async function createOrder(input: NewOrderInput): Promise<TicketOrder> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("You need to sign in before checking out.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const p = profile as { first_name?: string | null; last_name?: string | null; email?: string | null } | null;
  const buyerName =
    [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim() || user.email || "AFTRS member";

  const { data, error } = await supabase
    .from("ticket_orders")
    .insert({
      order_ref: makeOrderRef(),
      user_id: user.id,
      event_id: input.eventId ?? null,
      event_name: input.eventName,
      tier_name: input.tierName,
      attendee_name: input.attendeeName.trim() || buyerName,
      buyer_name: buyerName,
      buyer_email: p?.email ?? user.email ?? null,
      quantity: input.quantity,
      unit_price: input.unitPrice,
      discount: input.discount,
      total: input.total,
      payment_method: input.paymentMethod,
      promo_code: input.promoCode ?? null,
      status: input.status ?? "Paid",
    })
    .select("*")
    .single();
  if (error) throw error;
  return toOrder(data as Record<string, unknown>);
}

export async function listAllOrders(): Promise<TicketOrder[]> {
  const { data, error } = await supabase
    .from("ticket_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => toOrder(r as Record<string, unknown>));
}

export async function listMyOrders(): Promise<TicketOrder[]> {
  return listAllOrders();
}

export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase.from("ticket_orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export type BuyerSummary = {
  userId: string;
  buyerName: string;
  buyerEmail: string | null;
  orders: number;
  tickets: number;
  spend: number;
};

export function summariseBuyers(orders: TicketOrder[]): BuyerSummary[] {
  const map = new Map<string, BuyerSummary>();
  for (const o of orders) {
    if (o.status === "Refunded" || o.status === "Cancelled") continue;
    const cur = map.get(o.user_id) ?? {
      userId: o.user_id,
      buyerName: o.buyer_name,
      buyerEmail: o.buyer_email,
      orders: 0,
      tickets: 0,
      spend: 0,
    };
    cur.orders += 1;
    cur.tickets += o.quantity;
    cur.spend += o.total;
    map.set(o.user_id, cur);
  }
  return [...map.values()].sort((a, b) => b.tickets - a.tickets);
}
