import { Link } from "react-router";
import type { Route } from "./+types/hotel";
import { SiteHeader } from "../components/SiteHeader";
import { RoomPicker } from "../components/RoomPicker";
import { Stars } from "../components/Stars";
import { AmenityGrid } from "../components/Amenities";
import { prisma } from "../lib/db.server";
import { getHotelAvailability, parseSearch } from "../lib/availability.server";
import { nightsBetween } from "../lib/format";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? `${data.hotel.name} — hotelfindr` : "Hotel" }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const hotel = await prisma.hotel.findUnique({
    where: { id: params.hotelId },
    include: { reviews: { orderBy: { createdAt: "desc" }, take: 6 } },
  });
  if (!hotel) throw new Response("Hotel not found", { status: 404 });

  const url = new URL(request.url);
  const q = url.searchParams;
  const parsed = parseSearch({
    city: hotel.city,
    checkIn: q.get("checkIn"),
    checkOut: q.get("checkOut"),
    guests: q.get("guests"),
  });

  if (!parsed.ok) {
    return { hotel, search: null, rooms: [], error: parsed.error };
  }
  const rooms = await getHotelAvailability(
    hotel.id,
    parsed.value.checkIn,
    parsed.value.checkOut,
    parsed.value.guests,
  );
  return { hotel, search: parsed.value, rooms, error: null };
}

export default function Hotel({ loaderData }: Route.ComponentProps) {
  const { hotel, search, rooms, error } = loaderData;
  const nights = search ? nightsBetween(search.checkIn, search.checkOut) : 0;
  const backQuery = search
    ? `?city=${encodeURIComponent(hotel.city)}&checkIn=${search.checkIn}&checkOut=${search.checkOut}&guests=${search.guests}`
    : "";

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8">
        <Link
          to={`/search${backQuery}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-ink-900"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5m6 6-6-6 6-6" />
          </svg>
          Back to search
        </Link>

        <div className="mt-4 overflow-hidden rounded-3xl">
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            className="h-72 w-full object-cover sm:h-96"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {hotel.city}
            </span>
            <h1 className="font-display mt-3 text-4xl font-extrabold text-ink-900">
              {hotel.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {hotel.reviewCount > 0 ? (
                <Stars
                  rating={hotel.rating}
                  reviewCount={hotel.reviewCount}
                  size="md"
                />
              ) : (
                <span className="text-sm text-ink-400">No reviews yet</span>
              )}
              <span className="text-ink-300">·</span>
              <span className="text-sm text-ink-400">{hotel.address}</span>
            </div>
          </div>
        </div>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-600">
          {hotel.description}
        </p>

        {/* Amenities */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold text-ink-900">
            What this place offers
          </h2>
          <div className="mt-5 card p-6">
            <AmenityGrid csv={hotel.amenities} />
          </div>
        </section>

        <div className="mt-10 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold text-ink-900">
            Choose a room
          </h2>
          {search && (
            <p className="text-sm text-ink-400">
              {search.checkIn} → {search.checkOut} · {nights}n · {search.guests}{" "}
              guest{search.guests === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-2xl border border-amber-accent/30 bg-amber-accent/10 p-4 text-sm font-medium text-ink-700">
            {error} — go back and pick your dates.
          </p>
        )}

        {search && (
          <RoomPicker
            rooms={rooms}
            search={search}
            hotelId={hotel.id}
            nights={nights}
          />
        )}

        {/* Reviews */}
        <section className="mt-12">
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-2xl font-bold text-ink-900">
              Guest reviews
            </h2>
            {hotel.reviewCount > 0 && (
              <Stars rating={hotel.rating} reviewCount={hotel.reviewCount} />
            )}
          </div>
          {hotel.reviews.length === 0 ? (
            <p className="mt-3 text-ink-500">
              No reviews yet — be the first after your stay.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {hotel.reviews.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 font-display text-sm font-bold text-brand-700">
                        {r.author.charAt(0)}
                      </span>
                      <span className="font-medium text-ink-900">
                        {r.author}
                      </span>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
