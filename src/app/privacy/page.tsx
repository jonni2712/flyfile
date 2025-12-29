import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - FlyFile',
  description: 'Informativa sulla privacy e trattamento dei dati di FlyFile',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          Ultimo aggiornamento: Dicembre 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Raccolta dei Dati</h2>
          <p className="text-gray-600">
            Raccogliamo solo i dati necessari per fornire il servizio: email, nome e informazioni
            di pagamento per gli abbonamenti premium.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Utilizzo dei Dati</h2>
          <p className="text-gray-600">
            I tuoi dati vengono utilizzati esclusivamente per fornire e migliorare il servizio FlyFile.
            Non vendiamo né condividiamo i tuoi dati con terze parti per scopi di marketing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Sicurezza dei File</h2>
          <p className="text-gray-600">
            Tutti i file caricati sono protetti con crittografia AES-256 end-to-end.
            Solo tu e i destinatari autorizzati possono accedere ai contenuti.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Conservazione dei Dati</h2>
          <p className="text-gray-600">
            I file vengono eliminati automaticamente dopo il periodo di conservazione previsto dal tuo piano.
            I dati dell&apos;account vengono conservati fino alla cancellazione dell&apos;account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. GDPR</h2>
          <p className="text-gray-600">
            FlyFile è conforme al GDPR. Hai il diritto di accedere, modificare o cancellare i tuoi dati
            in qualsiasi momento.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contatti</h2>
          <p className="text-gray-600">
            Per domande sulla privacy, contattaci a: privacy@flyfile.it
          </p>
        </section>
      </div>
    </div>
  );
}
