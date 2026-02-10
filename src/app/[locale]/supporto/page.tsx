import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { Link } from '@/i18n/navigation';
import {
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  Gift,
  FileText,
  Mail,
  BookOpen,
  Heart,
  Check,
  ArrowRight,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.support' });

  const localePrefix = locale === 'it' ? '' : `/${locale}`;
  const url = `https://flyfile.it${localePrefix}/supporto`;

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `https://flyfile.it${l === 'it' ? '' : `/${l}`}/supporto`;
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

export default async function SupportPage() {
  const t = await getTranslations('supportPage');

  return (
    <MainLayout>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://flyfile.it' },
        { name: t('hero.badge'), url: 'https://flyfile.it/supporto' },
      ]} />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 -mt-16 pt-16 overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full mb-8">
            <Lightbulb className="w-5 h-5 text-white" />
            <span className="text-white font-medium text-sm tracking-wide">
              {t('hero.badge')}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5">
            {t('hero.title')}
          </h1>
          <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {t('quickActions.title')}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {t('quickActions.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Report Bug */}
            <a
              href="mailto:support@flyfile.it?subject=Bug Report"
              className="group bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-xl mb-5">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('quickActions.reportBug.title')}
              </h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                {t('quickActions.reportBug.description')}
              </p>
              <div className="flex items-center text-red-600 text-sm font-semibold">
                <span>{t('quickActions.reportBug.cta')}</span>
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Request Feature */}
            <a
              href="mailto:support@flyfile.it?subject=Feature Request"
              className="group bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-center w-14 h-14 bg-green-50 rounded-xl mb-5">
                <Lightbulb className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('quickActions.requestFeature.title')}
              </h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                {t('quickActions.requestFeature.description')}
              </p>
              <div className="flex items-center text-green-600 text-sm font-semibold">
                <span>{t('quickActions.requestFeature.cta')}</span>
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Ask Question */}
            <a
              href="mailto:support@flyfile.it?subject=Domanda"
              className="group bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-center w-14 h-14 bg-blue-50 rounded-xl mb-5">
                <HelpCircle className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('quickActions.askQuestion.title')}
              </h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                {t('quickActions.askQuestion.description')}
              </p>
              <div className="flex items-center text-blue-600 text-sm font-semibold">
                <span>{t('quickActions.askQuestion.cta')}</span>
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Beta Tester Benefits + Come Contribuire */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Beta Tester Benefits */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mr-4">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t('benefits.title')}
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    <strong className="text-gray-900">{t('benefits.feature1.bold')}</strong>{' '}
                    {t('benefits.feature1.text')}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    <strong className="text-gray-900">{t('benefits.feature2.bold')}</strong>{' '}
                    {t('benefits.feature2.text')}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    <strong className="text-gray-900">{t('benefits.feature3.bold')}</strong>{' '}
                    {t('benefits.feature3.text')}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    <strong className="text-gray-900">{t('benefits.feature4.bold')}</strong>{' '}
                    {t('benefits.feature4.text')}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    <strong className="text-gray-900">{t('benefits.feature5.bold')}</strong>{' '}
                    {t('benefits.feature5.text')}
                  </span>
                </li>
              </ul>
            </div>

            {/* Come Contribuire */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t('contribute.title')}
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </span>
                  <span className="text-gray-700">
                    {t('contribute.step1')}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">2</span>
                  </span>
                  <span className="text-gray-700">
                    {t('contribute.step2')}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">3</span>
                  </span>
                  <span className="text-gray-700">
                    {t('contribute.step3')}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">4</span>
                  </span>
                  <span className="text-gray-700">
                    {t('contribute.step4')}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">5</span>
                  </span>
                  <span className="text-gray-700">
                    {t('contribute.step5')}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {t('channels.title')}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {t('channels.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Email */}
            <a
              href="mailto:support@flyfile.it"
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 flex items-center"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="text-gray-900 font-semibold">{t('channels.email.title')}</h4>
                <p className="text-gray-500 text-sm">{t('channels.email.value')}</p>
              </div>
            </a>

            {/* Documentation */}
            <Link
              href="/documentazione"
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 flex items-center"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-gray-900 font-semibold">{t('channels.docs.title')}</h4>
                <p className="text-gray-500 text-sm">{t('channels.docs.value')}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Thank You */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-10 text-center overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-5">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('thankYou.title')}
              </h3>
              <p className="text-white/85 max-w-xl mx-auto leading-relaxed">
                {t('thankYou.description')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
