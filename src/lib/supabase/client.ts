import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gyrbzrmtztkexnbzxebx.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5cmJ6cm10enRrZXhuYnp4ZWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTAzOTIsImV4cCI6MjA4Nzk2NjM5Mn0.YI3PhWV8l3ry7JKb-wwL0VQ8VJ4jQvNl3yfvgSeMgqI";

export const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl.startsWith("https://") &&
  supabaseAnonKey.length > 20;

export function createClient() {
  if (!isSupabaseConfigured) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: { message: "Supabase not configured. Add credentials to .env.local" },
        }),
        signUp: async () => ({
          data: { user: null, session: null },
          error: { message: "Supabase not configured. Add credentials to .env.local" },
        }),
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async () => ({ data: null, error: null }),
        updateUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            data: [],
            error: null,
            order: () => ({ data: [], error: null, limit: () => ({ data: [], error: null }) }),
          }),
          order: () => ({ data: [], error: null, limit: () => ({ data: [], error: null }) }),
          data: [],
          error: null,
        }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }), error: null }),
        update: () => ({ eq: () => ({ error: null }) }),
        delete: () => ({ eq: () => ({ error: null }) }),
        upsert: () => ({ error: null }),
      }),
    } as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
