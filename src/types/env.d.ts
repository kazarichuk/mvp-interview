declare namespace NodeJS {
  interface ProcessEnv {
    // Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: string;

    // API Configuration
    NEXT_PUBLIC_INTERVIEW_API_URL: string;
    NEXT_PUBLIC_WS_API_URL: string;

    // Feature Flags
    NEXT_PUBLIC_ENABLE_ANALYTICS: string;
    NEXT_PUBLIC_ENABLE_WEBSOCKET: string;
  }
} 