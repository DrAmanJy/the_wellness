'use client';

import { X, Plus } from 'lucide-react';
import React from 'react';

import DropdownField from '@/components/ui/DropdownField';
import type { Product } from '@/lib/products';

interface EditProductModalProps {
  editingProduct: Product | null;
  categories: string[];
  onClose: () => void;
  onSave: (e: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
  setEditingProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  handleEditProductImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleRemoveEditProductImage: (idx: number) => Promise<void>;
  handleImageDragStart: (idx: number) => void;
  handleImageDragOver: (e: React.DragEvent, idx: number) => void;
  handleImageDrop: (e: React.DragEvent, idx: number, isEditMode: boolean) => Promise<void>;
  draggedImgIdx: number | null;
  dragOverImgIdx: number | null;
}

export default function EditProductModal({
  editingProduct,
  categories,
  onClose,
  onSave,
  setEditingProduct,
  handleEditProductImagesChange,
  handleRemoveEditProductImage,
  handleImageDragStart,
  handleImageDragOver,
  handleImageDrop,
  draggedImgIdx,
  dragOverImgIdx,
}: EditProductModalProps) {
  if (!editingProduct) return null;

  return (
    <div className="fixed inset-0 z-50 bg-wellness-navy/40 backdrop-blur-sm flex items-center justify-center px-6 animate-in fade-in duration-300">
      <div className="max-w-2xl w-full bg-white border border-wellness-gray-200 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-wellness-charcoal/40 hover:text-wellness-navy cursor-pointer"
        >
          <X size={20} />
        </button>

        <form
          onSubmit={(e) => {
            void onSave(e);
          }}
          className="space-y-6"
        >
          <h3 className="text-lg font-heading font-extrabold text-wellness-navy border-b border-wellness-gray-150 pb-2">
            Edit Product details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={editingProduct.name}
                onChange={(e) => {
                  setEditingProduct((prev: Product | null) =>
                    prev ? { ...prev, name: e.target.value } : null,
                  );
                }}
                className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
              />
            </div>
            <div>
              <DropdownField
                label="Category"
                options={categories
                  .filter((c) => c !== 'All')
                  .map((cat) => ({ value: cat, label: cat }))}
                selectedValue={editingProduct.category}
                onChange={(val) => {
                  setEditingProduct((prev: Product | null) =>
                    prev ? { ...prev, category: val } : null,
                  );
                }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                MRP (₹)
              </label>
              <input
                type="number"
                value={editingProduct.mrp ?? editingProduct.price}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setEditingProduct((prev: Product | null) =>
                    prev ? { ...prev, mrp: val } : null,
                  );
                }}
                className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                value={editingProduct.sellingPrice ?? editingProduct.price}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setEditingProduct((prev: Product | null) =>
                    prev ? { ...prev, sellingPrice: val, price: val } : null,
                  );
                }}
                className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
              />
            </div>
          </div>

          {/* Inventory & Stock Section for Edit Modal */}
          <div className="bg-wellness-gray-50 border border-wellness-gray-200 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-extrabold text-wellness-navy uppercase tracking-wider">
                Inventory & Stock Control
              </h5>
              <span className="text-[10px] font-semibold text-wellness-charcoal/60">
                Rule: Stock ≤ Inventory
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                  Total Warehouse Inventory
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingProduct.inventoryQty ?? editingProduct.stockQty ?? 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setEditingProduct((prev: Product | null) =>
                      prev ? { ...prev, inventoryQty: val } : null,
                    );
                  }}
                  className={`w-full px-4 py-3 rounded-lg border bg-white outline-none text-xs font-semibold ${
                    (editingProduct.stockQty ?? 0) >
                    (editingProduct.inventoryQty ?? editingProduct.stockQty ?? 0)
                      ? 'border-amber-400 bg-amber-50/50'
                      : 'border-wellness-gray-200 focus:border-wellness-green'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                  Product Display Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingProduct.stockQty ?? 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setEditingProduct((prev: Product | null) =>
                      prev ? { ...prev, stockQty: val } : null,
                    );
                  }}
                  className={`w-full px-4 py-3 rounded-lg border outline-none text-xs font-semibold ${
                    (editingProduct.stockQty ?? 0) >
                    (editingProduct.inventoryQty ?? editingProduct.stockQty ?? 0)
                      ? 'border-red-500 bg-red-50 focus:border-red-600 text-red-900'
                      : 'border-wellness-gray-200 bg-white focus:border-wellness-green'
                  }`}
                />
              </div>
            </div>
            {(editingProduct.stockQty ?? 0) >
              (editingProduct.inventoryQty ?? editingProduct.stockQty ?? 0) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                <span>⚠️</span>
                <span>
                  Validation Error: Product stock ({editingProduct.stockQty}) cannot exceed total
                  inventory ({editingProduct.inventoryQty ?? editingProduct.stockQty}).
                </span>
              </div>
            )}
          </div>

          {/* Stock Status & Marketing Badges Section in Edit Modal */}
          <div className="bg-wellness-gray-50 border border-wellness-gray-200 rounded-2xl p-4 space-y-4">
            <h5 className="text-xs font-extrabold text-wellness-navy uppercase tracking-wider">
              Product Availability Status & Marketing Badges
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <DropdownField
                  label="Stock Status"
                  options={[
                    { value: 'in_stock', label: 'In Stock' },
                    { value: 'out_of_stock', label: 'Out of Stock' },
                    { value: 'discontinued', label: 'Discontinued' },
                  ]}
                  selectedValue={editingProduct.stockStatus ?? 'in_stock'}
                  onChange={(val) => {
                    setEditingProduct((prev: Product | null) =>
                      prev
                        ? {
                            ...prev,
                            stockStatus: val as 'in_stock' | 'out_of_stock' | 'discontinued',
                          }
                        : null,
                    );
                  }}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="editProductIsFeatured"
                  checked={editingProduct.isFeatured ?? false}
                  onChange={(e) => {
                    setEditingProduct((prev: Product | null) =>
                      prev ? { ...prev, isFeatured: e.target.checked } : null,
                    );
                  }}
                  className="w-4 h-4 rounded text-wellness-green accent-wellness-green cursor-pointer"
                />
                <label
                  htmlFor="editProductIsFeatured"
                  className="text-xs font-bold text-wellness-navy cursor-pointer"
                >
                  Featured on Homepage
                </label>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="editProductIsBestSeller"
                  checked={editingProduct.isBestSeller ?? false}
                  onChange={(e) => {
                    setEditingProduct((prev: Product | null) =>
                      prev ? { ...prev, isBestSeller: e.target.checked } : null,
                    );
                  }}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
                <label
                  htmlFor="editProductIsBestSeller"
                  className="text-xs font-bold text-wellness-navy cursor-pointer"
                >
                  Best Seller Badge
                </label>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="editProductIsNewest"
                  checked={editingProduct.isNewest ?? false}
                  onChange={(e) => {
                    setEditingProduct((prev: Product | null) =>
                      prev ? { ...prev, isNewest: e.target.checked } : null,
                    );
                  }}
                  className="w-4 h-4 rounded text-blue-500 accent-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="editProductIsNewest"
                  className="text-xs font-bold text-wellness-navy cursor-pointer"
                >
                  Newest Product Badge
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <DropdownField
                label="Prescription Type"
                options={[
                  { value: 'Over-The-Counter (OTC)', label: 'Over-The-Counter (OTC)' },
                  { value: 'Prescription (Rx)', label: 'Prescription (Rx)' },
                ]}
                selectedValue={editingProduct.type}
                onChange={(val) => {
                  setEditingProduct((prev: Product | null) =>
                    prev
                      ? { ...prev, type: val as 'Prescription (Rx)' | 'Over-The-Counter (OTC)' }
                      : null,
                  );
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
              Image Source URL
            </label>
            <input
              type="text"
              value={editingProduct.image}
              onChange={(e) => {
                setEditingProduct((prev: Product | null) =>
                  prev ? { ...prev, image: e.target.value } : null,
                );
              }}
              className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
            />
          </div>

          {/* Edit Image Gallery (Max 6) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider">
              Upload Gallery Images (Max 6)
            </label>
            <div className="flex flex-wrap gap-4 items-center">
              <label className="cursor-pointer border border-dashed border-wellness-gray-300 hover:border-wellness-green transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-1 bg-wellness-gray-50 text-center w-24 h-24 shrink-0">
                <Plus size={20} className="text-wellness-navy/60" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-wellness-charcoal/60">
                  Upload
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    void handleEditProductImagesChange(e);
                  }}
                  className="hidden"
                />
              </label>

              {(editingProduct.images && editingProduct.images.length > 0
                ? editingProduct.images
                : [editingProduct.image]
              ).map((img: string, idx: number) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => {
                    handleImageDragStart(idx);
                  }}
                  onDragOver={(e) => {
                    handleImageDragOver(e, idx);
                  }}
                  onDrop={(e) => {
                    void handleImageDrop(e, idx, true);
                  }}
                  className={`relative w-24 h-24 rounded-xl overflow-hidden border transition-all cursor-move shrink-0 ${
                    draggedImgIdx === idx
                      ? 'opacity-40 border-dashed border-wellness-green scale-95'
                      : dragOverImgIdx === idx
                        ? 'border-2 border-wellness-green shadow-lg scale-105'
                        : 'border-wellness-gray-200 bg-wellness-gray-50 hover:border-wellness-green/50'
                  }`}
                  title="Drag to reorder"
                >
                  <img
                    src={img}
                    alt={`Preview ${(idx + 1).toString()}`}
                    className="object-cover w-full h-full pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void handleRemoveEditProductImage(idx);
                    }}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm focus:outline-none z-10"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-wellness-navy/80 text-[8px] font-extrabold uppercase text-center text-white py-0.5">
                    {idx === 0 ? 'Cover (Primary)' : `Pos ${(idx + 1).toString()}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={editingProduct.description}
              onChange={(e) => {
                setEditingProduct((prev: Product | null) =>
                  prev ? { ...prev, description: e.target.value } : null,
                );
              }}
              className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                Clinical Benefits (Comma separated)
              </label>
              <input
                type="text"
                value={editingProduct.benefits.join(', ')}
                onChange={(e) => {
                  setEditingProduct((prev: Product | null) =>
                    prev
                      ? { ...prev, benefits: e.target.value.split(',').map((b) => b.trim()) }
                      : null,
                  );
                }}
                className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                Active Ingredients (Comma separated)
              </label>
              <input
                type="text"
                value={editingProduct.ingredients.join(', ')}
                onChange={(e) => {
                  setEditingProduct((prev: Product | null) =>
                    prev
                      ? { ...prev, ingredients: e.target.value.split(',').map((i) => i.trim()) }
                      : null,
                  );
                }}
                className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
              Search Tags (Comma separated)
            </label>
            <input
              type="text"
              value={editingProduct.tags ? editingProduct.tags.join(', ') : ''}
              onChange={(e) => {
                setEditingProduct((prev: Product | null) =>
                  prev
                    ? {
                        ...prev,
                        tags: e.target.value.split(',').map((t) => t.trim().toLowerCase()),
                      }
                    : null,
                );
              }}
              className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-wellness-gray-150">
            <button
              type="button"
              onClick={onClose}
              className="border border-wellness-gray-200 text-wellness-navy font-bold text-xs py-3 px-5 rounded-xl hover:bg-wellness-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-wellness-navy hover:bg-wellness-green text-white font-bold text-xs py-3 px-5 rounded-xl transition-all cursor-pointer shadow"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
