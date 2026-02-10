import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Shield, Lock, Key, Eye, Server, Globe, Check, Clock, BarChart3, AlertTriangle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.security' });

  const localePrefix = locale === 'it' ? '' : `/${locale}`;
  const url = `https://flyfile.it${localePrefix}/sicurezza`;

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `https://flyfile.it${l === 'it' ? '' : `/${l}`}/sicurezza`;
  }

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FlyFile' }],
    },
  };
}

export default async function SecurityPage() {
  const t = await getTranslations('security');
  const tCta = await getTranslations('common.cta');

  return (
    <MainLayout>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://flyfile.it' },
        { name: t('hero.badge'), url: 'https://flyfile.it/sicurezza' },
      ]} />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden -mt-16 pt-16">
        {/* Decorative Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 border border-white/30 rounded-full mb-8">
              <Shield className="w-5 h-5 text-white mr-2" />
              <span className="text-white text-sm font-medium">{t('hero.badge')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t('hero.title')}<br />
              {t('hero.titleLine2')}
            </h1>

            <p className="text-lg text-white/80 max-w-3xl mx-auto mb-10">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-full font-semibold transition-all shadow-lg"
              >
                {tCta('trySecurity')}
              </Link>
              <Link
                href="/privacy"
                className="px-8 py-4 bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/20 rounded-full font-semibold transition-all"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* AES-256 Encryption Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{t('encryption.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('encryption.subtitle')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-100 shadow-sm">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8">
                  <Lock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">{t('encryption.aesTitle')}</h3>
                <p className="text-base text-gray-700 mb-6">
                  {t('encryption.aesDescription')}
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center text-gray-700">
                    <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span>{t('encryption.uniqueKeys')}</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span>{t('encryption.serverSide')}</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span>{t('encryption.secureDecrypt')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8">
                <h4 className="text-xl font-bold text-gray-900 mb-8">{t('encryption.howItWorks')}</h4>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">{t('encryption.step1Title')}</h5>
                      <p className="text-gray-600 text-sm">{t('encryption.step1Desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">{t('encryption.step2Title')}</h5>
                      <p className="text-gray-600 text-sm">{t('encryption.step2Desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">{t('encryption.step3Title')}</h5>
                      <p className="text-gray-600 text-sm">{t('encryption.step3Desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features Grid */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{t('features.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Secure Transfer */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('features.secureTransfer.title')}</h3>
              <p className="text-gray-600 mb-6">
                {t('features.secureTransfer.description')}
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  {t('features.secureTransfer.feature1')}
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  {t('features.secureTransfer.feature2')}
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  {t('features.secureTransfer.feature3')}
                </li>
              </ul>
            </div>

            {/* Access Control */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                <Key className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('features.accessControl.title')}</h3>
              <p className="text-gray-600 mb-6">
                {t('features.accessControl.description')}
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                  {t('features.accessControl.feature1')}
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                  {t('features.accessControl.feature2')}
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                  {t('features.accessControl.feature3')}
                </li>
              </ul>
            </div>

            {/* Security Monitoring */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('features.monitoring.title')}</h3>
              <p className="text-gray-600 mb-6">
                {t('features.monitoring.description')}
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                  {t('features.monitoring.feature1')}
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                  {t('features.monitoring.feature2')}
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                  {t('features.monitoring.feature3')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Section - Gradient Card */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-12 relative overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t('compliance.title')}</h2>
                <p className="text-lg text-white/80 max-w-3xl mx-auto">
                  {t('compliance.subtitle')}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* GDPR */}
                <div className="bg-white/15 border border-white/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{t('compliance.gdpr.title')}</h3>
                  <p className="text-white/80 text-sm">
                    {t('compliance.gdpr.description')}
                  </p>
                </div>

                {/* Crittografia */}
                <div className="bg-white/15 border border-white/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{t('compliance.aes.title')}</h3>
                  <p className="text-white/80 text-sm">
                    {t('compliance.aes.description')}
                  </p>
                </div>

                {/* Server EU */}
                <div className="bg-white/15 border border-white/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{t('compliance.eu.title')}</h3>
                  <p className="text-white/80 text-sm">
                    {t('compliance.eu.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure Security */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{t('infrastructure.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('infrastructure.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Cloud Infrastructure */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mr-4">
                  <Server className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('infrastructure.cloud.title')}</h3>
              </div>
              <p className="text-gray-600 mb-6">
                {t('infrastructure.cloud.description')}
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <span>{t('infrastructure.cloud.feature1')}</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <span>{t('infrastructure.cloud.feature2')}</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <span>{t('infrastructure.cloud.feature3')}</span>
                </li>
              </ul>
            </div>

            {/* Network Security */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('infrastructure.network.title')}</h3>
              </div>
              <p className="text-gray-600 mb-6">
                {t('infrastructure.network.description')}
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  <span>{t('infrastructure.network.feature1')}</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  <span>{t('infrastructure.network.feature2')}</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  <span>{t('infrastructure.network.feature3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{t('bestPractices.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('bestPractices.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{t('bestPractices.passwords.title')}</h4>
              <p className="text-gray-600 text-sm">{t('bestPractices.passwords.description')}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{t('bestPractices.expiry.title')}</h4>
              <p className="text-gray-600 text-sm">{t('bestPractices.expiry.description')}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{t('bestPractices.monitor.title')}</h4>
              <p className="text-gray-600 text-sm">{t('bestPractices.monitor.description')}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{t('bestPractices.limitSharing.title')}</h4>
              <p className="text-gray-600 text-sm">{t('bestPractices.limitSharing.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              {t('ctaSection.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('ctaSection.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/registrati"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 text-white rounded-full font-semibold transition-all shadow-lg"
              >
                {tCta('startWithSecurity')}
              </Link>
              <Link
                href="/contatti"
                className="px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-full font-semibold transition-all"
              >
                {tCta('contactSecurityTeam')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
