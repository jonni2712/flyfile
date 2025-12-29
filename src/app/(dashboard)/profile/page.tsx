'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User, Mail, Save, Crown, HardDrive, Calendar } from 'lucide-react';
import { PLANS } from '@/types';

export default function ProfilePage() {
  const { user, userProfile, loading, updateUserProfile } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (userProfile) {
      setDisplayName(userProfile.displayName);
    }
  }, [user, userProfile, loading, router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updateUserProfile({ displayName });
      setMessage('Profilo aggiornato con successo!');
    } catch (error) {
      setMessage('Errore durante il salvataggio');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Il mio profilo</h1>

      <div className="grid gap-8">
        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informazioni personali
          </h2>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes('successo') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Il tuo nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{userProfile.email}</span>
              </div>
            </div>

            <Button onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Salva modifiche
            </Button>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Abbonamento
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
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
                {plan.retentionDays} giorni
              </p>
            </div>
          </div>

          {userProfile.plan === 'free' && (
            <div className="mt-6 pt-6 border-t">
              <Button onClick={() => router.push('/pricing')}>
                Upgrade piano
              </Button>
            </div>
          )}
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
    </div>
  );
}
