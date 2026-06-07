import { Link } from "react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M10 21v-4h4v4" />
            </svg>
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink-900">
            hotel<span className="text-brand-600">findr</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/search"
            className="rounded-full px-3 py-2 font-medium text-ink-600 transition hover:bg-sand-100 hover:text-ink-900 sm:px-4"
          >
            Browse hotels
          </Link>
          <Link
            to="/track"
            className="rounded-full px-3 py-2 font-medium text-ink-600 transition hover:bg-sand-100 hover:text-ink-900 sm:px-4"
          >
            Track booking
          </Link>
        </nav>
      </div>
    </header>
  );
}
