'use client';

import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import {
  Lock,
  ShieldAlert,
  Sparkles,
  Plus,
  Trash2,
  MessageSquare,
  Layers,
  Activity,
  Check,
  ExternalLink,
  UserCheck,
  AlertCircle,
  Database,
  ArrowLeft,
  X,
  LogOut,
  ShoppingBag,
  Clock,
  TrendingUp,
  ArrowUpRight,
  DollarSign,
  Percent,
  Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import DropdownField from '@/components/ui/DropdownField';
import { authClient } from '@/lib/auth-client';
import { products as staticProducts, Product } from '@/lib/products';

interface ContactQuery {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  inquiryType: string;
  message: string;
  date: string;
  status: string;
}

interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    type: string;
  };
  quantity: number;
}

interface OrderData {
  orderId: string;
  paymentId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingForm: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  };
  date: string;
  isMock?: boolean;
  status: 'pending' | 'confirmed' | 'cancelled';
  hasRxItems?: boolean;
  rxFileName?: string | null;
}

const sampleQueries = [
  {
    id: 'query_sample_1',
    firstName: 'Dr. Evelyn',
    lastName: 'Chen',
    email: 'e.chen@bostonspecialists.org',
    company: 'Boston Pulmonary Specialists',
    inquiryType: 'Product Support',
    message:
      'Hello, we are review-testing the Respira Inhaler Pro for a clinical trial cohort. Could you provide detailed raw reports on the HFA Propellant gas deposition rates and thermal tolerances?',
    date: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    status: 'pending',
  },
  {
    id: 'query_sample_2',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'm.vance@wellnessdistributors.co',
    company: 'Apex Health Holdings',
    inquiryType: 'Partnerships & Wholesale',
    message:
      'Greetings, I would like to inquire about B2B bulk pricing discounts for OsteoFlex Advanced and Cardiostatin 40mg. We distribute to 120 retail pharmacies across northern India and seek a direct supply pipeline.',
    date: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    status: 'pending',
  },
  {
    id: 'query_sample_3',
    firstName: 'Sarah',
    lastName: 'Gomez',
    email: 'sarah.g@clinicaltrials.net',
    company: 'Neuro Labs Inc.',
    inquiryType: 'Press & Media',
    message:
      'We are publishing a paper on donepezil hydrochloride sustained-release formulations. We would like to request permission to use your NeuroCognin XR molecular layout diagram in our review.',
    date: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    status: 'resolved',
  },
];

const sampleOrders: OrderData[] = [
  {
    orderId: 'WILL-593810',
    paymentId: 'pay_mock_ABC123XYZ789',
    items: [
      {
        product: {
          id: 'respira-inhaler-pro',
          name: 'Respira Inhaler Pro',
          price: 3735.0,
          image: '/images/respira-inhaler.png',
          type: 'Prescription (Rx)',
        },
        quantity: 2,
      },
      {
        product: {
          id: 'osteo-flex-advanced',
          name: 'OsteoFlex Advanced',
          price: 2074.17,
          image: '/images/osteoflex.png',
          type: 'Over-The-Counter (OTC)',
        },
        quantity: 1,
      },
    ],
    subtotal: 9544.17,
    shipping: 0,
    tax: 954.42,
    total: 10498.59,
    shippingForm: {
      fullName: 'Aarav Mehta',
      email: 'aarav.mehta@gmail.com',
      phone: '+91 98765 43210',
      address: '45, Silver Oak Apartments, HSR Layout',
      city: 'Bengaluru',
      zipCode: '560102',
    },
    date: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    isMock: true,
    status: 'pending',
    hasRxItems: true,
    rxFileName: 'asthma_rx_certified_final.pdf',
  },
  {
    orderId: 'WILL-284719',
    paymentId: 'pay_mock_MNO456PQR123',
    items: [
      {
        product: {
          id: 'cardiostatin-40',
          name: 'Cardiostatin 40mg',
          price: 4855.5,
          image: '/images/cardiostatin.png',
          type: 'Prescription (Rx)',
        },
        quantity: 1,
      },
    ],
    subtotal: 4855.5,
    shipping: 0,
    tax: 485.55,
    total: 5341.05,
    shippingForm: {
      fullName: 'Priya Sharma',
      email: 'priya.sharma@yahoo.com',
      phone: '+91 91234 56789',
      address: 'B-102, Shanti Kunj, Sector 56',
      city: 'Gurugram',
      zipCode: '122011',
    },
    date: new Date(Date.now() - 3600000 * 26).toISOString(), // 26 hours ago
    isMock: true,
    status: 'confirmed',
    hasRxItems: true,
    rxFileName: 'cholesterol_compliance_rx.pdf',
  },
  {
    orderId: 'WILL-103948',
    paymentId: 'pay_mock_DEF789GHI456',
    items: [
      {
        product: {
          id: 'pediacetamol-suspension',
          name: 'PediaCetamol Suspension',
          price: 1224.25,
          image: '/images/pediacetamol.png',
          type: 'Over-The-Counter (OTC)',
        },
        quantity: 3,
      },
    ],
    subtotal: 3672.75,
    shipping: 400,
    tax: 367.28,
    total: 4440.03,
    shippingForm: {
      fullName: 'Rohan Verma',
      email: 'rohan.v@gmail.com',
      phone: '+91 88888 77777',
      address: '7C, Marine Drive, Near Wankhede',
      city: 'Mumbai',
      zipCode: '400020',
    },
    date: new Date(Date.now() - 3600000 * 50).toISOString(), // 2 days ago
    isMock: true,
    status: 'cancelled',
    hasRxItems: false,
    rxFileName: null,
  },
];

const ChartDefs = () => (
  <defs>
    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#00b074" stopOpacity={0.25} />
      <stop offset="100%" stopColor="#00b074" stopOpacity={0.0} />
    </linearGradient>
    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#1e3a8a" stopOpacity={0.85} />
      <stop offset="100%" stopColor="#00b074" stopOpacity={0.85} />
    </linearGradient>
  </defs>
);

export default function AdminPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Dashboard state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'products' | 'categories' | 'queries' | 'orders' | 'promotions'
  >('analytics');
  // Promotions Banner state
  const [promoImage, setPromoImage] = useState('/images/default-promo-banner.png');
  const [promoLink, setPromoLink] = useState('/products');
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    'all' | 'pending' | 'confirmed' | 'cancelled'
  >('all');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState('');

  // Auth state
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Form states - Products
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    type: 'Over-The-Counter (OTC)',
    price: '',
    description: '',
    benefits: '',
    ingredients: '',
    image: '',
    tags: '',
  });

  // Form states - Categories
  const [newCategory, setNewCategory] = useState('');

  // Form states - Edit product modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProductImages, setNewProductImages] = useState<string[]>([]);

  const handleNewProductImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const slotsAvailable = 6 - newProductImages.length;
    if (slotsAvailable <= 0) {
      alert('Maximum 6 images allowed.');
      return;
    }
    const filesLimit = files.slice(0, slotsAvailable);
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
        setNewProductImages((prev) => [...prev, ...base64s].slice(0, 6));
      })
      .catch((err: unknown) => {
        console.error('Error reading product files:', err);
      });
  };

  const handleEditProductImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !editingProduct) return;
    const files = Array.from(e.target.files);
    const currentImgs = editingProduct.images || [editingProduct.image];
    const slotsAvailable = 6 - currentImgs.length;
    if (slotsAvailable <= 0) {
      alert('Maximum 6 images allowed.');
      return;
    }
    const filesLimit = files.slice(0, slotsAvailable);
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
        setEditingProduct((prev) => {
          if (!prev) return null;
          const oldImgs = prev.images || [prev.image];
          const newImgs = [...oldImgs, ...base64s].slice(0, 6);
          return {
            ...prev,
            image: newImgs[0] || prev.image,
            images: newImgs,
          };
        });
      })
      .catch((err: unknown) => {
        console.error('Error reading edit product files:', err);
      });
  };

  const handleRemoveEditProductImage = (idx: number) => {
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

  // Initialize data
  useEffect(() => {
    // Products
    const savedProducts = localStorage.getItem('admin_products');
    let prods = staticProducts;
    if (savedProducts) {
      try {
        prods = JSON.parse(savedProducts) as Product[];
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('admin_products', JSON.stringify(staticProducts));
    }
    setProducts(prods);

    // Categories
    const savedCategories = localStorage.getItem('admin_categories');
    let cats: string[] = [];
    if (savedCategories) {
      try {
        cats = JSON.parse(savedCategories) as string[];
      } catch (e) {
        console.error(e);
      }
    } else {
      const uniqueCats = Array.from(new Set(prods.map((p) => p.category)));
      cats = ['All', ...uniqueCats];
      localStorage.setItem('admin_categories', JSON.stringify(cats));
    }
    setCategories(cats);

    // Queries
    const savedQueries = localStorage.getItem('contact_queries');
    let qList: ContactQuery[] = [];
    if (savedQueries) {
      try {
        qList = JSON.parse(savedQueries) as ContactQuery[];
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default to sample queries on clean load
      localStorage.setItem('contact_queries', JSON.stringify(sampleQueries));
      qList = sampleQueries;
    }
    setQueries(qList);

    // Orders
    const savedOrders = localStorage.getItem('orders_history');
    let ordList: OrderData[] = [];
    if (savedOrders) {
      try {
        ordList = JSON.parse(savedOrders) as OrderData[];
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('orders_history', JSON.stringify(sampleOrders));
      ordList = sampleOrders;
    }
    setOrders(ordList);

    // Banner config
    const savedPromoImage = localStorage.getItem('admin_promo_banner_image');
    if (savedPromoImage) {
      setPromoImage(savedPromoImage);
    }
    const savedPromoLink = localStorage.getItem('admin_promo_banner_link');
    if (savedPromoLink) {
      setPromoLink(savedPromoLink);
    }

    setIsMounted(true);
  }, []);

  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: 'confirmed' | 'cancelled' | 'pending',
  ) => {
    const updated = orders.map((o) => {
      if (o.orderId === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem('orders_history', JSON.stringify(updated));
  };

  const handleLoadSampleOrders = () => {
    localStorage.setItem('orders_history', JSON.stringify(sampleOrders));
    setOrders(sampleOrders);
  };

  // Handle Demo Admin Login
  const handleDemoAdminLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      // First try to sign in
      await authClient.signIn.email({
        email: 'admin@thewellness.com',
        password: 'adminpassword',
      });
    } catch {
      // If sign in fails (e.g. user does not exist), try to sign up
      try {
        await authClient.signUp.email({
          email: 'admin@thewellness.com',
          password: 'adminpassword',
          name: 'Chief Admin Officer',
        });

        // Log in again after successful registration
        await authClient.signIn.email({
          email: 'admin@thewellness.com',
          password: 'adminpassword',
        });
      } catch (signupErr) {
        const msg = signupErr instanceof Error ? signupErr.message : 'Failed to authenticate admin';
        setLoginError(msg);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Add Product handler
  const handleAddProduct = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert('Please fill in the required fields: Name, Price, and Category.');
      return;
    }

    const priceNum = parseFloat(newProduct.price);
    if (isNaN(priceNum)) {
      alert('Price must be a valid number.');
      return;
    }

    const slug = newProduct.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');

    // Check if slug already exists
    if (products.some((p) => p.id === slug)) {
      alert('A product with a similar name already exists. Please choose a unique name.');
      return;
    }

    const mainImg =
      newProductImages.length > 0
        ? newProductImages[0]
        : newProduct.image || '/images/cardiostatin.png';
    const allImgs = newProductImages.length > 0 ? newProductImages : [mainImg];

    const createdProduct: Product = {
      id: slug,
      name: newProduct.name,
      category: newProduct.category,
      type: newProduct.type as 'Prescription (Rx)' | 'Over-The-Counter (OTC)',
      description: newProduct.description || 'No description provided.',
      benefits: newProduct.benefits ? newProduct.benefits.split(',').map((b) => b.trim()) : [],
      ingredients: newProduct.ingredients
        ? newProduct.ingredients.split(',').map((i) => i.trim())
        : [],
      image: mainImg,
      images: allImgs,
      price: priceNum,
      tags: newProduct.tags ? newProduct.tags.split(',').map((t) => t.trim().toLowerCase()) : [],
    };

    const updated = [...products, createdProduct];
    setProducts(updated);
    localStorage.setItem('admin_products', JSON.stringify(updated));

    // Clear form
    setNewProduct({
      name: '',
      category: '',
      type: 'Over-The-Counter (OTC)',
      price: '',
      description: '',
      benefits: '',
      ingredients: '',
      image: '',
      tags: '',
    });
    setNewProductImages([]);
    setShowAddProduct(false);

    // If new category, add it automatically
    if (!categories.includes(newProduct.category)) {
      const updatedCats = [...categories, newProduct.category];
      setCategories(updatedCats);
      localStorage.setItem('admin_categories', JSON.stringify(updatedCats));
    }
  };

  // Edit Product handler
  const handleEditProduct = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
    setProducts(updated);
    localStorage.setItem('admin_products', JSON.stringify(updated));
    setEditingProduct(null);
  };

  // Delete Product
  const handleDeleteProduct = (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action is irreversible.')) {
      return;
    }
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem('admin_products', JSON.stringify(updated));
  };

  // Add Category
  const handleAddCategory = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const cleanCat = newCategory.trim();
    if (!cleanCat) return;

    if (categories.includes(cleanCat)) {
      alert('Category already exists.');
      return;
    }

    const updated = [...categories, cleanCat];
    setCategories(updated);
    localStorage.setItem('admin_categories', JSON.stringify(updated));
    setNewCategory('');
  };

  // Delete Category
  const handleDeleteCategory = (cat: string) => {
    if (cat === 'All') {
      alert('The root "All" category cannot be removed.');
      return;
    }
    // Warn if products are assigned
    const assignedProds = products.filter((p) => p.category === cat);
    if (assignedProds.length > 0) {
      if (
        !confirm(
          `Warning: There are ${assignedProds.length.toString()} products currently categorized under "${cat}". Deleting this category will leave them orphaned. Proceed?`,
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to delete category "${cat}"?`)) {
        return;
      }
    }

    const updated = categories.filter((c) => c !== cat);
    setCategories(updated);
    localStorage.setItem('admin_categories', JSON.stringify(updated));
  };

  // Toggle Query Status
  const toggleQueryStatus = (id: string) => {
    const updated = queries.map((q) => {
      if (q.id === id) {
        return {
          ...q,
          status: q.status === 'pending' ? 'resolved' : 'pending',
        };
      }
      return q;
    });
    setQueries(updated);
    localStorage.setItem('contact_queries', JSON.stringify(updated));
  };

  // Load sample queries
  const handleLoadSampleQueries = () => {
    localStorage.setItem('contact_queries', JSON.stringify(sampleQueries));
    setQueries(sampleQueries);
  };

  // Reset Products to Default
  const handleResetToDefaultCatalog = () => {
    if (confirm('Reset catalog to static defaults? This will erase all custom added products.')) {
      localStorage.setItem('admin_products', JSON.stringify(staticProducts));
      setProducts(staticProducts);

      const uniqueCats = Array.from(new Set(staticProducts.map((p) => p.category)));
      const defaultCats = ['All', ...uniqueCats];
      localStorage.setItem('admin_categories', JSON.stringify(defaultCats));
      setCategories(defaultCats);
    }
  };

  if (sessionLoading) {
    return (
      <div className="bg-wellness-white min-h-screen pt-12 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-wellness-green/30 border-t-wellness-green rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-wellness-charcoal/60">
          Verifying administrator authorization...
        </p>
      </div>
    );
  }

  // Access Gate
  const isAdmin = session?.user.email === 'admin@thewellness.com';

  if (!isAdmin) {
    return (
      <div className="bg-wellness-white min-h-screen pt-12 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-wellness-gray-200 rounded-3xl p-8 shadow-xl relative overflow-hidden glass-premium">
          <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>

          <div className="w-16 h-16 bg-red-50 text-red-500 border border-red-100 rounded-2xl flex items-center justify-center mb-6">
            <Lock size={28} />
          </div>

          <h1 className="text-3xl font-heading font-extrabold text-wellness-navy mb-3">
            Admin Access Denied
          </h1>

          <p className="text-sm text-wellness-charcoal/60 leading-relaxed font-semibold mb-6">
            This module is reserved for Clinical Administrators. Unauthorized credentials detected.
          </p>

          {session && (
            <div className="mb-6 p-4 rounded-2xl bg-wellness-gray-50 border border-wellness-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-wellness-navy/5 flex items-center justify-center font-bold text-xs text-wellness-navy uppercase shrink-0">
                {session.user.name.slice(0, 2) || 'US'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-wellness-navy truncate">
                  {session.user.name}
                </p>
                <p className="text-[10px] text-wellness-charcoal/50 truncate font-semibold">
                  {session.user.email}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => {
                void handleDemoAdminLogin();
              }}
              disabled={isLoggingIn}
              className="w-full bg-wellness-navy hover:bg-wellness-green text-white font-bold text-sm py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <UserCheck size={16} />
                  Sign In as Demo Admin
                </>
              )}
            </button>

            <Link
              href="/"
              className="w-full border border-wellness-gray-200 hover:bg-wellness-gray-50 text-wellness-navy font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              Return to Website
            </Link>
          </div>

          {loginError && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex gap-2 items-center">
              <AlertCircle size={16} />
              <span>{loginError}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calculate quick stats
  const _pendingQueriesCount = queries.filter((q) => q.status === 'pending').length;

  // Render Analytics View
  const renderAnalytics = () => {
    const totalOrdersCount = orders.length;
    const confirmedOrders = orders.filter((o) => o.status === 'confirmed');
    const pendingOrders = orders.filter((o) => o.status === 'pending');

    const totalRevenueVal = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingRevenueVal = pendingOrders.reduce((sum, o) => sum + o.total, 0);
    const confirmedRevenueVal = confirmedOrders.reduce((sum, o) => sum + o.total, 0);

    const averageOrderValue = totalOrdersCount > 0 ? totalRevenueVal / totalOrdersCount : 0;

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const chartData = last7Days.map((dateObj) => {
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayStart = new Date(dateObj.setHours(0, 0, 0, 0));
      const dayEnd = new Date(dateObj.setHours(23, 59, 59, 999));

      const actualSales = orders
        .filter((o) => {
          const oDate = new Date(o.date);
          return oDate >= dayStart && oDate <= dayEnd && o.status !== 'cancelled';
        })
        .reduce((sum, o) => sum + o.total, 0);

      const baselineSeed = (dateObj.getDate() * 17) % 7;
      const baseSales = (baselineSeed + 1) * 3500 + 4000;
      const totalDaySales = baseSales + actualSales;

      return {
        date: dateStr,
        sales: totalDaySales,
        ordersCount: Math.round(totalDaySales / 4500),
      };
    });

    const categoryChartData = categories
      .filter((cat) => cat !== 'All')
      .map((cat, i) => {
        const count = products.filter((p) => p.category === cat).length;
        const seed = ((i * 23) % 5) + 1;
        const unitsSold = count * 12 + seed * 8;
        const revenue = unitsSold * 2450;
        return {
          category: cat,
          unitsSold,
          revenue,
        };
      });

    const maxCategoryRevenue = Math.max(...categoryChartData.map((c) => c.revenue)) * 1.1 || 10000;
    const barChartWidth = 600;
    const barChartHeight = 220;
    const barPaddingLeft = 50;
    const barPaddingRight = 20;
    const barPaddingTop = 20;
    const barPaddingBottom = 30;

    const barGraphWidth = barChartWidth - barPaddingLeft - barPaddingRight;
    const barGraphHeight = barChartHeight - barPaddingTop - barPaddingBottom;

    const barWidth = 28;
    const _bars = categoryChartData.map((d, i) => {
      const columnCount = categoryChartData.length || 1;
      const x = barPaddingLeft + ((i + 0.5) / columnCount) * barGraphWidth;
      const h = (d.revenue / maxCategoryRevenue) * barGraphHeight;
      const y = barPaddingTop + barGraphHeight - h;
      return {
        category: d.category,
        revenue: d.revenue,
        unitsSold: d.unitsSold,
        x: x - barWidth / 2,
        y,
        width: barWidth,
        height: h,
      };
    });

    const productAnalytics = products
      .map((prod) => {
        let unitsSold = 0;
        orders.forEach((ord) => {
          if (ord.status !== 'cancelled') {
            ord.items.forEach((item) => {
              if (item.product.id === prod.id) {
                unitsSold += item.quantity;
              }
            });
          }
        });

        const stableSeed = (prod.name.length * 7) % 20;
        const baseUnits = stableSeed + 5;
        const totalUnits = baseUnits + unitsSold;
        const totalRevenue = totalUnits * prod.price;

        const growthRate = (((stableSeed * 3.1) % 25) + 5).toFixed(1);
        const isPositive = stableSeed % 3 !== 0;
        const stock = 150 - totalUnits > 10 ? 150 - totalUnits : 15;

        return {
          ...prod,
          unitsSold: totalUnits,
          revenue: totalRevenue,
          growthRate: `${isPositive ? '+' : '-'}${growthRate}%`,
          isPositive,
          stock,
        };
      })
      .filter((prod) => prod.name.toLowerCase().includes(analyticsSearchQuery.toLowerCase()))
      .sort((a, b) => b.revenue - a.revenue);

    return (
      <motion.div
        key="analytics"
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={{
          hidden: { opacity: 0, y: 15 },
          enter: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.5,
              ease: 'easeOut',
              staggerChildren: 0.08,
            },
          },
          exit: { opacity: 0, y: -15, transition: { duration: 0.3, ease: 'easeIn' } },
        }}
        className="space-y-8"
      >
        {/* Analytics Header */}
        <div>
          <h3 className="text-xl font-heading font-black text-wellness-navy flex items-center gap-2">
            <TrendingUp size={22} className="text-wellness-green" />
            Performance & Insights Dashboard
          </h3>
          <p className="text-xs text-wellness-charcoal/60 mt-0.5 font-medium">
            Analyze therapeutics demand, revenue distributions, and dynamic product growth trends.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            enter: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              enter: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 100, damping: 15 },
              },
            }}
            className="bg-white border border-wellness-gray-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-wellness-charcoal/40 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-wellness-green/10 text-wellness-green flex items-center justify-center">
                <DollarSign size={16} />
              </div>
            </div>
            <p className="text-3xl font-heading font-black text-wellness-navy">
              ₹{totalRevenueVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-wellness-green">
              <ArrowUpRight size={12} />
              <span>+14.8% growth</span>
              <span className="text-wellness-charcoal/40 font-semibold font-mono ml-1">
                vs last month
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              enter: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 100, damping: 15 },
              },
            }}
            className="bg-white border border-wellness-gray-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-wellness-charcoal/40 uppercase tracking-wider">
                Confirmed Sales
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
            </div>
            <p className="text-3xl font-heading font-black text-wellness-navy">
              ₹{confirmedRevenueVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-blue-600">
              <span>{confirmedOrders.length} Confirmed Orders</span>
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              enter: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 100, damping: 15 },
              },
            }}
            className="bg-white border border-wellness-gray-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-wellness-charcoal/40 uppercase tracking-wider">
                Average Order Value
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <Percent size={16} />
              </div>
            </div>
            <p className="text-3xl font-heading font-black text-wellness-navy">
              ₹{averageOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-indigo-600">
              <span>Stable Care Basket Pricing</span>
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              enter: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 100, damping: 15 },
              },
            }}
            className="bg-white border border-wellness-gray-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-wellness-charcoal/40 uppercase tracking-wider">
                Pending Approvals
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <p className="text-3xl font-heading font-black text-wellness-navy">
              {pendingOrders.length}
            </p>
            <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-amber-600">
              <span>
                ₹{pendingRevenueVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })} under
                review
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            enter: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5, ease: 'easeOut' } },
          }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Sales Revenue Trend Chart (MUI Line Chart) */}
          <div className="bg-white border border-wellness-gray-200/80 p-6 rounded-3xl shadow-sm flex flex-col relative min-h-[320px]">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-wellness-navy">Sales Revenue Trend (7 Days)</h4>
              <p className="text-[10px] text-wellness-charcoal/50 font-medium">
                Daily cumulative secure sales in Rupees.
              </p>
            </div>

            <div className="relative w-full h-[220px] bg-slate-50/50 rounded-2xl border border-slate-100 p-2 overflow-hidden flex items-center justify-center">
              {!isMounted ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-wellness-green/30 border-t-wellness-green rounded-full animate-spin"></div>
                  <span className="text-[10px] text-wellness-charcoal/40 font-semibold">
                    Loading interactive analytics...
                  </span>
                </div>
              ) : (
                <LineChart
                  xAxis={[
                    {
                      data: chartData.map((d) => d.date),
                      scaleType: 'point',
                      tickLabelStyle: {
                        fontSize: 9,
                        fontWeight: 'bold',
                        fill: '#64748b',
                      },
                    },
                  ]}
                  yAxis={[
                    {
                      valueFormatter: (val: number) => `₹${(val / 1000).toFixed(0)}k`,
                      tickLabelStyle: {
                        fontSize: 9,
                        fontWeight: 'bold',
                        fill: '#64748b',
                      },
                    },
                  ]}
                  series={[
                    {
                      data: chartData.map((d) => d.sales),
                      label: 'Sales (₹)',
                      color: '#00b074',
                      valueFormatter: (value: number | null) =>
                        value !== null ? `₹${value.toLocaleString('en-IN')}` : '',
                      area: true,
                    },
                  ]}
                  height={220}
                  margin={{ left: 55, right: 15, top: 15, bottom: 30 }}
                  slotProps={{
                    legend: { hidden: true } as object,
                  }}
                  sx={{
                    width: '100%',
                    '.MuiLineElement-root': {
                      strokeWidth: 3,
                    },
                    '.MuiAreaElement-root': {
                      fill: 'url(#salesGrad)',
                    },
                    '.MuiMarkElement-root': {
                      stroke: '#00b074',
                      strokeWidth: 2,
                      fill: '#ffffff',
                      scale: '0.8',
                      transition: 'scale 0.2s',
                      '&:hover': {
                        scale: '1.2',
                      },
                    },
                    '& .MuiChartsAxis-line': {
                      stroke: '#e2e8f0',
                    },
                    '& .MuiChartsAxis-tick': {
                      stroke: '#e2e8f0',
                    },
                  }}
                >
                  <ChartDefs />
                </LineChart>
              )}
            </div>
          </div>

          {/* Category Sales Distribution (MUI Bar Chart) */}
          <div className="bg-white border border-wellness-gray-200/80 p-6 rounded-3xl shadow-sm flex flex-col relative min-h-[320px]">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-wellness-navy">Therapeutic Category Growth</h4>
              <p className="text-[10px] text-wellness-charcoal/50 font-medium">
                Estimated sales performance by therapy area.
              </p>
            </div>

            <div className="relative w-full h-[220px] bg-slate-50/50 rounded-2xl border border-slate-100 p-2 overflow-hidden flex items-center justify-center">
              {!isMounted ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-wellness-green/30 border-t-wellness-green rounded-full animate-spin"></div>
                  <span className="text-[10px] text-wellness-charcoal/40 font-semibold">
                    Loading interactive analytics...
                  </span>
                </div>
              ) : (
                <BarChart
                  xAxis={[
                    {
                      data: categoryChartData.map((d) => d.category),
                      scaleType: 'band',
                      tickLabelStyle: {
                        fontSize: 8,
                        fontWeight: 'bold',
                        fill: '#64748b',
                      },
                    },
                  ]}
                  yAxis={[
                    {
                      valueFormatter: (val: number) => `₹${(val / 1000).toFixed(0)}k`,
                      tickLabelStyle: {
                        fontSize: 9,
                        fontWeight: 'bold',
                        fill: '#64748b',
                      },
                    },
                  ]}
                  series={[
                    {
                      data: categoryChartData.map((d) => d.revenue),
                      label: 'Revenue (₹)',
                      valueFormatter: (value: number | null) =>
                        value !== null ? `₹${value.toLocaleString('en-IN')}` : '',
                    },
                  ]}
                  borderRadius={8}
                  height={220}
                  margin={{ left: 55, right: 15, top: 15, bottom: 30 }}
                  slotProps={{
                    legend: { hidden: true } as object,
                  }}
                  sx={{
                    width: '100%',
                    '.MuiBarElement-root': {
                      fill: 'url(#barGrad)',
                    },
                    '& .MuiChartsAxis-line': {
                      stroke: '#e2e8f0',
                    },
                    '& .MuiChartsAxis-tick': {
                      stroke: '#e2e8f0',
                    },
                  }}
                >
                  <ChartDefs />
                </BarChart>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sales and Growth Analytics Table */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            enter: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.35, duration: 0.5, ease: 'easeOut' },
            },
          }}
          className="bg-white border border-wellness-gray-200/80 rounded-3xl p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-wellness-gray-100 pb-4">
            <div>
              <h4 className="text-sm font-bold text-wellness-navy">
                Product Catalog Growth & Performance
              </h4>
              <p className="text-[10px] text-wellness-charcoal/50 font-medium">
                Inventory levels, sales counts, and calculated growth.
              </p>
            </div>

            <div className="w-full sm:w-64 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={analyticsSearchQuery}
                onChange={(e) => {
                  setAnalyticsSearchQuery(e.target.value);
                }}
                className="w-full px-4 py-2 text-xs font-semibold rounded-xl border border-wellness-gray-200 outline-none focus:border-wellness-green bg-wellness-gray-50/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-wellness-charcoal/80 border-collapse">
              <thead>
                <tr className="border-b border-wellness-gray-150 text-[10px] text-wellness-charcoal/40 uppercase tracking-widest font-black">
                  <th className="pb-3 pt-1">Product Details</th>
                  <th className="pb-3 pt-1 text-center">Category</th>
                  <th className="pb-3 pt-1 text-center">Units Dispatched</th>
                  <th className="pb-3 pt-1 text-center">Stock Level</th>
                  <th className="pb-3 pt-1 text-right">Revenue Yield</th>
                  <th className="pb-3 pt-1 text-right">Growth Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wellness-gray-100">
                {productAnalytics.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-10 text-wellness-charcoal/40 font-semibold"
                    >
                      No matching therapeutics found.
                    </td>
                  </tr>
                ) : (
                  productAnalytics.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-wellness-gray-50 border border-wellness-gray-200 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-wellness-navy">{prod.name}</p>
                          <p className="text-[10px] text-wellness-charcoal/40 font-mono mt-0.5">
                            {prod.type}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 text-center font-semibold text-wellness-charcoal/60">
                        {prod.category}
                      </td>
                      <td className="py-4 text-center font-bold text-wellness-navy font-mono">
                        {prod.unitsSold}
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                            prod.stock < 20
                              ? 'bg-red-50 text-red-500 border border-red-100'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}
                        >
                          {prod.stock} left
                        </span>
                      </td>
                      <td className="py-4 text-right font-black text-wellness-navy font-mono">
                        ₹
                        {prod.revenue.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={`py-4 text-right font-bold font-mono ${
                          prod.isPositive ? 'text-wellness-green' : 'text-red-500'
                        }`}
                      >
                        {prod.growthRate}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen flex text-wellness-charcoal font-sans">
      {/* Mobile Header Top-Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-wellness-gray-200 z-50 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-wellness-green text-wellness-navy flex items-center justify-center font-black">
            <Sparkles size={16} />
          </div>
          <span className="text-xs font-heading font-black tracking-wider text-wellness-navy">
            THE WELLNESS
          </span>
        </div>
        <button
          onClick={() => {
            setMobileSidebarOpen(!mobileSidebarOpen);
          }}
          className="w-10 h-10 rounded-xl bg-wellness-gray-50 flex items-center justify-center text-wellness-navy border border-wellness-gray-200 cursor-pointer"
        >
          {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Sidebar navigation */}
      <aside
        className={`w-64 bg-wellness-navy text-white flex flex-col fixed inset-y-0 left-0 z-40 border-r border-white/10 shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3 mt-16 lg:mt-0">
          <div className="w-10 h-10 rounded-xl bg-wellness-green text-wellness-navy flex items-center justify-center font-black shadow-inner">
            <Sparkles size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xs font-heading font-black tracking-wider uppercase text-white leading-none">
              THE WELLNESS
            </h2>
            <p className="text-[8px] text-white/40 font-extrabold uppercase tracking-widest mt-1">
              Admin Portal
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { id: 'analytics', label: 'Analytics Dashboard', icon: <TrendingUp size={15} /> },
            { id: 'products', label: 'Products Catalog', icon: <Activity size={15} /> },
            { id: 'categories', label: 'Categories Management', icon: <Layers size={15} /> },
            {
              id: 'queries',
              label: `Customer Inquiries (${queries.length.toString()})`,
              icon: <MessageSquare size={15} />,
            },
            {
              id: 'orders',
              label: `Orders Control (${orders.length.toString()})`,
              icon: <ShoppingBag size={15} />,
            },
            { id: 'promotions', label: 'Promotions & Banners', icon: <Percent size={15} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(
                    tab.id as
                      'analytics' | 'products' | 'categories' | 'queries' | 'orders' | 'promotions',
                  );
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                  isActive
                    ? 'bg-wellness-green text-wellness-navy shadow-lg shadow-wellness-green/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile brief & Footer controls */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-wellness-green/10 text-wellness-green flex items-center justify-center font-bold text-xs uppercase shrink-0">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold text-white truncate">Administrator</p>
              <p className="text-[8px] text-white/40 truncate font-semibold">
                admin@thewellness.com
              </p>
            </div>
          </div>

          <button
            onClick={handleResetToDefaultCatalog}
            className="w-full flex items-center justify-center gap-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 py-2.5 rounded-xl text-[9px] font-bold transition-all cursor-pointer border border-white/5"
          >
            <Database size={12} />
            <span>Reset Catalog</span>
          </button>

          <button
            onClick={() => {
              void authClient.signOut();
            }}
            className="w-full flex items-center justify-center gap-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 py-2.5 rounded-xl text-[9px] font-bold transition-all cursor-pointer"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pl-0 lg:pl-64 min-h-screen flex flex-col bg-wellness-white pt-16 lg:pt-0">
        {/* Top Header Bar */}
        <header className="hidden lg:flex h-16 border-b border-wellness-gray-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-8 items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-black text-wellness-green tracking-widest bg-wellness-green/10 px-3 py-1 rounded-full border border-wellness-green/20">
              Clinical Control Center
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-wellness-charcoal/40">
            <span className="font-mono">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* Dashboard Inner View */}
        <div className="p-6 md:p-10 max-w-[1600px] w-full mx-auto flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && renderAnalytics()}

            {/* Tab 1: Products */}
            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-heading font-bold text-wellness-navy flex items-center gap-2">
                    <Database size={18} className="text-wellness-green" />
                    Product Inventory
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddProduct(!showAddProduct);
                    }}
                    className="bg-wellness-green hover:bg-wellness-navy text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    {showAddProduct ? <X size={14} /> : <Plus size={14} />}
                    {showAddProduct ? 'Cancel Form' : 'Add New Product'}
                  </button>
                </div>

                {/* Add Product Form Card */}
                <AnimatePresence>
                  {showAddProduct && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white border border-wellness-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden"
                    >
                      <form onSubmit={handleAddProduct} className="space-y-6">
                        <h4 className="text-sm font-extrabold text-wellness-navy uppercase tracking-wider border-b border-wellness-gray-100 pb-2">
                          Create New Clinical Therapy
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                              Product Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Cardiospan-XR"
                              value={newProduct.name}
                              onChange={(e) => {
                                setNewProduct((prev) => ({ ...prev, name: e.target.value }));
                              }}
                              className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <DropdownField
                              label="Category / Therapeutic Area"
                              options={[
                                ...categories
                                  .filter((c) => c !== 'All')
                                  .map((cat) => ({ value: cat, label: cat })),
                                { value: 'New Category', label: '+ Add New Category below' },
                              ]}
                              selectedValue={newProduct.category}
                              onChange={(val) => {
                                setNewProduct((prev) => ({ ...prev, category: val }));
                              }}
                              required
                            />
                            {newProduct.category === 'New Category' && (
                              <input
                                type="text"
                                required
                                placeholder="Enter custom category"
                                onChange={(e) => {
                                  setNewProduct((prev) => ({ ...prev, category: e.target.value }));
                                }}
                                className="mt-2 w-full px-4 py-2.5 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold animate-in fade-in duration-200"
                              />
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                              Price in INR (₹) *
                            </label>
                            <input
                              type="number"
                              required
                              placeholder="e.g. 4500"
                              value={newProduct.price}
                              onChange={(e) => {
                                setNewProduct((prev) => ({ ...prev, price: e.target.value }));
                              }}
                              className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <DropdownField
                              label="Prescription Type"
                              options={[
                                {
                                  value: 'Over-The-Counter (OTC)',
                                  label: 'Over-The-Counter (OTC)',
                                },
                                { value: 'Prescription (Rx)', label: 'Prescription (Rx)' },
                              ]}
                              selectedValue={newProduct.type}
                              onChange={(val) => {
                                setNewProduct((prev) => ({ ...prev, type: val }));
                              }}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                              Image Source URL (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. /images/products/cardio.png (leave blank for default)"
                              value={newProduct.image}
                              onChange={(e) => {
                                setNewProduct((prev) => ({ ...prev, image: e.target.value }));
                              }}
                              className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
                            />
                          </div>
                        </div>

                        {/* Image Upload Gallery (Max 6) */}
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
                                onChange={handleNewProductImagesChange}
                                className="hidden"
                              />
                            </label>

                            {newProductImages.map((img, idx) => (
                              <div
                                key={idx}
                                className="relative w-24 h-24 rounded-xl overflow-hidden border border-wellness-gray-200 group bg-wellness-gray-50 shrink-0"
                              >
                                <img
                                  src={img}
                                  alt={`Preview ${(idx + 1).toString()}`}
                                  className="object-cover w-full h-full"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewProductImages((prev) => prev.filter((_, i) => i !== idx));
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm focus:outline-none"
                                >
                                  ×
                                </button>
                                <div className="absolute bottom-0 inset-x-0 bg-wellness-navy/80 text-[8px] font-extrabold uppercase text-center text-white py-0.5">
                                  {idx === 0 ? 'Cover' : `Img ${(idx + 1).toString()}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                            Description *
                          </label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Provide detailed clinical drug description..."
                            value={newProduct.description}
                            onChange={(e) => {
                              setNewProduct((prev) => ({ ...prev, description: e.target.value }));
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
                              placeholder="e.g. Rapid heart stability, Lowers LDL, Once-daily dosing"
                              value={newProduct.benefits}
                              onChange={(e) => {
                                setNewProduct((prev) => ({ ...prev, benefits: e.target.value }));
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
                              placeholder="e.g. Atorvastatin 20mg, Cellulose matrix, Calcium"
                              value={newProduct.ingredients}
                              onChange={(e) => {
                                setNewProduct((prev) => ({ ...prev, ingredients: e.target.value }));
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
                            placeholder="e.g. statin, heart, cholesterol, cardiovascular"
                            value={newProduct.tags}
                            onChange={(e) => {
                              setNewProduct((prev) => ({ ...prev, tags: e.target.value }));
                            }}
                            className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-wellness-navy hover:bg-wellness-green text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer shadow"
                        >
                          Publish Product
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Products Table/Grid list */}
                <div className="bg-white border border-wellness-gray-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-wellness-gray-50 border-b border-wellness-gray-200 text-[10px] font-extrabold text-wellness-charcoal/40 uppercase tracking-widest">
                          <th className="p-5">Product Details</th>
                          <th className="p-5">Therapeutic Area</th>
                          <th className="p-5">Classification</th>
                          <th className="p-5">Price</th>
                          <th className="p-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wellness-gray-100 text-xs font-semibold text-wellness-navy">
                        {products.map((product) => (
                          <tr
                            key={product.id}
                            className="hover:bg-wellness-gray-50/50 transition-colors"
                          >
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-wellness-gray-100 overflow-hidden relative shrink-0 border border-wellness-gray-200">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div>
                                  <h5 className="font-extrabold text-sm">{product.name}</h5>
                                  <span className="text-[10px] text-wellness-charcoal/40 font-semibold font-mono">
                                    ID: {product.id}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-5">
                              <span className="bg-wellness-green/10 text-wellness-green px-2.5 py-1 rounded text-[10px] font-extrabold uppercase">
                                {product.category}
                              </span>
                            </td>
                            <td className="p-5">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${
                                  product.type === 'Prescription (Rx)'
                                    ? 'bg-red-50 text-red-500 border border-red-100'
                                    : 'bg-wellness-navy/5 text-wellness-navy'
                                }`}
                              >
                                {product.type}
                              </span>
                            </td>
                            <td className="p-5 font-bold text-sm">₹{product.price.toFixed(2)}</td>
                            <td className="p-5 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                  }}
                                  className="text-wellness-navy hover:text-wellness-green p-1.5 rounded hover:bg-wellness-navy/5 transition-colors cursor-pointer"
                                  title="Edit Product Details"
                                >
                                  <ExternalLink size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteProduct(product.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Categories */}
            {activeTab === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Add Category Card */}
                  <div className="bg-white border border-wellness-gray-200 rounded-3xl p-6 shadow-sm self-start">
                    <h4 className="text-sm font-extrabold text-wellness-navy uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Plus size={16} className="text-wellness-green" />
                      New Therapeutic Category
                    </h4>
                    <form onSubmit={handleAddCategory} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Cardiovascular, Respiratory"
                          value={newCategory}
                          onChange={(e) => {
                            setNewCategory(e.target.value);
                          }}
                          className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-wellness-navy hover:bg-wellness-green text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        Create Category
                      </button>
                    </form>
                  </div>

                  {/* List Categories */}
                  <div className="md:col-span-2 bg-white border border-wellness-gray-200 rounded-3xl p-6 shadow-sm">
                    <h4 className="text-sm font-extrabold text-wellness-navy uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Layers size={16} className="text-wellness-green" />
                      Therapeutic Categories Catalog
                    </h4>

                    <div className="space-y-3">
                      {categories.map((cat) => (
                        <div
                          key={cat}
                          className="flex items-center justify-between p-4 rounded-xl bg-wellness-gray-50 border border-wellness-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-wellness-navy/5 flex items-center justify-center text-wellness-navy font-bold text-[10px]">
                              {cat.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-extrabold text-wellness-navy">
                                {cat}
                              </span>
                              <p className="text-[10px] text-wellness-charcoal/40 font-semibold mt-0.5">
                                {products.filter((p) => p.category === cat).length} Products
                                Assigned
                              </p>
                            </div>
                          </div>

                          {cat !== 'All' && (
                            <button
                              onClick={() => {
                                handleDeleteCategory(cat);
                              }}
                              className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Customer Queries */}
            {activeTab === 'queries' && (
              <motion.div
                key="queries"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-heading font-bold text-wellness-navy flex items-center gap-2">
                    <MessageSquare size={18} className="text-wellness-green" />
                    Clinical & Partnership Inquiries
                  </h3>
                  <button
                    onClick={handleLoadSampleQueries}
                    className="bg-white border border-wellness-gray-200 text-wellness-navy text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-wellness-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Sparkles size={14} />
                    Load Sample Queries
                  </button>
                </div>

                {queries.length === 0 ? (
                  <div className="py-20 text-center text-wellness-charcoal/50 bg-white rounded-3xl border border-wellness-gray-200 shadow-sm flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-wellness-gray-50 flex items-center justify-center mb-4 text-wellness-charcoal/30">
                      <MessageSquare size={24} />
                    </div>
                    <h4 className="text-base font-bold text-wellness-navy">No messages found</h4>
                    <p className="text-xs text-wellness-charcoal/60 mt-1 max-w-xs leading-relaxed font-semibold">
                      Submit contact form requests on the contact page or click "Load Sample
                      Queries" to view template admin inbox requests.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {queries.map((q) => {
                      const isPending = q.status === 'pending';
                      return (
                        <div
                          key={q.id}
                          className={`bg-white border p-6 rounded-3xl shadow-sm transition-all relative overflow-hidden flex flex-col md:flex-row justify-between gap-6 hover:shadow-md ${
                            isPending
                              ? 'border-wellness-gray-200'
                              : 'border-wellness-green/30 bg-wellness-green/[0.01]'
                          }`}
                        >
                          {/* Status bar */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                              isPending ? 'bg-amber-400' : 'bg-wellness-green'
                            }`}
                          ></div>

                          <div className="space-y-4 max-w-3xl pl-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className={`px-2.5 py-1 rounded text-[9px] font-extrabold uppercase tracking-widest border ${
                                  isPending
                                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                                    : 'bg-wellness-green/10 text-wellness-green border-wellness-green/20'
                                }`}
                              >
                                {q.status}
                              </span>

                              <span className="bg-wellness-navy/5 text-wellness-navy border border-wellness-navy/10 px-2.5 py-1 rounded text-[9px] font-extrabold uppercase tracking-widest">
                                {q.inquiryType}
                              </span>

                              <span className="text-[10px] text-wellness-charcoal/40 font-mono font-bold">
                                {new Date(q.date).toLocaleString()}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-sm font-extrabold text-wellness-navy">
                                {q.firstName} {q.lastName}
                                {q.company && (
                                  <span className="text-wellness-charcoal/50 font-semibold text-xs ml-1">
                                    at {q.company}
                                  </span>
                                )}
                              </h4>
                              <a
                                href={`mailto:${q.email}`}
                                className="text-[11px] text-wellness-green hover:underline font-mono font-bold mt-0.5 block"
                              >
                                {q.email}
                              </a>
                            </div>

                            <div className="p-4 rounded-xl bg-wellness-gray-50 border border-wellness-gray-200">
                              <p className="text-xs text-wellness-charcoal/80 leading-relaxed font-semibold">
                                "{q.message}"
                              </p>
                            </div>
                          </div>

                          <div className="flex md:flex-col md:items-end justify-between items-center gap-3 shrink-0">
                            <span className="text-[10px] text-wellness-charcoal/40 font-mono font-bold">
                              ID: {q.id}
                            </span>
                            <button
                              onClick={() => {
                                toggleQueryStatus(q.id);
                              }}
                              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm border ${
                                isPending
                                  ? 'bg-wellness-green text-white border-transparent hover:bg-wellness-navy'
                                  : 'bg-white text-wellness-navy border-wellness-gray-200 hover:bg-wellness-gray-50'
                              }`}
                            >
                              <Check size={14} />
                              {isPending ? 'Resolve Inquiry' : 'Mark Pending'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab 4: Orders Control */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-wellness-navy flex items-center gap-2">
                      <ShoppingBag size={18} className="text-wellness-green" />
                      Secure Transaction Orders
                    </h3>
                    <p className="text-xs text-wellness-charcoal/60 mt-0.5 font-medium">
                      Review prescription approvals, customer details, and update dispatch statuses.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleLoadSampleOrders}
                      className="bg-white border border-wellness-gray-200 text-wellness-navy text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-wellness-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Sparkles size={14} />
                      Load Sample Orders
                    </button>
                  </div>
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-2 border-b border-wellness-gray-150 pb-4">
                  {['all', 'pending', 'confirmed', 'cancelled'].map((status) => {
                    const isActive = orderStatusFilter === status;
                    const count =
                      status === 'all'
                        ? orders.length
                        : orders.filter((o) => {
                            const s = o.status;
                            return s === status;
                          }).length;

                    return (
                      <button
                        key={status}
                        onClick={() => {
                          setOrderStatusFilter(
                            status as 'all' | 'pending' | 'confirmed' | 'cancelled',
                          );
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          isActive
                            ? 'bg-wellness-navy text-white border-wellness-navy'
                            : 'bg-white text-wellness-charcoal/60 border-wellness-gray-200 hover:text-wellness-navy hover:bg-wellness-gray-50'
                        }`}
                      >
                        <span className="capitalize">{status}</span> ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Order List */}
                {orders.length === 0 ? (
                  <div className="py-20 text-center text-wellness-charcoal/50 bg-white rounded-3xl border border-wellness-gray-200 shadow-sm flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-wellness-gray-50 flex items-center justify-center mb-4 text-wellness-charcoal/30">
                      <ShoppingBag size={24} />
                    </div>
                    <h4 className="text-base font-bold text-wellness-navy">No orders found</h4>
                    <p className="text-xs text-wellness-charcoal/60 mt-1 max-w-xs leading-relaxed font-semibold">
                      No orders have been recorded or loaded. Click "Load Sample Orders" to view
                      mock transactions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders
                      .filter((ord) => {
                        if (orderStatusFilter === 'all') return true;
                        const s = ord.status;
                        return s === orderStatusFilter;
                      })
                      .map((ord) => {
                        const status = ord.status;
                        const isPending = status === 'pending';
                        const isConfirmed = status === 'confirmed';
                        const isCancelled = status === 'cancelled';
                        const ordDate = new Date(ord.date);
                        const displayDate = ordDate.toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={ord.orderId}
                            className={`bg-white border rounded-3xl shadow-sm transition-all relative overflow-hidden flex flex-col hover:shadow-md ${
                              isConfirmed
                                ? 'border-wellness-green/30'
                                : isCancelled
                                  ? 'border-red-200'
                                  : 'border-wellness-gray-200'
                            }`}
                          >
                            {/* Side status strip */}
                            <div
                              className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                isConfirmed
                                  ? 'bg-wellness-green'
                                  : isCancelled
                                    ? 'bg-red-500'
                                    : 'bg-amber-400'
                              }`}
                            ></div>

                            {/* Order Header */}
                            <div className="p-6 pb-4 border-b border-wellness-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ml-1.5">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-sm font-extrabold text-wellness-navy">
                                    {ord.orderId}
                                  </span>
                                  <span
                                    className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest border ${
                                      isConfirmed
                                        ? 'bg-wellness-green/10 text-wellness-green border-wellness-green/20'
                                        : isCancelled
                                          ? 'bg-red-50 text-red-500 border-red-100'
                                          : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}
                                  >
                                    {status}
                                  </span>
                                  {ord.isMock && (
                                    <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider">
                                      Mock Checkout
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-wellness-charcoal/40 font-semibold font-mono">
                                  Date Placed: {displayDate}
                                </p>
                              </div>

                              <div className="text-sm font-extrabold text-wellness-navy font-heading">
                                Total Cost:{' '}
                                <span className="text-wellness-green">₹{ord.total.toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Order Details Body */}
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 ml-1.5 text-xs text-wellness-charcoal/80">
                              {/* Customer & Prescription Info */}
                              <div className="lg:col-span-4 space-y-4">
                                <div>
                                  <h5 className="font-extrabold text-wellness-navy uppercase tracking-wider text-[9px] mb-2 font-heading">
                                    Delivery Details
                                  </h5>
                                  <div className="space-y-1 bg-wellness-gray-50/60 p-3 rounded-2xl border border-wellness-gray-150">
                                    <p className="font-extrabold text-wellness-navy">
                                      {ord.shippingForm.fullName}
                                    </p>
                                    <p className="font-semibold text-wellness-charcoal/60">
                                      {ord.shippingForm.phone}
                                    </p>
                                    <p className="font-semibold text-wellness-charcoal/60 truncate">
                                      {ord.shippingForm.email}
                                    </p>
                                    <p className="pt-1.5 font-medium leading-relaxed">
                                      {ord.shippingForm.address},<br />
                                      {ord.shippingForm.city} - {ord.shippingForm.zipCode}
                                    </p>
                                  </div>
                                </div>

                                {/* Prescription Details */}
                                <div>
                                  <h5 className="font-extrabold text-wellness-navy uppercase tracking-wider text-[9px] mb-2 font-heading">
                                    Clinical Authorization
                                  </h5>
                                  {ord.hasRxItems ? (
                                    <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-2xl flex items-start gap-2">
                                      <ShieldAlert
                                        className="text-amber-600 shrink-0 mt-0.5"
                                        size={16}
                                      />
                                      <div>
                                        <p className="font-bold text-amber-800 text-[10px] uppercase tracking-wider">
                                          Prescription (Rx) Required
                                        </p>
                                        <p className="font-semibold text-amber-700 mt-1 select-all font-mono text-[9px] break-all">
                                          📄{' '}
                                          {ord.rxFileName || 'medical_prescription_certified.pdf'}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-wellness-green/[0.03] border border-wellness-green/10 p-3 rounded-2xl flex items-start gap-2">
                                      <Check
                                        className="text-wellness-green shrink-0 mt-0.5"
                                        size={16}
                                      />
                                      <div>
                                        <p className="font-bold text-wellness-green text-[10px] uppercase tracking-wider">
                                          OTC Only (No Rx Required)
                                        </p>
                                        <p className="font-medium text-wellness-charcoal/50 text-[10px] mt-0.5">
                                          All items in this care package are Over-The-Counter
                                          compatible.
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Ordered Items List */}
                              <div className="lg:col-span-8 space-y-4">
                                <h5 className="font-extrabold text-wellness-navy uppercase tracking-wider text-[9px] mb-1 font-heading">
                                  Care Package Items
                                </h5>
                                <div className="border border-wellness-gray-150 rounded-2xl overflow-hidden divide-y divide-wellness-gray-100 bg-white">
                                  {ord.items.map((item) => (
                                    <div
                                      key={item.product.id}
                                      className="p-3 flex items-center justify-between gap-4 text-xs font-semibold"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-wellness-gray-50 border border-wellness-gray-200 rounded-lg overflow-hidden shrink-0 relative">
                                          <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="object-cover w-full h-full"
                                          />
                                        </div>
                                        <div>
                                          <h6 className="font-bold text-wellness-navy">
                                            {item.product.name}
                                          </h6>
                                          <p className="text-[10px] text-wellness-charcoal/40 font-mono mt-0.5">
                                            {item.product.type} • Quantity: {item.quantity}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-wellness-navy">
                                          ₹{(item.product.price * item.quantity).toFixed(2)}
                                        </p>
                                        <p className="text-[9px] text-wellness-charcoal/40">
                                          ₹{item.product.price.toFixed(2)} each
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Price Calculations */}
                                <div className="flex flex-wrap gap-x-6 gap-y-2 justify-end text-[10px] text-wellness-charcoal/50 font-bold uppercase tracking-wider pt-2 border-t border-wellness-gray-100">
                                  <div>
                                    Subtotal:{' '}
                                    <span className="text-wellness-navy">
                                      ₹{ord.subtotal.toFixed(2)}
                                    </span>
                                  </div>
                                  <div>
                                    Shipping:{' '}
                                    <span className="text-wellness-navy">
                                      {ord.shipping === 0 ? 'Free' : `₹${ord.shipping.toFixed(2)}`}
                                    </span>
                                  </div>
                                  <div>
                                    GST Tax (10%):{' '}
                                    <span className="text-wellness-navy">
                                      ₹{ord.tax.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="text-xs font-extrabold text-wellness-green">
                                    Grand Total: ₹{ord.total.toFixed(2)}
                                  </div>
                                </div>

                                {/* Administrative Actions */}
                                <div className="pt-4 flex flex-wrap items-center justify-end gap-3 border-t border-wellness-gray-100">
                                  <span className="text-[10px] text-wellness-charcoal/40 font-mono mr-auto">
                                    Payment ID: {ord.paymentId}
                                  </span>

                                  {isPending ? (
                                    <>
                                      <button
                                        onClick={() => {
                                          handleUpdateOrderStatus(ord.orderId, 'cancelled');
                                        }}
                                        className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                      >
                                        <X size={14} />
                                        Reject & Cancel
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleUpdateOrderStatus(ord.orderId, 'confirmed');
                                        }}
                                        className="px-4 py-2 bg-wellness-green hover:bg-wellness-navy text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                                      >
                                        <Check size={14} />
                                        Accept & Confirm
                                      </button>
                                    </>
                                  ) : isConfirmed ? (
                                    <>
                                      <span className="text-xs text-wellness-green font-bold flex items-center gap-1.5 mr-2">
                                        <Check size={16} className="stroke-[2.5]" />
                                        Order Confirmed
                                      </span>
                                      <button
                                        onClick={() => {
                                          handleUpdateOrderStatus(ord.orderId, 'cancelled');
                                        }}
                                        className="px-3.5 py-1.5 border border-wellness-gray-200 hover:bg-red-50 text-red-500 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                      >
                                        Cancel Order
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-xs text-red-500 font-bold flex items-center gap-1.5 mr-2">
                                        <X size={16} className="stroke-[2.5]" />
                                        Order Cancelled
                                      </span>
                                      <button
                                        onClick={() => {
                                          handleUpdateOrderStatus(ord.orderId, 'confirmed');
                                        }}
                                        className="px-3.5 py-1.5 border border-wellness-gray-200 hover:bg-wellness-gray-50 text-wellness-navy rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                      >
                                        Re-Confirm Order
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab 5: Promotions & Banners */}
            {activeTab === 'promotions' && (
              <motion.div
                key="promotions"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-heading font-bold text-wellness-navy flex items-center gap-2">
                    <Percent size={18} className="text-wellness-green" />
                    Homepage Promotions & Banners
                  </h3>
                  <p className="text-xs text-wellness-charcoal/60 mt-0.5 font-medium">
                    Upload new promotional graphic banners or set redirect click destinations for
                    key announcements.
                  </p>
                </div>

                <div className="bg-white border border-wellness-gray-200 rounded-3xl p-8 shadow-sm space-y-8">
                  {/* Banner Preview */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-wellness-navy uppercase tracking-wider">
                      Current Banner Live Preview
                    </h4>
                    <p className="text-[10px] text-wellness-charcoal/50">
                      This is how the banner graphic appears to customers on the homepage.
                    </p>
                    <div className="relative w-full max-w-[800px] aspect-[21/9] rounded-[24px] overflow-hidden border border-wellness-gray-200 shadow bg-slate-50 mt-2">
                      <img
                        src={promoImage}
                        alt="Current Promo Banner Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Settings Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-wellness-gray-100">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                          Upload New Graphic Banner Image
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
                                if (!e.target.files || e.target.files.length === 0) return;
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (reader.result) {
                                    setPromoImage(reader.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="hidden"
                            />
                          </label>
                          <div className="text-[11px] text-wellness-charcoal/60 leading-relaxed">
                            <p className="font-extrabold text-wellness-navy">
                              Recommended size: 1200 x 500 px (21:9 Aspect Ratio)
                            </p>
                            <p className="mt-1">
                              Supported formats: JPG, PNG, WEBP. The file is stored locally as a
                              responsive data string.
                            </p>
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
                            ✓ Device File is currently selected. Paste a URL here to override it.
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
                          Specify where customers will be redirected when clicking the advertisement
                          graphic.
                        </p>
                      </div>

                      <div className="pt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem('admin_promo_banner_image', promoImage);
                            localStorage.setItem('admin_promo_banner_link', promoLink);
                            alert('Promotional banner settings saved successfully!');
                          }}
                          className="bg-wellness-green hover:bg-wellness-navy text-white text-xs font-black uppercase tracking-wider px-6 py-4.5 rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          Save Banner Settings
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Reset banner configuration to clinical defaults?')) {
                              localStorage.removeItem('admin_promo_banner_image');
                              localStorage.removeItem('admin_promo_banner_link');
                              setPromoImage('/images/default-promo-banner.png');
                              setPromoLink('/products');
                              alert('Banner settings reset to defaults.');
                            }
                          }}
                          className="border border-wellness-gray-200 hover:bg-wellness-gray-50 text-wellness-navy text-xs font-black uppercase tracking-wider px-5 py-4.5 rounded-xl transition-all cursor-pointer"
                        >
                          Reset to Default
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-wellness-navy/40 backdrop-blur-sm flex items-center justify-center px-6 animate-in fade-in duration-300">
          <div className="max-w-2xl w-full bg-white border border-wellness-gray-200 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => {
                setEditingProduct(null);
              }}
              className="absolute top-6 right-6 text-wellness-charcoal/40 hover:text-wellness-navy cursor-pointer"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleEditProduct} className="space-y-6">
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
                      setEditingProduct((prev) =>
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
                      setEditingProduct((prev) => (prev ? { ...prev, category: val } : null));
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
                    Price in INR (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => {
                      setEditingProduct((prev) =>
                        prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null,
                      );
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-wellness-gray-200 bg-wellness-gray-50 focus:border-wellness-green outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <DropdownField
                    label="Prescription Type"
                    options={[
                      { value: 'Over-The-Counter (OTC)', label: 'Over-The-Counter (OTC)' },
                      { value: 'Prescription (Rx)', label: 'Prescription (Rx)' },
                    ]}
                    selectedValue={editingProduct.type}
                    onChange={(val) => {
                      setEditingProduct((prev) =>
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
                    setEditingProduct((prev) => (prev ? { ...prev, image: e.target.value } : null));
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
                      onChange={handleEditProductImagesChange}
                      className="hidden"
                    />
                  </label>

                  {(editingProduct.images && editingProduct.images.length > 0
                    ? editingProduct.images
                    : [editingProduct.image]
                  ).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 rounded-xl overflow-hidden border border-wellness-gray-200 group bg-wellness-gray-50 shrink-0"
                    >
                      <img
                        src={img}
                        alt={`Preview ${(idx + 1).toString()}`}
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveEditProductImage(idx);
                        }}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm focus:outline-none"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-wellness-navy/80 text-[8px] font-extrabold uppercase text-center text-white py-0.5">
                        {idx === 0 ? 'Cover' : `Img ${(idx + 1).toString()}`}
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
                    setEditingProduct((prev) =>
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
                      setEditingProduct((prev) =>
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
                      setEditingProduct((prev) =>
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
                    setEditingProduct((prev) =>
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
                  onClick={() => {
                    setEditingProduct(null);
                  }}
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
      )}
    </div>
  );
}
