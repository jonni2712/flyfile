import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import MainLayout from '@/components/layout/MainLayout';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { Link } from '@/i18n/navigation';
import {
  FileText,
  User,
  Upload,
  Share2,
  Check,
  Lightbulb,
  Lock,
  BarChart3,
  Users,
  Code,
  HelpCircle,
  ArrowRight,
  Zap,
  Mail,
  MessageCircle,
} from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.documentation' });

  const localePrefix = locale === 'it' ? '' : `/${locale}`;
  const url = `https://flyfile.it${localePrefix}/documentazione`;

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `https://flyfile.it${l === 'it' ? '' : `/${l}`}/documentazione`;
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

export default async function DocumentationPage() {
  const t = await getTranslations('documentation');
  const tCta = await getTranslations('common.cta');

  return (
    <MainLayout>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://flyfile.it' },
        { name: t('hero.badge'), url: 'https://flyfile.it/documentazione' },
      ]} />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden -mt-16 pt-16">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full mb-8">
              <FileText className="w-4 h-4 text-white mr-2" />
              <span className="text-white text-sm font-medium">{t('hero.badge')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              {t('hero.title')}
              <span className="block">{t('hero.titleLine2')}</span>
            </h1>

            <p className="text-lg text-white/80 max-w-3xl mx-auto mb-10">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#quick-start"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg shadow-black/10"
              >
                {t('hero.quickGuide')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
              <a
                href="#api-reference"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/15 text-white border border-white/30 rounded-full font-semibold hover:bg-white/25 transition-all duration-300"
              >
                {t('hero.apiReference')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <section id="quick-start" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t('quickStart.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('quickStart.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 relative">
              <div className="absolute -top-5 left-8">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                  1
                </div>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 mt-4">
                <User className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('quickStart.step1.title')}</h3>
              <p className="text-gray-600 mb-6">
                {t('quickStart.step1.description')}
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  {t('quickStart.step1.feature1')}
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  {t('quickStart.step1.feature2')}
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  {t('quickStart.step1.feature3')}
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 relative">
              <div className="absolute -top-5 left-8">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-500/30">
                  2
                </div>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 mt-4">
                <Upload className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('quickStart.step2.title')}</h3>
              <p className="text-gray-600 mb-6">
                {t('quickStart.step2.description')}
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {t('quickStart.step2.feature1')}
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {t('quickStart.step2.feature2')}
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {t('quickStart.step2.feature3')}
                </li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 relative">
              <div className="absolute -top-5 left-8">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30">
                  3
                </div>
              </div>
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 mt-4">
                <Share2 className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('quickStart.step3.title')}</h3>
              <p className="text-gray-600 mb-6">
                {t('quickStart.step3.description')}
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  {t('quickStart.step3.feature1')}
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  {t('quickStart.step3.feature2')}
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  {t('quickStart.step3.feature3')}
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mr-4">
                <Lightbulb className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t('quickStart.tips.title')}</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">{t('quickStart.tips.securityTitle')}</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>{t('quickStart.tips.securityTip1')}</li>
                  <li>{t('quickStart.tips.securityTip2')}</li>
                  <li>{t('quickStart.tips.securityTip3')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">{t('quickStart.tips.productivityTitle')}</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>{t('quickStart.tips.productivityTip1')}</li>
                  <li>{t('quickStart.tips.productivityTip2')}</li>
                  <li>{t('quickStart.tips.productivityTip3')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Guide Section */}
      <section id="features-guide" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t('featuresGuide.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('featuresGuide.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Upload Guide */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('featuresGuide.upload.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('featuresGuide.upload.description')}
              </p>
              <span className="inline-flex items-center text-green-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                {tCta('readMore')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>

            {/* Security Guide */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('featuresGuide.security.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('featuresGuide.security.description')}
              </p>
              <span className="inline-flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                {tCta('readMore')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>

            {/* Analytics Guide */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('featuresGuide.analytics.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('featuresGuide.analytics.description')}
              </p>
              <span className="inline-flex items-center text-purple-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                {tCta('readMore')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>

            {/* Team Guide */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('featuresGuide.team.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('featuresGuide.team.description')}
              </p>
              <span className="inline-flex items-center text-orange-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                {tCta('readMore')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>

            {/* API Guide */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <Code className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('featuresGuide.api.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('featuresGuide.api.description')}
              </p>
              <span className="inline-flex items-center text-indigo-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                {tCta('readMore')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>

            {/* Troubleshooting */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6">
                <HelpCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('featuresGuide.troubleshooting.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('featuresGuide.troubleshooting.description')}
              </p>
              <span className="inline-flex items-center text-yellow-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                {tCta('readMore')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* API Reference Section */}
      <section id="api-reference" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t('apiReference.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('apiReference.subtitle')}
            </p>
          </div>

          {/* Base URL */}
          <div className="bg-gray-950 rounded-2xl p-8 mb-8 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{t('apiReference.baseEndpoint')}</h3>
              <span className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                REST API v1
              </span>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm overflow-x-auto">
              <div className="text-green-400 mb-2">Base URL:</div>
              <div className="text-white">https://flyfile.it/api/v1</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Authentication */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 mb-6">{t('apiReference.authentication')}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {t('apiReference.bearerToken')}
                  </h4>
                  <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <span className="text-blue-600">Authorization:</span> Bearer {'{token}'}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">{t('apiReference.getToken')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('apiReference.getTokenDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Endpoints */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 mb-6">{t('apiReference.mainEndpoints')}</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 overflow-x-auto">
                  <div className="font-mono text-sm text-green-600 mb-1">POST /transfers</div>
                  <p className="text-gray-600 text-sm">{t('apiReference.createTransfer')}</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 overflow-x-auto">
                  <div className="font-mono text-sm text-blue-600 mb-1">
                    GET /transfers/{'{id}'}
                  </div>
                  <p className="text-gray-600 text-sm">{t('apiReference.getTransfer')}</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 overflow-x-auto">
                  <div className="font-mono text-sm text-purple-600 mb-1">GET /analytics</div>
                  <p className="text-gray-600 text-sm">{t('apiReference.getAnalytics')}</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4 overflow-x-auto">
                  <div className="font-mono text-sm text-orange-600 mb-1">
                    POST /teams/{'{id}'}/invite
                  </div>
                  <p className="text-gray-600 text-sm">{t('apiReference.inviteTeam')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-8">{t('apiReference.codeExamples')}</h3>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* JavaScript Example */}
              <div className="bg-gray-950 rounded-2xl p-8 overflow-hidden min-w-0">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-white">JavaScript</h4>
                  <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-medium rounded-full">
                    ES6+
                  </span>
                </div>
                <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm overflow-x-auto">
                  <pre className="text-gray-300 whitespace-pre">
{`const response = await fetch('https://flyfile.it/api/v1/upload', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'multipart/form-data'
  },
  body: formData
});

const result = await response.json();
console.log(result.shareUrl);`}
                  </pre>
                </div>
              </div>

              {/* Python Example */}
              <div className="bg-gray-950 rounded-2xl p-8 overflow-hidden min-w-0">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-white">Python</h4>
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                    requests
                  </span>
                </div>
                <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm overflow-x-auto">
                  <pre className="text-gray-300 whitespace-pre">
{`import requests

headers = {
    'Authorization': f'Bearer {token}'
}

files = {'file': open('document.pdf', 'rb')}

response = requests.post(
    'https://flyfile.it/api/v1/upload',
    headers=headers,
    files=files
)

print(response.json()['shareUrl'])`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t('faq.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('faq.subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {t('faq.q1')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('faq.a1')}
                </p>
              </div>

              <div className="py-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {t('faq.q2')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('faq.a2')}
                </p>
              </div>

              <div className="py-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {t('faq.q3')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('faq.a3')}
                </p>
              </div>

              <div className="py-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {t('faq.q4')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('faq.a4')}
                </p>
              </div>

              <div className="py-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {t('faq.q5')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('faq.a5')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-12 lg:p-16 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {t('ctaSection.title')}
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
                {t('ctaSection.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contatti"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg shadow-black/10"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {t('ctaSection.contactSupport')}
                </Link>
                <a
                  href="mailto:support@flyfile.it"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/15 text-white border border-white/30 rounded-full font-semibold hover:bg-white/25 transition-all duration-300"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  support@flyfile.it
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
