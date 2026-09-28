-- ====================================================================
-- C'ECO RDC - Marketplace Sécurisée & Système de Séquestre
-- Script SQL de Migration Supabase
-- Tables : profiles, products, orders
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE PROFILES (Acheteurs, Vendeurs, Livreurs, Administrateurs)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'courier', 'admin')),
    city TEXT DEFAULT 'Kinshasa',
    commune TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    business_name TEXT,
    rccm_number TEXT,
    id_nat_number TEXT,
    trust_score INTEGER DEFAULT 80 CHECK (trust_score >= 0 AND trust_score <= 100),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

-- 3. TABLE PRODUCTS (Catalogue d'articles en double devise USD / CDF)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('PROD-' || upper(substr(md5(random()::text), 1, 8))),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    seller_name TEXT NOT NULL,
    seller_city TEXT DEFAULT 'Kinshasa',
    seller_verified BOOLEAN DEFAULT false,
    seller_trust_score INTEGER DEFAULT 85,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price_usd NUMERIC(10,2) NOT NULL CHECK (price_usd > 0),
    original_price_usd NUMERIC(10,2),
    condition TEXT NOT NULL DEFAULT 'Neuf',
    stock_available INTEGER NOT NULL DEFAULT 1 CHECK (stock_available >= 0),
    stock_reserved INTEGER DEFAULT 0 CHECK (stock_reserved >= 0),
    images TEXT[] NOT NULL DEFAULT '{}',
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    city TEXT NOT NULL DEFAULT 'Kinshasa',
    commune TEXT DEFAULT 'Gombe',
    rating NUMERIC(3,2) DEFAULT 4.8,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_city ON public.products(city);
CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);

-- 4. TABLE ORDERS (Commandes protégées avec Séquestre & Code OTP)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- Format CECO-2026-XXXXXX
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    seller_name TEXT NOT NULL,
    courier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    courier_name TEXT,
    courier_phone TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal_usd NUMERIC(10,2) NOT NULL,
    delivery_fee_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    platform_fee_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_usd NUMERIC(10,2) NOT NULL,
    delivery_mode TEXT NOT NULL DEFAULT 'express',
    shipping_address JSONB NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'mpesa',
    payment_status TEXT NOT NULL DEFAULT 'successful',
    order_status TEXT NOT NULL DEFAULT 'paid' CHECK (order_status IN (
        'pending_payment', 'paid', 'preparing', 'ready_for_pickup', 
        'in_delivery', 'delivered', 'completed', 'cancelled', 'disputed'
    )),
    delivery_otp TEXT NOT NULL,
    otp_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Politiques pour PROFILES
CREATE POLICY "Les profils sont visibles par tous" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent insérer leur profil" 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour PRODUCTS
CREATE POLICY "Les produits sont visibles par tous" 
    ON public.products FOR SELECT USING (true);

CREATE POLICY "Les vendeurs connectés peuvent créer des produits" 
    ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Les vendeurs peuvent modifier leurs propres produits" 
    ON public.products FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Les vendeurs peuvent supprimer leurs propres produits" 
    ON public.products FOR DELETE USING (auth.uid() = seller_id);

-- Politiques pour ORDERS
CREATE POLICY "Les utilisateurs peuvent consulter leurs propres commandes" 
    ON public.orders FOR SELECT USING (
        auth.uid() = buyer_id OR 
        auth.uid() = seller_id OR 
        auth.uid() = courier_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Les acheteurs connectés peuvent créer une commande" 
    ON public.orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Mise à jour des commandes autorisée pour les parties prenantes" 
    ON public.orders FOR UPDATE USING (
        auth.uid() = buyer_id OR 
        auth.uid() = seller_id OR 
        auth.uid() = courier_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 6. DÉCLENCHEUR AUTOMATIQUE : CRÉATION DE PROFIL LORS DE L'INSCRIPTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, city)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'buyer'),
        COALESCE(new.raw_user_meta_data->>'city', 'Kinshasa')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. DONNÉES INITIALES (SEED DE DÉPART POUR LE CATALOGUE C'ECO)
INSERT INTO public.products (id, seller_name, seller_city, seller_verified, seller_trust_score, name, category, price_usd, original_price_usd, condition, stock_available, images, description, specifications, city, commune, rating, review_count, is_featured, is_popular)
VALUES 
(
    'PROD-IPHONE15-PRO',
    'KaziTech Kinshasa',
    'Kinshasa',
    true,
    98,
    'Apple iPhone 15 Pro Max (256 Go) - Titane Naturel',
    'telephones',
    1190.00,
    1350.00,
    'Neuf',
    5,
    ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'],
    'iPhone 15 Pro Max scellé d''origine Apple avec garantie internationale 1 an. Puce A17 Pro, écran Super Retina XDR 120Hz.',
    '{"Stockage": "256 Go", "Couleur": "Titane Naturel", "Réseau": "5G / e-SIM & Nano-SIM", "Garantie": "12 Mois"}'::jsonb,
    'Kinshasa',
    'Gombe',
    4.9,
    42,
    true,
    true
),
(
    'PROD-MACBOOK-AIR-M3',
    'KaziTech Kinshasa',
    'Kinshasa',
    true,
    98,
    'Apple MacBook Air 15" M3 (16 Go RAM / 512 Go SSD)',
    'informatique',
    1450.00,
    1590.00,
    'Neuf',
    3,
    ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'],
    'Dernier MacBook Air 15 pouces avec puce M3 ultra-rapide. Clavier AZERTY français ou QWERTY US disponible.',
    '{"Processeur": "Apple M3 (8-core CPU / 10-core GPU)", "RAM": "16 Go Unifiée", "Stockage": "512 Go SSD", "Autonomie": "Jusqu''à 18h"}'::jsonb,
    'Kinshasa',
    'Gombe',
    5.0,
    18,
    true,
    false
),
(
    'PROD-SOLAR-KIT-5KVA',
    'Congo Solaire & Énergie',
    'Kinshasa',
    true,
    95,
    'Kit Solaire Hybride Complet 5kVA / 48V + Batterie Lithium 5kWh',
    'energie_solaire',
    2850.00,
    3200.00,
    'Neuf',
    4,
    ARRAY['https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80'],
    'Solution anti-délestage clé en main pour maisons et bureaux à Kinshasa. Onduleur hybride 5kVA, 8 panneaux monocristallins 550W.',
    '{"Puissance": "5 000 VA / 5 000 W", "Batterie": "Lithium LiFePO4 5.12 kWh", "Panneaux": "8x 550W Tier 1", "Garantie": "5 Ans"}'::jsonb,
    'Kinshasa',
    'Limete',
    4.8,
    27,
    true,
    true
),
(
    'PROD-SAMSUNG-S24-ULTRA',
    'Galaxy Store Lubumbashi',
    'Lubumbashi',
    true,
    92,
    'Samsung Galaxy S24 Ultra 5G (512 Go / 12 Go RAM) + S-Pen',
    'telephones',
    1150.00,
    1280.00,
    'Neuf',
    7,
    ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80'],
    'Samsung Galaxy S24 Ultra officiel avec Galaxy AI, capteur photo 200 MP, cadre en titane et stylet S-Pen intégré.',
    '{"Écran": "6.8\" AMOLED 2X 120Hz", "Processeur": "Snapdragon 8 Gen 3", "Batterie": "5000 mAh", "Garantie": "Samsung 24 Mois"}'::jsonb,
    'Lubumbashi',
    'Lubumbashi',
    4.9,
    31,
    false,
    true
)
ON CONFLICT (id) DO NOTHING;
