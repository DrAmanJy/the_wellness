'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  CheckCircle2,
  FileText,
  AlertCircle,
  Plus,
  Minus,
  ShoppingCart,
  Star,
  ShieldCheck,
  Heart,
  Camera,
  Eye,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react';

import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { authClient } from '@/lib/auth-client';
import { Product, products as staticProducts } from '@/lib/products';

const defaultReviewsMap: Record<
  string,
  { userName: string; rating: number; comment: string; date: string; verified: boolean }[]
> = {
  'respira-inhaler-pro': [
    {
      userName: 'Dr. Aris Vance',
      rating: 5,
      comment:
        'Highly effective bronchodilator. The integrated dose counter is a significant improvement for clinical compliance.',
      date: '2026-08-10T10:30:00Z',
      verified: true,
    },
    {
      userName: 'Marianne K.',
      rating: 4,
      comment: 'Brings relief within minutes. Much easier to actuate than my previous inhaler.',
      date: '2026-08-15T14:22:00Z',
      verified: true,
    },
  ],
  'cardiostatin-40': [
    {
      userName: 'Robert H.',
      rating: 5,
      comment:
        'My lipid panel has shown dramatic improvement over 3 months. No noticeable muscle aches at this dosage.',
      date: '2026-07-28T09:15:00Z',
      verified: true,
    },
    {
      userName: 'Dr. Evelyn Gray',
      rating: 5,
      comment:
        'A cornerstone cardiovascular therapy. Standard dosing has excellent tolerance profiles across my patient group.',
      date: '2026-08-01T11:45:00Z',
      verified: true,
    },
  ],
  'neurocognin-xr': [
    {
      userName: 'Linda S.',
      rating: 4,
      comment:
        'Helped stabilize my mother’s early-stage forgetfulness. The extended release prevents sudden crashes.',
      date: '2026-08-03T16:40:00Z',
      verified: true,
    },
    {
      userName: 'Thomas W.',
      rating: 5,
      comment: 'Consistent daily absorption. Very satisfied with the therapy regimen.',
      date: '2026-08-12T08:10:00Z',
      verified: true,
    },
  ],
  'willmox-500': [
    {
      userName: 'David C.',
      rating: 5,
      comment:
        'Resolved a persistent bronchial infection quickly. Took the full course as prescribed.',
      date: '2026-08-08T18:25:00Z',
      verified: true,
    },
  ],
  'osteo-flex-advanced': [
    {
      userName: 'Arthur M.',
      rating: 4,
      comment:
        'Noticeable reduction in knee stiffness after about 10 days of continuous daily intake.',
      date: '2026-08-14T11:00:00Z',
      verified: true,
    },
    {
      userName: 'Elena R.',
      rating: 5,
      comment:
        'Superior formulation. The curcumin extract makes a huge difference compared to basic glucosamine.',
      date: '2026-08-20T15:30:00Z',
      verified: true,
    },
  ],
  'pediacetamol-suspension': [
    {
      userName: 'Clara P.',
      rating: 5,
      comment:
        'Fevers come down quickly. The syringe dispenser works wonders for getting accurate dosages.',
      date: '2026-08-18T13:50:00Z',
      verified: true,
    },
  ],
};

export default function ProductDetailClient({ slug }: { slug: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleProductInWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  // Reviews State
  const { data: session } = authClient.useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviewName, setReviewName] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);

  useEffect(() => {
    setActiveImgIndex(0);
  }, [product]);

  useEffect(() => {
    // 1. Resolve product
    const savedProducts = localStorage.getItem('admin_products');
    let allProducts = staticProducts;
    if (savedProducts) {
      try {
        allProducts = JSON.parse(savedProducts);
      } catch (e) {
        console.error(e);
      }
    }

    const foundProduct = allProducts.find((p) => p.id === slug);
    setProduct(foundProduct || null);

    // 2. Resolve similar products based on tags overlap
    if (foundProduct) {
      const currentTags = foundProduct.tags || [];

      const scoredProducts = allProducts
        .filter((p) => p.id !== foundProduct.id)
        .map((p) => {
          const otherTags = p.tags || [];
          const overlap = currentTags.filter((t) => otherTags.includes(t)).length;
          return { product: p, score: overlap };
        });

      // Sort by score (descending) and fallback to category matching if score is 0
      const sorted = scoredProducts.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // Group same-category products higher if overlap is tied
        const aSameCategory = a.product.category === foundProduct.category ? 1 : 0;
        const bSameCategory = b.product.category === foundProduct.category ? 1 : 0;
        return bSameCategory - aSameCategory;
      });

      setRelatedProducts(sorted.slice(0, 3).map((item) => item.product));

      // 3. Resolve reviews
      const savedReviews = localStorage.getItem(`product_reviews_${slug}`);
      if (savedReviews) {
        try {
          setReviews(JSON.parse(savedReviews));
        } catch (e) {
          console.error(e);
        }
      } else {
        const seed = defaultReviewsMap[slug] || [
          {
            userName: 'Dr. Aaron Patel',
            rating: 5,
            comment: 'Exceptional treatment standard with robust efficacy profile.',
            date: new Date(Date.now() - 3600000 * 48).toISOString(),
            verified: true,
          },
          {
            userName: 'Sarah Jenkins',
            rating: 4,
            comment: 'Highly effective and fast-acting therapeutic support.',
            date: new Date(Date.now() - 3600000 * 96).toISOString(),
            verified: true,
          },
        ];
        setReviews(seed);
        localStorage.setItem(`product_reviews_${slug}`, JSON.stringify(seed));
      }
      // 4. Verify if user purchased this product
      try {
        const historyJson = localStorage.getItem('orders_history');
        if (historyJson) {
          const history = JSON.parse(historyJson);
          const purchased = history.some((order: any) =>
            order.items?.some((item: any) => item.product.id === foundProduct.id),
          );
          setHasPurchased(purchased);
        }
      } catch (e) {
        console.error('Error verifying purchase history:', e);
      }
    }
    setIsLoading(false);
  }, [slug]);

  // Set default review name if session changes
  useEffect(() => {
    if (session?.user?.name) {
      setReviewName(session.user.name);
    }
  }, [session]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const filesLimit = files.slice(0, 3);
    const promises = filesLimit.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then((base64s) => {
        setUploadedImages((prev) => [...prev, ...base64s].slice(0, 3));
      })
      .catch((err) => {
        console.error('Error reading files:', err);
      });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;

    setIsSubmittingReview(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const nameToUse = session?.user?.name || reviewName.trim() || 'Anonymous Client';
    const reviewItem = {
      id: 'rev_' + Math.random().toString(36).substring(2, 11),
      userName: nameToUse,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString(),
      verified: true,
      images: uploadedImages,
    };

    const updatedReviews = [reviewItem, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`product_reviews_${slug}`, JSON.stringify(updatedReviews));

    // Reset review input
    setNewReview({ rating: 5, comment: '' });
    setUploadedImages([]);
    setIsSubmittingReview(false);
  };

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : '0.0';

  const ratingCounts = [0, 0, 0, 0, 0]; // 1 to 5 stars
  reviews.forEach((r) => {
    const idx = Math.min(5, Math.max(1, r.rating)) - 1;
    ratingCounts[idx]++;
  });

  const renderStars = (rating: number, size = 16) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-wellness-gray-200'}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-wellness-charcoal/50">
        <div className="w-10 h-10 border-4 border-wellness-green/30 border-t-wellness-green rounded-full animate-spin mx-auto"></div>
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
        <div className="space-y-4 relative">
          {/* Main Active Image Container */}
          <div className="product-image relative aspect-[4/3] lg:aspect-square rounded-2xl bg-wellness-gray-100 shadow-xl border border-wellness-gray-200 select-none z-40">
            {(() => {
              const imagesList =
                product.images && product.images.length > 0 ? product.images : [product.image];
              const currentImage = imagesList[activeImgIndex] || product.image;

              // Calculate lens dimensions & clamped positions
              const LENS_SIZE = 30; // 30% of container size
              const halfLens = LENS_SIZE / 2;
              const minPos = halfLens;
              const maxPos = 100 - halfLens;

              const lensX = Math.min(maxPos, Math.max(minPos, zoomPos.x));
              const lensY = Math.min(maxPos, Math.max(minPos, zoomPos.y));

              // Map clamped positions [minPos, maxPos] linearly to [0, 100] for backgroundPosition
              const bgX = ((lensX - minPos) / (maxPos - minPos)) * 100;
              const bgY = ((lensY - minPos) / (maxPos - minPos)) * 100;
              const bgSize = `${(100 / LENS_SIZE) * 100}%`;

              return (
                <>
                  {/* Clipped image area */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
                    <Image
                      src={currentImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                      priority
                    />

                    {/* Lens selector overlay */}
                    {showZoom && (
                      <div
                        className="absolute border border-wellness-navy/35 bg-wellness-navy/10 rounded-lg pointer-events-none hidden md:block"
                        style={{
                          width: `${LENS_SIZE}%`,
                          height: `${LENS_SIZE}%`,
                          left: `${lensX}%`,
                          top: `${lensY}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )}
                  </div>

                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold text-wellness-navy shadow-sm uppercase tracking-widest border border-wellness-gray-200 pointer-events-none select-none z-20">
                    {product.type}
                  </div>

                  {/* Side Magnifier Zoom Portal (Desktop only) */}
                  {showZoom && (
                    <div className="absolute left-[104%] top-0 w-full h-full bg-white border border-wellness-gray-200 rounded-2xl overflow-hidden shadow-2xl z-[60] hidden md:block pointer-events-none">
                      <div
                        className="w-full h-full origin-center"
                        style={{
                          backgroundImage: `url('${currentImage}')`,
                          backgroundPosition: `${bgX}% ${bgY}%`,
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: `${bgSize} ${bgSize}`,
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </div>
                  )}

                  {/* Invisible Hover Capture Overlay */}
                  <div
                    className="absolute inset-0 z-50 cursor-crosshair rounded-2xl"
                    onMouseEnter={() => {
                      setShowZoom(true);
                    }}
                    onMouseLeave={() => {
                      setShowZoom(false);
                      setZoomPos({ x: 0, y: 0 });
                    }}
                    onMouseMove={(e) => {
                      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                      // Cap coordinates between 0 and 100
                      const x = Math.min(100, Math.max(0, ((e.clientX - left) / width) * 100));
                      const y = Math.min(100, Math.max(0, ((e.clientY - top) / height) * 100));
                      setZoomPos({ x, y });
                    }}
                  />
                </>
              );
            })()}
          </div>

          {/* Thumbnails Row */}
          {(() => {
            const imagesList =
              product.images && product.images.length > 0 ? product.images : [product.image];
            if (imagesList.length <= 1) return null;
            return (
              <div className="flex gap-3 overflow-x-auto py-1">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImgIndex(idx);
                    }}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 bg-wellness-gray-50 focus:outline-none transition-all flex-shrink-0 cursor-pointer ${
                      activeImgIndex === idx
                        ? 'border-wellness-navy scale-[1.03] shadow-md'
                        : 'border-wellness-gray-200 hover:border-wellness-navy/50'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} gallery image ${idx + 1}`}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Right Info */}
        <div className="product-info flex flex-col justify-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-wellness-green/10 text-wellness-green font-semibold text-xs tracking-wider uppercase mb-6 self-start">
            {product.category}
          </div>

          <h1 className="text-4xl md:text-5xl font-heading font-bold text-wellness-navy mb-3 tracking-tight font-sans">
            {product.name}
          </h1>

          {/* Average Rating Badge */}
          {totalReviews > 0 && (
            <div className="flex items-center gap-2 mb-6">
              {renderStars(Math.round(parseFloat(averageRating)), 18)}
              <span className="text-sm font-extrabold text-wellness-navy ml-1">
                {averageRating}
              </span>
              <span className="text-xs text-wellness-charcoal/50 font-semibold">
                ({totalReviews} patient reviews)
              </span>
            </div>
          )}

          <div className="text-2xl font-bold text-wellness-green mb-6">
            ₹{product.price.toFixed(2)}
          </div>

          <div className="bg-wellness-gray-50 border-l-4 border-wellness-navy p-6 rounded-r-lg mb-10">
            <p className="text-lg text-wellness-charcoal/80 leading-relaxed font-semibold">
              {product.description}
            </p>
          </div>

          {product.benefits && product.benefits.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-heading font-bold text-wellness-navy mb-4 border-b border-wellness-gray-200 pb-2">
                Clinical Benefits
              </h3>
              <ul className="space-y-3">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-wellness-green shrink-0 mt-0.5" size={20} />
                    <span className="text-wellness-charcoal/80 font-semibold">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-heading font-bold text-wellness-navy mb-4 border-b border-wellness-gray-200 pb-2">
                Active Ingredients & Composition
              </h3>
              <ul className="list-disc list-inside space-y-2 text-wellness-charcoal/80 font-semibold">
                {product.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Product Tags list if any */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-10">
              <h3 className="text-[10px] font-bold text-wellness-charcoal/40 uppercase tracking-widest mb-3">
                Therapeutic Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-wellness-gray-100 text-wellness-navy border border-wellness-gray-205 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cart Actions */}
          <div className="border-y border-wellness-gray-200 py-6 mb-10 flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-wellness-charcoal/50 uppercase tracking-wider">
                Quantity
              </span>
              <div className="flex items-center border border-wellness-gray-200 rounded bg-white w-fit">
                <button
                  onClick={() => {
                    setQuantity((q) => Math.max(1, q - 1));
                  }}
                  className="px-3 py-2 text-wellness-charcoal/60 hover:text-wellness-navy hover:bg-wellness-gray-100 transition-colors cursor-pointer"
                  type="button"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 text-sm font-bold text-wellness-navy min-w-[30px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    setQuantity((q) => q + 1);
                  }}
                  className="px-3 py-2 text-wellness-charcoal/60 hover:text-wellness-navy hover:bg-wellness-gray-100 transition-colors cursor-pointer"
                  type="button"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex-grow flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  addToCart(product, quantity);
                }}
                className="flex-grow bg-wellness-green hover:bg-wellness-navy text-white px-6 py-3.5 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer text-sm"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
              <button
                onClick={() => {
                  addToCart(product, quantity);
                  router.push('/order');
                }}
                className="flex-grow bg-wellness-navy hover:bg-wellness-green text-white px-6 py-3.5 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer text-sm"
              >
                Buy Now
              </button>

              {/* Wishlist toggle button */}
              <button
                onClick={() => {
                  toggleProductInWishlist(product);
                }}
                className="px-4 py-3.5 rounded-md border border-wellness-gray-200 hover:border-red-500 hover:bg-red-50/20 text-wellness-navy hover:text-red-500 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                title="Add to Wishlist"
              >
                <Heart
                  size={20}
                  className={isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}
                />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="bg-wellness-gray-100 text-wellness-navy border border-wellness-gray-200 px-8 py-4 rounded-md font-semibold hover:bg-wellness-gray-200 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer text-sm">
              <FileText size={20} />
              Prescribing Information
            </button>
            {product.type === 'Prescription (Rx)' && (
              <button className="bg-white text-wellness-navy border border-wellness-gray-200 px-8 py-4 rounded-md font-semibold hover:bg-wellness-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm">
                <AlertCircle size={20} />
                Important Safety Info
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews & Patient Feedback Section */}
      <div className="pt-16 border-t border-wellness-gray-200">
        <div className="space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wellness-green/5 text-wellness-green border border-wellness-green/10 text-[10px] font-bold uppercase tracking-wider">
            Patient Outcomes
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-wellness-navy tracking-tight">
            Clinical Reviews & Feedback
          </h2>
          <p className="text-sm text-wellness-charcoal/60 max-w-2xl leading-relaxed font-semibold">
            Read verified evaluations, patient tolerance reports, and clinical efficacy notes for{' '}
            {product.name}.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 ${hasPurchased ? 'lg:grid-cols-3 lg:gap-12' : 'max-w-3xl mx-auto'} gap-10 items-start`}
        >
          {/* Left Column: Summary + Reviews */}
          <div className={`${hasPurchased ? 'lg:col-span-2' : ''} space-y-8`}>
            {/* Therapy Summary breakout card */}
            <div className="bg-white border border-wellness-gray-100 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-wellness-navy/50 uppercase tracking-widest">
                  Therapy Summary
                </h3>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-light text-wellness-navy tracking-tight">
                    {averageRating}
                  </span>
                  <span className="text-xs text-wellness-charcoal/40 font-medium">/ 5.0</span>
                </div>

                <div className="space-y-1">
                  {renderStars(Math.round(parseFloat(averageRating)), 16)}
                  <p className="text-[10px] text-wellness-charcoal/40 font-bold uppercase tracking-wider pt-1">
                    Based on {totalReviews} patient reports
                  </p>
                </div>
              </div>

              {/* Bars breakout */}
              <div className="space-y-3 mt-6 pt-6 border-t border-wellness-gray-100">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingCounts[rating - 1];
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-3 text-xs">
                      <span className="w-5 text-right font-medium text-wellness-navy">
                        {rating} ★
                      </span>
                      <div className="flex-grow h-1 bg-wellness-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-wellness-navy rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right text-wellness-charcoal/40 font-bold">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-wellness-navy uppercase tracking-wider pb-2 border-b border-wellness-gray-100">
                Patient Reviews
              </h3>
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-wellness-gray-200 rounded-2xl text-wellness-charcoal/40 bg-white">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1">
                    No Clinical Reports
                  </p>
                  <p className="text-[11px] text-wellness-charcoal/50 max-w-xs font-medium px-4">
                    There are no verified clinical reviews currently registered for this therapy.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((rev) => {
                    const initial = rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U';
                    return (
                      <div
                        key={rev.id}
                        className="border-b border-wellness-gray-100 pb-6 last:border-0 last:pb-0 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3.5">
                            <div className="w-8 h-8 rounded-full bg-wellness-gray-50 border border-wellness-gray-100 text-wellness-navy font-bold text-xs flex items-center justify-center shrink-0">
                              {initial}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-wellness-navy leading-none">
                                  {rev.userName}
                                </span>
                                {rev.verified && (
                                  <span className="text-[9px] font-bold text-wellness-green flex items-center gap-0.5">
                                    <ShieldCheck size={9} className="stroke-[2.5]" />
                                    Verified Buyer
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-wellness-charcoal/40 leading-none mt-1 block">
                                {new Date(rev.date).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {renderStars(rev.rating, 12)}
                          <p className="text-xs text-wellness-charcoal/80 leading-relaxed font-normal">
                            {rev.comment}
                          </p>
                          {rev.images && rev.images.length > 0 && (
                            <div className="flex gap-2 flex-wrap mt-2">
                              {rev.images.map((img: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="relative w-16 h-16 rounded-lg overflow-hidden border border-wellness-gray-100 bg-wellness-gray-50 group"
                                >
                                  <img
                                    src={img}
                                    alt={`Review attachment ${idx + 1}`}
                                    className="object-cover w-full h-full cursor-zoom-in group-hover:scale-105 transition-transform"
                                    onClick={() => window.open(img, '_blank')}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Access-Controlled Writing Section */}
          {hasPurchased && (
            <div className="h-full lg:col-span-1">
              <div className="bg-white border border-wellness-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                      Submit Feedback
                    </h3>
                    <span className="text-[9px] font-bold text-wellness-green uppercase tracking-wider flex items-center gap-0.5">
                      <ShieldCheck size={10} className="stroke-[2.5]" />
                      Verified Patient
                    </span>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs font-medium">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-wellness-charcoal/40 uppercase tracking-wider">
                        Efficacy Rating
                      </label>
                      <div className="flex gap-1 items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              setNewReview((prev) => ({ ...prev, rating: star }));
                            }}
                            onMouseEnter={() => {
                              setHoverRating(star);
                            }}
                            onMouseLeave={() => {
                              setHoverRating(null);
                            }}
                            className="cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              size={18}
                              className={
                                star <= (hoverRating ?? newReview.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-wellness-gray-200'
                              }
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-wellness-navy ml-2">
                          {newReview.rating} / 5
                        </span>
                      </div>
                    </div>

                    {!session && (
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-wellness-charcoal/40 uppercase tracking-wider">
                          Your Identity
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Jane Smith or Alex M."
                          value={reviewName}
                          onChange={(e) => {
                            setReviewName(e.target.value);
                          }}
                          className="w-full bg-transparent border-b border-wellness-gray-200 focus:border-wellness-navy py-1.5 outline-none text-xs font-medium focus:ring-0 rounded-none px-0 transition-colors"
                        />
                      </div>
                    )}

                    {session && (
                      <div className="py-2 border-b border-wellness-gray-100 flex items-center gap-2 mb-2">
                        <ShieldCheck size={14} className="text-wellness-green shrink-0" />
                        <span className="text-[11px] text-wellness-navy">
                          Posting as: <strong className="font-semibold">{session.user.name}</strong>
                        </span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-wellness-charcoal/40 uppercase tracking-wider">
                        Review & Clinical Notes
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Detail your therapeutic outcomes and patient tolerance notes..."
                        value={newReview.comment}
                        onChange={(e) => {
                          setNewReview((prev) => ({ ...prev, comment: e.target.value }));
                        }}
                        className="w-full bg-transparent border border-wellness-gray-200 focus:border-wellness-navy px-3 py-2 rounded-lg outline-none text-xs font-medium resize-none transition-colors focus:ring-0"
                      ></textarea>
                    </div>

                    {/* Image Attachments */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold text-wellness-charcoal/40 uppercase tracking-wider">
                        Attach Images (Max 3)
                      </label>

                      <label className="cursor-pointer border border-dashed border-wellness-gray-200 hover:border-wellness-navy transition-colors rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 text-wellness-charcoal/60 bg-transparent">
                        <Camera size={18} className="text-wellness-navy/60" />
                        <span className="text-[10px] font-medium">Click to select files</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>

                      {uploadedImages.length > 0 && (
                        <div className="flex gap-2 flex-wrap pt-1">
                          {uploadedImages.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative w-12 h-12 rounded-md overflow-hidden border border-wellness-gray-200 group"
                            >
                              <img
                                src={img}
                                alt="Upload preview"
                                className="object-cover w-full h-full"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
                                }}
                                className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 rounded-bl flex items-center justify-center text-[10px] font-bold hover:bg-red-600 focus:outline-none"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full bg-wellness-navy hover:bg-wellness-green text-white py-2.5 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs mt-2"
                    >
                      {isSubmittingReview ? (
                        <div className="w-4 h-4 border border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <span>Publish Review</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Therapies list */}
      {relatedProducts.length > 0 && (
        <div className="pt-16 border-t border-wellness-gray-200">
          <h2 className="text-3xl font-heading font-bold text-wellness-navy mb-8 animate-in fade-in duration-300">
            Related Therapies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProducts.map((related) => (
              <div
                key={related.id}
                className="group block bg-white border border-wellness-gray-200/80 rounded-[24px] overflow-hidden hover:shadow-[0_20px_50px_rgba(10,25,47,0.08)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full relative"
              >
                {/* Card Image Area with Full Size Product Image */}
                <div className="relative aspect-square bg-[#F8F9FA] overflow-hidden shrink-0 border-b border-wellness-gray-100">
                  <Image
                    src={related.image}
                    alt={related.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />

                  {/* Type Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-sm ${
                        related.type === 'Prescription (Rx)'
                          ? 'bg-red-50/90 backdrop-blur-sm text-red-600 border border-red-100'
                          : 'bg-wellness-navy/90 backdrop-blur-sm text-white'
                      }`}
                    >
                      {related.type}
                    </span>
                  </div>

                  {/* Wishlist toggle button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleProductInWishlist(related);
                    }}
                    className="absolute top-4 right-4 z-20 w-8.5 h-8.5 rounded-full bg-white/90 backdrop-blur-sm border border-wellness-gray-200/50 flex items-center justify-center text-wellness-navy hover:text-red-500 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer group/wishlist"
                    aria-label="Toggle Wishlist"
                  >
                    <Heart
                      size={15}
                      className={
                        isInWishlist(related.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-wellness-navy group-hover/wishlist:text-red-500'
                      }
                    />
                  </button>
                </div>

                {/* Card Content Area */}
                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div className="space-y-2">
                    {/* Category & Rating */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-extrabold tracking-widest uppercase text-wellness-green bg-wellness-green/5 px-2.5 py-1 rounded">
                        {related.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star size={11} className="fill-amber-500 text-amber-500" />
                        <span className="text-[10px] font-black text-wellness-navy">4.9</span>
                        <span className="text-[9px] text-wellness-charcoal/40 font-bold">
                          (120)
                        </span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <h4 className="text-base font-heading font-black text-wellness-navy group-hover:text-wellness-green transition-colors line-clamp-1">
                      <Link href={`/products/${related.id}`}>{related.name}</Link>
                    </h4>

                    {/* Product Description */}
                    <p className="text-xs text-wellness-charcoal/60 leading-relaxed font-semibold line-clamp-2">
                      {related.description}
                    </p>

                    {/* Active Ingredients list */}
                    <div className="pt-2 text-[10px] text-wellness-charcoal/40 font-semibold truncate">
                      <span className="font-extrabold uppercase tracking-widest text-wellness-charcoal/30 mr-1.5">
                        Ingredients:
                      </span>
                      {related.ingredients.join(', ')}
                    </div>
                  </div>

                  {/* Price and Action Buttons at Bottom */}
                  <div className="mt-5">
                    <div className="flex items-baseline justify-between mb-4 border-t border-wellness-gray-100 pt-4">
                      <span className="text-[10px] font-extrabold text-wellness-charcoal/40 uppercase tracking-widest">
                        Treatment cost
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-wellness-charcoal/40 line-through font-bold">
                          ₹{(related.price * 1.15).toFixed(0)}
                        </span>
                        <span className="text-lg font-black text-wellness-navy">
                          ₹{related.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Visible Dual Buttons */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <Link
                        href={`/products/${related.id}`}
                        className="py-3 px-2 border border-wellness-gray-200 hover:border-wellness-navy bg-white hover:bg-wellness-navy hover:text-white text-[10px] font-extrabold uppercase tracking-widest text-wellness-navy text-center rounded-xl transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Eye size={12} className="stroke-[2.5]" />
                        <span>Details</span>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(related, 1);
                        }}
                        className="py-3 px-2 bg-wellness-green hover:bg-wellness-navy text-white text-[10px] font-extrabold uppercase tracking-widest text-center rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart size={12} className="stroke-[2.5]" />
                        <span>Quick Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
