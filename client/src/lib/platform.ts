/**
 * Platform detection utility
 * 
 * Provides functions to detect the current platform (web, Android, iOS)
 * and adapt the app's behavior accordingly.
 */

/**
 * Platform types supported by the app
 */
export type PlatformType = 'web' | 'android' | 'ios';

/**
 * Cached platform detection result to avoid repeated checks
 */
let _detectedPlatform: PlatformType | null = null;

/**
 * Detects the current platform
 * @returns The current platform type
 */
export function detectPlatform(): PlatformType {
  // Return cached result if available
  if (_detectedPlatform) {
    return _detectedPlatform;
  }
  
  try {
    // Check if Capacitor is available (Android/iOS)
    if (typeof window !== 'undefined' && 
        'Capacitor' in window && 
        (window as any).Capacitor?.isNative === true) {
      
      // Determine if Android or iOS
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (userAgent.indexOf('android') > -1) {
        _detectedPlatform = 'android';
      } else if (
        userAgent.indexOf('iphone') > -1 || 
        userAgent.indexOf('ipad') > -1 ||
        userAgent.indexOf('ipod') > -1 ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) // Modern iPads
      ) {
        _detectedPlatform = 'ios';
      } else {
        // Default to web if we can't determine the mobile platform
        _detectedPlatform = 'web';
      }
    } else {
      // Default to web
      _detectedPlatform = 'web';
    }
  } catch (error) {
    console.error('Error detecting platform:', error);
    // Default to web on error
    _detectedPlatform = 'web';
  }
  
  return _detectedPlatform;
}

/**
 * Checks if the current platform matches the specified platform
 * @param platform The platform to check against
 * @returns True if the current platform matches
 */
export function isPlatform(platform: PlatformType): boolean {
  return detectPlatform() === platform;
}

/**
 * Checks if the current platform is a mobile platform (Android or iOS)
 * @returns True if the current platform is mobile
 */
export function isMobilePlatform(): boolean {
  const platform = detectPlatform();
  return platform === 'android' || platform === 'ios';
}

/**
 * Allows overriding the detected platform for testing
 * This should only be used in development/testing
 * @param platform The platform to set
 */
export function _setTestPlatform(platform: PlatformType | null): void {
  _detectedPlatform = platform;
}