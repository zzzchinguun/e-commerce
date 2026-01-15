import { Metadata } from 'next'
import Link from 'next/link'
import { Star, TrendingUp, Users, DollarSign, Quote } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Success Stories',
  description: 'Read inspiring stories from our successful marketplace sellers',
}

const successStories = [
  {
    name: 'Sarah Johnson',
    business: 'Handmade Jewelry Co.',
    image: 'https://picsum.photos/seed/seller1/200/200',
    quote: 'Starting on this marketplace was the best decision for my small business. Within 6 months, I went from a hobby seller to running a full-time jewelry business.',
    stats: {
      monthlyRevenue: '$15,000+',
      growth: '400%',
      rating: 4.9,
    },
    category: 'Jewelry & Accessories',
  },
  {
    name: 'Michael Chen',
    business: 'TechGadgets Plus',
    image: 'https://picsum.photos/seed/seller2/200/200',
    quote: 'The seller tools and analytics helped me understand my customers better. I\'ve grown my electronics business from my garage to a warehouse operation.',
    stats: {
      monthlyRevenue: '$50,000+',
      growth: '250%',
      rating: 4.8,
    },
    category: 'Electronics',
  },
  {
    name: 'Emily Rodriguez',
    business: 'Organic Home Essentials',
    image: 'https://picsum.photos/seed/seller3/200/200',
    quote: 'As a mom running a business from home, this platform gave me the flexibility I needed. The low fees and great support made all the difference.',
    stats: {
      monthlyRevenue: '$8,000+',
      growth: '300%',
      rating: 5.0,
    },
    category: 'Home & Garden',
  },
  {
    name: 'David Kim',
    business: 'Fitness Gear Pro',
    image: 'https://picsum.photos/seed/seller4/200/200',
    quote: 'The marketplace\'s reach helped me connect with fitness enthusiasts across the country. My sales tripled in the first year.',
    stats: {
      monthlyRevenue: '$25,000+',
      growth: '200%',
      rating: 4.7,
    },
    category: 'Sports & Outdoors',
  },
]

const platformStats = [
  { label: 'Active Sellers', value: '10,000+', icon: Users },
  { label: 'Monthly Sales', value: '$5M+', icon: DollarSign },
  { label: 'Avg. Seller Growth', value: '180%', icon: TrendingUp },
  { label: 'Seller Satisfaction', value: '4.8/5', icon: Star },
]

export default function SuccessStoriesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900">Seller Success Stories</h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Discover how entrepreneurs like you have built thriving businesses on our marketplace
        </p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {platformStats.map((stat) => (
          <div key={stat.label} className="bg-orange-50 rounded-xl p-6 text-center">
            <stat.icon className="h-8 w-8 text-orange-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Success Stories */}
      <div className="space-y-12">
        {successStories.map((story, index) => (
          <div
            key={story.name}
            className={`flex flex-col md:flex-row gap-8 items-center ${
              index % 2 === 1 ? 'md:flex-row-reverse' : ''
            }`}
          >
            {/* Image */}
            <div className="md:w-1/3">
              <div className="relative">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-orange-200"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  {story.category}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="md:w-2/3">
              <div className="bg-white rounded-xl border p-8">
                <Quote className="h-8 w-8 text-orange-300 mb-4" />
                <p className="text-lg text-gray-700 italic mb-6">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <p className="font-semibold text-gray-900">{story.name}</p>
                    <p className="text-sm text-gray-500">{story.business}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">{story.stats.monthlyRevenue}</p>
                    <p className="text-xs text-gray-500">Monthly Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">{story.stats.growth}</p>
                    <p className="text-xs text-gray-500">Year-over-Year Growth</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-bold text-gray-900">{story.stats.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">Seller Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="mt-16 bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Tips from Our Top Sellers
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Quality Photos Matter</h3>
            <p className="text-sm text-gray-600">
              Invest in good product photography. Clear, well-lit images can increase your conversion rate by up to 40%.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Respond Quickly</h3>
            <p className="text-sm text-gray-600">
              Fast response times build trust. Aim to answer customer questions within a few hours.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Competitive Pricing</h3>
            <p className="text-sm text-gray-600">
              Research your competition and price strategically. Don&apos;t always be the cheapest, but offer value.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold">Start Your Success Story Today</h2>
        <p className="mt-4 text-orange-100 max-w-xl mx-auto">
          Join thousands of successful sellers who have grown their businesses on our platform.
          No monthly fees, just results.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/seller/register"
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-orange-600 hover:bg-orange-50"
          >
            Start Selling Now
          </Link>
          <Link
            href="/seller-policies"
            className="inline-block rounded-lg border-2 border-white px-8 py-3 font-semibold text-white hover:bg-white/10"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  )
}
