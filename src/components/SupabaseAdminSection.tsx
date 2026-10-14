import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  UploadCloud,
  FileCode2,
  KeyRound,
  Globe,
  Sparkles,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  seedSupabaseDatabase,
  DEFAULT_PUBLISHABLE_KEY,
} from '../lib/supabase';

export const SUPABASE_SQL_CODE = `-- ====================================================================
-- DEVECİOĞLU TOPTAN GIDA - SUPABASE VERİTABANI KURULUM KODU
-- Supabase Panelinde "SQL Editor" -> "New query" açıp bu kodları yapıştırın ve "RUN" butonuna tıklayın.
-- ====================================================================

-- 1. KATEGORİLER TABLOSU
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. ÜRÜNLER TABLOSU
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    variety TEXT,
    grade TEXT,
    origin TEXT,
    indicative_price_range TEXT,
    min_price NUMERIC DEFAULT 0,
    max_price NUMERIC DEFAULT 0,
    unit TEXT DEFAULT 'kg',
    min_order_kg NUMERIC DEFAULT 10,
    min_order_text TEXT DEFAULT '1 Koli (10 kg)',
    best_for JSONB DEFAULT '[]'::jsonb,
    packaging TEXT,
    moisture_rate TEXT,
    color_grade TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    image TEXT,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. NUMUNE VE SİPARİŞ TALEPLERİ TABLOSU
CREATE TABLE IF NOT EXISTS public.sample_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    district TEXT,
    address TEXT,
    business_type TEXT,
    selected_product_ids JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    status TEXT DEFAULT 'Yeni',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. SİTE AYARLARI TABLOSU (Logo, Hero Banner vb.)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- GÜVENLİK (ROW LEVEL SECURITY - RLS) POLİTİKALARI
-- ====================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Categories Politikaları
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow All Modify Categories" ON public.categories;
CREATE POLICY "Allow All Modify Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Products Politikaları
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow All Modify Products" ON public.products;
CREATE POLICY "Allow All Modify Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Sample Requests Politikaları
DROP POLICY IF EXISTS "Public Insert Sample Requests" ON public.sample_requests;
CREATE POLICY "Public Insert Sample Requests" ON public.sample_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Sample Requests" ON public.sample_requests;
CREATE POLICY "Public Read Sample Requests" ON public.sample_requests FOR SELECT USING (true);

-- Site Settings Politikaları
DROP POLICY IF EXISTS "Public Read Site Settings" ON public.site_settings;
CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow All Modify Site Settings" ON public.site_settings;
CREATE POLICY "Allow All Modify Site Settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- BAŞLANGIÇ KATEGORİLERİNİ EKLE
-- ====================================================================
INSERT INTO public.categories (id, name, description)
VALUES 
    ('ceviz', 'İthal Ceviz İçi', 'Şili ve California menşeili seçme kelebek, çeyrek ve baklavalık cevizler'),
    ('kuruyemis', 'Kuruyemiş & Fıstık', 'Giresun fındığı, boz iç Antep fıstığı, kaju ve badem'),
    ('kuru-meyve', 'Kuru Meyve & Hurma', 'Malatya günkurusu kayısı, Medine ve Kudüs jumbo hurmaları')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;
`;

export const SupabaseAdminSection: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [seedStatus, setSeedStatus] = useState<'idle' | 'seeding' | 'success' | 'error'>('idle');
  const [seedMessage, setSeedMessage] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const config = getSupabaseConfig();
    setUrlInput(config.url || '');
    setKeyInput(config.key || DEFAULT_PUBLISHABLE_KEY);

    if (config.isConfigured) {
      testConnectionSilently();
    }
  }, []);

  const testConnectionSilently = async () => {
    const res = await testSupabaseConnection();
    if (res.success) {
      setStatus('success');
      setStatusMessage(res.message);
    } else {
      setStatus('error');
      setStatusMessage(res.message);
    }
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('testing');
    setStatusMessage('Supabase ile bağlantı kuruluyor...');

    saveSupabaseConfig(urlInput.trim(), keyInput.trim());

    const result = await testSupabaseConnection();
    if (result.success) {
      setStatus('success');
      setStatusMessage(result.message);
    } else {
      setStatus('error');
      setStatusMessage(result.message);
    }
  };

  const handleSeedDatabase = async () => {
    setSeedStatus('seeding');
    setSeedMessage('Ürünler ve kategoriler Supabase veritabanına aktarılıyor...');

    const result = await seedSupabaseDatabase();
    if (result.success) {
      setSeedStatus('success');
      setSeedMessage(result.message);
      // Trigger update event to reload data in parent App
      window.dispatchEvent(new Event('devecioglu_supabase_config_updated'));
      setTimeout(() => setSeedStatus('idle'), 5000);
    } else {
      setSeedStatus('error');
      setSeedMessage(result.message);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_CODE);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. STATUS & CREDENTIALS CARD */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200 shrink-0">
              <Database className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <span>Supabase Bulut Veritabanı Entegrasyonu</span>
              </h3>
              <p className="text-xs text-stone-500">
                Yönetici panelinden yapılan tüm ürün, fiyat ve kategori değişikliklerini kalıcı olarak saklar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status === 'success' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Canlı Bağlantı Aktif</span>
              </span>
            ) : status === 'error' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Kurulum Bekliyor</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium border border-stone-200">
                <Globe className="w-3.5 h-3.5" />
                <span>Yapılandırma Gerekli</span>
              </span>
            )}
          </div>
        </div>

        {/* Config Form */}
        <form onSubmit={handleSaveAndTest} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Project URL */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
                <span>Supabase Project URL</span>
                <span className="text-[11px] font-normal text-stone-500">https://xxxx.supabase.co</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Supabase Dashboard ➔ Project Settings ➔ API bölümünde yer alan <strong>Project URL</strong> değeridir.
              </p>
            </div>

            {/* Publishable API Key */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
                <span>Supabase Publishable / Anon API Key</span>
                <span className="text-[11px] font-normal text-emerald-800">sb_publishable_...</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="sb_publishable_... veya anon public key"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                İlettiğiniz publishable anahtar otomatik tanımlıdır.
              </p>
            </div>

          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-stone-500">
              *Bilgiler tarayıcınızda ve ortamınızda güvenle saklanır, harici sunucuya iletilmez.
            </div>

            <button
              type="submit"
              disabled={status === 'testing'}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {status === 'testing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Bağlantı Test Ediliyor...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Kaydet ve Bağlantıyı Test Et</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Status Feedback Message */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
              status === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed font-medium">{statusMessage}</div>
          </div>
        )}
      </div>

      {/* 2. SYNC & SEED ACTION */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-stone-900 font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-emerald-700" />
              <span>Tek Tıkla Başlangıç Kataloğunu Supabase&apos;e Yükle</span>
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              Mevcut 10 adet ceviz ve kuruyemiş ürününü ve 3 kategoriyi doğrudan Supabase tablonuza aktarır.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSeedDatabase}
            disabled={seedStatus === 'seeding'}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-60"
          >
            {seedStatus === 'seeding' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Yükleniyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Verileri Supabase&apos;e Aktar</span>
              </>
            )}
          </button>
        </div>

        {seedMessage && (
          <div
            className={`p-3 rounded-lg text-xs font-medium border ${
              seedStatus === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {seedMessage}
          </div>
        )}
      </div>

      {/* 3. SQL EDITOR SCRIPT CONTAINER */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/30">
              <FileCode2 className="w-3.5 h-3.5" />
              Supabase SQL Editor İçin Gerekli Kod
            </div>
            <h4 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
              Tabloları ve Yetkileri Otomatik Oluşturma Kodu
            </h4>
            <p className="text-xs text-stone-400">
              Supabase panelinizde <strong>SQL Editor</strong> bölümünü açıp bu kodu yapıştırın ve <strong>RUN</strong> butonuna basın.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopySql}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 shadow-sm cursor-pointer"
          >
            {copiedSql ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-emerald-200" />
                <span>SQL Kodunu Kopyala</span>
              </>
            )}
          </button>
        </div>

        {/* 3 Steps Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/80">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center font-bold text-[11px] mb-1.5">
              1
            </span>
            <p className="text-stone-300 font-medium">
              <strong>supabase.com</strong> sitesinde projenizi açın, sol menüdeki <strong>SQL Editor</strong> ikonuna tıklayın.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/80">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center font-bold text-[11px] mb-1.5">
              2
            </span>
            <p className="text-stone-300 font-medium">
              Yukarıdaki <strong>&ldquo;New query&rdquo;</strong> butonuna basın ve kopyaladığınız SQL kodunu yapıştırın.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/80">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center font-bold text-[11px] mb-1.5">
              3
            </span>
            <p className="text-stone-300 font-medium">
              Sağ alttaki yeşil <strong>&ldquo;Run&rdquo;</strong> butonuna tıklayın. <code>products</code>, <code>categories</code>, <code>sample_requests</code> tablolarınız anında hazır olacaktır!
            </p>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="relative rounded-xl overflow-hidden border border-stone-800 bg-stone-950">
          <div className="px-4 py-2 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-[11px] text-stone-400 font-mono">
            <span>supabase-schema.sql</span>
            <span>PostgreSQL · RLS Enabled</span>
          </div>
          <pre className="p-4 text-[11px] font-mono text-stone-300 overflow-x-auto max-h-72 leading-relaxed">
            {SUPABASE_SQL_CODE}
          </pre>
        </div>
      </div>

    </div>
  );
};
