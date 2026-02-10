import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import MainLayout from '@/components/layout/MainLayout';
import { Link } from '@/i18n/navigation';
import { X, ArrowRight, Upload, Check, Shield, Zap, Users } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'subscription.cancelled' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function SubscriptionCancelPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'subscription.cancelled' });

  return (
    <MainLayout>
      {/* Hero */}
      <div className="relative -mt-16 pt-16 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-24">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 border border-white/30">
            <X className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            {t('title')}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              href="/prezzi"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all shadow-lg"
            >
              {t('viewPlans')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/25 transition-all"
            >
              <Upload className="w-4 h-4" />
              {t('backToUpload')}
            </Link>
          </div>
        </div>
      </div>

      {/* Why FlyFile */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              {t('whyFlyFileBadge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-4">
              {t('whyFlyFileTitle')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('whyFlyFileSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
            <div className="rounded-2xl border border-gray-200 p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{t('unlimitedSizeTitle')}</h3>
                <p className="text-sm text-gray-500">{t('unlimitedSizeDescription')}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{t('encryptionTitle')}</h3>
                <p className="text-sm text-gray-500">{t('encryptionDescription')}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{t('teamTitle')}</h3>
                <p className="text-sm text-gray-500">{t('teamDescription')}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{t('brandingTitle')}</h3>
                <p className="text-sm text-gray-500">{t('brandingDescription')}</p>
              </div>
            </div>
          </div>

          {/* Free option */}
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <p className="text-gray-600 mb-4">
              {t('notReadyText')}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {t('startFree')}
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
