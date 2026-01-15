import { Metadata } from 'next'
import { RotateCcw, Clock, CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Буцаалт & Нөхөн олговор',
  description: 'Манай буцаалтын бодлого, нөхөн олговрын үйл явц, солилцооны сонголтуудын талаар мэдэж авах',
}

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Буцаалт & Нөхөн олговор</h1>

      {/* Overview */}
      <section className="mb-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <RotateCcw className="h-8 w-8 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">30 хоногийн буцаалтын бодлого</h2>
              <p className="text-gray-600">
                Бид таныг худалдан авалтдаа бүрэн сэтгэл хангалуун байгаасай гэж хүсдэг. Хэрэв та сэтгэл
                ханамжгүй бол ихэнх барааг хүлээн авснаас хойш 30 хоногийн дотор буцааж бүрэн нөхөн олговор авах боломжтой.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Return Eligibility */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Буцаалтын шаардлага</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-gray-900">Буцаалтад тохирох</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Анхны, ашиглагдаагүй нөхцөлтэй бараа</li>
              <li>• Анхны шошготой бүтээгдэхүүн</li>
              <li>• Анхны сав баглаатай бараа</li>
              <li>• 30 хоногийн дотор буцаасан бараа</li>
              <li>• Гэмтэлтэй эсвэл эвдэрсэн бараа</li>
              <li>• Буруу бараа хүлээн авсан</li>
            </ul>
          </div>
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-gray-900">Буцаалтад тохирохгүй</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Тусгайлан хийсэн эсвэл захиалгаар хийсэн бараа</li>
              <li>• Дотуур хувцас эсвэл ариун цэврийн бараа</li>
              <li>• Муудаж болох бүтээгдэхүүн</li>
              <li>• Дижитал татан авалт</li>
              <li>• &quot;Эцсийн хямдрал&quot; гэж тэмдэглэсэн бараа</li>
              <li>• Ашигласан шинж тэмдэгтэй бараа</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How to Return */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Бараа буцаах арга</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Буцаалтаа эхлүүлэх</h3>
              <p className="text-gray-600 text-sm">
                Бүртгэлдээ нэвтэрч, &quot;Миний захиалгууд&quot; хэсэгт очоод &quot;Бараа буцаах&quot; дарна уу.
                Буцаах бараа(нууд) болон буцаах шалтгааныг сонгоно уу.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Буцаалтын шошго хэвлэх</h3>
              <p className="text-gray-600 text-sm">
                Зөвшөөрөгдсөний дараа урьдчилан төлсөн буцаалтын хүргэлтийн шошгыг имэйлээр хүлээн авна.
                Шошгыг хэвлэж илгээмжиндээ наана уу.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Барааг савлах</h3>
              <p className="text-gray-600 text-sm">
                Барааг анхны сав баглаанд (боломжтой бол) эсвэл найдвартай хайрцагт хийнэ.
                Бүх анхны шошго, дагалдах хэрэгсэл, баримт бичгийг хамт оруулна уу.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
              4
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Буцаалтаа илгээх</h3>
              <p className="text-gray-600 text-sm">
                Илгээмжээ зөвшөөрөгдсөн хүргэлтийн байршилд хүлээлгэж өгнө үү. Хяналтын
                дугаараа хадгална уу.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Refund Information */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Нөхөн олговрын мэдээлэл</h2>
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">Боловсруулах хугацаа</h3>
              <p className="text-gray-600 text-sm">
                Нөхөн олговрыг буцаалтыг хүлээн авснаас хойш 5-7 ажлын өдрийн дотор боловсруулна.
                Таны дансанд харагдахад нэмэлт 3-5 ажлын өдөр шаардагдаж болно.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">Нөхөн олговрын арга</h3>
              <p className="text-gray-600 text-sm">
                Нөхөн олговрыг анхны төлбөрийн аргаар олгоно. Хэрэв кредит картаар төлсөн бол
                нөхөн олговор картын хуулганд харагдана.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">Хүргэлтийн зардал</h3>
              <p className="text-gray-600 text-sm">
                Анхны хүргэлтийн зардлыг буцаахгүй, гэхдээ буцаалт нь манай алдаанаас болсон бол
                (буруу бараа, гэмтэлтэй бүтээгдэхүүн гэх мэт) буцаана. Гэмтэлтэй барааны буцаалтын хүргэлт үнэгүй.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exchanges */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Солилцоо</h2>
        <p className="text-gray-600 mb-4">
          Бид шууд солилцоо санал болгодоггүй. Хэрэв танд өөр хэмжээ, өнгө, эсвэл бараа хэрэгтэй бол:
        </p>
        <ol className="list-decimal pl-6 text-gray-600 space-y-2">
          <li>Анхны барааг манай буцаалтын үйл явцын дагуу буцаана</li>
          <li>Хүссэн бараагаа шинээр захиална</li>
          <li>Буцаалтыг хүлээн авсны дараа нөхөн олговрыг боловсруулна</li>
        </ol>
        <p className="text-gray-600 mt-4 text-sm italic">
          Зөвлөгөө: Хэрэв хүссэн бараа дуусаж болзошгүй бол шинэ захиалгаа шууд хийгээд
          анхны барааг нөхөн олговрын төлөө буцаана уу.
        </p>
      </section>

      {/* Damaged or Defective Items */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Гэмтсэн эсвэл гэмтэлтэй бараа</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            Хэрэв та гэмтсэн эсвэл гэмтэлтэй бараа хүлээн авсан бол уучлалт гуйя.
            Хүлээн авснаас хойш 48 цагийн дотор дараах мэдээллийн хамт бидэнтэй холбогдоно уу:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Таны захиалгын дугаар</li>
            <li>Гэмтэл эсвэл согогийн зураг</li>
            <li>Сав баглааны зураг (хүргэлтийн гэмтлийн хувьд)</li>
            <li>Асуудлын тайлбар</li>
          </ul>
          <p className="text-gray-700 mt-4">
            Бид буцаалтын үйл явцыг түргэсгэж, гэмтэлтэй барааны бүх хүргэлтийн зардлыг хариуцна.
          </p>
        </div>
      </section>

      {/* Marketplace Seller Returns */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Marketplace худалдагчийн буцаалт</h2>
        <p className="text-gray-600 mb-4">
          Манай marketplace дээрх гуравдагч талын худалдагчдын зарсан барааны буцаалтын бодлого өөр байж болно.
          Худалдагчийн буцаалтын мэдээллийг бүтээгдэхүүний жагсаалтаас шалгана уу.
        </p>
        <div className="border-l-4 border-orange-400 pl-4">
          <p className="text-gray-600">
            <strong>Тэмдэглэл:</strong> Манай marketplace дээрх бүх худалдагч хамгийн багадаа
            14 хоногийн буцаалтын хугацаа санал болгох ёстой. Хэрэв худалдагч буцаалтын бодлогоо
            хүндэтгэхгүй бол манай дэмжлэгийн багтай холбогдоно уу, бид асуудлыг шийдвэрлэхэд тусална.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Түгээмэл асуултууд</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Бэлэг буцааж болох уу?</h3>
            <p className="text-sm text-gray-600">
              Тийм, бэлэг хүлээн авагчид бараа буцаах боломжтой. Та барааны үнийн дүнтэй тэнцэх
              бэлгийн карт авах болно (анхны худалдан авалтад хэрэглэсэн хөнгөлөлтийг хасна).
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Баримтаа алдсан бол яах вэ?</h3>
            <p className="text-sm text-gray-600">
              Асуудалгүй! Бүртгэлдээ нэвтэрч захиалгын түүхээ харах боломжтой, эсвэл дэмжлэгтэй
              имэйл хаягаараа холбогдож захиалгаа хайлгана уу.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">30 хоногийн дараа бараа буцааж болох уу?</h3>
            <p className="text-sm text-gray-600">
              30 хоногийн дараах буцаалтыг тохиолдол бүрээр үнэлнэ. Нөхцөл байдлаа ярилцахын тулд дэмжлэгтэй холбогдоно уу.
              Тэмдэглэл: Хоцорсон буцаалт нөхөн олговрын оронд дэлгүүрийн кредит авч болно.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Тусламж хэрэгтэй юу?</h2>
        <p className="text-gray-600">
          Хэрэв танд буцаалтын талаар асуулт байгаа эсвэл тусламж хэрэгтэй бол манай дэмжлэгийн багтай{' '}
          <a href="mailto:returns@marketplace.com" className="text-orange-600 hover:underline">
            returns@marketplace.com
          </a>{' '}
          хаягаар холбогдоно уу эсвэл манай{' '}
          <a href="/contact" className="text-orange-600 hover:underline">
            Холбоо барих
          </a>{' '}
          хуудсаар зочилно уу.
        </p>
      </section>
    </div>
  )
}
