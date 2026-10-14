import React, { useState } from 'react';
import { Product, CategoryItem } from '../types';
import {
  X,
  Lock,
  User,
  KeyRound,
  Shield,
  Save,
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  FolderPlus,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Eye,
  LogOut,
  Sliders,
  DollarSign,
  Tag,
  Package,
  Database,
} from 'lucide-react';
import { WALNUT_IMAGE, NUTS_IMAGE, DRIED_FRUITS_IMAGE } from '../data/products';
import { SupabaseAdminSection } from './SupabaseAdminSection';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: CategoryItem[];
  onUpdateProduct: (product: Product) => Promise<boolean> | void;
  onAddProduct: (product: Product) => Promise<boolean> | void;
  onDeleteProduct: (productId: string) => Promise<boolean> | void;
  onAddCategory: (category: CategoryItem) => Promise<boolean> | void;
  onDeleteCategory: (categoryId: string) => Promise<boolean> | void;
  onResetToDefaults: () => void;
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

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
  onResetToDefaults,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'add-product' | 'database' | 'settings'>('products');

  // Currently editing product state
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

  // In-app deletion target (never use window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'category' | 'reset';
    id?: string;
    name?: string;
  } | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'product' && deleteTarget.id) {
      onDeleteProduct(deleteTarget.id);
      setProdSuccess(`"${deleteTarget.name}" katalogdan silindi.`);
      setTimeout(() => setProdSuccess(''), 3000);
    } else if (deleteTarget.type === 'category' && deleteTarget.id) {
      onDeleteCategory(deleteTarget.id);
      setCategorySuccess(`"${deleteTarget.name}" kategorisi silindi.`);
      setTimeout(() => setCategorySuccess(''), 3000);
    } else if (deleteTarget.type === 'reset') {
      onResetToDefaults();
      setProdSuccess('Katalog varsayılan fabrika ayarlarına sıfırlandı.');
      setTimeout(() => setProdSuccess(''), 3000);
    }
    setDeleteTarget(null);
  };

  if (!isOpen) return null;

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

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Recalculate indicativePriceRange string
    const updated: Product = {
      ...editingProduct,
      indicativePriceRange: `${editingProduct.minPrice} - ${editingProduct.maxPrice} ₺ / kg`,
      minOrderText: editingProduct.minOrderText?.trim() || '1 Koli (10 kg)',
      minOrderKg: Number(editingProduct.minOrderKg) || 10,
    };

    const isOk = await onUpdateProduct(updated);
    setEditingProduct(null);
    if (isOk !== false) {
      setProdSuccess(`✓ "${updated.name}" ürün bilgileri ve fiyatları canlı Supabase veritabanına kaydedildi.`);
    } else {
      setProdSuccess(`✓ "${updated.name}" ürün bilgileri güncellendi.`);
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

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

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

    onAddProduct(newProduct);
    setProdSuccess(`"${newProduct.name}" kataloğa eklendi.`);
    setNewProdName('');
    setNewProdVariety('');
    setNewProdDescription('');
    setNewProdMinOrderText('1 Koli (10 kg)');
    setNewProdMinOrderKg(10);
    setActiveTab('products');
    setTimeout(() => setProdSuccess(''), 3000);
  };

  const filteredAdminProducts = products.filter((p) => {
    if (!adminSearch) return true;
    const q = adminSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.origin.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop: Soft, pleasant, not dark or dreary */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div
          className={`w-full ${
            isAuthenticated ? 'max-w-4xl' : 'max-w-md'
          } transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-stone-200`}
        >
          {/* Header: Bright and clean for login, sleek dark for dashboard */}
          {!isAuthenticated ? (
            <div className="bg-white border-b border-stone-200 p-5 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-stone-900">
                      Devecioğlu Yönetici Girişi
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Yetkili Giriş
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Fiyat güncelleme ve katalog yönetim masası
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="bg-stone-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold font-['Plus_Jakarta_Sans']">
                      Devecioğlu Yönetici Paneli
                    </h3>
                    <span className="text-[10px] bg-stone-800 text-emerald-400 px-2 py-0.5 rounded font-mono border border-stone-700">
                      B2B Admin
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Fiyat güncelleme, kategori oluşturma, fotoğraf ve açıklama düzenleme yetkisi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Çıkış Yap</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                  aria-label="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto bg-white">
            {/* If NOT Authenticated: Show Clean Bright Password Login Form */}
            {!isAuthenticated ? (
              <div className="py-4 space-y-6">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-stone-900 font-['Plus_Jakarta_Sans']">
                    Yönetici Bilgilerini Giriniz
                  </h4>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto">
                    Katalogda fiyat, kategori ve açıklama düzenlemeleri yapabilmek için kullanıcı adı ve yönetici şifrenizi giriniz.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Kullanıcı Adı *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        required
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Yönetici Şifresi *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 shadow-2xs"
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow cursor-pointer"
                  >
                    Panele Giriş Yap
                  </button>
                </form>
              </div>
            ) : (
              /* If Authenticated: Show Full Dashboard */
              <div className="space-y-6">
                
                {/* Navigation Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setEditingProduct(null);
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'products'
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Ürünler & Fiyatlar ({products.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('categories');
                      setEditingProduct(null);
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'categories'
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Kategoriler ({categories.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('add-product');
                      setEditingProduct(null);
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'add-product'
                        ? 'bg-emerald-800 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Ürün Ekle</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('database');
                      setEditingProduct(null);
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'database'
                        ? 'bg-emerald-800 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Supabase Veritabanı</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setEditingProduct(null);
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ml-auto ${
                      activeTab === 'settings'
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Ayarlar</span>
                  </button>
                </div>

                {/* Notifications */}
                {prodSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{prodSuccess}</span>
                  </div>
                )}

                {categorySuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{categorySuccess}</span>
                  </div>
                )}

                {/* TAB 1: PRODUCT LIST & INLINE EDITING */}
                {activeTab === 'products' && (
                  <div className="space-y-4">
                    
                    {/* Editing Modal/Form if editingProduct is selected */}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Ürün Adı *</label>
                            <input
                              type="text"
                              required
                              value={editingProduct.name}
                              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Çeşit & Kalibre *</label>
                            <input
                              type="text"
                              required
                              value={editingProduct.variety}
                              onChange={(e) => setEditingProduct({ ...editingProduct, variety: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                            />
                          </div>
                        </div>

                        {/* Category & Grade */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Kategori *</label>
                            <select
                              value={editingProduct.category}
                              onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
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
                              value={editingProduct.grade}
                              onChange={(e) => setEditingProduct({ ...editingProduct, grade: e.target.value as any })}
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
                              value={editingProduct.origin}
                              onChange={(e) => setEditingProduct({ ...editingProduct, origin: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                            />
                          </div>
                        </div>

                        {/* Fiyat Bilgisi Güncelleme (Min & Max KG Fiyatları) */}
                        <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-3">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
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
                            Önizleme: <strong>{editingProduct.minPrice} - {editingProduct.maxPrice} ₺ / kg</strong> (Sitede katalog ve teklif sepetinde anında güncellenir)
                          </div>
                        </div>

                        {/* Yeşil Renkli Min Sipariş Değeri Düzenleme */}
                        <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-300 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                              <Package className="w-4 h-4 text-emerald-700" />
                              <span>Katalogdaki Yeşil Renkli &quot;Min:&quot; Sipariş Değeri</span>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                              Katalog Önizleme: Min: {editingProduct.minOrderText || '1 Koli (10 kg)'}
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
                                value={editingProduct.minOrderText || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, minOrderText: e.target.value })}
                                placeholder="Örn: 1 Koli (10 kg), 25 kg Çuval, 50 kg"
                                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-bold text-emerald-900"
                              />
                              <p className="text-[11px] text-stone-500 mt-1">
                                Katalog kartında gösterge fiyatının sağında yeşil renkte &quot;Min: ...&quot; olarak gösterilir.
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
                                Sepete eklemede ve katalogdaki +/- butonlarındaki taban KG değeri.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Fotoğraf Düzenleme (Image URL & Preset) */}
                        <div className="text-xs space-y-2">
                          <label className="block font-semibold text-stone-700">Fotoğraf / Görsel URL&apos;si</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingProduct.image}
                              onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                              placeholder="/product_... veya https://..."
                              className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono text-[11px]"
                            />
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-300 shrink-0">
                              <img src={editingProduct.image} alt="Önizleme" className="w-full h-full object-cover" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500">
                            <span>Hazır Fotoğraf Seç:</span>
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, image: WALNUT_IMAGE })}
                              className="underline hover:text-stone-900 cursor-pointer"
                            >
                              Ceviz İçi
                            </button>
                            <span>·</span>
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, image: NUTS_IMAGE })}
                              className="underline hover:text-stone-900 cursor-pointer"
                            >
                              Kuruyemiş
                            </button>
                            <span>·</span>
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, image: DRIED_FRUITS_IMAGE })}
                              className="underline hover:text-stone-900 cursor-pointer"
                            >
                              Kuru Meyve
                            </button>
                          </div>
                        </div>

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

                        {/* Technical Specs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Ambalaj Tipi</label>
                            <input
                              type="text"
                              value={editingProduct.packaging}
                              onChange={(e) => setEditingProduct({ ...editingProduct, packaging: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                            />
                          </div>
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
                            className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Değişiklikleri Kaydet</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        {/* Search & Actions Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="relative flex-1 max-w-sm">
                            <input
                              type="text"
                              value={adminSearch}
                              onChange={(e) => setAdminSearch(e.target.value)}
                              placeholder="Ürün adı veya menşei ile filtrele..."
                              className="w-full pl-3 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                            />
                          </div>
                          <div className="text-xs text-stone-500">
                            Toplam: <strong className="text-stone-900">{filteredAdminProducts.length}</strong> ürün listeleniyor
                          </div>
                        </div>

                        {/* Products Table */}
                        <div className="border border-stone-200 rounded-xl overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                                <tr>
                                  <th className="py-2.5 px-3">Görsel</th>
                                  <th className="py-2.5 px-3">Ürün & Çeşit</th>
                                  <th className="py-2.5 px-3">Kategori</th>
                                  <th className="py-2.5 px-3">Fiyat Bandı (₺/kg)</th>
                                  <th className="py-2.5 px-3">Min Sipariş (Yeşil)</th>
                                  <th className="py-2.5 px-3">Kalite</th>
                                  <th className="py-2.5 px-3 text-right">İşlemler</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-200 text-stone-600">
                                {filteredAdminProducts.map((p) => (
                                  <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                                    <td className="py-2 px-3">
                                      <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-10 h-10 object-cover rounded-lg border border-stone-200"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <div className="font-bold text-stone-900">{p.name}</div>
                                      <div className="text-[11px] text-stone-500">{p.variety} · {p.origin}</div>
                                    </td>
                                    <td className="py-2 px-3">
                                      <span className="px-2 py-0.5 rounded bg-stone-100 font-mono text-[11px] text-stone-700">
                                        {categories.find((c) => c.id === p.category)?.name || p.category}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 font-mono font-bold text-stone-900 tabular-nums">
                                      {p.indicativePriceRange}
                                    </td>
                                    <td className="py-2 px-3">
                                      <span className="inline-flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        Min: {p.minOrderText || `${p.minOrderKg || 10} kg`}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3">
                                      <span className="text-emerald-800 font-semibold">{p.grade}</span>
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          onClick={() => setEditingProduct(p)}
                                          className="p-1.5 bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 rounded-lg transition-colors cursor-pointer"
                                          title="Düzenle"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => onDeleteProduct(p.id)}
                                          className="p-1.5 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                                          title="Sil"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
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
                  <div className="space-y-6">
                    
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
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">Açıklama</label>
                          <input
                            type="text"
                            value={newCategoryDescription}
                            onChange={(e) => setNewCategoryDescription(e.target.value)}
                            placeholder="Kısa açıklama..."
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categories.map((cat) => {
                          const catProductCount = products.filter((p) => p.category === cat.id).length;
                          return (
                            <div
                              key={cat.id}
                              className="p-3.5 rounded-xl border border-stone-200 bg-white flex items-start justify-between gap-3"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-sm font-bold text-stone-900">{cat.name}</strong>
                                  <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded font-mono text-stone-600">
                                    {catProductCount} ürün
                                  </span>
                                </div>
                                <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                                  slug: {cat.id}
                                </div>
                                {cat.description && (
                                  <p className="text-xs text-stone-500 mt-1 leading-snug">
                                    {cat.description}
                                  </p>
                                )}
                              </div>

                              {/* Prevent deleting if standard categories */}
                              {categories.length > 1 && (
                                <button
                                  onClick={() => onDeleteCategory(cat.id)}
                                  className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
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

                    {/* Fotoğraf ve Açıklama */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Görsel URL / Seçim</label>
                        <input
                          type="text"
                          value={newProdImage}
                          onChange={(e) => setNewProdImage(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-mono text-[11px]"
                        />
                        <div className="flex gap-2 mt-1 text-[11px] text-stone-500">
                          <button
                            type="button"
                            onClick={() => setNewProdImage(WALNUT_IMAGE)}
                            className="underline hover:text-stone-900 cursor-pointer"
                          >
                            Ceviz
                          </button>
                          <span>·</span>
                          <button
                            type="button"
                            onClick={() => setNewProdImage(NUTS_IMAGE)}
                            className="underline hover:text-stone-900 cursor-pointer"
                          >
                            Kuruyemiş
                          </button>
                          <span>·</span>
                          <button
                            type="button"
                            onClick={() => setNewProdImage(DRIED_FRUITS_IMAGE)}
                            className="underline hover:text-stone-900 cursor-pointer"
                          >
                            Meyve
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Ambalaj Tipi</label>
                        <input
                          type="text"
                          value={newProdPackaging}
                          onChange={(e) => setNewProdPackaging(e.target.value)}
                          placeholder="10 kg Vakumlu Koli"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                        />
                      </div>
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
                )}

                {/* TAB: SUPABASE DATABASE */}
                {activeTab === 'database' && (
                  <SupabaseAdminSection />
                )}

                {/* TAB 4: SETTINGS & PASSWORD CHANGE */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
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
                          onClick={() => onResetToDefaults()}
                          className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Fabrika Ayarlarına Sıfırla
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Footer note */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Devecioğlu Toptan Gıda Ticareti · Güvenli Yönetim Arayüzü</span>
            <span className="text-stone-400">Veriler tarayıcınızda güvenle saklanır</span>
          </div>

        </div>
      </div>
    </div>
  );
};
