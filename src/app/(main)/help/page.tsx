'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  ShoppingCart,
  Truck,
  RotateCcw,
  CreditCard,
  User,
  Store,
  Shield,
  ChevronRight,
  HelpCircle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

const helpCategories = [
  {
    icon: ShoppingCart,
    title: 'Захиалга & Худалдан авалт',
    description: 'Захиалга хянах, түүх харах, худалдан авалт удирдах',
    links: [
      { name: 'Захиалгаа хэрхэн хянах вэ', href: '/help/track-order' },
      { name: 'Захиалга цуцлах эсвэл өөрчлөх', href: '/help/cancel-order' },
      { name: 'Захиалгын төлөв тайлбар', href: '/help/order-status' },
      { name: 'Нэхэмжлэх ба баримт', href: '/help/invoices' },
    ],
  },
  {
    icon: Truck,
    title: 'Хүргэлт & Хүлээн авах',
    description: 'Хүргэлтийн сонголт, хүргэх хугацаа, хянах',
    links: [
      { name: 'Хүргэлтийн сонголт ба зардал', href: '/shipping' },
      { name: 'Хүргэлтийн хугацаа', href: '/help/delivery-times' },
      { name: 'Олон улсын хүргэлт', href: '/help/international' },
      { name: 'Алдагдсан эсвэл дутуу илгээмж', href: '/help/missing-package' },
    ],
  },
  {
    icon: RotateCcw,
    title: 'Буцаалт & Нөхөн олговор',
    description: 'Буцаалтын бодлого, нөхөн олговрын үйл явц, солилцоо',
    links: [
      { name: 'Буцаалтын бодлого', href: '/returns' },
      { name: 'Буцаалт хэрхэн эхлүүлэх вэ', href: '/help/start-return' },
      { name: 'Нөхөн олговрын хугацаа', href: '/help/refund-timeline' },
      { name: 'Гэмтсэн бараа', href: '/help/damaged-items' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Төлбөр & Нэхэмжлэл',
    description: 'Төлбөрийн арга, нэхэмжлэлийн асуудал, урамшуулал',
    links: [
      { name: 'Хүлээн зөвшөөрөгдсөн төлбөрийн арга', href: '/help/payment-methods' },
      { name: 'Промо код ба хөнгөлөлт', href: '/help/promo-codes' },
      { name: 'Төлбөрийн аюулгүй байдал', href: '/help/payment-security' },
      { name: 'Нэхэмжлэлийн асуудал', href: '/help/billing-issues' },
    ],
  },
  {
    icon: User,
    title: 'Бүртгэл & Профайл',
    description: 'Бүртгэл, нууц үг, тохиргоо удирдах',
    links: [
      { name: 'Бүртгэл үүсгэх', href: '/help/create-account' },
      { name: 'Нууц үг сэргээх', href: '/help/reset-password' },
      { name: 'Профайл мэдээлэл шинэчлэх', href: '/help/update-profile' },
      { name: 'Бүртгэл устгах', href: '/help/delete-account' },
    ],
  },
  {
    icon: Store,
    title: 'Marketplace-д зарах',
    description: 'Худалдагч болон дэлгүүр эзэмшигчдэд зориулсан мэдээлэл',
    links: [
      { name: 'Худалдагч болох', href: '/seller/register' },
      { name: 'Худалдагчийн хураамж ба шимтгэл', href: '/help/seller-fees' },
      { name: 'Бүтээгдэхүүн байршуулах заавар', href: '/help/listing-guidelines' },
      { name: 'Худалдагчийн дэмжлэг', href: '/help/seller-support' },
    ],
  },
]

const popularQuestions = [
  {
    question: 'Миний захиалга хаана байна вэ?',
    answer: 'Та бүртгэлдээ нэвтэрч "Миний захиалгууд" хэсэгт орж захиалгаа хянах боломжтой. Захиалга дээр дарж бодит цагийн хянах мэдээлэл харна уу.',
  },
  {
    question: 'Барааг хэрхэн буцаах вэ?',
    answer: '"Миний захиалгууд" хэсэгт очиж, буцаах барааг олоод "Бараа буцаах" дээр дарна уу. Урьдчилан төлсөн буцаалтын шошго хэвлэхийн тулд зааврыг дагана уу.',
  },
  {
    question: 'Нөхөн олговроо хэзээ авах вэ?',
    answer: 'Нөхөн олговрыг буцаалтыг хүлээн авснаас хойш 5-7 ажлын өдрийн дотор боловсруулна. Таны дансанд харагдахад нэмэлт 3-5 өдөр шаардагдаж болно.',
  },
  {
    question: 'Хүргэлтийн хаягаа өөрчилж болох уу?',
    answer: 'Захиалга илгээгдэхээс өмнө хүргэлтийн хаягаа өөрчлөх боломжтой. "Миний захиалгууд" хэсэгт очиж сонголт байгаа бол "Засварлах" дээр дарна уу.',
  },
  {
    question: 'Ямар төлбөрийн арга хүлээн авдаг вэ?',
    answer: 'Бид бүх үндсэн кредит карт (Visa, Mastercard, American Express), дебит карт, болон янз бүрийн дижитал төлбөрийн сонголтуудыг хүлээн авдаг.',
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Бид танд юугаар туслах вэ?</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Түгээмэл асуултуудын хариултыг олох эсвэл доорх тусламжийн сэдвүүдийг үзнэ үү.
        </p>

        {/* Search */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Тусламж хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      {/* Help Categories */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Тусламжийн сэдвүүд</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpCategories.map((category) => (
            <div
              key={category.title}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                  <category.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900">{category.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <ChevronRight className="h-3 w-3" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Questions */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Түгээмэл асуултууд</h2>
        <div className="space-y-4">
          {popularQuestions.map((item, index) => (
            <div key={index} className="border rounded-lg">
              <button
                onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-orange-500" />
                  <span className="font-medium text-gray-900">{item.question}</span>
                </div>
                <ChevronRight
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    expandedQuestion === index ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {expandedQuestion === index && (
                <div className="px-4 pb-4 pl-12">
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Түргэн холбоосууд</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/account/orders"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            <span className="font-medium text-gray-900">Миний захиалгууд</span>
          </Link>
          <Link
            href="/account"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <User className="h-5 w-5 text-orange-500" />
            <span className="font-medium text-gray-900">Миний бүртгэл</span>
          </Link>
          <Link
            href="/returns"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-5 w-5 text-orange-500" />
            <span className="font-medium text-gray-900">Буцаалт</span>
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HelpCircle className="h-5 w-5 text-orange-500" />
            <span className="font-medium text-gray-900">Холбоо барих</span>
          </Link>
        </div>
      </section>

      {/* Contact Support */}
      <section>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 text-center">
          <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Нэмэлт тусламж хэрэгтэй юу?</h2>
          <p className="text-gray-600 mb-4">
            Манай дэмжлэгийн баг Даваа-Баасан, 09:00-18:00 цагт ажилладаг.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Дэмжлэгтэй холбогдох
          </Link>
        </div>
      </section>
    </div>
  )
}
