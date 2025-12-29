'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { Upload, FolderOpen, HardDrive, TrendingUp, Crown } from 'lucide-react';
import Link from 'next/link';
import { PLANS } from '@/types';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const plan = PLANS[userProfile.plan] || PLANS.free;
  const storagePercentage = (userProfile.storageUsed / userProfile.storageLimit) * 100;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile.displayName || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">Here&apos;s an overview of your account</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FolderOpen className="w-6 h-6 text-blue-600" />}
          label="Total Files"
          value={userProfile.filesCount.toString()}
        />
        <StatCard
          icon={<HardDrive className="w-6 h-6 text-green-600" />}
          label="Storage Used"
          value={formatBytes(userProfile.storageUsed)}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          label="Storage Limit"
          value={formatBytes(userProfile.storageLimit)}
        />
        <StatCard
          icon={<Crown className="w-6 h-6 text-yellow-600" />}
          label="Current Plan"
          value={plan.name}
        />
      </div>

      {/* Storage Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Storage Usage</h2>
          <span className="text-sm text-gray-500">
            {formatBytes(userProfile.storageUsed)} / {formatBytes(userProfile.storageLimit)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              storagePercentage > 90 ? 'bg-red-600' : storagePercentage > 70 ? 'bg-yellow-500' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(storagePercentage, 100)}%` }}
          ></div>
        </div>
        {storagePercentage > 80 && (
          <p className="mt-3 text-sm text-yellow-600">
            You&apos;re running low on storage. Consider upgrading your plan.
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/upload">
              <Button>
                <Upload className="w-5 h-5 mr-2" />
                Upload Files
              </Button>
            </Link>
            <Link href="/files">
              <Button variant="outline">
                <FolderOpen className="w-5 h-5 mr-2" />
                View Files
              </Button>
            </Link>
          </div>
        </div>

        {/* Upgrade Card */}
        {userProfile.plan === 'free' && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">Upgrade to Pro</h2>
            <p className="text-blue-100 mb-4">
              Get 100GB storage, larger file uploads, and more features.
            </p>
            <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <Crown className="w-5 h-5 mr-2" />
              Upgrade Now
            </Button>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="text-gray-900">{userProfile.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Display Name</label>
            <p className="text-gray-900">{userProfile.displayName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Plan</label>
            <p className="text-gray-900 capitalize">{userProfile.plan}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Member Since</label>
            <p className="text-gray-900">
              {userProfile.createdAt?.toLocaleDateString() || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
