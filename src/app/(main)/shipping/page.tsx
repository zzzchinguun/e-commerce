import { Metadata } from 'next'
import { Truck, Clock, Globe, Package, AlertCircle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Хүргэлтийн мэдээлэл',
  description: 'Манай хүргэлтийн сонголт, хугацаа, бодлогын талаар мэдээлэл авах',
}

const shippingMethods = [
  {
    name: 'Энгийн хүргэлт',
    time: '5-7 ажлын өдөр',
    price: '₮5,000',
    freeOver: '₮50,000',
    icon: Package,
  },
  {
    name: 'Шуурхай хүргэлт',
    time: '2-3 ажлын өдөр',
    price: '₮10,000',
    freeOver: '₮150,000',
    icon: Truck,
  },
  {
    name: 'Маргааш хүргэх',
    time: '1 ажлын өдөр',
    price: '₮15,000',
    freeOver: null,
    icon: Clock,
  },
]

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Хүргэлтийн мэдээлэл</h1>

      {/* Shipping Methods */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Хүргэлтийн сонголтууд</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {shippingMethods.map((method) => (
            <div key={method.name} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-full mb-4">
                <method.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{method.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{method.time}</p>
              <p className="text-lg font-bold text-gray-900">{method.price}</p>
              {method.freeOver && (
                <p className="text-sm text-green-600 mt-2">
                  {method.freeOver}-с дээш захиалгад үнэгүй
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Delivery Areas */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Хүргэлтийн бүс нутаг</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Globe className="h-6 w-6 text-orange-500 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Дотоодын хүргэлт</h3>
              <p className="text-gray-600 mb-4">
                Бид Улаанбаатар хот болон бүх аймгийн төвүүдэд хүргэлт хийдэг. Энгийн болон
                шуурхай хүргэлтийн хугацаа алслагдсан газруудад өөр байж болно.
              </p>
              <h3 className="font-semibold text-gray-900 mb-2">Олон улсын хүргэлт</h3>
              <p className="text-gray-600">
                Бид одоогоор Хятад, Солонгос, Япон, АНУ руу олон улсын хүргэлт санал болгож байна.
                Олон улсын захиалга гаалийн татвар, хураамжтай байж болох бөгөөд энэ нь
                худалдан авагчийн хариуцлага юм.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Processing Time */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Захиалга боловсруулах</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">14:00 цагаас өмнө хийсэн захиалга</p>
              <p className="text-gray-600 text-sm">Тухайн ажлын өдөрт боловсруулна</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">14:00 цагаас хойш хийсэн захиалга</p>
              <p className="text-gray-600 text-sm">Дараагийн ажлын өдөрт боловсруулна</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Амралтын өдөр болон баярын өдрийн захиалга</p>
              <p className="text-gray-600 text-sm">Дараагийн ажлын өдөрт боловсруулна</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Захиалга хянах</h2>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            Таны захиалга илгээгдсэний дараа хяналтын мэдээлэл бүхий имэйл авах болно. Та мөн
            дараах байдлаар захиалгаа хянах боломжтой:
          </p>
          <ol className="list-decimal pl-6 text-gray-600 space-y-2">
            <li>Бүртгэлдээ нэвтрэх</li>
            <li>&quot;Миний захиалгууд&quot; хэсэгт очих</li>
            <li>Хянах захиалгаа сонгох</li>
            <li>Өгөгдсөн хяналтын дугаарыг ашиглах</li>
          </ol>
        </div>
      </section>

      {/* Shipping Partners */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Манай хүргэлтийн түншүүд</h2>
        <p className="text-gray-600 mb-4">
          Бид таны илгээмж аюулгүй хүрэхийг баталгаажуулахын тулд итгэлтэй хүргэлтийн компаниудтай хамтран ажилладаг:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Монгол Шуудан', 'EMS', 'DHL', 'FedEx'].map((carrier) => (
            <div key={carrier} className="border rounded-lg p-4 text-center">
              <p className="font-medium text-gray-900">{carrier}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seller Shipping */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Marketplace худалдагчийн хүргэлт</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-600 mb-4">
            Marketplace олон худалдагчийг эзэмшдэг тул хүргэлтийн хугацаа болон арга худалдагчаас хамааран өөр байж болно.
            Бүтээгдэхүүн бүрийн жагсаалтад дараах зүйлс харагдана:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Таамагласан хүргэлтийн зардал</li>
            <li>Хүлээгдэж буй хүргэлтийн хугацаа</li>
            <li>Худалдагчийн хүргэлтийн байршил</li>
            <li>Боломжит хүргэлтийн аргууд</li>
          </ul>
          <p className="text-gray-600 mt-4">
            Хэрэв та олон худалдагчаас захиалга өгвөл таны бараанууд тусдаа илгээмжээр ирж болно.
          </p>
        </div>
      </section>

      {/* Special Circumstances */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Онцгой нөхцөл байдал</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h3 className="font-medium text-gray-900">Оргил улирлын саатал</h3>
            <p className="text-gray-600 text-sm">
              Баярын улиралд (11-12 сар) хүргэлтийн хугацаа 2-3 өдрөөр уртсаж болно.
            </p>
          </div>
          <div className="border-l-4 border-amber-400 pl-4">
            <h3 className="font-medium text-gray-900">Цаг агаарын саатал</h3>
            <p className="text-gray-600 text-sm">
              Хүнд цаг агаарын нөхцөл байдал хүргэлтийн хугацаанд нөлөөлж болно. Чухал саатлын талаар бид танд мэдэгдэх болно.
            </p>
          </div>
          <div className="border-l-4 border-amber-400 pl-4">
            <h3 className="font-medium text-gray-900">Хаягийн асуудал</h3>
            <p className="text-gray-600 text-sm">
              Хүргэлтийн хаягаа зөв оруулсан эсэхийг шалгана уу. Хэрэглэгчийн өгсөн буруу хаягаар
              хүргэгдсэн илгээмжийн хариуцлагыг бид хүлээхгүй.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Асуулт байна уу?</h2>
        <p className="text-gray-600">
          Хэрэв танд хүргэлтийн талаар асуулт байгаа эсвэл захиалгаа хянахад тусламж хэрэгтэй бол
          манай дэмжлэгийн багтай{' '}
          <a href="mailto:shipping@marketplace.com" className="text-orange-600 hover:underline">
            shipping@marketplace.com
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
