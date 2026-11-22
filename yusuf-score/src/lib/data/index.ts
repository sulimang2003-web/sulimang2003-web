import "server-only";
import type { Repository } from "./repository";
import { demoStore } from "./demo-store";
import { supabaseStore } from "./supabase-store";

export const isSupabaseConfigured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

/** Picks the data adapter from environment. Same API for web, admin and /api/v1 (mobile). */
export function repo(): Repository {
  return isSupabaseConfigured() ? supabaseStore : demoStore;
}

export { OrderError } from "./repository";
export type { Stats } from "./repository";
