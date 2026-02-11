'use client';

import { useMemo } from 'react';
import { HardDrive, AlertTriangle, Crown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface StorageQuotaProps {
  storageUsed: number;
  storageLimit: number;
  pendingSize?: number; // Size of files about to be uploaded
  compact?: boolean;
}

export default function StorageQuota({
  storageUsed,
  storageLimit,
  pendingSize = 0,
  compact = false
}: StorageQuotaProps) {
  const t = useTranslations('storageQuota');
  // Ensure storageUsed is never negative
  const safeStorageUsed = Math.max(0, storageUsed || 0);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isUnlimited = storageLimit === -1;
  const totalWithPending = safeStorageUsed + pendingSize;

  const percentage = useMemo(() => {
    if (isUnlimited) return 0;
    return Math.min(Math.round((safeStorageUsed / storageLimit) * 100), 100);
  }, [safeStorageUsed, storageLimit, isUnlimited]);

  const percentageWithPending = useMemo(() => {
    if (isUnlimited) return 0;
    return Math.min(Math.round((totalWithPending / storageLimit) * 100), 100);
  }, [totalWithPending, storageLimit, isUnlimited]);

  const willExceed = !isUnlimited && totalWithPending > storageLimit;
  const isNearLimit = !isUnlimited && percentage >= 80;

  const getBarColor = () => {
    if (willExceed) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-cyan-500';
  };

  const getPendingBarColor = () => {
    if (willExceed) return 'bg-red-300';
    return 'bg-cyan-300';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <HardDrive className="w-4 h-4 text-blue-200/60" />
        <div className="flex-1">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${getBarColor()}`}
              style={{ width: `${percentage}%` }}
            />
            {pendingSize > 0 && (
              <div
                className={`h-full ${getPendingBarColor()} -mt-2`}
                style={{
                  width: `${Math.min(percentageWithPending - percentage, 100 - percentage)}%`,
                  marginLeft: `${percentage}%`
                }}
              />
            )}
          </div>
        </div>
        <span className="text-xs text-blue-200/60 whitespace-nowrap">
          {isUnlimited ? (
            t('unlimited')
          ) : (
            `${formatBytes(safeStorageUsed)} / ${formatBytes(storageLimit)}`
          )}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl ${willExceed ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/10 border border-white/20'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive className={`w-5 h-5 ${willExceed ? 'text-red-400' : 'text-cyan-400'}`} />
          <span className="text-sm font-medium text-white">{t('storage')}</span>
        </div>
        {isUnlimited ? (
          <span className="text-sm text-cyan-400 flex items-center gap-1">
            <Crown className="w-4 h-4" />
            {t('unlimited')}
          </span>
        ) : (
          <span className="text-sm text-blue-200/80">
            {formatBytes(safeStorageUsed)} / {formatBytes(storageLimit)}
          </span>
        )}
      </div>

      {!isUnlimited && (
        <>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-2">
            <div className="h-full flex">
              <div
                className={`h-full transition-all ${getBarColor()}`}
                style={{ width: `${percentage}%` }}
              />
              {pendingSize > 0 && (
                <div
                  className={`h-full ${getPendingBarColor()} transition-all`}
                  style={{ width: `${Math.min(percentageWithPending - percentage, 100 - percentage)}%` }}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-200/60">
              {percentage}% {t('used')}
            </span>
            <span className="text-blue-200/60">
              {formatBytes(Math.max(0, storageLimit - safeStorageUsed))} {t('available')}
            </span>
          </div>
        </>
      )}

      {willExceed && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-500/10 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-200">
              {t('exceedLimit', { size: formatBytes(pendingSize) })}
            </p>
            <Link href="/prezzi" className="text-sm text-red-400 hover:text-red-300 font-medium mt-1 inline-block">
              {t('upgradePlan')}
            </Link>
          </div>
        </div>
      )}

      {isNearLimit && !willExceed && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-200">
              {t('nearLimit')}
            </p>
            <Link href="/prezzi" className="text-sm text-yellow-400 hover:text-yellow-300 font-medium mt-1 inline-block">
              {t('increaseSpace')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
