import React, { useState, useEffect } from 'react';
import { Product, CartItem, CategoryItem } from './types';
import { PRODUCTS, INITIAL_CATEGORIES } from './data/products';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AydinLabSection } from './components/AydinLabSection';
import { WalnutMatrix } from './components/WalnutMatrix';
import { ProductCatalog } from './components/ProductCatalog';
import { BursaLogisticsSection } from './components/BursaLogisticsSection';
import { QuoteDrawer } from './components/QuoteDrawer';
import { LabCertificatesModal } from './components/LabCertificatesModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SampleRequestPage } from './components/SampleRequestPage';
import { AdminPage } from './components/AdminPage';
import { Footer } from './components/Footer';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';

import {
  fetchProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  fetchCategoriesFromSupabase,
  saveCategoryToSupabase,
  deleteCategoryFromSupabase,
  getSupabaseConfig,
} from './lib/supabase';

const CART_STORAGE_KEY = 'devecioglu_wholesale_quote_cart';
const PRODUCTS_STORAGE_KEY = 'devecioglu_custom_products';
const CATEGORIES_STORAGE_KEY = 'devecioglu_custom_categories';

export default function App() {
  // State for products (with localStorage persistence fallback)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  // State for categories (with localStorage persistence fallback)
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // State for quote cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isSamplePageOpen, setIsSamplePageOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [samplePreselectedId, setSamplePreselectedId] = useState<string | undefined>(undefined);

  // Load from Supabase on mount and when config is updated
  useEffect(() => {
    let isMounted = true;
    const loadFromSupabase = async () => {
      const config = getSupabaseConfig();
      if (!config.isConfigured) return;

      try {
        const [sbProducts, sbCategories] = await Promise.all([
          fetchProductsFromSupabase(),
          fetchCategoriesFromSupabase(),
        ]);
        if (isMounted) {
          if (sbProducts && sbProducts.length > 0) {
            setProducts(sbProducts);
          }
          if (sbCategories && sbCategories.length > 0) {
            setCategories(sbCategories);
          }
        }
      } catch (err) {
        console.warn('Initial Supabase load failed, using local data:', err);
      }
    };

    loadFromSupabase();

    const handleConfigUpdate = () => {
      loadFromSupabase();
    };

    window.addEventListener('devecioglu_supabase_config_updated', handleConfigUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('devecioglu_supabase_config_updated', handleConfigUpdate);
    };
  }, []);

  // Sync products with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (err) {
      console.error(err);
    }
  }, [products]);

  // Sync categories with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (err) {
      console.error(err);
    }
  }, [categories]);

  // Sync cart with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error(err);
    }
  }, [cart]);

  // Admin Actions
  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    // Sync to Supabase
    saveProductToSupabase(updated);

    // Also update any items in cart referencing this product
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updated.id ? { ...item, product: updated } : item
      )
    );
    if (selectedProduct && selectedProduct.id === updated.id) {
      setSelectedProduct(updated);
    }
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    // Sync to Supabase
    saveProductToSupabase(newProduct);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    // Sync to Supabase
    deleteProductFromSupabase(productId);

    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(null);
    }
  };

  const handleAddCategory = (newCategory: CategoryItem) => {
    setCategories((prev) => [...prev, newCategory]);
    // Sync to Supabase
    saveCategoryToSupabase(newCategory);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    // Sync to Supabase
    deleteCategoryFromSupabase(categoryId);
  };

  const handleResetToDefaults = () => {
    setProducts(PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(CATEGORIES_STORAGE_KEY);
  };

  // Cart actions
  const handleAddToCart = (product: Product, quantityKg: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantityKg: item.quantityKg + quantityKg }
            : item
        );
      }
      return [...prev, { product, quantityKg }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantityKg: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantityKg } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOpenSample = (productId?: string) => {
    setSamplePreselectedId(productId);
    setIsSamplePageOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSampleWithProduct = (product: Product) => {
    handleOpenSample(product.id);
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('kuruyemis-katalogu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectVarietyFilter = (varietyQuery: string) => {
    setSearchQuery(varietyQuery);
    scrollToCatalog();
  };

  const totalKg = cart.reduce((acc, item) => acc + item.quantityKg, 0);

  // If Admin Panel / Login is open: Render pristine dedicated full-screen page
  if (isAdminOpen) {
    return (
      <div className="min-h-screen bg-[#F4F6F4] text-stone-800 selection:bg-emerald-800 selection:text-white">
        <AdminPage
          products={products}
          categories={categories}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onResetToDefaults={handleResetToDefaults}
          onBackToHome={() => setIsAdminOpen(false)}
        />
      </div>
    );
  }

  // If Sample Request Page is open: Render pristine dedicated page
  if (isSamplePageOpen) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] text-stone-800 selection:bg-emerald-800 selection:text-white">
        <SampleRequestPage
          products={products}
          preSelectedProductId={samplePreselectedId}
          onBackToHome={() => setIsSamplePageOpen(false)}
        />

        {/* Global Drawer accessible from shortcuts */}
        <QuoteDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-stone-800 selection:bg-emerald-800 selection:text-white">
      {/* Navigation */}
      <Navbar
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLabModal={() => setIsLabModalOpen(true)}
        onOpenSampleModal={() => handleOpenSample()}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenSampleModal={() => handleOpenSample()}
          onOpenLabModal={() => setIsLabModalOpen(true)}
          onScrollToCatalog={scrollToCatalog}
        />

        {/* 100% Imported Walnut Grade Matrix & Buying Guide - Synced with Admin Products */}
        <WalnutMatrix
          products={products}
          onSelectVariety={handleSelectVarietyFilter}
        />

        {/* Full B2B Product Catalog with live products and categories */}
        <ProductCatalog
          products={products}
          categories={categories}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddToCart={handleAddToCart}
          onSelectProductDetails={(product) => setSelectedProduct(product)}
        />

        {/* Aydın Kuruyemiş Accredited Lab & Antioksidan Sertifikasyon Bölümü (Sevkiyat Takviminin Üstünde) */}
        <AydinLabSection onOpenLabModal={() => setIsLabModalOpen(true)} />

        {/* Bursa Logistics and Weekly District Delivery Schedule */}
        <BursaLogisticsSection />
      </main>

      {/* Floating Bottom Quote Bar (When Cart Has Items) */}
      {cart.length > 0 && !isCartOpen && (
        <aside
          aria-label="Teklif Sepeti Özeti"
          className="fixed bottom-4 right-4 sm:right-6 z-30 max-w-md bg-stone-900 text-white rounded-2xl p-4 shadow-2xl border border-stone-700/80 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-stone-950 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400">
                {cart.length} Kalem Seçildi · {totalKg} kg
              </div>
              <div className="text-[11px] text-stone-300">
                WhatsApp API teklifini hazırla
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>Teklifi Gör</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Footer */}
      <Footer
        onOpenLabModal={() => setIsLabModalOpen(true)}
        onOpenSampleModal={() => handleOpenSample()}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Modals & Drawers */}
      <QuoteDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      <LabCertificatesModal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        onRequestSample={() => {
          setIsLabModalOpen(false);
          handleOpenSample();
        }}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onRequestSampleForProduct={(product) => {
          setSelectedProduct(null);
          handleOpenSample(product.id);
        }}
      />
    </div>
  );
}
