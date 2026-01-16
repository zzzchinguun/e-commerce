import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { QPayPaymentContent } from './QPayPaymentContent'

function LoadingFallback() {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500" />
        <p className="mt-4 text-gray-600">Төлбөрийн мэдээлэл ачаалж байна...</p>
      </div>
    </div>
  )
}

export default function QPayPaymentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <QPayPaymentContent />
    </Suspense>
  )
}
