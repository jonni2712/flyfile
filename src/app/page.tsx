'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Shield, Users, BarChart3, Clock, Check, Lock, Zap, Globe } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export default function Home() {
  const { user } = useAuth();

  return (
    <MainLayout>
      {/* Hero Section with Glass Morphism */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden -mt-16 pt-16">
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

        <div className="relative z-10 flex items-center min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Left Content */}
              <div className="text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center px-3 py-2 sm:px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6 sm:mb-8">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 mr-2" />
                  <span className="text-white/90 text-xs sm:text-sm font-medium">Crittografia AES-256 End-to-End</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Condivisione
                  <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    File Sicura
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl text-blue-100/80 mb-8 max-w-2xl mx-auto lg:mx-0">
                  La piattaforma più sicura per condividere file con crittografia militare.
                  Perfetta per team e professionisti che necessitano di trasferimenti affidabili.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Link
                    href="/upload"
                    className="group px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Carica File Ora
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-6 py-3 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Vedi Prezzi
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 sm:mt-12 flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 text-white/60 text-xs sm:text-sm">
                  <div className="flex items-center">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-1 sm:mr-2" />
                    GDPR Compliant
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-1 sm:mr-2" />
                    ISO 27001 Certified
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-1 sm:mr-2" />
                    99.9% Uptime
                  </div>
                </div>
              </div>

              {/* Right Content - Glass Card */}
              <div className="relative">
                {/* Floating Glass Card */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
                  {/* Security Icon */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full mb-4 shadow-lg">
                      <Lock className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Sicurezza Militare</h3>
                    <p className="text-blue-100/80">I tuoi file sono protetti con la stessa crittografia usata dalle agenzie governative</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4">
                    <div className="flex items-center text-white/90">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                        <Check className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-sm">Crittografia AES-256 automatica</span>
                    </div>
                    <div className="flex items-center text-white/90">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                        <Clock className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-sm">Scadenza automatica file</span>
                    </div>
                    <div className="flex items-center text-white/90">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                        <Users className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-sm">Gestione team avanzata</span>
                    </div>
                    <div className="flex items-center text-white/90">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3">
                        <BarChart3 className="w-4 h-4 text-orange-400" />
                      </div>
                      <span className="text-sm">Analytics dettagliate</span>
                    </div>
                  </div>

                  {/* Quick Start */}
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <Link
                      href="/upload"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-400 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Prova Subito Gratis
                    </Link>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Glass Morphism */}
      <div className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)`
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/40 rounded-full mb-6">
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Funzionalità</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Tutto quello che serve per la
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> condivisione sicura</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una piattaforma completa con funzionalità enterprise per proteggere e gestire i tuoi file
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="group">
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Crittografia AES-256</h3>
                <p className="text-gray-600 text-sm">Sicurezza militare che protegge i tuoi file durante il trasferimento e la conservazione.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Collaborazione Team</h3>
                <p className="text-gray-600 text-sm">Gestisci team, invita membri e monitora la condivisione file nella tua organizzazione.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Avanzate</h3>
                <p className="text-gray-600 text-sm">Traccia download, monitora l&apos;utilizzo e ottieni insights dettagliati sulla tua attività.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group">
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pulizia Automatica</h3>
                <p className="text-gray-600 text-sm">I file vengono eliminati automaticamente in base alle impostazioni di conservazione per ottimizzare lo spazio.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="bg-white/60 backdrop-blur-lg border border-white/40 rounded-3xl p-8 lg:p-12 shadow-2xl max-w-4xl mx-auto">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Pronto per iniziare?
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Unisciti a migliaia di professionisti che si fidano di FlyFile per le loro esigenze di condivisione file sicura
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/upload"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  Inizia Gratis Ora
                </Link>
                <Link
                  href="/upload"
                  className="px-8 py-4 bg-white/70 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-white transition-all duration-300"
                >
                  Prova Upload Anonimo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
