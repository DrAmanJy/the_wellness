'use client';

import React, { useState, useEffect, useCallback } from 'react';

import AdminAuthRequired from './components/AdminAuthRequired';
import AdminHeader from './components/AdminHeader';
import AdminNoticeBox from './components/AdminNoticeBox';
import AdminSidebar from './components/AdminSidebar';
import EditProductModal from './components/EditProductModal';
import AnalyticsTab from './components/tabs/AnalyticsTab';
import CategoriesTab from './components/tabs/CategoriesTab';
import InventoryTab from './components/tabs/InventoryTab';
import OrdersTab from './components/tabs/OrdersTab';
import ProductsTab from './components/tabs/ProductsTab';
import PromotionsTab from './components/tabs/PromotionsTab';
import QueriesTab from './components/tabs/QueriesTab';
import type {
  AdminTab,
  ContactQuery,
  CategoryItem,
  PromotionItem,
  ApiAnalyticsSummary,
  ApiProductDetailAnalytics,
  OrderData,
  ApiOrderDTO,
  NewProductFormState,
  QuickUpdateProductPayload,
} from './types';

import { authClient } from '@/lib/auth-client';
import { Product } from '@/lib/products';
import { useAppSelector } from '@/lib/redux/hooks';

export default function AdminPage() {
  const user = useAppSelector((state) => state.auth.user);
  const reduxSession = useAppSelector((state) => state.auth.session);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const session = user && reduxSession ? { user, session: reduxSession } : null;
  const sessionLoading = !isInitialized;

  // Active Tab & Navigation
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Notice Notification
  const [notice, setNotice] = useState<{
    message: string;
    type: 'error' | 'warning' | 'success';
  } | null>(null);

  const showNotice = useCallback(
    (message: string, type: 'error' | 'warning' | 'success' = 'error') => {
      setNotice({ message, type });
    },
    [],
  );

  // Auth State
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [isRefreshingProducts, setIsRefreshingProducts] = useState(false);

  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isRefreshingCategories, setIsRefreshingCategories] = useState(false);

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);

  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [isRefreshingQueries, setIsRefreshingQueries] = useState(false);

  const [promotionsList, setPromotionsList] = useState<PromotionItem[]>([]);

  const [apiAnalytics, setApiAnalytics] = useState<ApiAnalyticsSummary | null>(null);
  const [selectedProductAnalysis, setSelectedProductAnalysis] =
    useState<ApiProductDetailAnalytics | null>(null);
  const [isLoadingProductAnalysis, setIsLoadingProductAnalysis] = useState<string | null>(null);

  // Product Form & Edit Modal State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProductFormState>({
    name: '',
    category: '',
    type: 'Over-The-Counter (OTC)',
    mrp: '',
    sellingPrice: '',
    stockQty: '10',
    availableQty: '10',
    reservedQty: '0',
    inventoryQty: '10',
    stockStatus: 'in_stock',
    isFeatured: false,
    isBestSeller: false,
    isNewest: false,
    description: '',
    benefits: '',
    ingredients: '',
    image: '',
    tags: '',
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductImages, setNewProductImages] = useState<string[]>([]);
  const [draggedImgIdx, setDraggedImgIdx] = useState<number | null>(null);
  const [dragOverImgIdx, setDragOverImgIdx] = useState<number | null>(null);

  // Cloudinary Helper
  const uploadToCloudinary = async (
    fileOrDataUri: File | string,
    folder = 'wellness_catalog',
  ): Promise<string> => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('file', fileOrDataUri);
      formData.append('folder', folder);

      const res = await fetch(`${API_BASE}/api/cloudinary/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        return typeof fileOrDataUri === 'string' ? fileOrDataUri : '';
      }
      const data = (await res.json()) as { url?: string };
      return data.url || (typeof fileOrDataUri === 'string' ? fileOrDataUri : '');
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      return typeof fileOrDataUri === 'string' ? fileOrDataUri : '';
    }
  };

  // --- API Loaders ---
  const loadProducts = useCallback(async () => {
    setIsRefreshingProducts(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/products`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          success?: boolean;
          data?: {
            items?: Array<{
              id: string;
              name: string;
              categoryName?: string;
              category?: string;
              description?: string;
              shortDescription?: string;
              primaryImage?: string;
              sellingPrice?: string | number;
              mrp?: string | number;
              startingPrice?: number;
              compareAtPrice?: number;
              stockQty?: number;
              inventoryQty?: number;
              availableQty?: number;
              reservedQty?: number;
              stockStatus?: 'in_stock' | 'out_of_stock' | 'discontinued';
              isFeatured?: boolean;
              isBestSeller?: boolean;
              isNewest?: boolean;
              type?: string;
            }>;
          };
        };
        if (json.success && Array.isArray(json.data?.items)) {
          const apiProds: Product[] = json.data.items.map((item) => {
            const spNum =
              typeof item.sellingPrice === 'number'
                ? item.sellingPrice
                : typeof item.sellingPrice === 'string'
                  ? parseFloat(item.sellingPrice)
                  : item.startingPrice || 0;
            const mrpNum =
              typeof item.mrp === 'number'
                ? item.mrp
                : typeof item.mrp === 'string'
                  ? parseFloat(item.mrp)
                  : item.compareAtPrice || spNum;

            const availQty = item.availableQty ?? item.inventoryQty ?? item.stockQty ?? 0;
            const resvQty = item.reservedQty ?? 0;
            const catName = item.categoryName || item.category || 'Uncategorized';

            return {
              id: item.id,
              name: item.name,
              category: catName,
              categoryName: catName,
              type: 'Over-The-Counter (OTC)',
              description: item.description || item.shortDescription || 'No description provided.',
              benefits: [],
              ingredients: [],
              image: item.primaryImage || '/images/cardiostatin.png',
              images: item.primaryImage ? [item.primaryImage] : ['/images/cardiostatin.png'],
              price: spNum,
              originalPrice: mrpNum,
              mrp: mrpNum,
              sellingPrice: spNum,
              stockQty: item.stockQty ?? 0,
              inventoryQty: availQty,
              availableQty: availQty,
              reservedQty: resvQty,
              stockStatus: item.stockStatus ?? 'in_stock',
              isFeatured: item.isFeatured ?? false,
              isBestSeller: item.isBestSeller ?? false,
              isNewest: item.isNewest ?? false,
              tags: [],
            };
          });
          setProducts(apiProds);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load products from API:', e);
    } finally {
      setIsRefreshingProducts(false);
    }
    setProducts([]);
  }, []);

  const loadCategories = useCallback(async () => {
    setIsRefreshingCategories(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/categories`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          success?: boolean;
          data?: Array<{ id: string; name: string; slug: string }>;
        };
        if (json.success && Array.isArray(json.data)) {
          const apiCats: CategoryItem[] = json.data.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
          }));
          setCategoryItems(apiCats);
          setCategories(['All', ...apiCats.map((c) => c.name)]);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load categories from API:', e);
    } finally {
      setIsRefreshingCategories(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setIsRefreshingOrders(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/orders`, {
        credentials: 'include',
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const json = (await res.json()) as { success?: boolean; data?: ApiOrderDTO[] };
        if (json.success && Array.isArray(json.data)) {
          const mappedOrders: OrderData[] = json.data.map((ord) => ({
            orderId: ord.id,
            paymentId:
              ord.payment?.transactionId ||
              ord.payment?.razorpayPaymentId ||
              ord.payment?.provider ||
              'PAID',
            items: (ord.items || []).map((item) => ({
              product: {
                id: item.productId,
                name: item.productName || 'Therapeutic Formulation',
                price: item.unitPrice,
                image: '/images/products/product_placeholder.png',
                type: 'Prescription Medicine',
              },
              quantity: item.quantity,
            })),
            subtotal: ord.subtotal ?? ord.totalAmount ?? 0,
            shipping: ord.shippingAmount ?? 0,
            tax: ord.taxAmount ?? 0,
            total: ord.totalAmount ?? ord.price ?? 0,
            shippingForm: {
              fullName: ord.shippingAddress?.fullName || 'Customer',
              email: ord.shippingAddress?.email || '',
              phone: ord.shippingAddress?.phone || '',
              address: ord.shippingAddress?.street || '',
              city: ord.shippingAddress?.city || '',
              zipCode: ord.shippingAddress?.pincode || '',
            },
            date: ord.createdAt,
            status: ord.status
              ? (ord.status as
                  | 'pending'
                  | 'confirmed'
                  | 'processing'
                  | 'shipped'
                  | 'out_for_delivery'
                  | 'delivered'
                  | 'cancelled')
              : 'pending',
          }));

          setOrders(mappedOrders);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load orders from API:', e);
    } finally {
      setIsRefreshingOrders(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/analytics`, {
        credentials: 'include',
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const json = (await res.json()) as { success?: boolean; data?: ApiAnalyticsSummary };
        if (json.success && json.data) {
          setApiAnalytics(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to load analytics from API:', e);
    }
  }, []);

  const handleAnalyzeProduct = async (productId: string) => {
    setIsLoadingProductAnalysis(productId);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/analytics/products/${productId}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = (await res.json()) as {
          success?: boolean;
          data?: ApiProductDetailAnalytics;
        };
        if (json.success && json.data) {
          setSelectedProductAnalysis(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to load product analytics detail:', e);
    } finally {
      setIsLoadingProductAnalysis(null);
    }
  };

  const loadQueries = useCallback(async () => {
    setIsRefreshingQueries(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/customer/inquiries`, {
        credentials: 'include',
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          success?: boolean;
          data?: Array<{
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            company?: string;
            inquiryType?: string;
            message: string;
            createdAt?: string;
            status?: string;
          }>;
        };
        if (json.success && Array.isArray(json.data)) {
          const mappedQueries: ContactQuery[] = json.data.map((item) => ({
            id: item.id,
            firstName: item.firstName,
            lastName: item.lastName,
            email: item.email,
            company: item.company || '',
            inquiryType: item.inquiryType || 'General Inquiry',
            message: item.message,
            date: item.createdAt || new Date().toISOString(),
            status: item.status ? item.status : 'pending',
          }));
          setQueries(mappedQueries);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load inquiries from API:', e);
    } finally {
      setIsRefreshingQueries(false);
    }
  }, []);

  const loadPromotions = useCallback(async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/promotions`, {
        credentials: 'include',
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const result = (await res.json()) as { success?: boolean; data?: PromotionItem[] };
        if (result.success && Array.isArray(result.data)) {
          setPromotionsList(result.data);
        }
      }
    } catch (e) {
      console.error('Failed to load promotions from API:', e);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
    void loadCategories();
    void loadOrders();
    void loadAnalytics();
    void loadQueries();
    void loadPromotions();
    setIsMounted(true);
  }, [loadProducts, loadCategories, loadOrders, loadAnalytics, loadQueries, loadPromotions]);

  // --- Handlers ---
  const handleAdminLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await authClient.signIn.email({
        email: 'admin@thewellness.com',
        password: 'adminpassword',
      });

      if (res.error) {
        const signUpRes = await authClient.signUp.email({
          email: 'admin@thewellness.com',
          password: 'adminpassword',
          name: 'Chief Admin Officer',
        });

        if (signUpRes.error) {
          setLoginError(signUpRes.error.message || 'Failed to authenticate admin');
          return;
        }

        await authClient.signIn.email({
          email: 'admin@thewellness.com',
          password: 'adminpassword',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to authenticate admin';
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  // Image handling
  const handleNewProductImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const slotsAvailable = 6 - newProductImages.length;
    if (slotsAvailable <= 0) {
      showNotice('Maximum 6 images allowed.', 'warning');
      return;
    }
    const filesLimit = files.slice(0, slotsAvailable);

    try {
      const uploadedUrls = await Promise.all(
        filesLimit.map((file) => uploadToCloudinary(file, 'wellness_products')),
      );
      const validUrls = uploadedUrls.filter((url) => url.length > 0);
      setNewProductImages((prev) => [...prev, ...validUrls].slice(0, 6));
    } catch (err: unknown) {
      console.error('Error uploading product files:', err);
    }
  };

  const handleEditProductImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !editingProduct) return;
    const files = Array.from(e.target.files);
    const currentImgs = editingProduct.images || [editingProduct.image];
    const slotsAvailable = 6 - currentImgs.length;
    if (slotsAvailable <= 0) {
      showNotice('Maximum 6 images allowed.', 'warning');
      return;
    }
    const filesLimit = files.slice(0, slotsAvailable);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const uploadedUrls = await Promise.all(
        filesLimit.map((file) => uploadToCloudinary(file, 'wellness_products')),
      );
      const validUrls = uploadedUrls.filter((url) => url.length > 0);

      if (editingProduct.id && validUrls.length > 0) {
        await fetch(`${API_BASE}/api/products/${editingProduct.id}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: validUrls.map((url, idx) => ({
              url,
              isPrimary: currentImgs.length === 0 && idx === 0,
            })),
          }),
        });
      }

      setEditingProduct((prev) => {
        if (!prev) return null;
        const oldImgs = prev.images || [prev.image];
        const newImgs = [...oldImgs, ...validUrls].slice(0, 6);
        return {
          ...prev,
          image: newImgs[0] || prev.image,
          images: newImgs,
        };
      });
    } catch (err: unknown) {
      console.error('Error uploading edit product files:', err);
    }
  };

  const handleRemoveEditProductImage = async (idx: number) => {
    if (!editingProduct) return;
    const currentImgs = editingProduct.images || [editingProduct.image];
    const targetUrl = currentImgs[idx];

    if (editingProduct.id && targetUrl) {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const imgRes = await fetch(`${API_BASE}/api/products/${editingProduct.id}/images`);
        if (imgRes.ok) {
          const imgData = (await imgRes.json()) as { data?: Array<{ id: string; url: string }> };
          const dbImages = imgData.data || [];
          const matched = dbImages.find((item) => item.url === targetUrl);
          if (matched) {
            await fetch(`${API_BASE}/api/products/${editingProduct.id}/images/${matched.id}`, {
              method: 'DELETE',
            });
          }
        }
      } catch (err) {
        console.error('Error deleting image from DB:', err);
      }
    }

    setEditingProduct((prev) => {
      if (!prev) return null;
      const oldImgs = prev.images || [prev.image];
      const newImgs = oldImgs.filter((_, i) => i !== idx);
      return {
        ...prev,
        image: newImgs[0] || '/images/cardiostatin.png',
        images: newImgs,
      };
    });
  };

  const handleImageDragStart = (idx: number) => {
    setDraggedImgIdx(idx);
  };

  const handleImageDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverImgIdx(idx);
  };

  const handleImageDrop = async (e: React.DragEvent, dropIdx: number, isEditMode: boolean) => {
    e.preventDefault();
    if (draggedImgIdx === null || draggedImgIdx === dropIdx) {
      setDraggedImgIdx(null);
      setDragOverImgIdx(null);
      return;
    }

    const fromIdx = draggedImgIdx;
    setDraggedImgIdx(null);
    setDragOverImgIdx(null);

    if (isEditMode && editingProduct) {
      const currentImgs =
        editingProduct.images && editingProduct.images.length > 0
          ? [...editingProduct.images]
          : [editingProduct.image];

      const reordered = [...currentImgs];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(dropIdx, 0, moved);

      setEditingProduct((prev) =>
        prev
          ? {
              ...prev,
              image: reordered[0] || prev.image,
              images: reordered,
            }
          : null,
      );

      if (editingProduct.id) {
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const imgRes = await fetch(`${API_BASE}/api/products/${editingProduct.id}/images`);
          if (imgRes.ok) {
            const imgData = (await imgRes.json()) as { data?: Array<{ id: string; url: string }> };
            const dbImages = imgData.data || [];
            if (dbImages.length > 0) {
              const imageOrders = reordered
                .map((url, order) => {
                  const matched = dbImages.find((item) => item.url === url);
                  return matched ? { id: matched.id, displayOrder: order } : null;
                })
                .filter((item): item is { id: string; displayOrder: number } => item !== null);

              if (imageOrders.length > 0) {
                await fetch(`${API_BASE}/api/products/${editingProduct.id}/images/reorder`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ imageOrders }),
                });
              }
            }
          }
        } catch (err) {
          console.error('Failed to sync image order to DB:', err);
        }
      }
    } else {
      const reordered = [...newProductImages];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(dropIdx, 0, moved);
      setNewProductImages(reordered);
    }
  };

  // Product Add
  const handleAddProduct = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newProduct.name.trim()) {
      showNotice('Validation Error: Product Name is compulsory.');
      return;
    }
    if (!newProduct.category.trim()) {
      showNotice('Validation Error: Category is compulsory.');
      return;
    }
    if (!newProduct.description.trim()) {
      showNotice('Validation Error: Description is compulsory.');
      return;
    }

    const sellingPriceNum = parseFloat(newProduct.sellingPrice);
    if (isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      showNotice('Validation Error: Selling Price is compulsory and must be greater than 0.');
      return;
    }

    const mrpNum = newProduct.mrp ? parseFloat(newProduct.mrp) : sellingPriceNum;
    if (isNaN(mrpNum) || mrpNum <= 0) {
      showNotice('Validation Error: MRP is compulsory and must be greater than 0.');
      return;
    }
    if (mrpNum < sellingPriceNum) {
      showNotice('Validation Error: MRP must be greater than or equal to Selling Price.');
      return;
    }

    const stockQtyNum = parseInt(newProduct.stockQty || '0', 10);
    const availableQtyNum = parseInt(newProduct.availableQty || newProduct.inventoryQty || '0', 10);
    const reservedQtyNum = parseInt(newProduct.reservedQty || '0', 10);

    if (isNaN(availableQtyNum) || availableQtyNum < 0) {
      showNotice(
        'Validation Error: Available warehouse stock quantity is compulsory and cannot be negative.',
      );
      return;
    }
    if (isNaN(stockQtyNum) || stockQtyNum < 0) {
      showNotice('Validation Error: Store display stock quantity is compulsory.');
      return;
    }
    if (isNaN(reservedQtyNum) || reservedQtyNum < 0) {
      showNotice('Validation Error: Reserved stock quantity cannot be negative.');
      return;
    }
    if (stockQtyNum > availableQtyNum) {
      showNotice(
        'Validation Error: Product store display stock quantity cannot be greater than available inventory quantity.',
      );
      return;
    }

    const effectiveImgs =
      newProductImages.length > 0 ? newProductImages : newProduct.image ? [newProduct.image] : [];
    if (effectiveImgs.length < 1) {
      showNotice(
        'Validation Error: Upload Gallery Images is compulsory. At least 1 product image must be uploaded.',
      );
      return;
    }

    let slug = newProduct.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      slug = `product-${Date.now().toString()}`;
    }

    if (products.some((p) => p.id === slug)) {
      showNotice('A product with a similar name already exists. Please choose a unique name.');
      return;
    }

    const selectedCatItem = categoryItems.find(
      (c) =>
        c.name.toLowerCase() === newProduct.category.trim().toLowerCase() ||
        c.id === newProduct.category.trim(),
    );
    const categoryId = selectedCatItem ? selectedCatItem.id : undefined;

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newProduct.name.trim(),
          description: newProduct.description.trim(),
          ...(categoryId && { categoryId }),
          isFeatured: newProduct.isFeatured,
          isBestSeller: newProduct.isBestSeller,
          isNewest: newProduct.isNewest,
          stockStatus: newProduct.stockStatus,
          mrp: mrpNum,
          sellingPrice: sellingPriceNum,
          stockQty: stockQtyNum,
          availableQty: availableQtyNum,
          reservedQty: reservedQtyNum,
          inventoryQty: availableQtyNum,
          images: effectiveImgs,
        }),
      });

      const responseData = (await res.json()) as {
        success?: boolean;
        data?: { id: string };
        error?: { message: string };
      };

      if (!res.ok || !responseData.success) {
        const errorMsg =
          responseData.error?.message || res.statusText || 'Failed to create product';
        showNotice(`API Error: ${errorMsg}`);
        return;
      }

      const createdId = responseData.data?.id || slug;
      const mainImg =
        newProductImages.length > 0
          ? newProductImages[0]
          : newProduct.image || '/images/cardiostatin.png';
      const allImgs = newProductImages.length > 0 ? newProductImages : [mainImg];

      const createdProduct: Product = {
        id: createdId,
        name: newProduct.name,
        category: newProduct.category,
        type: newProduct.type as 'Prescription (Rx)' | 'Over-The-Counter (OTC)',
        description: newProduct.description,
        benefits: newProduct.benefits ? newProduct.benefits.split(',').map((b) => b.trim()) : [],
        ingredients: newProduct.ingredients
          ? newProduct.ingredients.split(',').map((i) => i.trim())
          : [],
        image: mainImg,
        images: allImgs,
        price: sellingPriceNum,
        mrp: mrpNum,
        sellingPrice: sellingPriceNum,
        stockQty: stockQtyNum,
        inventoryQty: availableQtyNum,
        availableQty: availableQtyNum,
        reservedQty: reservedQtyNum,
        stockStatus: newProduct.stockStatus,
        isFeatured: newProduct.isFeatured,
        isBestSeller: newProduct.isBestSeller,
        isNewest: newProduct.isNewest,
        tags: newProduct.tags ? newProduct.tags.split(',').map((t) => t.trim().toLowerCase()) : [],
      };

      setProducts((prev) => [createdProduct, ...prev]);
      setNewProduct({
        name: '',
        category: '',
        type: 'Over-The-Counter (OTC)',
        mrp: '',
        sellingPrice: '',
        stockQty: '10',
        availableQty: '10',
        reservedQty: '0',
        inventoryQty: '10',
        stockStatus: 'in_stock',
        isFeatured: false,
        isBestSeller: false,
        isNewest: false,
        description: '',
        benefits: '',
        ingredients: '',
        image: '',
        tags: '',
      });
      setNewProductImages([]);
      setShowAddProduct(false);
      showNotice('Product created successfully!', 'success');

      if (!categories.includes(newProduct.category)) {
        setCategories((prev) => [...prev, newProduct.category]);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      showNotice(`Network / Server Error: ${errMsg}`);
    }
  };

  // Product Edit
  const handleEditProduct = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      showNotice('Validation Error: Product Name is compulsory.');
      return;
    }
    if (!editingProduct.category.trim()) {
      showNotice('Validation Error: Category is compulsory.');
      return;
    }
    if (!editingProduct.description.trim()) {
      showNotice('Validation Error: Description is compulsory.');
      return;
    }

    const editStockQty = editingProduct.stockQty ?? 0;
    const editInventoryQty = editingProduct.inventoryQty ?? editStockQty;

    if (editStockQty < 0 || editInventoryQty < 0) {
      showNotice('Stock and inventory quantities must be non-negative integers.');
      return;
    }
    if (editStockQty > editInventoryQty) {
      showNotice(
        'Validation Error: Product store display stock cannot be greater than total inventory quantity.',
      );
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        editingProduct.id,
      );

      if (isUuid) {
        const res = await fetch(`${API_BASE}/api/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: editingProduct.name,
            description: editingProduct.description,
            mrp: editingProduct.mrp ?? editingProduct.price,
            sellingPrice: editingProduct.sellingPrice ?? editingProduct.price,
            stockQty: editStockQty,
            inventoryQty: editInventoryQty,
            stockStatus: editingProduct.stockStatus ?? 'in_stock',
            isFeatured: editingProduct.isFeatured ?? false,
            isBestSeller: editingProduct.isBestSeller ?? false,
            isNewest: editingProduct.isNewest ?? false,
          }),
        });

        const responseData = (await res.json()) as {
          success?: boolean;
          error?: { message: string };
        };

        if (!res.ok || !responseData.success) {
          const errorMsg =
            responseData.error?.message || res.statusText || 'Failed to update product';
          showNotice(`API Error: ${errorMsg}`);
          return;
        }
      }

      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? editingProduct : p)));
      setEditingProduct(null);
      showNotice('Product updated successfully!', 'success');
      void loadProducts();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      showNotice(`Network / Server Error: ${errMsg}`);
    }
  };

  // Quick update product flags
  const handleQuickUpdateProduct = async (prodId: string, updates: QuickUpdateProductPayload) => {
    const target = products.find((p) => p.id === prodId);
    if (!target) return;

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prodId);

    setProducts((prev) => prev.map((p) => (p.id === prodId ? { ...p, ...updates } : p)));

    if (isUuid) {
      try {
        const res = await fetch(`${API_BASE}/api/products/${prodId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updates),
        });
        const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
        if (!res.ok || !json.success) {
          showNotice(`API Error: ${json.error?.message || 'Failed to update product'}`);
          void loadProducts();
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        showNotice(`Network Error: ${errMsg}`);
        void loadProducts();
      }
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action is irreversible.')) {
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      if (isUuid) {
        const res = await fetch(`${API_BASE}/api/products/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        const responseData = (await res.json()) as {
          success?: boolean;
          error?: { message: string };
        };

        if (!res.ok || !responseData.success) {
          const errorMsg =
            responseData.error?.message || res.statusText || 'Failed to delete product';
          showNotice(`API Error: ${errorMsg}`);
          return;
        }
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      showNotice('Product deleted successfully.', 'success');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      showNotice(`Network / Server Error: ${errMsg}`);
    }
  };

  // Inventory Save
  const handleUpdateProductInventory = async (
    prodId: string,
    draft: { stockQty: number; inventoryQty: number; availableQty: number; reservedQty: number },
    computedStatus: 'in_stock' | 'out_of_stock' | 'discontinued',
  ): Promise<boolean> => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prodId);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === prodId
          ? {
              ...p,
              stockQty: draft.stockQty,
              inventoryQty: draft.availableQty,
              availableQty: draft.availableQty,
              reservedQty: draft.reservedQty,
              stockStatus: computedStatus,
            }
          : p,
      ),
    );

    try {
      if (isUuid) {
        const res = await fetch(`${API_BASE}/api/products/${prodId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            stockQty: draft.stockQty,
            inventoryQty: draft.availableQty,
            availableQty: draft.availableQty,
            reservedQty: draft.reservedQty,
            stockStatus: computedStatus,
          }),
        });
        const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
        if (!res.ok || !json.success) {
          showNotice(`API Error: ${json.error?.message || 'Failed to update inventory'}`);
          void loadProducts();
          return false;
        }
      }

      showNotice('Inventory levels saved successfully!', 'success');
      void loadProducts();
      return true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      showNotice(`Network / Server Error: ${errMsg}`);
      void loadProducts();
      return false;
    }
  };

  // Category Handlers
  const handleAddCategory = async (categoryName: string): Promise<boolean> => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const slug = categoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: categoryName,
          slug: slug || 'cat-' + Date.now().toString(),
          isActive: true,
        }),
      });

      const json = (await res.json()) as { success?: boolean; error?: { message: string } };
      if (!res.ok || !json.success) {
        showNotice(
          `API Error: ${json.error?.message || res.statusText || 'Failed to create category'}`,
        );
        return false;
      }

      showNotice('Category added successfully!', 'success');
      void loadCategories();
      return true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      showNotice(`Network / Server Error: ${errMsg}`);
      return false;
    }
  };

  const handleDeleteCategory = async (catItem: CategoryItem) => {
    const assignedProds = products.filter((p) => p.category === catItem.name);
    if (assignedProds.length > 0) {
      if (
        !confirm(
          `Warning: There are ${assignedProds.length.toString()} products currently categorized under "${catItem.name}". Deleting this category will leave them orphaned. Proceed?`,
        )
      ) {
        return;
      }
    } else if (!confirm(`Are you sure you want to delete category "${catItem.name}"?`)) {
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${API_BASE}/api/categories/${catItem.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const json = (await res.json()) as { success?: boolean; error?: { message: string } };
      if (!res.ok || !json.success) {
        showNotice(
          `API Error: ${json.error?.message || res.statusText || 'Failed to delete category'}`,
        );
        return;
      }

      showNotice('Category deleted successfully.', 'success');
      void loadCategories();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      showNotice(`Network / Server Error: ${errMsg}`);
    }
  };

  // Queries Handler
  const handleToggleQueryStatus = async (id: string) => {
    const target = queries.find((q) => q.id === id);
    if (!target) return;
    const nextStatus = target.status === 'pending' ? 'resolved' : 'pending';

    setQueries((prev) => prev.map((q) => (q.id === id ? { ...q, status: nextStatus } : q)));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await fetch(`${API_BASE}/api/customer/inquiries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (e) {
      console.error('Failed to update inquiry status:', e);
    }
  };

  // Orders Handler
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderData['status']) => {
    setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o)));

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    if (isUuid) {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err) {
        console.error('Error updating order status:', err);
      }
    }
    void loadOrders();
  };

  // Guard Clauses
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = userRole === 'admin' || session?.user.email === 'admin@thewellness.com';

  if (sessionLoading) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-12 h-12 border-4 border-wellness-green/30 border-t-wellness-green rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-wellness-navy uppercase tracking-wider">
          Authenticating Clinical Portal...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <AdminAuthRequired
        sessionUser={session?.user}
        isLoggingIn={isLoggingIn}
        loginError={loginError}
        onLogin={() => {
          void handleAdminLogin();
        }}
      />
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen flex flex-col md:flex-row relative">
      <AdminNoticeBox
        notice={notice}
        onClose={() => {
          setNotice(null);
        }}
      />

      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        queriesCount={queries.length}
        ordersCount={orders.length}
        adminEmail={session?.user.email}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => {
          setMobileSidebarOpen(false);
        }}
        onSignOut={() => {
          void handleSignOut();
        }}
      />

      <main className="flex-1 overflow-x-hidden min-h-screen">
        <AdminHeader
          activeTab={activeTab}
          mobileOpen={mobileSidebarOpen}
          onToggleMobile={() => {
            setMobileSidebarOpen(!mobileSidebarOpen);
          }}
        />

        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
          {activeTab === 'analytics' && (
            <AnalyticsTab
              apiAnalytics={apiAnalytics}
              orders={orders}
              products={products}
              categories={categories}
              isMounted={isMounted}
              selectedProductAnalysis={selectedProductAnalysis}
              isLoadingProductAnalysis={isLoadingProductAnalysis}
              onAnalyzeProduct={handleAnalyzeProduct}
              onCloseProductAnalysis={() => {
                setSelectedProductAnalysis(null);
              }}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              displayedProducts={products}
              loadProducts={loadProducts}
              isRefreshingProducts={isRefreshingProducts}
              showAddProduct={showAddProduct}
              setShowAddProduct={setShowAddProduct}
              newProduct={newProduct}
              setNewProduct={setNewProduct}
              categories={categories}
              newProductImages={newProductImages}
              setNewProductImages={setNewProductImages}
              handleAddProduct={handleAddProduct}
              handleNewProductImagesChange={handleNewProductImagesChange}
              handleImageDragStart={handleImageDragStart}
              handleImageDragOver={handleImageDragOver}
              handleImageDrop={handleImageDrop}
              draggedImgIdx={draggedImgIdx}
              dragOverImgIdx={dragOverImgIdx}
              handleQuickUpdateProduct={handleQuickUpdateProduct}
              setEditingProduct={setEditingProduct}
              handleDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab
              products={products}
              isRefreshingProducts={isRefreshingProducts}
              onRefreshProducts={loadProducts}
              onUpdateProductInventory={handleUpdateProductInventory}
              showNotice={showNotice}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab
              categoryItems={categoryItems}
              products={products}
              isRefreshingCategories={isRefreshingCategories}
              onRefreshCategories={loadCategories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'queries' && (
            <QueriesTab
              queries={queries}
              isRefreshingQueries={isRefreshingQueries}
              onRefreshQueries={loadQueries}
              onToggleQueryStatus={handleToggleQueryStatus}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              isRefreshingOrders={isRefreshingOrders}
              onRefreshOrders={loadOrders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === 'promotions' && (
            <PromotionsTab
              promotionsList={promotionsList}
              loadPromotions={loadPromotions}
              showNotice={showNotice}
              uploadToCloudinary={uploadToCloudinary}
            />
          )}
        </div>
      </main>

      <EditProductModal
        editingProduct={editingProduct}
        categories={categories}
        onClose={() => {
          setEditingProduct(null);
        }}
        onSave={handleEditProduct}
        setEditingProduct={setEditingProduct}
        handleEditProductImagesChange={handleEditProductImagesChange}
        handleRemoveEditProductImage={handleRemoveEditProductImage}
        handleImageDragStart={handleImageDragStart}
        handleImageDragOver={handleImageDragOver}
        handleImageDrop={handleImageDrop}
        draggedImgIdx={draggedImgIdx}
        dragOverImgIdx={dragOverImgIdx}
      />
    </div>
  );
}
