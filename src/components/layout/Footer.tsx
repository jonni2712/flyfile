'use client';

import Link from 'next/link';
import { Mail, HelpCircle, Lock, Shield, Globe, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 40% 80%, rgba(120, 200, 255, 0.3) 0%, transparent 50%)`
        }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo e Descrizione */}
          <div className="col-span-1 md:col-span-2">
            {/* Logo */}
            <div className="flex items-center mb-6">
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                FlyFile
              </span>
            </div>

            <p className="text-blue-100/80 mb-6 max-w-md leading-relaxed">
              La piattaforma più sicura per la condivisione di file con crittografia AES-256 end-to-end.
              Perfetta per team e professionisti che necessitano di trasferimenti sicuri e affidabili.
            </p>
          </div>

          {/* Links Prodotto */}
          <div>
            <h3 className="text-sm font-semibold text-cyan-300 tracking-wider uppercase mb-6">Prodotto</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-blue-100/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-blue-100/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">
                  Upload
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-blue-100/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">
                  Prezzi
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Supporto */}
          <div>
            <h3 className="text-sm font-semibold text-purple-300 tracking-wider uppercase mb-6">Supporto</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/features" className="text-blue-100/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">
                  Funzionalità
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-blue-100/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">
                  Sicurezza
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-blue-100/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">
                  Documentazione
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-blue-100/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">
                  Contatti
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Glass Morphism Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

        {/* Sezione inferiore con contatti, links e copyright */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm">
          {/* Contatti Email */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 items-center md:items-start">
            <a href="mailto:info@flyfile.it" className="text-blue-100/70 hover:text-white transition-colors flex items-center gap-2">
              <Mail className="w-4 h-4" />
              info@flyfile.it
            </a>
            <a href="mailto:support@flyfile.it" className="text-blue-100/70 hover:text-white transition-colors flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              support@flyfile.it
            </a>
          </div>

          {/* Links Legali */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link href="/privacy" className="text-blue-100/60 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-blue-100/60 hover:text-white transition-colors">
              Termini di Servizio
            </Link>
            <Link href="/cookies" className="text-blue-100/60 hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-blue-100/60 text-center md:text-right">
            <div>&copy; {new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</div>
            <div className="mt-1">
              Un servizio di{' '}
              <a href="https://i-creativi.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                I-Creativi
              </a>{' '}
              - Milano
            </div>
          </div>
        </div>

        {/* Badge di Sicurezza con Glass Effect */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex flex-wrap justify-center items-center gap-8 text-xs">
            <div className="flex items-center group">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <Lock className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-white/80 font-medium">Crittografia AES-256</span>
            </div>
            <div className="flex items-center group">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-white/80 font-medium">GDPR Compliant</span>
            </div>
            <div className="flex items-center group">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <Globe className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-white/80 font-medium">Server in Europa</span>
            </div>
            <div className="flex items-center group">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-white/80 font-medium">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-xl"></div>
    </footer>
  );
}
