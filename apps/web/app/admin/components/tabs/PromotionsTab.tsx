'use client';

import { Percent, Plus, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';

import { PromotionItem } from '../../types';

interface PromotionsTabProps {
  promotionsList: PromotionItem[];
  loadPromotions: () => Promise<void>;
  showNotice: (message: string, type?: 'error' | 'warning' | 'success') => void;
  uploadToCloudinary: (file: File, folder?: string) => Promise<string>;
}

export default function PromotionsTab({
  promotionsList,
  loadPromotions,
  showNotice,
  uploadToCloudinary,
}: PromotionsTabProps) {
  const [activePromoId, setActivePromoId] = useState<string | null>(null);
  const [promoTitle, setPromoTitle] = useState('New Homepage Banner');
  const [promoImage, setPromoImage] = useState('/images/default-promo-banner.png');
  const [promoLink, setPromoLink] = useState('/products');
  const [promoDiscountText, setPromoDiscountText] = useState('');
  const [promoDescription, setPromoDescription] = useState('');
  const [promoIsActive, setPromoIsActive] = useState(true);
  const [savingPromotion, setSavingPromotion] = useState(false);

  const resetForm = () => {
    setActivePromoId(null);
    setPromoTitle('New Homepage Banner');
    setPromoImage('/images/default-promo-banner.png');
    setPromoLink('/products');
    setPromoDiscountText('');
    setPromoDescription('');
    setPromoIsActive(true);
  };

  const handleToggleStatus = async (promo: PromotionItem) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/promotions/${promo.id}/status`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) await loadPromotions();
    } catch (e) {
      console.error('Failed to toggle status:', e);
    }
  };

  const handleDeletePromotion = async (promo: PromotionItem) => {
    if (!confirm(`Delete banner "${promo.title}" from DB?`)) return;
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/promotions/${promo.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        if (activePromoId === promo.id) {
          resetForm();
        }
        await loadPromotions();
      }
    } catch (e) {
      console.error('Failed to delete promotion:', e);
    }
  };

  const handleSavePromotion = async () => {
    if (!promoImage) {
      showNotice('Please choose or provide an image URL for the banner.', 'warning');
      return;
    }
    try {
      setSavingPromotion(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const payload = {
        title: promoTitle || 'Homepage Banner',
        imageUrl: promoImage,
        targetUrl: promoLink || '/products',
        discountText: promoDiscountText || null,
        description: promoDescription || null,
        isActive: promoIsActive,
      };

      let res: Response;
      if (activePromoId) {
        res = await fetch(`${API_BASE}/api/promotions/${activePromoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/api/promotions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showNotice('Promotional banner saved to database successfully!', 'success');
        await loadPromotions();
      } else {
        const err = (await res.json()) as { message?: string };
        showNotice(`Failed to save banner: ${err.message || 'Error occurred'}`);
      }
    } catch (e) {
      console.error('Save promotion error:', e);
      showNotice('Error saving promotional banner.');
    } finally {
      setSavingPromotion(false);
    }
  };

  return (
    <motion.div
      key="promotions"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-heading font-bold text-wellness-navy flex items-center gap-2">
            <Percent size={18} className="text-wellness-green" />
            Homepage Promotions & Banners
          </h3>
          <p className="text-xs text-wellness-charcoal/60 mt-0.5 font-medium">
            Manage promotional graphic banners stored directly in the database for the homepage
            storefront.
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="bg-wellness-green hover:bg-wellness-navy text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={14} />
          Add New Banner
        </button>
      </div>

      {/* Existing Banners List from DB */}
      {promotionsList.length > 0 && (
        <div className="bg-white border border-wellness-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-wellness-navy uppercase tracking-wider flex items-center gap-2">
            <Eye size={14} className="text-wellness-green" />
            Database Banners & Promotions ({promotionsList.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotionsList.map((promo) => {
              const isCurrentSelected = activePromoId === promo.id;
              return (
                <div
                  key={promo.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isCurrentSelected
                      ? 'border-wellness-green bg-wellness-green/5 shadow-md'
                      : 'border-wellness-gray-200 bg-wellness-gray-50/50 hover:bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden bg-slate-100 border border-wellness-gray-200">
                      <img
                        src={promo.imageUrl}
                        alt={promo.title}
                        className="object-cover w-full h-full"
                      />
                      <span
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                          promo.isActive
                            ? 'bg-wellness-green text-white'
                            : 'bg-wellness-charcoal/20 text-wellness-navy'
                        }`}
                      >
                        {promo.isActive ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-wellness-navy line-clamp-1">
                        {promo.title}
                      </p>
                      <p className="text-[10px] text-wellness-charcoal/60 line-clamp-1 mt-0.5">
                        Target: {promo.targetUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-wellness-gray-200/60 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePromoId(promo.id);
                        setPromoTitle(promo.title);
                        setPromoImage(promo.imageUrl);
                        setPromoLink(promo.targetUrl);
                        setPromoDiscountText(promo.discountText || '');
                        setPromoDescription(promo.description || '');
                        setPromoIsActive(promo.isActive);
                      }}
                      className="text-wellness-navy hover:text-wellness-green font-bold text-[11px] cursor-pointer"
                    >
                      {isCurrentSelected ? 'Editing' : 'Edit Banner'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          void handleToggleStatus(promo);
                        }}
                        className="text-[10px] font-bold text-wellness-charcoal/60 hover:text-wellness-navy cursor-pointer"
                      >
                        {promo.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void handleDeletePromotion(promo);
                        }}
                        className="text-[10px] font-bold text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white border border-wellness-gray-200 rounded-3xl p-8 shadow-sm space-y-8">
        {/* Banner Live Preview */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-wellness-navy uppercase tracking-wider flex items-center gap-2">
            {activePromoId
              ? `Editing Banner: ${promoTitle}`
              : 'New Banner Configuration & Live Preview'}
          </h4>
          <p className="text-[10px] text-wellness-charcoal/50">
            Preview how this promotional banner graphic renders on the homepage storefront.
          </p>
          <div className="relative w-full max-w-[800px] aspect-[21/9] rounded-[24px] overflow-hidden border border-wellness-gray-200 shadow-xl bg-gradient-to-r from-wellness-navy via-[#1E5C5A] to-wellness-green text-white mt-2 p-6 sm:p-8 flex flex-col justify-between animate-gradient-shift">
            <div className="flex items-center justify-between">
              <span className="bg-wellness-light-green/20 text-wellness-light-green text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-wellness-light-green/20">
                {promoDiscountText || 'Clinical Special'}
              </span>
              <span className="text-[10px] font-mono font-bold text-white/70 bg-black/20 px-2.5 py-0.5 rounded-full border border-white/10">
                {promoIsActive ? '● Live Storefront' : '○ Inactive Draft'}
              </span>
            </div>
            <div className="space-y-1.5 z-10">
              <h3 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-white">
                {promoTitle || 'Homepage Promotional Banner'}
              </h3>
              {promoDescription && (
                <p className="text-xs text-wellness-light-green/90 font-medium line-clamp-2 max-w-lg">
                  {promoDescription}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="bg-white text-wellness-navy font-extrabold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer hover:bg-wellness-light-green transition-colors">
                Claim Offer →
              </span>
              <span className="text-[10px] font-mono text-white/50">Target: {promoLink}</span>
            </div>
          </div>
        </div>

        {/* Banner Configuration Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-wellness-gray-100">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                Banner Title
              </label>
              <input
                type="text"
                placeholder="e.g. Special Clinical Wellness Offer"
                value={promoTitle}
                onChange={(e) => {
                  setPromoTitle(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                Upload Graphic Banner Image
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer border border-dashed border-wellness-gray-200 hover:border-wellness-green transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-1 bg-wellness-gray-50 text-center w-32 h-24 shrink-0">
                  <Plus size={20} className="text-wellness-navy/60" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-wellness-charcoal/60">
                    Choose File
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void uploadToCloudinary(file, 'wellness_promotions').then((cloudUrl) => {
                          if (cloudUrl) {
                            setPromoImage(cloudUrl);
                          }
                        });
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <div className="text-[11px] text-wellness-charcoal/60 leading-relaxed">
                  <p className="font-extrabold text-wellness-navy">
                    Recommended size: 1200 x 500 px (21:9 Aspect Ratio)
                  </p>
                  <p className="mt-1">Supported formats: JPG, PNG, WEBP.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                Or Paste Banner Image URL
              </label>
              <input
                type="text"
                placeholder="https://example.com/banner.png"
                value={promoImage.startsWith('data:') ? '' : promoImage}
                onChange={(e) => {
                  if (e.target.value) {
                    setPromoImage(e.target.value);
                  }
                }}
                className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
              />
              {promoImage.startsWith('data:') && (
                <p className="text-[9px] text-wellness-green font-bold mt-1">
                  ✓ Local File Selected. Paste a URL here to override.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                Click Destination Path
              </label>
              <input
                type="text"
                placeholder="e.g. /products, /products?category=Pediatrics"
                value={promoLink}
                onChange={(e) => {
                  setPromoLink(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
              />
              <p className="text-[10px] text-wellness-charcoal/50 mt-1">
                Where customers will be redirected when clicking the advertisement graphic.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                Discount / Promotional Tag (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. FLAT 20% OFF or CLINICAL EXCLUSIVE"
                value={promoDiscountText}
                onChange={(e) => {
                  setPromoDiscountText(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="promoIsActive"
                checked={promoIsActive}
                onChange={(e) => {
                  setPromoIsActive(e.target.checked);
                }}
                className="w-4 h-4 text-wellness-green border-wellness-gray-300 rounded focus:ring-wellness-green cursor-pointer"
              />
              <label
                htmlFor="promoIsActive"
                className="text-xs font-bold text-wellness-navy cursor-pointer"
              >
                Active & Visible on Store Homepage
              </label>
            </div>

            <div className="pt-4 flex gap-3 flex-wrap">
              <button
                type="button"
                disabled={savingPromotion}
                onClick={() => {
                  void handleSavePromotion();
                }}
                className="bg-wellness-green hover:bg-wellness-navy text-white text-xs font-black uppercase tracking-wider px-6 py-4.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {savingPromotion
                  ? 'Saving to Database...'
                  : activePromoId
                    ? 'Update Banner in Database'
                    : 'Save New Banner to Database'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="border border-wellness-gray-200 hover:bg-wellness-gray-50 text-wellness-navy text-xs font-black uppercase tracking-wider px-5 py-4.5 rounded-xl transition-all cursor-pointer"
              >
                Clear Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
