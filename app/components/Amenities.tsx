import { parseAmenities } from "../lib/amenities";

function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {d.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : `M${seg}`} />
      ))}
    </svg>
  );
}

/** Full amenity grid — used on the hotel detail page. */
export function AmenityGrid({ csv }: { csv: string }) {
  const items = parseAmenities(csv);
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
      {items.map((a) => (
        <div key={a.key} className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Icon d={a.icon} />
          </span>
          <span className="text-sm font-medium text-ink-700">{a.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Compact chip list — used on the booking summary. */
export function AmenityChips({ csv, max }: { csv: string; max?: number }) {
  const items = parseAmenities(csv);
  if (items.length === 0) return null;
  const shown = max ? items.slice(0, max) : items;
  const rest = items.length - shown.length;
  return (
    <ul className="flex flex-wrap gap-2">
      {shown.map((a) => (
        <li
          key={a.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-sand-50 px-2.5 py-1 text-xs font-medium text-ink-700"
        >
          <span className="text-brand-700">
            <Icon d={a.icon} className="h-3.5 w-3.5" />
          </span>
          {a.label}
        </li>
      ))}
      {rest > 0 && (
        <li className="inline-flex items-center rounded-full border border-sand-200 px-2.5 py-1 text-xs font-medium text-ink-400">
          +{rest} more
        </li>
      )}
    </ul>
  );
}
