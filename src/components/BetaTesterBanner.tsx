'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import { X, Bug, Lightbulb, MessageSquare, Github, ExternalLink } from 'lucide-react';

const GITHUB_REPO_URL = 'https://github.com/jonni2712/flyfile';

export default function BetaTesterBanner() {
  const { userProfile } = useAuth();
  const t = useTranslations('betaTester');
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user is beta tester and banner wasn't dismissed this session
    if (userProfile?.isBetaTester) {
      const dismissed = sessionStorage.getItem('betaBannerDismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    }
  }, [userProfile]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('betaBannerDismissed', 'true');
  };

  if (!isVisible || isDismissed || !userProfile?.isBetaTester) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-right-5">
      <div className="bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-blue-900/95 backdrop-blur-lg border border-purple-500/30 rounded-2xl shadow-2xl p-5">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-lg">🧪</span>
          </div>
          <div>
            <h3 className="text-white font-bold">{t('title')}</h3>
            <p className="text-purple-200/80 text-sm">{t('subtitle')}</p>
          </div>
        </div>

        {/* Message */}
        <p className="text-white/80 text-sm mb-4">
          {t('message')}
        </p>

        {/* Action buttons */}
        <div className="space-y-2">
          <a
            href={`${GITHUB_REPO_URL}/issues/new?template=bug_report.yml`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-white transition-all group"
          >
            <div className="flex items-center">
              <Bug className="w-4 h-4 mr-2 text-red-400" />
              <span className="text-sm font-medium">{t('reportBug')}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-white/80" />
          </a>

          <a
            href={`${GITHUB_REPO_URL}/issues/new?template=feature_request.yml`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-white transition-all group"
          >
            <div className="flex items-center">
              <Lightbulb className="w-4 h-4 mr-2 text-green-400" />
              <span className="text-sm font-medium">{t('suggestFeature')}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-white/80" />
          </a>

          <a
            href={`${GITHUB_REPO_URL}/issues/new?template=feedback.yml`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-white transition-all group"
          >
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-sm font-medium">{t('leaveFeedback')}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-white/80" />
          </a>
        </div>

        {/* GitHub link */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-white/60 hover:text-white text-sm transition-colors"
          >
            <Github className="w-4 h-4 mr-2" />
            {t('goToRepo')}
          </a>
        </div>
      </div>
    </div>
  );
}
