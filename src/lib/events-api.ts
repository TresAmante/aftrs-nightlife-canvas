import { supabase } from "@/integrations/supabase/client";

export type DbEvent = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  event_date: string;
  start_time: string | null;
  doors_time: string | null;
  city: string;
  venue: string | null;
  address: string | null;
  genre: string | null;
  lineup: string[];
  image_url: string | null;
  capacity: number;
  sold: number;
  price: number;
  status: string;
  featured: boolean;
  publish_at: string | null;
};

export type DbTier = {
  id: string;
  event_id: string;
  name: string;
  price: number;
  sort_order: number;
};

export type EventWithTiers = DbEvent & { tiers: DbTier[]; imageSrc: string | null };

export type Visibility = "public" | "private" | "scheduled";

export function visibilityOf(e: Pick<DbEvent, "status" | "publish_at">): Visibility {
  if (e.status === "Draft") return "private";
  if (e.publish_at && new Date(e.publish_at).getTime() > Date.now()) return "scheduled";
  return "public";
}

const BUCKET = "event-images";

export async function signedImageUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
  return data?.signedUrl ?? null;
}

export async function listEvents(): Promise<EventWithTiers[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_tiers(id, event_id, name, price, sort_order)")
    .order("event_date", { ascending: true });
  if (error) throw error;

  const rows = (data ?? []) as unknown as (DbEvent & { ticket_tiers: DbTier[] })[];
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      price: Number(row.price),
      tiers: [...(row.ticket_tiers ?? [])]
        .map((t) => ({ ...t, price: Number(t.price) }))
        .sort((a, b) => a.sort_order - b.sort_order),
      imageSrc: await signedImageUrl(row.image_url),
    })),
  );
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "event"
  );
}

export async function uploadEventImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}

export type NewEventInput = {
  name: string;
  tagline?: string;
  description?: string;
  event_date: string;
  start_time?: string;
  city: string;
  venue?: string;
  genre?: string;
  capacity: number;
  status: string;
  publish_at?: string | null;
  imageFile?: File | null;
  tiers: { name: string; price: number }[];
};

export async function createEvent(input: NewEventInput): Promise<string> {
  const image_url = input.imageFile ? await uploadEventImage(input.imageFile) : null;
  const prices = input.tiers.map((t) => t.price).filter((p) => p > 0);
  const basePrice = prices.length ? Math.min(...prices) : 0;

  const { data, error } = await supabase
    .from("events")
    .insert({
      slug: `${slugify(input.name)}-${Math.random().toString(36).slice(2, 6)}`,
      name: input.name,
      tagline: input.tagline ?? null,
      description: input.description ?? null,
      event_date: input.event_date,
      start_time: input.start_time ?? null,
      city: input.city,
      venue: input.venue ?? null,
      genre: input.genre ?? null,
      capacity: input.capacity,
      price: basePrice,
      status: input.status,
      publish_at: input.publish_at ?? null,
      image_url,
    })
    .select("id")
    .single();
  if (error) throw error;

  const eventId = (data as { id: string }).id;
  if (input.tiers.length) {
    const { error: tierError } = await supabase.from("ticket_tiers").insert(
      input.tiers.map((t, i) => ({ event_id: eventId, name: t.name, price: t.price, sort_order: i })),
    );
    if (tierError) throw tierError;
  }
  return eventId;
}

export async function listPublicEvents(): Promise<EventWithTiers[]> {
  const all = await listEvents();
  const now = Date.now();
  return all.filter(
    (e) => e.status !== "Draft" && (!e.publish_at || new Date(e.publish_at).getTime() <= now),
  );
}

export async function getPublicEvent(slug: string): Promise<EventWithTiers | null> {
  const all = await listPublicEvents();
  return all.find((e) => e.slug === slug || e.id === slug) ?? null;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function setEventVisibility(
  id: string,
  visibility: Visibility,
  publishAt?: string | null,
) {
  const patch =
    visibility === "private"
      ? { status: "Draft", publish_at: null }
      : visibility === "scheduled"
        ? { status: "On sale", publish_at: publishAt ?? null }
        : { status: "On sale", publish_at: null };
  const { error } = await supabase.from("events").update(patch).eq("id", id);
  if (error) throw error;
}
