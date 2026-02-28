/**
 * Validasi environment variables
 * Throws error jika ada yang missing
 */
export function validateEnv() {
  const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];

  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

/**
 * Get environment variable dengan type safety
 */
export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}
