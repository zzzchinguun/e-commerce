import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how we collect, use, and protect your personal information',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">
          Last updated: January 15, 2026
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-600 mb-4">
            Welcome to Marketplace. We are committed to protecting your personal information and your right
            to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our website and services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
          <p className="text-gray-600 mb-4">
            We collect personal information that you voluntarily provide, including:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>Name and contact information (email, phone, address)</li>
            <li>Account credentials (username, password)</li>
            <li>Payment information (processed securely through Stripe)</li>
            <li>Profile information and preferences</li>
            <li>Order history and transaction details</li>
            <li>Communications with customer support</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Automatically Collected Information</h3>
          <p className="text-gray-600 mb-4">
            When you visit our website, we automatically collect certain information:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Device information (browser type, operating system)</li>
            <li>IP address and location data</li>
            <li>Browsing behavior and page interactions</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">
            We use your information for the following purposes:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Create and manage your account</li>
            <li>Process payments and prevent fraud</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Respond to inquiries and provide customer support</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
          <p className="text-gray-600 mb-4">
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li><strong>Sellers:</strong> To fulfill your orders (name, address, order details)</li>
            <li><strong>Payment Processors:</strong> Stripe processes payments securely</li>
            <li><strong>Shipping Partners:</strong> To deliver your orders</li>
            <li><strong>Service Providers:</strong> For analytics, email services, and hosting</li>
            <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
          </ul>
          <p className="text-gray-600 mt-4">
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
          <p className="text-gray-600 mb-4">
            We implement appropriate security measures to protect your information:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>SSL/TLS encryption for data transmission</li>
            <li>Secure password hashing</li>
            <li>Regular security assessments</li>
            <li>Limited employee access to personal data</li>
            <li>PCI-DSS compliant payment processing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
          <p className="text-gray-600 mb-4">
            We use cookies and similar technologies to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Keep you logged into your account</li>
            <li>Remember your preferences and cart items</li>
            <li>Analyze website traffic and usage patterns</li>
            <li>Deliver personalized content and ads</li>
          </ul>
          <p className="text-gray-600 mt-4">
            You can manage cookie preferences through your browser settings. Note that disabling cookies
            may affect website functionality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Privacy Rights</h2>
          <p className="text-gray-600 mb-4">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your data</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
          </ul>
          <p className="text-gray-600 mt-4">
            To exercise these rights, please contact us at privacy@marketplace.com.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
          <p className="text-gray-600 mb-4">
            We retain your personal information for as long as necessary to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Provide our services and fulfill transactions</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes and enforce agreements</li>
          </ul>
          <p className="text-gray-600 mt-4">
            When no longer needed, we securely delete or anonymize your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
          <p className="text-gray-600 mb-4">
            Our Service is not intended for children under 13. We do not knowingly collect personal
            information from children under 13. If you believe we have collected such information,
            please contact us immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. International Transfers</h2>
          <p className="text-gray-600 mb-4">
            Your information may be transferred to and processed in countries other than your own.
            We ensure appropriate safeguards are in place for such transfers in accordance with
            applicable data protection laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
          <p className="text-gray-600 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
          <p className="text-gray-600">
            If you have questions about this Privacy Policy or our data practices, contact us at:
          </p>
          <p className="text-gray-600 mt-2">
            Email: privacy@marketplace.com<br />
            Address: 123 Commerce Street, New York, NY 10001
          </p>
        </section>
      </div>
    </div>
  )
}
