import { Metadata } from 'next'
import { Truck, Clock, Globe, Package, AlertCircle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Shipping Information',
  description: 'Learn about our shipping options, delivery times, and policies',
}

const shippingMethods = [
  {
    name: 'Standard Shipping',
    time: '5-7 business days',
    price: '$4.99',
    freeOver: '$50',
    icon: Package,
  },
  {
    name: 'Express Shipping',
    time: '2-3 business days',
    price: '$9.99',
    freeOver: '$150',
    icon: Truck,
  },
  {
    name: 'Next-Day Delivery',
    time: '1 business day',
    price: '$14.99',
    freeOver: null,
    icon: Clock,
  },
]

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Information</h1>

      {/* Shipping Methods */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Options</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {shippingMethods.map((method) => (
            <div key={method.name} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-full mb-4">
                <method.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{method.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{method.time}</p>
              <p className="text-lg font-bold text-gray-900">{method.price}</p>
              {method.freeOver && (
                <p className="text-sm text-green-600 mt-2">
                  Free on orders over {method.freeOver}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Delivery Areas */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Areas</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Globe className="h-6 w-6 text-orange-500 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Domestic Shipping</h3>
              <p className="text-gray-600 mb-4">
                We ship to all 50 U.S. states including Alaska and Hawaii. Standard and express
                shipping times may vary for remote locations.
              </p>
              <h3 className="font-semibold text-gray-900 mb-2">International Shipping</h3>
              <p className="text-gray-600">
                We currently offer international shipping to Canada, United Kingdom, Australia,
                and select European countries. International orders may be subject to customs
                duties and taxes, which are the responsibility of the buyer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Processing Time */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Processing</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Orders placed before 2:00 PM EST</p>
              <p className="text-gray-600 text-sm">Processed same business day</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Orders placed after 2:00 PM EST</p>
              <p className="text-gray-600 text-sm">Processed next business day</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Weekend and holiday orders</p>
              <p className="text-gray-600 text-sm">Processed on the next business day</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Tracking</h2>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            Once your order ships, you&apos;ll receive an email with tracking information. You can also
            track your order by:
          </p>
          <ol className="list-decimal pl-6 text-gray-600 space-y-2">
            <li>Logging into your account</li>
            <li>Going to &quot;My Orders&quot;</li>
            <li>Clicking on the order you want to track</li>
            <li>Using the tracking number provided</li>
          </ol>
        </div>
      </section>

      {/* Shipping Partners */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Shipping Partners</h2>
        <p className="text-gray-600 mb-4">
          We work with trusted shipping carriers to ensure your packages arrive safely:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['USPS', 'UPS', 'FedEx', 'DHL'].map((carrier) => (
            <div key={carrier} className="border rounded-lg p-4 text-center">
              <p className="font-medium text-gray-900">{carrier}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seller Shipping */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Marketplace Seller Shipping</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-600 mb-4">
            Since Marketplace hosts multiple sellers, shipping times and methods may vary by seller.
            Each product listing displays:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Estimated shipping cost</li>
            <li>Expected delivery time</li>
            <li>Seller&apos;s shipping location</li>
            <li>Available shipping methods</li>
          </ul>
          <p className="text-gray-600 mt-4">
            If you order from multiple sellers, your items may arrive in separate packages.
          </p>
        </div>
      </section>

      {/* Special Circumstances */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Circumstances</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h3 className="font-medium text-gray-900">Peak Season Delays</h3>
            <p className="text-gray-600 text-sm">
              During holiday seasons (November-December), delivery times may be extended by 2-3 days.
            </p>
          </div>
          <div className="border-l-4 border-amber-400 pl-4">
            <h3 className="font-medium text-gray-900">Weather Delays</h3>
            <p className="text-gray-600 text-sm">
              Severe weather conditions may impact delivery times. We&apos;ll notify you of any significant delays.
            </p>
          </div>
          <div className="border-l-4 border-amber-400 pl-4">
            <h3 className="font-medium text-gray-900">Address Issues</h3>
            <p className="text-gray-600 text-sm">
              Please ensure your shipping address is correct. We are not responsible for packages
              delivered to incorrect addresses provided by the customer.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions?</h2>
        <p className="text-gray-600">
          If you have questions about shipping or need assistance tracking your order, please
          contact our support team at{' '}
          <a href="mailto:shipping@marketplace.com" className="text-orange-600 hover:underline">
            shipping@marketplace.com
          </a>{' '}
          or visit our{' '}
          <a href="/contact" className="text-orange-600 hover:underline">
            Contact Us
          </a>{' '}
          page.
        </p>
      </section>
    </div>
  )
}
