import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Нууцлалын бодлого',
  description: 'Бид таны хувийн мэдээллийг хэрхэн цуглуулж, ашиглаж, хамгаалдаг талаар мэдэж авах',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Нууцлалын бодлого</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">
          Сүүлд шинэчилсэн: 2026 оны 1-р сарын 15
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Танилцуулга</h2>
          <p className="text-gray-600 mb-4">
            Marketplace-д тавтай морил. Бид таны хувийн мэдээлэл болон нууцлалын эрхийг хамгаалахад
            тууштай ажилладаг. Энэхүү Нууцлалын бодлого нь бид таны мэдээллийг манай вэбсайт болон
            үйлчилгээг ашиглахад хэрхэн цуглуулж, ашиглаж, задруулж, хамгаалдаг талаар тайлбарлана.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Бидний цуглуулдаг мэдээлэл</h2>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Хувийн мэдээлэл</h3>
          <p className="text-gray-600 mb-4">
            Бид та сайн дураараа өгсөн хувийн мэдээллийг цуглуулдаг:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>Нэр болон холбоо барих мэдээлэл (имэйл, утас, хаяг)</li>
            <li>Бүртгэлийн мэдээлэл (хэрэглэгчийн нэр, нууц үг)</li>
            <li>Төлбөрийн мэдээлэл (Stripe-ээр аюулгүй боловсруулна)</li>
            <li>Профайлын мэдээлэл болон тохиргоо</li>
            <li>Захиалгын түүх болон гүйлгээний дэлгэрэнгүй</li>
            <li>Хэрэглэгчийн дэмжлэгтэй харилцсан бичлэг</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Автоматаар цуглуулсан мэдээлэл</h3>
          <p className="text-gray-600 mb-4">
            Та манай вэбсайтад зочлоход бид зарим мэдээллийг автоматаар цуглуулна:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Төхөөрөмжийн мэдээлэл (хөтчийн төрөл, үйлдлийн систем)</li>
            <li>IP хаяг болон байршлын мэдээлэл</li>
            <li>Үзэх зан үйл болон хуудасны харилцан үйлдэл</li>
            <li>Күүки болон ижил төстэй хянах технологи</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Таны мэдээллийг хэрхэн ашигладаг</h2>
          <p className="text-gray-600 mb-4">
            Бид таны мэдээллийг дараах зорилгоор ашигладаг:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Захиалга боловсруулж, биелүүлэх</li>
            <li>Бүртгэл үүсгэж, удирдах</li>
            <li>Төлбөр боловсруулж, залилангаас сэргийлэх</li>
            <li>Захиалгын баталгаа болон хүргэлтийн мэдээлэл илгээх</li>
            <li>Хүсэлтэд хариулж, хэрэглэгчийн дэмжлэг үзүүлэх</li>
            <li>Маркетингийн мэдээлэл илгээх (таны зөвшөөрлөөр)</li>
            <li>Вэбсайт болон үйлчилгээгээ сайжруулах</li>
            <li>Хуулийн үүргийг дагаж мөрдөх</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Мэдээлэл хуваалцах</h2>
          <p className="text-gray-600 mb-4">
            Бид таны мэдээллийг дараах талуудтай хуваалцаж болно:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li><strong>Худалдагчид:</strong> Захиалгыг биелүүлэхийн тулд (нэр, хаяг, захиалгын дэлгэрэнгүй)</li>
            <li><strong>Төлбөр боловсруулагч:</strong> Stripe төлбөрийг аюулгүй боловсруулна</li>
            <li><strong>Хүргэлтийн түншүүд:</strong> Захиалгыг хүргэхийн тулд</li>
            <li><strong>Үйлчилгээ үзүүлэгчид:</strong> Аналитик, имэйл үйлчилгээ, хостингийн хувьд</li>
            <li><strong>Хууль хяналтын байгууллага:</strong> Хуулиар шаардлагатай үед эсвэл эрхээ хамгаалахын тулд</li>
          </ul>
          <p className="text-gray-600 mt-4">
            Бид таны хувийн мэдээллийг гуравдагч талд зарахгүй.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Мэдээллийн аюулгүй байдал</h2>
          <p className="text-gray-600 mb-4">
            Бид таны мэдээллийг хамгаалахын тулд зохих аюулгүй байдлын арга хэмжээ авдаг:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Мэдээлэл дамжуулахад SSL/TLS шифрлэлт</li>
            <li>Аюулгүй нууц үгийн хэшлэлт</li>
            <li>Тогтмол аюулгүй байдлын үнэлгээ</li>
            <li>Ажилтнуудын хувийн мэдээлэлд хандах хязгаарлалт</li>
            <li>PCI-DSS стандартад нийцсэн төлбөр боловсруулалт</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Күүки болон хянах</h2>
          <p className="text-gray-600 mb-4">
            Бид күүки болон ижил төстэй технологийг дараах зорилгоор ашигладаг:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Бүртгэлд нэвтэрсэн байлгах</li>
            <li>Тохиргоо болон сагсны барааг санах</li>
            <li>Вэбсайтын хандалт, ашиглалтыг шинжлэх</li>
            <li>Тохируулсан агуулга болон зар хүргэх</li>
          </ul>
          <p className="text-gray-600 mt-4">
            Та хөтчийн тохиргоогоор күүкийн тохиргоог удирдах боломжтой. Күүкийг идэвхгүй болгох нь
            вэбсайтын функцэд нөлөөлж болохыг анхаарна уу.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Таны нууцлалын эрх</h2>
          <p className="text-gray-600 mb-4">
            Байршлаас хамааран та дараах эрхтэй байж болно:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li><strong>Хандах:</strong> Хувийн мэдээллийнхээ хуулбарыг авах</li>
            <li><strong>Засах:</strong> Буруу мэдээллийг шинэчлэх</li>
            <li><strong>Устгах:</strong> Мэдээллээ устгуулахыг хүсэх</li>
            <li><strong>Зөөвөрлөх:</strong> Мэдээллээ зөөвөрлөх боломжтой форматаар авах</li>
            <li><strong>Татгалзах:</strong> Маркетингийн мэдээллийн захиалгаас гарах</li>
            <li><strong>Боловсруулалтыг хязгаарлах:</strong> Мэдээллээ хэрхэн ашиглахыг хязгаарлах</li>
          </ul>
          <p className="text-gray-600 mt-4">
            Эдгээр эрхийг хэрэгжүүлэхийн тулд privacy@marketplace.com хаягаар бидэнтэй холбогдоно уу.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Мэдээлэл хадгалах</h2>
          <p className="text-gray-600 mb-4">
            Бид таны хувийн мэдээллийг дараах зорилгоор шаардлагатай хугацаанд хадгална:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Үйлчилгээ үзүүлж, гүйлгээ биелүүлэх</li>
            <li>Хуулийн үүргийг дагаж мөрдөх</li>
            <li>Маргаан шийдвэрлэж, гэрээ хэрэгжүүлэх</li>
          </ul>
          <p className="text-gray-600 mt-4">
            Шаардлагагүй болсон үед бид мэдээллийг аюулгүй устгах эсвэл нэргүйжүүлнэ.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Хүүхдийн нууцлал</h2>
          <p className="text-gray-600 mb-4">
            Манай Үйлчилгээ 13 наснаас доош хүүхдүүдэд зориулагдаагүй. Бид 13 наснаас доош хүүхдээс
            хувийн мэдээлэл санаатайгаар цуглуулдаггүй. Хэрэв бид ийм мэдээлэл цуглуулсан гэж үзвэл
            бидэнтэй нэн даруй холбогдоно уу.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Олон улсын дамжуулалт</h2>
          <p className="text-gray-600 mb-4">
            Таны мэдээллийг таны улсаас өөр улсад дамжуулж, боловсруулж болно.
            Бид холбогдох мэдээлэл хамгаалах хуулийн дагуу ийм дамжуулалтад зохих хамгаалалт
            хангасан эсэхийг баталгаажуулна.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Энэ бодлогод оруулсан өөрчлөлт</h2>
          <p className="text-gray-600 mb-4">
            Бид энэ Нууцлалын бодлогыг цаг цагаас нь шинэчилж болно. Бид шинэ бодлогыг энэ хуудсанд
            нийтэлж, &quot;Сүүлд шинэчилсэн&quot; огноог шинэчлэх замаар чухал өөрчлөлтийн талаар мэдэгдэнэ.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Холбоо барих</h2>
          <p className="text-gray-600">
            Хэрэв танд энэ Нууцлалын бодлого эсвэл манай мэдээлэл боловсруулах практикийн талаар асуулт байвал бидэнтэй холбогдоно уу:
          </p>
          <p className="text-gray-600 mt-2">
            Имэйл: privacy@marketplace.com<br />
            Хаяг: Чингисийн өргөн чөлөө 15, Улаанбаатар, Монгол
          </p>
        </section>
      </div>
    </div>
  )
}
