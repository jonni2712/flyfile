'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, Eye, EyeOff, User, UserPlus, Building2, ChevronDown, FileText } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // User type
  const [userType, setUserType] = useState<'individual' | 'business'>('individual');

  // Billing info
  const [showBilling, setShowBilling] = useState(false);
  const [billingFirstName, setBillingFirstName] = useState('');
  const [billingLastName, setBillingLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('IT');

  const { signUp, signInWithGoogle, isProcessingRedirect } = useAuth();
  const router = useRouter();

  // Show loading screen while processing OAuth redirect
  if (isProcessingRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Registrazione in corso...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptTerms) {
      setError('Devi accettare i Termini di Servizio e la Privacy Policy');
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    if (password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      return;
    }

    setLoading(true);

    try {
      const displayName = `${firstName} ${lastName}`.trim();

      // Prepare billing data if provided
      const billingData = showBilling ? {
        userType,
        firstName: billingFirstName || firstName,
        lastName: billingLastName || lastName,
        companyName: userType === 'business' ? companyName : undefined,
        vatNumber: userType === 'business' ? vatNumber : undefined,
        taxCode: userType === 'business' ? taxCode : undefined,
        address,
        city,
        state,
        postalCode: zipCode,
        phone,
        country,
      } : { userType };

      await signUp(email, password, displayName, username, billingData);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Impossibile creare l\'account';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      // Use window.location for more reliable redirect after OAuth
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registrazione con Google fallita';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Floating Registration Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Logo Area */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full mb-6 shadow-lg">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Unisciti a FlyFile</h1>
            <p className="text-purple-100/80">Inizia subito con il piano gratuito</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 font-medium text-sm text-red-300 bg-red-500/20 border border-red-500/30 rounded-xl p-3">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                  placeholder="mario.rossi"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <User className="h-5 w-5 text-white/50" />
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-white/90 mb-2">
                  Nome
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                  placeholder="Mario"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-white/90 mb-2">
                  Cognome
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                  placeholder="Rossi"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                  placeholder="mario@esempio.com"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Mail className="h-5 w-5 text-white/50" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                Conferma password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-3">Tipo di account</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center p-3 bg-white/5 border rounded-xl cursor-pointer hover:bg-white/10 transition-colors ${
                    userType === 'individual' ? 'bg-purple-500/20 border-purple-400/50' : 'border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="user_type"
                    value="individual"
                    checked={userType === 'individual'}
                    onChange={() => setUserType('individual')}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-white/80" />
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">Privato</div>
                      <div className="text-white/60 text-xs">Uso personale</div>
                    </div>
                  </div>
                </label>
                <label
                  className={`flex items-center p-3 bg-white/5 border rounded-xl cursor-pointer hover:bg-white/10 transition-colors ${
                    userType === 'business' ? 'bg-purple-500/20 border-purple-400/50' : 'border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="user_type"
                    value="business"
                    checked={userType === 'business'}
                    onChange={() => setUserType('business')}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mr-3">
                      <Building2 className="w-4 h-4 text-white/80" />
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">Azienda</div>
                      <div className="text-white/60 text-xs">Uso aziendale</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Billing Information Toggle */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <button
                type="button"
                onClick={() => setShowBilling(!showBilling)}
                className="w-full flex items-center justify-between text-white/90 hover:text-white transition-colors"
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  <span className="font-medium">Dati di fatturazione</span>
                  <span className="ml-2 text-xs text-white/60">(opzionale ora)</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showBilling ? 'rotate-180' : ''}`} />
              </button>
              <p className="text-white/60 text-xs mt-2">Puoi aggiungere questi dati anche successivamente nel tuo profilo</p>
            </div>

            {/* Billing Fields (Collapsible) */}
            {showBilling && (
              <div className="space-y-4 bg-white/5 rounded-xl p-4 border border-white/10 animate-in slide-in-from-top-2">
                {/* Billing First Name and Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="billing_first_name" className="block text-sm font-medium text-white/90 mb-2">Nome</label>
                    <input
                      type="text"
                      id="billing_first_name"
                      value={billingFirstName}
                      onChange={(e) => setBillingFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                      placeholder="Mario"
                    />
                  </div>
                  <div>
                    <label htmlFor="billing_last_name" className="block text-sm font-medium text-white/90 mb-2">Cognome</label>
                    <input
                      type="text"
                      id="billing_last_name"
                      value={billingLastName}
                      onChange={(e) => setBillingLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                      placeholder="Rossi"
                    />
                  </div>
                </div>

                {/* Company Name (Business Only) */}
                {userType === 'business' && (
                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-white/90 mb-2">Nome azienda</label>
                    <input
                      type="text"
                      id="company_name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                      placeholder="Nome della tua azienda"
                    />
                  </div>
                )}

                {/* VAT Number and Tax Code (Business Only) */}
                {userType === 'business' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="vat_number" className="block text-sm font-medium text-white/90 mb-2">Partita IVA</label>
                      <input
                        type="text"
                        id="vat_number"
                        value={vatNumber}
                        onChange={(e) => setVatNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                        placeholder="IT12345678901"
                      />
                    </div>
                    <div>
                      <label htmlFor="tax_code" className="block text-sm font-medium text-white/90 mb-2">Codice fiscale</label>
                      <input
                        type="text"
                        id="tax_code"
                        value={taxCode}
                        onChange={(e) => setTaxCode(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                        placeholder="RSSMRA80A01H501Z"
                      />
                    </div>
                  </div>
                )}

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-white/90 mb-2">Indirizzo</label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                    placeholder="Via Roma 123"
                  />
                </div>

                {/* City, State and Postal Code */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-white/90 mb-2">Città</label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                      placeholder="Milano"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-white/90 mb-2">Provincia</label>
                    <input
                      type="text"
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                      placeholder="MI"
                    />
                  </div>
                  <div>
                    <label htmlFor="zip_code" className="block text-sm font-medium text-white/90 mb-2">CAP</label>
                    <input
                      type="text"
                      id="zip_code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                      placeholder="20100"
                    />
                  </div>
                </div>

                {/* Phone and Country */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white/90 mb-2">Telefono</label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                      placeholder="+39 123 456 7890"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-white/90 mb-2">Paese</label>
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                    >
                      <option value="IT" className="bg-gray-800">Italia</option>
                      <option value="US" className="bg-gray-800">Stati Uniti</option>
                      <option value="FR" className="bg-gray-800">Francia</option>
                      <option value="DE" className="bg-gray-800">Germania</option>
                      <option value="ES" className="bg-gray-800">Spagna</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="mt-6">
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                />
                <span className="ml-3 text-sm text-white/80 group-hover:text-white/90 transition-colors">
                  Accetto i{' '}
                  <Link href="/terms" className="text-purple-300 hover:text-purple-200 underline transition-colors">
                    Termini di Servizio
                  </Link>{' '}
                  e la{' '}
                  <Link href="/privacy" className="text-purple-300 hover:text-purple-200 underline transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-purple-400 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creazione in corso...' : 'Crea Account Gratuito'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-transparent text-white/60 text-sm">oppure</span>
              </div>
            </div>
          </div>

          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mt-6 bg-white/10 border border-white/20 text-white py-3 px-6 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Registrati con Google
          </button>

          {/* Login Link */}
          <p className="mt-8 text-center text-white/70">
            Hai già un account?{' '}
            <Link href="/login" className="text-purple-300 hover:text-purple-200 font-medium transition-colors">
              Accedi qui
            </Link>
          </p>
        </div>

        {/* Additional Elements */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-sm">Inizia gratis • Nessuna carta richiesta • Upgrade quando vuoi</p>
        </div>
      </div>
    </div>
  );
}
