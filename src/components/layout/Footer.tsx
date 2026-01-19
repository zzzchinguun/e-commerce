'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Container } from '@/components/layout/Container'

const footerLinks = {
  shop: [
    { name: 'Бүх ангилал', href: '/categories' },
    { name: 'Хямдрал', href: '/deals' },
    { name: 'Шинэ бүтээгдэхүүн', href: '/products?sort=newest' },
    { name: 'Хамгийн их зарагдсан', href: '/products?sort=best-selling' },
  ],
  account: [
    { name: 'Миний бүртгэл', href: '/account' },
    { name: 'Захиалгууд', href: '/account/orders' },
    { name: 'Хадгалсан', href: '/wishlist' },
    { name: 'Захиалга хянах', href: '/track-order' },
  ],
  seller: [
    { name: 'MSTORE-д зарах', href: '/seller/register' },
    { name: 'Худалдагчийн самбар', href: '/seller' },
    { name: 'Худалдагчийн бодлого', href: '/seller-policies' },
    { name: 'Амжилтын түүхүүд', href: '/success-stories' },
  ],
  support: [
    { name: 'Тусламжийн төв', href: '/help' },
    { name: 'Холбоо барих', href: '/contact' },
    { name: 'Хүргэлтийн мэдээлэл', href: '/shipping' },
    { name: 'Буцаалт & Нөхөн олговор', href: '/returns' },
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
        Дээш буцах
      </button>

      {/* Main Footer Content */}
      <Container className="py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Shop Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Дэлгүүр</h3>
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
            <h3 className="mb-4 font-semibold text-white">Таны бүртгэл</h3>
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
            <h3 className="mb-4 font-semibold text-white">Бидэнтэй хамт зарах</h3>
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
            <h3 className="mb-4 font-semibold text-white">Тусламж & Дэмжлэг</h3>
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
            <h3 className="mb-4 font-semibold text-white">Холбоотой байх</h3>
            <p className="mb-4 text-sm">
              Онцгой санал, бэлэг, шинэ бүтээгдэхүүний мэдээлэл авахын тулд бүртгүүлнэ үү.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Таны имэйл"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-500"
              />
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 shrink-0">
                Бүртгүүлэх
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
      </Container>

      <Separator className="bg-slate-800" />

      {/* Bottom Bar */}
      <Container className="py-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href="/terms" className="hover:text-orange-400 transition-colors">
              Үйлчилгээний нөхцөл
            </Link>
            <Link href="/privacy" className="hover:text-orange-400 transition-colors">
              Нууцлалын бодлого
            </Link>
            <Link href="/cookies" className="hover:text-orange-400 transition-colors">
              Күүкийн тохиргоо
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MSTORE. Бүх эрх хуулиар хамгаалагдсан.
          </p>
        </div>
      </Container>
    </footer>
  )
}
