// Canonical amenity catalog (isomorphic). Hotels store a CSV of keys.
export type Amenity = { key: string; label: string; icon: string };

export const AMENITIES: Amenity[] = [
  { key: "wifi", label: "Free Wi-Fi", icon: "M5 12.5a10 10 0 0 1 14 0 M8.5 16a5 5 0 0 1 7 0 M12 19.5h.01" },
  { key: "ac", label: "Air conditioning", icon: "M3 8h18v5H3z M7 17v2 M12 17v3 M17 17v2" },
  { key: "hot_water", label: "Hot water", icon: "M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z" },
  { key: "generator", label: "Backup generator", icon: "M13 2 4 14h7l-1 8 9-12h-7l1-8z" },
  { key: "reception_24h", label: "24h reception", icon: "M12 7v5l3 2 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" },
  { key: "cctv", label: "CCTV security", icon: "M3 7l13-3 1 4-13 3z M4 11v6 M16 9l4 2-2 4-4-2 M9 20h6" },
  { key: "non_smoking", label: "Non-smoking rooms", icon: "M3 3l18 18 M4 14h12v3H7z M18 14h2v3h-2z" },
  { key: "parking", label: "Free parking", icon: "M7 20V4h6a4 4 0 0 1 0 8H7" },
  { key: "breakfast", label: "Breakfast included", icon: "M4 8h12v4a6 6 0 0 1-12 0z M16 8h3a2 2 0 0 1 0 6h-3 M4 20h14" },
  { key: "restaurant", label: "On-site restaurant", icon: "M5 3v18 M3 3v5a2 2 0 0 0 4 0V3 M16 3c-2 0-3 2-3 5s1 4 3 4v9" },
  { key: "room_service", label: "Room service", icon: "M4 17h16 M6 17a6 6 0 0 1 12 0 M12 6v2 M11 6h2" },
  { key: "pool", label: "Swimming pool", icon: "M3 18c2 1 4 1 6 0s4-1 6 0 4 1 6 0 M6 15V6a2 2 0 0 1 4 0 M14 15V6a2 2 0 0 1 4 0" },
  { key: "beach_access", label: "Beach access", icon: "M12 3a9 9 0 0 1 9 8H3a9 9 0 0 1 9-8z M12 11v10 M9 21h6" },
  { key: "gym", label: "Fitness centre", icon: "M6 7v10 M18 7v10 M3 9v6 M21 9v6 M6 12h12" },
  { key: "spa", label: "Spa", icon: "M12 21c-4-3-7-6-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4-3 7-7 10z" },
  { key: "bar", label: "Bar / lounge", icon: "M5 3h14l-7 9v7 M9 19h6 M5 3l7 9" },
  { key: "laundry", label: "Laundry", icon: "M5 3h14v18H5z M9 7h.01 M12 7h.01 M12 18a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z" },
  { key: "airport_shuttle", label: "Airport shuttle", icon: "M3 17V8a2 2 0 0 1 2-2h11l4 4v7 M3 12h18 M7 19a2 2 0 1 1-4 0 M21 19a2 2 0 1 1-4 0" },
  { key: "family_rooms", label: "Family rooms", icon: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M17 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M3 20v-1a5 5 0 0 1 10 0v1 M15 20v-1a4 4 0 0 1 6-3" },
  { key: "elevator", label: "Elevator", icon: "M5 3h14v18H5z M9 9l3-3 3 3 M9 15l3 3 3-3" },
  { key: "pet_friendly", label: "Pet friendly", icon: "M5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M10 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M15 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M19 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M12 12c-3 0-5 2.5-5 5a2 2 0 0 0 2 2c1 0 2-.5 3-.5s2 .5 3 .5a2 2 0 0 0 2-2c0-2.5-2-5-5-5z" },
];

const MAP = new Map(AMENITIES.map((a) => [a.key, a]));

/** Parse a stored CSV of amenity keys into ordered Amenity objects. */
export function parseAmenities(csv: string | null | undefined): Amenity[] {
  if (!csv) return [];
  return csv
    .split(",")
    .map((s) => s.trim())
    .map((k) => MAP.get(k))
    .filter((a): a is Amenity => Boolean(a));
}
