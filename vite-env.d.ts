/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_API_KEY?: string;
  readonly VITE_AI_MODEL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly GEMINI_API_KEY?: string;
  readonly API_KEY?: string;
  readonly AI_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
