import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import MainLayout from '@/components/layout/MainLayout';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { Link } from '@/i18n/navigation';
import {
  Zap,
  Lock,
  Share2,
  BarChart3,
  Users,
  Code,
  Check,
  Shield,
  Cloud,
  Globe,
  ArrowRight,
} from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.features' });

  const localePrefix = locale === 'it' ? '' : `/${locale}`;
  const url = `https://flyfile.it${localePrefix}/funzionalita`;

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `https://flyfile.it${l === 'it' ? '' : `/${l}`}/funzionalita`;
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

export default async function FeaturesPage() {
  const t = await getTranslations('features');
  const tCta = await getTranslations('common.cta');

  return (
    <MainLayout>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://flyfile.it' },
        { name: t('hero.badge'), url: 'https://flyfile.it/funzionalita' },
      ]} />
      {/* Hero Section */}
      <div className="relative min-h-[85vh] flex items-center -mt-16 pt-16 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">{t('hero.badge')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            {t('hero.title')}
            <span className="block italic font-light">{t('hero.titleItalic')}</span>
          </h1>

          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all shadow-lg"
            >
              {tCta('tryFree')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/prezzi"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/25 transition-all"
            >
              {tCta('viewPlans')}
            </Link>
          </div>
        </div>
      </div>

      {/* Core Features */}
      <div className="bg-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              {t('core.label')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-6 leading-tight">
              {t('core.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('core.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Encryption */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-5">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('core.encryption.title')}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('core.encryption.description')}
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {t('core.encryption.feature1')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {t('core.encryption.feature2')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {t('core.encryption.feature3')}
                </li>
              </ul>
            </div>

            {/* Smart Sharing */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                <Share2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('core.sharing.title')}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('core.sharing.description')}
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  {t('core.sharing.feature1')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  {t('core.sharing.feature2')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  {t('core.sharing.feature3')}
                </li>
              </ul>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('core.analytics.title')}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('core.analytics.description')}
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  {t('core.analytics.feature1')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  {t('core.analytics.feature2')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  {t('core.analytics.feature3')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-gray-50 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
              {t('advanced.label')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-6 leading-tight">
              {t('advanced.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('advanced.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Team Management */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('advanced.team.title')}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('advanced.team.description')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                    {t('advanced.team.feature1')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                    {t('advanced.team.feature2')}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                    {t('advanced.team.feature3')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                    {t('advanced.team.feature4')}
                  </div>
                </div>
              </div>
            </div>

            {/* API Integration */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mr-4">
                  <Code className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('advanced.api.title')}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('advanced.api.description')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                    {t('advanced.api.feature1')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                    {t('advanced.api.feature2')}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                    {t('advanced.api.feature3')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                    {t('advanced.api.feature4')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-12 sm:p-16 text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="text-center mb-12">
                <span className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                  {t('stats.label')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold mt-4 mb-4">
                  {t('stats.title')}
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                  {t('stats.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-1">99.9%</h3>
                  <p className="text-white/70 text-sm">{t('stats.uptime')}</p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Cloud className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-1">{t('stats.unlimited')}</h3>
                  <p className="text-white/70 text-sm">{t('stats.fileSize')}</p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-1">AES-256</h3>
                  <p className="text-white/70 text-sm">{t('stats.encryption')}</p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-1">Cloudflare</h3>
                  <p className="text-white/70 text-sm">{t('stats.cdn')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-12 sm:p-16 text-white overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t('cta.title')}</h2>
                <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                  {t('cta.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/registrati"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all shadow-lg"
                  >
                    {tCta('startFreeNow')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/contatti"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/25 transition-all"
                  >
                    {tCta('contactSales')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
