'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  shop: [
    { name: 'All Categories', href: '/categories' },
    { name: 'Deals', href: '/deals' },
    { name: 'New Arrivals', href: '/products?sort=newest' },
    { name: 'Best Sellers', href: '/products?sort=best-selling' },
  ],
  account: [
    { name: 'My Account', href: '/account' },
    { name: 'Orders', href: '/account/orders' },
    { name: 'Wishlist', href: '/wishlist' },
    { name: 'Track Order', href: '/track-order' },
  ],
  seller: [
    { name: 'Sell on Marketplace', href: '/seller/register' },
    { name: 'Seller Dashboard', href: '/seller' },
    { name: 'Seller Policies', href: '/seller-policies' },
    { name: 'Success Stories', href: '/success-stories' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns & Refunds', href: '/returns' },
  ],
}

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/Chinguunzzz/' },
  { name: 'Twitter', icon: Twitter, href: 'https://x.com/zzzchinguun' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/zzzchinguun/' },
  { name: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/@sharshuwuu' },
]

export function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300">
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-slate-800 py-4 text-sm hover:bg-slate-700 transition-colors"
      >
        Back to top
      </button>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Shop Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Your Account</h3>
            <ul className="space-y-2">
              {footerLinks.account.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Seller Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Sell with Us</h3>
            <ul className="space-y-2">
              {footerLinks.seller.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Help & Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h3 className="mb-4 font-semibold text-white">Stay Connected</h3>
            <p className="mb-4 text-sm">
              Subscribe to get special offers, free giveaways, and new arrivals.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Your email"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-500"
              />
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 shrink-0">
                Subscribe
              </Button>
            </form>

            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* Bottom Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href="/terms" className="hover:text-orange-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-orange-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-orange-400 transition-colors">
              Cookie Settings
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
