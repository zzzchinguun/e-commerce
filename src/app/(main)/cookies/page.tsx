import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn about how we use cookies and manage your cookie preferences',
}

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">
          Last updated: January 15, 2026
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
          <p className="text-gray-600 mb-4">
            Cookies are small text files that are stored on your device when you visit a website.
            They help the website remember information about your visit, which can make it easier
            to visit again and make the site more useful to you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
          <p className="text-gray-600 mb-4">
            Marketplace uses cookies for several purposes:
          </p>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Essential Cookies</h3>
          <p className="text-gray-600 mb-4">
            These cookies are necessary for the website to function properly. They enable core
            functionality such as:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>User authentication and secure login</li>
            <li>Shopping cart functionality</li>
            <li>Remembering your preferences</li>
            <li>Security features to protect your account</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Performance Cookies</h3>
          <p className="text-gray-600 mb-4">
            These cookies help us understand how visitors interact with our website by collecting
            anonymous information:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>Pages visited and time spent on each page</li>
            <li>Error messages encountered</li>
            <li>Website loading times</li>
            <li>User navigation patterns</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Functionality Cookies</h3>
          <p className="text-gray-600 mb-4">
            These cookies allow the website to remember choices you make:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>Your language and region preferences</li>
            <li>Recently viewed products</li>
            <li>Your display preferences (e.g., grid vs. list view)</li>
            <li>Saved shipping addresses</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Marketing Cookies</h3>
          <p className="text-gray-600 mb-4">
            These cookies track your browsing activity to deliver relevant advertisements:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Products you&apos;ve viewed or added to cart</li>
            <li>Categories you&apos;ve browsed</li>
            <li>Your interactions with our marketing emails</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
          <p className="text-gray-600 mb-4">
            We use services from third parties that may set their own cookies:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="font-medium text-gray-900">Google Analytics</p>
              <p className="text-sm text-gray-600">Used to analyze website traffic and user behavior</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Stripe</p>
              <p className="text-sm text-gray-600">Used for secure payment processing</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Social Media Plugins</p>
              <p className="text-sm text-gray-600">Facebook, Twitter, and Instagram buttons may set cookies</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
          <p className="text-gray-600 mb-4">
            You have several options for managing cookies:
          </p>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Browser Settings</h3>
          <p className="text-gray-600 mb-4">
            Most web browsers allow you to control cookies through their settings. You can:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>View what cookies are stored on your device</li>
            <li>Delete all or specific cookies</li>
            <li>Block all cookies or cookies from specific sites</li>
            <li>Configure your browser to notify you when cookies are set</li>
          </ul>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-amber-800 text-sm">
              <strong>Note:</strong> Blocking essential cookies may prevent you from using
              certain features of our website, such as logging in or adding items to your cart.
            </p>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Browser-Specific Instructions</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li><a href="https://support.google.com/chrome/answer/95647" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookie Retention</h2>
          <p className="text-gray-600 mb-4">
            Cookies are retained for different periods depending on their purpose:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-3 text-left font-medium text-gray-900">Cookie Type</th>
                  <th className="border p-3 text-left font-medium text-gray-900">Retention Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-3 text-gray-600">Session Cookies</td>
                  <td className="border p-3 text-gray-600">Deleted when you close your browser</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Authentication Cookies</td>
                  <td className="border p-3 text-gray-600">30 days (or until you log out)</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Preference Cookies</td>
                  <td className="border p-3 text-gray-600">1 year</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Analytics Cookies</td>
                  <td className="border p-3 text-gray-600">2 years</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Marketing Cookies</td>
                  <td className="border p-3 text-gray-600">90 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
          <p className="text-gray-600 mb-4">
            We may update this Cookie Policy from time to time to reflect changes in our practices
            or for legal, regulatory, or operational reasons. We will post any changes on this page
            and update the &quot;Last updated&quot; date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you have questions about our use of cookies, please contact us at:
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
