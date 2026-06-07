import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

// Verified-loading Unsplash hotel/travel photos.
const IMAGES = [
  "1566073771259-6a8506099945",
  "1551882547-ff40c63fe5fa",
  "1542314831-068cd1dbfeeb",
  "1582719478250-c89cae4dc85b",
  "1564501049412-61c2a3083791",
  "1571896349842-33c89424de2d",
  "1520250497591-112f2f40a3f4",
  "1611892440504-42a792e24d32",
  "1455587734955-081b22074882",
  "1611048267451-e6ed903d4a38",
  "1445019980597-93fa8acb246c",
  "1578683010236-d716f9a3f461",
  "1631049307264-da0ec9d70304",
  "1590490360182-c33d57733427",
  "1596394516093-501ba68a0ba6",
].map((id) => `https://images.unsplash.com/photo-${id}?w=800`);

// city → [price tier multiplier, area names, descriptor]
const CITIES: { city: string; tier: number; areas: string[]; vibe: string }[] = [
  { city: "Cox's Bazar", tier: 1.0, areas: ["Kolatoli", "Marine Drive", "Laboni Beach", "Sugandha Point"], vibe: "steps from the world's longest beach" },
  { city: "Dhaka", tier: 1.4, areas: ["Gulshan", "Banani", "Dhanmondi", "Uttara", "Motijheel"], vibe: "in the heart of the capital" },
  { city: "Sylhet", tier: 0.9, areas: ["Zindabazar", "Airport Road", "Ambarkhana"], vibe: "surrounded by rolling tea gardens" },
  { city: "Chattogram", tier: 1.0, areas: ["Agrabad", "GEC Circle", "Khulshi"], vibe: "near the port and the hills" },
  { city: "Sreemangal", tier: 0.8, areas: ["Tea Resort Road", "Lawachara"], vibe: "deep in tea country" },
  { city: "Bandarban", tier: 0.85, areas: ["Nilgiri", "Meghla", "Chimbuk Road"], vibe: "high in the hill tracts" },
  { city: "Rangamati", tier: 0.85, areas: ["Kaptai Lake", "Tabalchhari"], vibe: "beside Kaptai Lake" },
  { city: "Kuakata", tier: 0.85, areas: ["Sea Beach Road", "Gangamati"], vibe: "where you see both sunrise and sunset" },
  { city: "Khulna", tier: 0.9, areas: ["KDA Avenue", "Sonadanga"], vibe: "gateway to the Sundarbans" },
  { city: "Rajshahi", tier: 0.8, areas: ["Shaheb Bazar", "Padma Riverside"], vibe: "along the calm Padma" },
  { city: "Bogura", tier: 0.75, areas: ["Satmatha", "Sherpur Road"], vibe: "in the historic north" },
  { city: "Saint Martin", tier: 1.1, areas: ["West Beach", "Coral Point"], vibe: "on the coral island" },
];

const NAME_A = ["Grand", "Royal", "Sea Pearl", "Green Valley", "Hill View", "Bay", "Riverside", "Golden", "Pinewood", "Blue Lagoon", "The Imperial", "Sunset", "Emerald", "Lakeside", "Heritage", "Pearl", "Orchid", "Crystal"];
const NAME_B = ["Resort", "Hotel", "Inn", "Suites", "Residency", "Palace", "Lodge", "Retreat", "Grand", "Boutique", "Plaza", "Tower"];

// Budget-friendly bases (paisa/night). Most inventory sits under ৳3,500.
const ROOMS = [
  { name: "Budget Single", capacity: 1, base: 80000 },
  { name: "Standard Double", capacity: 2, base: 120000 },
  { name: "Twin Room", capacity: 2, base: 150000 },
  { name: "Deluxe Double", capacity: 2, base: 220000 },
  { name: "Family Room", capacity: 4, base: 300000 },
  { name: "Executive King", capacity: 2, base: 350000 },
  { name: "Junior Suite", capacity: 3, base: 500000 },
  { name: "Premium Suite", capacity: 3, base: 750000 },
  { name: "Beachfront Villa", capacity: 5, base: 1200000 },
];

const REVIEW_AUTHORS = [
  "Tanvir Ahmed", "Nusrat Jahan", "Rakib Hasan", "Sadia Islam", "Mahmudul Karim",
  "Farhana Akter", "Imran Hossain", "Sumaiya Rahman", "Arif Chowdhury", "Mitu Das",
  "Shahriar Kabir", "Naimur Rahman", "Tahmina Begum", "Jubair Alam", "Priya Roy",
];
const REVIEW_TEXTS = [
  "Great value for the price. Clean room and friendly staff.",
  "Budget-friendly and exactly what we needed for a short trip.",
  "Affordable, comfortable, and close to everything. Would book again.",
  "Rooms were tidy and the price was unbeatable.",
  "Good location, helpful reception, and very reasonable rates.",
  "Decent stay for the money. AC worked well, water was hot.",
  "Loved how cheap yet clean it was. Perfect for backpackers.",
  "Simple but spotless. You get more than you pay for here.",
  "Pleasant stay, quiet at night, and gentle on the wallet.",
  "Solid budget option. Breakfast was a nice surprise.",
  "Nothing fancy but excellent value and a warm welcome.",
  "Comfortable beds and a fair price — can't complain.",
];

// Deterministic-ish PRNG so reseeds vary but stay reasonable.
let s = 987654321;
function rnd() {
  s = (1103515245 * s + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}
function range(min: number, max: number): number {
  return min + Math.floor(rnd() * (max - min + 1));
}

async function main() {
  await prisma.booking.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: { email: "admin@hotelfindr.test", passwordHash, role: "admin" },
  });

  const TOTAL = 100;
  const used = new Set<string>();
  let imgIdx = 0;

  for (let i = 0; i < TOTAL; i++) {
    const c = CITIES[i % CITIES.length];

    // unique-ish hotel name
    let name = "";
    do {
      name = `${pick(NAME_A)} ${pick(NAME_B)}`;
    } while (used.has(`${name}-${c.city}`));
    used.add(`${name}-${c.city}`);

    const area = pick(c.areas);

    // 2–4 distinct room types per hotel
    const count = range(2, 4);
    const shuffled = [...ROOMS].sort(() => rnd() - 0.5).slice(0, count);
    const rooms = shuffled.map((r) => {
      // ±15% price jitter, scaled by city tier, rounded to 1000 paisa
      const jitter = 0.85 + rnd() * 0.3;
      const price = Math.round((r.base * c.tier * jitter) / 1000) * 1000;
      return {
        name: r.name,
        capacity: r.capacity,
        pricePerNight: price,
        quantity: range(2, 12),
      };
    });

    // Amenities: core set every hotel has + a random optional subset.
    const coastal = ["Cox's Bazar", "Kuakata", "Saint Martin"].includes(c.city);
    const core = ["wifi", "ac", "hot_water", "generator", "reception_24h", "cctv", "non_smoking"];
    const optional = [
      "parking", "breakfast", "restaurant", "room_service", "pool", "gym",
      "spa", "bar", "laundry", "airport_shuttle", "family_rooms", "elevator",
      "pet_friendly",
    ];
    const extras = [...optional]
      .sort(() => rnd() - 0.5)
      .slice(0, range(3, 8));
    if (coastal) extras.push("beach_access");
    const amenities = [...core, ...extras].join(",");

    // 0–9 reviews, ratings skewed toward 4–5 (good budget value).
    const reviewN = range(0, 9);
    const reviews = Array.from({ length: reviewN }, () => {
      const rating = pick([3, 4, 4, 4, 5, 5, 5]); // skew high
      return {
        author: pick(REVIEW_AUTHORS),
        rating,
        comment: pick(REVIEW_TEXTS),
      };
    });
    const ratingAvg = reviews.length
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10,
        ) / 10
      : 0;

    await prisma.hotel.create({
      data: {
        name,
        city: c.city,
        address: `${range(1, 120)} ${area}`,
        description: `A budget-friendly stay ${c.vibe}, with ${count} room types and friendly service.`,
        imageUrl: IMAGES[imgIdx++ % IMAGES.length],
        amenities,
        rating: ratingAvg,
        reviewCount: reviews.length,
        roomTypes: { create: rooms },
        reviews: { create: reviews },
      },
    });
  }

  const hotels = await prisma.hotel.count();
  const roomTypes = await prisma.roomType.count();
  const reviewCount = await prisma.review.count();
  console.log(
    `Seed done. ${hotels} hotels, ${roomTypes} room types, ${reviewCount} reviews across ${CITIES.length} cities.`,
  );
  console.log("Admin login: admin@hotelfindr.test / admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
