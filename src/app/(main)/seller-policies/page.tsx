import { Metadata } from 'next'
import Link from 'next/link'
import { Store, DollarSign, Package, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Seller Policies',
  description: 'Guidelines and policies for selling on our marketplace',
}

export default function SellerPoliciesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <Store className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Seller Policies</h1>
        <p className="mt-2 text-gray-600">
          Everything you need to know about selling on our marketplace
        </p>
      </div>

      <div className="prose prose-gray max-w-none">
        {/* Getting Started */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">Seller Requirements</h3>
            <ul className="list-disc pl-6 text-green-700 space-y-1">
              <li>Valid business or individual seller registration</li>
              <li>Verifiable contact information</li>
              <li>Ability to ship orders within the specified timeframe</li>
              <li>Commitment to customer service excellence</li>
            </ul>
          </div>
          <p className="text-gray-600">
            To become a seller, simply{' '}
            <Link href="/seller/register" className="text-orange-600 hover:underline">
              register here
            </Link>
            . Our team will review your application within 2-3 business days.
          </p>
        </section>

        {/* Fees and Commissions */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Fees & Commissions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-3 text-left font-medium text-gray-900">Fee Type</th>
                  <th className="border p-3 text-left font-medium text-gray-900">Amount</th>
                  <th className="border p-3 text-left font-medium text-gray-900">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-3 text-gray-600">Commission</td>
                  <td className="border p-3 text-gray-600">10-15%</td>
                  <td className="border p-3 text-gray-600">Per sale, varies by category</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Monthly Fee</td>
                  <td className="border p-3 text-gray-600">$0</td>
                  <td className="border p-3 text-gray-600">No monthly subscription required</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Listing Fee</td>
                  <td className="border p-3 text-gray-600">$0</td>
                  <td className="border p-3 text-gray-600">Free to list products</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Payment Processing</td>
                  <td className="border p-3 text-gray-600">2.9% + $0.30</td>
                  <td className="border p-3 text-gray-600">Standard Stripe fees</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Product Guidelines */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Product Guidelines</h2>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Required Product Information</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Clear, high-quality product images (minimum 500x500 pixels)</li>
            <li>Accurate product titles and descriptions</li>
            <li>Correct pricing and inventory levels</li>
            <li>Proper category classification</li>
            <li>Shipping weight and dimensions</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Prohibited Items</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <ul className="list-disc pl-6 text-red-700 space-y-1">
              <li>Counterfeit or replica products</li>
              <li>Illegal items or controlled substances</li>
              <li>Weapons and ammunition</li>
              <li>Adult content (unless in approved categories)</li>
              <li>Items that infringe on intellectual property</li>
              <li>Hazardous materials</li>
              <li>Live animals</li>
            </ul>
          </div>
        </section>

        {/* Shipping Requirements */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Requirements</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
              <h3 className="font-medium text-gray-900">Expected Standards</h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Ship within 2 business days</li>
                <li>• Provide valid tracking numbers</li>
                <li>• Use appropriate packaging</li>
                <li>• Accurate shipping costs</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <AlertTriangle className="h-5 w-5 text-amber-500 mb-2" />
              <h3 className="font-medium text-gray-900">Policy Violations</h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Late shipments affect seller rating</li>
                <li>• Missing tracking = order issues</li>
                <li>• Damaged items = returns</li>
                <li>• Repeated issues = suspension</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Customer Service */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Customer Service Standards</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Maintaining excellent customer service is crucial for success on our marketplace:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Respond to customer inquiries within 24 hours</li>
            <li>Handle returns and refunds according to marketplace policy</li>
            <li>Maintain a seller rating of 4.0 or higher</li>
            <li>Resolve disputes professionally and promptly</li>
            <li>Keep product listings accurate and up-to-date</li>
          </ul>
        </section>

        {/* Returns Policy */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Returns & Refunds</h2>
          <p className="text-gray-600 mb-4">
            All sellers must honor the marketplace&apos;s minimum return policy:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Minimum 14-day return window for all products</li>
            <li>Process refunds within 5 business days of receiving returns</li>
            <li>Cover return shipping for defective items</li>
            <li>Option to offer extended return periods (recommended)</li>
          </ul>
        </section>

        {/* Account Health */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Health & Performance</h2>
          <p className="text-gray-600 mb-4">
            We monitor seller performance to ensure a quality marketplace experience:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">&lt; 3%</p>
              <p className="text-sm text-gray-600">Order Defect Rate</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">&gt; 95%</p>
              <p className="text-sm text-gray-600">On-Time Shipment</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">&gt; 4.0</p>
              <p className="text-sm text-gray-600">Seller Rating</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-orange-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Ready to Start Selling?</h2>
          <p className="mt-2 text-gray-600">
            Join thousands of successful sellers on our marketplace
          </p>
          <Link
            href="/seller/register"
            className="mt-4 inline-block rounded-lg bg-orange-500 px-8 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Register as a Seller
          </Link>
        </section>
      </div>
    </div>
  )
}
