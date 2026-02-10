'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, ChevronDown, Check, X as XIcon, Zap, Settings, HelpCircle, FileText, LogOut, Search, ArrowUpDown, Copy, ExternalLink, Trash2, Calendar, Download, Lock, FolderOpen } from 'lucide-react';
import { PLANS } from '@/types';
import { formatBytes } from '@/lib/format';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PRICING_PLANS, COMPARISON_SECTIONS, FAQ_ITEMS } from '@/data/pricing';

interface TransferItem {
  id: string;
  title: string;
  originalName: string;
  size: number;
  downloadCount: number;
  createdAt: Date;
  expiresAt?: Date;
  hasPassword: boolean;
  isExpired: boolean;
  r2Key: string;
  recipientEmail?: string;
}

export default function Navbar() {
  const { user, userProfile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isTransfersOpen, setIsTransfersOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Transfers panel state
  const [transfersTab, setTransfersTab] = useState<'sent' | 'requested' | 'received'>('sent');
  const [transfersList, setTransfersList] = useState<TransferItem[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [transfersSearch, setTransfersSearch] = useState('');
  const [transfersSortBy, setTransfersSortBy] = useState<'date' | 'size' | 'title' | 'expiry'>('date');
  const [transfersSortOpen, setTransfersSortOpen] = useState(false);
  const [transferToast, setTransferToast] = useState<string | null>(null);

  // Listen for openPricing custom event (from Footer or /pricing redirect)
  useEffect(() => {
    const handleOpenPricing = () => setIsPricingOpen(true);
    window.addEventListener('openPricing', handleOpenPricing);
    return () => window.removeEventListener('openPricing', handleOpenPricing);
  }, []);

  // Fetch transfers when panel opens
  const fetchTransfers = useCallback(async () => {
    if (!user) return;
    setTransfersLoading(true);
    try {
      const filesRef = collection(db, 'files');
      const q = query(
        filesRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const list: TransferItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const expiresAt = data.expiresAt?.toDate();
        list.push({
          id: docSnap.id,
          title: data.title || data.originalName || 'Trasferimento senza titolo',
          originalName: data.originalName,
          size: data.size,
          downloadCount: data.downloadCount || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt,
          hasPassword: !!data.password,
          isExpired: expiresAt ? expiresAt < new Date() : false,
          r2Key: data.r2Key,
          recipientEmail: data.recipientEmail,
        });
      });
      setTransfersList(list);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setTransfersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isTransfersOpen && user) {
      fetchTransfers();
    }
  }, [isTransfersOpen, user, fetchTransfers]);

  const filteredTransfers = transfersList
    .filter((t) => {
      if (transfersSearch.trim()) {
        const q = transfersSearch.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.originalName.toLowerCase().includes(q) || (t.recipientEmail && t.recipientEmail.toLowerCase().includes(q));
      }
      return true;
    })
    .sort((a, b) => {
      switch (transfersSortBy) {
        case 'size': return b.size - a.size;
        case 'title': return a.title.localeCompare(b.title);
        case 'expiry': return (b.expiresAt?.getTime() || 0) - (a.expiresAt?.getTime() || 0);
        default: return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${id}`);
    setTransferToast('Link copiato!');
    setTimeout(() => setTransferToast(null), 2000);
  };

  const handleDeleteTransfer = async (id: string, r2Key: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo trasferimento?')) return;
    try {
      await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: id, r2Key }),
      });
      await deleteDoc(doc(db, 'files', id));
      setTransfersList((prev) => prev.filter((t) => t.id !== id));
    } catch {
      console.error('Error deleting transfer');
    }
  };

  const formatTransferDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof PRICING_PLANS[number]) => {
    if (plan.id === 'free') {
      setIsPricingOpen(false);
      window.location.href = '/registrati';
      return;
    }

    if (!user) {
      setIsPricingOpen(false);
      window.location.href = '/registrati';
      return;
    }

    setCheckoutError(null);
    setCheckoutLoading(plan.id);

    try {
      const priceId = isAnnual ? plan.stripePriceIdAnnual : plan.stripePriceIdMonthly;
      const token = await user.getIdToken();

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': 'client',
        },
        body: JSON.stringify({
          planId: plan.id,
          priceId,
          billingCycle: isAnnual ? 'annual' : 'monthly',
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || 'Errore nella creazione del checkout');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      setCheckoutError('Errore di connessione. Riprova.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 mt-3">
        <div className="px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo — far left */}
            <div className="shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-white">
                  FlyFile
                </span>
              </Link>
            </div>

            {/* Right side — white pill bar containing everything */}
            <div className="hidden sm:flex items-center bg-white rounded-full px-2 py-1.5 shadow-sm">
              {/* Nav Links */}
              {user && (
                <button
                  onClick={() => setIsTransfersOpen(true)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
                >
                  Trasferimenti
                </button>
              )}
              <button
                onClick={() => setIsPricingOpen(true)}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
              >
                Prezzi
              </button>
              <Link
                href="/chi-siamo"
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
              >
                Chi siamo
              </Link>
              <Link
                href="/supporto"
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
              >
                Supporto
              </Link>

              {/* Separator */}
              <div className="w-px h-5 bg-gray-200 mx-2" />

              {/* Auth area */}
              {user ? (
                <div className="relative flex items-center gap-2">
                  <div className="flex items-center gap-0">
                    {/* Upgrade button - only for non-business */}
                    {userProfile?.plan !== 'business' && (
                      <button
                        onClick={() => setIsPricingOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-l-full text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <Zap className="w-4 h-4" />
                        Effettua l&apos;upgrade
                      </button>
                    )}

                    {/* Email + Plan + Avatar pill */}
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`flex items-center gap-3 px-4 py-1.5 border border-gray-200 ${
                        userProfile?.plan !== 'business' ? 'rounded-r-full border-l-0' : 'rounded-full'
                      } hover:bg-gray-50 transition-colors`}
                    >
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 leading-tight">{user.email}</p>
                        <p className="text-xs text-gray-500 leading-tight">Piano {PLANS[userProfile?.plan || 'free']?.name || 'Free'}</p>
                      </div>
                      {userProfile?.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt="Avatar"
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {getInitials(userProfile?.displayName || user.email || 'U')}
                        </div>
                      )}
                    </button>
                  </div>

                  {isDropdownOpen && (
                    <div className="origin-top-right absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                      {/* Top: Avatar + Email */}
                      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
                        {userProfile?.photoURL ? (
                          <img src={userProfile.photoURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(userProfile?.displayName || user.email || 'U')}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        </div>
                        <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      </div>

                      {/* Plan info + usage bars */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          Piano {PLANS[userProfile?.plan || 'free']?.name || 'Free'}
                        </p>

                        {/* Transfers bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Trasferimenti</span>
                            <span>
                              {userProfile?.maxMonthlyTransfers === -1
                                ? 'Illimitato'
                                : `${userProfile?.monthlyTransfers || 0}/${userProfile?.maxMonthlyTransfers || 0}`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-900 rounded-full transition-all"
                              style={{
                                width: userProfile?.maxMonthlyTransfers === -1
                                  ? '100%'
                                  : `${Math.min(100, ((userProfile?.monthlyTransfers || 0) / (userProfile?.maxMonthlyTransfers || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Storage bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Storage</span>
                            <span>
                              {userProfile?.storageLimit === -1
                                ? 'Illimitato'
                                : `${formatBytes(userProfile?.storageUsed || 0)}/${formatBytes(userProfile?.storageLimit || 0)}`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-900 rounded-full transition-all"
                              style={{
                                width: userProfile?.storageLimit === -1
                                  ? '100%'
                                  : `${Math.min(100, ((userProfile?.storageUsed || 0) / (userProfile?.storageLimit || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Upgrade link for non-business */}
                        {userProfile?.plan !== 'business' && (
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsPricingOpen(true);
                            }}
                            className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors mt-1"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Rimuovi limiti
                          </button>
                        )}
                      </div>

                      {/* Menu links */}
                      <div className="py-1">
                        <Link
                          href="/settings/profile"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3 text-gray-400" />
                          Impostazioni account
                        </Link>
                        <Link
                          href="/supporto"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <HelpCircle className="w-4 h-4 mr-3 text-gray-400" />
                          Assistenza
                        </Link>
                        <Link
                          href="/privacy"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FileText className="w-4 h-4 mr-3 text-gray-400" />
                          Informazioni legali e Privacy
                        </Link>
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={() => {
                            signOut();
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Esci
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Link
                    href="/accedi"
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/registrati"
                    className="px-5 py-1.5 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-full transition-colors"
                  >
                    Iscrizione
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="sm:hidden bg-white border-t border-gray-200">
            <div className="py-2 space-y-1">
              {user && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsTransfersOpen(true);
                  }}
                  className="block w-full text-left px-4 py-2.5 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors"
                >
                  Trasferimenti
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsPricingOpen(true);
                }}
                className="block w-full text-left px-4 py-2.5 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors"
              >
                Prezzi
              </button>
              <Link
                href="/chi-siamo"
                className="block px-4 py-2.5 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Chi siamo
              </Link>
              <Link
                href="/supporto"
                className="block px-4 py-2.5 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Supporto
              </Link>
            </div>

            {user ? (
              <div className="border-t border-gray-200 py-3">
                <div className="px-4 mb-2 flex items-center gap-3">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Avatar" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {getInitials(userProfile?.displayName || user?.email || 'U')}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-sm text-gray-900">{user.email}</div>
                    <div className="text-xs text-gray-500">Piano {PLANS[userProfile?.plan || 'free']?.name || 'Free'}</div>
                  </div>
                </div>
                {userProfile?.plan !== 'business' && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsPricingOpen(true);
                    }}
                    className="mx-4 mb-2 flex items-center justify-center gap-1.5 w-[calc(100%-2rem)] py-2.5 border border-gray-200 rounded-full text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Effettua l&apos;upgrade
                  </button>
                )}
                <div className="space-y-1">
                  <Link
                    href="/settings/profile"
                    className="block px-4 py-2.5 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Impostazioni account
                  </Link>
                  <Link
                    href="/supporto"
                    className="block px-4 py-2.5 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Assistenza
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2.5 text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Esci
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 py-3 px-4 flex items-center gap-3">
                <Link
                  href="/accedi"
                  className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/registrati"
                  className="flex-1 text-center py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Iscrizione
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Pricing Slide Panel */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          isPricingOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsPricingOpen(false)}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[1100px] bg-white z-[70] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isPricingOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close button */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => setIsPricingOpen(false)}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">Chiudi</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 pb-16">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Piani e prezzi
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
              Che tu stia inviando grandi file per lavoro o per condividere i tuoi progetti creativi, abbiamo il piano giusto per te.
            </p>

            {/* Monthly/Annual Toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  !isAnnual ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:text-black'
                }`}
              >
                Una volta al mese
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  isAnnual ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:text-black'
                }`}
              >
                Annuale
                <span className="ml-1.5 text-xs text-green-500 font-semibold">-20%</span>
              </button>
            </div>
          </div>

          {/* Checkout Error */}
          {checkoutError && (
            <div className="max-w-5xl mx-auto mb-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
                {checkoutError}
              </div>
            </div>
          )}

          {/* Plan Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan) => {
              const isCurrentPlan = user && (userProfile?.plan || 'free') === plan.id;
              return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 flex flex-col transition-shadow hover:shadow-lg ${
                  isCurrentPlan
                    ? 'border-green-500 shadow-md'
                    : plan.popular
                      ? 'border-blue-500 shadow-md'
                      : plan.borderColor
                        ? `${plan.borderColor} border-opacity-30`
                        : 'border-gray-200'
                }`}
              >
                {/* Badge */}
                {isCurrentPlan ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                      Piano attuale
                    </span>
                  </div>
                ) : plan.popular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Più popolare
                    </span>
                  </div>
                ) : plan.badge ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                ) : null}

                <div className={isCurrentPlan || plan.popular || plan.badge ? 'mt-2' : ''}>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-5">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.priceMonthly === 0
                      ? '0'
                      : `${((isAnnual ? plan.priceAnnual : plan.priceMonthly) / 100).toFixed(0)}`
                    } &euro;
                  </span>
                  {plan.priceMonthly > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Al mese, fatturato {isAnnual ? 'annualmente' : 'mensilmente'}.
                    </p>
                  )}
                  {plan.priceMonthly === 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Goditi FlyFile gratuitamente
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => !isCurrentPlan && handleSubscribe(plan)}
                  disabled={!!isCurrentPlan || checkoutLoading === plan.id}
                  className={`w-full py-2.5 rounded-full text-sm font-semibold transition-colors ${
                    isCurrentPlan
                      ? 'bg-green-500 text-white cursor-default'
                      : checkoutLoading === plan.id
                        ? 'bg-gray-300 text-gray-500 cursor-wait'
                        : plan.popular
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : plan.id === 'free'
                            ? 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                            : 'border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  {isCurrentPlan ? 'Piano attivo' : checkoutLoading === plan.id ? 'Caricamento...' : plan.cta}
                </button>
              </div>
              );
            })}
          </div>

          {/* Feature Comparison Table */}
          <div className="mt-20 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Scegli il piano che fa per te
              </h3>
              <p className="text-gray-500 text-base">
                Confronta tutte le funzionalità dei nostri piani
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              {/* Sticky column headers */}
              <div className="grid grid-cols-5 bg-gray-50 border-b border-gray-200">
                <div className="py-4 px-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Funzionalità
                </div>
                {['Free', 'Starter', 'Pro', 'Business'].map((name, i) => (
                  <div
                    key={name}
                    className={`py-4 px-3 text-center text-sm font-bold ${
                      i === 2 ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    {name}
                    {i === 2 && (
                      <span className="block text-[10px] font-semibold text-blue-500 uppercase tracking-wider mt-0.5">
                        Popolare
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {COMPARISON_SECTIONS.map((section, sIdx) => (
                <div key={sIdx}>
                  {/* Section header */}
                  <div className="grid grid-cols-5 bg-white border-b border-gray-200">
                    <div className="col-span-5 px-5 py-4">
                      <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          sIdx === 0 ? 'bg-blue-500' : sIdx === 1 ? 'bg-purple-500' : 'bg-orange-500'
                        }`} />
                        {section.title}
                      </h4>
                    </div>
                  </div>

                  {section.features.map((row, rIdx) => (
                    <div
                      key={rIdx}
                      className="grid grid-cols-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="py-3.5 px-5 text-sm text-gray-700 flex items-center">
                        {row[0] as string}
                      </div>
                      {([row[1], row[2], row[3], row[4]] as (boolean | string)[]).map((val, cIdx) => (
                        <div
                          key={cIdx}
                          className={`py-3.5 px-3 text-center text-sm flex items-center justify-center ${
                            cIdx === 2 ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          {typeof val === 'boolean' ? (
                            val ? (
                              <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-blue-600" />
                              </span>
                            ) : (
                              <span className="text-gray-300">&mdash;</span>
                            )
                          ) : (
                            <span className="font-semibold text-gray-900">{val}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto pb-12">
            <div className="text-center mb-10">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Domande frequenti
              </h3>
              <p className="text-gray-500 text-base">
                Tutto quello che devi sapere sui nostri piani e servizi
              </p>
            </div>

            <div className="space-y-0">
              {FAQ_ITEMS.map((item, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-200 first:border-t"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between py-6 text-left group"
                  >
                    <span className="text-lg font-semibold text-gray-900 pr-6 group-hover:text-blue-600 transition-colors">
                      {item.question}
                    </span>
                    <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      openFaq === idx
                        ? 'border-blue-500 bg-blue-500 text-white rotate-0'
                        : 'border-gray-300 text-gray-400 group-hover:border-blue-400 group-hover:text-blue-400'
                    }`}>
                      <span className="text-lg font-light leading-none">
                        {openFaq === idx ? '−' : '+'}
                      </span>
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      openFaq === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-6 pr-16 text-base text-gray-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transfers Slide Panel */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          isTransfersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsTransfersOpen(false)}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[900px] bg-white z-[70] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isTransfersOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Toast */}
        {transferToast && (
          <div className="absolute top-4 right-4 z-20 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
            {transferToast}
          </div>
        )}

        {/* Close button */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => setIsTransfersOpen(false)}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">Chiudi</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 pb-16">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
              {user?.email}
            </p>
            <h2 className="text-4xl font-bold text-gray-900">
              Trasferimenti
            </h2>
            {userProfile?.plan !== 'free' && (
              <p className="text-sm text-gray-500 mt-2">
                {formatBytes(userProfile?.storageUsed || 0)} utilizzati su{' '}
                {userProfile?.storageLimit === -1 ? 'Illimitato' : formatBytes(userProfile?.storageLimit || 0)}
              </p>
            )}
          </div>

          {/* Tabs + Sort */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setTransfersTab('sent')}
                className={`pb-2 text-base font-medium transition-colors ${
                  transfersTab === 'sent'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Inviati
              </button>
              <button
                onClick={() => setTransfersTab('requested')}
                className={`pb-2 text-base font-medium transition-colors ${
                  transfersTab === 'requested'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Richiesti
              </button>
              <button
                onClick={() => setTransfersTab('received')}
                className={`pb-2 text-base font-medium transition-colors ${
                  transfersTab === 'received'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Ricevuti
              </button>
            </div>

            <div className="relative flex items-center gap-2">
              <span className="text-sm text-gray-400">Ordina per:</span>
              <button
                onClick={() => setTransfersSortOpen(!transfersSortOpen)}
                className="flex items-center gap-1 text-sm font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors"
              >
                {{ date: 'Data', size: 'Dimensioni', title: 'Titolo', expiry: 'Data di scadenza' }[transfersSortBy]}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {transfersSortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setTransfersSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                    {([
                      { key: 'date', label: 'Data' },
                      { key: 'size', label: 'Dimensioni' },
                      { key: 'title', label: 'Titolo' },
                      { key: 'expiry', label: 'Data di scadenza' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setTransfersSortBy(opt.key);
                          setTransfersSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          transfersSortBy === opt.key
                            ? 'bg-blue-500 text-white font-medium'
                            : opt.key === 'expiry'
                              ? 'text-blue-600 hover:bg-gray-50'
                              : 'text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={transfersSearch}
              onChange={(e) => setTransfersSearch(e.target.value)}
              placeholder="Cerca per titolo, nome del file o e-mail"
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Usage Stats — full boxes only for free plan */}
          {userProfile?.plan === 'free' ? (
            <div className="space-y-3 mb-10">
              {/* Transfers usage */}
              <div className="flex items-center gap-4 bg-purple-50/60 border border-purple-100 rounded-xl p-4">
                <div className="shrink-0">
                  <span className="text-sm font-bold text-purple-700">
                    {userProfile?.monthlyTransfers || 0}<span className="text-purple-400">/{userProfile?.maxMonthlyTransfers || 0}</span>
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    Hai utilizzato{' '}
                    <strong>{userProfile?.monthlyTransfers || 0}/{userProfile?.maxMonthlyTransfers || 0} trasferimenti</strong>{' '}
                    negli ultimi 30 giorni. Ogni trasferimento smette di contare verso il tuo limite 30 giorni dopo essere stato caricato.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsTransfersOpen(false);
                    setIsPricingOpen(true);
                  }}
                  className="shrink-0 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-full hover:bg-purple-700 transition-colors"
                >
                  Aumenta il limite
                </button>
              </div>

              {/* Storage usage */}
              <div className="flex items-center gap-4 bg-purple-50/60 border border-purple-100 rounded-xl p-4">
                <div className="shrink-0">
                  <span className="text-sm font-bold text-purple-700">
                    {formatBytes(userProfile?.storageUsed || 0).split(' ')[0]}<span className="text-purple-400">/{formatBytes(userProfile?.storageLimit || 0)}</span>
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    Hai caricato{' '}
                    <strong>{formatBytes(userProfile?.storageUsed || 0)}/{formatBytes(userProfile?.storageLimit || 0)}</strong>{' '}
                    negli ultimi 30 giorni. Ogni trasferimento smette di contare verso il tuo limite 30 giorni dopo essere stato caricato.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsTransfersOpen(false);
                    setIsPricingOpen(true);
                  }}
                  className="shrink-0 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-full hover:bg-purple-700 transition-colors"
                >
                  Aumenta il limite
                </button>
              </div>
            </div>
          ) : null}

          {/* Transfer List */}
          {transfersTab === 'sent' && (
            <>
              {transfersLoading ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Caricamento...</p>
                </div>
              ) : filteredTransfers.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransfers.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">{transfer.title}</h4>
                            {transfer.isExpired ? (
                              <span className="shrink-0 text-[10px] font-medium bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Scaduto</span>
                            ) : (
                              <span className="shrink-0 text-[10px] font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Attivo</span>
                            )}
                            {transfer.hasPassword && (
                              <Lock className="w-3 h-3 text-gray-400 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatTransferDate(transfer.createdAt)}
                            </span>
                            <span>{formatBytes(transfer.size)}</span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {transfer.downloadCount}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopyLink(transfer.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copia link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/s/${transfer.id}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Apri"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          {userProfile?.plan !== 'free' && (
                            <button
                              onClick={() => handleDeleteTransfer(transfer.id, transfer.r2Key)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Elimina"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Tutti i trasferimenti che invii saranno visualizzati qui
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Controlla lo stato del download oppure modifica, inoltra o elimina il trasferimento
                  </p>
                </div>
              )}
            </>
          )}

          {transfersTab === 'requested' && (
            <div className="py-16 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Le richieste di file saranno visualizzate qui
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Quando richiedi file a qualcuno, troverai i risultati in questa sezione
              </p>
            </div>
          )}

          {transfersTab === 'received' && (
            <div className="py-16 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                I trasferimenti ricevuti saranno visualizzati qui
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Quando qualcuno ti invia dei file, li troverai in questa sezione
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
