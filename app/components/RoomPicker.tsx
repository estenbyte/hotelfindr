import { useState } from "react";
import { Link } from "react-router";
import { formatPrice } from "../lib/format";
import type { AvailableRoom } from "../lib/availability.server";

type Search = { checkIn: string; checkOut: string; guests: number };

export function RoomPicker({
  rooms,
  search,
  hotelId,
  nights,
}: {
  rooms: AvailableRoom[];
  search: Search;
  hotelId: string;
  nights: number;
}) {
  const bookable = rooms.filter((r) => r.available > 0);
  const [selectedId, setSelectedId] = useState<string | null>(
    bookable[0]?.id ?? null,
  );
  const selected = rooms.find((r) => r.id === selectedId) ?? null;
  const total = selected ? selected.pricePerNight * nights : 0;
  const bookQuery = selected
    ? `?roomTypeId=${selected.id}&checkIn=${search.checkIn}&checkOut=${search.checkOut}&guests=${search.guests}`
    : "";

  if (rooms.length === 0) {
    return (
      <div className="card mt-5 p-8 text-center text-ink-500">
        No rooms fit {search.guests} guest{search.guests === 1 ? "" : "s"} here.
      </div>
    );
  }

  return (
    <>
      <div className="mt-5 grid grid-cols-1 gap-3 pb-28 sm:grid-cols-2">
        {rooms.map((r) => {
          const soldOut = r.available <= 0;
          const active = r.id === selectedId;
          return (
            <button
              key={r.id}
              type="button"
              disabled={soldOut}
              onClick={() => setSelectedId(r.id)}
              className={`relative flex flex-col rounded-2xl border-2 p-5 text-left transition ${
                soldOut
                  ? "cursor-not-allowed border-sand-200 bg-sand-100 opacity-60"
                  : active
                    ? "border-brand-600 bg-brand-50/60 shadow-[0_8px_24px_-14px_rgba(128,20,43,0.5)]"
                    : "border-sand-200 bg-white hover:border-brand-300"
              }`}
            >
              {/* select indicator */}
              <span
                className={`absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border-2 ${
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-sand-300"
                }`}
              >
                {active && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-3 w-3"
                    stroke="currentColor"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>

              <h3 className="font-display pr-7 text-lg font-bold text-ink-900">
                {r.name}
              </h3>
              <p className="mt-1 flex items-center gap-3 text-sm text-ink-500">
                <span className="inline-flex items-center gap-1">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                  </svg>
                  Sleeps {r.capacity}
                </span>
                <span
                  className={
                    soldOut
                      ? "font-medium text-amber-accent"
                      : "font-medium text-brand-700"
                  }
                >
                  {soldOut ? "Sold out" : `${r.available} left`}
                </span>
              </p>
              <div className="mt-4 flex items-end justify-between border-t border-sand-200 pt-3">
                <span className="font-display tabular text-xl font-bold text-ink-900">
                  {formatPrice(r.pricePerNight)}
                  <span className="text-sm font-normal text-ink-400">
                    {" "}
                    /night
                  </span>
                </span>
                <span className="tabular text-xs text-ink-400">
                  {formatPrice(r.pricePerNight * nights)} · {nights}n
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* sticky booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 py-4">
          <div>
            {selected ? (
              <>
                <p className="text-xs text-ink-400">
                  {selected.name} · {nights} night{nights === 1 ? "" : "s"}
                </p>
                <p className="font-display tabular text-2xl font-bold text-ink-900">
                  {formatPrice(total)}
                  <span className="text-sm font-normal text-ink-400">
                    {" "}
                    total
                  </span>
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-ink-500">
                Select a room to continue
              </p>
            )}
          </div>
          {selected ? (
            <Link
              to={`/hotels/${hotelId}/book${bookQuery}`}
              className="rounded-full bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700 active:scale-[0.98]"
            >
              Book now
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-full bg-sand-200 px-8 py-3 font-semibold text-ink-400">
              Book now
            </span>
          )}
        </div>
      </div>
    </>
  );
}
