'use client';

import { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Mail, Phone, MapPin, Clock, FileText, Shield, Zap, DollarSign, Send, CheckCircle, AlertTriangle, Users, Settings, Building } from 'lucide-react';

export default function ContactPage() {
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
      // Send to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'invio del messaggio');
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
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Messaggio inviato!</h1>
            <p className="text-gray-600 mb-8">
              Ti risponderemo nel più breve tempo possibile. Grazie per averci contattato!
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-300"
            >
              Invia un altro messaggio
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden -mt-16 pt-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)`
          }}
        ></div>

        <div className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8">
              <Mail className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-white/90 text-sm font-medium">Contattaci</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Siamo qui per
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                aiutarti
              </span>
            </h1>

            <p className="text-lg text-blue-100/80 max-w-3xl mx-auto mb-8">
              Il nostro team è disponibile per supportarti in ogni fase del tuo percorso con FlyFile. Contattaci per assistenza, domande o per scoprire come possiamo aiutare la tua organizzazione.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)`
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Contact Methods */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {/* Sales Team */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 text-center hover:bg-white/80 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Team Commerciale</h3>
              <p className="text-gray-700 mb-6">
                Scopri il piano perfetto per la tua organizzazione e ottieni una demo personalizzata.
              </p>
              <div className="space-y-3">
                <a href="mailto:sales@flyfile.it" className="block text-green-600 hover:text-green-700 font-medium">
                  sales@flyfile.it
                </a>
                <div className="text-gray-600 text-sm">
                  Tempo di risposta: 2-4 ore
                </div>
              </div>
            </div>

            {/* Technical Support */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 text-center hover:bg-white/80 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Supporto Tecnico</h3>
              <p className="text-gray-700 mb-6">
                Assistenza per problemi tecnici, integrazione API e risoluzione di errori.
              </p>
              <div className="space-y-3">
                <a href="mailto:support@flyfile.it" className="block text-blue-600 hover:text-blue-700 font-medium">
                  support@flyfile.it
                </a>
                <div className="text-gray-600 text-sm">
                  Tempo di risposta: 24 ore
                </div>
              </div>
            </div>

            {/* Security Team */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 text-center hover:bg-white/80 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Team Security</h3>
              <p className="text-gray-700 mb-6">
                Segnalazione vulnerabilità, audit di sicurezza e conformità enterprise.
              </p>
              <div className="space-y-3">
                <a href="mailto:security@flyfile.it" className="block text-purple-600 hover:text-purple-700 font-medium">
                  security@flyfile.it
                </a>
                <div className="text-gray-600 text-sm">
                  Tempo di risposta: 12 ore
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Invia un Messaggio</h2>
              <p className="text-lg text-gray-600">
                Compila il form qui sotto e ti risponderemo nel più breve tempo possibile.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-3">Nome Completo</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-3">Indirizzo Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Company */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold text-gray-800 mb-3">Azienda</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-800 mb-3">Categoria</label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Seleziona una categoria</option>
                      <option value="sales">Informazioni Commerciali</option>
                      <option value="support">Supporto Tecnico</option>
                      <option value="security">Questioni di Sicurezza</option>
                      <option value="billing">Fatturazione e Pagamenti</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Altro</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-3">Messaggio</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    placeholder="Descrivi la tua richiesta in dettaglio..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                {/* Privacy Consent */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="privacy"
                      name="privacy"
                      type="checkbox"
                      required
                      checked={formData.privacy}
                      onChange={(e) => setFormData({ ...formData, privacy: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-white/50 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="privacy" className="text-gray-700">
                      Acconsento al trattamento dei miei dati personali secondo la{' '}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</Link>
                    </label>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Send className="w-5 h-5 mr-2" />
                    )}
                    Invia Messaggio
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Office Information */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Company Info */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Informazioni Aziendali</h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Sede Principale</h4>
                    <p className="text-gray-600 text-sm">
                      Via Villapizzone, 26<br />
                      20156 Milano, Italia
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Telefono</h4>
                    <p className="text-gray-600 text-sm">+39 339 281 9620</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Orari di Supporto</h4>
                    <p className="text-gray-600 text-sm">
                      Lun-Ven: 9:00 - 18:00 CET<br />
                      Weekend: Solo emergenze
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <Building className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Ragione Sociale</h4>
                    <p className="text-gray-600 text-sm">
                      I-Creativi<br />
                      P.IVA: IT08673460963<br />
                      <a href="https://i-creativi.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.i-creativi.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Link Utili</h3>

              <div className="space-y-4">
                <Link href="/documentazione" className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Documentazione</h4>
                    <p className="text-gray-600 text-sm">Guide, tutorial e API reference</p>
                  </div>
                </Link>

                <Link href="/sicurezza" className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Sicurezza</h4>
                    <p className="text-gray-600 text-sm">Informazioni su crittografia e conformità</p>
                  </div>
                </Link>

                <Link href="/prezzi" className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Piani e Prezzi</h4>
                    <p className="text-gray-600 text-sm">Trova il piano perfetto per te</p>
                  </div>
                </Link>

                <Link href="/funzionalita" className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Funzionalità</h4>
                    <p className="text-gray-600 text-sm">Scopri tutte le caratteristiche</p>
                  </div>
                </Link>
              </div>

              {/* Emergency Contact */}
              <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <h4 className="font-semibold text-red-800">Emergenze Sicurezza</h4>
                </div>
                <p className="text-red-700 text-sm mb-3">
                  Per segnalazioni urgenti di sicurezza o violazioni dei dati, contatta immediatamente:
                </p>
                <a href="mailto:emergency@flyfile.it" className="text-red-600 hover:text-red-700 font-medium text-sm">
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
