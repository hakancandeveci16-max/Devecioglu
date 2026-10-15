import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, CategoryItem, SampleRequest } from '../types';
import { PRODUCTS, INITIAL_CATEGORIES } from '../data/products';

const SUPABASE_URL_KEY = 'devecioglu_supabase_url';
const SUPABASE_ANON_KEY = 'devecioglu_supabase_anon_key';

export const DEFAULT_PROJECT_URL = 'https://dxfqelrnextwsryhgihd.supabase.co';
export const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZnFlbHJuZXh0d3NyeWhnaWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5NzY1MDAsImV4cCI6MjEwNzU1MjUwMH0.0W2jwY0oPObAJSQUGSuLCWd_inD_kpI8k1_CurNPhF8';
export const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_P_2g5155NeVEF9DnD8pFmA_ZOh4ak4Y';

export const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(SUPABASE_URL_KEY) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(SUPABASE_ANON_KEY) || '' : '';

  const url = storedUrl || envUrl || DEFAULT_PROJECT_URL;
  const key = storedKey || envKey || DEFAULT_ANON_KEY;

  return { url, key, isConfigured: Boolean(url && key) };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(SUPABASE_URL_KEY, url.trim());
    else localStorage.removeItem(SUPABASE_URL_KEY);

    if (key) localStorage.setItem(SUPABASE_ANON_KEY, key.trim());
    else localStorage.removeItem(SUPABASE_ANON_KEY);

    // Reset client instance
    supabaseInstance = null;
    window.dispatchEvent(new Event('devecioglu_supabase_config_updated'));
  }
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: false,
        },
      });
    } catch (err) {
      console.error('Supabase client initialization error:', err);
      return null;
    }
  }

  return supabaseInstance;
};

// Map DB row to Product object (supports both snake_case and camelCase)
export const mapRowToProduct = (row: any): Product => {
  return {
    id: row.id,
    name: row.name || '',
    category: row.category || 'ceviz',
    variety: row.variety || '',
    grade: row.grade || '1. Kalite',
    origin: row.origin || '',
    indicativePriceRange: row.indicative_price_range || row.indicativePriceRange || '',
    minPrice: Number(row.min_price ?? row.minPrice ?? 0),
    maxPrice: Number(row.max_price ?? row.maxPrice ?? 0),
    unit: (row.unit === 'koli' ? 'koli' : 'kg'),
    minOrderKg: Number(row.min_order_kg ?? row.minOrderKg ?? 10),
    minOrderText: row.min_order_text || row.minOrderText || '1 Koli (10 kg)',
    bestFor: Array.isArray(row.best_for)
      ? row.best_for
      : Array.isArray(row.bestFor)
      ? row.bestFor
      : typeof row.best_for === 'string'
      ? JSON.parse(row.best_for || '[]')
      : [],
    packaging: row.packaging || '10 kg Vakumlu Koli',
    moistureRate: row.moisture_rate || row.moistureRate || undefined,
    colorGrade: row.color_grade || row.colorGrade || '',
    description: row.description || '',
    features: Array.isArray(row.features)
      ? row.features
      : typeof row.features === 'string'
      ? JSON.parse(row.features || '[]')
      : [],
    image: row.image || '',
    inStock: row.in_stock !== undefined ? Boolean(row.in_stock) : row.inStock !== undefined ? Boolean(row.inStock) : true,
  };
};

// Map Product object to DB row (matches live Supabase table columns)
export const mapProductToRow = (p: Product) => {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    variety: p.variety,
    grade: p.grade,
    origin: p.origin,
    indicativePriceRange: p.indicativePriceRange,
    minPrice: p.minPrice,
    maxPrice: p.maxPrice,
    unit: p.unit,
    minOrderKg: p.minOrderKg,
    minOrderText: p.minOrderText,
    bestFor: p.bestFor,
    packaging: p.packaging,
    moistureRate: p.moistureRate || null,
    colorGrade: p.colorGrade,
    description: p.description,
    features: p.features,
    image: p.image,
    inStock: p.inStock,
  };
};

// Test Connection
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const client = getSupabaseClient();
  const { url } = getSupabaseConfig();

  if (!url) {
    return {
      success: false,
      message: 'Supabase Project URL tanımlı değil. Lütfen URL girin (Örn: https://xxxx.supabase.co).',
    };
  }

  if (!client) {
    return {
      success: false,
      message: 'Supabase istemcisi başlatılamadı. URL ve API anahtarınızı kontrol edin.',
    };
  }

  try {
    const { data, error } = await client.from('products').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Bağlantı sağlandı ancak "products" tablosu bulunamadı. Lütfen SQL Editor kodunu çalıştırın.',
        };
      }
      return {
        success: false,
        message: `Supabase Hatası (${error.code || 'Bilinmiyor'}): ${error.message}`,
      };
    }
    return {
      success: true,
      message: `Supabase bağlantısı başarılı! Tablolar erişilebilir durumda (${data?.length || 0} ürün okundu).`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Bağlantı hatası: ${err.message || 'Sunucuya ulaşılamadı'}`,
    };
  }
};

// Products API
export const fetchProductsFromSupabase = async (): Promise<Product[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('products').select('*').order('created_at', { ascending: true });
    if (error) {
      console.warn('Supabase products fetch failed:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      const mapped = data.map(mapRowToProduct);
      try {
        const order = await fetchProductOrderFromSupabase();
        if (order && Array.isArray(order) && order.length > 0) {
          const orderMap = new Map<string, number>();
          order.forEach((id, idx) => orderMap.set(id, idx));
          mapped.sort((a, b) => {
            const indexA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
            const indexB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
            return indexA - indexB;
          });
        }
      } catch (err) {
        console.warn('Could not sort products by custom order:', err);
      }
      return mapped;
    }
    return [];
  } catch (err) {
    console.error('Supabase products error:', err);
    return null;
  }
};

export const saveProductToSupabase = async (product: Product): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = mapProductToRow(product);
    const { error } = await client.from('products').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Supabase product upsert error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase product save error:', err);
    return false;
  }
};

export const deleteProductFromSupabase = async (productId: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('products').delete().eq('id', productId);
    if (error) {
      console.error('Supabase product delete error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase product delete error:', err);
    return false;
  }
};

// Categories API
export const fetchCategoriesFromSupabase = async (): Promise<CategoryItem[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('categories').select('*').order('created_at', { ascending: true });
    if (error) {
      console.warn('Supabase categories fetch failed:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
      }));
    }
    return [];
  } catch (err) {
    console.error('Supabase categories error:', err);
    return null;
  }
};

export const saveCategoryToSupabase = async (cat: CategoryItem): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('categories').upsert({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
    }, { onConflict: 'id' });
    if (error) {
      console.error('Supabase category upsert error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase category save error:', err);
    return false;
  }
};

export const deleteCategoryFromSupabase = async (categoryId: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('categories').delete().eq('id', categoryId);
    if (error) {
      console.error('Supabase category delete error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase category delete error:', err);
    return false;
  }
};

// Sample Requests API (Sipariş & Numune Taleplerini Supabase'e kaydetme)
export const saveSampleRequestToSupabase = async (request: SampleRequest): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('sample_requests').insert({
      business_name: request.businessName,
      contact_name: request.contactName,
      phone: request.phone,
      district: request.district,
      address: request.address,
      business_type: request.businessType,
      selected_product_ids: request.selectedProductIds,
      notes: request.notes || null,
      status: 'Yeni',
      created_at: new Date().toISOString(),
    });
    if (error) {
      console.error('Supabase sample request insert error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase sample request save error:', err);
    return false;
  }
};

export const fetchSampleRequestsFromSupabase = async (): Promise<any[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('sample_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return null;
    return data;
  } catch (err) {
    console.error('Supabase sample requests error:', err);
    return null;
  }
};

// Seed default products and categories to Supabase
export const seedSupabaseDatabase = async (): Promise<{ success: boolean; count: number; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, message: 'Supabase istemcisi hazır değil. URL ve anahtarınızı girin.' };
  }

  try {
    // 1. Seed Categories (if table exists)
    try {
      for (const cat of INITIAL_CATEGORIES) {
        await client.from('categories').upsert({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
        }, { onConflict: 'id' });
      }
    } catch {
      // Ignore if table does not exist yet
    }

    // 2. Seed Products
    let count = 0;
    for (const p of PRODUCTS) {
      const row = mapProductToRow(p);
      const { error } = await client.from('products').upsert(row, { onConflict: 'id' });
      if (!error) count++;
    }

    return {
      success: true,
      count,
      message: `${count} adet ürün ve ${INITIAL_CATEGORIES.length} kategori Supabase veritabanına başarıyla aktarıldı.`,
    };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      message: `Veri aktarım hatası: ${err.message || 'Bilinmeyen hata'}`,
    };
  }
};

// ====================================================================
// SİTE AYARLARI (LOGO VE HERO BANNER) API
// ====================================================================

export const saveSiteSettingToSupabase = async (key: string, value: any): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('site_settings').upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });
    if (error) {
      console.error(`Supabase site_settings (${key}) upsert error:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Supabase site_settings (${key}) error:`, err);
    return false;
  }
};

export const fetchSiteSettingFromSupabase = async (key: string): Promise<any | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('site_settings').select('value').eq('key', key).maybeSingle();
    if (error || !data) return null;
    return data.value;
  } catch {
    return null;
  }
};

export const saveSiteLogoToSupabase = async (config: any): Promise<boolean> => {
  return await saveSiteSettingToSupabase('site_logo', config);
};

export const fetchSiteLogoFromSupabase = async (): Promise<any | null> => {
  return await fetchSiteSettingFromSupabase('site_logo');
};

export const saveHeroImageToSupabase = async (imageUrl: string): Promise<boolean> => {
  return await saveSiteSettingToSupabase('hero_banner_image', { url: imageUrl });
};

export const fetchHeroImageFromSupabase = async (): Promise<string | null> => {
  const res = await fetchSiteSettingFromSupabase('hero_banner_image');
  return res?.url || null;
};

export const saveProductOrderToSupabase = async (productIds: string[]): Promise<boolean> => {
  return await saveSiteSettingToSupabase('product_order', productIds);
};

export const fetchProductOrderFromSupabase = async (): Promise<string[] | null> => {
  return await fetchSiteSettingFromSupabase('product_order');
};
