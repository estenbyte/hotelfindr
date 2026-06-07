export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-sand-200 bg-sand-100">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:px-6 py-6 text-sm text-ink-400 sm:flex-row">
        <p>© {year} hotelfindr. All rights reserved.</p>
        <p>
          Developed by{" "}
          <a
            href="https://m.me/ebnsina.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ink-700 underline-offset-2 hover:text-brand-700 hover:underline"
          >
            Ebn Sina
          </a>
        </p>
      </div>
    </footer>
  );
}
