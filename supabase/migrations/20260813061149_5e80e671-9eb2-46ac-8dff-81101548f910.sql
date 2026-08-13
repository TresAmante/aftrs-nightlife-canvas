ALTER TABLE public.events ADD COLUMN IF NOT EXISTS publish_at timestamptz;

DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
CREATE POLICY "Anyone can view published events"
ON public.events FOR SELECT TO anon, authenticated
USING (status <> 'Draft' AND (publish_at IS NULL OR publish_at <= now()));

DROP POLICY IF EXISTS "Anyone can view tiers of visible events" ON public.ticket_tiers;
CREATE POLICY "Anyone can view tiers of visible events"
ON public.ticket_tiers FOR SELECT TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM public.events e
  WHERE e.id = ticket_tiers.event_id
    AND e.status <> 'Draft'
    AND (e.publish_at IS NULL OR e.publish_at <= now())
));

CREATE OR REPLACE FUNCTION public.admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  SELECT jsonb_build_object(
    'totalRevenue', COALESCE((SELECT SUM(total) FROM ticket_orders WHERE status = 'Paid'), 0),
    'totalSales', COALESCE((SELECT COUNT(*) FROM ticket_orders WHERE status = 'Paid'), 0),
    'ticketsSold', COALESCE((SELECT SUM(quantity) FROM ticket_orders WHERE status = 'Paid'), 0),
    'refunded', COALESCE((SELECT SUM(total) FROM ticket_orders WHERE status = 'Refunded'), 0),
    'pendingPayments', COALESCE((SELECT SUM(total) FROM ticket_orders WHERE status = 'Pending'), 0),
    'activeEvents', COALESCE((SELECT COUNT(*) FROM events WHERE status <> 'Draft' AND (publish_at IS NULL OR publish_at <= now())), 0),
    'scheduledEvents', COALESCE((SELECT COUNT(*) FROM events WHERE status = 'Draft' OR (publish_at IS NOT NULL AND publish_at > now())), 0),
    'registeredUsers', COALESCE((SELECT COUNT(*) FROM profiles), 0),
    'revenueSeries', COALESCE((
      SELECT jsonb_agg(row_to_json(s)) FROM (
        SELECT to_char(m.month, 'Mon') AS month,
               COALESCE(SUM(o.total) FILTER (WHERE o.status = 'Paid'), 0)::numeric AS revenue,
               COALESCE(SUM(o.quantity) FILTER (WHERE o.status = 'Paid'), 0)::int AS tickets
        FROM generate_series(date_trunc('month', now()) - interval '7 months', date_trunc('month', now()), interval '1 month') AS m(month)
        LEFT JOIN ticket_orders o ON date_trunc('month', o.created_at) = m.month
        GROUP BY m.month
        ORDER BY m.month
      ) s
    ), '[]'::jsonb),
    'topEvents', COALESCE((
      SELECT jsonb_agg(row_to_json(t)) FROM (
        SELECT e.name,
               e.capacity,
               COALESCE(SUM(o.quantity) FILTER (WHERE o.status = 'Paid'), 0)::int AS sold,
               COALESCE(SUM(o.total) FILTER (WHERE o.status = 'Paid'), 0)::numeric AS revenue
        FROM events e
        LEFT JOIN ticket_orders o ON o.event_id = e.id
        GROUP BY e.id, e.name, e.capacity
        ORDER BY revenue DESC, sold DESC
        LIMIT 5
      ) t
    ), '[]'::jsonb),
    'activity', COALESCE((
      SELECT jsonb_agg(row_to_json(a)) FROM (
        SELECT o.buyer_name AS who,
               o.quantity,
               o.event_name,
               o.status,
               o.total,
               o.created_at
        FROM ticket_orders o
        ORDER BY o.created_at DESC
        LIMIT 8
      ) a
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_dashboard_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats() TO authenticated;