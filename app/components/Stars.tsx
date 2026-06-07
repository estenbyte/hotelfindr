// Compact star rating. `rating` is 0–5 (one decimal ok).
export function Stars({
  rating,
  reviewCount,
  size = "sm",
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(rating * 2) / 2; // nearest half
  const px = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  const text = size === "md" ? "text-sm" : "text-xs";

  return (
    <span className={`inline-flex items-center gap-1 ${text}`}>
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill =
            rounded >= i ? "full" : rounded >= i - 0.5 ? "half" : "empty";
          return (
            <svg
              key={i}
              viewBox="0 0 24 24"
              className={px}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={`half-${i}`}>
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#e5e7eb" />
                </linearGradient>
              </defs>
              <path
                d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z"
                fill={
                  fill === "full"
                    ? "#f59e0b"
                    : fill === "half"
                      ? `url(#half-${i})`
                      : "#e5e7eb"
                }
              />
            </svg>
          );
        })}
      </span>
      <span className="tabular font-semibold text-ink-900">
        {rating.toFixed(1)}
      </span>
      {reviewCount != null && (
        <span className="text-ink-400">({reviewCount})</span>
      )}
    </span>
  );
}
