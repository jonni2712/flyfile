'use client';

import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  transparentBg?: boolean;
}

export default function MainLayout({ children, showFooter = true, transparentBg = false }: MainLayoutProps) {
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
