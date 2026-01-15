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
    title: 'Email Us',
    details: 'support@marketplace.com',
    subtext: 'We reply within 24 hours',
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: '+1 (555) 123-4567',
    subtext: 'Mon-Fri, 9am-6pm EST',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    details: '123 Commerce Street',
    subtext: 'New York, NY 10001',
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: 'Monday - Friday',
    subtext: '9:00 AM - 6:00 PM EST',
  },
]

const subjects = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'order', label: 'Order Issue' },
  { value: 'return', label: 'Returns & Refunds' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'seller', label: 'Seller Inquiry' },
  { value: 'partnership', label: 'Partnership Opportunities' },
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

    toast.success('Message sent successfully! We\'ll get back to you within 24 hours.')
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Have a question or need help? We&apos;re here to assist you. Choose the most convenient way to reach us.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
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
                <Label htmlFor="orderNumber">Order Number (optional)</Label>
                <Input
                  id="orderNumber"
                  placeholder="ORD-XXXXX"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="How can we help you?"
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
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">How do I track my order?</h3>
              <p className="text-sm text-gray-600">
                You can track your order by logging into your account and visiting the Orders section.
                You&apos;ll find real-time updates on your shipment status.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">What is your return policy?</h3>
              <p className="text-sm text-gray-600">
                We offer a 30-day return policy for most items. Products must be unused and in their
                original packaging. Visit our Returns page for more details.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">How do I become a seller?</h3>
              <p className="text-sm text-gray-600">
                Click on &quot;Sell on Marketplace&quot; in the footer to start your seller registration.
                Our team will review your application within 2-3 business days.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Is my payment information secure?</h3>
              <p className="text-sm text-gray-600">
                Yes, we use industry-standard SSL encryption and partner with Stripe for payment
                processing. Your payment details are never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
