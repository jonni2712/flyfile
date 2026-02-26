'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { X, Check } from 'lucide-react';
import { PRICING_PLANS } from '@/data/pricing';
import SlidePanel from '@/components/SlidePanel';

interface PricingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingPanel({ isOpen, onClose }: PricingPanelProps) {
  const { user, userProfile } = useAuth();
  const tp = useTranslations('pricing');
  const tc = useTranslations('common');

  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const comparisonSections = useMemo(() => [
    {
      title: tp('comparison.transfers'),
      features: [
        [tp('comparison.unlimitedFileSize'), true, true, true, true],
        [tp('comparison.monthlyStorage'), tp('comparison.5gb'), tp('comparison.300gb'), tp('comparison.500gb'), tp('comparison.unlimited')],
        [tp('comparison.monthlyTransfers'), '10', '15', '30', tp('comparison.unlimitedPlural')],
        [tp('comparison.fileRetention'), tp('comparison.5days'), tp('comparison.7days'), tp('comparison.30days'), tp('comparison.1year')],
        [tp('comparison.aesEncryption'), true, true, true, true],
      ],
    },
    {
      title: tp('comparison.customization'),
      features: [
        [tp('comparison.customDownloadPage'), false, false, true, true],
        [tp('comparison.customEmails'), false, false, true, true],
        [tp('comparison.customBranding'), false, false, true, true],
      ],
    },
    {
      title: tp('comparison.teamManagement'),
      features: [
        [tp('comparison.advancedDashboard'), false, true, true, true],
        [tp('comparison.teamManagementFeature'), false, false, false, true],
        [tp('comparison.includedMembers'), '1', '1', '1', '3'],
        [tp('comparison.passwordProtection'), false, false, true, true],
        [tp('comparison.prioritySupport'), false, false, false, true],
      ],
    },
  ], [tp]);

  const faqItems = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    question: tp(`faq.items.${i}.question`),
    answer: tp(`faq.items.${i}.answer`),
  })), [tp]);

  const handleSubscribe = useCallback(async (plan: typeof PRICING_PLANS[number]) => {
    if (plan.id === 'free') {
      onClose();
      window.location.href = '/registrati';
      return;
    }

    if (!user) {
      onClose();
      window.location.href = '/registrati';
      return;
    }

    setCheckoutError(null);
    setCheckoutLoading(plan.id);

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
      } else {
        setCheckoutError(data.error || 'Checkout error');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      setCheckoutError('Connection error');
    } finally {
      setCheckoutLoading(null);
    }
  }, [user, isAnnual, onClose]);

  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} ariaLabel={tp('title')}>
        {/* Close button */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-6 py-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors min-h-[44px]"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">{tc('cta.close')}</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 pb-16">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {tp('title')}
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
              {tp('subtitle')}
            </p>

            {/* Monthly/Annual Toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                  !isAnnual ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:text-black'
                }`}
              >
                {tp('monthly')}
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                  isAnnual ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:text-black'
                }`}
              >
                {tp('annual')}
                <span className="ml-1.5 text-xs text-green-500 font-semibold">{tp('annualDiscount')}</span>
              </button>
            </div>
          </div>

          {/* Checkout Error */}
          {checkoutError && (
            <div className="max-w-5xl mx-auto mb-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
                {checkoutError}
              </div>
            </div>
          )}

          {/* Plan Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan) => {
              const isCurrentPlan = user && (userProfile?.plan || 'free') === plan.id;
              return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 flex flex-col transition-shadow hover:shadow-lg ${
                  isCurrentPlan
                    ? 'border-green-500 shadow-md'
                    : plan.popular
                      ? 'border-blue-500 shadow-md'
                      : plan.borderColor
                        ? `${plan.borderColor} border-opacity-30`
                        : 'border-gray-200'
                }`}
              >
                {/* Badge */}
                {isCurrentPlan ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                      {tp('currentPlan')}
                    </span>
                  </div>
                ) : plan.popular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {tp('mostPopular')}
                    </span>
                  </div>
                ) : plan.badge ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                      {tp(`plans.${plan.id}.badge`)}
                    </span>
                  </div>
                ) : null}

                <div className={isCurrentPlan || plan.popular || plan.badge ? 'mt-2' : ''}>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{tp(`plans.${plan.id}.name`)}</h3>
                  <p className="text-sm text-gray-500 mb-5">{tp(`plans.${plan.id}.description`)}</p>
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
                      {tp('perMonth', { billing: isAnnual ? tp('billedAnnually') : tp('billedMonthly') })}
                    </p>
                  )}
                  {plan.priceMonthly === 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {tp('freeForever')}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-grow">
                  {plan.features.map((_, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {tp(`plans.${plan.id}.features.${i}`)}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => !isCurrentPlan && handleSubscribe(plan)}
                  disabled={!!isCurrentPlan || checkoutLoading === plan.id}
                  className={`w-full py-2.5 rounded-full text-sm font-semibold transition-colors min-h-[44px] ${
                    isCurrentPlan
                      ? 'bg-green-500 text-white cursor-default'
                      : checkoutLoading === plan.id
                        ? 'bg-gray-300 text-gray-500 cursor-wait'
                        : plan.popular
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : plan.id === 'free'
                            ? 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                            : 'border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  {isCurrentPlan ? tp('activePlan') : checkoutLoading === plan.id ? tp('loading') : tp(`plans.${plan.id}.cta`)}
                </button>
              </div>
              );
            })}
          </div>

          {/* Feature Comparison Table — hidden on mobile */}
          <div className="hidden lg:block mt-20 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                {tp('chooseTitle')}
              </h3>
              <p className="text-gray-500 text-base">
                {tp('chooseSubtitle')}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 overflow-x-auto">
              <div className="min-w-[640px]">
              {/* Sticky column headers */}
              <div className="grid grid-cols-5 bg-gray-50 border-b border-gray-200">
                <div className="py-4 px-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {tp('featureLabel')}
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
                        {tp('popular')}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {comparisonSections.map((section, sIdx) => (
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
          <div className="mt-20 max-w-3xl mx-auto pb-12">
            <div className="text-center mb-10">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                {tp('faq.title')}
              </h3>
              <p className="text-gray-500 text-base">
                {tp('faq.subtitle')}
              </p>
            </div>

            <div className="space-y-0">
              {faqItems.map((item, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-200 first:border-t"
                >
                  <button
                    id={`faq-question-${idx}`}
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    aria-expanded={openFaq === idx}
                    aria-controls={`faq-answer-${idx}`}
                    className="w-full flex items-center justify-between py-6 text-left group min-h-[44px]"
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
                        {openFaq === idx ? '−' : '+'}
                      </span>
                    </span>
                  </button>
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    className={`grid transition-all duration-300 ease-in-out ${
                      openFaq === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                    aria-hidden={openFaq !== idx}
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
    </SlidePanel>
  );
}
