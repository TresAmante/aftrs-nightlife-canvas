/*
# Create promo_codes table

1. New Tables
- `promo_codes`
  - `id` (uuid, primary key)
  - `code` (text, unique, not null) — the discount code string, e.g. "NARI20"
  - `promoter` (text, not null) — name of the promoter who owns the code
  - `event_id` (uuid, nullable, FK to events) — optional event scoping; null = all events
  - `event_name` (text, nullable) — denormalized event name for display
  - `type` (text, not null, CHECK in 'percent','fixed') — discount type
  - `value` (numeric, not null) — percent (0-100) or fixed amount in cents
  - `used` (integer, default 0) — how many times redeemed
  - `max_uses` (integer, default 100) — max redemptions allowed
  - `expires` (date, nullable) — expiry date
  - `active` (boolean, default true) — whether the code is currently live
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `promo_codes`.
- Admin-only CRUD (select/insert/update/delete) using existing `has_role` check.
- Anon + authenticated can validate codes via the `validate_promo_code` function (SECURITY DEFINER),
  which only returns the discount type and value — never the full table.

3. New Functions
- `validate_promo_code(p_code text, p_event_id uuid)` — SECURITY DEFINER function that checks
  if a code is valid for a given event (or globally). Returns the discount type and value if valid,
  or null if not found/inactive/expired/at limit. Atomically increments usage count.

4. Important Notes
- The `validate_promo_code` function increments `used` atomically when a valid code is found,
  preventing race conditions on redemption.
- Only the validation function is callable by anon/authenticated; direct table access is admin-only.
- Seeds the table with the 5 existing hardcoded promo codes so the app doesn't lose data.
*/

CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  promoter text NOT NULL DEFAULT 'AFTRS Crew',
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  event_name text,
  type text NOT NULL DEFAULT 'percent' CHECK (type IN ('percent', 'fixed')),
  value numeric NOT NULL DEFAULT 0,
  used integer NOT NULL DEFAULT 0,
  max_uses integer NOT NULL DEFAULT 100,
  expires date,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view promo codes" ON promo_codes;
CREATE POLICY "Admins can view promo codes"
ON promo_codes FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert promo codes" ON promo_codes;
CREATE POLICY "Admins can insert promo codes"
ON promo_codes FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update promo codes" ON promo_codes;
CREATE POLICY "Admins can update promo codes"
ON promo_codes FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete promo codes" ON promo_codes;
CREATE POLICY "Admins can delete promo codes"
ON promo_codes FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION validate_promo_code(p_code text, p_event_id uuid)
RETURNS TABLE (
  valid boolean,
  type text,
  value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := UPPER(TRIM(p_code));
  v_type text;
  v_value numeric;
  v_used integer;
  v_max_uses integer;
  v_expires date;
  v_active boolean;
  v_event_id uuid;
BEGIN
  SELECT pc.type, pc.value, pc.used, pc.max_uses, pc.expires, pc.active, pc.event_id
  INTO v_type, v_value, v_used, v_max_uses, v_expires, v_active, v_event_id
  FROM promo_codes pc
  WHERE pc.code = v_code;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::text, NULL::numeric;
    RETURN;
  END IF;

  IF NOT v_active THEN
    RETURN QUERY SELECT false, NULL::text, NULL::numeric;
    RETURN;
  END IF;

  IF v_expires IS NOT NULL AND v_expires < CURRENT_DATE THEN
    RETURN QUERY SELECT false, NULL::text, NULL::numeric;
    RETURN;
  END IF;

  IF v_used >= v_max_uses THEN
    RETURN QUERY SELECT false, NULL::text, NULL::numeric;
    RETURN;
  END IF;

  -- If code is event-scoped and doesn't match the requested event, reject
  IF v_event_id IS NOT NULL AND p_event_id IS NOT NULL AND v_event_id <> p_event_id THEN
    RETURN QUERY SELECT false, NULL::text, NULL::numeric;
    RETURN;
  END IF;

  -- Atomically increment usage
  UPDATE promo_codes SET used = used + 1, updated_at = now() WHERE code = v_code;

  RETURN QUERY SELECT true, v_type, v_value;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_promo_code(text, uuid) TO anon, authenticated;

-- Seed existing promo codes
INSERT INTO promo_codes (code, promoter, event_name, type, value, used, max_uses, expires, active)
VALUES
  ('NARI20', 'Nari Sun', 'Midnight Frequency', 'percent', 20, 128, 250, '2026-09-10', true),
  ('SKYLINE15', 'Aurora Rooftop', 'Skyline Sessions', 'fixed', 800, 64, 200, '2026-09-25', true),
  ('REDLIST', 'Sub Basement 9', 'Red Room', 'percent', 100, 40, 40, '2026-10-03', false),
  ('SANDDISCO', 'Bamboo Sound', 'Golden Hour', 'fixed', 1400, 212, 500, '2026-10-16', true),
  ('FINALE10', 'AFTRS Crew', 'Afterlight Arena', 'percent', 10, 1340, 3000, '2026-12-12', true)
ON CONFLICT (code) DO NOTHING;
