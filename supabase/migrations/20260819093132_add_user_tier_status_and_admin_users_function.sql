/*
# Add membership tier, account status, and admin users list function

1. Modified Tables
- `profiles`: add `tier` column (text, default 'Member') — tracks membership tier: Member, Priority, or Founding.
- `profiles`: add `status` column (text, default 'Active') — tracks account status: Active, Suspended, or Invited.

2. New Functions
- `admin_users_list()` — SECURITY DEFINER function that returns all profiles with their
  computed order count and lifetime spend from ticket_orders. Returns one row per user
  with: id, name, email, city, tier, orders, spend, joined, status.

3. Security
- The function is SECURITY DEFINER so it can read ticket_orders for all users (bypassing RLS).
- Only authenticated users can execute it (existing EXECUTE grant pattern).
- The profiles table already has admin SELECT policy; these columns inherit that policy.
- No new RLS policies needed — existing admin SELECT on profiles covers the new columns.

4. Important Notes
- The `tier` and `status` columns default to 'Member' and 'Active' respectively so existing
  profiles get sensible defaults.
- The function joins profiles LEFT JOIN ticket_orders so users with zero orders still appear.
- Spend is computed as SUM(total) where status = 'Paid'.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'Member'
    CHECK (tier IN ('Member', 'Priority', 'Founding'));

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active', 'Suspended', 'Invited'));

CREATE OR REPLACE FUNCTION admin_users_list()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  city text,
  tier text,
  orders bigint,
  spend numeric,
  joined timestamptz,
  status text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    COALESCE(NULLIF(TRIM(CONCAT(p.first_name, ' ', p.last_name)), ''), p.email) AS name,
    p.email,
    COALESCE(p.home_city, '') AS city,
    p.tier,
    COUNT(o.id)::bigint AS orders,
    COALESCE(SUM(CASE WHEN o.status = 'Paid' THEN o.total ELSE 0 END), 0)::numeric AS spend,
    p.created_at AS joined,
    p.status
  FROM profiles p
  LEFT JOIN ticket_orders o ON o.user_id = p.id
  GROUP BY p.id, p.email, p.home_city, p.tier, p.created_at, p.status
  ORDER BY p.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION admin_users_list() TO authenticated;
