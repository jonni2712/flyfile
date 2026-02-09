'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PLANS } from '@/types';
import { Check, User, Building2, Loader2, CreditCard, Download, ExternalLink, X, AlertTriangle } from 'lucide-react';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string | null;
  amountPaid: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
  hostedUrl: string | null;
}

export default function BillingPage() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const router = useRouter();

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

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  // Portal redirect
  const [redirectingToPortal, setRedirectingToPortal] = useState(false);

  useEffect(() => {
    if (userProfile?.billing) {
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
  }, [userProfile]);

  const fetchPaymentMethods = useCallback(async () => {
    if (!user || !userProfile?.stripeCustomerId) return;
    setLoadingPaymentMethods(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/stripe/payment-methods?userId=${user.uid}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, [user, userProfile?.stripeCustomerId]);

  const fetchInvoices = useCallback(async () => {
    if (!user || !userProfile?.stripeCustomerId) return;
    setLoadingInvoices(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/stripe/invoices?userId=${user.uid}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  }, [user, userProfile?.stripeCustomerId]);

  useEffect(() => {
    fetchPaymentMethods();
    fetchInvoices();
  }, [fetchPaymentMethods, fetchInvoices]);

  const handleSaveBilling = async () => {
    if (!user) return;
    setSavingBilling(true);
    setBillingMessage('');
    try {
      const token = await user.getIdToken();
      const billing = {
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
      };
      const res = await fetch('/api/stripe/update-billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': 'client',
        },
        body: JSON.stringify({ userId: user.uid, billing }),
      });
      if (res.ok) {
        await refreshUserProfile();
        setBillingMessage('Dati di fatturazione aggiornati.');
        setTimeout(() => setBillingMessage(''), 3000);
      } else {
        const data = await res.json();
        setBillingMessage(data.error || 'Errore durante il salvataggio');
      }
    } catch {
      setBillingMessage('Errore durante il salvataggio');
    } finally {
      setSavingBilling(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    setCanceling(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': 'client',
        },
        body: JSON.stringify({ userId: user.uid, cancelImmediately: false }),
      });
      if (res.ok) {
        setShowCancelModal(false);
        await refreshUserProfile();
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    } finally {
      setCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!user) return;
    setReactivating(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/stripe/cancel-subscription?userId=${user.uid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': 'client',
        },
      });
      if (res.ok) {
        await refreshUserProfile();
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    } finally {
      setReactivating(false);
    }
  };

  const handleManagePaymentMethods = async () => {
    if (!user) return;
    setRedirectingToPortal(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': 'client',
        },
        body: JSON.stringify({ userId: user.uid, returnUrl: window.location.href }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening portal:', error);
    } finally {
      setRedirectingToPortal(false);
    }
  };

  if (!user || !userProfile) return null;

  const plan = PLANS[userProfile.plan] || PLANS.free;
  const isPaid = userProfile.plan !== 'free';
  const isCanceling = userProfile.subscriptionStatus === 'canceling' || !!userProfile.cancelAt;
  const isPastDue = userProfile.subscriptionStatus === 'past_due';

  // Status badge
  const getStatusBadge = () => {
    if (isCanceling) {
      return (
        <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
          Annullamento in corso
        </span>
      );
    }
    if (isPastDue) {
      return (
        <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
          Pagamento scaduto
        </span>
      );
    }
    if (isPaid) {
      return (
        <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          Attivo
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
        Free
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getCardBrandName = (brand: string) => {
    const brands: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover',
      diners: 'Diners Club',
      jcb: 'JCB',
      unionpay: 'UnionPay',
    };
    return brands[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Pagata</span>;
      case 'open':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">In attesa</span>;
      case 'void':
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">Annullata</span>;
      case 'uncollectible':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">Non riscossa</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-10">
      {/* Section 1: Your Plan */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Il tuo piano</h2>
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xl font-bold text-gray-900">{plan.name}</span>
            {getStatusBadge()}
          </div>

          {isPaid && userProfile.billingCycle && (
            <p className="text-sm text-gray-500 mb-4">
              Fatturazione {userProfile.billingCycle === 'annual' ? 'annuale' : 'mensile'}
            </p>
          )}

          {isCanceling && userProfile.cancelAt && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                Il tuo abbonamento scadrà il <strong>{formatDate(userProfile.cancelAt)}</strong>
              </p>
              <button
                onClick={handleReactivateSubscription}
                disabled={reactivating}
                className="ml-auto px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-full transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {reactivating && <Loader2 className="w-3 h-3 animate-spin" />}
                Riattiva
              </button>
            </div>
          )}

          {userProfile.pendingPlan && userProfile.planChangeAt && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-sm text-blue-700">
                Dal <strong>{formatDate(userProfile.planChangeAt)}</strong> passerai al piano <strong>{PLANS[userProfile.pendingPlan]?.name || userProfile.pendingPlan}</strong>
              </p>
            </div>
          )}

          <ul className="space-y-2 mb-6">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="border-t border-gray-100 pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push('/pricing')}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Cambia piano
            </button>
            {isPaid && !isCanceling && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-5 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
              >
                Annulla abbonamento
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Payment Method */}
      {userProfile.stripeCustomerId && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Metodo di pagamento</h2>
          <div className="border border-gray-200 rounded-xl p-6">
            {loadingPaymentMethods ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {getCardBrandName(pm.brand)}
                        </span>
                        <span className="text-sm text-gray-600">
                          &bull;&bull;&bull;&bull; {pm.last4}
                        </span>
                        {pm.isDefault && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
                            Predefinita
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Scadenza {String(pm.expMonth).padStart(2, '0')}/{pm.expYear}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">
                Nessun metodo di pagamento collegato
              </p>
            )}
            <div className="mt-4">
              <button
                onClick={handleManagePaymentMethods}
                disabled={redirectingToPortal}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {redirectingToPortal ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Gestisci metodi di pagamento
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Billing Data */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dati di Fatturazione</h2>

        <div className="space-y-5">
          {/* User type toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo di account</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${
                  userType === 'individual' ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                }`}
              >
                <input type="radio" name="user_type" value="individual" checked={userType === 'individual'} onChange={() => setUserType('individual')} className="sr-only" />
                <User className="w-4 h-4 text-gray-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Privato</div>
                </div>
              </label>
              <label
                className={`flex items-center p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${
                  userType === 'business' ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                }`}
              >
                <input type="radio" name="user_type" value="business" checked={userType === 'business'} onChange={() => setUserType('business')} className="sr-only" />
                <Building2 className="w-4 h-4 text-gray-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Azienda</div>
                </div>
              </label>
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" value={billingFirstName} onChange={(e) => setBillingFirstName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
              <input type="text" value={billingLastName} onChange={(e) => setBillingLastName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
            </div>
          </div>

          {/* Business fields */}
          {userType === 'business' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome azienda</label>
                <input type="text" value={billingCompanyName} onChange={(e) => setBillingCompanyName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partita IVA</label>
                  <input type="text" value={billingVatNumber} onChange={(e) => setBillingVatNumber(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Codice fiscale</label>
                  <input type="text" value={billingTaxCode} onChange={(e) => setBillingTaxCode(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
                </div>
              </div>
            </>
          )}

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
            <input type="text" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
              <input type="text" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
              <input type="text" value={billingPostalCode} onChange={(e) => setBillingPostalCode(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paese</label>
              <select value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900">
                <option value="IT">Italia</option>
                <option value="US">Stati Uniti</option>
                <option value="FR">Francia</option>
                <option value="DE">Germania</option>
                <option value="ES">Spagna</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
            <input type="tel" value={billingPhone} onChange={(e) => setBillingPhone(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveBilling}
              disabled={savingBilling}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingBilling && <Loader2 className="w-4 h-4 animate-spin" />}
              Aggiorna Dati di Fatturazione
            </button>
            {billingMessage && <p className="text-sm text-gray-600">{billingMessage}</p>}
          </div>
        </div>
      </section>

      {/* Section 4: Receipts */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ricevute</h2>
        {loadingInvoices ? (
          <div className="border border-gray-200 rounded-xl p-6 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : invoices.length > 0 ? (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Data</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Importo</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Stato</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Scarica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {invoice.date ? formatDate(invoice.date) : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(invoice.amountPaid, invoice.currency)}
                    </td>
                    <td className="px-6 py-4">
                      {getInvoiceStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {invoice.pdfUrl ? (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-500">
              Le tue ricevute saranno visualizzate qui, ma sembra che tu non ne abbia ancora.
            </p>
          </div>
        )}
      </section>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Annulla abbonamento</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Il tuo abbonamento rimarrà attivo fino alla fine del periodo di fatturazione corrente. Dopo quella data, il tuo account verrà declassato al piano Free.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                Indietro
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {canceling && <Loader2 className="w-4 h-4 animate-spin" />}
                Conferma annullamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
