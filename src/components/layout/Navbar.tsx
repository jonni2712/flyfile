'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, ChevronDown, LayoutDashboard, User, LogOut, HelpCircle } from 'lucide-react';

export default function Navbar() {
  const { user, userProfile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/30 shadow-lg">
      {/* Primary Navigation Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="shrink-0 flex items-center">
              <Link href="/" className="flex items-center group">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  FlyFile
                </span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-semibold text-slate-800 hover:text-blue-600 hover:border-blue-400 transition duration-300 ease-in-out"
              >
                Home
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-semibold text-slate-800 hover:text-blue-600 hover:border-blue-400 transition duration-300 ease-in-out"
              >
                Upload
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-semibold text-slate-800 hover:text-blue-600 hover:border-blue-400 transition duration-300 ease-in-out"
              >
                Prezzi
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-semibold text-slate-800 hover:text-blue-600 hover:border-blue-400 transition duration-300 ease-in-out"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Supporto
              </Link>
            </div>
          </div>

          {/* Settings Dropdown */}
          <div className="hidden sm:flex sm:items-center sm:ml-6">
            {user ? (
              <div className="ml-3 relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl text-sm font-medium text-slate-800 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 shadow-sm"
                >
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full mr-3 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                      {getInitials(userProfile?.displayName || user.email || 'U')}
                    </div>
                  )}
                  <div>{userProfile?.displayName || user.email}</div>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>

                {isDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-lg border border-white/40 rounded-2xl shadow-2xl z-50">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-200/50">
                        <p className="text-sm font-medium text-gray-900">{userProfile?.displayName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>

                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profilo
                      </Link>

                      <div className="border-t border-gray-200/50 mt-2 pt-2">
                        <button
                          onClick={() => {
                            signOut();
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Esci
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-slate-800 hover:text-blue-600 px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Accedi
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Registrati
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-800 hover:text-blue-600 hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-lg border-t border-gray-200">
            <Link
              href="/"
              className="block pl-3 pr-4 py-2 text-base font-semibold text-slate-800 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/upload"
              className="block pl-3 pr-4 py-2 text-base font-semibold text-slate-800 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Upload
            </Link>
            <Link
              href="/pricing"
              className="block pl-3 pr-4 py-2 text-base font-semibold text-slate-800 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Prezzi
            </Link>
            <Link
              href="/support"
              className="block pl-3 pr-4 py-2 text-base font-semibold text-slate-800 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Supporto
            </Link>
          </div>

          {user ? (
            <div className="pt-4 pb-1 border-t border-white/40 bg-white/90 backdrop-blur-lg">
              <div className="px-4">
                <div className="font-medium text-base text-gray-800">{userProfile?.displayName}</div>
                <div className="font-medium text-sm text-gray-500">{user.email}</div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/dashboard"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Profilo
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Esci
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-1 border-t border-white/40 bg-white/90 backdrop-blur-lg">
              <div className="space-y-1 px-4">
                <Link
                  href="/login"
                  className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Accedi
                </Link>
                <Link
                  href="/register"
                  className="block py-2 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Registrati
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
