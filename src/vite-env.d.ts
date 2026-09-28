/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_FLEXPAY_API_URL?: string;
  readonly VITE_FLEXPAY_MERCHANT?: string;
  readonly VITE_FLEXPAY_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
