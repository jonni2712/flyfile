import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Shield, Check, Lock, Mail, Globe, ExternalLink } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.privacy' });

  const pathnames = routing.pathnames['/privacy'];
  const canonicalLocale = locale as keyof typeof pathnames;
  const localizedPath = typeof pathnames === 'string' ? pathnames : pathnames[canonicalLocale] || pathnames.it;

  const baseUrl = 'https://flyfile.it';
  const canonicalUrl = locale === 'it' ? `${baseUrl}${localizedPath}` : `${baseUrl}/${locale}${localizedPath}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    const p = typeof pathnames === 'string' ? pathnames : pathnames[loc as keyof typeof pathnames] || pathnames.it;
    languages[loc] = loc === 'it' ? `${baseUrl}${p}` : `${baseUrl}/${loc}${p}`;
  }

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: `${t('title')} | FlyFile`,
      description: t('description'),
      url: canonicalUrl,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `FlyFile - ${t('title')}` }],
    },
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations('legal.privacy');

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-center -mt-16 pt-16 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-2 mb-8">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">{t('badge')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            {t('heroTitle')}
            <span className="block italic font-light">{t('heroTitleItalic')}</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            {t('lastUpdated')}
          </p>
        </div>
      </div>

      {/* Introduzione */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">{t('introLabel')}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-6">
            {t('introTitle')}
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            {t('introText')}
          </p>
        </div>
      </div>

      {/* Informazioni che Raccogliamo */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">{t('dataCollectedLabel')}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-10">
            {t('dataCollectedTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5">{t('accountInfo')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Nome e indirizzo email durante la registrazione</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Password criptografata per la sicurezza dell&apos;account</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Preferenze di configurazione del profilo</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Informazioni di fatturazione per gli abbonamenti a pagamento</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5">{t('usageData')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Metadati dei file caricati (nome, dimensione, data di caricamento)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Log di accesso e attività del servizio</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Indirizzo IP e informazioni del dispositivo</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Analytics sull&apos;utilizzo delle funzionalità</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Analisi e Statistiche */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Analytics</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-10">
            Analisi e Statistiche
          </h2>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Google Analytics</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Utilizziamo Google Analytics per comprendere come gli utenti interagiscono con il nostro sito. Questo ci aiuta a migliorare l&apos;esperienza utente e le prestazioni del servizio.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Consenso richiesto:</strong> Google Analytics viene attivato solo dopo il tuo esplicito consenso</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">IP anonimizzato:</strong> Il tuo indirizzo IP viene anonimizzato prima dell&apos;elaborazione</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Revoca facile:</strong> Puoi revocare il consenso in qualsiasi momento dalle <Link href="/cookie" className="text-purple-600 hover:underline">impostazioni cookie</Link></span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Per maggiori informazioni su come Google utilizza i dati, consulta la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy di Google</a>.
          </p>
        </div>
      </div>

      {/* Servizi di Terze Parti e Responsabili del Trattamento */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Responsabili del trattamento</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-6">
            Servizi di Terze Parti e Responsabili del Trattamento
          </h2>
          <p className="text-base text-gray-600 leading-relaxed mb-10">
            Per erogare il servizio, ci avvaliamo dei seguenti fornitori terzi che agiscono in qualità di responsabili del trattamento ai sensi dell&apos;art. 28 del GDPR. Di seguito sono indicati i dati condivisi, le finalità, la base giuridica e i periodi di conservazione per ciascun servizio.
          </p>

          <div className="space-y-6">
            {/* Google LLC */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-blue-600">G</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Google LLC</h3>
                  <p className="text-sm text-gray-500">Mountain View, California, USA</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Google Analytics</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Dati trattati:</strong> indirizzo IP anonimizzato, pagine visitate, durata della sessione, tipo di dispositivo e browser, sorgente di traffico</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Finalità:</strong> analisi statistica dell&apos;utilizzo del sito e miglioramento del servizio</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Base giuridica:</strong> consenso dell&apos;utente (art. 6.1.a GDPR)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Conservazione:</strong> 14 mesi (configurazione predefinita di Google Analytics 4)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Google AdSense</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Dati trattati:</strong> cookie pubblicitari, identificatori del dispositivo, indirizzo IP, dati di navigazione</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Finalità:</strong> visualizzazione di annunci pubblicitari personalizzati</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Base giuridica:</strong> consenso dell&apos;utente (art. 6.1.a GDPR)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Conservazione:</strong> gestita da Google secondo la propria privacy policy</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Firebase Authentication</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Dati trattati:</strong> indirizzo email, password hash, token di autenticazione, log di accesso</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Finalità:</strong> gestione dell&apos;autenticazione e della sicurezza dell&apos;account</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Base giuridica:</strong> esecuzione del contratto (art. 6.1.b GDPR)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Conservazione:</strong> fino alla cancellazione dell&apos;account; log gestiti da Google</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Firebase Firestore</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Dati trattati:</strong> dati del profilo utente, metadati dei file, configurazione dei trasferimenti</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Finalità:</strong> archiviazione dei dati applicativi necessari al funzionamento del servizio</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Base giuridica:</strong> esecuzione del contratto (art. 6.1.b GDPR)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Conservazione:</strong> fino alla cancellazione dell&apos;account</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Google reCAPTCHA v3</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Dati trattati:</strong> indirizzo IP, cookie, dati di navigazione, interazioni con il sito</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Finalità:</strong> prevenzione di frodi e abusi automatizzati</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Base giuridica:</strong> legittimo interesse (art. 6.1.f GDPR)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Conservazione:</strong> gestita da Google secondo la propria privacy policy</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Google Fonts</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Dati trattati:</strong> indirizzo IP dell&apos;utente durante il caricamento dei font</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Finalità:</strong> rendering tipografico del sito web</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                      <span className="text-gray-600"><strong className="text-gray-900">Base giuridica:</strong> legittimo interesse (art. 6.1.f GDPR)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100">
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                  Privacy Policy di Google <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Stripe Inc. */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-purple-600">S</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Stripe Inc.</h3>
                  <p className="text-sm text-gray-500">San Francisco, California, USA</p>
                </div>
              </div>

              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Dati trattati:</strong> nome, indirizzo email, dati della carta di pagamento, indirizzo di fatturazione, cronologia delle transazioni</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Finalità:</strong> elaborazione dei pagamenti e gestione degli abbonamenti</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Base giuridica:</strong> esecuzione del contratto (art. 6.1.b GDPR) e obbligo legale per la conservazione fiscale (art. 6.1.c GDPR)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Conservazione:</strong> i dati delle transazioni sono conservati per 7 anni come previsto dalla normativa fiscale vigente</span>
                </li>
              </ul>

              <div className="mt-5 pt-5 border-t border-gray-100">
                <a href="https://stripe.com/it/privacy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                  Privacy Policy di Stripe <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Cloudflare Inc. */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-orange-600">C</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Cloudflare Inc.</h3>
                  <p className="text-sm text-gray-500">San Francisco, California, USA</p>
                </div>
              </div>

              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Servizio utilizzato:</strong> Cloudflare R2 (archiviazione file)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Dati trattati:</strong> file caricati dagli utenti (crittografati lato client), metadati di archiviazione</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Finalità:</strong> archiviazione sicura dei file condivisi tramite la piattaforma</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Base giuridica:</strong> esecuzione del contratto (art. 6.1.b GDPR)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Conservazione:</strong> secondo la durata configurata dall&apos;utente (da 3 a 365 giorni), poi eliminati automaticamente</span>
                </li>
              </ul>

              <div className="mt-5 pt-5 border-t border-gray-100">
                <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                  Privacy Policy di Cloudflare <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Vercel Inc. */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-gray-900">V</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Vercel Inc.</h3>
                  <p className="text-sm text-gray-500">San Francisco, California, USA</p>
                </div>
              </div>

              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Dati trattati:</strong> indirizzo IP, dati di navigazione, log delle richieste HTTP, dati di performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Finalità:</strong> hosting dell&apos;applicazione web e monitoraggio delle prestazioni</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Base giuridica:</strong> esecuzione del contratto (art. 6.1.b GDPR) e legittimo interesse (art. 6.1.f GDPR)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Conservazione:</strong> log delle richieste conservati per 30 giorni; analytics secondo configurazione della piattaforma</span>
                </li>
              </ul>

              <div className="mt-5 pt-5 border-t border-gray-100">
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                  Privacy Policy di Vercel <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Provider SMTP */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Provider di posta elettronica (SMTP)</h3>
                </div>
              </div>

              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Dati trattati:</strong> indirizzo email del destinatario, contenuto dell&apos;email (notifiche di servizio, link di condivisione, comunicazioni transazionali)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Finalità:</strong> invio di email transazionali e notifiche relative al servizio</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Base giuridica:</strong> esecuzione del contratto (art. 6.1.b GDPR)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600"><strong className="text-gray-900">Conservazione:</strong> log di invio conservati per 30 giorni</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Google reCAPTCHA v3 */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">Protezione antifrode</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-6">
            Google reCAPTCHA v3
          </h2>
          <p className="text-base text-gray-600 leading-relaxed mb-8">
            Utilizziamo Google reCAPTCHA v3 per proteggere la piattaforma da abusi automatizzati e attività fraudolente. reCAPTCHA v3 opera in modo invisibile, analizzando il comportamento di navigazione per distinguere gli utenti umani dai bot, senza richiedere alcuna interazione.
          </p>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pagine e azioni protette</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-600">Accesso (login)</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-600">Registrazione account</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-600">Modulo di contatto</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-600">Download dei file</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-600">Condivisione dei file</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 flex-shrink-0" />
              <span className="text-gray-600"><strong className="text-gray-900">Base giuridica:</strong> legittimo interesse nella prevenzione di frodi e abusi (art. 6.1.f GDPR)</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 flex-shrink-0" />
              <span className="text-gray-600">L&apos;utilizzo di reCAPTCHA è soggetto alla <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a> e ai <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Termini di Servizio</a> di Google</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analisi dei Download */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Download analytics</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-6">
            Analisi dei Download
          </h2>
          <p className="text-base text-gray-600 leading-relaxed mb-8">
            Per garantire la sicurezza della piattaforma e prevenire abusi, raccogliamo dati statistici anonimi relativi ai download effettuati.
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Dati raccolti per ciascun download</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Indirizzo IP anonimizzato:</strong> vengono conservati solo i primi 3 ottetti (es. 192.168.1.xxx)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Browser:</strong> tipo e versione del browser utilizzato</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Sistema operativo:</strong> tipo e versione del sistema operativo</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Tipo di dispositivo:</strong> desktop, tablet o mobile</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Paese:</strong> determinato tramite geolocalizzazione dell&apos;IP</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
              <span className="text-gray-600"><strong className="text-gray-900">Finalità:</strong> monitoraggio della sicurezza e prevenzione di abusi</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
              <span className="text-gray-600"><strong className="text-gray-900">Base giuridica:</strong> legittimo interesse (art. 6.1.f GDPR)</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
              <span className="text-gray-600"><strong className="text-gray-900">Conservazione:</strong> 12 mesi dalla data di raccolta</span>
            </div>
          </div>
        </div>
      </div>

      {/* Come Utilizziamo i Tuoi Dati */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Utilizzo dati</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-10">
            Come Utilizziamo i Tuoi Dati
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-2 h-2 rounded-full bg-blue-500 mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Fornitura del Servizio</h4>
              <p className="text-gray-600">Gestione dell&apos;account e delle funzionalità di condivisione file</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Sicurezza</h4>
              <p className="text-gray-600">Prevenzione di frodi e protezione dell&apos;account</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-2 h-2 rounded-full bg-purple-500 mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Miglioramento</h4>
              <p className="text-gray-600">Analisi per migliorare le prestazioni del servizio</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-2 h-2 rounded-full bg-orange-500 mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Comunicazione</h4>
              <p className="text-gray-600">Invio di aggiornamenti importanti sul servizio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Consenso Cookie */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-pink-600 uppercase tracking-wider">Cookie</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-6">
            Meccanismo di Consenso Cookie
          </h2>
          <p className="text-base text-gray-600 leading-relaxed mb-8">
            In conformità con il Regolamento ePrivacy e il GDPR, il nostro sito utilizza un sistema di gestione del consenso per i cookie. I cookie non essenziali vengono caricati esclusivamente dopo aver ottenuto il tuo esplicito consenso.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Cookie essenziali</h4>
              <p className="text-gray-600 mb-4">Sempre attivi, necessari per il funzionamento della piattaforma:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Sessione e autenticazione</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Preferenze di consenso</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Sicurezza (CSRF, reCAPTCHA)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Cookie non essenziali</h4>
              <p className="text-gray-600 mb-4">Attivati solo dopo il tuo consenso esplicito:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Analytics (Google Analytics)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Marketing (Google AdSense)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">
                Puoi modificare le tue preferenze sui cookie in qualsiasi momento visitando la pagina <Link href="/cookie" className="text-purple-600 hover:underline">Cookie Policy</Link> o utilizzando il pulsante di gestione cookie presente nel footer del sito. La revoca del consenso non pregiudica la liceità del trattamento effettuato prima della revoca.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sicurezza dei Dati */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Protezione</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-10">
            Sicurezza dei Dati
          </h2>

          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 sm:p-10 text-white mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Crittografia Client-Side AES-256-GCM</h3>
              </div>
              <p className="text-white/85 text-base leading-relaxed mb-4">
                Tutti i file caricati sono protetti con crittografia AES-256-GCM, lo stesso standard utilizzato dalle istituzioni bancarie e governative. Le chiavi di crittografia vengono generate direttamente nel browser dell&apos;utente, garantendo che i file siano crittografati prima di lasciare il dispositivo.
              </p>
              <p className="text-white/85 text-base leading-relaxed">
                <strong>FlyFile non ha accesso al contenuto dei file crittografati.</strong> Poiché la crittografia avviene lato client e le chiavi non vengono mai trasmesse ai nostri server, neppure il nostro personale può decifrare i file archiviati.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h4 className="text-lg font-bold text-gray-900 mb-5">Misure di Sicurezza Tecniche</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Crittografia AES-256-GCM lato client per tutti i file</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Chiavi di crittografia generate nel browser dell&apos;utente</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Connessioni SSL/TLS per il trasferimento dati</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Autenticazione a due fattori disponibile</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Monitoraggio continuo della sicurezza</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h4 className="text-lg font-bold text-gray-900 mb-5">Misure Organizzative</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Accesso limitato ai dati del personale</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Formazione regolare sulla sicurezza</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Audit di sicurezza periodici</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Politiche rigorose di gestione dati</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Trasferimento Internazionale dei Dati */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-cyan-600 uppercase tracking-wider">Trasferimenti internazionali</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-6">
            Trasferimento Internazionale dei Dati
          </h2>
          <p className="text-base text-gray-600 leading-relaxed mb-8">
            Alcuni dei nostri fornitori di servizi hanno sede negli Stati Uniti d&apos;America. Pertanto, i tuoi dati personali potrebbero essere trasferiti e trattati al di fuori dello Spazio Economico Europeo (SEE). In tali casi, adottiamo le seguenti garanzie per la protezione dei tuoi dati:
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Fornitori con sede negli USA</h3>
                <p className="text-sm text-gray-500">Google LLC, Stripe Inc., Vercel Inc., Cloudflare Inc.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">EU-US Data Privacy Framework:</strong> i trasferimenti verso fornitori certificati sono coperti dalla decisione di adeguatezza della Commissione Europea relativa al Data Privacy Framework UE-USA</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Clausole Contrattuali Standard (SCC):</strong> in conformità con l&apos;art. 46.2.c del GDPR, abbiamo sottoscritto le Clausole Contrattuali Standard approvate dalla Commissione Europea con i nostri fornitori</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Misure supplementari:</strong> ove necessario, adottiamo misure tecniche e organizzative supplementari, tra cui la crittografia dei dati in transito e a riposo, la pseudonimizzazione e la minimizzazione dei dati trasferiti</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Puoi richiedere una copia delle Clausole Contrattuali Standard applicabili contattandoci all&apos;indirizzo <a href="mailto:privacy@flyfile.it" className="text-blue-600 hover:underline">privacy@flyfile.it</a>.
          </p>
        </div>
      </div>

      {/* I Tuoi Diritti (GDPR) */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">I tuoi diritti</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-10">
            I Tuoi Diritti (GDPR)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-6 py-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Diritto di Accesso</h4>
              <p className="text-gray-600">Puoi richiedere una copia di tutti i dati personali che abbiamo su di te</p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6 py-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Diritto di Rettifica</h4>
              <p className="text-gray-600">Puoi correggere informazioni inesatte o incomplete</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-6 py-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Diritto alla Cancellazione</h4>
              <p className="text-gray-600">Puoi richiedere la rimozione dei tuoi dati personali</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-6 py-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Diritto alla Portabilità</h4>
              <p className="text-gray-600">Puoi esportare i tuoi dati in un formato leggibile</p>
            </div>

            <div className="border-l-4 border-red-500 pl-6 py-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Diritto di Opposizione</h4>
              <p className="text-gray-600">Puoi opporti al trattamento dei tuoi dati per finalità specifiche</p>
            </div>

            <div className="border-l-4 border-indigo-500 pl-6 py-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Diritto di Limitazione</h4>
              <p className="text-gray-600">Puoi richiedere di limitare il trattamento dei tuoi dati</p>
            </div>
          </div>
        </div>
      </div>

      {/* Diritto di Reclamo */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-red-600 uppercase tracking-wider">Autorità di controllo</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-6">
            Diritto di Reclamo
          </h2>
          <p className="text-base text-gray-600 leading-relaxed mb-8">
            Qualora ritenessi che il trattamento dei tuoi dati personali avvenga in violazione del GDPR, hai il diritto di proporre reclamo all&apos;autorità di controllo competente, fatti salvi eventuali altri ricorsi amministrativi o giurisdizionali.
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Garante per la Protezione dei Dati Personali</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Indirizzo:</strong> Piazza Venezia, 11 - 00187 Roma (RM), Italia</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Sito web:</strong> <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.garanteprivacy.it</a></span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Email:</strong> <a href="mailto:protocollo@gpdp.it" className="text-blue-600 hover:underline">protocollo@gpdp.it</a></span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">PEC:</strong> <a href="mailto:protocollo@pec.gpdp.it" className="text-blue-600 hover:underline">protocollo@pec.gpdp.it</a></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Conservazione dei Dati */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Conservazione</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-10">
            Conservazione dei Dati
          </h2>

          <div className="space-y-0 divide-y divide-gray-100">
            <div className="flex items-start gap-5 py-6 first:pt-0">
              <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Account e profili utente</h4>
                <p className="text-gray-600">Conservati fino alla cancellazione dell&apos;account da parte dell&apos;utente. Dopo la richiesta di cancellazione, tutti i dati vengono eliminati entro 30 giorni</p>
              </div>
            </div>

            <div className="flex items-start gap-5 py-6">
              <div className="w-3 h-3 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">File di trasferimento</h4>
                <p className="text-gray-600">Conservati secondo la durata configurata dall&apos;utente (da 3 a 365 giorni in base al piano di abbonamento), poi eliminati automaticamente</p>
              </div>
            </div>

            <div className="flex items-start gap-5 py-6">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Log di Firebase Authentication</h4>
                <p className="text-gray-600">Gestiti da Google secondo le proprie politiche di conservazione dei dati</p>
              </div>
            </div>

            <div className="flex items-start gap-5 py-6">
              <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Dati delle transazioni (Stripe)</h4>
                <p className="text-gray-600">Conservati per 7 anni come previsto dalla normativa fiscale italiana vigente (art. 2220 c.c. e normativa tributaria)</p>
              </div>
            </div>

            <div className="flex items-start gap-5 py-6">
              <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Analisi dei download</h4>
                <p className="text-gray-600">Dati anonimizzati conservati per 12 mesi dalla data di raccolta</p>
              </div>
            </div>

            <div className="flex items-start gap-5 py-6">
              <div className="w-3 h-3 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Log di invio email</h4>
                <p className="text-gray-600">Conservati per 30 giorni dalla data di invio</p>
              </div>
            </div>

            <div className="flex items-start gap-5 py-6 last:pb-0">
              <div className="w-3 h-3 rounded-full bg-pink-500 mt-1.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Registrazioni del consenso cookie</h4>
                <p className="text-gray-600">Conservate per 1 anno dalla data di espressione del consenso, come richiesto per dimostrare la conformità normativa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contattaci */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Contatti</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-6">
            {t('contactTitle')}
          </h2>

          <p className="text-base text-gray-600 leading-relaxed mb-10">
            Per qualsiasi domanda riguardo questa Privacy Policy o per esercitare i tuoi diritti, puoi contattarci:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('dpo')}</h4>
                  <a href="mailto:privacy@flyfile.it" className="text-purple-600 hover:underline">privacy@flyfile.it</a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('generalSupport')}</h4>
                  <a href="mailto:support@flyfile.it" className="text-blue-600 hover:underline">support@flyfile.it</a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
            <p className="text-sm text-gray-700">
              <strong>Nota:</strong> {t('gdprNote')}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
