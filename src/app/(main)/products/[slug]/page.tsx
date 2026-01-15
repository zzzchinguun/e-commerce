import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductImageGallery } from '@/components/products/ProductImageGallery'
import { ProductInfo } from '@/components/products/ProductInfo'
import { ProductReviews } from '@/components/products/ProductReviews'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Placeholder product data - will be replaced with real data from Supabase
const placeholderProduct = {
  id: '1',
  name: 'Wireless Bluetooth Headphones with Active Noise Cancellation',
  slug: 'wireless-bluetooth-headphones',
  description: `Experience premium sound quality with our Wireless Bluetooth Headphones featuring Active Noise Cancellation technology.

Key Features:
• Active Noise Cancellation (ANC) blocks out external noise
• 40-hour battery life with quick charge capability
• Premium 40mm drivers for rich, detailed sound
• Comfortable over-ear design with memory foam cushions
• Bluetooth 5.2 for stable wireless connection
• Built-in microphone for hands-free calls
• Foldable design with carrying case included
• Compatible with all Bluetooth devices

Perfect for:
- Commuting and travel
- Working from home
- Gaming and entertainment
- Music production

What's in the box:
- Wireless Headphones
- USB-C charging cable
- 3.5mm audio cable
- Carrying case
- User manual`,
  price: 79.99,
  compareAtPrice: 129.99,
  rating: 4.5,
  reviewCount: 1234,
  stock: 156,
  images: [],
  seller: {
    id: 'seller-1',
    storeName: 'TechStore',
    storeSlug: 'techstore',
    rating: 4.8,
  },
  options: [
    {
      name: 'Color',
      values: ['Black', 'White', 'Navy Blue'],
    },
  ],
  variants: [
    {
      id: 'v1',
      name: 'Black',
      price: 79.99,
      compareAtPrice: 129.99,
      stock: 56,
      options: { Color: 'Black' },
    },
    {
      id: 'v2',
      name: 'White',
      price: 79.99,
      compareAtPrice: 129.99,
      stock: 50,
      options: { Color: 'White' },
    },
    {
      id: 'v3',
      name: 'Navy Blue',
      price: 84.99,
      compareAtPrice: 134.99,
      stock: 50,
      options: { Color: 'Navy Blue' },
    },
  ],
}

// Placeholder related products
const relatedProducts = [
  {
    id: '2',
    name: 'Premium Cotton T-Shirt - Multiple Colors Available',
    slug: 'premium-cotton-tshirt',
    price: 24.99,
    compareAtPrice: null,
    image: null,
    rating: 4.2,
    reviewCount: 856,
    seller: { storeName: 'FashionHub' },
  },
  {
    id: '5',
    name: 'Portable Bluetooth Speaker - Waterproof',
    slug: 'portable-bluetooth-speaker',
    price: 45.99,
    compareAtPrice: 69.99,
    image: null,
    rating: 4.6,
    reviewCount: 1892,
    seller: { storeName: 'TechStore' },
  },
  {
    id: '8',
    name: 'Wireless Gaming Mouse - RGB Backlit',
    slug: 'wireless-gaming-mouse',
    price: 59.99,
    compareAtPrice: 79.99,
    image: null,
    rating: 4.6,
    reviewCount: 1567,
    seller: { storeName: 'TechStore' },
  },
  {
    id: '11',
    name: 'Laptop Stand - Adjustable Aluminum',
    slug: 'laptop-stand-adjustable',
    price: 39.99,
    compareAtPrice: 54.99,
    image: null,
    rating: 4.7,
    reviewCount: 2341,
    seller: { storeName: 'TechStore' },
  },
  {
    id: '7',
    name: 'Stainless Steel Water Bottle - Vacuum Insulated',
    slug: 'stainless-steel-water-bottle',
    price: 24.99,
    compareAtPrice: 34.99,
    image: null,
    rating: 4.8,
    reviewCount: 3421,
    seller: { storeName: 'EcoLife' },
  },
  {
    id: '10',
    name: 'Essential Oil Diffuser - 300ml Capacity',
    slug: 'essential-oil-diffuser',
    price: 29.99,
    compareAtPrice: null,
    image: null,
    rating: 4.5,
    reviewCount: 1245,
    seller: { storeName: 'HomeEssentials' },
  },
]

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params

  // In a real app, fetch product from database
  // For now, use placeholder
  const product = slug === placeholderProduct.slug ? placeholderProduct : null

  if (!product) {
    return {
      title: 'Product Not Found',
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

  // In a real app, fetch product from database
  // For now, use placeholder if slug matches
  const product = slug === placeholderProduct.slug ? placeholderProduct : null

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-2">
          <li>
            <a href="/" className="hover:text-orange-600">
              Home
            </a>
          </li>
          <li>/</li>
          <li>
            <a href="/products" className="hover:text-orange-600">
              Products
            </a>
          </li>
          <li>/</li>
          <li className="text-gray-900">{product.name}</li>
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
          <ProductInfo product={product} />
        </div>
      </div>

      <Separator className="my-12" />

      {/* Product Details Tabs */}
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6" id="reviews">
          <ProductReviews
            productId={product.id}
            averageRating={product.rating}
            totalReviews={product.reviewCount}
          />
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900">Product Specifications</h3>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-500">Brand</div>
                <div className="font-medium text-gray-900">{product.seller.storeName}</div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-500">Connectivity</div>
                <div className="font-medium text-gray-900">Bluetooth 5.2</div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-500">Battery Life</div>
                <div className="font-medium text-gray-900">40 Hours</div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-500">Driver Size</div>
                <div className="font-medium text-gray-900">40mm</div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-500">Weight</div>
                <div className="font-medium text-gray-900">250g</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <div className="rounded-lg border p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <p>• Free standard shipping on orders over $50</p>
                  <p>• Standard shipping: 5-7 business days ($4.99)</p>
                  <p>• Express shipping: 2-3 business days ($9.99)</p>
                  <p>• Next-day delivery available in select areas ($14.99)</p>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Return Policy</h3>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <p>• 30-day return window from delivery date</p>
                  <p>• Items must be unused and in original packaging</p>
                  <p>• Free returns on defective products</p>
                  <p>• Refund processed within 5-7 business days</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Separator className="my-12" />

      {/* Related Products */}
      <FeaturedProducts
        title="Customers Also Viewed"
        viewAllHref="/products"
        products={relatedProducts}
      />
    </div>
  )
}
