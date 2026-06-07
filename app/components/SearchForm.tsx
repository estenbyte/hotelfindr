import { Form } from "react-router";
import { addDays, todayISO } from "../lib/format";
import { BUDGET_TIERS } from "../lib/budget";

type Props = {
  defaults?: {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    maxPrice?: number | null;
  };
};

const labelClass =
  "text-[11px] font-semibold uppercase tracking-wide text-ink-400";
const fieldClass =
  "w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-400/70";
const cellClass = "flex flex-col gap-1 px-4 py-3";

export function SearchForm({ defaults }: Props) {
  const today = todayISO();
  return (
    <Form
      method="get"
      action="/search"
      className="grid grid-cols-1 divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-[0_12px_28px_-16px_rgba(20,29,29,0.25)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-[1.5fr_1fr_1fr_0.7fr_1.1fr_auto] lg:divide-x"
    >
      <label className={cellClass}>
        <span className={labelClass}>Destination</span>
        <input
          type="text"
          name="city"
          placeholder="Where to? e.g. Cox's Bazar"
          defaultValue={defaults?.city ?? ""}
          className={fieldClass}
        />
      </label>
      <label
        className={`${cellClass} border-t border-sand-200 sm:border-t-0 lg:border-t-0`}
      >
        <span className={labelClass}>Check-in</span>
        <input
          type="date"
          name="checkIn"
          min={today}
          defaultValue={defaults?.checkIn ?? today}
          className={fieldClass}
        />
      </label>
      <label className={cellClass}>
        <span className={labelClass}>Check-out</span>
        <input
          type="date"
          name="checkOut"
          min={today}
          defaultValue={defaults?.checkOut ?? addDays(today, 1)}
          className={fieldClass}
        />
      </label>
      <label className={cellClass}>
        <span className={labelClass}>Guests</span>
        <input
          type="number"
          name="guests"
          min={1}
          max={10}
          defaultValue={defaults?.guests ?? 2}
          className={fieldClass}
        />
      </label>
      <label className={cellClass}>
        <span className={labelClass}>Budget</span>
        <select
          name="maxPrice"
          defaultValue={String(defaults?.maxPrice ?? "")}
          className={`${fieldClass} -ml-0.5`}
        >
          {BUDGET_TIERS.map((t) => (
            <option key={t.key} value={t.maxPrice ?? ""}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <div className="p-2">
        <button
          type="submit"
          className="flex h-full w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.98]"
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
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Search
        </button>
      </div>
    </Form>
  );
}
