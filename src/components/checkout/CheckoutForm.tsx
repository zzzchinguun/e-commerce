'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CreditCard, Lock } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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
  phone: z.string().min(10, 'Утасны дугаар шаардлагатай'),
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
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.product.price,
            name: item.product.name,
          })),
          shippingAddress: {
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            apartment: data.apartment,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            phone: data.phone,
          },
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
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

      {/* Payment Notice */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CreditCard className="h-5 w-5" />
          <span>Та аюулгүй төлбөр хийхийн тулд Stripe руу шилжих болно</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full bg-orange-500 hover:bg-orange-600"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Боловсруулж байна...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Төлөх {formatPrice(total)}
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
