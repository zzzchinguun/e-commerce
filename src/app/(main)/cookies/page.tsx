import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Күүкийн бодлого',
  description: 'Бид күүкийг хэрхэн ашигладаг болон күүкийн тохиргоогоо удирдах талаар мэдэж авах',
}

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Күүкийн бодлого</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">
          Сүүлд шинэчилсэн: 2026 оны 1-р сарын 15
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Күүки гэж юу вэ?</h2>
          <p className="text-gray-600 mb-4">
            Күүки бол таныг вэбсайтад зочлоход төхөөрөмж дээр хадгалагддаг жижиг текст файлууд юм.
            Тэд вэбсайтад таны зочилсон мэдээллийг санахад тусалдаг бөгөөд энэ нь дахин зочлоход
            хялбар болгож, сайтыг танд илүү хэрэгтэй болгодог.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Бид күүкийг хэрхэн ашигладаг</h2>
          <p className="text-gray-600 mb-4">
            Marketplace күүкийг хэд хэдэн зорилгоор ашигладаг:
          </p>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Зайлшгүй күүки</h3>
          <p className="text-gray-600 mb-4">
            Эдгээр күүки нь вэбсайт зөв ажиллахад шаардлагатай. Тэд дараах үндсэн
            функцийг идэвхжүүлдэг:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>Хэрэглэгчийн баталгаажуулалт ба аюулгүй нэвтрэлт</li>
            <li>Худалдааны сагсны функц</li>
            <li>Таны тохиргоог санах</li>
            <li>Бүртгэлийг хамгаалах аюулгүй байдлын функцууд</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Гүйцэтгэлийн күүки</h3>
          <p className="text-gray-600 mb-4">
            Эдгээр күүки нь зочдод манай вэбсайттай хэрхэн харьцдагийг ойлгоход тусалдаг бөгөөд
            нэргүй мэдээлэл цуглуулдаг:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>Зочилсон хуудсууд болон хуудас бүрт зарцуулсан хугацаа</li>
            <li>Тохиолдсон алдааны мэдээлэл</li>
            <li>Вэбсайт ачаалах хугацаа</li>
            <li>Хэрэглэгчийн навигацийн хэв маяг</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Функциональ күүки</h3>
          <p className="text-gray-600 mb-4">
            Эдгээр күүки нь вэбсайтад таны хийсэн сонголтуудыг санахад тусалдаг:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>Таны хэл болон бүсийн тохиргоо</li>
            <li>Саяхан үзсэн бүтээгдэхүүнүүд</li>
            <li>Таны харуулах тохиргоо (жишээ нь, торон эсвэл жагсаалт)</li>
            <li>Хадгалсан хүргэлтийн хаягууд</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Маркетингийн күүки</h3>
          <p className="text-gray-600 mb-4">
            Эдгээр күүки нь холбогдох зар хүргэхийн тулд таны үзэх үйлдлийг хянадаг:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Таны үзсэн эсвэл сагсанд нэмсэн бүтээгдэхүүнүүд</li>
            <li>Таны үзсэн ангиллууд</li>
            <li>Манай маркетингийн имэйлтэй таны харилцан үйлдэл</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Гуравдагч талын күүки</h2>
          <p className="text-gray-600 mb-4">
            Бид өөрсдийн күүки тохируулж болох гуравдагч талын үйлчилгээг ашигладаг:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="font-medium text-gray-900">Google Analytics</p>
              <p className="text-sm text-gray-600">Вэбсайтын хандалт болон хэрэглэгчийн зан үйлийг шинжлэхэд ашиглагддаг</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Stripe</p>
              <p className="text-sm text-gray-600">Аюулгүй төлбөр боловсруулахад ашиглагддаг</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Нийгмийн сүлжээний залгаасууд</p>
              <p className="text-sm text-gray-600">Facebook, Twitter, Instagram товчлуурууд күүки тохируулж болно</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Күүкийн тохиргоог удирдах</h2>
          <p className="text-gray-600 mb-4">
            Танд күүкийг удирдах хэд хэдэн сонголт бий:
          </p>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Хөтчийн тохиргоо</h3>
          <p className="text-gray-600 mb-4">
            Ихэнх вэб хөтчүүд тохиргоогоороо күүкийг удирдах боломжийг олгодог. Та:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>Төхөөрөмж дээр ямар күүки хадгалагдсаныг харах</li>
            <li>Бүх эсвэл тодорхой күүкийг устгах</li>
            <li>Бүх күүки эсвэл тодорхой сайтын күүкийг хаах</li>
            <li>Хөтчийгөө күүки тохируулах үед мэдэгдэхээр тохируулах</li>
          </ul>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-amber-800 text-sm">
              <strong>Тэмдэглэл:</strong> Зайлшгүй күүкийг хаах нь нэвтрэх эсвэл сагсанд бараа
              нэмэх зэрэг манай вэбсайтын зарим функцийг ашиглахад саад болж болно.
            </p>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-3">Хөтчийн тусгай заавар</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li><a href="https://support.google.com/chrome/answer/95647" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Күүки хадгалах хугацаа</h2>
          <p className="text-gray-600 mb-4">
            Күүки зорилгоосоо хамааран өөр өөр хугацаагаар хадгалагддаг:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-3 text-left font-medium text-gray-900">Күүкийн төрөл</th>
                  <th className="border p-3 text-left font-medium text-gray-900">Хадгалах хугацаа</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-3 text-gray-600">Сессийн күүки</td>
                  <td className="border p-3 text-gray-600">Хөтчийг хаахад устана</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Баталгаажуулалтын күүки</td>
                  <td className="border p-3 text-gray-600">30 хоног (эсвэл гарах хүртэл)</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Тохиргооны күүки</td>
                  <td className="border p-3 text-gray-600">1 жил</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Аналитикийн күүки</td>
                  <td className="border p-3 text-gray-600">2 жил</td>
                </tr>
                <tr>
                  <td className="border p-3 text-gray-600">Маркетингийн күүки</td>
                  <td className="border p-3 text-gray-600">90 хоног</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Энэ бодлогод оруулсан шинэчлэлт</h2>
          <p className="text-gray-600 mb-4">
            Бид практикийн өөрчлөлт эсвэл хууль эрх зүйн, зохицуулалтын, эсвэл үйл ажиллагааны
            шалтгаанаар энэ Күүкийн бодлогыг цаг цагаас нь шинэчилж болно. Бид аливаа өөрчлөлтийг
            энэ хуудсанд нийтэлж, &quot;Сүүлд шинэчилсэн&quot; огноог шинэчлэнэ.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Холбоо барих</h2>
          <p className="text-gray-600">
            Хэрэв танд манай күүкийн хэрэглээний талаар асуулт байвал бидэнтэй холбогдоно уу:
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
