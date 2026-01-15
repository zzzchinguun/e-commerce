'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import {
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  TrendingUp,
  DollarSign,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { registerSeller } from '@/actions/seller'

const sellerSchema = z.object({
  // Store Info
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  storeDescription: z.string().min(10, 'Description must be at least 10 characters'),
  businessEmail: z.string().email('Invalid email address'),
  businessPhone: z.string().optional(),

  // Address
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),

  // Agreement
  agreeTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
  agreePolicy: z.boolean().refine((val) => val === true, 'You must agree to the seller policy'),
})

type SellerInput = z.infer<typeof sellerSchema>

const steps = [
  { id: 1, title: 'Store Info', icon: Store },
  { id: 2, title: 'Location', icon: MapPin },
  { id: 3, title: 'Verification', icon: FileText },
]

const benefits = [
  {
    icon: TrendingUp,
    title: 'Reach Millions',
    description: 'Access our growing customer base',
  },
  {
    icon: DollarSign,
    title: 'Competitive Fees',
    description: 'Low commission rates starting at 8%',
  },
  {
    icon: Package,
    title: 'Easy Management',
    description: 'Powerful tools to manage your store',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Get paid reliably via Stripe',
  },
]

export default function SellerRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<SellerInput>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      agreeTerms: false,
      agreePolicy: false,
    },
  })

  const agreeTerms = watch('agreeTerms')
  const agreePolicy = watch('agreePolicy')

  const nextStep = async () => {
    let fieldsToValidate: (keyof SellerInput)[] = []

    if (currentStep === 1) {
      fieldsToValidate = ['storeName', 'storeDescription', 'businessEmail']
    } else if (currentStep === 2) {
      fieldsToValidate = ['address', 'city', 'country']
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const onSubmit = async (data: SellerInput) => {
    setIsSubmitting(true)
    try {
      const result = await registerSeller({
        storeName: data.storeName,
        storeDescription: data.storeDescription,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        businessAddress: {
          address: data.address,
          city: data.city,
          country: data.country,
        },
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Application submitted successfully!')
        router.push('/seller/register/success')
      }
    } catch (error) {
      toast.error('Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold text-orange-500">
            MarketHub
          </Link>
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left - Benefits */}
          <div className="hidden lg:block">
            <h1 className="text-4xl font-bold text-gray-900">
              Start Selling on MarketHub
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of sellers and reach millions of customers.
              Set up your store in minutes and start earning today.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4">
                  <div className="rounded-lg bg-orange-100 p-3">
                    <benefit.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{benefit.title}</h3>
                    <p className="text-sm text-gray-500">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white">
              <h3 className="text-xl font-semibold">Ready to grow your business?</h3>
              <p className="mt-2 text-orange-100">
                Average sellers see 40% revenue growth in their first year.
              </p>
            </div>
          </div>

          {/* Right - Form */}
          <div>
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          currentStep >= step.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-sm ${
                          currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`mx-4 h-0.5 w-16 ${
                          currentStep > step.id ? 'bg-orange-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {currentStep === 1 && 'Store Information'}
                  {currentStep === 2 && 'Business Location'}
                  {currentStep === 3 && 'Review & Submit'}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && 'Tell us about your store'}
                  {currentStep === 2 && 'Where is your business located?'}
                  {currentStep === 3 && 'Agree to terms and submit your application'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Step 1: Store Info */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="storeName">Store Name *</Label>
                        <div className="relative mt-1">
                          <Store className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="storeName"
                            {...register('storeName')}
                            className="pl-9"
                            placeholder="Your store name"
                          />
                        </div>
                        {errors.storeName && (
                          <p className="mt-1 text-sm text-red-500">{errors.storeName.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="storeDescription">Store Description *</Label>
                        <Textarea
                          id="storeDescription"
                          {...register('storeDescription')}
                          rows={3}
                          className="mt-1"
                          placeholder="Describe what you sell and your store's unique value..."
                        />
                        {errors.storeDescription && (
                          <p className="mt-1 text-sm text-red-500">{errors.storeDescription.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="businessEmail">Business Email *</Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="businessEmail"
                            type="email"
                            {...register('businessEmail')}
                            className="pl-9"
                            placeholder="contact@yourstore.com"
                          />
                        </div>
                        {errors.businessEmail && (
                          <p className="mt-1 text-sm text-red-500">{errors.businessEmail.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="businessPhone">Business Phone (Optional)</Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="businessPhone"
                            {...register('businessPhone')}
                            className="pl-9"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Location */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address">Business Address *</Label>
                        <div className="relative mt-1">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="address"
                            {...register('address')}
                            className="pl-9"
                            placeholder="Street address"
                          />
                        </div>
                        {errors.address && (
                          <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            {...register('city')}
                            className="mt-1"
                            placeholder="City"
                          />
                          {errors.city && (
                            <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="country">Country *</Label>
                          <Input
                            id="country"
                            {...register('country')}
                            className="mt-1"
                            placeholder="Country"
                          />
                          {errors.country && (
                            <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review & Submit */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="rounded-lg bg-gray-50 p-4">
                        <h4 className="font-medium text-gray-900">Application Summary</h4>
                        <div className="mt-3 space-y-2 text-sm">
                          <p><span className="text-gray-500">Store Name:</span> {watch('storeName')}</p>
                          <p><span className="text-gray-500">Email:</span> {watch('businessEmail')}</p>
                          <p><span className="text-gray-500">Location:</span> {watch('city')}, {watch('country')}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="agreeTerms"
                            checked={agreeTerms}
                            onCheckedChange={(checked) => setValue('agreeTerms', checked as boolean)}
                          />
                          <label htmlFor="agreeTerms" className="text-sm text-gray-600">
                            I agree to the{' '}
                            <Link href="/terms" className="text-orange-500 hover:underline">
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-orange-500 hover:underline">
                              Privacy Policy
                            </Link>
                          </label>
                        </div>
                        {errors.agreeTerms && (
                          <p className="text-sm text-red-500">{errors.agreeTerms.message}</p>
                        )}

                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="agreePolicy"
                            checked={agreePolicy}
                            onCheckedChange={(checked) => setValue('agreePolicy', checked as boolean)}
                          />
                          <label htmlFor="agreePolicy" className="text-sm text-gray-600">
                            I have read and agree to the{' '}
                            <Link href="/seller-policy" className="text-orange-500 hover:underline">
                              Seller Policy
                            </Link>{' '}
                            and commission structure
                          </label>
                        </div>
                        {errors.agreePolicy && (
                          <p className="text-sm text-red-500">{errors.agreePolicy.message}</p>
                        )}
                      </div>

                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> Your seller account will be reviewed by our team.
                          This usually takes 1-2 business days. You'll receive an email once approved.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="mt-8 flex justify-between">
                    {currentStep > 1 ? (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}

                    {currentStep < 3 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600"
                        disabled={isSubmitting}
                      >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Application
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
