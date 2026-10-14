-- ====================================================================
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
-- Web sitesi ziyaretçileri ürünleri okuyabilir, admin ve anon anahtar değişiklik yapabilir.
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
-- BAŞLANGIÇ VERİLERİNİ EKLE (SEED DATA)
-- Tabloları oluştururken mevcut ürünlerinizi hemen yükler.
-- ====================================================================

-- Kategorileri Ekle
INSERT INTO public.categories (id, name, description)
VALUES 
    ('ceviz', 'İthal Ceviz İçi', 'Şili ve California menşeili seçme kelebek, çeyrek ve baklavalık cevizler'),
    ('kuruyemis', 'Kuruyemiş & Fıstık', 'Giresun fındığı, boz iç Antep fıstığı, kaju ve badem'),
    ('kuru-meyve', 'Kuru Meyve & Hurma', 'Malatya günkurusu kayısı, Medine ve Kudüs jumbo hurmaları')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Başlangıç Ürünlerini Ekle
INSERT INTO public.products (
    id, name, category, variety, grade, origin, indicative_price_range, min_price, max_price, unit, min_order_kg, min_order_text, best_for, packaging, moisture_rate, color_grade, description, features, image, in_stock
)
VALUES
(
    'ceviz-ekstra-kelebek-sili',
    'Şili Ekstra Açık Kelebek Ceviz İçi (%90+)',
    'ceviz',
    '%90+ Bütün Kelebek (Extra Light Halves)',
    'Ekstra Lüks',
    'İthal (Şili - Serrano)',
    '440 - 495 ₺ / kg',
    440,
    495,
    'kg',
    10,
    '1 Koli (10 kg Vakumlu)',
    '["Lüks Tabak Sunumu", "Soğuk Meze & Peynir Tabağı", "Gurme Restoran"]'::jsonb,
    '10 kg Çift Kat Vakumlu Karton Koli',
    '%3.8 (Laboratuvar Onaylı)',
    'Ekstra Açık (Extra Light)',
    'Şili menşeili, yeni mahsul, el ile özenle seçilmiş %90 üzeri eksiksiz yarım kelebek formunda açık renk ceviz içi. Acılık oranı sıfır, tatlı ve yağlı aromaya sahiptir.',
    '["%90+ Kelebek Bütünlük Oranı", "Antioksidan Analizli", "Aflatoksin Sıfır Raporlu", "Tozsuz ve Kalibreli"]'::jsonb,
    '/product_walnut_butterfly_1791927417110.jpg',
    true
),
(
    'ceviz-acik-kelebek-california',
    'California Chandler Açık Kelebek Ceviz İçi (%80)',
    'ceviz',
    '%80 Kelebek & İri Parça (Light Halves)',
    '1. Kalite',
    'İthal (ABD - California)',
    '410 - 460 ₺ / kg',
    410,
    460,
    'kg',
    10,
    '1 Koli (10 kg Vakumlu)',
    '["Kahvaltı Salonları", "Otel Açık Büfe", "Mutfak & Salata"]'::jsonb,
    '10 kg Vakumlu Koli',
    '%4.0 (Nem Kontrollü)',
    'Açık Renk (Light)',
    'Dünyaca ünlü Chandler cinsi, homojen açık renk tonu ve yüksek lezzet profili ile restoran ve kafe mutfaklarının ana tercihi.',
    '["Homojen Açık Sarı Ton", "Yüksek E Vitamini & Antioksidan", "Vakumlu Koruma"]'::jsonb,
    '/product_walnut_butterfly_1791927417110.jpg',
    true
),
(
    'ceviz-acik-ceyrek',
    'İthal Açık Renk Çeyrek Ceviz İçi (Light Quarters)',
    'ceviz',
    'Açık Renk Çeyrek (Quarters)',
    '1. Kalite',
    'İthal (Şili / California)',
    '380 - 430 ₺ / kg',
    380,
    430,
    'kg',
    10,
    '1 Koli (10 kg Vakumlu)',
    '["Mutfak & Salatalar", "Gavurdağı & Meze Çeşitleri", "Pasta & Dondurma"]'::jsonb,
    '10 kg Vakumlu Koli',
    '%3.9',
    'Açık Renk (Light)',
    'Tam ayarında kırılmış, kabuk ve tozdan tamamen arındırılmış temiz açık renk çeyrek cevizler. Mutfakta kırma zahmeti olmadan doğrudan salata ve mezelere uygundur.',
    '["Elenmiş Sıfır Kabuk/Toz", "Mutfak Zaman Kazandırıcı", "Yüksek Yağ Verimi"]'::jsonb,
    '/product_walnut_butterfly_1791927417110.jpg',
    true
),
(
    'ceviz-baklavalik-elenmis-kirik',
    'İthal Baklavalık Özel Elenmiş İnce Kırık Ceviz',
    'ceviz',
    'Özel Elenmiş Baklavalık Kırık (Large Pieces)',
    '1. Kalite',
    'İthal (Açık Renk Seçme)',
    '350 - 410 ₺ / kg',
    350,
    410,
    'kg',
    10,
    '1 Koli (10 kg Vakumlu)',
    '["Baklava & Şerbetli Tatlı", "Bursa Süt Helvası", "Kadayıf & Künefe"]'::jsonb,
    '10 kg Çift Kat Vakumlu Koli',
    '%3.7 (Fırında Kararma Yapmaz)',
    'Açık ve Sarı Parçalar',
    'Bursa baklavacıları ve tatlı imalatçıları için özel olarak 4-8 mm eleklerden geçirilmiş, tozu alınmış, pişerken kararma yapmayan yüksek kaliteli açık renk kırık ceviz.',
    '["Şerbeti İdeal Çeker", "Fırında Kararmaz", "Sıfır Un/Toz Fire"]'::jsonb,
    '/product_walnut_butterfly_1791927417110.jpg',
    true
),
(
    'ceviz-pastalik-tatlicilik-kirik',
    'İthal Pastalık & Unlu Mamul Kırık Ceviz İçi',
    'ceviz',
    'Unlu Mamul & Kek İçi Kırık (Medium Pieces)',
    'Endüstriyel Standart',
    'İthal',
    '310 - 365 ₺ / kg',
    310,
    365,
    'kg',
    10,
    '1 Koli (10 kg Vakumlu)',
    '["Pastane & Kek Dolguları", "Ekmek & Fırıncılık", "Kurabiye & Bisküvi"]'::jsonb,
    '10 kg Karton Koli',
    '%4.1',
    'Açık / Orta Renk',
    'Pastaneler, fırınlar ve unlu mamul üreticileri için ekonomik ve pratik, lezzetli dolgu cevizi. Yüksek aromasıyla hamur işlerinde üstün lezzet verir.',
    '["Yüksek Fırın Verimi", "Ekonomik Toptan Çözüm", "Elenmiş Temiz"]'::jsonb,
    '/product_walnut_butterfly_1791927417110.jpg',
    true
),
(
    'findik-kavrulmus-giresun',
    'Giresun Kalite Kavrulmuş İç Fındık (13-15 mm)',
    'kuruyemis',
    '1. Sınıf Giresun Tombul (13-15 mm)',
    'Ekstra Lüks',
    'Giresun (Aydın Kuruyemiş Tesisleri)',
    '480 - 540 ₺ / kg',
    480,
    540,
    'kg',
    10,
    '1 Koli (10 kg Vakumlu)',
    '["Restoran İkram", "Tatlıcılık", "Çikolata & Dondurma"]'::jsonb,
    '10 kg Çift Kat Vakum',
    '%2.8',
    'Beyazlatılmış & Altın Kavruk',
    'Dünyanın en lezzetli fındığı Giresun Tombul cinsi. Aydın Kuruyemiş fırınlarında özel hava sirkülasyonuyla kavrulmuş, zarı %95 soyulmuş, gevreklik garantili.',
    '["Zarsız %95 Beyazlatılmış", "Aydın Kuruyemiş Tescilli", "Acılaşma Yapmaz"]'::jsonb,
    '/product_mixed_nuts_1791927417614.jpg',
    true
),
(
    'findik-cig-pastacilik',
    'Çiğ İç Fındık & Kıyılmış Fındık (Pastacılık)',
    'kuruyemis',
    'Çiğ & İnce Kıyılmış (11-13 mm / 2-4 mm)',
    '1. Kalite',
    'Karadeniz',
    '420 - 475 ₺ / kg',
    420,
    475,
    'kg',
    10,
    '10 kg Vakum Koli',
    '["Pasta Süsleme", "Sütlü Tatlılar", "Kek & Kurabiye"]'::jsonb,
    '10 kg Vakum Koli',
    '%4.5',
    'Doğal Naturel',
    'İmalatçı pastaneler ve fırınlar için fırınlamaya uygun taze çiğ iç ve elekten geçirilmiş homojen kıyılmış fındık.',
    '["Eşit Boy Taneler", "Laboratuvar Onaylı Kalite", "Yüksek Yağ Kalitesi"]'::jsonb,
    '/product_mixed_nuts_1791927417614.jpg',
    true
),
(
    'fistik-antep-boz-ic',
    'Boz İç Antep Fıstığı (Kuşboku - Zümrüt Yeşil)',
    'kuruyemis',
    '1. Kalite Boz İç Ekstra Yeşil',
    'Ekstra Lüks',
    'Gaziantep',
    '1.150 - 1.350 ₺ / kg',
    1150,
    1350,
    'kg',
    5,
    '1 Kutu (5 kg Özel Koruma)',
    '["Fıstıklı Baklava", "Katmer & Şöbiyet", "Gourmet Dondurma"]'::jsonb,
    '5 kg / 10 kg Vakumlu Koli',
    '%3.2',
    'Yoğun Zümrüt Yeşili (Extra Green)',
    'Erken hasat, yoğun yeşil rengi ve benzersiz aromasıyla Bursa baklavacılarının ve şeflerinin vazgeçilmez ham maddesi. Renk kaybı ve kararma yapmaz.',
    '["En Yüksek Yeşil Pigment", "Yoğun Fıstık Yağı", "Sıfır Kabuk"]'::jsonb,
    '/product_mixed_nuts_1791927417614.jpg',
    true
),
(
    'fistik-antep-kavrulmus-tuzlu',
    'Kavrulmuş Tuzlu Antep Fıstığı (Ana Çıtlak)',
    'kuruyemis',
    'Duble İri Boy Ana Çıtlak (%98 Çıtlatma)',
    '1. Kalite',
    'Gaziantep / Siirt',
    '620 - 690 ₺ / kg',
    620,
    690,
    'kg',
    10,
    '1 Koli (10 kg Çuval/Koli)',
    '["Restoran & Bar İkramı", "Otel Minibar & Lounge", "Cafe Menü"]'::jsonb,
    '10 kg Özel Bariyerli Koli',
    '%2.9',
    'Doğal Çıtlak',
    'Aydın Kuruyemiş tesislerinde özel kavurma tekniği ile tuzlanan, %98 ana çıtlatma oranına sahip çıtır ve taze Antep fıstığı.',
    '["%98 Ana Çıtlak Oranı", "Hafif Deniz Tuzu", "Aydın Kuruyemiş Güvencesi"]'::jsonb,
    '/product_mixed_nuts_1791927417614.jpg',
    true
),
(
    'kaju-cig-kavrulmus',
    'İthal Kaju Fıstığı W240 / W320 İri Kalibre',
    'kuruyemis',
    'W240 Jumbo & W320 Standart İri',
    'Ekstra Lüks',
    'İthal (Vietnam / Hindistan)',
    '490 - 560 ₺ / kg',
    490,
    560,
    'kg',
    10,
    '10 kg Teneke / Vakum Koli',
    '["Uzak Doğu Mutfağı", "Meze & Salata", "İkramlık & Aperitif"]'::jsonb,
    '10 kg veya 22.68 kg Vakumlu Toptan Koli',
    '%3.5',
    'Beyaz / Krem Fildişi',
    'Kusursuz kalibre edilmiş, kırığı olmayan iri boy bütün kajular. Çiğ ve kavrulmuş seçenekleriyle restoran şeflerine özel.',
    '["W240 Jumbo Tane", "Kırıksız %99 Bütün", "Taze İthalat"]'::jsonb,
    '/product_mixed_nuts_1791927417614.jpg',
    true
),
(
    'badem-ithal-kavrulmus-file',
    'İthal Badem İçi (Kavrulmuş, Çiğ & File/Yaprak)',
    'kuruyemis',
    'Nonpareil Açık Renk & Pastacılık File',
    '1. Kalite',
    'İthal (ABD - California)',
    '450 - 510 ₺ / kg',
    450,
    510,
    'kg',
    10,
    '10 kg Karton Koli',
    '["Keşkül & Sütlü Tatlı", "Tavuk/Pilav Garnitür", "Pastacılık"]'::jsonb,
    '10 kg Çift Kat Koli',
    '%3.6',
    'Açık Altın Kahve',
    'Tatlı ve acılığı olmayan Nonpareil bademler. Bütün kavrulmuş, çiğ veya pastalar için ince doğranmış file formunda toptan temin edilir.',
    '["Gıda Analiz Raporlu", "File Badem Seçeneği", "Standart Kalibre"]'::jsonb,
    '/product_mixed_nuts_1791927417614.jpg',
    true
),
(
    'kayisi-malatya-gunkurusu',
    'Malatya 1. Kalite Günkurusu Doğal Kayısı',
    'kuru-meyve',
    'Kükürtsüz Doğal Güneşte Kurutulmuş (No: 1-2)',
    'Ekstra Lüks',
    'Malatya',
    '360 - 420 ₺ / kg',
    360,
    420,
    'kg',
    10,
    '1 Koli (10 kg Tahta/Karton)',
    '["Et Yemekleri & Yahni", "Açık Büfe & Kahvaltı", "Doğal Tatlılar"]'::jsonb,
    '10 kg Ahşap / Karton Koli',
    '%18.0 (Yumuşak & Etli)',
    'Doğal Koyu Kahve / Çikolata',
    'Sıfır kükürt, tamamen doğal dağ güneşi altında kurutulmuş etli ve yumuşak Malatya günkurusu. Şeflerin gourmet tabakları ve açık büfeler için.',
    '["%100 Kükürtsüz Doğal", "Etli İri Boy", "Aflatoksin Negatif"]'::jsonb,
    '/product_apricot_dates_1791927418497.jpg',
    true
),
(
    'kayisi-malatya-sari-jumbo',
    'Malatya Sarı Jumbo Aşlama Kayısı (1 Numara)',
    'kuru-meyve',
    'Jumbo İri Kalibre Sarı Kayısı',
    '1. Kalite',
    'Malatya',
    '320 - 375 ₺ / kg',
    320,
    375,
    'kg',
    10,
    '1 Koli (10 kg)',
    '["Aşure & Hoşaf", "Kahvaltı Sunumu", "Tatlı Garnitürleri"]'::jsonb,
    '10 kg Karton Koli',
    '%20.0',
    'Canlı Altın Sarısı',
    'Göz alıcı sarı rengi, homojen boyu ve dolgun etli yapısıyla Bursa restoranlarının komposto, hoşaf ve kahvaltı büfeleri için ideal seçim.',
    '["1 Numara Jumbo Boy", "Standardize Kalibre", "Uzun Raf Ömrü"]'::jsonb,
    '/product_apricot_dates_1791927418497.jpg',
    true
),
(
    'hurma-medine-mebrum',
    'Medine Mebrum Hurma (Toptan Duble İri)',
    'kuru-meyve',
    'Mebrum Duble Seçme',
    'Ekstra Lüks',
    'Suudi Arabistan (Medine)',
    '430 - 495 ₺ / kg',
    430,
    495,
    'kg',
    10,
    '1 Koli (10 kg Orijinal Ambalaj)',
    '["Ramazan Menüleri", "İftar Sofraları", "Cafe & Restoran İkram"]'::jsonb,
    '10 kg Orijinal Üretici Kolisi',
    '%14.5 (Dayanıklı Lifli)',
    'Açık Kahve / Kehribar',
    'İnce kabuklu, lifli, sert ve son derece lezzetli Medine Mebrum cinsi hurma. Uzun raf ömrü ve şık sunumuyla restoranların vazgeçilmezi.',
    '["İnce Kabuklu", "Yüksek Lif & Mineral", "Orijinal Menşei Belgeli"]'::jsonb,
    '/product_apricot_dates_1791927418497.jpg',
    true
),
(
    'hurma-kudus-medjool',
    'Kudüs Medjool Jumbo Kral Hurma',
    'kuru-meyve',
    'Medjool Jumbo İri Boy (Etli Karamel)',
    'Ekstra Lüks',
    'İthal (Ürdün / Filistin Vadisi)',
    '520 - 610 ₺ / kg',
    520,
    610,
    'kg',
    5,
    '5 kg Özel Kutu',
    '["Gourmet Tatlılar", "Cevizli Hurma Tabağı", "Özel Davetler"]'::jsonb,
    '5 kg Özel Koruma Kutusu',
    '%22.0 (Karamel Kıvamı)',
    'Koyu Kehribar',
    'Dev boyutu, lokum gibi yumuşacık karamelimsi eti ve kolay ayrılan çekirdeği ile kral hurma. İçi ceviz dolgulu meze ve tatlı sunumları için mükemmel.',
    '["Jumbo Dev Boyut", "Karamel Aroması", "Soğuk Hava Depolu"]'::jsonb,
    '/product_apricot_dates_1791927418497.jpg',
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    variety = EXCLUDED.variety,
    grade = EXCLUDED.grade,
    origin = EXCLUDED.origin,
    indicative_price_range = EXCLUDED.indicative_price_range,
    min_price = EXCLUDED.min_price,
    max_price = EXCLUDED.max_price,
    unit = EXCLUDED.unit,
    min_order_kg = EXCLUDED.min_order_kg,
    min_order_text = EXCLUDED.min_order_text,
    best_for = EXCLUDED.best_for,
    packaging = EXCLUDED.packaging,
    moisture_rate = EXCLUDED.moisture_rate,
    color_grade = EXCLUDED.color_grade,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    image = EXCLUDED.image,
    in_stock = EXCLUDED.in_stock,
    updated_at = NOW();
