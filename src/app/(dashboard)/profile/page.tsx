'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import {
  User,
  Building2,
  Save,
  Crown,
  HardDrive,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import { PLANS } from '@/types';

export default function ProfilePage() {
  const { user, userProfile, loading, updateUserProfile, deleteAccount } = useAuth();
  const router = useRouter();

  // Profile info
  const [displayName, setDisplayName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Billing info
  const [userType, setUserType] = useState<'individual' | 'business'>('individual');
  const [billingFirstName, setBillingFirstName] = useState('');
  const [billingLastName, setBillingLastName] = useState('');
  const [billingCompanyName, setBillingCompanyName] = useState('');
  const [billingVatNumber, setBillingVatNumber] = useState('');
  const [billingTaxCode, setBillingTaxCode] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingPostalCode, setBillingPostalCode] = useState('');
  const [billingCountry, setBillingCountry] = useState('IT');
  const [billingPhone, setBillingPhone] = useState('');
  const [savingBilling, setSavingBilling] = useState(false);
  const [billingMessage, setBillingMessage] = useState('');

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      // Load billing info if exists
      if (userProfile.billing) {
        setUserType(userProfile.billing.userType || 'individual');
        setBillingFirstName(userProfile.billing.firstName || '');
        setBillingLastName(userProfile.billing.lastName || '');
        setBillingCompanyName(userProfile.billing.companyName || '');
        setBillingVatNumber(userProfile.billing.vatNumber || '');
        setBillingTaxCode(userProfile.billing.taxCode || '');
        setBillingAddress(userProfile.billing.address || '');
        setBillingCity(userProfile.billing.city || '');
        setBillingPostalCode(userProfile.billing.postalCode || '');
        setBillingCountry(userProfile.billing.country || 'IT');
        setBillingPhone(userProfile.billing.phone || '');
      }
    }
  }, [user, userProfile, loading, router]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage('');
    try {
      await updateUserProfile({ displayName });
      setProfileMessage('Salvato.');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch {
      setProfileMessage('Errore durante il salvataggio');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveBilling = async () => {
    setSavingBilling(true);
    setBillingMessage('');
    try {
      await updateUserProfile({
        billing: {
          userType,
          firstName: billingFirstName,
          lastName: billingLastName,
          companyName: billingCompanyName,
          vatNumber: billingVatNumber,
          taxCode: billingTaxCode,
          address: billingAddress,
          city: billingCity,
          postalCode: billingPostalCode,
          country: billingCountry,
          phone: billingPhone,
        },
      });
      setBillingMessage('Dati di fatturazione aggiornati.');
      setTimeout(() => setBillingMessage(''), 3000);
    } catch {
      setBillingMessage('Errore durante il salvataggio');
    } finally {
      setSavingBilling(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;

    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      router.push('/');
    } catch (err) {
      const error = err as Error;
      if (error.message?.includes('wrong-password') || error.message?.includes('invalid-credential')) {
        alert('Password non corretta');
      } else {
        alert(error.message || 'Errore durante l\'eliminazione dell\'account');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !userProfile) return null;

  const plan = PLANS[userProfile.plan] || PLANS.free;

  const formatBytes = (bytes: number) => {
    if (bytes === -1) return 'Illimitato';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

        {/* Profile Information */}
        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <div className="max-w-xl">
            <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informazioni Profilo
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  id="name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm cursor-not-allowed"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={handleSaveProfile} loading={savingProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Salva
                </Button>

                {profileMessage && (
                  <p className="text-sm text-gray-600">{profileMessage}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <div className="max-w-xl">
            <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Abbonamento
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500">Piano attuale</p>
                <p className="text-xl font-bold text-gray-900">{plan.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Storage mensile</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatBytes(plan.storageLimit)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Trasferimenti</p>
                <p className="text-xl font-bold text-gray-900">
                  {plan.maxTransfers === -1 ? 'Illimitati' : `${plan.maxTransfers}/mese`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Conservazione file</p>
                <p className="text-xl font-bold text-gray-900">
                  {plan.retentionDays === 365 ? '1 anno' : `${plan.retentionDays} giorni`}
                </p>
              </div>
            </div>

            {userProfile.plan === 'free' && (
              <Button onClick={() => router.push('/pricing')}>
                Upgrade piano
              </Button>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <div className="max-w-xl">
            <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Utilizzo
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Storage utilizzato</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatBytes(userProfile.storageUsed)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">File totali</p>
                <p className="text-2xl font-bold text-gray-900">{userProfile.filesCount}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Membro dal</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userProfile.createdAt?.toLocaleDateString('it-IT') || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <div className="max-w-xl">
            <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Dati di Fatturazione
            </h2>

            <div className="space-y-6">
              {/* User Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tipo di account</label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      userType === 'individual' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
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
                    <User className="w-5 h-5 text-gray-600 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">Privato</div>
                      <div className="text-sm text-gray-500">Uso personale</div>
                    </div>
                  </label>
                  <label
                    className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      userType === 'business' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
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
                    <Building2 className="w-5 h-5 text-gray-600 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">Azienda</div>
                      <div className="text-sm text-gray-500">Uso aziendale</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    value={billingFirstName}
                    onChange={(e) => setBillingFirstName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cognome</label>
                  <input
                    type="text"
                    value={billingLastName}
                    onChange={(e) => setBillingLastName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Business Information */}
              {userType === 'business' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome azienda</label>
                    <input
                      type="text"
                      value={billingCompanyName}
                      onChange={(e) => setBillingCompanyName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Partita IVA</label>
                      <input
                        type="text"
                        value={billingVatNumber}
                        onChange={(e) => setBillingVatNumber(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Codice fiscale</label>
                      <input
                        type="text"
                        value={billingTaxCode}
                        onChange={(e) => setBillingTaxCode(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Indirizzo</label>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Città</label>
                    <input
                      type="text"
                      value={billingCity}
                      onChange={(e) => setBillingCity(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CAP</label>
                    <input
                      type="text"
                      value={billingPostalCode}
                      onChange={(e) => setBillingPostalCode(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Paese</label>
                    <select
                      value={billingCountry}
                      onChange={(e) => setBillingCountry(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="IT">Italia</option>
                      <option value="US">Stati Uniti</option>
                      <option value="FR">Francia</option>
                      <option value="DE">Germania</option>
                      <option value="ES">Spagna</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefono</label>
                  <input
                    type="tel"
                    value={billingPhone}
                    onChange={(e) => setBillingPhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={handleSaveBilling} loading={savingBilling}>
                  Aggiorna Dati di Fatturazione
                </Button>

                {billingMessage && (
                  <p className="text-sm text-gray-600">{billingMessage}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account */}
        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <div className="max-w-xl">
            <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Elimina Account
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Una volta eliminato il tuo account, tutte le sue risorse e dati saranno cancellati permanentemente.
              Prima di eliminare il tuo account, scarica tutti i dati o informazioni che desideri conservare.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Elimina Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Elimina Account
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Sei sicuro di voler eliminare il tuo account? Una volta eliminato il tuo account,
              tutte le sue risorse e dati saranno cancellati permanentemente.
              Inserisci la tua password per confermare che vuoi eliminare permanentemente il tuo account.
            </p>

            <div className="mb-6">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder="Password"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Annulla
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePassword}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleting ? 'Eliminazione...' : 'Elimina Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
