'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { Check, Zap, HelpCircle, Mail, ArrowRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

// Plan data with descriptions
const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Per iniziare con condivisioni basilari',
    priceMonthly: 0,
    priceAnnual: 0,
    iconColor: 'green',
    features: [
      'Condividi e ricevi fino a 5GB/mese',
      '10 trasferimenti al mese',
      'Conservazione 5 giorni',
      'Crittografia AES-256',
      'Dimensione file illimitata',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Per professionisti e piccoli team',
    priceMonthly: 600,
    priceAnnual: 6000,
    stripePriceIdMonthly: 'price_1RiiBLRvnkGxlG3gaHbNQnvd',
    stripePriceIdAnnual: 'price_1SFgByRvnkGxlG3got46mSF5',
    iconColor: 'blue',
    features: [
      'Condividi e ricevi fino a 300GB/mese',
      '15 trasferimenti al mese',
      'Conservazione 7 giorni',
      'Dashboard avanzata',
      'Dimensione file illimitata',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Per team e agenzie creative',
    priceMonthly: 1200,
    priceAnnual: 12000,
    stripePriceIdMonthly: 'price_1RYtiARvnkGxlG3gZUW7Kb4v',
    stripePriceIdAnnual: 'price_1SFgD4RvnkGxlG3gEnyvOLNr',
    iconColor: 'purple',
    popular: true,
    features: [
      'Condividi e ricevi fino a 500GB/mese',
      '30 trasferimenti al mese',
      'Conservazione 30 giorni',
      'Protezione password',
      'UI personalizzabile',
      'Dimensione file illimitata',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'Per organizzazioni e grandi team',
    priceMonthly: 2000,
    priceAnnual: 20000,
    stripePriceIdMonthly: 'price_1RYtipRvnkGxlG3gXhaIzIAl',
    stripePriceIdAnnual: 'price_1SFgDkRvnkGxlG3gc3QzdSoF',
    iconColor: 'orange',
    features: [
      'Condividi e ricevi illimitato',
      'Trasferimenti illimitati',
      'Conservazione 1 anno',
      'Gestione team avanzata',
      '3 membri inclusi',
      'Support prioritario',
      'Dimensione file illimitata',
    ],
  },
};

const FAQ_ITEMS = [
  {
    question: 'Come funziona la crittografia?',
    answer: 'Utilizziamo la crittografia AES-256 end-to-end. I tuoi file vengono crittografati sul nostro server prima della memorizzazione e decrittografati solo al momento del download.',
  },
  {
    question: 'Posso cambiare piano in qualsiasi momento?',
    answer: "Sì, puoi effettuare l'upgrade o il downgrade del tuo piano in qualsiasi momento. Le modifiche si applicheranno al prossimo ciclo di fatturazione.",
  },
  {
    question: 'Cosa succede ai miei file se cancello l\'account?',
    answer: "I tuoi file vengono eliminati definitivamente dai nostri server entro 7 giorni dalla cancellazione dell'account, in conformità con le nostre politiche di privacy.",
  },
  {
    question: 'Offrite sconti per il pagamento annuale?',
    answer: 'Sì, pagando annualmente ottieni uno sconto del 20% su tutti i piani. Ad esempio, il piano Pro costa €120/anno invece di €144.',
  },
];

// Helper function to get icon color classes
const getIconColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    green: { bg: 'bg-green-500/20', text: 'text-green-400' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  };
  return colors[color] || colors.green;
};

// Helper function to get button gradient classes
const getButtonGradient = (planId: string) => {
  const gradients: Record<string, string> = {
    starter: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    pro: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
    business: 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
  };
  return gradients[planId] || 'bg-gradient-to-r from-blue-500 to-blue-600';
};

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useAuth();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      window.location.href = '/register';
      return;
    }

    try {
      const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
      const priceId = isAnnual
        ? (plan as { stripePriceIdAnnual?: string }).stripePriceIdAnnual
        : (plan as { stripePriceIdMonthly?: string }).stripePriceIdMonthly;

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          priceId,
          billingCycle: isAnnual ? 'annual' : 'monthly',
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section with Glass Morphism */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden -mt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(120, 200, 255, 0.3) 0%, transparent 50%)
            `
          }}
        ></div>

        <div className="relative z-10 flex items-center min-h-screen py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {/* Header Section */}
            <div className="text-center mb-16 pt-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8">
                <Zap className="w-5 h-5 text-cyan-400 mr-2" />
                <span className="text-white/90 text-sm font-medium">Piani di Abbonamento</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Scegli il piano
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  perfetto per te
                </span>
              </h1>

              <p className="text-xl text-blue-100/80 max-w-3xl mx-auto mb-8">
                Tutti i piani includono crittografia AES-256 end-to-end e condivisione sicura.
                Inizia gratis e aggiorna quando necessario.
              </p>

              {/* Monthly/Annual Toggle */}
              <div className="flex items-center justify-center mb-8">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 flex items-center">
                  <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      !isAnnual ? 'bg-white/20 text-white shadow-lg' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Mensile
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 relative ${
                      isAnnual ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Annuale
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      -20%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {Object.values(PRICING_PLANS).map((plan) => {
                const colorClasses = getIconColorClasses(plan.iconColor);
                const isPopular = 'popular' in plan && plan.popular;

                return (
                  <div
                    key={plan.id}
                    className={`backdrop-blur-lg rounded-3xl p-8 transition-all duration-300 transform hover:scale-105 flex flex-col h-full ${
                      isPopular
                        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 hover:from-purple-500/30 hover:to-pink-500/30 relative'
                        : 'bg-white/10 border border-white/20 hover:bg-white/15'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-semibold">
                          Più Popolare
                        </div>
                      </div>
                    )}

                    <div className={`mb-6 ${isPopular ? 'mt-4' : ''}`}>
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-blue-100/70 text-sm">{plan.description}</p>
                    </div>

                    <div className="mb-8">
                      <span className="text-4xl font-bold text-white">
                        €{((isAnnual ? plan.priceAnnual : plan.priceMonthly) / 100).toFixed(0)}
                      </span>
                      <span className="text-blue-100/70">/{isAnnual ? 'anno' : 'mese'}</span>
                      {isAnnual && plan.priceMonthly > 0 && (
                        <div className="text-green-400 text-sm mt-1">
                          Risparmi €{((plan.priceMonthly * 12 - plan.priceAnnual) / 100).toFixed(0)} all&apos;anno
                        </div>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-blue-100/90">
                          <div className={`w-5 h-5 ${colorClasses.bg} rounded-full flex items-center justify-center mr-3`}>
                            <Check className={`w-3 h-3 ${colorClasses.text}`} />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto">
                      {plan.id === 'free' ? (
                        <Link href="/register">
                          <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/20">
                            Inizia Gratis
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          onClick={() => handleSubscribe(plan.id)}
                          className={`w-full ${getButtonGradient(plan.id)} text-white shadow-lg`}
                        >
                          Scegli {plan.name}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Features Comparison */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Tutti i piani includono</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white/80">
                <div className="flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-sm">Crittografia AES-256</span>
                </div>
                <div className="flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-sm">Supporto 24/7</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="w-5 h-5 text-purple-400 mr-2" />
                  <span className="text-sm">99.9% Uptime SLA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section with Glass Morphism */}
      <div className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)
            `
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/40 rounded-full mb-6">
              <HelpCircle className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">FAQ</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Domande{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                frequenti
              </span>
            </h2>
          </div>

          {/* FAQ Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {FAQ_ITEMS.map((item, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="bg-white/60 backdrop-blur-lg border border-white/40 rounded-3xl p-8 lg:p-12 shadow-2xl max-w-4xl mx-auto">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Hai ancora domande?
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Il nostro team di supporto è qui per aiutarti. Contattaci per qualsiasi chiarimento sui nostri piani.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Contatta il Supporto
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/70 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-white transition-all duration-300"
                >
                  Inizia Gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
