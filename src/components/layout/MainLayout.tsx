'use client';

import { ReactNode, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  transparentBg?: boolean;
  pageThemeColor?: string;
  pageBodyBg?: string;
}

export default function MainLayout({
  children,
  showFooter = true,
  transparentBg = false,
  pageThemeColor,
  pageBodyBg,
}: MainLayoutProps) {
  useEffect(() => {
    if (transparentBg) return;

    const bg = pageBodyBg || '#030712';
    const tc = pageThemeColor || '#030712';

    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;

    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = tc;

    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
      const metaEl = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (metaEl) metaEl.content = '#3b82f6';
    };
  }, [transparentBg, pageBodyBg, pageThemeColor]);

  return (
    <div className={`min-h-screen flex flex-col ${transparentBg ? '' : 'bg-white'}`}>
      <Navbar />
      {/* Spacer for fixed navigation */}
      <div className="h-16"></div>
      <main role="main" className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
