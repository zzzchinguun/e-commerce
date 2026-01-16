"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type CategoryFilter = {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  children?: CategoryFilter[];
};

const ratings = [4, 3, 2, 1];

interface ProductFiltersProps {
  className?: string;
  categories?: CategoryFilter[];
}

function FilterContent({
  onClose,
  categories = [],
}: {
  onClose?: () => void;
  categories?: CategoryFilter[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minPriceInput, setMinPriceInput] = useState("0");
  const [maxPriceInput, setMaxPriceInput] = useState("1000");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category")?.split(",").filter(Boolean) || []
  );
  const [selectedRating, setSelectedRating] = useState<number | null>(
    searchParams.get("rating") ? parseInt(searchParams.get("rating")!) : null
  );

  // Sync input fields when priceRange changes (e.g., from slider)
  const handleSliderChange = (values: number[]) => {
    setPriceRange(values);
    setMinPriceInput(values[0].toString());
    setMaxPriceInput(values[1].toString());
  };

  // Update price range from min input on Enter or blur
  const handleMinPriceCommit = () => {
    const value = minPriceInput === "" ? 0 : parseInt(minPriceInput) || 0;
    const clampedValue = Math.max(0, Math.min(value, priceRange[1]));
    setPriceRange([clampedValue, priceRange[1]]);
    setMinPriceInput(clampedValue.toString());
  };

  // Update price range from max input on Enter or blur
  const handleMaxPriceCommit = () => {
    const value = maxPriceInput === "" ? 1000 : parseInt(maxPriceInput) || 1000;
    const clampedValue = Math.max(priceRange[0], Math.min(value, 10000));
    setPriceRange([priceRange[0], clampedValue]);
    setMaxPriceInput(clampedValue.toString());
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    }
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    } else {
      params.delete("category");
    }

    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString());
    } else {
      params.delete("minPrice");
    }

    if (priceRange[1] < 1000) {
      params.set("maxPrice", priceRange[1].toString());
    } else {
      params.delete("maxPrice");
    }

    if (selectedRating) {
      params.set("rating", selectedRating.toString());
    } else {
      params.delete("rating");
    }

    router.push(`/products?${params.toString()}`);
    onClose?.();
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setMinPriceInput("0");
    setMaxPriceInput("1000");
    setSelectedRating(null);
    router.push("/products");
    onClose?.();
  };

  return (
    <div className="space-y-6">
      {/* Apply/Clear Buttons - Sticky Top */}
      <div className="sticky top-0 -mx-3 bg-white px-3 py-2 shadow-2xs">
        <div className="flex gap-2">
          <Button variant="outline" className="h-8 flex-1 px-3 text-xs" onClick={handleClearFilters}>
            Бүгдийг арилгах
          </Button>
          <Button className="h-8 flex-1 bg-orange-500 px-3 text-xs hover:bg-orange-600" onClick={handleApplyFilters}>
            Шүүлтүүр хэрэглэх
          </Button>
        </div>
      </div>

      {/* Categories */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h3 className="font-semibold text-gray-900">Ангилал</h3>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">Ангилал байхгүй байна</p>
            ) : (
              categories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={category.slug}
                      checked={selectedCategories.includes(category.slug)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.slug, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={category.slug}
                      className="flex flex-1 cursor-pointer items-center justify-between text-sm"
                    >
                      <span>{category.name}</span>
                      {category.productCount !== undefined && (
                        <span className="text-gray-400">({category.productCount})</span>
                      )}
                    </Label>
                  </div>
                  {/* Subcategories */}
                  {category.children && category.children.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1">
                      {category.children.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-2">
                          <Checkbox
                            id={sub.slug}
                            checked={selectedCategories.includes(sub.slug)}
                            onCheckedChange={(checked) =>
                              handleCategoryChange(sub.slug, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={sub.slug}
                            className="flex flex-1 cursor-pointer items-center justify-between text-sm text-gray-600"
                          >
                            <span>{sub.name}</span>
                            {sub.productCount !== undefined && (
                              <span className="text-gray-400">({sub.productCount})</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h3 className="font-semibold text-gray-900">Үнийн хязгаар</h3>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={handleSliderChange}
              max={1000}
              step={10}
              className="py-2"
            />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="text-xs text-gray-500">Доод</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  onBlur={handleMinPriceCommit}
                  onKeyDown={(e) => e.key === "Enter" && handleMinPriceCommit()}
                  className="h-9"
                />
              </div>
              <span className="mt-5 text-gray-400">-</span>
              <div className="flex-1">
                <Label className="text-xs text-gray-500">Дээд</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  onBlur={handleMaxPriceCommit}
                  onKeyDown={(e) => e.key === "Enter" && handleMaxPriceCommit()}
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Customer Rating */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h3 className="font-semibold text-gray-900">Үнэлгээ</h3>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2">
            {ratings.map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  selectedRating === rating ? "bg-orange-50 text-orange-600" : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      )}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span>ба дээш</span>
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function ProductFilters({ className, categories = [] }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Filters */}
      <div
        className={cn(
          "hidden max-h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden px-3 lg:block",
          className
        )}
      >
        <FilterContent categories={categories} />
      </div>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Шүүлтүүр
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Шүүлтүүр</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent onClose={() => setIsOpen(false)} categories={categories} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
