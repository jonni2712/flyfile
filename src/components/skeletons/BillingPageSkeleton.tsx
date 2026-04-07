import { Skeleton } from './Skeleton';

/**
 * Skeleton matching the 4-section layout of /settings/billing.
 */
export default function BillingPageSkeleton() {
  return (
    <div className="space-y-10">
      {/* Section 1: Plan card */}
      <section>
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-40" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full mt-4" />
        </div>
      </section>

      {/* Section 2: Payment methods */}
      <section>
        <Skeleton className="h-5 w-44 mb-4" />
        <div className="border border-gray-200 rounded-xl p-6 space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-48 rounded-full" />
        </div>
      </section>

      {/* Section 3: Billing info form */}
      <section>
        <Skeleton className="h-5 w-44 mb-4" />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </section>
    </div>
  );
}
