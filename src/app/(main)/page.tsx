import { HeroSection } from '@/components/home/HeroSection'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { FeatureBanner, PromoBanners } from '@/components/home/PromoBanners'
import { getFeaturedProducts, getBestSellers, getNewArrivals } from '@/actions/products'

export default async function HomePage() {
  // Fetch all product sections in parallel
  const [featuredResult, bestSellersResult, newArrivalsResult] = await Promise.all([
    getFeaturedProducts(6),
    getBestSellers(6),
    getNewArrivals(6),
  ])

  // Transform to match component interface
  const transformProducts = (products: typeof featuredResult.products) =>
    products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      image: p.image,
      rating: p.rating,
      reviewCount: p.reviewCount,
      seller: { storeName: p.seller.storeName },
    }))

  return (
    <>
      {/* Hero Carousel */}
      <HeroSection />

      {/* Feature Icons (Free Shipping, Secure Payment, etc.) */}
      <FeatureBanner />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Featured Products */}
      <FeaturedProducts
        title="Онцлох бүтээгдэхүүнүүд"
        viewAllHref="/products?featured=true"
        products={transformProducts(featuredResult.products)}
      />

      {/* Promo Banners */}
      <PromoBanners />

      {/* Best Sellers */}
      <FeaturedProducts
        title="Хамгийн их зарагдсан"
        viewAllHref="/products?sort=best-selling"
        products={transformProducts(bestSellersResult.products)}
      />

      {/* New Arrivals */}
      <FeaturedProducts
        title="Шинэ бүтээгдэхүүнүүд"
        viewAllHref="/products?sort=newest"
        products={transformProducts(newArrivalsResult.products)}
      />
    </>
  )
}
