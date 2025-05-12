import { Capacitor } from '@capacitor/core';
import { apiRequest } from '../utils/api';

// Check if we're running on Android
export const isAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

// Interface for working with @capgo/capacitor-purchases
interface PurchasesPlugin {
  getProducts(): Promise<{ products: Product[] }>;
  purchaseProduct(options: { productId: string }): Promise<PurchaseInfo>;
  restorePurchases(): Promise<{ purchases: PurchaseInfo[] }>;
  getCustomerInfo(): Promise<{ customerInfo: CustomerInfo }>;
}

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

export interface PurchaseInfo {
  productId: string;
  transactionId: string;
  purchaseToken: string;
  purchaseTime: number;
  verified: boolean;
}

export interface CustomerInfo {
  entitlements: {
    active: Record<string, EntitlementInfo>;
    all: Record<string, EntitlementInfo>;
  };
  activeSubscriptions: string[];
  allPurchasedProductIds: string[];
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
 * Get the Purchases plugin from Capacitor
 */
export const getPurchasesPlugin = (): PurchasesPlugin | null => {
  if (!isAndroid) {
    return null;
  }
  
  try {
    return (window as any).Capacitor.Plugins.CapacitorPurchases as PurchasesPlugin;
  } catch (error) {
    console.error('Error accessing CapacitorPurchases plugin:', error);
    return null;
  }
};

/**
 * Get available products from Google Play
 */
export const getProducts = async (): Promise<Product[]> => {
  const plugin = getPurchasesPlugin();
  
  if (!plugin) {
    console.log('Purchases plugin not available (not on Android)');
    return [];
  }
  
  try {
    const result = await plugin.getProducts();
    return result.products || [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

/**
 * Purchase a product on Google Play
 */
export const purchaseProduct = async (productId: string): Promise<PurchaseInfo | null> => {
  const plugin = getPurchasesPlugin();
  
  if (!plugin) {
    console.log('Purchases plugin not available (not on Android)');
    return null;
  }
  
  try {
    const purchaseInfo = await plugin.purchaseProduct({ productId });
    
    // Verify the purchase with our backend
    if (purchaseInfo.purchaseToken) {
      await verifyPurchaseWithBackend(purchaseInfo.purchaseToken, productId);
    }
    
    return purchaseInfo;
  } catch (error) {
    console.error('Error making purchase:', error);
    return null;
  }
};

/**
 * Verify a purchase with our backend API
 */
export const verifyPurchaseWithBackend = async (purchaseToken: string, productId: string): Promise<boolean> => {
  try {
    const response = await apiRequest('POST', '/api/android/verify-subscription', {
      purchaseToken,
      productId
    });
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error verifying purchase with backend:', error);
    return false;
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<PurchaseInfo[]> => {
  const plugin = getPurchasesPlugin();
  
  if (!plugin) {
    console.log('Purchases plugin not available (not on Android)');
    return [];
  }
  
  try {
    const result = await plugin.restorePurchases();
    
    // Verify each restored purchase with our backend
    for (const purchase of result.purchases) {
      if (purchase.purchaseToken) {
        await verifyPurchaseWithBackend(purchase.purchaseToken, purchase.productId);
      }
    }
    
    return result.purchases || [];
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return [];
  }
};

/**
 * Get customer subscription information
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  const plugin = getPurchasesPlugin();
  
  if (!plugin) {
    console.log('Purchases plugin not available (not on Android)');
    return null;
  }
  
  try {
    const result = await plugin.getCustomerInfo();
    return result.customerInfo || null;
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
  
  // Check if there are any active subscriptions
  return customerInfo.activeSubscriptions.length > 0;
};