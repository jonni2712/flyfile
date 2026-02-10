'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PRICING_PLANS, COMPARISON_SECTIONS, FAQ_ITEMS } from '@/data/pricing';
import { PLANS } from '@/types';

export default function PricingContent() {
  const { user, userProfile } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubscribe = async (plan: typeof PRICING_PLANS[number]) => {
    if (plan.id === 'free') {
      window.location.href = '/registrati';
      return;
    }

    if (!user) {
      window.location.href = '/registrati';
      return;
    }

    try {
      const priceId = isAnnual ? plan.stripePriceIdAnnual : plan.stripePriceIdMonthly;
      const token = await user.getIdToken();

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': 'client',
        },
        body: JSON.stringify({
          planId: plan.id,
          priceId,
          billingCycle: isAnnual ? 'annual' : 'monthly',
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    }
  };

  return (
    <>
      {/* Hero */}
      <div className="relative -mt-16 pt-16 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Piani e prezzi
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Che tu stia inviando grandi file per lavoro o per condividere i tuoi progetti creativi, abbiamo il piano giusto per te.
          </p>

          {/* Monthly/Annual Toggle */}
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !isAnnual ? 'bg-white text-gray-900 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              Una volta al mese
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                isAnnual ? 'bg-white text-gray-900 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              Annuale
              <span className="ml-1.5 text-xs text-green-500 font-semibold">-20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRICING_PLANS.map((plan) => {
            const isCurrentPlan = user && (userProfile?.plan || 'free') === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 flex flex-col bg-white shadow-lg transition-shadow hover:shadow-xl ${
                  isCurrentPlan
                    ? 'border-green-500'
                    : plan.popular
                      ? 'border-blue-500'
                      : plan.borderColor
                        ? `${plan.borderColor} border-opacity-30`
                        : 'border-gray-200'
                }`}
              >
                {/* Badge */}
                {isCurrentPlan ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                      Piano attuale
                    </span>
                  </div>
                ) : plan.popular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Più popolare
                    </span>
                  </div>
                ) : plan.badge ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                ) : null}

                <div className={isCurrentPlan || plan.popular || plan.badge ? 'mt-2' : ''}>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-5">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.priceMonthly === 0
                      ? '0'
                      : `${((isAnnual ? plan.priceAnnual : plan.priceMonthly) / 100).toFixed(0)}`
                    } &euro;
                  </span>
                  {plan.priceMonthly > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Al mese, fatturato {isAnnual ? 'annualmente' : 'mensilmente'}.
                    </p>
                  )}
                  {plan.priceMonthly === 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Goditi FlyFile gratuitamente
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => !isCurrentPlan && handleSubscribe(plan)}
                  disabled={!!isCurrentPlan}
                  className={`w-full py-2.5 rounded-full text-sm font-semibold transition-colors ${
                    isCurrentPlan
                      ? 'bg-green-500 text-white cursor-default'
                      : plan.popular
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : plan.id === 'free'
                          ? 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                          : 'border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  {isCurrentPlan ? 'Piano attivo' : plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Scegli il piano che fa per te
            </h2>
            <p className="text-gray-500 text-base">
              Confronta tutte le funzionalità dei nostri piani
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
            {/* Column headers */}
            <div className="grid grid-cols-5 bg-gray-50 border-b border-gray-200">
              <div className="py-4 px-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Funzionalità
              </div>
              {['Free', 'Starter', 'Pro', 'Business'].map((name, i) => (
                <div
                  key={name}
                  className={`py-4 px-3 text-center text-sm font-bold ${
                    i === 2 ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  {name}
                  {i === 2 && (
                    <span className="block text-[10px] font-semibold text-blue-500 uppercase tracking-wider mt-0.5">
                      Popolare
                    </span>
                  )}
                </div>
              ))}
            </div>

            {COMPARISON_SECTIONS.map((section, sIdx) => (
              <div key={sIdx}>
                {/* Section header */}
                <div className="grid grid-cols-5 bg-white border-b border-gray-200">
                  <div className="col-span-5 px-5 py-4">
                    <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        sIdx === 0 ? 'bg-blue-500' : sIdx === 1 ? 'bg-purple-500' : 'bg-orange-500'
                      }`} />
                      {section.title}
                    </h4>
                  </div>
                </div>

                {section.features.map((row, rIdx) => (
                  <div
                    key={rIdx}
                    className="grid grid-cols-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="py-3.5 px-5 text-sm text-gray-700 flex items-center">
                      {row[0] as string}
                    </div>
                    {([row[1], row[2], row[3], row[4]] as (boolean | string)[]).map((val, cIdx) => (
                      <div
                        key={cIdx}
                        className={`py-3.5 px-3 text-center text-sm flex items-center justify-center ${
                          cIdx === 2 ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        {typeof val === 'boolean' ? (
                          val ? (
                            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-blue-600" />
                            </span>
                          ) : (
                            <span className="text-gray-300">&mdash;</span>
                          )
                        ) : (
                          <span className="font-semibold text-gray-900">{val}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Domande frequenti
            </h2>
            <p className="text-gray-500 text-base">
              Tutto quello che devi sapere sui nostri piani e servizi
            </p>
          </div>

          <div className="space-y-0">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="border-b border-gray-200 first:border-t"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-6 group-hover:text-blue-600 transition-colors">
                    {item.question}
                  </span>
                  <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    openFaq === idx
                      ? 'border-blue-500 bg-blue-500 text-white rotate-0'
                      : 'border-gray-300 text-gray-400 group-hover:border-blue-400 group-hover:text-blue-400'
                  }`}>
                    <span className="text-lg font-light leading-none">
                      {openFaq === idx ? '\u2212' : '+'}
                    </span>
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    openFaq === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 pr-16 text-base text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto per iniziare?
          </h2>
          <p className="text-gray-400 mb-8">
            Crea il tuo account gratuito e inizia a condividere file in modo sicuro.
          </p>
          <Link
            href="/registrati"
            className="inline-block px-8 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors"
          >
            Crea un account gratis
          </Link>
        </div>
      </div>
    </>
  );
}
