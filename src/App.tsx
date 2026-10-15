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
  fetchSiteLogoFromSupabase,
  fetchHeroImageFromSupabase,
  saveProductOrderToSupabase,
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

  // Check if this browser already has cached data
  const hasCachedProducts = typeof window !== 'undefined' && Boolean(localStorage.getItem(PRODUCTS_STORAGE_KEY));
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(!hasCachedProducts);

  // Load from Supabase on mount and when config is updated
  useEffect(() => {
    let isMounted = true;
    const loadFromSupabase = async () => {
      const config = getSupabaseConfig();
      if (!config.isConfigured) {
        if (isMounted) setIsLoadingInitialData(false);
        return;
      }

      try {
        const [sbProducts, sbCategories, sbLogo, sbHero] = await Promise.all([
          fetchProductsFromSupabase(),
          fetchCategoriesFromSupabase(),
          fetchSiteLogoFromSupabase(),
          fetchHeroImageFromSupabase(),
        ]);
        if (isMounted) {
          if (sbProducts && sbProducts.length > 0) {
            setProducts(sbProducts);
            try {
              localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(sbProducts));
            } catch {}
          }
          if (sbCategories && sbCategories.length > 0) {
            setCategories(sbCategories);
            try {
              localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(sbCategories));
            } catch {}
          }
          if (sbLogo) {
            try {
              localStorage.setItem('devecioglu_site_logo_v3', JSON.stringify(sbLogo));
              window.dispatchEvent(new Event('devecioglu_logo_updated'));
            } catch {}
          }
          if (sbHero) {
            try {
              localStorage.setItem('devecioglu_hero_banner_image_v1', sbHero);
              window.dispatchEvent(new Event('devecioglu_hero_image_updated'));
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Initial Supabase load failed, using local data:', err);
      } finally {
        if (isMounted) {
          setIsLoadingInitialData(false);
        }
      }
    };

    // Safety timeout: never block longer than 1200ms
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoadingInitialData(false);
      }
    }, 1200);

    loadFromSupabase();

    const handleConfigUpdate = () => {
      loadFromSupabase();
    };

    window.addEventListener('devecioglu_supabase_config_updated', handleConfigUpdate);
    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
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
  const handleUpdateProduct = async (updated: Product): Promise<boolean> => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updated.id ? { ...item, product: updated } : item
      )
    );
    if (selectedProduct && selectedProduct.id === updated.id) {
      setSelectedProduct(updated);
    }
    // Sync to Supabase
    return await saveProductToSupabase(updated);
  };

  const handleAddProduct = async (newProduct: Product): Promise<boolean> => {
    setProducts((prev) => [newProduct, ...prev]);
    // Sync to Supabase
    return await saveProductToSupabase(newProduct);
  };

  const handleDeleteProduct = async (productId: string): Promise<boolean> => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(null);
    }
    // Sync to Supabase
    return await deleteProductFromSupabase(productId);
  };

  const handleAddCategory = async (newCategory: CategoryItem): Promise<boolean> => {
    setCategories((prev) => [...prev, newCategory]);
    // Sync to Supabase
    return await saveCategoryToSupabase(newCategory);
  };

  const handleDeleteCategory = async (categoryId: string): Promise<boolean> => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    // Sync to Supabase
    return await deleteCategoryFromSupabase(categoryId);
  };

  const handleReorderProducts = async (newProducts: Product[]): Promise<boolean> => {
    setProducts(newProducts);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(newProducts));
    } catch {}
    const ids = newProducts.map((p) => p.id);
    return await saveProductOrderToSupabase(ids);
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

  // On first load on a brand new device: show sleek initial loader while Supabase delivers live products
  if (isLoadingInitialData) {
    return (
      <div className="min-h-screen bg-[#0C120C] flex flex-col items-center justify-center p-6 text-white text-center select-none">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-black border border-stone-800 p-2.5 shadow-2xl flex items-center justify-center">
            <img src="/favicon.svg" alt="Devecioğlu Toptan Gıda" className="w-15 h-15 object-contain" />
          </div>
          <div className="absolute -inset-1.5 rounded-2xl border border-emerald-500/40 animate-pulse pointer-events-none" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black font-['Plus_Jakarta_Sans'] tracking-tight text-white mb-1.5">
          DEVECİOĞLU TOPTAN GIDA
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 font-medium max-w-sm mb-5">
          Bursa İthal Ceviz İçi & Kuruyemiş B2B Tedarik Portalı
        </p>
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-300 font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Canlı Ürün & Fiyat Kataloğu Yükleniyor...</span>
        </div>
      </div>
    );
  }

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
          onReorderProducts={handleReorderProducts}
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
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-30 w-auto max-w-[calc(100vw-24px)] sm:max-w-md bg-stone-900/98 backdrop-blur-md text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-stone-700/80 flex items-center justify-between gap-2.5 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-stone-950 flex items-center justify-center font-bold shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-emerald-400 truncate">
                {cart.length} Kalem · {totalKg} kg
              </div>
              <div className="text-[10px] sm:text-[11px] text-stone-300 truncate">
                WhatsApp API teklifini hazırla
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Teklifi Gör</span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
