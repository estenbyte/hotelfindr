import { useState } from "react";
import { Form, Link, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/book";
import { SiteHeader } from "../components/SiteHeader";
import { AmenityChips } from "../components/Amenities";
import { prisma } from "../lib/db.server";
import { getHotelAvailability, parseSearch } from "../lib/availability.server";
import { createBooking } from "../lib/booking.server";
import { formatPrice, nightsBetween } from "../lib/format";

export function meta() {
  return [{ title: "Book your room — hotelfindr" }];
}

async function loadContext(hotelId: string, request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams;
  const roomTypeId = q.get("roomTypeId") ?? "";

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!hotel) throw new Response("Hotel not found", { status: 404 });

  const parsed = parseSearch({
    city: hotel.city,
    checkIn: q.get("checkIn"),
    checkOut: q.get("checkOut"),
    guests: q.get("guests"),
  });
  if (!parsed.ok) {
    return { hotel, room: null, search: null, error: parsed.error };
  }

  const rooms = await getHotelAvailability(
    hotel.id,
    parsed.value.checkIn,
    parsed.value.checkOut,
    parsed.value.guests,
  );
  const room = rooms.find((r) => r.id === roomTypeId) ?? null;
  return { hotel, room, search: parsed.value, error: null as string | null };
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const ctx = await loadContext(params.hotelId, request);
  if (ctx.search && (!ctx.room || ctx.room.available <= 0)) {
    return { ...ctx, error: "This room is no longer available for your dates." };
  }
  return ctx;
}

export async function action({ params, request }: Route.ActionArgs) {
  const form = await request.formData();
  const roomTypeId = String(form.get("roomTypeId") ?? "");
  const checkIn = String(form.get("checkIn") ?? "");
  const checkOut = String(form.get("checkOut") ?? "");
  const guests = Number.parseInt(String(form.get("guests") ?? "1"), 10) || 1;
  const guestName = String(form.get("guestName") ?? "");
  const guestEmail = String(form.get("guestEmail") ?? "");

  // Validate the chosen method's fields.
  const method = String(form.get("method") ?? "card");
  if (method === "bkash") {
    const number = String(form.get("bkashNumber") ?? "").replace(/\D/g, "");
    const pin = String(form.get("bkashPin") ?? "").replace(/\D/g, "");
    if (!/^01\d{9}$/.test(number)) {
      return { error: "Enter a valid 11-digit bKash number (e.g. 01XXXXXXXXX)." };
    }
    if (pin.length < 4) {
      return { error: "Enter your bKash PIN to continue." };
    }
  } else {
    const card = String(form.get("card") ?? "").replace(/\s/g, "");
    const expiry = String(form.get("expiry") ?? "");
    const cvc = String(form.get("cvc") ?? "");
    if (card.length < 12 || !expiry || cvc.length < 3) {
      return { error: "Enter valid card details to continue." };
    }
  }

  const result = await createBooking({
    roomTypeId,
    checkIn,
    checkOut,
    guests,
    guestName,
    guestEmail,
  });

  if (!result.ok) return { error: result.error };
  return redirect(`/confirmation/${result.reference}`);
}

const labelClass =
  "text-[11px] font-semibold uppercase tracking-wide text-ink-400";
const fieldClass =
  "w-full rounded-xl border border-sand-200 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default function Book({ loaderData, actionData }: Route.ComponentProps) {
  const { hotel, room, search, error: loadError } = loaderData;
  const actionError = actionData?.error;
  const nav = useNavigation();
  const submitting = nav.state === "submitting";
  const [method, setMethod] = useState<"card" | "bkash">("card");

  if (!search || !room) {
    return (
      <div className="flex flex-1 flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-12">
          <div className="card p-8 text-center">
            <p className="font-display text-lg font-bold text-ink-900">
              {loadError ?? "Missing booking details."}
            </p>
            <Link
              to={`/hotels/${hotel.id}`}
              className="mt-4 inline-block font-semibold text-brand-700 hover:underline"
            >
              ← Back to {hotel.name}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const nights = nightsBetween(search.checkIn, search.checkOut);
  const total = room.pricePerNight * nights;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl font-extrabold text-ink-900">
          Complete your booking
        </h1>
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <Form method="post" className="space-y-6">
            <input type="hidden" name="roomTypeId" value={room.id} />
            <input type="hidden" name="checkIn" value={search.checkIn} />
            <input type="hidden" name="checkOut" value={search.checkOut} />
            <input type="hidden" name="guests" value={search.guests} />

            {(actionError || loadError) && (
              <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {actionError ?? loadError}
              </p>
            )}

            <section className="card p-4 sm:p-6">
              <h2 className="font-display text-lg font-bold text-ink-900">
                Guest details
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Full name</span>
                  <input name="guestName" required className={fieldClass} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Email</span>
                  <input
                    type="email"
                    name="guestEmail"
                    required
                    className={fieldClass}
                  />
                </label>
              </div>
            </section>

            <section className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink-900">
                  Payment
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-3.5 w-3.5"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" />
                  </svg>
                  Secure
                </span>
              </div>

              <input type="hidden" name="method" value={method} />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <MethodTab
                  active={method === "card"}
                  onClick={() => setMethod("card")}
                  activeClass="border-brand-500 bg-brand-50 text-brand-800"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                  Card
                </MethodTab>
                <MethodTab
                  active={method === "bkash"}
                  onClick={() => setMethod("bkash")}
                  activeClass="border-[#e2136e] bg-[#e2136e]/5 text-[#e2136e]"
                >
                  <span className="font-display font-bold tracking-tight">
                    bKash
                  </span>
                </MethodTab>
              </div>

              {method === "card" ? (
                <>
                  <p className="mt-4 text-xs text-ink-400">
                    Enter your card details to confirm the booking.
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <label className="flex flex-col gap-1.5 sm:col-span-4">
                      <span className={labelClass}>Card number</span>
                      <input
                        name="card"
                        inputMode="numeric"
                        placeholder="4242 4242 4242 4242"
                        className={fieldClass}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 sm:col-span-2">
                      <span className={labelClass}>Expiry</span>
                      <input
                        name="expiry"
                        placeholder="MM/YY"
                        className={fieldClass}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 sm:col-span-2">
                      <span className={labelClass}>CVC</span>
                      <input
                        name="cvc"
                        inputMode="numeric"
                        placeholder="123"
                        className={fieldClass}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-4 text-xs text-ink-400">
                    Enter your bKash account number and PIN.
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>bKash account number</span>
                      <input
                        name="bkashNumber"
                        inputMode="numeric"
                        placeholder="01XXXXXXXXX"
                        maxLength={11}
                        className={fieldClass}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>PIN</span>
                      <input
                        name="bkashPin"
                        type="password"
                        inputMode="numeric"
                        placeholder="••••"
                        maxLength={5}
                        className={fieldClass}
                      />
                    </label>
                  </div>
                </>
              )}
            </section>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-brand-600 px-6 py-3.5 font-semibold text-white transition hover:bg-brand-700 active:scale-[0.99] disabled:opacity-60 sm:w-auto"
            >
              {submitting ? "Confirming…" : `Pay ${formatPrice(total)} & book`}
            </button>
          </Form>

          <aside className="card h-fit overflow-hidden">
            <div className="border-b border-sand-100 p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">
                {hotel.name}
              </h2>
              <p className="text-sm text-ink-400">{hotel.city}</p>
            </div>
            <dl className="space-y-3 p-5 text-sm">
              <Row label="Room" value={room.name} />
              <Row label="Check-in" value={search.checkIn} />
              <Row label="Check-out" value={search.checkOut} />
              <Row label="Guests" value={String(search.guests)} />
              <Row
                label={`${formatPrice(room.pricePerNight)} × ${nights}n`}
                value={formatPrice(total)}
              />
            </dl>
            <div className="flex items-center justify-between border-t border-sand-100 p-5">
              <span className="font-semibold text-ink-700">Total</span>
              <span className="font-display tabular text-2xl font-bold text-ink-900">
                {formatPrice(total)}
              </span>
            </div>
            {hotel.amenities && (
              <div className="border-t border-sand-100 p-5">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  What's included
                </p>
                <AmenityChips csv={hotel.amenities} />
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

function MethodTab({
  active,
  onClick,
  activeClass,
  children,
}: {
  active: boolean;
  onClick: () => void;
  activeClass: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
        active
          ? activeClass
          : "border-sand-200 bg-white text-ink-500 hover:bg-sand-50"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-400">{label}</dt>
      <dd className="tabular font-medium text-ink-900">{value}</dd>
    </div>
  );
}
