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
    // Configure the official RevenueCat plugin
    PurchasesPlugin: {
      // RevenueCat API key
      // You'll need to replace this with your actual RevenueCat API key
      apiKey: "your_revenuecat_api_key",
      
      // Observer mode is false by default
      // If true, RevenueCat will only observe transactions and not initiate them
      observerMode: false,
      
      // For Android specifically
      useAmazon: false // set to true if distributing through Amazon App Store
    }
  }
};

export default config;
