import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Laptop,
  Shirt,
  Home,
  Dumbbell,
  Heart,
  BookOpen,
  Gamepad2,
  Package,
} from 'lucide-react'
import { Container } from '@/components/layout/Container'

export const metadata: Metadata = {
  title: 'Бүх ангилалууд',
  description: 'Бүтээгдэхүүний бүх ангилалуудыг үзэх',
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop: Laptop,
  Shirt: Shirt,
  Home: Home,
  Dumbbell: Dumbbell,
  Heart: Heart,
  BookOpen: BookOpen,
  Gamepad2: Gamepad2,
}

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  icon: string | null
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url, icon')
    .eq('is_active', true)
    .is('parent_id', null) // Only top-level categories
    .order('sort_order', { ascending: true })

  return (data as Category[]) || []
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <Container className="py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Ангилалаар хайх</h1>
        <p className="mt-2 text-gray-600">
          Бүтээгдэхүүний өргөн ангилалуудыг судлах
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => {
            const IconComponent = category.icon ? iconMap[category.icon] : Package

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-xl border bg-white p-6 transition-all hover:shadow-lg hover:border-orange-200"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                    {IconComponent && <IconComponent className="h-8 w-8" />}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-500 transform scale-x-0 transition-transform group-hover:scale-x-100" />
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">Одоогоор ангилал байхгүй байна</p>
          <p className="mt-2 text-sm text-gray-400">
            Удахгүй шинэ ангилалууд нэмэгдэнэ
          </p>
        </div>
      )}

      {/* Popular Categories Banner */}
      <div className="mt-16 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Хайж буй зүйлээ олохгүй байна уу?</h2>
          <p className="mt-2 text-orange-100">
            Хайлтын функцийг ашиглан хүссэн зүйлээ олоорой
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-orange-600 transition-colors hover:bg-orange-50"
          >
            Бүх бүтээгдэхүүн үзэх
          </Link>
        </div>
      </div>
    </Container>
  )
}
