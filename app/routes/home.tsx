import { Link } from "react-router";
import type { Route } from "./+types/home";
import { SiteHeader } from "../components/SiteHeader";
import { SearchForm } from "../components/SearchForm";
import { todayISO, addDays } from "../lib/format";

export function meta({}: Route.MetaArgs) {
  const title = "hotelfindr — budget-friendly hotels in Bangladesh";
  const description =
    "Book budget-friendly hotels across Bangladesh. Real availability, lowest price first, card or bKash — confirmed in under a minute.";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "hotelfindr" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

const DESTINATIONS = [
  {
    city: "Cox's Bazar",
    note: "World's longest beach",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  },
  {
    city: "Dhaka",
    note: "The capital",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
  },
  {
    city: "Sylhet",
    note: "Tea country",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
  },
  {
    city: "Chattogram",
    note: "Port city",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
  },
];

const STEPS = [
  {
    n: "1",
    t: "Search",
    d: "Enter your destination and dates. We show only what's truly free.",
  },
  {
    n: "2",
    t: "Pick a room",
    d: "Compare room types with clear per-night and total pricing.",
  },
  {
    n: "3",
    t: "Book & relax",
    d: "Pay with card or bKash and get an instant confirmation reference.",
  },
];

export default function Home() {
  const q = `checkIn=${todayISO()}&checkOut=${addDays(todayISO(), 1)}&guests=2`;
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-50 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-12 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-sand-300 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Bangladesh's budget-friendly booking
            </span>
            <h1 className="font-display mt-5 text-5xl font-extrabold leading-[1.02] text-ink-900 sm:text-6xl md:text-7xl">
              Great stays.
              <br />
              <span className="text-brand-600">Small budgets.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-500">
              We put the lowest price first — clean, well-reviewed hotels across
              Bangladesh that won't break the bank.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <SearchForm />
          </div>

          <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
            <span className="text-sm font-medium text-ink-400">Popular:</span>
            {DESTINATIONS.map((d) => (
              <Link
                key={d.city}
                to={`/search?city=${encodeURIComponent(d.city)}&${q}`}
                className="group inline-flex items-center gap-2 rounded-full border border-sand-300 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:shadow-sm"
              >
                {d.city}
                <span className="text-xs text-ink-400 group-hover:text-brand-600">
                  {d.note}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-14">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink-900">
              Explore Bangladesh
            </h2>
            <p className="mt-1 text-ink-500">
              From beaches to tea gardens — find a stay anywhere.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.city}
              to={`/search?city=${encodeURIComponent(d.city)}&${q}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
            >
              <img
                src={d.image}
                alt={d.city}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <p className="font-display text-lg font-bold">{d.city}</p>
                <p className="text-sm text-white/80">{d.note}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-sand-100">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-16">
          <h2 className="font-display text-center text-3xl font-bold text-ink-900">
            Booking in three steps
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <span className="font-display mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-xl font-bold text-white">
                  {s.n}
                </span>
                <h3 className="font-display mt-4 text-lg font-bold text-ink-900">
                  {s.t}
                </h3>
                <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-ink-500">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            {
              t: "Lowest price first",
              d: "Results are sorted cheapest-first and you can cap your nightly budget — value is the default, not an afterthought.",
              icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
            },
            {
              t: "Real reviews",
              d: "Honest guest ratings on every hotel so a low price never means a nasty surprise.",
              icon: "M11.5 3.5l2.3 4.6 5.2.7-3.7 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1L4.3 8.8l5.2-.7z",
            },
            {
              t: "Pay your way",
              d: "Checkout with a card or bKash, then get an instant booking reference.",
              icon: "M5 13l4 4L19 7",
            },
          ].map((f) => (
            <div key={f.t} className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={f.icon} />
                </svg>
              </span>
              <h3 className="font-display mt-4 text-lg font-bold text-ink-900">
                {f.t}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                {f.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-20">
        <div className="overflow-hidden rounded-3xl bg-brand-600 px-8 py-12 text-center sm:py-16">
          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            Your next stay is one search away
          </h2>
          <p className="mx-auto mt-3 max-w-md text-brand-100">
            Budget-friendly rooms across Bangladesh, bookable in under a minute.
          </p>
          <Link
            to={`/search?city=Cox's Bazar&${q}`}
            className="mt-7 inline-block rounded-full bg-white px-7 py-3 font-semibold text-brand-700 transition hover:bg-brand-50 active:scale-[0.98]"
          >
            Start searching
          </Link>
        </div>
      </section>
    </div>
  );
}
