import { Metadata } from 'next'
import { RotateCcw, Clock, CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  description: 'Learn about our return policy, refund process, and exchange options',
}

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Returns & Refunds</h1>

      {/* Overview */}
      <section className="mb-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <RotateCcw className="h-8 w-8 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">30-Day Return Policy</h2>
              <p className="text-gray-600">
                We want you to be completely satisfied with your purchase. If you&apos;re not happy,
                you can return most items within 30 days of delivery for a full refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Return Eligibility */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Return Eligibility</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-gray-900">Eligible for Return</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Items in original, unused condition</li>
              <li>• Products with original tags attached</li>
              <li>• Items in original packaging</li>
              <li>• Items returned within 30 days</li>
              <li>• Defective or damaged items</li>
              <li>• Wrong item received</li>
            </ul>
          </div>
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-gray-900">Not Eligible for Return</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Personalized or custom items</li>
              <li>• Intimate or sanitary goods</li>
              <li>• Perishable products</li>
              <li>• Digital downloads</li>
              <li>• Items marked &quot;Final Sale&quot;</li>
              <li>• Items showing signs of use</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How to Return */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">How to Return an Item</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Initiate Your Return</h3>
              <p className="text-gray-600 text-sm">
                Log into your account, go to &quot;My Orders,&quot; find the order, and click &quot;Return Item.&quot;
                Select the item(s) you want to return and the reason for the return.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Print Return Label</h3>
              <p className="text-gray-600 text-sm">
                Once approved, you&apos;ll receive a prepaid return shipping label via email.
                Print the label and attach it to your package.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Pack Your Item</h3>
              <p className="text-gray-600 text-sm">
                Place the item in its original packaging (if possible) or a secure box.
                Include all original tags, accessories, and documentation.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
              4
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Ship Your Return</h3>
              <p className="text-gray-600 text-sm">
                Drop off your package at any authorized shipping location. Keep your tracking
                number for reference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Refund Information */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Refund Information</h2>
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">Processing Time</h3>
              <p className="text-gray-600 text-sm">
                Refunds are processed within 5-7 business days after we receive your return.
                It may take an additional 3-5 business days for the refund to appear in your account.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">Refund Method</h3>
              <p className="text-gray-600 text-sm">
                Refunds are issued to the original payment method. If paid by credit card,
                the refund will appear on your card statement.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">Shipping Costs</h3>
              <p className="text-gray-600 text-sm">
                Original shipping costs are non-refundable unless the return is due to our error
                (wrong item, defective product, etc.). Return shipping is free for defective items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exchanges */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Exchanges</h2>
        <p className="text-gray-600 mb-4">
          We don&apos;t offer direct exchanges. If you need a different size, color, or item:
        </p>
        <ol className="list-decimal pl-6 text-gray-600 space-y-2">
          <li>Return the original item following our return process</li>
          <li>Place a new order for the item you want</li>
          <li>Your refund will be processed once we receive the return</li>
        </ol>
        <p className="text-gray-600 mt-4 text-sm italic">
          Tip: If the item you want might sell out, place your new order right away and
          return the original item for a refund.
        </p>
      </section>

      {/* Damaged or Defective Items */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Damaged or Defective Items</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            If you received a damaged or defective item, we apologize for the inconvenience.
            Please contact us within 48 hours of delivery with:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Your order number</li>
            <li>Photos of the damage or defect</li>
            <li>Photos of the packaging (for shipping damage)</li>
            <li>Description of the issue</li>
          </ul>
          <p className="text-gray-700 mt-4">
            We&apos;ll expedite the return process and cover all shipping costs for defective items.
          </p>
        </div>
      </section>

      {/* Marketplace Seller Returns */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Marketplace Seller Returns</h2>
        <p className="text-gray-600 mb-4">
          Items sold by third-party sellers on our marketplace may have different return policies.
          Check the product listing for seller-specific return information.
        </p>
        <div className="border-l-4 border-orange-400 pl-4">
          <p className="text-gray-600">
            <strong>Note:</strong> All sellers on our marketplace are required to offer at least
            a 14-day return window. If a seller doesn&apos;t honor their return policy, contact our
            support team and we&apos;ll help resolve the issue.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Can I return a gift?</h3>
            <p className="text-sm text-gray-600">
              Yes, gift recipients can return items. You&apos;ll receive a gift card for the value
              of the item (minus any discounts applied to the original purchase).
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">What if I lost my receipt?</h3>
            <p className="text-sm text-gray-600">
              No problem! Log into your account to access your order history, or contact support
              with your email address to look up your order.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Can I return an item after 30 days?</h3>
            <p className="text-sm text-gray-600">
              Returns after 30 days are evaluated on a case-by-case basis. Contact support to
              discuss your situation. Note: Late returns may receive store credit instead of a refund.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
        <p className="text-gray-600">
          If you have questions about returns or need assistance, please contact our support team at{' '}
          <a href="mailto:returns@marketplace.com" className="text-orange-600 hover:underline">
            returns@marketplace.com
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
