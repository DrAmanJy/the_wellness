'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react';

import ProductAddToCartBar from './components/ProductAddToCartBar';
import ProductClinicalInfo from './components/ProductClinicalInfo';
import ProductGallery from './components/ProductGallery';
import RelatedProductsGrid from './components/RelatedProductsGrid';
import type { ApiProductListItem } from './types';

import { useCart } from '@/context/CartContext';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import { Product } from '@/lib/products';

export default function ProductDetailClient({ slug }: { slug: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    let isSubscribed = true;

    async function resolveProduct() {
      setIsLoading(true);

      let foundProduct: Product | null = null;
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      // 1. Try fetching live product from backend API first
      try {
        const singleRes = await fetch(`${API_BASE}/api/products/${slug}`, {
          signal: AbortSignal.timeout(4000),
        });

        if (singleRes.ok) {
          const singleJson = (await singleRes.json()) as {
            success?: boolean;
            data?: {
              id: string;
              name: string;
              categoryName?: string;
              category?: string;
              type?: string;
              description?: string;
              shortDescription?: string;
              features?: string[];
              benefits?: string[];
              ingredients?: string[];
              primaryImage?: string;
              image?: string;
              images?: Array<string | { url?: string }>;
              sellingPrice?: number | string;
              startingPrice?: number;
              mrp?: number | string;
              compareAtPrice?: number;
              availableQty?: number;
              inventoryQty?: number;
              stockQty?: number;
              tags?: string[];
              requiresPrescription?: boolean;
              dosage?: string;
            };
          };
          if (singleJson.success && singleJson.data) {
            const item = singleJson.data;
            const spNum =
              typeof item.sellingPrice === 'number'
                ? item.sellingPrice
                : typeof item.sellingPrice === 'string'
                  ? parseFloat(item.sellingPrice)
                  : (item.startingPrice ?? 0);
            const mrpNum =
              typeof item.mrp === 'number'
                ? item.mrp
                : typeof item.mrp === 'string'
                  ? parseFloat(item.mrp)
                  : (item.compareAtPrice ?? spNum);

            const availQty = item.availableQty ?? item.inventoryQty ?? item.stockQty ?? 0;

            foundProduct = {
              id: item.id,
              name: item.name,
              category: item.categoryName || item.category || 'Uncategorized',
              type:
                item.type === 'Prescription (Rx)' ? 'Prescription (Rx)' : 'Over-The-Counter (OTC)',
              description:
                item.description ||
                item.shortDescription ||
                'No detailed clinical description provided.',
              benefits: item.features || item.benefits || ['Clinical Efficacy'],
              ingredients: item.ingredients || ['Active Formulation'],
              image: getCloudinaryImageUrl(item.primaryImage || item.image),
              images:
                Array.isArray(item.images) && item.images.length > 0
                  ? item.images.map((img: string | { url?: string }) =>
                      typeof img === 'string' ? img : img.url || '',
                    )
                  : [getCloudinaryImageUrl(item.primaryImage || item.image)],
              price: spNum,
              mrp: mrpNum,
              originalPrice: mrpNum,
              sellingPrice: spNum,
              stockQty: item.stockQty ?? availQty,
              inventoryQty: availQty,
              availableQty: availQty,
              tags: item.tags || [],
            };
          }
        }

        // If single fetch didn't find it, try searching all API products
        if (!foundProduct) {
          const listRes = await fetch(`${API_BASE}/api/products`, {
            signal: AbortSignal.timeout(4000),
          });
          if (listRes.ok) {
            const listJson = (await listRes.json()) as {
              success?: boolean;
              data?: {
                items?: Array<{
                  id: string;
                  name: string;
                  slug?: string;
                  description?: string;
                  shortDescription?: string;
                  primaryImage?: string;
                  image?: string;
                  images?: string[];
                  sellingPrice?: string | number;
                  mrp?: string | number;
                  startingPrice?: number;
                  compareAtPrice?: number;
                  stockQty?: number;
                  inventoryQty?: number;
                  availableQty?: number;
                  category?: string;
                  categoryName?: string;
                  type?: string;
                  features?: string[];
                  benefits?: string[];
                  ingredients?: string[];
                  tags?: string[];
                }>;
              };
            };
            if (listJson.success && Array.isArray(listJson.data?.items)) {
              const matchedItem = listJson.data.items.find(
                (item) =>
                  item.id === slug ||
                  item.slug === slug ||
                  item.name.toLowerCase().replace(/\s+/g, '-') === slug,
              );
              if (matchedItem) {
                const spNum =
                  typeof matchedItem.sellingPrice === 'number'
                    ? matchedItem.sellingPrice
                    : typeof matchedItem.sellingPrice === 'string'
                      ? parseFloat(matchedItem.sellingPrice)
                      : (matchedItem.startingPrice ?? 0);
                const mrpNum =
                  typeof matchedItem.mrp === 'number'
                    ? matchedItem.mrp
                    : typeof matchedItem.mrp === 'string'
                      ? parseFloat(matchedItem.mrp)
                      : (matchedItem.compareAtPrice ?? spNum);

                const availQty =
                  matchedItem.availableQty ?? matchedItem.inventoryQty ?? matchedItem.stockQty ?? 0;

                foundProduct = {
                  id: matchedItem.id,
                  name: matchedItem.name,
                  category: matchedItem.categoryName || matchedItem.category || 'Uncategorized',
                  type:
                    matchedItem.type === 'Prescription (Rx)'
                      ? 'Prescription (Rx)'
                      : 'Over-The-Counter (OTC)',
                  description:
                    matchedItem.description ||
                    matchedItem.shortDescription ||
                    'No detailed clinical description provided.',
                  benefits: matchedItem.features || matchedItem.benefits || ['Clinical Efficacy'],
                  ingredients: matchedItem.ingredients || ['Active Formulation'],
                  image:
                    matchedItem.primaryImage ||
                    matchedItem.image ||
                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
                  images:
                    matchedItem.images && matchedItem.images.length > 0
                      ? matchedItem.images
                      : matchedItem.primaryImage
                        ? [matchedItem.primaryImage]
                        : matchedItem.image
                          ? [matchedItem.image]
                          : [],
                  price: spNum,
                  mrp: mrpNum,
                  originalPrice: mrpNum,
                  sellingPrice: spNum,
                  stockQty: matchedItem.stockQty ?? availQty,
                  inventoryQty: availQty,
                  availableQty: availQty,
                  tags: matchedItem.tags || [],
                };
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching product from API:', err);
      }

      if (!isSubscribed) return;

      setProduct(foundProduct || null);

      // 3. Resolve similar products from API based on category or tags overlap
      if (foundProduct) {
        try {
          const listRes = await fetch(`${API_BASE}/api/products`, {
            signal: AbortSignal.timeout(4000),
          });
          if (listRes.ok) {
            const listJson = (await listRes.json()) as {
              success?: boolean;
              data?: { items?: ApiProductListItem[]; products?: ApiProductListItem[] };
              products?: ApiProductListItem[];
            };
            const rawItems =
              listJson.data?.items || listJson.data?.products || listJson.products || [];
            if (Array.isArray(rawItems)) {
              const currentId = foundProduct.id;
              const currentCat = foundProduct.category;
              const currentTags = foundProduct.tags || [];

              const mapped: Product[] = rawItems
                .filter((p: ApiProductListItem) => p.id !== currentId)
                .map((item: ApiProductListItem) => {
                  const spNum =
                    typeof item.sellingPrice === 'number'
                      ? item.sellingPrice
                      : typeof item.sellingPrice === 'string'
                        ? parseFloat(item.sellingPrice)
                        : (item.startingPrice ?? 0);
                  const mrpNum =
                    typeof item.mrp === 'number'
                      ? item.mrp
                      : typeof item.mrp === 'string'
                        ? parseFloat(item.mrp)
                        : (item.compareAtPrice ?? spNum);
                  const availQty = item.availableQty ?? item.inventoryQty ?? item.stockQty ?? 0;

                  return {
                    id: item.id,
                    name: item.name,
                    category: item.categoryName || item.category || 'Uncategorized',
                    type:
                      item.type === 'Prescription (Rx)'
                        ? 'Prescription (Rx)'
                        : 'Over-The-Counter (OTC)',
                    description: item.description || 'No detailed clinical description provided.',
                    benefits: item.features || item.benefits || [],
                    ingredients: item.ingredients || [],
                    image: getCloudinaryImageUrl(item.primaryImage || item.image),
                    price: spNum,
                    mrp: mrpNum,
                    originalPrice: mrpNum,
                    sellingPrice: spNum,
                    stockQty: item.stockQty ?? availQty,
                    inventoryQty: availQty,
                    availableQty: availQty,
                    requiresPrescription:
                      item.requiresPrescription ?? item.type === 'Prescription (Rx)',
                    dosage: item.dosage,
                    rating: 4.8,
                    reviewsCount: 120,
                    tags: item.tags || [],
                    images: [getCloudinaryImageUrl(item.primaryImage || item.image)],
                  };
                });

              const sorted = mapped.sort((a, b) => {
                const aSameCat = a.category === currentCat ? 1 : 0;
                const bSameCat = b.category === currentCat ? 1 : 0;
                if (bSameCat !== aSameCat) return bSameCat - aSameCat;
                const aOverlap = (a.tags || []).filter((t) => currentTags.includes(t)).length;
                const bOverlap = (b.tags || []).filter((t) => currentTags.includes(t)).length;
                return bOverlap - aOverlap;
              });

              setRelatedProducts(sorted.slice(0, 3));
            }
          }
        } catch (e) {
          console.error('Error fetching related products from API:', e);
        }
      }

      setIsLoading(false);
    }

    void resolveProduct();

    return () => {
      isSubscribed = false;
    };
  }, [slug]);

  useGSAP(
    () => {
      if (!product) return;
      const ctx = gsap.context(() => {
        gsap.from('.product-image', {
          scale: 0.95,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        });

        gsap.from('.product-info > *', {
          y: 20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.2,
        });
      }, container);
      return () => {
        ctx.revert();
      };
    },
    { scope: container, dependencies: [product] },
  );

  if (isLoading) {
    return (
      <div className="py-24 text-center text-wellness-charcoal/50">
        <div className="w-10 h-10 border-4 border-wellness-green/30 border-t-wellness-green rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold mt-4">Loading therapy details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6 bg-white p-8 rounded-3xl border border-wellness-gray-200 shadow-xl glass-premium">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle size={28} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-heading font-extrabold text-wellness-navy">
            Therapy Not Found
          </h3>
          <p className="text-sm text-wellness-charcoal/60 leading-relaxed font-semibold">
            The requested product is invalid or has been removed from our active clinical catalog.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-wellness-green hover:bg-wellness-navy text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md text-sm cursor-pointer"
        >
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div ref={container} className="space-y-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Left Image & Gallery Thumbnails */}
        <ProductGallery product={product} />

        {/* Right Info */}
        <div className="product-info flex flex-col justify-center">
          <ProductClinicalInfo product={product} />

          <ProductAddToCartBar
            product={product}
            quantity={quantity}
            setQuantity={setQuantity}
            onAddToCart={() => {
              void addToCart(product, quantity);
            }}
            onBuyNow={() => {
              void addToCart(product, quantity);
              router.push('/order');
            }}
          />
        </div>
      </div>

      {/* Related Therapies list */}
      <RelatedProductsGrid
        relatedProducts={relatedProducts}
        onAddToCart={(related) => {
          void addToCart(related, 1);
        }}
      />
    </div>
  );
}
