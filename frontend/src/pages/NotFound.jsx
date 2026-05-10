import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="flex min-h-screen items-center justify-center px-5 py-24">
      <div className="max-w-xl rounded-[36px] bg-vellum p-10 text-center shadow-soft dark:bg-[#211915]">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-clay">404</p>
        <h1 className="mt-4 font-display text-5xl font-bold">This page is unfinished paper</h1>
        <p className="mt-4 text-ink/65 dark:text-vellum/65">The page you opened does not exist.</p>
        <Link to="/" className="mt-8 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-vellum dark:bg-vellum dark:text-ink">
          Return Home
        </Link>
      </div>
    </section>
  );
}
