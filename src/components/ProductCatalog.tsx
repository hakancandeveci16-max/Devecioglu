import React, { useState, useMemo } from 'react';
import { Product, ProductCategory, ProductGrade, CategoryItem } from '../types';
import { Search, Plus, Minus, Check, Eye, SlidersHorizontal, Sparkles } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  categories: CategoryItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddToCart: (product: Product, quantityKg: number) => void;
  onSelectProductDetails: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  searchQuery,
  setSearchQuery,
  onAddToCart,
  onSelectProductDetails,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedGrade, setSelectedGrade] = useState<ProductGrade | 'all'>('all');
  const [selectedUsage, setSelectedUsage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  // Quantities per product card in catalog
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [addedAnimation, setAddedAnimation] = useState<Record<string, boolean>>({});

  const USAGE_OPTIONS = [
    'Tümü',
    'Baklava & Şerbetli Tatlı',
    'Lüks Sunum & Meze',
    'Mutfak & Salata',
    'Pasta & Kek',
    'Restoran İkram',
  ];

  // Filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      // Grade filter
      if (selectedGrade !== 'all' && item.grade !== selectedGrade) return false;
      // Usage filter
      if (selectedUsage !== 'all' && !item.bestFor.some((bf) => bf.toLowerCase().includes(selectedUsage.toLowerCase()))) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesVariety = item.variety.toLowerCase().includes(query);
        const matchesOrigin = item.origin.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesBestFor = item.bestFor.some((b) => b.toLowerCase().includes(query));
        if (!matchesName && !matchesVariety && !matchesOrigin && !matchesDesc && !matchesBestFor) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.minPrice - b.minPrice;
      if (sortBy === 'price-desc') return b.maxPrice - a.maxPrice;
      return 0;
    });
  }, [selectedCategory, selectedGrade, selectedUsage, searchQuery, sortBy]);

  const handleQtyChange = (productId: string, delta: number, minKg: number) => {
    setItemQuantities((prev) => {
      const current = prev[productId] || minKg;
      const next = Math.max(minKg, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleAdd = (product: Product) => {
    const qty = itemQuantities[product.id] || product.minOrderKg;
    onAddToCart(product, qty);
    setAddedAnimation((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedAnimation((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <section id="kuruyemis-katalogu" className="py-14 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Devecioğlu Toptan Ürün Kataloğu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-['Plus_Jakarta_Sans']">
              İthal Ceviz, Kuruyemiş ve Kuru Meyve Çeşitleri
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Bursa restoranları ve gıda imalatçıları için güncel ürünler, kalite sınıfları ve gösterge fiyat aralıkları.
            </p>
          </div>

          <div className="text-xs text-stone-500 bg-stone-50 px-3.5 py-2 rounded-lg border border-stone-200 self-start md:self-auto">
            <span>Listelenen: </span>
            <strong className="text-stone-900 font-bold tabular-nums">{filteredProducts.length}</strong>
            <span> çeşit ürün</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/90 mb-8 space-y-4">
          
          {/* Row 1: Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-700 mr-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Kategori:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              Tüm Ürünler ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Row 2: Secondary Filters & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-200">
            {/* Grade Filter */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-stone-600">Kalite Sınıfı:</span>
              {(['all', 'Ekstra Lüks', '1. Kalite', 'Endüstriyel Standart'] as const).map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    selectedGrade === grade
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {grade === 'all' ? 'Tümü' : grade}
                </button>
              ))}
            </div>

            {/* Usage Filter & Sort */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-600">
                <span>Kullanım Alanı:</span>
                <select
                  value={selectedUsage}
                  onChange={(e) => setSelectedUsage(e.target.value)}
                  className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  {USAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt === 'Tümü' ? 'all' : opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-stone-600">
                <span>Sıralama:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="default">Önerilen Sıralama</option>
                  <option value="price-asc">Fiyata Göre (Önce Düşük)</option>
                  <option value="price-desc">Fiyata Göre (Önce Yüksek)</option>
                </select>
              </div>

              {/* Clear filters if active */}
              {(selectedCategory !== 'all' || selectedGrade !== 'all' || selectedUsage !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedGrade('all');
                    setSelectedUsage('all');
                    setSearchQuery('');
                  }}
                  className="text-xs text-rose-700 hover:text-rose-900 underline font-semibold cursor-pointer"
                >
                  Filtreleri Sıfırla
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-16 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300">
            <Search className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-stone-800">Aramanıza uygun ürün bulunamadı</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Farklı bir arama kelimesi deneyebilir veya filtreleri temizleyerek tüm kataloğu görebilirsiniz.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedGrade('all');
                setSelectedUsage('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              Tüm Ürünleri Göster
            </button>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const currentQty = itemQuantities[product.id] || product.minOrderKg;
            const isAdded = addedAnimation[product.id];

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md hover:border-stone-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Product Image Slot */}
                  <div className="relative h-56 bg-stone-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Overlay Subtle Badge for Origin */}
                    <div className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                      {product.origin}
                    </div>

                    <button
                      onClick={() => onSelectProductDetails(product)}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-stone-800 rounded-lg shadow-sm transition-all hover:scale-105 cursor-pointer"
                      title="Detaylı İncele"
                      aria-label="Detaylı Özellikler"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Product Body */}
                  <div className="p-5">
                    {/* Unboxed Metadata with · separator */}
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-1">
                      <span className="text-emerald-800 font-semibold">{product.grade}</span>
                      <span aria-hidden="true">·</span>
                      <span>{product.packaging}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-600">{product.origin}</span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onSelectProductDetails(product)}
                      className="text-base font-bold text-stone-900 font-['Plus_Jakarta_Sans'] leading-snug hover:text-emerald-800 transition-colors cursor-pointer"
                    >
                      {product.name}
                    </h3>

                    {/* Variety and Description */}
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Best For Tags (Unboxed inline tags) */}
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-stone-600">
                      {product.bestFor.map((bf, i) => (
                        <span key={i} className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                          {bf}
                        </span>
                      ))}
                    </div>

                    {/* Indicative Price Band */}
                    <div className="mt-4 pt-3 border-t border-stone-150 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">
                          Gösterge Fiyat Bandı
                        </span>
                        <div className="text-lg font-extrabold text-stone-900 font-mono tracking-tight tabular-nums">
                          {product.indicativePriceRange}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-emerald-800 font-semibold">
                        {product.minOrderText?.trim().toLowerCase().startsWith('min')
                          ? product.minOrderText
                          : `Min: ${product.minOrderText || `${product.minOrderKg || 10} kg`}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Quantity Selector & Add to Quote */}
                <div className="p-5 pt-0">
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between gap-3">
                    
                    {/* Stepper */}
                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-1">
                      <button
                        onClick={() => handleQtyChange(product.id, -10, product.minOrderKg)}
                        className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                        title="10 kg azalt"
                        aria-label="Azalt"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      
                      <span className="text-xs font-bold font-mono text-stone-900 px-2 min-w-14 text-center tabular-nums">
                        {currentQty} kg
                      </span>

                      <button
                        onClick={() => handleQtyChange(product.id, 10, product.minOrderKg)}
                        className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                        title="10 kg artır"
                        aria-label="Artır"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Add to Quote Button */}
                    <button
                      onClick={() => handleAdd(product)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-900 hover:bg-emerald-800 text-white active:scale-98'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Eklendi!</span>
                        </>
                      ) : (
                        <span>Teklife Ekle</span>
                      )}
                    </button>

                  </div>
                  <div className="text-[10px] text-stone-500 text-center mt-1.5">
                    *Teklif sepetinden WhatsApp üzerinden tek tıkla iletebilirsiniz
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
