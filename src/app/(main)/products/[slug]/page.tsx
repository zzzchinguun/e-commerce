import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductImageGallery } from '@/components/products/ProductImageGallery'
import { ProductInfo } from '@/components/products/ProductInfo'
import { ProductReviews } from '@/components/products/ProductReviews'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getPublicProductBySlug, getRelatedProducts } from '@/actions/products'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const { product } = await getPublicProductBySlug(slug)

  if (!product) {
    return {
      title: 'Бүтээгдэхүүн олдсонгүй',
    }
  }

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const { product, error } = await getPublicProductBySlug(slug)

  if (error || !product) {
    notFound()
  }

  // Fetch related products from the same category
  const { products: relatedProducts } = await getRelatedProducts(
    product.id,
    product.category?.id
  )

  // Transform related products for FeaturedProducts component
  const transformedRelatedProducts = relatedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    image: p.image,
    rating: p.rating,
    reviewCount: p.reviewCount,
    seller: {
      storeName: p.seller.storeName,
    },
  }))

  // Transform product for ProductInfo component
  const productForInfo = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stock: product.stock,
    images: product.images,
    seller: {
      id: product.seller.id,
      storeName: product.seller.storeName,
      storeSlug: product.seller.storeSlug,
      rating: product.seller.rating,
    },
    variants: product.variants,
    options: product.options,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-orange-600">
              Нүүр
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/products" className="hover:text-orange-600">
              Бүтээгдэхүүн
            </Link>
          </li>
          {product.category && (
            <>
              <li>/</li>
              <li>
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="hover:text-orange-600"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <li>/</li>
          <li className="text-gray-900 truncate max-w-[200px]">{product.name}</li>
        </ol>
      </nav>

      {/* Product Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div>
          <ProductImageGallery images={product.images} productName={product.name} />
        </div>

        {/* Product Info */}
        <div>
          <ProductInfo product={productForInfo} />
        </div>
      </div>

      <Separator className="my-12" />

      {/* Product Details Tabs */}
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="reviews">Сэтгэгдэл</TabsTrigger>
          <TabsTrigger value="description">Тайлбар</TabsTrigger>
          <TabsTrigger value="shipping">Хүргэлт & Буцаалт</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6" id="reviews">
          <ProductReviews
            productId={product.id}
            averageRating={product.rating}
            totalReviews={product.reviewCount}
          />
        </TabsContent>

        <TabsContent value="description" className="mt-6">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900">Бүтээгдэхүүний тайлбар</h3>
            <div className="mt-4 whitespace-pre-line text-gray-600">
              {product.description}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <div className="rounded-lg border p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Хүргэлтийн мэдээлэл</h3>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <p>• 50,000₮-ээс дээш захиалгад үнэгүй хүргэлт</p>
                  <p>• Энгийн хүргэлт: 5-7 ажлын өдөр (4,990₮)</p>
                  <p>• Түргэн хүргэлт: 2-3 ажлын өдөр (9,990₮)</p>
                  <p>• Маргааш хүргэх боломжтой (14,990₮)</p>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Буцаалтын бодлого</h3>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <p>• Хүргэлт хийгдсэнээс хойш 30 хоногийн дотор буцаах боломжтой</p>
                  <p>• Бараа хэрэглэгдээгүй, анхны савлагаатай байх ёстой</p>
                  <p>• Гэмтэлтэй бүтээгдэхүүнийг үнэгүй буцаана</p>
                  <p>• Буцаалт 5-7 ажлын өдөрт шийдвэрлэгдэнэ</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {transformedRelatedProducts.length > 0 && (
        <>
          <Separator className="my-12" />
          <FeaturedProducts
            title="Хэрэглэгчид мөн үзсэн"
            viewAllHref="/products"
            products={transformedRelatedProducts}
          />
        </>
      )}
    </div>
  )
}
