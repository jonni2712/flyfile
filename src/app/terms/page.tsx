import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termini di Servizio - FlyFile',
  description: 'Termini e condizioni di utilizzo del servizio FlyFile',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Termini di Servizio</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          Ultimo aggiornamento: Dicembre 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Accettazione dei Termini</h2>
          <p className="text-gray-600">
            Utilizzando FlyFile, accetti di essere vincolato da questi Termini di Servizio.
            Se non accetti questi termini, non utilizzare il servizio.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descrizione del Servizio</h2>
          <p className="text-gray-600">
            FlyFile è una piattaforma di condivisione file sicura che permette agli utenti di
            caricare, archiviare e condividere file con crittografia end-to-end.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Utente</h2>
          <p className="text-gray-600">
            Sei responsabile di mantenere la sicurezza del tuo account e di tutte le attività
            che si verificano sotto il tuo account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Uso Accettabile</h2>
          <p className="text-gray-600">
            Non puoi utilizzare FlyFile per scopi illegali o per violare diritti di terzi.
            È vietato caricare contenuti illegali, malware o materiale che viola i diritti d&apos;autore.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Privacy e Sicurezza</h2>
          <p className="text-gray-600">
            I tuoi file sono protetti con crittografia AES-256. Consulta la nostra Privacy Policy
            per maggiori informazioni su come trattiamo i tuoi dati.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contatti</h2>
          <p className="text-gray-600">
            Per domande sui Termini di Servizio, contattaci a: support@flyfile.it
          </p>
        </section>
      </div>
    </div>
  );
}
