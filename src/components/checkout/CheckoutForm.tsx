'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CreditCard, Lock, QrCode } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCartStore, type CartItem } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils/format'

const checkoutSchema = z.object({
  email: z.string().email('Зөв имэйл хаяг оруулна уу'),
  firstName: z.string().min(1, 'Нэр шаардлагатай'),
  lastName: z.string().min(1, 'Овог шаардлагатай'),
  address: z.string().min(1, 'Хаяг шаардлагатай'),
  apartment: z.string().optional(),
  city: z.string().min(1, 'Хот шаардлагатай'),
  state: z.string().min(1, 'Муж/Аймаг шаардлагатай'),
  zipCode: z.string().min(5, 'Шуудангийн код шаардлагатай'),
  phone: z.string().min(8, 'Утасны дугаар шаардлагатай'),
})

type CheckoutInput = z.infer<typeof checkoutSchema>

interface CheckoutFormProps {
  items: CartItem[]
  subtotal: number
}

const MONGOLIAN_PROVINCES = [
  'Улаанбаатар', 'Архангай', 'Баян-Өлгий', 'Баянхонгор', 'Булган', 'Говь-Алтай',
  'Говьсүмбэр', 'Дархан-Уул', 'Дорноговь', 'Дорнод', 'Дундговь', 'Завхан',
  'Орхон', 'Өвөрхангай', 'Өмнөговь', 'Сүхбаатар', 'Сэлэнгэ', 'Төв',
  'Увс', 'Ховд', 'Хөвсгөл', 'Хэнтий',
]

export function CheckoutForm({ items, subtotal }: CheckoutFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'qpay' | 'stripe'>('qpay')
  const clearCart = useCartStore((state) => state.clearCart)

  const shipping = subtotal > 50 ? 0 : 4.99
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
  })

  async function onSubmit(data: CheckoutInput) {
    setIsLoading(true)

    try {
      const itemsData = items.map((item) => ({
        productId: item.product.id,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.product.price,
        name: item.product.name,
      }))

      const shippingAddress = {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        apartment: data.apartment,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phone: data.phone,
      }

      if (paymentMethod === 'qpay') {
        // Use test QPay payment
        const response = await fetch('/api/test-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: itemsData,
            shippingAddress,
            email: data.email,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create payment session')
        }

        // Redirect to QPay payment page
        if (result.paymentUrl) {
          router.push(result.paymentUrl)
        }
      } else {
        // Use Stripe payment
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: itemsData,
            shippingAddress,
            email: data.email,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create checkout session')
        }

        // Redirect to Stripe checkout
        if (result.url) {
          window.location.href = result.url
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Алдаа гарлаа')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Contact Information */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Холбоо барих мэдээлэл</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="email">Имэйл</Label>
            <Input
              id="email"
              type="email"
              placeholder="таны@имэйл.com"
              {...register('email')}
              className="mt-1"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Утас</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="99112233"
              {...register('phone')}
              className="mt-1"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Shipping Address */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Хүргэлтийн хаяг</h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Нэр</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                className="mt-1"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Овог</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                className="mt-1"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Хаяг</Label>
            <Input
              id="address"
              placeholder="Гудамж, байрны хаяг"
              {...register('address')}
              className="mt-1"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="apartment">Байр, тоот гэх мэт (заавал биш)</Label>
            <Input
              id="apartment"
              placeholder="Байр, тоот, давхар гэх мэт"
              {...register('apartment')}
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="city">Хот/Дүүрэг</Label>
              <Input
                id="city"
                {...register('city')}
                className="mt-1"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="state">Муж/Аймаг</Label>
              <Select onValueChange={(value) => setValue('state', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Аймаг сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {MONGOLIAN_PROVINCES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="zipCode">Шуудангийн код</Label>
              <Input
                id="zipCode"
                {...register('zipCode')}
                className="mt-1"
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-500">{errors.zipCode.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Payment Method Selection */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Төлбөрийн хэлбэр</h2>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as 'qpay' | 'stripe')}
          className="mt-4 space-y-3"
        >
          <div
            className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors ${
              paymentMethod === 'qpay'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setPaymentMethod('qpay')}
          >
            <RadioGroupItem value="qpay" id="qpay" />
            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <QrCode className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label htmlFor="qpay" className="cursor-pointer font-medium">
                  QPay (QR код)
                </Label>
                <p className="text-sm text-gray-500">
                  Банкны аппликейшнээр QR код уншуулж төлөх
                </p>
              </div>
            </div>
            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              Тест
            </span>
          </div>

          <div
            className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors ${
              paymentMethod === 'stripe'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setPaymentMethod('stripe')}
          >
            <RadioGroupItem value="stripe" id="stripe" />
            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <Label htmlFor="stripe" className="cursor-pointer font-medium">
                  Карт (Stripe)
                </Label>
                <p className="text-sm text-gray-500">
                  Visa, Mastercard, болон бусад картаар төлөх
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Order Summary */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Захиалгын хураангуй</h2>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Нийт дүн</span>
            <span className="text-gray-900">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Хүргэлт</span>
            <span className="text-gray-900">
              {shipping === 0 ? 'ҮНЭГҮЙ' : formatPrice(shipping)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Татвар (тооцоолсон)</span>
            <span className="text-gray-900">{formatPrice(tax)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Нийт</span>
            <span className="font-bold text-gray-900">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className={`w-full ${
          paymentMethod === 'qpay'
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-orange-500 hover:bg-orange-600'
        }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Боловсруулж байна...
          </>
        ) : paymentMethod === 'qpay' ? (
          <>
            <QrCode className="mr-2 h-5 w-5" />
            QPay-ээр төлөх {formatPrice(total)}
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Картаар төлөх {formatPrice(total)}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-gray-500">
        Захиалга хийснээр та манай{' '}
        <a href="/terms" className="underline hover:text-gray-700">
          Үйлчилгээний нөхцөл
        </a>{' '}
        болон{' '}
        <a href="/privacy" className="underline hover:text-gray-700">
          Нууцлалын бодлого
        </a>-г зөвшөөрч байна
      </p>
    </form>
  )
}
