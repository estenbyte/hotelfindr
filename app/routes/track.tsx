import { Form, redirect } from "react-router";
import type { Route } from "./+types/track";
import { SiteHeader } from "../components/SiteHeader";
import { getBookingByReference } from "../lib/booking.server";

export function meta() {
  return [
    { title: "Track your booking — hotelfindr" },
    {
      name: "description",
      content: "Look up a hotelfindr booking by its reference.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const ref = new URL(request.url).searchParams.get("ref")?.trim();
  if (!ref) return { error: null, ref: "" };

  const booking = await getBookingByReference(ref.toUpperCase());
  if (booking) {
    throw redirect(`/confirmation/${booking.reference}`);
  }
  return { error: "No booking found with that reference. Check and try again.", ref };
}

export default function Track({ loaderData }: Route.ComponentProps) {
  const { error, ref } = loaderData;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-4 sm:px-6 py-16">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <h1 className="font-display mt-3 text-3xl font-extrabold text-ink-900">
            Track your booking
          </h1>
          <p className="mt-2 text-ink-500">
            Enter the reference from your booking pass (e.g. HF-AB12CD).
          </p>
        </div>

        <Form method="get" className="mt-8 card p-6">
          {error && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              Booking reference
            </span>
            <input
              name="ref"
              required
              autoFocus
              defaultValue={ref}
              placeholder="HF-XXXXXX"
              autoCapitalize="characters"
              className="font-mono tabular w-full rounded-xl border border-sand-200 bg-white px-3.5 py-2.5 text-lg font-semibold uppercase tracking-wider text-ink-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 active:scale-[0.99]"
          >
            Find my booking
          </button>
        </Form>
      </main>
    </div>
  );
}
