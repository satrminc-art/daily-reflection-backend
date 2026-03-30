export interface ServerEnv {
  databaseUrl: string | null;
  supabaseUrl: string | null;
  supabaseServiceRoleKey: string | null;
  authJwtSecret: string | null;
  revenueCatWebhookSecret: string | null;
  openAiApiKey: string | null;
}

export function getServerEnv(): ServerEnv {
  return {
    databaseUrl: process.env.DATABASE_URL?.trim() || null,
    supabaseUrl: process.env.SUPABASE_URL?.trim() || null,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null,
    authJwtSecret: process.env.AUTH_JWT_SECRET?.trim() || null,
    revenueCatWebhookSecret: process.env.REVENUECAT_WEBHOOK_SECRET?.trim() || null,
    openAiApiKey: process.env.OPENAI_API_KEY?.trim() || null,
  };
}
