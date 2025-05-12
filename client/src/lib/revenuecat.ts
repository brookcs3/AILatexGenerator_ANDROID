import { Capacitor } from '@capacitor/core';
import { Purchases, PurchasesConfiguration } from '@revenuecat/purchases-capacitor';

// Check if we're running on Android
export const isAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

// Product and offering types from RevenueCat
export interface Product {
  identifier: string;
  description: string;
  title: string;
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
  subscriptionPeriod?: string;
}

export interface Offering {
  identifier: string;
  serverDescription: string;
  metadata: Record<string, any>;
  availablePackages: Package[];
}

export interface Package {
  identifier: string;
  packageType: string;
  product: Product;
  offeringIdentifier: string;
}

export interface CustomerInfo {
  entitlements: {
    active: Record<string, EntitlementInfo>;
    all: Record<string, EntitlementInfo>;
  };
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  nonSubscriptionTransactions: any[];
  firstSeen: string;
  originalAppUserId: string;
  requestDate: string;
  latestExpirationDate: string | null;
  originalApplicationVersion: string | null;
  originalPurchaseDate: string | null;
  managementURL: string | null;
}

export interface EntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  periodType: string;
  latestPurchaseDate: string;
  originalPurchaseDate: string;
  expirationDate: string | null;
  productIdentifier: string;
  isSandbox: boolean;
}

/**
 * Initialize RevenueCat purchases when app starts
 * This should be called as early as possible in your app
 */
export const initializePurchases = async (): Promise<void> => {
  if (!isAndroid) {
    console.log('Not on Android, skipping RevenueCat initialization');
    return;
  }

  try {
    const configuration: PurchasesConfiguration = {
      apiKey: 'your_revenuecat_api_key', // This will be replaced by the value in capacitor.config.ts
    };

    await Purchases.configure(configuration);
    console.log('RevenueCat purchases initialized');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
};

/**
 * Get available products/subscriptions from RevenueCat
 */
export const getOfferings = async (): Promise<Offering | null> => {
  if (!isAndroid) {
    console.log('Not on Android, skipping get offerings');
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current || null;
  } catch (error) {
    console.error('Error getting offerings:', error);
    return null;
  }
};

/**
 * Purchase a package through RevenueCat
 */
export const purchasePackage = async (packageToPurchase: Package): Promise<CustomerInfo | null> => {
  if (!isAndroid) {
    console.log('Not on Android, skipping purchase package');
    return null;
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToPurchase });
    
    // After successful purchase, sync with our backend
    await syncPurchasesWithBackend();
    
    return customerInfo;
  } catch (error) {
    console.error('Error purchasing package:', error);
    return null;
  }
};

/**
 * Restore purchases from Google Play
 */
export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  if (!isAndroid) {
    console.log('Not on Android, skipping restore purchases');
    return null;
  }

  try {
    const { customerInfo } = await Purchases.restorePurchases();
    
    // After restoring, sync with our backend
    await syncPurchasesWithBackend();
    
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return null;
  }
};

/**
 * Get current customer info (subscription status)
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!isAndroid) {
    console.log('Not on Android, skipping get customer info');
    return null;
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Error getting customer info:', error);
    return null;
  }
};

/**
 * Check if user has active subscription
 */
export const hasActiveSubscription = async (): Promise<boolean> => {
  const customerInfo = await getCustomerInfo();
  
  if (!customerInfo) {
    return false;
  }
  
  // Check if any entitlements are active
  const activeEntitlements = Object.values(customerInfo.entitlements.active);
  return activeEntitlements.length > 0;
};

/**
 * Sync RevenueCat purchases with our backend
 */
export const syncPurchasesWithBackend = async (): Promise<void> => {
  if (!isAndroid) {
    return;
  }

  try {
    const customerInfo = await getCustomerInfo();
    
    if (!customerInfo) {
      console.log('No customer info to sync with backend');
      return;
    }
    
    // Make API request to our backend
    const response = await fetch('/api/android/sync-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerInfo,
      }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      console.error('Failed to sync purchases with backend:', await response.text());
    }
  } catch (error) {
    console.error('Error syncing purchases with backend:', error);
  }
};