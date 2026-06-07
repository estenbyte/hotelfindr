import { prisma } from "./db.server";
import { nightsBetween } from "./format";
import { BUDGET_TIERS } from "./budget";

export { BUDGET_TIERS };

export type SearchParams = {
  city: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  maxPrice: number | null; // budget ceiling in paisa (per night), null = any
};

export type ParsedSearch =
  | { ok: true; value: SearchParams }
  | { ok: false; error: string };

/** Validate raw query values into a usable search, or return an error message. */
export function parseSearch(raw: {
  city?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  guests?: string | null;
  maxPrice?: string | null;
}): ParsedSearch {
  const city = (raw.city ?? "").trim();
  const checkIn = (raw.checkIn ?? "").trim();
  const checkOut = (raw.checkOut ?? "").trim();
  const guests = Number.parseInt(raw.guests ?? "1", 10) || 1;
  const parsedMax = Number.parseInt(raw.maxPrice ?? "", 10);
  const maxPrice = Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : null;

  if (!checkIn || !checkOut) {
    return { ok: false, error: "Pick check-in and check-out dates." };
  }
  if (nightsBetween(checkIn, checkOut) < 1) {
    return { ok: false, error: "Check-out must be after check-in." };
  }
  if (guests < 1) {
    return { ok: false, error: "At least one guest is required." };
  }
  return { ok: true, value: { city, checkIn, checkOut, guests, maxPrice } };
}

/**
 * Count confirmed bookings for a room type that overlap [checkIn, checkOut).
 * Overlap: existing.checkIn < requestedCheckOut AND existing.checkOut > requestedCheckIn.
 * Each booking occupies one unit, so booked units = overlap count.
 */
async function bookedUnits(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<number> {
  return prisma.booking.count({
    where: {
      roomTypeId,
      status: "confirmed",
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  });
}

export type AvailableRoom = {
  id: string;
  name: string;
  capacity: number;
  pricePerNight: number;
  available: number;
};

/** Room types for a hotel with units available for the given date range. */
export async function getHotelAvailability(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  guests = 1,
): Promise<AvailableRoom[]> {
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  const roomTypes = await prisma.roomType.findMany({
    where: { hotelId, capacity: { gte: guests } },
    orderBy: { pricePerNight: "asc" },
  });

  const rooms = await Promise.all(
    roomTypes.map(async (rt) => ({
      id: rt.id,
      name: rt.name,
      capacity: rt.capacity,
      pricePerNight: rt.pricePerNight,
      available: rt.quantity - (await bookedUnits(rt.id, ci, co)),
    })),
  );
  return rooms;
}

export type HotelSearchResult = {
  id: string;
  name: string;
  city: string;
  description: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  fromPrice: number | null; // cheapest available room, or null if none
  availableRooms: number; // total available units across room types
};

/** Hotels matching city (substring) with availability + budget filter, cheapest first. */
export async function searchHotels(
  params: SearchParams,
): Promise<HotelSearchResult[]> {
  const { city, checkIn, checkOut, guests, maxPrice } = params;
  const hotels = await prisma.hotel.findMany({
    where: city ? { city: { contains: city } } : undefined,
  });

  const results = await Promise.all(
    hotels.map(async (h) => {
      const rooms = await getHotelAvailability(h.id, checkIn, checkOut, guests);
      let bookable = rooms.filter((r) => r.available > 0);
      // Budget ceiling: only rooms within the nightly cap count.
      if (maxPrice != null) {
        bookable = bookable.filter((r) => r.pricePerNight <= maxPrice);
      }
      const fromPrice = bookable.length
        ? Math.min(...bookable.map((r) => r.pricePerNight))
        : null;
      return {
        id: h.id,
        name: h.name,
        city: h.city,
        description: h.description,
        imageUrl: h.imageUrl,
        rating: h.rating,
        reviewCount: h.reviewCount,
        fromPrice,
        availableRooms: bookable.reduce((sum, r) => sum + r.available, 0),
      };
    }),
  );

  // Only hotels with an available (and in-budget) room — cheapest first.
  return results
    .filter((r) => r.availableRooms > 0 && r.fromPrice != null)
    .sort((a, b) => (a.fromPrice ?? 0) - (b.fromPrice ?? 0));
}
