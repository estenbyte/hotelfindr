// Pure, isomorphic helpers shared by loaders and components.

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Format an integer cent amount as a currency string. */
export function formatPrice(cents: number, currency = "BDT"): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Whole nights between two YYYY-MM-DD dates. Returns 0 if non-positive. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = Date.parse(checkIn);
  const b = Date.parse(checkOut);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / MS_PER_DAY));
}

/** Today as YYYY-MM-DD (UTC). */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Add n days to a YYYY-MM-DD date, returning YYYY-MM-DD. */
export function addDays(dateISO: string, n: number): string {
  const d = new Date(dateISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
