'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Shield, Users, Zap, Globe, Lock, ArrowRight, Mail, MapPin } from 'lucide-react';

export default function ChiSiamoClient() {
  const t = useTranslations('about');

  const VALUES = [
    {
      icon: Shield,
      titleKey: 'values.security.title' as const,
      descKey: 'values.security.description' as const,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      icon: Zap,
      titleKey: 'values.simplicity.title' as const,
      descKey: 'values.simplicity.description' as const,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    {
      icon: Users,
      titleKey: 'values.teams.title' as const,
      descKey: 'values.teams.description' as const,
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
    {
      icon: Globe,
      titleKey: 'values.privacy.title' as const,
      descKey: 'values.privacy.description' as const,
      color: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
  ];

  const STATS = [
    { value: '5 GB', label: t('stats.freeTransfers') },
    { value: 'AES-256', label: t('stats.e2eEncryption') },
    { value: '99.9%', label: t('stats.uptimeGuaranteed') },
    { value: '0', label: t('stats.dataSold') },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero — gradient background matching home page */}
      <div className="relative min-h-[85vh] flex items-center -mt-[4.75rem] pt-[4.75rem] overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Lock className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">{t('hero.badge')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            {t('hero.titleLine1')}{' '}
            <span className="block">{t('hero.titleLine2')}</span>
            <span className="block italic font-light">{t('hero.titleLine3')}</span>
          </h1>

          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all shadow-lg"
            >
              {t('hero.cta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission section */}
      <div className="bg-white py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">{t('mission.label')}</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-6 leading-tight">
              {t('mission.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('mission.subtitle')}
            </p>
          </div>

          {/* Two-column text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-base text-gray-600 leading-relaxed">
            <div>
              <p className="mb-4" dangerouslySetInnerHTML={{ __html: t.raw('mission.leftP1') }} />
              <p dangerouslySetInnerHTML={{ __html: t.raw('mission.leftP2') }} />
            </div>
            <div>
              <p className="mb-4" dangerouslySetInnerHTML={{ __html: t.raw('mission.rightP1') }} />
              <p dangerouslySetInnerHTML={{ __html: t.raw('mission.rightP2') }} />
            </div>
          </div>
        </div>
      </div>

      {/* Values section */}
      <div className="bg-gray-50 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">{t('values.label')}</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-4">
              {t('values.title')}
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t('values.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.titleKey}
                  className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-12 h-12 ${value.bg} rounded-xl flex items-center justify-center mb-5`}>
                    <Icon className={`w-6 h-6 ${value.text}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t(value.titleKey)}</h3>
                  <p className="text-gray-600 leading-relaxed">{t(value.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Company info section */}
      <div className="bg-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left - Info */}
            <div>
              <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">{t('company.label')}</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-6">
                {t('company.title')}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: t.raw('company.description') }} />
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t('company.headquarters')}</div>
                    <div className="text-gray-600">{t('company.address')}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t('company.contactsLabel')}</div>
                    <div className="text-gray-600">
                      <a href="mailto:info@flyfile.it" className="hover:text-blue-600 transition-colors">info@flyfile.it</a>
                      {' '}&middot;{' '}
                      <a href="mailto:support@flyfile.it" className="hover:text-blue-600 transition-colors">support@flyfile.it</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Visual card */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-10 text-white overflow-hidden">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4">{t('company.ctaTitle')}</h3>
                  <p className="text-white/80 mb-8 leading-relaxed">
                    {t('company.ctaDescription')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/registrati"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {t('company.ctaRegister')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/25 transition-colors"
                    >
                      {t('company.ctaTry')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
