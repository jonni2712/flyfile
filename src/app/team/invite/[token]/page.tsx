'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface InvitationData {
  invitation: {
    id: string;
    email: string;
    expiresAt: string;
    createdAt: string;
  };
  team: {
    id: string;
    name: string;
    description: string | null;
    memberCount: number;
    owner: {
      name: string;
      email: string;
    };
  };
}

export default function TeamInvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(`/api/team/invitation/${token}`);
        const data = await response.json();

        if (response.status === 410) {
          setExpired(true);
          return;
        }

        if (!response.ok) {
          setError(data.error || 'Invito non trovato');
          return;
        }

        setInvitation(data);
      } catch (err) {
        console.error('Error fetching invitation:', err);
        setError('Impossibile caricare l\'invito');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleAccept = async () => {
    if (!user || !invitation) return;

    setAccepting(true);
    setError(null);

    try {
      const response = await fetch(`/api/team/invitation/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Impossibile accettare l\'invito');
        return;
      }

      router.push('/team?joined=true');
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Errore durante l\'accettazione dell\'invito');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    try {
      await fetch(`/api/team/invitation/${token}?action=decline`, {
        method: 'DELETE',
      });
      router.push('/');
    } catch (err) {
      console.error('Error declining invitation:', err);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Invito Scaduto</h1>
          <p className="text-gray-400 mb-8">
            Questo invito è scaduto. Contatta il proprietario del team per ricevere un nuovo invito.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
          >
            Torna alla Home
          </Link>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Invito Non Valido</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
          >
            Torna alla Home
          </Link>
        </div>
      </div>
    );
  }

  if (!invitation) return null;

  // Check if user needs to login or register
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Sei stato invitato!
            </h1>
            <p className="text-gray-400">
              {invitation.team.owner.name} ti ha invitato a unirti al team
            </p>
          </div>

          <div className="bg-gray-700/30 rounded-xl p-4 mb-8">
            <h3 className="font-semibold text-white text-lg mb-2">{invitation.team.name}</h3>
            {invitation.team.description && (
              <p className="text-gray-400 text-sm mb-3">{invitation.team.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                {invitation.team.memberCount} membri
              </span>
            </div>
          </div>

          <p className="text-gray-400 text-sm text-center mb-6">
            Accedi o registrati con l&apos;email <strong className="text-white">{invitation.invitation.email}</strong> per accettare l&apos;invito.
          </p>

          <div className="space-y-3">
            <Link
              href={`/accedi?redirect=/team/invite/${token}&email=${encodeURIComponent(invitation.invitation.email)}`}
              className="block w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-center transition-colors"
            >
              Accedi
            </Link>
            <Link
              href={`/registrati?redirect=/team/invite/${token}&email=${encodeURIComponent(invitation.invitation.email)}`}
              className="block w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium text-center transition-colors"
            >
              Registrati
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if email matches
  const emailMatches = user.email?.toLowerCase() === invitation.invitation.email.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Unisciti al Team
          </h1>
          <p className="text-gray-400">
            {invitation.team.owner.name} ti ha invitato a unirti al team
          </p>
        </div>

        <div className="bg-gray-700/30 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-white text-lg mb-2">{invitation.team.name}</h3>
          {invitation.team.description && (
            <p className="text-gray-400 text-sm mb-3">{invitation.team.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              {invitation.team.memberCount} membri
            </span>
          </div>
        </div>

        {!emailMatches && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-yellow-500 font-medium text-sm">Email non corrispondente</p>
                <p className="text-yellow-500/80 text-sm mt-1">
                  Questo invito è stato inviato a <strong>{invitation.invitation.email}</strong>.
                  Sei attualmente connesso con <strong>{user.email}</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleAccept}
            disabled={!emailMatches || accepting}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {accepting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Accettazione in corso...
              </>
            ) : (
              'Accetta Invito'
            )}
          </button>
          <button
            onClick={handleDecline}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
          >
            Rifiuta
          </button>
        </div>

        {!emailMatches && (
          <p className="text-center text-gray-500 text-sm mt-6">
            <Link href="/logout" className="text-primary-400 hover:text-primary-300">
              Esci
            </Link>
            {' '}e accedi con l&apos;email corretta per accettare l&apos;invito.
          </p>
        )}
      </div>
    </div>
  );
}
