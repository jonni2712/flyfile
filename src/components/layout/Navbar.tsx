'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, Check, Zap, Settings, HelpCircle, FileText, LogOut } from 'lucide-react';
import { PLANS } from '@/types';
import { formatBytes } from '@/lib/format';

const PricingPanel = dynamic(() => import('./PricingPanel'), { ssr: false });
const TransfersPanel = dynamic(() => import('./TransfersPanel'), { ssr: false });

export default function Navbar() {
  const { user, userProfile, signOut } = useAuth();
  const t = useTranslations('navbar');

  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isTransfersOpen, setIsTransfersOpen] = useState(false);

  // Listen for openPricing custom event (from Footer or /pricing redirect)
  useEffect(() => {
    const handleOpenPricing = () => setIsPricingOpen(true);
    window.addEventListener('openPricing', handleOpenPricing);
    return () => window.removeEventListener('openPricing', handleOpenPricing);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Update theme-color when mobile menu opens/closes
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) return;

    if (isOpen) {
      meta.dataset.prevColor = meta.content || '#3b82f6';
      meta.content = '#030712';
    } else if (meta.dataset.prevColor) {
      meta.content = meta.dataset.prevColor;
      delete meta.dataset.prevColor;
    }
  }, [isOpen]);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 mt-3">
        <div className="px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo — far left (desktop only) */}
            <div className="hidden sm:flex shrink-0 items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-white">
                  FlyFile
                </span>
              </Link>
            </div>

            {/* Mobile header: hamburger LEFT | logo CENTER | register RIGHT */}
            <div className="flex sm:hidden items-center justify-between w-full">
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                className="inline-flex items-center justify-center p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px]"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link href="/" className="text-2xl font-bold text-white">
                FlyFile
              </Link>
              {!user ? (
                <Link
                  href="/registrati"
                  className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full transition-colors min-h-[44px] flex items-center"
                >
                  {t('register')}
                </Link>
              ) : (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(userProfile?.displayName || user.email || 'U')}
                    </div>
                  )}
                </button>
              )}
            </div>

            {/* Right side — white pill bar containing everything */}
            <div className="hidden sm:flex items-center bg-white rounded-full px-2 py-1.5 shadow-sm">
              {/* Nav Links */}
              {user && (
                <button
                  onClick={() => setIsTransfersOpen(true)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors min-h-[44px]"
                >
                  {t('transfers')}
                </button>
              )}
              <button
                onClick={() => setIsPricingOpen(true)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors min-h-[44px]"
              >
                {t('pricing')}
              </button>
              <Link
                href="/chi-siamo"
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors min-h-[44px] flex items-center"
              >
                {t('aboutUs')}
              </Link>
              <Link
                href="/supporto"
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors min-h-[44px] flex items-center"
              >
                {t('support')}
              </Link>

              {/* Separator */}
              <div className="w-px h-5 bg-gray-200 mx-2" />

              {/* Auth area */}
              {user ? (
                <div className="relative flex items-center gap-2">
                  <div className="flex items-center gap-0">
                    {/* Upgrade button - only for free users */}
                    {(!userProfile?.plan || userProfile.plan === 'free') && (
                      <button
                        onClick={() => setIsPricingOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-l-full text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors min-h-[44px]"
                      >
                        <Zap className="w-4 h-4" />
                        {t('upgrade')}
                      </button>
                    )}

                    {/* Email + Plan + Avatar pill */}
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="true"
                      className={`flex items-center gap-3 px-4 py-1.5 border border-gray-200 ${
                        !userProfile?.plan || userProfile.plan === 'free' ? 'rounded-r-full border-l-0' : 'rounded-full'
                      } hover:bg-gray-50 transition-colors min-h-[44px]`}
                    >
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 leading-tight">{user.email}</p>
                        <p className="text-xs text-gray-500 leading-tight">{t('plan', { plan: PLANS[userProfile?.plan || 'free']?.name || 'Free' })}</p>
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
                          {t('plan', { plan: PLANS[userProfile?.plan || 'free']?.name || 'Free' })}
                        </p>

                        {/* Transfers bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{t('transfers')}</span>
                            <span>
                              {userProfile?.maxMonthlyTransfers === -1
                                ? t('transfersPanel.unlimited')
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
                                ? t('transfersPanel.unlimited')
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

                        {/* Upgrade link - only for free users */}
                        {(!userProfile?.plan || userProfile.plan === 'free') && (
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsPricingOpen(true);
                            }}
                            className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors mt-1"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            {t('removeLimits')}
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
                          {t('accountSettings')}
                        </Link>
                        <Link
                          href="/supporto"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <HelpCircle className="w-4 h-4 mr-3 text-gray-400" />
                          {t('help')}
                        </Link>
                        <Link
                          href="/privacy"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FileText className="w-4 h-4 mr-3 text-gray-400" />
                          {t('legalPrivacy')}
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
                          {t('signOut')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Link
                    href="/accedi"
                    className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors min-h-[44px] flex items-center"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/registrati"
                    className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-full transition-colors min-h-[44px] flex items-center"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>

      </nav>

      {/* Mobile Full-Screen Overlay Menu */}
      <div
        className={`fixed inset-0 z-[60] bg-gray-950 sm:hidden flex flex-col transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {/* Top bar — mirrors the mobile header */}
        <div className="px-4 mt-3">
          <div className="flex items-center justify-between h-16">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="inline-flex items-center justify-center p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px]"
            >
              <X className="h-6 w-6" />
            </button>
            {/* Logo */}
            <span className="text-2xl font-bold text-white">FlyFile</span>
            {/* Register / Avatar */}
            {!user ? (
              <Link
                href="/registrati"
                className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full transition-colors min-h-[44px] flex items-center"
                onClick={() => setIsOpen(false)}
              >
                {t('register')}
              </Link>
            ) : (
              <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(userProfile?.displayName || user.email || 'U')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Menu items — centered vertically */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-full max-w-sm">
            {user && (
              <>
                <button
                  onClick={() => { setIsOpen(false); setIsTransfersOpen(true); }}
                  className="w-full py-5 text-2xl font-medium text-white text-center hover:text-white/80 transition-colors"
                >
                  {t('transfers')}
                </button>
                <div className="w-full h-px bg-white/20" />
              </>
            )}
            <button
              onClick={() => { setIsOpen(false); setIsPricingOpen(true); }}
              className="w-full py-5 text-2xl font-medium text-white text-center hover:text-white/80 transition-colors"
            >
              {t('pricing')}
            </button>
            <div className="w-full h-px bg-white/20" />
            <Link
              href="/chi-siamo"
              className="block w-full py-5 text-2xl font-medium text-white text-center hover:text-white/80 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('aboutUs')}
            </Link>
            <div className="w-full h-px bg-white/20" />
            <Link
              href="/supporto"
              className="block w-full py-5 text-2xl font-medium text-white text-center hover:text-white/80 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('support')}
            </Link>

            {user ? (
              <>
                <div className="w-full h-px bg-white/20" />
                <Link
                  href="/settings/profile"
                  className="block w-full py-5 text-2xl font-medium text-white text-center hover:text-white/80 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {t('accountSettings')}
                </Link>
                <div className="w-full h-px bg-white/20" />
                <button
                  onClick={() => { signOut(); setIsOpen(false); }}
                  className="w-full py-5 text-2xl font-medium text-red-400 text-center hover:text-red-300 transition-colors"
                >
                  {t('signOut')}
                </button>
              </>
            ) : (
              <>
                <div className="w-full h-px bg-white/20" />
                <Link
                  href="/accedi"
                  className="block w-full py-5 text-2xl font-medium text-white text-center hover:text-white/80 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {t('login')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lazy-loaded Panels */}
      <PricingPanel isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      <TransfersPanel
        isOpen={isTransfersOpen}
        onClose={() => setIsTransfersOpen(false)}
        onOpenPricing={() => setIsPricingOpen(true)}
      />
    </>
  );
}
