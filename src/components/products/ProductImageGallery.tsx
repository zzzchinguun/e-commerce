'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const hasImages = images.length > 0
  const selectedImage = hasImages ? images[selectedIndex] : null

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {selectedImage ? (
          <>
            <Image
              src={selectedImage}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              fill
              className={cn(
                'object-contain transition-transform cursor-zoom-in',
                isZoomed && 'scale-150 cursor-zoom-out'
              )}
              onClick={() => setIsZoomed(!isZoomed)}
              priority
            />
            {/* Zoom indicator */}
            <button
              className="absolute right-3 top-3 rounded-full bg-white/80 p-2 shadow-md hover:bg-white"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <ZoomIn className="h-5 w-5 text-gray-600" />
            </button>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <Package className="h-24 w-24" />
          </div>
        )}

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-md hover:bg-white"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-md hover:bg-white"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                index === selectedIndex
                  ? 'border-orange-500'
                  : 'border-transparent hover:border-gray-300'
              )}
              onClick={() => setSelectedIndex(index)}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
