import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aitexgen.latex',
  appName: 'AILatexGenerator',
  webDir: 'dist/public',
  server: {
    // Enable localhost for debugging - remove for production
    androidScheme: "https",
    // Using the production API
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
    // Filesystem plugin configuration for file downloads
    Filesystem: {
      // Allow app to access Documents directory
      accessible: ["Documents"],
    },
    // RevenueCat configuration will be added when set up
    PurchasesPlugin: {
      // To be configured when Google Play Console is set up
    }
  },
  // Add debugging information
  loggingBehavior: "debug"
};

export default config;
