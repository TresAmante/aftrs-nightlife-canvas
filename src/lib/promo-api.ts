import { supabase } from "@/integrations/supabase/client";

export type PromoCodeRow = {
  id: string;
  code: string;
  promoter: string;
  event_name: string | null;
  type: "percent" | "fixed";
  value: number;
  used: number;
  max_uses: number;
  expires: string | null;
  active: boolean;
};

type RawPromoCode = {
  id: string;
  code: string;
  promoter: string | null;
  event_name: string | null;
  type: string | null;
  value: string | number;
  used: number;
  max_uses: number;
  expires: string | null;
  active: boolean;
};

export async function listPromoCodes(): Promise<PromoCodeRow[]> {
  const { data, error } = await supabase
    .from("promo_codes")
    .select("id, code, promoter, event_name, type, value, used, max_uses, expires, active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!data) return [];
  return (data as RawPromoCode[]).map((r) => ({
    id: r.id,
    code: r.code,
    promoter: r.promoter ?? "",
    event_name: r.event_name,
    type: (r.type as PromoCodeRow["type"]) ?? "percent",
    value: Number(r.value) || 0,
    used: r.used,
    max_uses: r.max_uses,
    expires: r.expires,
    active: r.active,
  }));
}

export type PromoCodeDraft = {
  code: string;
  promoter: string;
  event_name: string | null;
  type: "percent" | "fixed";
  value: number;
  max_uses: number;
  expires: string | null;
};

export async function createPromoCode(draft: PromoCodeDraft): Promise<PromoCodeRow> {
  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      code: draft.code.trim().toUpperCase(),
      promoter: draft.promoter.trim(),
      event_name: draft.event_name,
      type: draft.type,
      value: draft.value,
      max_uses: draft.max_uses,
      expires: draft.expires,
      active: true,
    })
    .select("id, code, promoter, event_name, type, value, used, max_uses, expires, active")
    .single();
  if (error) throw error;
  const r = data as RawPromoCode;
  return {
    id: r.id,
    code: r.code,
    promoter: r.promoter ?? "",
    event_name: r.event_name,
    type: (r.type as PromoCodeRow["type"]) ?? "percent",
    value: Number(r.value) || 0,
    used: r.used,
    max_uses: r.max_uses,
    expires: r.expires,
    active: r.active,
  };
}

export async function togglePromoCode(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from("promo_codes").update({ active }).eq("id", id);
  if (error) throw error;
}

export type PromoValidation = {
  valid: boolean;
  type: "percent" | "fixed" | null;
  value: number;
};

export async function validatePromoCode(
  code: string,
  eventId: string | null,
): Promise<PromoValidation> {
  const { data, error } = await supabase.rpc("validate_promo_code", {
    p_code: code,
    p_event_id: eventId,
  });
  if (error) throw error;
  const r = data as { valid: boolean; type: string | null; value: string | number | null } | null;
  if (!r || !r.valid) return { valid: false, type: null, value: 0 };
  return {
    valid: true,
    type: (r.type as PromoValidation["type"]) ?? "percent",
    value: Number(r.value) || 0,
  };
}
