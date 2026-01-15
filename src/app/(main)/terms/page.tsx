import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read our terms of service and user agreement',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">
          Last updated: January 15, 2026
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 mb-4">
            By accessing and using Marketplace (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Account Registration</h2>
          <p className="text-gray-600 mb-4">
            To use certain features of our Service, you must register for an account. You agree to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security of your password and account</li>
            <li>Accept responsibility for all activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Purchases and Payments</h2>
          <p className="text-gray-600 mb-4">
            When you make a purchase through our Service:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>You agree to pay all charges at the prices listed for the products you select</li>
            <li>You authorize us to charge your chosen payment method for the total amount</li>
            <li>All payments are processed securely through our payment partners</li>
            <li>Prices are subject to change without notice</li>
            <li>We reserve the right to refuse or cancel any order for any reason</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Seller Obligations</h2>
          <p className="text-gray-600 mb-4">
            If you register as a seller on our marketplace, you agree to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Provide accurate product descriptions and images</li>
            <li>Maintain adequate inventory and fulfill orders promptly</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Handle customer inquiries and complaints professionally</li>
            <li>Not sell prohibited, counterfeit, or illegal items</li>
            <li>Pay applicable marketplace fees and commissions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Product Reviews</h2>
          <p className="text-gray-600 mb-4">
            When submitting reviews, you agree that:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Your reviews will be honest and based on your actual experience</li>
            <li>You will not submit fake, misleading, or malicious reviews</li>
            <li>We may remove reviews that violate our guidelines</li>
            <li>You grant us a license to use, reproduce, and display your reviews</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Prohibited Activities</h2>
          <p className="text-gray-600 mb-4">
            You agree not to engage in any of the following:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Violating any applicable laws or regulations</li>
            <li>Infringing on intellectual property rights</li>
            <li>Transmitting viruses or malicious code</li>
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>Interfering with the proper functioning of our Service</li>
            <li>Engaging in fraudulent activities</li>
            <li>Harassing, threatening, or intimidating other users</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-600 mb-4">
            The Service and its original content, features, and functionality are owned by Marketplace
            and are protected by international copyright, trademark, patent, trade secret, and other
            intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
          <p className="text-gray-600 mb-4">
            To the fullest extent permitted by law, Marketplace shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages, including but not limited to loss
            of profits, data, or other intangible losses resulting from your use of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Dispute Resolution</h2>
          <p className="text-gray-600 mb-4">
            Any disputes arising from these Terms or your use of the Service will be resolved through
            binding arbitration in accordance with the rules of the American Arbitration Association.
            You agree to waive any right to participate in a class action lawsuit.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
          <p className="text-gray-600 mb-4">
            We reserve the right to modify these Terms at any time. We will notify users of any material
            changes by posting the new Terms on this page. Your continued use of the Service after changes
            are posted constitutes your acceptance of the modified Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
          <p className="text-gray-600">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="text-gray-600 mt-2">
            Email: legal@marketplace.com<br />
            Address: 123 Commerce Street, New York, NY 10001
          </p>
        </section>
      </div>
    </div>
  )
}
