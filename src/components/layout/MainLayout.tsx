'use client';

import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      {/* Spacer for fixed navigation */}
      <div className="h-16"></div>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
