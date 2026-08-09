import ev1 from "@/assets/event-1.jpg";
import ev2 from "@/assets/event-2.jpg";
import ev3 from "@/assets/event-3.jpg";
import ev4 from "@/assets/event-4.jpg";
import ev5 from "@/assets/event-5.jpg";
import ev6 from "@/assets/event-6.jpg";

export type EventItem = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  date: string;
  time: string;
  doors: string;
  city: string;
  venue: string;
  address: string;
  price: number;
  currency: string;
  image: string;
  genre: string;
  lineup: string[];
  capacity: number;
  sold: number;
  status: "On sale" | "Almost gone" | "Sold out" | "Draft";
  featured?: boolean;
};

export const events: EventItem[] = [
  {
    id: "midnight-frequency",
    name: "Midnight Frequency",
    tagline: "Six hours of low-end therapy",
    description:
      "A single room, a wall of subs and a lineup that refuses to blink. Midnight Frequency is AFTRS' flagship residency — no phones on the floor, no filler sets.",
    date: "2026-09-12",
    time: "23:00",
    doors: "22:30",
    city: "Kuala Lumpur",
    venue: "The Vault KL",
    address: "18 Jalan Sultan Ismail, Bukit Bintang",
    price: 89,
    currency: "$",
    image: ev1,
    genre: "Techno",
    lineup: ["AMELIE LENS", "KØDE", "Nari Sun", "Vex b2b Halo"],
    capacity: 1800,
    sold: 1544,
    status: "Almost gone",
    featured: true,
  },
  {
    id: "skyline-sessions",
    name: "Skyline Sessions",
    tagline: "Open-air house, 47 floors up",
    description:
      "Sunset to sunrise on a rooftop that overlooks the whole grid. Deep house, cold cocktails and a horizon that does half the work.",
    date: "2026-09-27",
    time: "18:00",
    doors: "17:30",
    city: "Singapore",
    venue: "Aurora Rooftop",
    address: "1 Marina Boulevard, Level 47",
    price: 120,
    currency: "$",
    image: ev2,
    genre: "Deep House",
    lineup: ["Jayda G", "Mall Grab", "Sotto Voce"],
    capacity: 900,
    sold: 610,
    status: "On sale",
    featured: true,
  },
  {
    id: "red-room",
    name: "Red Room",
    tagline: "Invitation only. Bring nothing.",
    description:
      "Concrete, red light and 140bpm. Our smallest room and the hardest ticket in the city — 300 people, one bar, zero photographs.",
    date: "2026-10-04",
    time: "23:30",
    doors: "23:00",
    city: "Bangkok",
    venue: "Sub Basement 9",
    address: "9 Soi Sukhumvit 11",
    price: 65,
    currency: "$",
    image: ev3,
    genre: "Hard Techno",
    lineup: ["I Hate Models", "Ceza", "NOIR"],
    capacity: 300,
    sold: 300,
    status: "Sold out",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    tagline: "Beach stage, disco, no shoes",
    description:
      "A slow-burning beach party that starts in daylight and ends barefoot. Disco edits, live percussion and a sound system in the sand.",
    date: "2026-10-18",
    time: "16:00",
    doors: "15:30",
    city: "Bali",
    venue: "Pantai Selatan",
    address: "Jl. Pantai Berawa, Canggu",
    price: 95,
    currency: "$",
    image: ev4,
    genre: "Disco",
    lineup: ["Horse Meat Disco", "Sofia Kourtesis", "Bamboo Sound"],
    capacity: 2400,
    sold: 1180,
    status: "On sale",
    featured: true,
  },
  {
    id: "velvet-lounge",
    name: "Velvet Lounge",
    tagline: "Slow drinks, slower tempos",
    description:
      "An intimate listening room with a valve system, a 300-record library and a bar that takes cocktails far too seriously.",
    date: "2026-11-01",
    time: "20:00",
    doors: "19:30",
    city: "Hong Kong",
    venue: "Salon Noir",
    address: "22 Hollywood Road, Central",
    price: 150,
    currency: "$",
    image: ev5,
    genre: "Jazz / Downtempo",
    lineup: ["Yussef Dayes", "Kaidi Tatham", "Resident: Mira"],
    capacity: 220,
    sold: 198,
    status: "Almost gone",
  },
  {
    id: "afterlight-arena",
    name: "Afterlight Arena",
    tagline: "The season finale",
    description:
      "Twelve thousand people, a 40-metre laser rig and the biggest closing set we've ever booked. This is where the season ends.",
    date: "2026-12-13",
    time: "20:00",
    doors: "19:00",
    city: "Kuala Lumpur",
    venue: "Axiata Arena",
    address: "Jalan Barat, Bukit Jalil",
    price: 180,
    currency: "$",
    image: ev6,
    genre: "Electronic",
    lineup: ["Eric Prydz", "Charlotte de Witte", "ANYMA", "Peggy Gou"],
    capacity: 12000,
    sold: 8420,
    status: "On sale",
    featured: true,
  },
];

export const getEvent = (id: string) => events.find((e) => e.id === id);

export const schedule = [
  { time: "22:30", title: "Doors & welcome bar", detail: "Ground floor, entrance on Jalan Sultan" },
  { time: "23:00", title: "Nari Sun", detail: "Opening set — main room" },
  { time: "00:15", title: "Vex b2b Halo", detail: "Back to back, 90 minutes" },
  { time: "01:45", title: "KØDE", detail: "Live hardware set" },
  { time: "03:00", title: "AMELIE LENS", detail: "Headline — closing" },
  { time: "05:00", title: "Last call", detail: "Cloakroom open until 05:30" },
];

export type TicketTier = {
  name: string;
  price: number;
  perks: string[];
  left: number;
  highlight?: boolean;
};

export const tiers: TicketTier[] = [
  {
    name: "General",
    price: 89,
    perks: ["Standard entry from 23:00", "Main room access", "Digital wallet ticket"],
    left: 42,
  },
  {
    name: "Priority",
    price: 139,
    perks: ["Skip-the-line entry", "Mezzanine access", "Welcome drink", "Cloakroom included"],
    left: 18,
    highlight: true,
  },
  {
    name: "Table / 6 pax",
    price: 890,
    perks: ["Reserved booth", "Two bottles", "Dedicated host", "Private entrance"],
    left: 4,
  },
];

export type MyTicket = {
  id: string;
  code: string;
  eventId: string;
  tier: string;
  qty: number;
  seat: string;
  state: "Valid" | "Used" | "Refunded";
};

export const myTickets: MyTicket[] = [
  {
    id: "t1",
    code: "AFTRS-9K2M-71QD",
    eventId: "midnight-frequency",
    tier: "Priority",
    qty: 2,
    seat: "GA · Mezzanine",
    state: "Valid",
  },
  {
    id: "t2",
    code: "AFTRS-4TZ8-02LP",
    eventId: "skyline-sessions",
    tier: "General",
    qty: 1,
    seat: "GA · Rooftop",
    state: "Valid",
  },
  {
    id: "t3",
    code: "AFTRS-1XW5-88BC",
    eventId: "golden-hour",
    tier: "Table / 6 pax",
    qty: 6,
    seat: "Booth 12",
    state: "Valid",
  },
  {
    id: "t4",
    code: "AFTRS-7HN3-45RE",
    eventId: "red-room",
    tier: "General",
    qty: 2,
    seat: "GA",
    state: "Used",
  },
];

export type Purchase = {
  id: string;
  date: string;
  event: string;
  method: string;
  amount: number;
  status: "Paid" | "Pending" | "Refunded" | "Failed";
};

export const purchases: Purchase[] = [
  { id: "TRX-100482", date: "2026-08-02", event: "Midnight Frequency", method: "Visa ·· 4412", amount: 278, status: "Paid" },
  { id: "TRX-100455", date: "2026-07-28", event: "Skyline Sessions", method: "Apple Pay", amount: 120, status: "Paid" },
  { id: "TRX-100431", date: "2026-07-19", event: "Golden Hour", method: "Mastercard ·· 8890", amount: 890, status: "Pending" },
  { id: "TRX-100388", date: "2026-06-30", event: "Red Room", method: "Visa ·· 4412", amount: 130, status: "Refunded" },
  { id: "TRX-100341", date: "2026-06-11", event: "Velvet Lounge", method: "PayPal", amount: 300, status: "Paid" },
  { id: "TRX-100302", date: "2026-05-24", event: "Afterlight Arena", method: "Visa ·· 4412", amount: 360, status: "Failed" },
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
  { id: "U-8812", name: "Amara Devi", email: "amara.d@mail.com", city: "Kuala Lumpur", tier: "Founding", orders: 24, spend: 4820, joined: "2024-02-11", status: "Active" },
  { id: "U-8790", name: "Théo Marchand", email: "theo.m@mail.com", city: "Singapore", tier: "Priority", orders: 12, spend: 2140, joined: "2024-06-02", status: "Active" },
  { id: "U-8744", name: "Ren Takahashi", email: "ren.t@mail.com", city: "Bangkok", tier: "Member", orders: 4, spend: 460, joined: "2025-01-19", status: "Invited" },
  { id: "U-8701", name: "Sofia Ibrahim", email: "sofia.i@mail.com", city: "Bali", tier: "Priority", orders: 9, spend: 1610, joined: "2025-03-08", status: "Active" },
  { id: "U-8666", name: "Marcus Well", email: "m.well@mail.com", city: "Hong Kong", tier: "Member", orders: 2, spend: 180, joined: "2025-09-21", status: "Suspended" },
  { id: "U-8620", name: "Priya Nathan", email: "priya.n@mail.com", city: "Kuala Lumpur", tier: "Founding", orders: 31, spend: 6120, joined: "2023-11-04", status: "Active" },
  { id: "U-8598", name: "Chen Yu Xin", email: "yuxin@mail.com", city: "Singapore", tier: "Member", orders: 6, spend: 720, joined: "2025-12-15", status: "Active" },
];

export type AdminTicket = {
  id: string;
  buyer: string;
  event: string;
  tier: string;
  qty: number;
  amount: number;
  status: "Paid" | "Pending" | "Refunded" | "Failed";
  date: string;
  channel: string;
};

export const adminTickets: AdminTicket[] = [
  { id: "TK-55021", buyer: "Amara Devi", event: "Midnight Frequency", tier: "Priority", qty: 2, amount: 278, status: "Paid", date: "2026-08-02", channel: "Web" },
  { id: "TK-55018", buyer: "Théo Marchand", event: "Skyline Sessions", tier: "General", qty: 1, amount: 120, status: "Paid", date: "2026-08-02", channel: "iOS" },
  { id: "TK-55014", buyer: "Sofia Ibrahim", event: "Golden Hour", tier: "Table / 6 pax", qty: 6, amount: 890, status: "Pending", date: "2026-08-01", channel: "Web" },
  { id: "TK-55009", buyer: "Ren Takahashi", event: "Red Room", tier: "General", qty: 2, amount: 130, status: "Refunded", date: "2026-07-31", channel: "Box office" },
  { id: "TK-55001", buyer: "Priya Nathan", event: "Afterlight Arena", tier: "Priority", qty: 4, amount: 720, status: "Paid", date: "2026-07-30", channel: "Web" },
  { id: "TK-54987", buyer: "Marcus Well", event: "Velvet Lounge", tier: "General", qty: 2, amount: 300, status: "Failed", date: "2026-07-29", channel: "Android" },
  { id: "TK-54970", buyer: "Chen Yu Xin", event: "Midnight Frequency", tier: "General", qty: 3, amount: 267, status: "Paid", date: "2026-07-28", channel: "Web" },
];

export const revenueSeries = [
  { month: "Jan", revenue: 82000, tickets: 1120 },
  { month: "Feb", revenue: 96000, tickets: 1290 },
  { month: "Mar", revenue: 78000, tickets: 990 },
  { month: "Apr", revenue: 134000, tickets: 1740 },
  { month: "May", revenue: 158000, tickets: 2050 },
  { month: "Jun", revenue: 141000, tickets: 1810 },
  { month: "Jul", revenue: 196000, tickets: 2480 },
  { month: "Aug", revenue: 224000, tickets: 2890 },
];

export const channelSplit = [
  { name: "Web", value: 54 },
  { name: "iOS", value: 26 },
  { name: "Android", value: 13 },
  { name: "Box office", value: 7 },
];

export const topEvents = [
  { name: "Afterlight Arena", sold: 8420, capacity: 12000, revenue: 1515600 },
  { name: "Golden Hour", sold: 1180, capacity: 2400, revenue: 112100 },
  { name: "Midnight Frequency", sold: 1544, capacity: 1800, revenue: 137416 },
  { name: "Skyline Sessions", sold: 610, capacity: 900, revenue: 73200 },
  { name: "Velvet Lounge", sold: 198, capacity: 220, revenue: 29700 },
];

export const activityFeed = [
  { who: "Priya Nathan", what: "bought 4 Priority tickets", when: "2 min ago", tone: "success" as const },
  { who: "Sofia Ibrahim", what: "payment pending for Booth 12", when: "18 min ago", tone: "warn" as const },
  { who: "Ops", what: "published Afterlight Arena", when: "1 hr ago", tone: "info" as const },
  { who: "Marcus Well", what: "payment failed · Velvet Lounge", when: "3 hrs ago", tone: "danger" as const },
  { who: "Ren Takahashi", what: "requested a refund", when: "5 hrs ago", tone: "warn" as const },
  { who: "Ops", what: "raised Red Room capacity to 300", when: "Yesterday", tone: "info" as const },
];

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

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
  { id: "P-02", code: "SKYLINE15", promoter: "Aurora Rooftop", event: "Skyline Sessions", type: "fixed", value: 15, used: 64, limit: 200, expires: "2026-09-25", active: true },
  { id: "P-03", code: "REDLIST", promoter: "Sub Basement 9", event: "Red Room", type: "percent", value: 100, used: 40, limit: 40, expires: "2026-10-03", active: false },
  { id: "P-04", code: "SANDDISCO", promoter: "Bamboo Sound", event: "Golden Hour", type: "fixed", value: 25, used: 212, limit: 500, expires: "2026-10-16", active: true },
  { id: "P-05", code: "FINALE10", promoter: "AFTRS Crew", event: "Afterlight Arena", type: "percent", value: 10, used: 1340, limit: 3000, expires: "2026-12-12", active: true },
];

export const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit" });

export const formatMonth = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { month: "short" }).toUpperCase();

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });