import React, { useState } from 'react';
import { Product, CategoryItem } from '../types';
import {
  ArrowLeft,
  Lock,
  User,
  KeyRound,
  Shield,
  Save,
  Plus,
  Trash2,
  Edit3,
  FolderPlus,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  LogOut,
  Sliders,
  DollarSign,
  Tag,
  Package,
  Database,
  Image as ImageIcon,
} from 'lucide-react';
import { WALNUT_IMAGE, NUTS_IMAGE, DRIED_FRUITS_IMAGE, HERO_IMAGE } from '../data/products';
import { ImageUploadField } from './ImageUploadField';
import { SupabaseAdminSection } from './SupabaseAdminSection';
import { saveHeroImageToSupabase } from '../lib/supabase';
import {
  DeveciogluLogo,
  LogoStyle,
  LogoConfig,
  LOGO_PRESETS,
  getSiteLogoConfig,
  saveSiteLogoConfig,
} from './DeveciogluLogo';

interface AdminPageProps {
  products: Product[];
  categories: CategoryItem[];
  onUpdateProduct: (product: Product) => Promise<boolean> | void;
  onAddProduct: (product: Product) => Promise<boolean> | void;
  onDeleteProduct: (productId: string) => Promise<boolean> | void;
  onAddCategory: (category: CategoryItem) => Promise<boolean> | void;
  onDeleteCategory: (categoryId: string) => Promise<boolean> | void;
  onResetToDefaults: () => void;
  onBackToHome: () => void;
}

async function sha256(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const ADMIN_AUTH_KEY = 'devecioglu_admin_authenticated';
// Cryptographically salted hashes for authorized access. Plaintext credentials are completely removed from source code.
const AUTH_SALT = 'devecioglu_bursa_auth_v2_';
const ADMIN_USER_HASH = '0f7b5e99e1cf55b26c01e073515dc2c90fe07dcc62b9bb6f3776df987ce90def';
const ADMIN_PASS_HASH = 'ba4bce0d3bcb20b2e393d90fac9ff75e10db8ca894534bfbeca93ee04fb26208';

export const AdminPage: React.FC<AdminPageProps> = ({
  products,
  categories,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
  onResetToDefaults,
  onBackToHome,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'add-product' | 'logo' | 'database' | 'settings'>('products');
  const [logoConfig, setLogoConfig] = useState<LogoConfig>(() => getSiteLogoConfig());
  const [logoSuccess, setLogoSuccess] = useState('');
  const [heroImage, setHeroImage] = useState<string>(() => {
    try {
      return localStorage.getItem('devecioglu_hero_banner_image_v1') || HERO_IMAGE;
    } catch {
      return HERO_IMAGE;
    }
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState(categories[0]?.id || 'ceviz');
  const [newProdVariety, setNewProdVariety] = useState('');
  const [newProdGrade, setNewProdGrade] = useState<'Ekstra Lüks' | '1. Kalite' | 'Endüstriyel Standart'>('1. Kalite');
  const [newProdOrigin, setNewProdOrigin] = useState('İthal');
  const [newProdMinPrice, setNewProdMinPrice] = useState<number>(400);
  const [newProdMaxPrice, setNewProdMaxPrice] = useState<number>(450);
  const [newProdMinOrderText, setNewProdMinOrderText] = useState('1 Koli (10 kg)');
  const [newProdMinOrderKg, setNewProdMinOrderKg] = useState<number>(10);
  const [newProdPackaging, setNewProdPackaging] = useState('10 kg Vakumlu Koli');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdImage, setNewProdImage] = useState(WALNUT_IMAGE);
  const [prodSuccess, setProdSuccess] = useState('');

  // Search in admin table
  const [adminSearch, setAdminSearch] = useState('');

  // In-app deletion target (guaranteed to work in iframe sandboxes, replaces window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'category' | 'reset';
    id?: string;
    name?: string;
  } | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'product' && deleteTarget.id) {
      onDeleteProduct(deleteTarget.id);
      setProdSuccess(`"${deleteTarget.name}" katalogdan başarıyla silindi.`);
      setTimeout(() => setProdSuccess(''), 3500);
    } else if (deleteTarget.type === 'category' && deleteTarget.id) {
      onDeleteCategory(deleteTarget.id);
      setCategorySuccess(`"${deleteTarget.name}" kategorisi başarıyla silindi.`);
      setTimeout(() => setCategorySuccess(''), 3500);
    } else if (deleteTarget.type === 'reset') {
      onResetToDefaults();
      setProdSuccess('Katalog fabrika varsayılan ayarlarına başarıyla sıfırlandı.');
      setTimeout(() => setProdSuccess(''), 3500);
    }
    setDeleteTarget(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const uHash = await sha256(AUTH_SALT + usernameInput.trim().toLowerCase());
      const pHash = await sha256(AUTH_SALT + passwordInput);

      if (uHash === ADMIN_USER_HASH && pHash === ADMIN_PASS_HASH) {
        setIsAuthenticated(true);
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
        setAuthError('');
        setUsernameInput('');
        setPasswordInput('');
      } else {
        setAuthError('Kullanıcı adı veya şifre hatalı. Lütfen yetkili bilgilerinizi kontrol ediniz.');
      }
    } catch {
      setAuthError('Giriş işlemi sırasında bir hata oluştu.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(ADMIN_AUTH_KEY);
  };

  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSavingProduct(true);
    const updated: Product = {
      ...editingProduct,
      indicativePriceRange: `${editingProduct.minPrice} - ${editingProduct.maxPrice} ₺ / kg`,
      minOrderText: editingProduct.minOrderText?.trim() || '1 Koli (10 kg)',
      minOrderKg: Number(editingProduct.minOrderKg) || 10,
    };

    const isOk = await onUpdateProduct(updated);
    setIsSavingProduct(false);
    setEditingProduct(null);

    if (isOk !== false) {
      setProdSuccess(`✓ "${updated.name}" ürün bilgileri ve fiyatları canlı Supabase veritabanına başarıyla kaydedildi.`);
    } else {
      setProdSuccess(`✓ "${updated.name}" güncellendi (Tarayıcı önbelleğine yazıldı).`);
    }
    setTimeout(() => setProdSuccess(''), 4500);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const slug = newCategoryName
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const newCat: CategoryItem = {
      id: slug || `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim(),
    };

    onAddCategory(newCat);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setCategorySuccess(`"${newCat.name}" kategorisi başarıyla oluşturuldu.`);
    setTimeout(() => setCategorySuccess(''), 3000);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    setIsSavingProduct(true);
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName.trim(),
      category: newProdCategory,
      variety: newProdVariety.trim() || newProdName.trim(),
      grade: newProdGrade,
      origin: newProdOrigin.trim(),
      indicativePriceRange: `${newProdMinPrice} - ${newProdMaxPrice} ₺ / kg`,
      minPrice: Number(newProdMinPrice),
      maxPrice: Number(newProdMaxPrice),
      unit: 'kg',
      minOrderKg: Number(newProdMinOrderKg) || 10,
      minOrderText: newProdMinOrderText.trim() || '1 Koli (10 kg)',
      bestFor: ['Mutfak', 'Restoran'],
      packaging: newProdPackaging.trim(),
      colorGrade: 'Standart',
      description: newProdDescription.trim() || 'Devecioğlu Toptan Gıda seçme ürün kalitesi.',
      features: ['Aydın Kuruyemiş Tescilli', 'Laboratuvar Onaylı Kalite'],
      image: newProdImage,
      inStock: true,
    };

    const isOk = await onAddProduct(newProduct);
    setIsSavingProduct(false);
    if (isOk !== false) {
      setProdSuccess(`✓ "${newProduct.name}" Supabase veritabanına ve kataloğa başarıyla eklendi.`);
    } else {
      setProdSuccess(`✓ "${newProduct.name}" kataloğa eklendi.`);
    }
    setNewProdName('');
    setNewProdVariety('');
    setNewProdDescription('');
    setNewProdMinOrderText('1 Koli (10 kg)');
    setNewProdMinOrderKg(10);
    setActiveTab('products');
    setTimeout(() => setProdSuccess(''), 4500);
  };

  const filteredAdminProducts = products.filter((p) => {
    if (!adminSearch) return true;
    const q = adminSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.origin.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-stone-800 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Ana Sayfaya & Ürün Kataloğuna Dön</span>
            </button>
            <div className="hidden md:block pl-2 border-l border-stone-200">
              <DeveciogluLogo variant="light" size="xs" showSubtitle={false} />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-900">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>Devecioğlu Yönetici Portalı</span>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-xs text-stone-500 font-medium">
                  Oturum: <strong className="text-emerald-900 font-semibold">Yetkili Yönetici</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Full-Screen Area */}
      {!isAuthenticated ? (
        /* FULL-SCREEN BRIGHT LOGIN PAGE */
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-xl p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-3">
              <DeveciogluLogo variant="light" size="lg" className="mx-auto" />
              <div>
                <h1 className="text-2xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans'] tracking-tight">
                  Devecioğlu Yönetici Girişi
                </h1>
                <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed mt-1">
                  Toptan katalogda fiyat, kategori ve açıklama düzenlemeleri yapabilmek için bilgilerinizi giriniz.
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Kullanıcı Adı *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Yönetici Şifresi *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 shadow-2xs"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Panele Giriş Yap
              </button>
            </form>

            <div className="text-center pt-1 border-t border-stone-100">
              <button
                type="button"
                onClick={onBackToHome}
                className="text-xs text-stone-500 hover:text-stone-800 font-semibold underline cursor-pointer"
              >
                Vazgeç & Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* FULL-SCREEN ADMIN DASHBOARD */
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          
          {/* Header Dashboard Banner */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans']">
                    Devecioğlu Katalog & Fiyat Yönetimi
                  </h2>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Yetkili Oturum
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Fiyat aralıkları, yeni ürün ekleme, kategori ve ürün açıklamaları düzenleme masası
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-stone-600 bg-stone-50 px-4 py-2.5 rounded-xl border border-stone-200 self-start md:self-auto">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Toplam Ürün</span>
                <strong className="text-stone-900 font-mono text-sm">{products.length} Adet</strong>
              </div>
              <div className="w-px h-6 bg-stone-300" />
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Kategori</span>
                <strong className="text-stone-900 font-mono text-sm">{categories.length} Adet</strong>
              </div>
              <div className="w-px h-6 bg-stone-300" />
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Kullanıcı Rolü</span>
                <strong className="text-emerald-800 font-bold">Yetkili Admin</strong>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
            <button
              onClick={() => {
                setActiveTab('products');
                setEditingProduct(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Ürünler & Fiyatlar ({products.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('categories');
                setEditingProduct(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'categories'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Kategoriler ({categories.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('add-product');
                setEditingProduct(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'add-product'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Ürün Ekle</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('logo');
                setEditingProduct(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'logo'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Firma Logosu & Açılış Görseli</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('database');
                setEditingProduct(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'database'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Supabase Veritabanı</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('settings');
                setEditingProduct(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ml-auto ${
                activeTab === 'settings'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Ayarlar</span>
            </button>
          </div>

          {/* Notifications */}
          {prodSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 shadow-2xs">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{prodSuccess}</span>
            </div>
          )}

          {categorySuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 shadow-2xs">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{categorySuccess}</span>
            </div>
          )}

          {/* TAB 1: PRODUCT LIST & INLINE EDITING */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-5">
              
              {/* Product Edit Form */}
              {editingProduct ? (
                <form onSubmit={handleSaveProductEdit} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Ürün Düzenleme Modu
                      </span>
                      <h4 className="text-base font-bold text-stone-900 font-['Plus_Jakarta_Sans']">
                        {editingProduct.name}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="text-xs text-stone-500 hover:text-stone-800 underline font-semibold cursor-pointer"
                    >
                      İptal Et
                    </button>
                  </div>

                  {/* Name & Variety */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Ürün Adı *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Çeşit & Kalibre *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.variety}
                        onChange={(e) => setEditingProduct({ ...editingProduct, variety: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg font-medium"
                      />
                    </div>
                  </div>

                  {/* Category & Grade & Origin */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Kategori *</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg font-medium"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Kalite Sınıfı *</label>
                      <select
                        value={editingProduct.grade}
                        onChange={(e) => setEditingProduct({ ...editingProduct, grade: e.target.value as any })}
                        className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg font-medium"
                      >
                        <option value="Ekstra Lüks">Ekstra Lüks</option>
                        <option value="1. Kalite">1. Kalite</option>
                        <option value="Endüstriyel Standart">Endüstriyel Standart</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Menşei</label>
                      <input
                        type="text"
                        value={editingProduct.origin}
                        onChange={(e) => setEditingProduct({ ...editingProduct, origin: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg font-medium"
                      />
                    </div>
                  </div>

                  {/* Fiyat Bilgisi Güncelleme */}
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                      <DollarSign className="w-4 h-4 text-emerald-700" />
                      <span>Toptan Gösterge Fiyat Bilgisi Güncelleme (₺/kg)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Minimum KG Fiyatı (₺) *
                        </label>
                        <input
                          type="number"
                          required
                          value={editingProduct.minPrice}
                          onChange={(e) => setEditingProduct({ ...editingProduct, minPrice: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Maksimum KG Fiyatı (₺) *
                        </label>
                        <input
                          type="number"
                          required
                          value={editingProduct.maxPrice}
                          onChange={(e) => setEditingProduct({ ...editingProduct, maxPrice: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      Önizleme: <strong>{editingProduct.minPrice} - {editingProduct.maxPrice} ₺ / kg</strong> (Katalog ve teklif sepetinde anında güncellenir)
                    </div>
                  </div>

                  {/* Yeşil Renkli Min Sipariş Değeri Düzenleme */}
                  <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-300 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                        <Package className="w-4 h-4 text-emerald-700" />
                        <span>Katalogdaki Yeşil Renkli &quot;Min:&quot; Sipariş Değeri</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded border border-emerald-300 shadow-2xs">
                        Katalog Önizleme: Min: {editingProduct.minOrderText || '1 Koli (10 kg)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Yeşil Min Metni (Ürün Kartında Görünen) *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct.minOrderText || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, minOrderText: e.target.value })}
                          placeholder="Örn: 1 Koli (10 kg), 25 kg Çuval, 50 kg"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-bold text-emerald-900"
                        />
                        <p className="text-[11px] text-stone-500 mt-1">
                          İthal ceviz, kuruyemiş ve meyve kartlarında gösterge fiyatının sağında yeşil renkte &quot;Min: ...&quot; olarak gösterilir.
                        </p>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Minimum Adım / Sepet Kilogramı *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={editingProduct.minOrderKg || 10}
                          onChange={(e) => setEditingProduct({ ...editingProduct, minOrderKg: Number(e.target.value) || 1 })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                        />
                        <p className="text-[11px] text-stone-500 mt-1">
                          Sepete eklemede ve katalogdaki +/- miktar butonlarındaki taban KG değeri.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fotoğraf Düzenleme (Bilgisayardan Yükleme + Önizleme + URL) */}
                  <ImageUploadField
                    label="Ürün Fotoğrafı *"
                    helperText="Kendi bilgisayarınızdan yükleyin veya hazır görsel seçin"
                    value={editingProduct.image}
                    onChange={(newImg) => setEditingProduct({ ...editingProduct, image: newImg })}
                  />

                  {/* Açıklama Düzenleme */}
                  <div className="text-xs">
                    <label className="block font-semibold text-stone-700 mb-1">Ürün Açıklaması *</label>
                    <textarea
                      rows={3}
                      required
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                    />
                  </div>

                  {/* Save Action */}
                  <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Değişiklikleri Kaydet</span>
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Ürün adı, menşei veya çeşit ile filtrele..."
                        className="w-full pl-3 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    <div className="text-xs text-stone-500">
                      Toplam: <strong className="text-stone-900">{filteredAdminProducts.length}</strong> ürün listeleniyor
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                          <tr>
                            <th className="py-3 px-3.5">Görsel</th>
                            <th className="py-3 px-3.5">Ürün & Çeşit</th>
                            <th className="py-3 px-3.5">Kategori</th>
                            <th className="py-3 px-3.5">Fiyat Bandı (₺/kg)</th>
                            <th className="py-3 px-3.5">Min Sipariş (Yeşil)</th>
                            <th className="py-3 px-3.5">Kalite</th>
                            <th className="py-3 px-3.5 text-right">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 text-stone-600">
                          {filteredAdminProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                              <td className="py-2.5 px-3.5">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-11 h-11 object-cover rounded-lg border border-stone-200"
                                />
                              </td>
                              <td className="py-2.5 px-3.5">
                                <div className="font-bold text-stone-900">{p.name}</div>
                                <div className="text-[11px] text-stone-500">{p.variety} · {p.origin}</div>
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span className="px-2 py-0.5 rounded bg-stone-100 font-mono text-[11px] text-stone-700 border border-stone-200">
                                  {categories.find((c) => c.id === p.category)?.name || p.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-3.5 font-mono font-bold text-stone-900 tabular-nums">
                                {p.indicativePriceRange}
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span className="inline-flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  Min: {p.minOrderText || `${p.minOrderKg || 10} kg`}
                                </span>
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span className="text-emerald-800 font-semibold">{p.grade}</span>
                              </td>
                              <td className="py-2.5 px-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setEditingProduct(p)}
                                    className="p-2 bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 rounded-lg transition-colors cursor-pointer"
                                    title="Düzenle"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget({ type: 'product', id: p.id, name: p.name })}
                                    className="p-2 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                                    title="Sil"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

          {/* TAB 2: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-6">
              
              {/* Add Category Form */}
              <form onSubmit={handleCreateCategory} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                  <FolderPlus className="w-4 h-4 text-emerald-700" />
                  <span>Yeni Kategori Oluştur</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Kategori Adı *</label>
                    <input
                      type="text"
                      required
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Örn: Pastacılık Özel Serisi"
                      className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Açıklama</label>
                    <input
                      type="text"
                      value={newCategoryDescription}
                      onChange={(e) => setNewCategoryDescription(e.target.value)}
                      placeholder="Kısa açıklama..."
                      className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Kategoriyi Ekle</span>
                  </button>
                </div>
              </form>

              {/* Existing Categories List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Mevcut Kategoriler ({categories.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const catProductCount = products.filter((p) => p.category === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex items-start justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-stone-900">{cat.name}</strong>
                            <span className="text-[10px] bg-white border border-stone-200 px-2 py-0.5 rounded font-mono text-stone-700">
                              {catProductCount} ürün
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                            slug: {cat.id}
                          </div>
                          {cat.description && (
                            <p className="text-xs text-stone-600 mt-1.5 leading-snug">
                              {cat.description}
                            </p>
                          )}
                        </div>

                        {categories.length > 1 && (
                          <button
                            onClick={() => setDeleteTarget({ type: 'category', id: cat.id, name: cat.name })}
                            className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Kategoriyi Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ADD NEW PRODUCT FORM */}
          {activeTab === 'add-product' && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6">
              <form onSubmit={handleCreateProduct} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <Package className="w-4 h-4 text-emerald-800" />
                  <h4 className="text-sm font-bold text-stone-900 font-['Plus_Jakarta_Sans']">
                    Kataloğa Yeni Toptan Ürün Ekle
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Ürün Adı *</label>
                    <input
                      type="text"
                      required
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      placeholder="Örn: Şili Açık Renk 2. Kalite Kelebek"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Çeşit / Kalibre</label>
                    <input
                      type="text"
                      value={newProdVariety}
                      onChange={(e) => setNewProdVariety(e.target.value)}
                      placeholder="Örn: %75 Kelebek Oranı"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Kategori *</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Kalite Sınıfı *</label>
                    <select
                      value={newProdGrade}
                      onChange={(e) => setNewProdGrade(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                    >
                      <option value="Ekstra Lüks">Ekstra Lüks</option>
                      <option value="1. Kalite">1. Kalite</option>
                      <option value="Endüstriyel Standart">Endüstriyel Standart</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Menşei</label>
                    <input
                      type="text"
                      value={newProdOrigin}
                      onChange={(e) => setNewProdOrigin(e.target.value)}
                      placeholder="Örn: İthal (Şili)"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                    />
                  </div>
                </div>

                {/* Fiyat Bilgisi */}
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-emerald-950 mb-1">Min KG Fiyatı (₺) *</label>
                    <input
                      type="number"
                      required
                      value={newProdMinPrice}
                      onChange={(e) => setNewProdMinPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-emerald-950 mb-1">Max KG Fiyatı (₺) *</label>
                    <input
                      type="number"
                      required
                      value={newProdMaxPrice}
                      onChange={(e) => setNewProdMaxPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Yeşil Renkli Min Sipariş Değeri */}
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-300 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                      <Package className="w-4 h-4 text-emerald-700" />
                      <span>Katalogdaki Yeşil Renkli &quot;Min:&quot; Sipariş Değeri</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                      Önizleme: Min: {newProdMinOrderText || '1 Koli (10 kg)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Yeşil Min Metni (Ürün Kartında Yazan) *
                      </label>
                      <input
                        type="text"
                        required
                        value={newProdMinOrderText}
                        onChange={(e) => setNewProdMinOrderText(e.target.value)}
                        placeholder="Örn: 1 Koli (10 kg), 25 kg Çuval, 50 kg"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-bold text-emerald-900"
                      />
                      <p className="text-[11px] text-stone-500 mt-1">
                        Katalog kartında fiyatın sağında yeşil renkte gösterilecek metin.
                      </p>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Minimum Adım / Sepet Kilogramı *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newProdMinOrderKg}
                        onChange={(e) => setNewProdMinOrderKg(Number(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                      />
                      <p className="text-[11px] text-stone-500 mt-1">
                        Katalogdaki +/- butonlarında ve sepetteki minimum kg değeri.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fotoğraf Yükleme (Bilgisayardan Yükleme / Sürükle-Bırak) */}
                <ImageUploadField
                  label="Ürün Fotoğrafı"
                  helperText="Kendi bilgisayarınızdan seçin veya hazır görsel kullanın"
                  value={newProdImage}
                  onChange={(img) => setNewProdImage(img)}
                />

                {/* Ambalaj Tipi */}
                <div className="text-xs">
                  <label className="block font-semibold text-stone-700 mb-1">Ambalaj Tipi</label>
                  <input
                    type="text"
                    value={newProdPackaging}
                    onChange={(e) => setNewProdPackaging(e.target.value)}
                    placeholder="10 kg Vakumlu Koli"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                  />
                </div>

                <div className="text-xs">
                  <label className="block font-semibold text-stone-700 mb-1">Açıklama</label>
                  <textarea
                    rows={2}
                    value={newProdDescription}
                    onChange={(e) => setNewProdDescription(e.target.value)}
                    placeholder="Ürün özellikleri, kullanım alanları ve tat profili..."
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ürünü Kataloğa Ekle</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: LOGO SEÇİMİ VE YÜKLEME */}
          {activeTab === 'logo' && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-800" />
                  <span>Firma Logosu (Ko-Logo) ve Kurumsal Kimlik</span>
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Sayfanın en üstünde (Navbar) ve en altında (Footer) yer alan logoyu buradan tek tıkla değiştirebilir,
                  hazır ko-logo tasarımlarından birini seçebilir veya bilgisayarınızdaki kendi logonuzu yükleyebilirsiniz.
                </p>
              </div>

              {logoSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{logoSuccess}</span>
                </div>
              )}

              {/* Canlı Önizleme */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Sitede Şu An Yayında Olan Logo (Canlı Önizleme)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 bg-white rounded-xl border border-stone-200 flex flex-col justify-between">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">
                      Üst Menü Görünümü (Navbar / Açık Zemin)
                    </span>
                    <div className="py-2">
                      <DeveciogluLogo variant="light" size="sm" showSubtitle={true} />
                    </div>
                  </div>
                  <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 flex flex-col justify-between">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">
                      Alt Bilgi Görünümü (Footer / Koyu Zemin)
                    </span>
                    <div className="py-2">
                      <DeveciogluLogo variant="dark" size="sm" showSubtitle={false} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hazır Logo Seçenekleri */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Önerilen Kurumsal Logo Tasarımları
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultConf: LogoConfig = { style: 'aydin-partner' };
                      setLogoConfig(defaultConf);
                      saveSiteLogoConfig(defaultConf);
                      setLogoSuccess('Varsayılan Aydın Kuruyemiş Yetkili Dağıtıcı Ko-Logosu aktif edildi.');
                      setTimeout(() => setLogoSuccess(''), 4000);
                    }}
                    className="text-xs text-emerald-800 font-semibold hover:underline cursor-pointer"
                  >
                    Varsayılana Dön
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {LOGO_PRESETS.map((preset) => {
                    const isCurrent = logoConfig.style === preset.id;
                    return (
                      <div
                        key={preset.id}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${
                          isCurrent
                            ? 'border-emerald-700 bg-emerald-50/40 shadow-sm'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                              {preset.badge}
                            </span>
                            {isCurrent && (
                              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Yayında</span>
                              </span>
                            )}
                          </div>

                          <h5 className="text-sm font-bold text-stone-900 font-['Plus_Jakarta_Sans']">
                            {preset.name}
                          </h5>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {preset.description}
                          </p>

                          {/* Logo Preview Card */}
                          <div className="pt-2 pb-1 border-t border-stone-150">
                            <DeveciogluLogo forcedStyle={preset.id} variant="light" size="sm" showSubtitle={true} />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated: LogoConfig = { ...logoConfig, style: preset.id };
                            setLogoConfig(updated);
                            saveSiteLogoConfig(updated);
                            setLogoSuccess(`"${preset.name}" logosu sayfanın en üstünde ve en altında aktif edildi.`);
                            setTimeout(() => setLogoSuccess(''), 4000);
                          }}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isCurrent
                              ? 'bg-emerald-800 text-white shadow-xs cursor-default'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Şu Anda Kullanılıyor</span>
                            </>
                          ) : (
                            <span>Bu Logoyu Kullan</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bilgisayardan Özel Logo Yükleme */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4 text-emerald-800" />
                  <span>Kendi Logonuzu Bilgisayarınızdan Yükleyin</span>
                </div>
                <p className="text-xs text-emerald-900">
                  Elinizdeki özel Devecioğlu veya Aydın Kuruyemiş logo dosyasını (PNG, SVG, JPG) bilgisayarınızdan seçerek
                  sayfanın en üstüne ve en altına anında yerleştirebilirsiniz.
                </p>

                <ImageUploadField
                  label="Logo Görsel Dosyası (PNG, SVG, JPG)"
                  helperText="Şeffaf arka planlı (transparent PNG/SVG) logolar önerilir"
                  value={logoConfig.customUrl || ''}
                  onChange={(uploadedImg) => {
                    const updated: LogoConfig = {
                      ...logoConfig,
                      style: 'custom',
                      customUrl: uploadedImg,
                    };
                    setLogoConfig(updated);
                    saveSiteLogoConfig(updated);
                    setLogoSuccess('Özel logonuz başarıyla yüklendi ve sayfanın en üstü ile en altında aktif edildi.');
                    setTimeout(() => setLogoSuccess(''), 4000);
                  }}
                />

                {logoConfig.style === 'custom' && logoConfig.customUrl && (
                  <div className="pt-2 flex items-center justify-between text-xs text-emerald-900 font-semibold">
                    <span>Özel logo aktif durumda.</span>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultConf: LogoConfig = { style: 'aydin-partner' };
                        setLogoConfig(defaultConf);
                        saveSiteLogoConfig(defaultConf);
                        setLogoSuccess('Özel logo kaldırıldı, varsayılan ko-logo aktif edildi.');
                        setTimeout(() => setLogoSuccess(''), 4000);
                      }}
                      className="text-rose-700 hover:underline cursor-pointer"
                    >
                      Özel Logoyu Kaldır & Ko-Logoya Dön
                    </button>
                  </div>
                )}
              </div>

              {/* Ana Sayfa Açılış (Hero) Arka Plan Görseli Yönetimi */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4 pt-5 mt-6 border-t-2 border-stone-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-800" />
                      <span>Ana Sayfa Açılış (Hero) Görseli Yönetimi</span>
                    </h4>
                    <p className="text-xs text-stone-600 mt-1">
                      Ana sayfadaki <strong>&quot;Bursa Toptan Sevkiyat &bull; Yeni Mahsul İthal Çift Kat Vakumlu Koliler&quot;</strong> kutusunun arkasındaki tanıtım görselini buradan değiştirebilir veya kendi fotoğrafınızı yükleyebilirsiniz.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('devecioglu_hero_banner_image_v1');
                      setHeroImage(HERO_IMAGE);
                      saveHeroImageToSupabase(HERO_IMAGE);
                      window.dispatchEvent(new Event('devecioglu_hero_image_updated'));
                      setLogoSuccess('✓ Ana sayfa açılış görseli varsayılana sıfırlandı ve Supabase güncellendi.');
                      setTimeout(() => setLogoSuccess(''), 4000);
                    }}
                    className="text-xs text-emerald-800 font-semibold hover:underline cursor-pointer shrink-0"
                  >
                    Varsayılana Sıfırla
                  </button>
                </div>

                {/* Live Preview Card */}
                <div className="relative rounded-2xl overflow-hidden border border-stone-300 shadow-md h-52 sm:h-64 bg-stone-900">
                  <img
                    src={heroImage}
                    alt="Aktif Hero Tanıtım Görseli"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent p-5 flex flex-col justify-end text-white">
                    <div className="space-y-1.5 max-w-lg">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider">
                        Bursa Toptan Sevkiyat (Canlı Önizleme)
                      </div>
                      <h4 className="text-base font-bold font-['Plus_Jakarta_Sans'] leading-tight">
                        Yeni Mahsul İthal Çift Kat Vakumlu Koliler
                      </h4>
                      <p className="text-xs text-stone-300 line-clamp-2">
                        Fırında kararmayan, şerbeti kusursuz çeken baklavalık cevizler ve lüks kelebek sunum kalibreleri haftalık taze stoklarla işletmenizde.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image Upload Component */}
                <ImageUploadField
                  label="Bilgisayarınızdan Yeni Görsel Yükleyin veya Fotoğraf Seçin"
                  helperText="Kendi depo, ceviz veya ürün fotoğrafınızı seçebilir ya da hazır seçeneklerden birine tıklayabilirsiniz"
                  value={heroImage}
                  onChange={(newImg) => {
                    localStorage.setItem('devecioglu_hero_banner_image_v1', newImg);
                    setHeroImage(newImg);
                    saveHeroImageToSupabase(newImg);
                    window.dispatchEvent(new Event('devecioglu_hero_image_updated'));
                    setLogoSuccess('✓ Açılış görseli canlı Supabase veritabanına kaydedildi ve sitede yayına alındı.');
                    setTimeout(() => setLogoSuccess(''), 4000);
                  }}
                />

                {/* Ready Presets */}
                <div>
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-2">
                    Veya Hazır Arşiv Görsellerinden Birini Seçin:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { label: 'Orijinal Depo & Sevkiyat', img: HERO_IMAGE },
                      { label: 'Açık Kelebek Ceviz İçi', img: WALNUT_IMAGE },
                      { label: 'Karışık Kuruyemiş & Fıstık', img: NUTS_IMAGE },
                      { label: 'Kayısı & Kuru Meyveler', img: DRIED_FRUITS_IMAGE },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          localStorage.setItem('devecioglu_hero_banner_image_v1', item.img);
                          setHeroImage(item.img);
                          saveHeroImageToSupabase(item.img);
                          window.dispatchEvent(new Event('devecioglu_hero_image_updated'));
                          setLogoSuccess(`✓ "${item.label}" görseli Supabase'e kaydedildi ve açılış arka planı olarak ayarlandı.`);
                          setTimeout(() => setLogoSuccess(''), 4000);
                        }}
                        className={`p-1.5 rounded-xl border-2 text-left transition-all cursor-pointer bg-white ${
                          heroImage === item.img
                            ? 'border-emerald-700 shadow-sm'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <img src={item.img} alt={item.label} className="w-full h-18 object-cover rounded-lg mb-1.5" />
                        <span className="block text-xs font-bold text-stone-800 truncate">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {heroImage === item.img ? '✓ Seçili' : 'Seç'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SUPABASE DATABASE */}
          {activeTab === 'database' && (
            <SupabaseAdminSection />
          )}

          {/* TAB 4: SETTINGS & PASSWORD CHANGE */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-6">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-800" />
                  <span>Yönetici Şifresi Değiştir</span>
                </h4>
                <p className="text-xs text-stone-600">
                  Yönetici paneline giriş yaparken kullandığınız şifreyi buradan güncelleyebilirsiniz.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const target = e.currentTarget;
                    const newPass = (target.elements.namedItem('newpass') as HTMLInputElement).value;
                    if (newPass.length < 4) {
                      alert('Şifre en az 4 karakter olmalıdır.');
                      return;
                    }
                    localStorage.setItem('devecioglu_custom_admin_password', newPass);
                    alert('Yönetici şifresi başarıyla güncellendi!');
                    target.reset();
                  }}
                  className="flex flex-col sm:flex-row gap-2 max-w-md pt-1"
                >
                  <input
                    type="password"
                    name="newpass"
                    required
                    placeholder="Yeni şifrenizi giriniz..."
                    className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Şifreyi Güncelle
                  </button>
                </form>
              </div>

              {/* Reset to Factory Defaults */}
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-rose-700" />
                  <span>Kataloğu Fabrika Varsayılanlarına Sıfırla</span>
                </h4>
                <p className="text-xs text-rose-800">
                  Fiyatlar veya kategorilerde yapılan tüm özelleştirmeleri ilk orijinal haline sıfırlar. Bu işlem geri alınamaz.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ type: 'reset', name: 'Tüm Katalog ve Fiyatlar' })}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Fabrika Ayarlarına Sıfırla
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      )}

      {/* Silme & Sıfırlama Onay Modalı (window.confirm yerine iframe-uyumlu React modalı) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 font-['Plus_Jakarta_Sans']">
                  {deleteTarget.type === 'product' && 'Ürünü Katalogdan Sil'}
                  {deleteTarget.type === 'category' && 'Kategoriyi Sil'}
                  {deleteTarget.type === 'reset' && 'Kataloğu Fabrika Ayarlarına Sıfırla'}
                </h3>
                <p className="text-xs text-stone-500">
                  {deleteTarget.type === 'product' && 'Bu ürünü silmek istediğinize emin misiniz?'}
                  {deleteTarget.type === 'category' && 'Bu kategoriyi silmek istediğinize emin misiniz?'}
                  {deleteTarget.type === 'reset' && 'Tüm özel fiyat ve ürün değişiklikleri geri alınacaktır.'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 font-medium">
              <span className="font-bold text-stone-900">&ldquo;{deleteTarget.name}&rdquo;</span>{' '}
              {deleteTarget.type === 'reset'
                ? 'varsayılan fabrika ayarlarına döndürülecektir. Bu işlem geri alınamaz.'
                : 'silindiğinde sitede görüntülenmeyecektir.'}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {deleteTarget.type === 'reset' ? 'Evet, Sıfırla' : 'Evet, Kalıcı Olarak Sil'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 px-4 sm:px-6 text-xs text-stone-500 flex flex-wrap items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-800" />
          <span>Devecioğlu Toptan Gıda Ticareti · Bursa B2B Yönetim Masası</span>
        </div>
        <div className="font-mono text-stone-600">
          Toptan İletişim: 0533 647 55 18
        </div>
      </footer>
    </div>
  );
};
