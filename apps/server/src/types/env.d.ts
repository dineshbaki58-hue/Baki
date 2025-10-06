declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    DATABASE_URL: string;
    REDIS_URL?: string;
    JWT_SECRET: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    STRIPE_PRICE_PRO_MONTHLY?: string;
    STRIPE_PRICE_PRO_YEARLY?: string;
    S3_ACCESS_KEY_ID?: string;
    S3_SECRET_ACCESS_KEY?: string;
    S3_BUCKET_NAME?: string;
    S3_REGION?: string;
    OPENAI_API_KEY?: string;
    APP_PUBLIC_URL?: string;
    ADMIN_UPLOAD_ALLOWED_ORIGINS?: string;
  }
}
