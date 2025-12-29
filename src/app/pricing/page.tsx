'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { Check, Zap } from 'lucide-react';
import { PLANS } from '@/types';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useAuth();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      window.location.href = '/register';
      return;
    }

    try {
      const plan = PLANS[planId];
      const priceId = isAnnual ? plan.stripePriceIdAnnual : plan.stripePriceIdMonthly;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8">
            <Zap className="w-5 h-5 text-cyan-400 mr-2" />
            <span className="text-white/90 text-sm font-medium">Piani di Abbonamento</span>
          </div>

          <h1 className="text-5xl font-bold text-white mb-6">
            Scegli il piano <span className="text-cyan-400">perfetto per te</span>
          </h1>

          <p className="text-xl text-blue-100/80 max-w-3xl mx-auto mb-8">
            Tutti i piani includono crittografia AES-256 end-to-end e condivisione sicura.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 flex items-center">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  !isAnnual ? 'bg-white/20 text-white shadow-lg' : 'text-white/70 hover:text-white'
                }`}
              >
                Mensile
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all relative ${
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.values(PLANS).map((plan) => (
            <div
              key={plan.id}
              className={`bg-white/10 backdrop-blur-lg border rounded-3xl p-8 transition-all duration-300 transform hover:scale-105 flex flex-col ${
                plan.id === 'pro' ? 'border-2 border-purple-400/50 relative' : 'border-white/20'
              }`}
            >
              {plan.id === 'pro' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-semibold">
                    Più Popolare
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
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
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-green-400" />
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
                    className={`w-full ${
                      plan.id === 'pro'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                        : plan.id === 'business'
                        ? 'bg-gradient-to-r from-orange-500 to-red-600'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}
                  >
                    Scegli {plan.name}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Tutti i piani includono</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white/80">
            <div className="flex items-center justify-center">
              <Check className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-sm">Crittografia AES-256</span>
            </div>
            <div className="flex items-center justify-center">
              <Check className="w-5 h-5 text-blue-400 mr-2" />
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
  );
}
