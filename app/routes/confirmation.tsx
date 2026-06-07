import QRCode from "qrcode";
import { Link } from "react-router";
import type { Route } from "./+types/confirmation";
import { SiteHeader } from "../components/SiteHeader";
import { getBookingByReference } from "../lib/booking.server";
import { formatPrice, nightsBetween } from "../lib/format";

export function meta({ data }: Route.MetaArgs) {
  return [
    {
      title: data
        ? `Booking ${data.booking.reference} — hotelfindr`
        : "Booking",
    },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const booking = await getBookingByReference(params.reference);
  if (!booking) throw new Response("Booking not found", { status: 404 });

  // QR encodes the booking's own URL, so scanning opens this pass.
  const origin = new URL(request.url).origin;
  const qr = await QRCode.toDataURL(`${origin}/confirmation/${booking.reference}`, {
    margin: 1,
    width: 220,
    color: { dark: "#141d1d", light: "#ffffff" },
  });
  return { booking, qr };
}

export default function Confirmation({ loaderData }: Route.ComponentProps) {
  const { booking, qr } = loaderData;
  const checkIn = booking.checkIn.toISOString().slice(0, 10);
  const checkOut = booking.checkOut.toISOString().slice(0, 10);
  const nights = nightsBetween(checkIn, checkOut);
  const hotel = booking.roomType.hotel;
  const cancelled = booking.status === "cancelled";

  return (
    <div className="flex flex-1 flex-col bg-sand-100">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10">
        {/* header */}
        <div className="text-center">
          <span
            className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${
              cancelled ? "bg-red-100 text-red-600" : "bg-brand-600 text-white"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              stroke="currentColor"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {cancelled ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M20 6 9 17l-5-5" />
              )}
            </svg>
          </span>
          <h1 className="font-display mt-3 text-2xl font-extrabold text-ink-900">
            {cancelled ? "Booking cancelled" : "You're booked!"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {cancelled
              ? "This reservation has been cancelled."
              : "Here's your booking pass — keep the reference handy."}
          </p>
        </div>

        {/* two columns on desktop: ticket + next steps */}
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 items-start gap-8 lg:grid-cols-[1.15fr_1fr]">
          {/* Ticket */}
          <div className="w-full">
            {/* top stub (brand) */}
            <div className="rounded-t-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 pb-7 pt-6 text-white">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold">
                  hotel<span className="text-white/80">findr</span>
                </span>
                <span
                  className={`font-mono rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                    cancelled
                      ? "bg-red-500/30 text-white"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {cancelled ? "Cancelled" : "Confirmed"}
                </span>
              </div>

              <p className="mt-5 text-xs font-medium text-white/70">Guest</p>
              <p className="font-display text-xl font-bold">
                {booking.guestName}
              </p>

              {/* route line: check-in → check-out */}
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70">Check-in</p>
                  <p className="font-mono tabular text-lg font-semibold">
                    {checkIn}
                  </p>
                </div>
                <div className="mx-3 flex flex-1 flex-col items-center">
                  <span className="text-[11px] font-semibold text-white">
                    {nights} night{nights === 1 ? "" : "s"}
                  </span>
                  <div className="mt-1 flex w-full items-center">
                    <span className="h-2 w-2 rounded-full border-2 border-white/80" />
                    <span className="h-px flex-1 bg-white/40" />
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="mx-1 h-4 w-4 text-white"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 17v-4h18a2 2 0 0 1 2 2v2M2 17h20M2 17v2M22 17v2M4 13V8a2 2 0 0 1 2-2h6v7" />
                    </svg>
                    <span className="h-px flex-1 bg-white/40" />
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-white/70">Check-out</p>
                  <p className="font-mono tabular text-lg font-semibold">
                    {checkOut}
                  </p>
                </div>
              </div>
            </div>

            {/* perforation 1 */}
            <div className="relative bg-white">
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-sand-100" />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-sand-100" />
              <div className="mx-5 border-t-2 border-dashed border-sand-300" />
            </div>

            {/* body */}
            <div className="bg-white px-6 py-6">
              <p className="text-xs text-ink-400">Hotel</p>
              <p className="font-display text-lg font-bold text-ink-900">
                {hotel.name}
              </p>
              <p className="text-sm text-ink-400">
                {hotel.address} · {hotel.city}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-sand-200 pt-5 text-center">
                <Stat label="Room" value={booking.roomType.name} />
                <Stat label="Guests" value={String(booking.guests)} />
                <Stat label="Nights" value={String(nights)} />
              </div>
            </div>

            {/* perforation 2 */}
            <div className="relative bg-white">
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-sand-100" />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-sand-100" />
              <div className="mx-5 border-t-2 border-dashed border-sand-300" />
            </div>

            {/* bottom stub: reference + QR */}
            <div className="rounded-b-3xl bg-white px-6 pb-7 pt-6">
              <div className="flex items-center gap-5">
                <div className="rounded-xl border border-sand-200 p-2">
                  <img
                    src={qr}
                    alt={`QR code for booking ${booking.reference}`}
                    className="h-28 w-28"
                    width={112}
                    height={112}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-wide text-ink-400">
                    Reference
                  </p>
                  <p className="font-mono tabular text-xl font-semibold tracking-wider text-ink-900">
                    {booking.reference}
                  </p>
                  <p className="mt-3 text-[11px] uppercase tracking-wide text-ink-400">
                    Total paid
                  </p>
                  <p className="font-display tabular text-xl font-bold text-ink-900">
                    {formatPrice(booking.totalPrice)}
                  </p>
                  <p className="mt-2 text-xs text-ink-400">
                    Scan to open your booking.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <aside className="flex flex-col gap-5">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink-900">
                Good to know
              </h2>
              <ul className="mt-4 space-y-4 text-sm">
                <InfoRow
                  title="Check-in from 2:00 PM"
                  body="Check-out by 12:00 noon on your last day."
                />
                <InfoRow
                  title="Show your reference"
                  body={`Present ${booking.reference} and a valid photo ID at the front desk.`}
                />
                <InfoRow
                  title="Paid in full"
                  body={`${formatPrice(booking.totalPrice)} received — your stay is fully paid.`}
                />
                <InfoRow
                  title="Confirmation sent"
                  body={`A copy is on the way to ${booking.guestEmail}.`}
                />
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/search?city=${encodeURIComponent(hotel.city)}`}
                className="flex-1 rounded-xl border border-sand-300 bg-white px-5 py-3 text-center font-semibold text-ink-700 transition hover:bg-sand-50"
              >
                Browse more stays
              </Link>
              <Link
                to="/"
                className="flex-1 rounded-xl bg-brand-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-brand-700 active:scale-[0.98]"
              >
                Back home
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-0.5 font-display tabular text-sm font-bold text-ink-900">
        {value}
      </p>
    </div>
  );
}

function InfoRow({ title, body }: { title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-3.5 w-3.5"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <div>
        <p className="font-semibold text-ink-900">{title}</p>
        <p className="mt-0.5 text-ink-500">{body}</p>
      </div>
    </li>
  );
}
