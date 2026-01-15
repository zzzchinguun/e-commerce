import { Suspense } from 'react'
import { CheckoutSuccessContent } from './CheckoutSuccessContent'
import { Skeleton } from '@/components/ui/skeleton'

function SuccessSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <Skeleton className="mx-auto h-20 w-20 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-8 w-64" />
        <Skeleton className="mx-auto mt-2 h-4 w-full" />
        <Skeleton className="mx-auto mt-8 h-24 w-full rounded-lg" />
        <div className="mt-8 flex justify-center gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessSkeleton />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
