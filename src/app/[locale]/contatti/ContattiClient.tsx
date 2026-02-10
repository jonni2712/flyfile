'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Mail, Phone, MapPin, Clock, FileText, Shield, Zap, DollarSign, Send, CheckCircle, AlertTriangle, Users, Settings, Building } from 'lucide-react';

export default function ContattiClient() {
  const t = useTranslations('contact');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    privacy: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('form.errorDefault'));
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        privacy: false,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('form.errorUnknown');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <div className="relative -mt-16 pt-16 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-24">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <CheckCircle className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">{t('success.title')}</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
              {t('success.subtitle')}
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all shadow-lg"
            >
              {t('success.sendAnother')}
            </button>
          </div>
        </div>

        <div className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-gray-500">{t('success.immediateHelp')}</p>
            <a href="mailto:support@flyfile.it" className="text-blue-600 hover:text-blue-700 font-medium">
              support@flyfile.it
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero */}
      <div className="relative -mt-16 pt-16 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-24">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Mail className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">{t('hero.badge')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            {t('hero.titleLine1')}
            <span className="block italic font-light">{t('hero.titleLine2')}</span>
          </h1>

          <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-5 mb-20">
            <div className="rounded-2xl border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('methods.sales.title')}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {t('methods.sales.description')}
              </p>
              <a href="mailto:sales@flyfile.it" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                sales@flyfile.it
              </a>
              <p className="text-xs text-gray-400 mt-2">{t('methods.sales.responseTime')}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('methods.support.title')}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {t('methods.support.description')}
              </p>
              <a href="mailto:support@flyfile.it" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                support@flyfile.it
              </a>
              <p className="text-xs text-gray-400 mt-2">{t('methods.support.responseTime')}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('methods.security.title')}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {t('methods.security.description')}
              </p>
              <a href="mailto:security@flyfile.it" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                security@flyfile.it
              </a>
              <p className="text-xs text-gray-400 mt-2">{t('methods.security.responseTime')}</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                {t('form.label')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-4">
                {t('form.title')}
              </h2>
              <p className="text-gray-600">
                {t('form.subtitle')}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-8 sm:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">{t('form.fullName')}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">{t('form.email')}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold text-gray-800 mb-2">{t('form.company')}</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-800 mb-2">{t('form.category')}</label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">{t('form.selectCategory')}</option>
                      <option value="sales">{t('form.categorySales')}</option>
                      <option value="support">{t('form.categorySupport')}</option>
                      <option value="security">{t('form.categorySecurity')}</option>
                      <option value="billing">{t('form.categoryBilling')}</option>
                      <option value="partnership">{t('form.categoryPartnership')}</option>
                      <option value="other">{t('form.categoryOther')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-2">{t('form.message')}</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    placeholder={t('form.messagePlaceholder')}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-start">
                  <input
                    id="privacy"
                    name="privacy"
                    type="checkbox"
                    required
                    checked={formData.privacy}
                    onChange={(e) => setFormData({ ...formData, privacy: e.target.checked })}
                    className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="privacy" className="ml-3 text-sm text-gray-600">
                    {t('form.privacyConsent')}{' '}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">{t('form.privacyLink')}</Link>
                  </label>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-10 py-3 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {loading ? t('form.sending') : t('form.submit')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Info + Links Grid */}
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Company Info */}
            <div className="rounded-2xl border border-gray-200 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('info.title')}</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{t('info.headquarters')}</h4>
                    <p className="text-sm text-gray-500">Via Villapizzone, 26<br />20156 Milano, Italia</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{t('info.phone')}</h4>
                    <p className="text-sm text-gray-500">+39 339 281 9620</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{t('info.supportHours')}</h4>
                    <p className="text-sm text-gray-500">{t('info.supportHoursValue')}<br />{t('info.supportHoursWeekend')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{t('info.companyName')}</h4>
                    <p className="text-sm text-gray-500">
                      I-Creativi &middot; P.IVA: IT08673460963<br />
                      <a href="https://i-creativi.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">www.i-creativi.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border border-gray-200 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('links.title')}</h3>
              <div className="space-y-3">
                <Link href="/documentazione" className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{t('links.documentation')}</h4>
                    <p className="text-xs text-gray-500">{t('links.documentationDesc')}</p>
                  </div>
                </Link>
                <Link href="/sicurezza" className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{t('links.security')}</h4>
                    <p className="text-xs text-gray-500">{t('links.securityDesc')}</p>
                  </div>
                </Link>
                <Link href="/prezzi" className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{t('links.pricing')}</h4>
                    <p className="text-xs text-gray-500">{t('links.pricingDesc')}</p>
                  </div>
                </Link>
                <Link href="/funzionalita" className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{t('links.features')}</h4>
                    <p className="text-xs text-gray-500">{t('links.featuresDesc')}</p>
                  </div>
                </Link>
              </div>

              {/* Emergency */}
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h4 className="font-semibold text-red-800 text-sm">{t('emergency.title')}</h4>
                </div>
                <p className="text-xs text-red-700 mb-2">
                  {t('emergency.description')}
                </p>
                <a href="mailto:emergency@flyfile.it" className="text-xs font-medium text-red-600 hover:text-red-700">
                  emergency@flyfile.it
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
