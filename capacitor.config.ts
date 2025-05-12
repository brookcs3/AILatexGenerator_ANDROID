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
    // Plugins configuration will be added later when RevenueCat is set up
  }
};

export default config;
