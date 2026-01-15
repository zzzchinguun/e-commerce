'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const contactInfo = [
  {
    icon: Mail,
    title: 'Имэйл хаяг',
    details: 'support@marketplace.com',
    subtext: '24 цагийн дотор хариу өгнө',
  },
  {
    icon: Phone,
    title: 'Утас',
    details: '+976 7777-1234',
    subtext: 'Даваа-Баасан, 09:00-18:00',
  },
  {
    icon: MapPin,
    title: 'Хаяг',
    details: 'Чингисийн өргөн чөлөө 15',
    subtext: 'Улаанбаатар, Монгол',
  },
  {
    icon: Clock,
    title: 'Ажлын цаг',
    details: 'Даваа - Баасан',
    subtext: '09:00 - 18:00',
  },
]

const subjects = [
  { value: 'general', label: 'Ерөнхий асуулт' },
  { value: 'order', label: 'Захиалгын асуудал' },
  { value: 'return', label: 'Буцаалт & Нөхөн олговор' },
  { value: 'technical', label: 'Техникийн дэмжлэг' },
  { value: 'seller', label: 'Худалдагчийн асуулт' },
  { value: 'partnership', label: 'Хамтын ажиллагааны санал' },
]

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    orderNumber: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success('Мессеж амжилттай илгээгдлээ! 24 цагийн дотор хариу өгнө.')
    setFormData({
      name: '',
      email: '',
      subject: '',
      orderNumber: '',
      message: '',
    })
    setIsSubmitting(false)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Холбоо барих</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Асуулт байна уу эсвэл тусламж хэрэгтэй юу? Бид танд туслахад бэлэн. Хамгийн тохиромжтой холбогдох аргаа сонгоно уу.
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {contactInfo.map((info) => (
          <div
            key={info.title}
            className="bg-white rounded-lg border p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-full mb-4">
              <info.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
            <p className="text-gray-900 font-medium">{info.details}</p>
            <p className="text-sm text-gray-500">{info.subtext}</p>
          </div>
        ))}
      </div>

      {/* Contact Form */}
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Бидэнд мессеж илгээх</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Бүтэн нэр *</Label>
                <Input
                  id="name"
                  placeholder="Бат Болд"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Имэйл хаяг *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="bat@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Гарчиг *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Гарчиг сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.value} value={subject.value}>
                        {subject.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Захиалгын дугаар (заавал биш)</Label>
                <Input
                  id="orderNumber"
                  placeholder="ORD-XXXXX"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Мессеж *</Label>
              <Textarea
                id="message"
                placeholder="Бид танд юугаар туслах вэ?"
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Илгээж байна...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Мессеж илгээх
                </>
              )}
            </Button>
          </form>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Түгээмэл асуултууд</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Захиалгаа хэрхэн хянах вэ?</h3>
              <p className="text-sm text-gray-600">
                Та бүртгэлдээ нэвтэрч, Захиалгууд хэсэгт орж захиалгаа хянах боломжтой.
                Хүргэлтийн төлөвийн талаар бодит цагийн мэдээлэл авах болно.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Буцаалтын бодлого ямар вэ?</h3>
              <p className="text-sm text-gray-600">
                Бид ихэнх бараанд 30 хоногийн буцаалтын бодлого санал болгодог. Бүтээгдэхүүн
                ашиглагдаагүй, анхны сав баглаатай байх ёстой. Дэлгэрэнгүйг Буцаалт хуудаснаас харна уу.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Худалдагч болохын тулд яах вэ?</h3>
              <p className="text-sm text-gray-600">
                Хөлийн хэсэгт байрлах &quot;Marketplace-д зарах&quot; товч дээр дарж худалдагчийн
                бүртгэлээ эхлүүлнэ үү. Манай баг таны өргөдлийг 2-3 ажлын өдрийн дотор хянана.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Төлбөрийн мэдээлэл аюулгүй юу?</h3>
              <p className="text-sm text-gray-600">
                Тийм, бид салбарын стандарт SSL шифрлэлт ашиглаж, Stripe-тай хамтран төлбөр
                боловсруулдаг. Таны төлбөрийн мэдээлэл манай серверт хэзээ ч хадгалагддаггүй.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
