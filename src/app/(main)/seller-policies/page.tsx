import { Metadata } from 'next'
import Link from 'next/link'
import { Store, DollarSign, Package, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Худалдагчийн бодлого',
  description: 'Манай marketplace-д худалдах удирдамж болон бодлого',
}

export default function SellerPoliciesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <Store className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Худалдагчийн бодлого</h1>
        <p className="mt-2 text-gray-600">
          Манай marketplace-д худалдах талаар мэдэх ёстой бүх зүйл
        </p>
      </div>

      <div className="prose prose-gray max-w-none">
        {/* Getting Started */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Эхлэх</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">Худалдагчийн шаардлага</h3>
            <ul className="list-disc pl-6 text-green-700 space-y-1">
              <li>Хүчинтэй бизнес эсвэл хувь хүний худалдагчийн бүртгэл</li>
              <li>Баталгаажуулах боломжтой холбоо барих мэдээлэл</li>
              <li>Заасан хугацаанд захиалга илгээх чадвар</li>
              <li>Хэрэглэгчийн үйлчилгээний өндөр төвшинд тууштай байх</li>
            </ul>
          </div>
          <p className="text-gray-600">
            Худалдагч болохын тулд{' '}
            <Link href="/seller/register" className="text-orange-600 hover:underline">
              энд бүртгүүлнэ үү
            </Link>
            . Манай баг таны өргөдлийг 2-3 ажлын өдрийн дотор хянана.
          </p>
        </section>

        {/* Fees and Commissions */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Хураамж & Шимтгэл</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-3 text-left font-medium text-gray-900">Хураамжийн төрөл</th>
                  <th className="border p-3 text-left font-medium text-gray-900">Хэмжээ</th>
                  <th className="border p-3 text-left font-medium text-gray-900">Тайлбар</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-3 text-gray-600">Шимтгэл</td>
                  <td className="border p-3 text-gray-600">10-15%</td>
                  <td className="border p-3 text-gray-600">Борлуулалт тутамд, ангиллаас хамаарна</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Сарын хураамж</td>
                  <td className="border p-3 text-gray-600">₮0</td>
                  <td className="border p-3 text-gray-600">Сарын захиалга шаардлагагүй</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Жагсаалтын хураамж</td>
                  <td className="border p-3 text-gray-600">₮0</td>
                  <td className="border p-3 text-gray-600">Бүтээгдэхүүн байршуулах үнэгүй</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Төлбөр боловсруулалт</td>
                  <td className="border p-3 text-gray-600">2.9% + ₮300</td>
                  <td className="border p-3 text-gray-600">Стандарт Stripe хураамж</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Product Guidelines */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Бүтээгдэхүүний удирдамж</h2>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Шаардлагатай бүтээгдэхүүний мэдээлэл</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Тод, өндөр чанартай бүтээгдэхүүний зураг (хамгийн багадаа 500x500 пиксел)</li>
            <li>Үнэн зөв бүтээгдэхүүний гарчиг болон тодорхойлолт</li>
            <li>Зөв үнэ болон нөөцийн түвшин</li>
            <li>Зөв ангиллын ангилал</li>
            <li>Хүргэлтийн жин болон хэмжээс</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Хориотой бараа</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <ul className="list-disc pl-6 text-red-700 space-y-1">
              <li>Хуурамч эсвэл хуулбар бүтээгдэхүүн</li>
              <li>Хууль бус бараа эсвэл хяналттай бодис</li>
              <li>Зэвсэг болон сум</li>
              <li>Насанд хүрэгчдэд зориулсан агуулга (зөвшөөрөгдсөн ангиллаас бусад)</li>
              <li>Оюуны өмчийн эрхийг зөрчсөн бараа</li>
              <li>Аюултай материал</li>
              <li>Амьд амьтан</li>
            </ul>
          </div>
        </section>

        {/* Shipping Requirements */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Хүргэлтийн шаардлага</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
              <h3 className="font-medium text-gray-900">Хүлээгдэж буй стандарт</h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• 2 ажлын өдрийн дотор илгээх</li>
                <li>• Хүчинтэй хяналтын дугаар өгөх</li>
                <li>• Тохирох сав баглаа ашиглах</li>
                <li>• Үнэн зөв хүргэлтийн зардал</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <AlertTriangle className="h-5 w-5 text-amber-500 mb-2" />
              <h3 className="font-medium text-gray-900">Бодлогын зөрчил</h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Хоцрогдсон илгээмж үнэлгээнд нөлөөлнө</li>
                <li>• Хяналтын дугаар байхгүй = захиалгын асуудал</li>
                <li>• Гэмтсэн бараа = буцаалт</li>
                <li>• Давтан зөрчил = түдгэлзүүлэлт</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Customer Service */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Хэрэглэгчийн үйлчилгээний стандарт</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Манай marketplace-д амжилттай байхад хэрэглэгчийн маш сайн үйлчилгээг хадгалах нь чухал:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Хэрэглэгчийн хүсэлтэд 24 цагийн дотор хариулах</li>
            <li>Буцаалт, нөхөн олговрыг marketplace-ийн бодлогын дагуу шийдвэрлэх</li>
            <li>Худалдагчийн үнэлгээг 4.0 ба түүнээс дээш хадгалах</li>
            <li>Маргааныг мэргэжлийн, шуурхай шийдвэрлэх</li>
            <li>Бүтээгдэхүүний жагсаалтыг үнэн зөв, шинэчлэгдсэн байлгах</li>
          </ul>
        </section>

        {/* Returns Policy */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Буцаалт & Нөхөн олговор</h2>
          <p className="text-gray-600 mb-4">
            Бүх худалдагч marketplace-ийн хамгийн бага буцаалтын бодлогыг дагаж мөрдөх ёстой:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Бүх бүтээгдэхүүнд хамгийн багадаа 14 хоногийн буцаалтын хугацаа</li>
            <li>Буцаалтыг хүлээн авснаас хойш 5 ажлын өдрийн дотор нөхөн олговор боловсруулах</li>
            <li>Гэмтэлтэй барааны буцаалтын хүргэлтийн зардлыг хариуцах</li>
            <li>Уртасгасан буцаалтын хугацаа санал болгох сонголт (зөвлөмжлөгддөг)</li>
          </ul>
        </section>

        {/* Account Health */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Бүртгэлийн эрүүл мэнд & Гүйцэтгэл</h2>
          <p className="text-gray-600 mb-4">
            Бид чанартай marketplace-ийн туршлагыг хангахын тулд худалдагчийн гүйцэтгэлийг хянадаг:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">&lt; 3%</p>
              <p className="text-sm text-gray-600">Захиалгын согогийн хувь</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">&gt; 95%</p>
              <p className="text-sm text-gray-600">Цагтаа илгээсэн</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">&gt; 4.0</p>
              <p className="text-sm text-gray-600">Худалдагчийн үнэлгээ</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-orange-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Худалдаж эхлэхэд бэлэн үү?</h2>
          <p className="mt-2 text-gray-600">
            Манай marketplace дээр амжилттай бизнес эрхэлж буй мянга мянган худалдагчдын нэг боломжтой
          </p>
          <Link
            href="/seller/register"
            className="mt-4 inline-block rounded-lg bg-orange-500 px-8 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Худалдагчаар бүртгүүлэх
          </Link>
        </section>
      </div>
    </div>
  )
}
