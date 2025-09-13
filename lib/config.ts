// lib/config.ts
// Configuration for Supabase client

// Get Supabase configuration based on environment
export const getSupabaseConfig = () => {
  // Use environment variables if available (during build time)
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // For static builds, prefer environment variables from build time
  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey
    };
  }
  
  // Fallback for development or when environment variables are not set
  return {
    url: 'https://placeholder.supabase.co',
    anonKey: 'placeholder-key'
  };
};

export const supabaseConfig = getSupabaseConfig();
