import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Termini di Servizio - FlyFile',
  description:
    'Termini e condizioni di utilizzo del servizio FlyFile. Leggi attentamente prima di utilizzare il nostro servizio di condivisione file.',
};

export default function TermsPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden -mt-16 pt-16">
        {/* Decorative blurred circles */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 py-24 sm:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 bg-white/20 text-white text-sm font-medium rounded-full mb-8">
              Termini di Servizio
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Termini e Condizioni
              <br />
              d&apos;uso del servizio
            </h1>

            <p className="text-lg text-white/80">
              Ultimo aggiornamento: Gennaio 2026
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section 1 */}
          <section className="border-b border-gray-200 pb-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              1. Accettazione dei Termini
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Utilizzando FlyFile, accetti di essere vincolato da questi Termini
              di Servizio. Se non accetti questi termini, non utilizzare il
              servizio. Ci riserviamo il diritto di modificare questi termini in
              qualsiasi momento, e tali modifiche saranno effettive
              immediatamente dopo la pubblicazione.
            </p>
          </section>

          {/* Section 2 */}
          <section className="border-b border-gray-200 pb-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              2. Descrizione del Servizio
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              FlyFile è un servizio di condivisione file che permette agli utenti
              di caricare, archiviare temporaneamente e condividere file con
              altri utenti. Il servizio include:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Upload e download di file</li>
              <li>Crittografia end-to-end dei file</li>
              <li>Link di condivisione con scadenza automatica</li>
              <li>Protezione opzionale con password</li>
              <li>Statistiche di download</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="border-b border-gray-200 pb-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              3. Obblighi dell&apos;Utente
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              L&apos;utente si impegna a:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Fornire informazioni accurate durante la registrazione</li>
              <li>Mantenere la sicurezza delle proprie credenziali</li>
              <li>Non utilizzare il servizio per scopi illegali</li>
              <li>Non caricare contenuti che violano diritti di terzi</li>
              <li>
                Non tentare di compromettere la sicurezza del servizio
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="border-b border-gray-200 pb-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              4. Contenuti Vietati
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              È severamente vietato caricare:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Materiale illegale o che viola le leggi vigenti</li>
              <li>
                Contenuti che violano diritti d&apos;autore o proprietà
                intellettuale
              </li>
              <li>Malware, virus o software dannoso</li>
              <li>Contenuti diffamatori, offensivi o discriminatori</li>
              <li>
                Materiale pornografico o sessualmente esplicito non consensuale
              </li>
              <li>
                Contenuti che promuovono violenza o attività illegali
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="border-b border-gray-200 pb-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              5. Abbonamenti e Pagamenti
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              FlyFile offre piani gratuiti e a pagamento. Per i piani a
              pagamento:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>I pagamenti vengono elaborati tramite Stripe</li>
              <li>Gli abbonamenti si rinnovano automaticamente</li>
              <li>È possibile cancellare in qualsiasi momento</li>
              <li>I rimborsi sono a discrezione di FlyFile</li>
              <li>
                I prezzi possono essere modificati con preavviso di 30 giorni
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="border-b border-gray-200 pb-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              6. Conservazione dei File
            </h2>
            <p className="text-gray-600 leading-relaxed">
              I file caricati vengono conservati per il periodo specificato
              durante l&apos;upload. Dopo la scadenza, i file vengono eliminati
              automaticamente e permanentemente. FlyFile non è responsabile per
              la perdita di dati dovuta alla scadenza dei file. Si consiglia di
              mantenere sempre copie di backup dei propri file importanti.
            </p>
          </section>

          {/* Section 7 */}
          <section className="border-b border-gray-200 pb-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              7. Limitazione di Responsabilità
            </h2>
            <p className="text-gray-600 leading-relaxed">
              FlyFile viene fornito &quot;così com&apos;è&quot; senza garanzie
              di alcun tipo. Non siamo responsabili per danni diretti, indiretti,
              incidentali o consequenziali derivanti dall&apos;uso o
              dall&apos;impossibilità di utilizzare il servizio. La nostra
              responsabilità massima è limitata all&apos;importo pagato
              dall&apos;utente negli ultimi 12 mesi.
            </p>
          </section>

          {/* Section 8 */}
          <section className="border-b border-gray-200 pb-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              8. Terminazione
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Ci riserviamo il diritto di sospendere o terminare l&apos;accesso
              al servizio in qualsiasi momento, con o senza preavviso, per
              violazione di questi termini o per qualsiasi altro motivo. In caso
              di terminazione, l&apos;utente perde l&apos;accesso ai file
              caricati.
            </p>
          </section>

          {/* Section 9 */}
          <section className="border-b border-gray-200 pb-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              9. Legge Applicabile
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Questi Termini di Servizio sono regolati dalle leggi italiane.
              Qualsiasi controversia sarà di competenza esclusiva del Foro di
              Milano, Italia.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              10. Contatti
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Per domande riguardanti questi Termini di Servizio, contattaci a:
            </p>
            <p className="text-gray-600 mt-4">
              <strong>Email:</strong>{' '}
              <a
                href="mailto:legal@flyfile.it"
                className="text-blue-600 hover:text-blue-800"
              >
                legal@flyfile.it
              </a>
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
