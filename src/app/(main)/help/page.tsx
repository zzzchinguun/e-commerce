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
    title: 'Orders & Purchases',
    description: 'Track orders, view history, and manage purchases',
    links: [
      { name: 'How to track my order', href: '/help/track-order' },
      { name: 'Cancel or modify an order', href: '/help/cancel-order' },
      { name: 'Order status explained', href: '/help/order-status' },
      { name: 'Invoice and receipts', href: '/help/invoices' },
    ],
  },
  {
    icon: Truck,
    title: 'Shipping & Delivery',
    description: 'Shipping options, delivery times, and tracking',
    links: [
      { name: 'Shipping options and costs', href: '/shipping' },
      { name: 'Delivery timeframes', href: '/help/delivery-times' },
      { name: 'International shipping', href: '/help/international' },
      { name: 'Missing or lost packages', href: '/help/missing-package' },
    ],
  },
  {
    icon: RotateCcw,
    title: 'Returns & Refunds',
    description: 'Return policies, refund process, and exchanges',
    links: [
      { name: 'Return policy', href: '/returns' },
      { name: 'How to start a return', href: '/help/start-return' },
      { name: 'Refund timeline', href: '/help/refund-timeline' },
      { name: 'Damaged items', href: '/help/damaged-items' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Payment & Billing',
    description: 'Payment methods, billing issues, and promotions',
    links: [
      { name: 'Accepted payment methods', href: '/help/payment-methods' },
      { name: 'Promo codes and discounts', href: '/help/promo-codes' },
      { name: 'Payment security', href: '/help/payment-security' },
      { name: 'Billing issues', href: '/help/billing-issues' },
    ],
  },
  {
    icon: User,
    title: 'Account & Profile',
    description: 'Manage your account, password, and preferences',
    links: [
      { name: 'Create an account', href: '/help/create-account' },
      { name: 'Reset password', href: '/help/reset-password' },
      { name: 'Update profile information', href: '/help/update-profile' },
      { name: 'Delete account', href: '/help/delete-account' },
    ],
  },
  {
    icon: Store,
    title: 'Selling on Marketplace',
    description: 'Information for sellers and store owners',
    links: [
      { name: 'How to become a seller', href: '/seller/register' },
      { name: 'Seller fees and commissions', href: '/help/seller-fees' },
      { name: 'Product listing guidelines', href: '/help/listing-guidelines' },
      { name: 'Seller support', href: '/help/seller-support' },
    ],
  },
]

const popularQuestions = [
  {
    question: 'Where is my order?',
    answer: 'You can track your order by logging into your account and visiting the "My Orders" section. Click on the order to see real-time tracking updates.',
  },
  {
    question: 'How do I return an item?',
    answer: 'Go to "My Orders," find the item you want to return, and click "Return Item." Follow the prompts to print your prepaid return label.',
  },
  {
    question: 'When will I receive my refund?',
    answer: 'Refunds are processed within 5-7 business days after we receive your return. It may take an additional 3-5 days to appear in your account.',
  },
  {
    question: 'Can I change my shipping address?',
    answer: 'You can change your shipping address before the order ships. Go to "My Orders" and click "Edit" if the option is available.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and various digital payment options.',
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">How can we help you?</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Find answers to common questions or browse our help topics below.
        </p>

        {/* Search */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      {/* Help Categories */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Browse Help Topics</h2>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Questions</h2>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Links</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/account/orders"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            <span className="font-medium text-gray-900">My Orders</span>
          </Link>
          <Link
            href="/account"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <User className="h-5 w-5 text-orange-500" />
            <span className="font-medium text-gray-900">My Account</span>
          </Link>
          <Link
            href="/returns"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-5 w-5 text-orange-500" />
            <span className="font-medium text-gray-900">Returns</span>
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HelpCircle className="h-5 w-5 text-orange-500" />
            <span className="font-medium text-gray-900">Contact Us</span>
          </Link>
        </div>
      </section>

      {/* Contact Support */}
      <section>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 text-center">
          <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Still need help?</h2>
          <p className="text-gray-600 mb-4">
            Our support team is available Monday-Friday, 9am-6pm EST.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  )
}
