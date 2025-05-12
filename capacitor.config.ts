import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aitexgen.latex',
  appName: 'AILatexGenerator',
  webDir: 'dist',
  server: {
    // Point to our Android-specific API server
    url: 'https://api-android.aitexgen.com',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'android.keystore',
      keystoreAlias: 'aitexgen',
    }
  },
  plugins: {
    // Configure Capacitor Purchases plugin
    CapacitorPurchases: {
      // RevenueCat API key would go here in production
      // This is just a placeholder for testing
      apiKey: "api_key_here",
      // Configure the Google Play store
      playStoreConfig: {
        // Default products to offer in the Android app
        products: [
          {
            id: "tier1_monthly",
            type: "subscription"
          },
          {
            id: "tier2_monthly",
            type: "subscription"
          }
        ]
      }
    }
  }
};

export default config;
