import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment or use configured project defaults
const env = (import.meta as any)?.env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://bnsexwoxjgqjphytgawc.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ktZ1xP3uchQ8xYrZfDgAmA_Ur2Os-c2';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface SupabaseProfile {
  id: string;
  email?: string;
  full_name: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'courier' | 'admin';
  city?: string;
  commune?: string;
  avatar_url?: string;
  is_verified?: boolean;
  business_name?: string;
  rccm_number?: string;
  id_nat_number?: string;
  trust_score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseProduct {
  id: string;
  seller_id?: string;
  seller_name: string;
  seller_city?: string;
  seller_verified?: boolean;
  seller_trust_score?: number;
  name: string;
  category: string;
  price_usd: number;
  original_price_usd?: number;
  condition: string;
  stock_available: number;
  stock_reserved?: number;
  images: string[];
  description: string;
  specifications?: Record<string, string>;
  city: string;
  commune: string;
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
  is_popular?: boolean;
  created_at?: string;
}

export interface SupabaseOrder {
  id: string;
  buyer_id?: string;
  buyer_name: string;
  buyer_phone: string;
  seller_id?: string;
  seller_name: string;
  courier_id?: string;
  courier_name?: string;
  items: any[];
  subtotal_usd: number;
  delivery_fee_usd: number;
  platform_fee_usd: number;
  total_usd: number;
  delivery_mode: string;
  shipping_address: any;
  payment_method: string;
  payment_status: string;
  order_status: string;
  delivery_otp: string;
  otp_verified: boolean;
  created_at?: string;
}

/**
 * Test connectivity with Supabase database
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "public.products" does not exist')) {
        return { ok: false, message: 'Tables non créées dans Supabase. Veuillez exécuter le script SQL de migration.' };
      }
      return { ok: false, message: `Connexion refusée : ${error.message}` };
    }
    return { ok: true, message: 'Connecté avec succès à Supabase.' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Erreur inconnue de connexion Supabase' };
  }
}
