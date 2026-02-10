// Pricing data shared between Navbar slide panel and /prezzi page

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
  features: string[];
  cta: string;
  ctaLink?: string;
  popular?: boolean;
  badge?: string;
  borderColor?: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Per iniziare con condivisioni basilari',
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      'Condividi e ricevi fino a 5GB/mese',
      '10 trasferimenti al mese',
      'Conservazione 5 giorni',
      'Crittografia AES-256',
      'Dimensione file illimitata',
    ],
    cta: 'Crea un account',
    ctaLink: '/registrati',
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Per professionisti e piccoli team',
    priceMonthly: 600,
    priceAnnual: 6000,
    stripePriceIdMonthly: 'price_1RiiBLRvnkGxlG3gaHbNQnvd',
    stripePriceIdAnnual: 'price_1SFgByRvnkGxlG3got46mSF5',
    features: [
      'Condividi e ricevi fino a 300GB/mese',
      '15 trasferimenti al mese',
      'Conservazione 7 giorni',
      'Dashboard avanzata',
      'Dimensione file illimitata',
    ],
    cta: 'Continua',
    borderColor: 'border-blue-400',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Per team e agenzie creative',
    priceMonthly: 1200,
    priceAnnual: 12000,
    stripePriceIdMonthly: 'price_1RYtiARvnkGxlG3gZUW7Kb4v',
    stripePriceIdAnnual: 'price_1SFgD4RvnkGxlG3gEnyvOLNr',
    popular: true,
    features: [
      'Condividi e ricevi fino a 500GB/mese',
      '30 trasferimenti al mese',
      'Conservazione 30 giorni',
      'Protezione password',
      'UI personalizzabile',
      'Dimensione file illimitata',
    ],
    cta: 'Continua',
    borderColor: 'border-purple-400',
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Per organizzazioni e grandi team',
    priceMonthly: 2000,
    priceAnnual: 20000,
    stripePriceIdMonthly: 'price_1RYtipRvnkGxlG3gXhaIzIAl',
    stripePriceIdAnnual: 'price_1SFgDkRvnkGxlG3gc3QzdSoF',
    badge: 'Migliore per le aziende',
    features: [
      'Condividi e ricevi illimitato',
      'Trasferimenti illimitati',
      'Conservazione 1 anno',
      'Gestione team avanzata',
      '3 membri inclusi',
      'Support prioritario',
      'Dimensione file illimitata',
    ],
    cta: 'Contattaci',
    borderColor: 'border-orange-400',
  },
];

export interface ComparisonSection {
  title: string;
  features: (string | boolean)[][];
}

// Feature comparison table data: [feature, free, starter, pro, business]
// true = included, false = not included, string = custom text
export const COMPARISON_SECTIONS: ComparisonSection[] = [
  {
    title: 'Trasferimenti',
    features: [
      ['Dimensione file illimitata', true, true, true, true],
      ['Storage mensile', '5 GB', '300 GB', '500 GB', 'Illimitato'],
      ['Trasferimenti al mese', '10', '15', '30', 'Illimitati'],
      ['Conservazione file', '5 giorni', '7 giorni', '30 giorni', '1 anno'],
      ['Crittografia AES-256', true, true, true, true],
    ],
  },
  {
    title: 'Personalizzazione',
    features: [
      ['Pagina di download personalizzata', false, false, true, true],
      ['Email personalizzate', false, false, true, true],
      ['Branding personalizzato', false, false, true, true],
    ],
  },
  {
    title: 'Team e gestione',
    features: [
      ['Dashboard avanzata', false, true, true, true],
      ['Gestione team', false, false, false, true],
      ['Membri inclusi', '1', '1', '1', '3'],
      ['Protezione password', false, false, true, true],
      ['Supporto prioritario', false, false, false, true],
    ],
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Cosa succede dopo che mi iscrivo e pago?',
    answer: 'Dopo il pagamento, il tuo piano viene attivato immediatamente. Avrai accesso a tutte le funzionalità incluse nel piano scelto e potrai iniziare a inviare file subito.',
  },
  {
    question: 'I miei destinatari devono registrarsi?',
    answer: 'No, i destinatari non devono registrarsi per scaricare i file. Riceveranno un link di download via email o potrai condividere il link direttamente.',
  },
  {
    question: 'Posso ricevere trasferimenti più grandi da chiunque?',
    answer: 'Sì, chiunque può inviarti file tramite FlyFile. La dimensione massima del trasferimento dipende dal piano del mittente.',
  },
  {
    question: 'Come posso aggiungere (e rimuovere) membri del team?',
    answer: 'Con il piano Business puoi gestire i membri del team dalla dashboard. Vai su Team > Invita membro per aggiungere nuovi utenti, oppure rimuovili dalla lista membri.',
  },
  {
    question: 'Quali metodi di pagamento posso utilizzare?',
    answer: 'Accettiamo tutte le principali carte di credito e debito (Visa, Mastercard, American Express) tramite Stripe. Il pagamento è sicuro e crittografato.',
  },
  {
    question: 'Cosa succede se supero il mio limite di archiviazione?',
    answer: 'Se raggiungi il limite di storage del tuo piano, non potrai caricare nuovi file fino al rinnovo mensile o fino a quando non passi a un piano superiore.',
  },
  {
    question: 'Posso cambiare piano in qualsiasi momento?',
    answer: "Sì, puoi effettuare l'upgrade o il downgrade del tuo piano in qualsiasi momento. Le modifiche si applicheranno al prossimo ciclo di fatturazione.",
  },
  {
    question: 'Offrite sconti per il pagamento annuale?',
    answer: 'Sì, pagando annualmente ottieni uno sconto del 20% su tutti i piani.',
  },
];
