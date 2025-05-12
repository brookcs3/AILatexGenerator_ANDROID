/**
 * RevenueCat integration for Android app
 * This handles in-app purchases and subscriptions using RevenueCat's SDK
 */

import { isPlatform } from '@/lib/platform';
import { apiRequest } from '@/lib/queryClient';

// Type definitions for RevenueCat entities
interface Product {
  identifier: string;
  title: string;
  description: string;
  price: number;
  priceString: string;
  currencyCode: string;
  introPrice?: {
    price: number;
    priceString: string;
    period: string;
    cycles: number;
    periodUnit: string;
  };
}

interface Package {
  identifier: string;
  packageType: string;
  product: Product;
  offeringIdentifier: string;
}

interface Offering {
  identifier: string;
  serverDescription: string;
  availablePackages: Package[];
}

interface CustomerInfo {
  entitlements: {
    active: Record<string, {
      identifier: string;
      isActive: boolean;
      willRenew: boolean;
      periodType: string;
      latestPurchaseDate: string;
      latestPurchaseDateMillis: number;
      originalPurchaseDate: string;
      originalPurchaseDateMillis: number;
      expirationDate: string | null;
      expirationDateMillis: number | null;
      store: string;
      productIdentifier: string;
      isSandbox: boolean;
      unsubscribeDetectedAt: string | null;
      billingIssueDetectedAt: string | null;
    }>
  };
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  latestExpirationDate: string | null;
  firstSeen: string;
  originalAppUserId: string;
  requestDate: string;
  aliases: string[];
  nonSubscriptionTransactions: Array<{
    productIdentifier: string;
    purchaseDate: string;
    transactionIdentifier: string;
    storeTransactionIdentifier: string;
  }>;
}

// Mock Purchases interface when not running on Android
interface PurchasesMock {
  setLogLevel: (level: number) => void;
  getOfferings: () => Promise<{ current: Offering | null; all: Record<string, Offering> }>;
  restorePurchases: () => Promise<CustomerInfo>;
  purchasePackage: (pkg: Package) => Promise<{ customerInfo: CustomerInfo }>;
  getCustomerInfo: () => Promise<CustomerInfo>;
  logIn: (userId: string) => Promise<{ customerInfo: CustomerInfo, created: boolean }>;
  logOut: () => Promise<null>;
}

// These declare the RevenueCat SDK types that will be available in the native app
declare global {
  interface Window {
    Purchases?: {
      LOG_LEVEL: {
        VERBOSE: number;
        DEBUG: number;
        INFO: number;
        WARN: number;
        ERROR: number;
      };
      setLogLevel: (level: number) => void;
      getOfferings: () => Promise<{ current: any | null; all: Record<string, any> }>;
      restorePurchases: () => Promise<any>;
      purchasePackage: (pkg: any) => Promise<{ customerInfo: any }>;
      getCustomerInfo: () => Promise<any>;
      logIn: (userId: string) => Promise<{ customerInfo: any, created: boolean }>;
      logOut: () => Promise<null>;
    };
  }
}

// Create a mock implementation for web development
const createMockPurchases = (): PurchasesMock => {
  console.log('Creating mock RevenueCat Purchases instance (web mode)');
  
  return {
    setLogLevel: (level: number) => {
      console.log(`[RevenueCat Mock] Set log level to ${level}`);
    },
    
    getOfferings: async () => {
      console.log('[RevenueCat Mock] Getting offerings');
      
      // Return mock offerings for development
      const mockProduct: Product = {
        identifier: 'subscriptionMonthly',
        title: 'Monthly Subscription',
        description: 'Unlimited generations and GPT-4 access',
        price: 9.99,
        priceString: '$9.99',
        currencyCode: 'USD',
        introPrice: {
          price: 4.99,
          priceString: '$4.99',
          period: '1 month',
          cycles: 1,
          periodUnit: 'MONTH'
        }
      };
      
      const mockPackage: Package = {
        identifier: 'monthly',
        packageType: 'MONTHLY',
        product: mockProduct,
        offeringIdentifier: 'default'
      };
      
      const mockOffering: Offering = {
        identifier: 'default',
        serverDescription: 'Default offering',
        availablePackages: [mockPackage]
      };
      
      return {
        current: mockOffering,
        all: {
          'default': mockOffering
        }
      };
    },
    
    restorePurchases: async () => {
      console.log('[RevenueCat Mock] Restoring purchases');
      return createMockCustomerInfo(false);
    },
    
    purchasePackage: async (pkg: Package) => {
      console.log(`[RevenueCat Mock] Purchasing package: ${pkg.identifier}`);
      
      // Report the mock purchase to our backend
      try {
        await apiRequest('POST', '/api/android/validate-receipt', {
          packageId: pkg.identifier,
          productId: pkg.product.identifier,
          price: pkg.product.price,
          transactionId: `mock-${Date.now()}`
        });
      } catch (error) {
        console.error('[RevenueCat Mock] Error reporting purchase to backend:', error);
      }
      
      return {
        customerInfo: createMockCustomerInfo(true)
      };
    },
    
    getCustomerInfo: async () => {
      console.log('[RevenueCat Mock] Getting customer info');
      
      // In mock mode, check with backend to determine subscription status
      try {
        const response = await apiRequest('GET', '/api/auth/me');
        const data = await response.json();
        
        const hasSubscription = data.user?.subscriptionTier === 'premium';
        return createMockCustomerInfo(hasSubscription);
      } catch (error) {
        console.error('[RevenueCat Mock] Error getting user info:', error);
        return createMockCustomerInfo(false);
      }
    },
    
    logIn: async (userId: string) => {
      console.log(`[RevenueCat Mock] Logging in user: ${userId}`);
      return {
        customerInfo: createMockCustomerInfo(false),
        created: false
      };
    },
    
    logOut: async () => {
      console.log('[RevenueCat Mock] Logging out');
      return null;
    }
  };
};

// Helper to create mock customer info
const createMockCustomerInfo = (hasSubscription: boolean): CustomerInfo => {
  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  return {
    entitlements: {
      active: hasSubscription ? {
        'premium': {
          identifier: 'premium',
          isActive: true,
          willRenew: true,
          periodType: 'NORMAL',
          latestPurchaseDate: now.toISOString(),
          latestPurchaseDateMillis: now.getTime(),
          originalPurchaseDate: now.toISOString(),
          originalPurchaseDateMillis: now.getTime(),
          expirationDate: nextMonth.toISOString(),
          expirationDateMillis: nextMonth.getTime(),
          store: 'PLAY_STORE',
          productIdentifier: 'subscriptionMonthly',
          isSandbox: true,
          unsubscribeDetectedAt: null,
          billingIssueDetectedAt: null
        }
      } : {}
    },
    activeSubscriptions: hasSubscription ? ['subscriptionMonthly'] : [],
    allPurchasedProductIdentifiers: hasSubscription ? ['subscriptionMonthly'] : [],
    latestExpirationDate: hasSubscription ? nextMonth.toISOString() : null,
    firstSeen: now.toISOString(),
    originalAppUserId: 'mock-user',
    requestDate: now.toISOString(),
    aliases: ['mock-user'],
    nonSubscriptionTransactions: []
  };
};

// Get the appropriate Purchases instance based on platform
let purchasesInstance: PurchasesMock | typeof window.Purchases | null = null;

export const getPurchases = (): PurchasesMock | typeof window.Purchases | null => {
  if (purchasesInstance) {
    return purchasesInstance;
  }
  
  if (isPlatform('android') && window.Purchases) {
    console.log('Using native RevenueCat Purchases for Android');
    purchasesInstance = window.Purchases;
    
    // Enable verbose logging in development
    if (process.env.NODE_ENV !== 'production' && purchasesInstance.LOG_LEVEL) {
      purchasesInstance.setLogLevel(purchasesInstance.LOG_LEVEL.VERBOSE);
    }
  } else {
    console.log('Using mock RevenueCat Purchases (web mode)');
    purchasesInstance = createMockPurchases();
  }
  
  return purchasesInstance;
};

// Initialize RevenueCat for the current user
export const initializeRevenueCat = async (userId?: string | null): Promise<boolean> => {
  try {
    const purchases = getPurchases();
    
    if (!purchases) {
      console.error('RevenueCat SDK not available');
      return false;
    }
    
    if (userId) {
      // Log in the user to RevenueCat
      console.log(`Logging in user ${userId} to RevenueCat`);
      await purchases.logIn(userId.toString());
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    return false;
  }
};

// Get available subscription offerings
export const getSubscriptionOfferings = async (): Promise<Offering | null> => {
  try {
    const purchases = getPurchases();
    
    if (!purchases) {
      console.error('RevenueCat SDK not available');
      return null;
    }
    
    const offerings = await purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
};

// Purchase a subscription package
export const purchaseSubscription = async (packageToPurchase: Package): Promise<boolean> => {
  try {
    const purchases = getPurchases();
    
    if (!purchases) {
      console.error('RevenueCat SDK not available');
      return false;
    }
    
    await purchases.purchasePackage(packageToPurchase);
    return true;
  } catch (error) {
    console.error('Failed to purchase subscription:', error);
    return false;
  }
};

// Check if user has active premium entitlement
export const checkPremiumEntitlement = async (): Promise<boolean> => {
  try {
    const purchases = getPurchases();
    
    if (!purchases) {
      console.error('RevenueCat SDK not available');
      return false;
    }
    
    const customerInfo = await purchases.getCustomerInfo();
    return !!customerInfo.entitlements.active['premium'];
  } catch (error) {
    console.error('Failed to check premium entitlement:', error);
    return false;
  }
};

// Restore purchases from Google Play
export const restorePurchases = async (): Promise<boolean> => {
  try {
    const purchases = getPurchases();
    
    if (!purchases) {
      console.error('RevenueCat SDK not available');
      return false;
    }
    
    await purchases.restorePurchases();
    return true;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return false;
  }
};