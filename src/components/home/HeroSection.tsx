'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const heroSlides = [
  {
    id: 1,
    title: 'Shop the Latest Electronics',
    subtitle: 'Discover cutting-edge gadgets and tech deals',
    cta: 'Shop Electronics',
    href: '/products?category=electronics',
    bgColor: 'from-blue-600 to-blue-800',
    image: '/placeholder-electronics.jpg',
  },
  {
    id: 2,
    title: 'Fashion for Everyone',
    subtitle: 'New arrivals in clothing and accessories',
    cta: 'Explore Fashion',
    href: '/products?category=fashion',
    bgColor: 'from-purple-600 to-purple-800',
    image: '/placeholder-fashion.jpg',
  },
  {
    id: 3,
    title: 'Home & Living Essentials',
    subtitle: 'Transform your space with quality products',
    cta: 'Shop Home',
    href: '/products?category=home-garden',
    bgColor: 'from-green-600 to-green-800',
    image: '/placeholder-home.jpg',
  },
  {
    id: 4,
    title: 'Sell on Marketplace',
    subtitle: 'Reach millions of customers and grow your business',
    cta: 'Start Selling',
    href: '/seller/register',
    bgColor: 'from-orange-500 to-orange-700',
    image: '/placeholder-seller.jpg',
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[300px] md:h-[400px] lg:h-[500px]">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-500',
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            <div className={cn('h-full bg-gradient-to-r', slide.bgColor)}>
              <div className="container mx-auto flex h-full items-center px-4">
                <div className="max-w-lg text-white">
                  <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
                    {slide.title}
                  </h1>
                  <p className="mb-6 text-lg text-white/90 md:text-xl">
                    {slide.subtitle}
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <Link href={slide.href}>{slide.cta}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                index === currentSlide ? 'w-6 bg-white' : 'bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
