'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        {/* Top section — logo + link columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="text-2xl font-bold text-white">
              FlyFile
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed max-w-sm">
              La piattaforma sicura per la condivisione file con crittografia AES-256 end-to-end. Pensata per professionisti e team.
            </p>
          </div>

          {/* Prodotto */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Prodotto</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/chi-siamo" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Chi siamo
                </Link>
              </li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new Event('openPricing'))}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Prezzi
                </button>
              </li>
              <li>
                <Link href="/funzionalita" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Funzionalità
                </Link>
              </li>
              <li>
                <Link href="/sicurezza" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Sicurezza
                </Link>
              </li>
            </ul>
          </div>

          {/* Supporto */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Supporto</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/supporto" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Centro assistenza
                </Link>
              </li>
              <li>
                <Link href="/documentazione" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Documentazione
                </Link>
              </li>
              <li>
                <a href="mailto:support@flyfile.it" className="text-sm text-gray-400 hover:text-white transition-colors">
                  support@flyfile.it
                </a>
              </li>
              <li>
                <a href="mailto:info@flyfile.it" className="text-sm text-gray-400 hover:text-white transition-colors">
                  info@flyfile.it
                </a>
              </li>
            </ul>
          </div>

          {/* Legale */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Legale</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/termini" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Termini di Servizio
                </Link>
              </li>
              <li>
                <Link href="/cookie" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800 mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          {/* Left — copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <span>&copy; {new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</span>
            <span className="hidden sm:inline">&middot;</span>
            <span>
              Un servizio di{' '}
              <a
                href="https://i-creativi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                I-Creativi
              </a>
              {' '}&mdash; Milano
            </span>
          </div>

          {/* Right — payment methods */}
          <div className="flex items-center gap-2">
            <span className="bg-gray-800 rounded px-2.5 py-1 text-[11px] font-bold text-gray-300 tracking-wide border border-gray-700">VISA</span>
            <span className="bg-gray-800 rounded px-2.5 py-1 border border-gray-700 flex items-center gap-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 -mr-1" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-90" />
            </span>
            <span className="bg-gray-800 rounded px-2.5 py-1 text-[11px] font-bold text-gray-300 tracking-wide border border-gray-700">AMEX</span>
            <span className="bg-gray-800 rounded px-2.5 py-1 text-[11px] font-medium text-gray-300 border border-gray-700 flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 14 17" fill="currentColor"><path d="M10.3 4.3c.5-.6.8-1.4.7-2.3-.7 0-1.6.5-2.1 1.1-.4.5-.8 1.4-.7 2.2.8.1 1.6-.4 2.1-1zM11 5.4c-1.2-.1-2.2.7-2.7.7-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.3 2.2-.3 5.4.9 7.2.6.9 1.3 1.8 2.3 1.8.9 0 1.3-.6 2.4-.6 1.1 0 1.4.6 2.4.6.9 0 1.6-.9 2.2-1.8.7-1 1-2 1-2 0 0-1.9-.8-2-2.7 0-1.6 1.3-2.3 1.4-2.4-.8-1.1-2-1.3-2.4-1.3l-.3.3z"/></svg>
              Pay
            </span>
            <span className="bg-gray-800 rounded px-2.5 py-1 text-[11px] font-medium text-gray-300 border border-gray-700 flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="currentColor"/></svg>
              Pay
            </span>
            <span className="bg-gray-800 rounded px-2.5 py-1 text-[11px] font-bold text-gray-300 italic border border-gray-700">stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
