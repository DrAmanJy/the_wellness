'use client';

import { Package, RefreshCw, Database, Clock, Activity, AlertCircle, X, Check } from 'lucide-react';
import React, { useState } from 'react';

import { Product } from '@/lib/products';

interface InventoryDraft {
  stockQty: number;
  inventoryQty: number;
  availableQty: number;
  reservedQty: number;
}

interface InventoryTabProps {
  products: Product[];
  isRefreshingProducts: boolean;
  onRefreshProducts: () => Promise<void>;
  onUpdateProductInventory: (
    prodId: string,
    draft: InventoryDraft,
    computedStatus: 'in_stock' | 'out_of_stock' | 'discontinued',
  ) => Promise<boolean>;
  showNotice: (message: string, type?: 'error' | 'warning' | 'success') => void;
}

export default function InventoryTab({
  products,
  isRefreshingProducts,
  onRefreshProducts,
  onUpdateProductInventory,
  showNotice,
}: InventoryTabProps) {
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<
    'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  >('all');
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null);
  const [inventoryDrafts, setInventoryDrafts] = useState<
    Record<string, InventoryDraft | undefined>
  >({});

  const totalAvailableUnits = products.reduce(
    (acc, p) => acc + (p.availableQty ?? p.inventoryQty ?? p.stockQty ?? 0),
    0,
  );
  const totalReservedUnits = products.reduce((acc, p) => acc + (p.reservedQty ?? 0), 0);
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stockQty ?? 0), 0);
  const lowStockItems = products.filter((p) => (p.stockQty ?? 0) > 0 && (p.stockQty ?? 0) < 10);

  const filteredInventory = products.filter((p) => {
    const matchSearch =
      !inventorySearchQuery ||
      p.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(inventorySearchQuery.toLowerCase());

    const stock = p.stockQty ?? 0;
    let matchFilter = true;
    if (inventoryFilter === 'in_stock') matchFilter = stock >= 10;
    if (inventoryFilter === 'low_stock') matchFilter = stock > 0 && stock < 10;
    if (inventoryFilter === 'out_of_stock') matchFilter = stock === 0;

    return matchSearch && matchFilter;
  });

  const handleSaveRow = async (prodId: string) => {
    const draft = inventoryDrafts[prodId];
    if (!draft) return;

    if (draft.stockQty < 0 || draft.availableQty < 0 || draft.reservedQty < 0) {
      showNotice('Stock, available, and reserved quantities cannot be negative.', 'error');
      return;
    }

    if (draft.stockQty > draft.availableQty) {
      showNotice(
        'Validation Error: Product store display stock cannot exceed available warehouse stock.',
        'error',
      );
      return;
    }

    const targetProd = products.find((p) => p.id === prodId);
    if (!targetProd) return;

    const computedStatus: 'in_stock' | 'out_of_stock' | 'discontinued' =
      draft.stockQty <= 0 || draft.availableQty <= 0
        ? 'out_of_stock'
        : targetProd.stockStatus === 'discontinued'
          ? 'discontinued'
          : 'in_stock';

    const success = await onUpdateProductInventory(prodId, draft, computedStatus);
    if (success) {
      setInventoryDrafts((prev) => {
        const { [prodId]: _, ...copy } = prev;
        return copy;
      });
      setEditingInventoryId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wellness-gray-150 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Package className="text-wellness-green h-6 w-6" />
            <h2 className="text-2xl font-heading font-extrabold text-wellness-navy">
              Inventory, Availability & Reserved Stock Control
            </h2>
          </div>
          <p className="text-xs text-wellness-charcoal/60 mt-1">
            Track real-time available stock, reserved customer orders, total warehouse inventory,
            and store display stock.
          </p>
        </div>
        <button
          onClick={() => {
            void onRefreshProducts();
          }}
          disabled={isRefreshingProducts}
          className="flex items-center gap-2 px-4 py-2.5 bg-wellness-gray-100 hover:bg-wellness-gray-200 text-wellness-navy rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshingProducts ? 'animate-spin' : ''} />
          <span>Sync Inventory</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-wellness-navy to-wellness-navy/90 text-white rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-wellness-green">
              Available Warehouse Stock
            </span>
            <Database size={16} className="text-wellness-green" />
          </div>
          <p className="text-3xl font-heading font-black text-white">
            {totalAvailableUnits.toLocaleString()}
          </p>
          <p className="text-[10px] text-white/60 font-semibold">
            Unreserved units ready for allocation
          </p>
        </div>

        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-900">
              Reserved Customer Stock
            </span>
            <Clock size={16} className="text-purple-600" />
          </div>
          <p className="text-3xl font-heading font-black text-purple-950">
            {totalReservedUnits.toLocaleString()}
          </p>
          <p className="text-[10px] text-purple-800 font-semibold">Locked for pending orders</p>
        </div>

        <div className="bg-white border border-wellness-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-wellness-charcoal/60">
              Display Store Stock
            </span>
            <Activity size={16} className="text-wellness-blue" />
          </div>
          <p className="text-3xl font-heading font-black text-wellness-navy">
            {totalStockUnits.toLocaleString()}
          </p>
          <p className="text-[10px] text-wellness-charcoal/60 font-semibold">
            Units active on store catalog
          </p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800">
              Low Stock Alerts
            </span>
            <AlertCircle size={16} className="text-amber-600" />
          </div>
          <p className="text-3xl font-heading font-black text-amber-900">{lowStockItems.length}</p>
          <p className="text-[10px] text-amber-700 font-semibold">
            Products below 10 display units
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-wellness-gray-50 border border-wellness-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search product inventory & stock..."
            value={inventorySearchQuery}
            onChange={(e) => {
              setInventorySearchQuery(e.target.value);
            }}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-wellness-gray-200 bg-white text-xs font-semibold focus:border-wellness-green outline-none"
          />
          {inventorySearchQuery && (
            <button
              onClick={() => {
                setInventorySearchQuery('');
              }}
              className="absolute right-3 top-3 text-wellness-charcoal/40 hover:text-wellness-navy cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-wellness-navy uppercase tracking-wider whitespace-nowrap">
            Filter:
          </span>
          <select
            value={inventoryFilter}
            onChange={(e) => {
              setInventoryFilter(
                e.target.value as 'all' | 'in_stock' | 'low_stock' | 'out_of_stock',
              );
            }}
            className="px-4 py-2 rounded-xl border border-wellness-gray-200 bg-white text-xs font-semibold text-wellness-navy outline-none cursor-pointer"
          >
            <option value="all">All Products ({products.length})</option>
            <option value="in_stock">Healthy Stock (≥10 units)</option>
            <option value="low_stock">Low Stock (&lt;10 units)</option>
            <option value="out_of_stock">Out of Stock (0 units)</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-wellness-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-wellness-navy text-white text-[10px] font-extrabold uppercase tracking-wider">
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-4 text-center">Available Stock</th>
                <th className="py-4 px-4 text-center">Reserved Stock</th>
                <th className="py-4 px-4 text-center">Total Warehouse</th>
                <th className="py-4 px-4 text-center">Store Display</th>
                <th className="py-4 px-6">Stock Ratio & Health</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wellness-gray-150 text-xs">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-wellness-charcoal/50 font-semibold"
                  >
                    No matching products found in inventory.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((prod) => {
                  const isEditing = editingInventoryId === prod.id;
                  const stock = prod.stockQty ?? 0;
                  const avail = prod.availableQty ?? prod.inventoryQty ?? stock;
                  const resv = prod.reservedQty ?? 0;
                  const totalInv = avail + resv;

                  const draft = inventoryDrafts[prod.id] ?? {
                    stockQty: stock,
                    inventoryQty: avail,
                    availableQty: avail,
                    reservedQty: resv,
                  };

                  const isDraftValid =
                    draft.stockQty <= draft.availableQty &&
                    draft.stockQty >= 0 &&
                    draft.availableQty >= 0 &&
                    draft.reservedQty >= 0;

                  const ratio = avail > 0 ? Math.min(Math.round((stock / avail) * 100), 100) : 0;

                  return (
                    <tr key={prod.id} className="hover:bg-wellness-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image || '/images/cardiostatin.png'}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-xl border border-wellness-gray-200 bg-wellness-gray-50"
                          />
                          <div>
                            <p className="font-extrabold text-wellness-navy text-xs">{prod.name}</p>
                            <p className="text-[10px] font-semibold text-wellness-charcoal/50">
                              {prod.category} • ₹{prod.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Available Stock */}
                      <td className="py-4 px-4 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={draft.availableQty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              setInventoryDrafts((prev) => ({
                                ...prev,
                                [prod.id]: { ...draft, availableQty: val },
                              }));
                            }}
                            className={`w-20 px-2 py-1.5 rounded-lg border text-center font-bold text-xs outline-none ${
                              !isDraftValid
                                ? 'border-red-500 bg-red-50 text-red-900'
                                : 'border-wellness-green bg-white'
                            }`}
                          />
                        ) : (
                          <span className="font-extrabold text-emerald-700 text-sm">{avail}</span>
                        )}
                      </td>

                      {/* Reserved Stock */}
                      <td className="py-4 px-4 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={draft.reservedQty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              setInventoryDrafts((prev) => ({
                                ...prev,
                                [prod.id]: { ...draft, reservedQty: val },
                              }));
                            }}
                            className="w-20 px-2 py-1.5 rounded-lg border border-purple-300 bg-purple-50 text-purple-900 text-center font-bold text-xs outline-none"
                          />
                        ) : (
                          <span className="font-extrabold text-purple-800 text-sm">{resv}</span>
                        )}
                      </td>

                      {/* Total Warehouse */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-black text-wellness-navy text-sm">
                          {isEditing ? draft.availableQty + draft.reservedQty : totalInv}
                        </span>
                      </td>

                      {/* Store Display Stock */}
                      <td className="py-4 px-4 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={draft.stockQty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              setInventoryDrafts((prev) => ({
                                ...prev,
                                [prod.id]: { ...draft, stockQty: val },
                              }));
                            }}
                            className={`w-20 px-2 py-1.5 rounded-lg border text-center font-bold text-xs outline-none ${
                              !isDraftValid
                                ? 'border-red-500 bg-red-50 text-red-900'
                                : 'border-wellness-green bg-white'
                            }`}
                          />
                        ) : (
                          <span
                            className={`font-black text-sm ${
                              stock === 0
                                ? 'text-red-600'
                                : stock < 10
                                  ? 'text-amber-600'
                                  : 'text-wellness-navy'
                            }`}
                          >
                            {stock}
                          </span>
                        )}
                      </td>

                      {/* Stock Ratio */}
                      <td className="py-4 px-6 min-w-[150px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-wellness-charcoal/60">Ratio</span>
                            <span className="text-wellness-navy">
                              {ratio}% ({stock}/{avail})
                            </span>
                          </div>
                          <div className="w-full bg-wellness-gray-150 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${
                                stock === 0
                                  ? 'bg-red-500'
                                  : stock < 10
                                    ? 'bg-amber-500'
                                    : 'bg-wellness-green'
                              }`}
                              style={{ width: `${String(ratio)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {stock === 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-800 border border-red-200">
                            <AlertCircle size={10} /> Out of Stock
                          </span>
                        ) : stock < 10 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertCircle size={10} /> Low Stock ({stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Check size={10} /> Healthy
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                void handleSaveRow(prod.id);
                              }}
                              disabled={!isDraftValid}
                              className="px-3 py-1.5 bg-wellness-green hover:bg-wellness-green/90 text-wellness-navy rounded-lg font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingInventoryId(null);
                                setInventoryDrafts((prev) => {
                                  const { [prod.id]: _, ...copy } = prev;
                                  return copy;
                                });
                              }}
                              className="px-3 py-1.5 bg-wellness-gray-200 hover:bg-wellness-gray-300 text-wellness-navy rounded-lg font-bold text-xs transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingInventoryId(prod.id);
                              setInventoryDrafts((prev) => ({
                                ...prev,
                                [prod.id]: {
                                  stockQty: stock,
                                  inventoryQty: avail,
                                  availableQty: avail,
                                  reservedQty: resv,
                                },
                              }));
                            }}
                            className="px-3.5 py-1.5 border border-wellness-gray-200 hover:border-wellness-navy bg-white hover:bg-wellness-navy hover:text-white rounded-lg text-xs font-bold text-wellness-navy transition-all cursor-pointer"
                          >
                            Edit Inventory
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
