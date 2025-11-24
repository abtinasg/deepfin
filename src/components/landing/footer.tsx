import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950 py-12 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 text-center md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Deep Terminal. Built in San Francisco & Dubai.
          </p>
          <div className="flex justify-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            <Link href="/AUTHENTICATION" className="hover:text-white transition-colors">
              Security
            </Link>
            <Link href="/REALTIME_MARKET_DATA" className="hover:text-white transition-colors">
              Market Data
            </Link>
            <Link href="/REAL_DATA_GUIDE_FA" className="hover:text-white transition-colors">
              Real Data
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
