'use client'

import Link from 'next/link'
import { Truck, Shield, RotateCcw, Headphones } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Үнэгүй хүргэлт',
    description: '50,000₮-с дээш захиалгад',
  },
  {
    icon: Shield,
    title: 'Аюулгүй төлбөр',
    description: '100% найдвартай гүйлгээ',
  },
  {
    icon: RotateCcw,
    title: 'Хялбар буцаалт',
    description: '30 хоногийн буцаалтын бодлого',
  },
  {
    icon: Headphones,
    title: '24/7 Дэмжлэг',
    description: 'Тусгай хэрэглэгчийн үйлчилгээ',
  },
]

const promoBanners = [
  {
    id: 1,
    title: 'Зуны хямдрал',
    subtitle: 'Сонгосон бүтээгдэхүүнүүдээс 50% хүртэл хямдрал',
    cta: 'Одоо худалдаж авах',
    href: '/products?sale=true',
    bgColor: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    textColor: 'text-white',
  },
  {
    id: 2,
    title: 'Шинэ бүтээгдэхүүн',
    subtitle: 'Хамгийн сүүлийн үеийн бүтээгдэхүүнүүдийг үзээрэй',
    cta: 'Үзэх',
    href: '/products?sort=newest',
    bgColor: 'bg-gradient-to-r from-slate-700 to-slate-900',
    textColor: 'text-white',
  },
]

export function FeatureBanner() {
  return (
    <section className="border-y bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3">
              <div className="rounded-full bg-orange-100 p-2">
                <feature.icon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PromoBanners() {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="grid gap-4 md:grid-cols-2">
          {promoBanners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.href}
              className={`group rounded-xl p-6 md:p-8 ${banner.bgColor} transition-transform hover:scale-[1.02]`}
            >
              <div className={banner.textColor}>
                <h3 className="text-2xl font-bold md:text-3xl">{banner.title}</h3>
                <p className="mt-2 text-sm opacity-90 md:text-base">{banner.subtitle}</p>
                <span className="mt-4 inline-flex items-center text-sm font-medium underline-offset-4 group-hover:underline">
                  {banner.cta} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
