import { Metadata } from 'next'
import Link from 'next/link'
import { Star, TrendingUp, Users, DollarSign, Quote } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Амжилтын түүхүүд',
  description: 'Манай marketplace-ийн амжилттай худалдагчдын урам зоригтой түүхүүдийг унш',
}

const successStories = [
  {
    name: 'Сараа Батсүх',
    business: 'Гар урлалын үнэт эдлэл ХХК',
    image: 'https://picsum.photos/seed/seller1/200/200',
    quote: 'Энэ marketplace-д эхлэх нь миний жижиг бизнест хамгийн зөв шийдвэр байлаа. 6 сарын дотор би хобби худалдагчаас бүтэн цагийн үнэт эдлэлийн бизнес эрхлэгч болсон.',
    stats: {
      monthlyRevenue: '₮15,000,000+',
      growth: '400%',
      rating: 4.9,
    },
    category: 'Үнэт эдлэл & Гоёл чимэглэл',
  },
  {
    name: 'Мөнхбат Ганбаатар',
    business: 'ТехГаджет Плюс',
    image: 'https://picsum.photos/seed/seller2/200/200',
    quote: 'Худалдагчийн хэрэгсэл болон аналитик надад хэрэглэгчдээ илүү сайн ойлгоход тусалсан. Би электроникийн бизнесээ гаражаас агуулахын үйл ажиллагаа болгон өсгөсөн.',
    stats: {
      monthlyRevenue: '₮50,000,000+',
      growth: '250%',
      rating: 4.8,
    },
    category: 'Электроник',
  },
  {
    name: 'Энхтуяа Дорж',
    business: 'Органик гэрийн хэрэгсэл',
    image: 'https://picsum.photos/seed/seller3/200/200',
    quote: 'Гэрээсээ бизнес эрхэлдэг ээж болохын хувьд энэ платформ надад хэрэгтэй уян хатан байдлыг өгсөн. Бага хураамж болон маш сайн дэмжлэг бүх зүйлийг өөрчилсөн.',
    stats: {
      monthlyRevenue: '₮8,000,000+',
      growth: '300%',
      rating: 5.0,
    },
    category: 'Гэр & Цэцэрлэг',
  },
  {
    name: 'Дорж Түмэн',
    business: 'Фитнес тоног төхөөрөмж Про',
    image: 'https://picsum.photos/seed/seller4/200/200',
    quote: 'Marketplace-ийн хүрэх хүрээ надад улс даяарх фитнес сонирхогчидтой холбогдоход тусалсан. Миний борлуулалт эхний жилд гурав дахин өссөн.',
    stats: {
      monthlyRevenue: '₮25,000,000+',
      growth: '200%',
      rating: 4.7,
    },
    category: 'Спорт & Гадаа',
  },
]

const platformStats = [
  { label: 'Идэвхтэй худалдагчид', value: '10,000+', icon: Users },
  { label: 'Сарын борлуулалт', value: '₮5 тэрбум+', icon: DollarSign },
  { label: 'Дундаж худалдагчийн өсөлт', value: '180%', icon: TrendingUp },
  { label: 'Худалдагчийн сэтгэл ханамж', value: '4.8/5', icon: Star },
]

export default function SuccessStoriesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900">Худалдагчдын амжилтын түүхүүд</h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Таны адил бизнес эрхлэгчид манай marketplace дээр хэрхэн амжилттай бизнес байгуулснаа мэдэж аваарай
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
                    <p className="text-xs text-gray-500">Сарын орлого</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">{story.stats.growth}</p>
                    <p className="text-xs text-gray-500">Жилийн өсөлт</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-bold text-gray-900">{story.stats.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">Худалдагчийн үнэлгээ</p>
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
          Манай шилдэг худалдагчдын зөвлөгөө
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Чанартай зураг чухал</h3>
            <p className="text-sm text-gray-600">
              Сайн бүтээгдэхүүний зурагт хөрөнгө оруул. Тод, сайн гэрэлтүүлэгтэй зургууд таны хөрвүүлэлтийн хувийг 40% хүртэл нэмэгдүүлж болно.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Шуурхай хариулах</h3>
            <p className="text-sm text-gray-600">
              Хурдан хариу өгөх нь итгэлийг бий болгодог. Хэрэглэгчийн асуултад хэдэн цагийн дотор хариулахыг зорь.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Өрсөлдөхүйц үнэ</h3>
            <p className="text-sm text-gray-600">
              Өрсөлдөгчөө судалж, стратегиар үнэ тогтоо. Үргэлж хамгийн хямд байх шаардлагагүй, харин үнэ цэнэ санал болго.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold">Өнөөдөр өөрийн амжилтын түүхээ эхлүүл</h2>
        <p className="mt-4 text-orange-100 max-w-xl mx-auto">
          Манай платформ дээр бизнесээ амжилттай өсгөсөн мянга мянган худалдагчдын нэг болоорой.
          Сарын хураамжгүй, зөвхөн үр дүн.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/seller/register"
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-orange-600 hover:bg-orange-50"
          >
            Одоо худалдаж эхлэх
          </Link>
          <Link
            href="/seller-policies"
            className="inline-block rounded-lg border-2 border-white px-8 py-3 font-semibold text-white hover:bg-white/10"
          >
            Дэлгэрэнгүй мэдээлэл
          </Link>
        </div>
      </div>
    </div>
  )
}
