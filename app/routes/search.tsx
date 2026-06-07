import { Link } from "react-router";
import type { Route } from "./+types/search";
import { SiteHeader } from "../components/SiteHeader";
import { SearchForm } from "../components/SearchForm";
import { Stars } from "../components/Stars";
import { parseSearch, searchHotels } from "../lib/availability.server";
import { addDays, formatPrice, nightsBetween, todayISO } from "../lib/format";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Search results — hotelfindr" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams;
  // Default to today → tomorrow so "Browse hotels" works without dates.
  const parsed = parseSearch({
    city: q.get("city"),
    checkIn: q.get("checkIn") ?? todayISO(),
    checkOut: q.get("checkOut") ?? addDays(todayISO(), 1),
    guests: q.get("guests"),
    maxPrice: q.get("maxPrice"),
  });

  if (!parsed.ok) {
    return { error: parsed.error, search: null, hotels: [] };
  }
  const hotels = await searchHotels(parsed.value);
  return { error: null, search: parsed.value, hotels };
}

export default function Search({ loaderData }: Route.ComponentProps) {
  const { error, search, hotels } = loaderData;
  const nights = search ? nightsBetween(search.checkIn, search.checkOut) : 0;
  const detailQuery = search
    ? `?checkIn=${search.checkIn}&checkOut=${search.checkOut}&guests=${search.guests}`
    : "";

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        <div className="mb-8">
          <SearchForm defaults={search ?? undefined} />
        </div>

        {error && (
          <p className="rounded-2xl border border-amber-accent/30 bg-amber-accent/10 p-4 text-sm font-medium text-ink-700">
            {error}
          </p>
        )}

        {search && (
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-1">
            <h1 className="font-display text-2xl font-bold text-ink-900">
              {hotels.length} stay{hotels.length === 1 ? "" : "s"}
              {search.city ? ` in ${search.city}` : ""}
              <span className="ml-2 text-sm font-medium text-brand-700">
                · cheapest first
              </span>
            </h1>
            <p className="text-sm text-ink-400">
              {search.checkIn} → {search.checkOut} · {nights}n · {search.guests}{" "}
              guest{search.guests === 1 ? "" : "s"}
            </p>
          </div>
        )}

        {search && hotels.length === 0 && (
          <div className="card p-10 text-center">
            <p className="font-display text-lg font-bold text-ink-900">
              No rooms for these dates
            </p>
            <p className="mt-1 text-sm text-ink-500">
              Try different dates or another destination.
            </p>
          </div>
        )}

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((h, i) => (
            <li key={h.id}>
              <Link
                to={`/hotels/${h.id}${detailQuery}`}
                className="card group block overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(20,29,29,0.35)]"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={h.imageUrl}
                    alt={h.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-700 backdrop-blur">
                    {h.city}
                  </span>
                  {i === 0 ? (
                    <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">
                      Best value
                    </span>
                  ) : (
                    h.availableRooms <= 3 && (
                      <span className="absolute right-3 top-3 rounded-full bg-amber-accent px-2.5 py-1 text-xs font-semibold text-white">
                        Only {h.availableRooms} left
                      </span>
                    )
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-lg font-bold text-ink-900">
                      {h.name}
                    </h2>
                  </div>
                  {h.reviewCount > 0 ? (
                    <div className="mt-1">
                      <Stars rating={h.rating} reviewCount={h.reviewCount} />
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-ink-400">No reviews yet</p>
                  )}
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">
                    {h.description}
                  </p>
                  <div className="mt-4 flex items-end justify-between border-t border-sand-100 pt-4">
                    {h.fromPrice != null ? (
                      <p className="text-sm text-ink-400">
                        from{" "}
                        <span className="font-display tabular text-xl font-bold text-ink-900">
                          {formatPrice(h.fromPrice)}
                        </span>
                        <span className="text-ink-400"> /night</span>
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                      View
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4 transition group-hover:translate-x-0.5"
                        stroke="currentColor"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
