import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aitexgen.latex',
  appName: 'AILatexGenerator',
  webDir: 'dist/public',
  server: {
    // Enable localhost for debugging - remove for production
    androidScheme: "https",
    // Comment out the URL temporarily for testing
    // url: 'https://api-android.aitexgen.com',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'android.keystore',
      keystoreAlias: 'aitexgen',
    }
  },
  plugins: {
    // Plugins configuration will be added later when RevenueCat is set up
  },
  // Add debugging information
  loggingBehavior: "debug"
};

export default config;
