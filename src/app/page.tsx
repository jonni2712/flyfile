'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Upload, Shield, Zap, Globe, Check } from 'lucide-react';
import { PLANS } from '@/types';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Share Files <span className="text-blue-600">Instantly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload, share, and manage your files with ease. Fast, secure, and simple file sharing for everyone.
          </p>
          <div className="flex justify-center gap-4">
            {user ? (
              <Link href="/upload">
                <Button size="lg">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Files
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg">Get Started Free</Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">Sign In</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose FlyFile?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-blue-600" />}
              title="Lightning Fast"
              description="Upload and share files in seconds with our optimized infrastructure powered by Cloudflare."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-blue-600" />}
              title="Secure & Private"
              description="Your files are encrypted and protected. Set passwords, expiry dates, and download limits."
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8 text-blue-600" />}
              title="Share Anywhere"
              description="Generate instant share links. Anyone can download, no account required."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Choose the plan that works for you
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {Object.values(PLANS).map((plan) => (
              <PricingCard key={plan.id} plan={plan} isPopular={plan.id === 'pro'} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to start sharing?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust FlyFile for their file sharing needs.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} FlyFile. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 bg-gray-50 rounded-xl">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({ plan, isPopular }: { plan: typeof PLANS.free; isPopular?: boolean }) {
  return (
    <div className={`p-6 bg-white rounded-xl shadow-sm border-2 ${isPopular ? 'border-blue-600' : 'border-transparent'} relative`}>
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
          Più Popolare
        </span>
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold text-gray-900">
          €{(plan.priceMonthly / 100).toFixed(0)}
        </span>
        {plan.priceMonthly > 0 && <span className="text-gray-500">/mese</span>}
      </div>
      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-600">
            <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href={plan.priceMonthly === 0 ? "/register" : "/pricing"}>
        <Button className="w-full" variant={isPopular ? 'primary' : 'outline'}>
          {plan.priceMonthly === 0 ? 'Inizia Gratis' : 'Scegli Piano'}
        </Button>
      </Link>
    </div>
  );
}
