'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { QrCode, CheckCircle2, Loader2, Clock, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils/format'
import { confirmTestPayment, getPaymentDetails } from '@/actions/test-payment'

export function QPayPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session')
  const clearCart = useCartStore((state) => state.clearCart)

  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<{
    orderNumber: string
    amount: number
    status: string | null
  } | null>(null)
  const [isPaid, setIsPaid] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      router.push('/checkout')
      return
    }

    // Fetch payment details
    async function fetchDetails() {
      const result = await getPaymentDetails(sessionId!)
      if (result.error) {
        toast.error(result.error)
        router.push('/checkout')
        return
      }
      if (result.details) {
        setPaymentDetails(result.details)
      }
      setIsLoading(false)
    }

    fetchDetails()
  }, [sessionId, router])

  async function handleTestPaid() {
    if (!sessionId) return

    setIsConfirming(true)
    try {
      const result = await confirmTestPayment(sessionId)

      if (result.error) {
        toast.error(result.error)
        return
      }

      // Clear cart and show success
      clearCart()
      setIsPaid(true)
      toast.success('Төлбөр амжилттай баталгаажлаа!')

      // Redirect to success page after a moment
      setTimeout(() => {
        router.push(`/checkout/success?session_id=${sessionId}`)
      }, 2000)
    } catch {
      toast.error('Төлбөр баталгаажуулахад алдаа гарлаа')
    } finally {
      setIsConfirming(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500" />
          <p className="mt-4 text-gray-600">Төлбөрийн мэдээлэл ачаалж байна...</p>
        </div>
      </div>
    )
  }

  if (isPaid) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <CheckCircle2 className="mx-auto h-20 w-20 text-green-500" />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Төлбөр амжилттай!</h2>
            <p className="mt-2 text-gray-600">
              Таны захиалга #{paymentDetails?.orderNumber} амжилттай баталгаажлаа.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Захиалгын хуудас руу шилжиж байна...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <QrCode className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">QPay Төлбөр</h1>
          <p className="mt-2 text-gray-600">
            Доорх QR кодыг уншуулж төлбөрөө төлнө үү
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* QR Code Section */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">QR код уншуулах</CardTitle>
              <CardDescription>
                Банкны аппликейшнээр QR код уншуулна уу
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {/* Simulated QR Code */}
              <div className="relative mb-4 h-48 w-48 rounded-lg border-4 border-gray-200 bg-white p-2">
                {/* Static QR pattern */}
                <div className="grid h-full w-full grid-cols-8 grid-rows-8 gap-0.5">
                  {[
                    1,1,1,0,1,1,1,1,
                    1,0,1,1,0,1,0,1,
                    1,1,1,0,1,1,1,0,
                    0,0,0,1,0,0,0,1,
                    1,0,1,0,1,0,1,0,
                    1,1,1,0,0,1,1,1,
                    1,0,1,1,1,0,1,0,
                    1,1,1,0,1,1,1,1,
                  ].map((fill, i) => (
                    <div
                      key={i}
                      className={fill ? 'bg-gray-900' : 'bg-white'}
                    />
                  ))}
                </div>
                {/* QPay logo overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-lg bg-white p-2 shadow-md">
                    <span className="text-sm font-bold text-blue-600">QPay</span>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500">
                Захиалга: <span className="font-mono font-semibold">{paymentDetails?.orderNumber}</span>
              </p>

              {/* Bank logos */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['Khan Bank', 'Golomt', 'TDB', 'State Bank', 'Xac Bank'].map((bank) => (
                  <div
                    key={bank}
                    className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
                  >
                    {bank}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Төлбөрийн мэдээлэл</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-orange-50 p-4 text-center">
                <p className="text-sm text-gray-600">Төлөх дүн</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatPrice(paymentDetails?.amount || 0)}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Төлбөр хүлээгдэж байна...</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Smartphone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Банкны апп-аар QR уншуулна уу</span>
                </div>
              </div>

              <Separator />

              {/* Test Payment Button */}
              <div className="space-y-3">
                <div className="rounded-lg border-2 border-dashed border-yellow-300 bg-yellow-50 p-3">
                  <p className="text-center text-sm font-medium text-yellow-800">
                    Тест горим
                  </p>
                  <p className="mt-1 text-center text-xs text-yellow-600">
                    Бодит төлбөр хийхгүйгээр туршилт хийх
                  </p>
                </div>

                <Button
                  onClick={handleTestPaid}
                  disabled={isConfirming}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Баталгаажуулж байна...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Төлбөр төлөгдсөн (Тест)
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-gray-500">
                  Энэ товчийг дарснаар төлбөр төлөгдсөн гэж тооцно
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardContent className="py-4">
            <h3 className="mb-3 font-semibold text-gray-900">Төлбөр төлөх заавар:</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                  1
                </span>
                <span>Банкны гар утасны аппликейшнээ нээнэ үү</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                  2
                </span>
                <span>QR код уншуулах хэсгийг сонгоно уу</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                  3
                </span>
                <span>Дээрх QR кодыг уншуулж төлбөрөө баталгаажуулна уу</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                  4
                </span>
                <span>Төлбөр амжилттай болсны дараа автоматаар шилжинэ</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Cancel link */}
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => router.push('/checkout')}>
            Буцах
          </Button>
        </div>
      </div>
    </div>
  )
}
