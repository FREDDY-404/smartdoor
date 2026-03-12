const publicEnvKeys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

export function getMissingPublicSupabaseEnv() {
  return publicEnvKeys.filter((key) => !process.env[key]);
}

export function hasPublicSupabaseEnv() {
  return getMissingPublicSupabaseEnv().length === 0;
}
