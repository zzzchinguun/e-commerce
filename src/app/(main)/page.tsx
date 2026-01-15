import { HeroSection } from '@/components/home/HeroSection'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { FeatureBanner, PromoBanners } from '@/components/home/PromoBanners'

export default function HomePage() {
  return (
    <>
      {/* Hero Carousel */}
      <HeroSection />

      {/* Feature Icons (Free Shipping, Secure Payment, etc.) */}
      <FeatureBanner />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Featured Products */}
      <FeaturedProducts title="Featured Products" viewAllHref="/products?featured=true" />

      {/* Promo Banners */}
      <PromoBanners />

      {/* Best Sellers */}
      <FeaturedProducts title="Best Sellers" viewAllHref="/products?sort=best-selling" />

      {/* New Arrivals */}
      <FeaturedProducts title="New Arrivals" viewAllHref="/products?sort=newest" />
    </>
  )
}
