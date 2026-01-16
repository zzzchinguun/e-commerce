import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Худалдагчийн бодлого',
  description: 'MarketHub дээр худалдагч болохын тулд баримтлах бодлого, нөхцөлүүд',
}

export default function SellerPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Худалдагчийн бодлого</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">
          Сүүлд шинэчилсэн: 2026 оны 1-р сарын 15
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Ерөнхий мэдээлэл</h2>
          <p className="text-gray-600 mb-4">
            MarketHub нь олон худалдагчийн marketplace платформ бөгөөд худалдагчид өөрсдийн бүтээгдэхүүнийг
            сая сая хэрэглэгчдэд санал болгох боломжийг олгодог. Энэхүү бодлого нь худалдагчийн үүрэг,
            эрх, комиссын бүтэц болон бусад чухал мэдээллийг тодорхойлно.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Худалдагчаар бүртгүүлэх</h2>
          <p className="text-gray-600 mb-4">
            Худалдагчаар бүртгүүлэхийн тулд та дараах шаардлагыг хангасан байх ёстой:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>18 нас хүрсэн байх эсвэл хуулийн этгээд байх</li>
            <li>Хүчинтэй имэйл хаяг, утасны дугаартай байх</li>
            <li>Бизнесийн хаягтай байх</li>
            <li>Банкны данс эсвэл төлбөрийн данстай байх (Stripe)</li>
            <li>Холбогдох бүх бизнесийн лиценз, зөвшөөрлүүдтэй байх</li>
          </ul>
          <p className="text-gray-600 mt-4">
            Бүртгэлийн хүсэлтийг манай баг 1-2 ажлын өдрийн дотор шалгаж, баталгаажуулна.
            Бид ямар ч шалтгаанаар хүсэлтээс татгалзах эрхтэй.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Комиссын бүтэц</h2>
          <p className="text-gray-600 mb-4">
            MarketHub нь борлуулалт бүрээс комисс авдаг. Комиссын хувь нь дараах байдлаар тогтоогдоно:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <table className="w-full text-gray-600">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Ангилал</th>
                  <th className="text-right py-2">Комиссын хувь</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Үндсэн комисс</td>
                  <td className="text-right py-2 font-medium">10%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Электроник бараа</td>
                  <td className="text-right py-2 font-medium">8%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Хувцас, гоо сайхан</td>
                  <td className="text-right py-2 font-medium">12%</td>
                </tr>
                <tr>
                  <td className="py-2">Гар урлал, урлаг</td>
                  <td className="text-right py-2 font-medium">15%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-600">
            Комисс нь борлуулалтын нийт дүнгээс (хүргэлтийн төлбөрийг оруулахгүй) тооцогдоно.
            Тусгай гэрээтэй худалдагчдын хувьд комиссын хувь өөр байж болно.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Төлбөр тооцоо</h2>
          <p className="text-gray-600 mb-4">
            Худалдагчийн орлого дараах байдлаар тооцогдоно:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Борлуулалтын орлого - Комисс = Худалдагчийн цэвэр орлого</li>
            <li>Төлбөр нь захиалга &quot;Хүргэгдсэн&quot; төлөвт шилжсэний дараа боломжтой болно</li>
            <li>Stripe Connect-ээр дамжуулан банкны данс руу шилжүүлнэ</li>
            <li>Хамгийн бага татан авах дүн: ₮10,000</li>
            <li>Төлбөр шилжүүлэх хугацаа: 3-5 ажлын өдөр</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Бүтээгдэхүүний шаардлага</h2>
          <p className="text-gray-600 mb-4">
            Бүх бүтээгдэхүүн дараах шаардлагыг хангасан байх ёстой:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Үнэн зөв, тодорхой тайлбартай байх</li>
            <li>Бодит, чанартай зурагтай байх (хамгийн багадаа 1, санал болгох 3-5)</li>
            <li>Зах зээлийн бодит үнэтэй байх</li>
            <li>Хангалттай нөөцтэй байх</li>
            <li>Хууль тогтоомжийн шаардлагыг хангасан байх</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Хориотой бүтээгдэхүүн</h2>
          <p className="text-gray-600 mb-4">
            Дараах бүтээгдэхүүнүүдийг зарахыг хориглоно:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Хууль бус бүтээгдэхүүн, мансууруулах бодис</li>
            <li>Зэвсэг, тэсрэх бодис</li>
            <li>Хуурамч, дуурайсан бүтээгдэхүүн</li>
            <li>Насанд хүрэгчдэд зориулсан контент</li>
            <li>Хулгайлагдсан бараа</li>
            <li>Эрүүл мэндэд хортой бүтээгдэхүүн</li>
            <li>Зохиогчийн эрх зөрчсөн бүтээгдэхүүн</li>
            <li>Хүний эд эрхтэн, биологийн дээж</li>
            <li>Амьтны аюултай төрөл зүйл</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Захиалга биелүүлэх</h2>
          <p className="text-gray-600 mb-4">
            Худалдагч дараах үүргийг хүлээнэ:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Захиалгыг 24-48 цагийн дотор баталгаажуулах</li>
            <li>Баталгаажуулснаас хойш 3-5 ажлын өдрийн дотор илгээх</li>
            <li>Хяналтын дугаар (tracking number) оруулах</li>
            <li>Найдвартай сав баглаа ашиглах</li>
            <li>Захиалгын төлөвийг тогтмол шинэчлэх</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Буцаалт ба солилт</h2>
          <p className="text-gray-600 mb-4">
            Худалдагч дараах буцаалтын бодлогыг дагаж мөрдөх ёстой:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Хүлээн авснаас хойш 14 хоногийн дотор буцаах боломжтой</li>
            <li>Гэмтэлтэй, буруу бүтээгдэхүүнийг бүрэн буцаах</li>
            <li>Буцаалтын хүсэлтийг 48 цагийн дотор хариулах</li>
            <li>Буцаалтын тээврийн зардлыг худалдагч хариуцна (гэмтэлтэй барааны хувьд)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Үйлчлүүлэгчийн үйлчилгээ</h2>
          <p className="text-gray-600 mb-4">
            Худалдагч дараах үйлчлүүлэгчийн үйлчилгээний стандартыг хангах ёстой:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Үйлчлүүлэгчийн асуултад 24 цагийн дотор хариулах</li>
            <li>Гомдлыг мэргэжлийн түвшинд шийдвэрлэх</li>
            <li>Эелдэг, хүндэтгэлтэй харилцаа барих</li>
            <li>Бүтээгдэхүүний чанарыг баталгаажуулах</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Гүйцэтгэлийн үнэлгээ</h2>
          <p className="text-gray-600 mb-4">
            Худалдагчийн гүйцэтгэлийг дараах үзүүлэлтүүдээр үнэлнэ:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Захиалга биелүүлэлтийн хурд</li>
            <li>Үйлчлүүлэгчийн сэтгэгдэл, үнэлгээ</li>
            <li>Буцаалтын хувь</li>
            <li>Хариу өгөх хугацаа</li>
            <li>Бодлогын зөрчлийн тоо</li>
          </ul>
          <p className="text-gray-600 mt-4">
            Гүйцэтгэл муу байвал анхааруулга, түдгэлзүүлэлт, эсвэл бүртгэл цуцлалтад хүргэж болно.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Бүртгэл түдгэлзүүлэх ба цуцлах</h2>
          <p className="text-gray-600 mb-4">
            MarketHub дараах тохиолдолд худалдагчийн бүртгэлийг түдгэлзүүлэх эсвэл цуцлах эрхтэй:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Бодлогын ноцтой зөрчил</li>
            <li>Давтагдсан гомдол, сөрөг сэтгэгдэл</li>
            <li>Залилан мэхлэх үйлдэл</li>
            <li>Хууль зөрчсөн үйл ажиллагаа</li>
            <li>Гүйцэтгэлийн стандартыг хангахгүй байх</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Нууцлал ба мэдээлэл хамгаалалт</h2>
          <p className="text-gray-600 mb-4">
            Худалдагч нь үйлчлүүлэгчийн мэдээллийг зөвхөн захиалга биелүүлэх зорилгоор ашиглах ёстой.
            Үйлчлүүлэгчийн мэдээллийг гуравдагч этгээдэд дамжуулах, маркетингийн зорилгоор ашиглахыг хориглоно.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Бодлогын өөрчлөлт</h2>
          <p className="text-gray-600 mb-4">
            MarketHub нь энэхүү бодлогыг хүссэн үедээ өөрчлөх эрхтэй. Чухал өөрчлөлтийн талаар
            имэйлээр мэдэгдэх бөгөөд өөрчлөлт мэдэгдсэнээс хойш 14 хоногийн дараа хүчин төгөлдөр болно.
            Өөрчлөлтийн дараа үйлчилгээг үргэлжлүүлэн ашиглах нь шинэ бодлогыг зөвшөөрсөн гэж үзнэ.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Холбоо барих</h2>
          <p className="text-gray-600">
            Худалдагчийн бодлогын талаар асуулт байвал бидэнтэй холбогдоно уу:
          </p>
          <p className="text-gray-600 mt-2">
            Имэйл: sellers@marketplace.com<br />
            Худалдагчийн тусламжийн утас: +976 7000-1234<br />
            Ажлын цаг: Даваа-Баасан, 09:00-18:00
          </p>
        </section>
      </div>
    </div>
  )
}
