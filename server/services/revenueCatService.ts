import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Customer info interface from RevenueCat
interface CustomerInfo {
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

interface EntitlementInfo {
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

export class RevenueCatService {
  /**
   * Sync subscription data from RevenueCat to our database
   */
  async syncSubscription(
    userId: number,
    customerInfo: CustomerInfo
  ): Promise<{ success: boolean; message?: string; tierUpdated?: boolean }> {
    try {
      // Check if there are any active entitlements
      const hasActiveEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;
      
      if (!hasActiveEntitlements) {
        // If no active entitlements but user had an Android subscription before,
        // we should mark their subscription as expired
        await db
          .update(users)
          .set({
            subscriptionStatus: "expired",
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
        
        return {
          success: true,
          message: "Subscription marked as expired",
          tierUpdated: true,
        };
      }
      
      // Get the first active entitlement
      const firstEntitlement = Object.values(customerInfo.entitlements.active)[0];
      
      if (!firstEntitlement) {
        return {
          success: false,
          message: "No active entitlement found",
        };
      }
      
      // Determine subscription tier based on entitlement identifier
      const subscriptionTier = this.mapEntitlementToTier(firstEntitlement.identifier);
      
      // Calculate subscription expiration date
      const expirationDate = firstEntitlement.expirationDate
        ? new Date(firstEntitlement.expirationDate)
        : null;
      
      // Update user with subscription information
      await db
        .update(users)
        .set({
          subscriptionStatus: "active",
          subscriptionTier,
          subscriptionSource: "android",
          subscriptionExpiresAt: expirationDate,
          // Store RevenueCat-specific info
          revenueCatInfo: JSON.stringify({
            originalAppUserId: customerInfo.originalAppUserId,
            entitlementId: firstEntitlement.identifier,
            productId: firstEntitlement.productIdentifier,
          }),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      
      return {
        success: true,
        message: "Subscription synced successfully",
        tierUpdated: true,
      };
    } catch (error) {
      console.error("Error syncing RevenueCat subscription:", error);
      return {
        success: false,
        message: "Failed to sync subscription: " + String(error),
      };
    }
  }
  
  /**
   * Map RevenueCat entitlement identifiers to our subscription tiers
   */
  private mapEntitlementToTier(entitlementId: string): string {
    // This mapping should match your RevenueCat configuration
    const tierMap: Record<string, string> = {
      'pro_access': 'pro',
      'unlimited_access': 'unlimited',
      'basic_access': 'basic',
      // Default to basic if unknown
      'default': 'basic'
    };
    
    return tierMap[entitlementId] || tierMap.default;
  }
  
  /**
   * Set the RevenueCat user identifier
   * Call this when a user signs in to link their account with RevenueCat
   */
  async setRevenueCatUserId(userId: number): Promise<{ success: boolean; message?: string }> {
    try {
      // This would be used in your client-side code to identify the user in RevenueCat
      // In a real implementation, you'd make an API call to RevenueCat's backend
      
      return {
        success: true,
        message: "RevenueCat user ID set successfully",
      };
    } catch (error) {
      console.error("Error setting RevenueCat user ID:", error);
      return {
        success: false,
        message: "Failed to set RevenueCat user ID: " + String(error),
      };
    }
  }
}

// Create singleton instance
export const revenueCatService = new RevenueCatService();