/**
 * Platform detection utilities for Capacitor apps
 */

// Cache the platform check result
let _isAndroid: boolean | null = null;
let _isIOS: boolean | null = null;
let _isWeb: boolean | null = null;

/**
 * Check if the app is running on a specific platform
 * @param platform The platform to check for ('android', 'ios', or 'web')
 * @returns true if running on the specified platform
 */
export function isPlatform(platform: 'android' | 'ios' | 'web'): boolean {
  // For Android detection
  if (platform === 'android') {
    if (_isAndroid === null) {
      _isAndroid = detectAndroid();
    }
    return _isAndroid;
  }
  
  // For iOS detection
  if (platform === 'ios') {
    if (_isIOS === null) {
      _isIOS = detectIOS();
    }
    return _isIOS;
  }
  
  // For web detection
  if (platform === 'web') {
    if (_isWeb === null) {
      _isWeb = detectWeb();
    }
    return _isWeb;
  }
  
  return false;
}

/**
 * Detect if running on Android
 * @returns true if running on Android
 */
function detectAndroid(): boolean {
  // Check if window.navigator.userAgent contains Android
  if (typeof window !== 'undefined' && window.navigator) {
    return /android/i.test(window.navigator.userAgent);
  }
  return false;
}

/**
 * Detect if running on iOS
 * @returns true if running on iOS
 */
function detectIOS(): boolean {
  // Check if window.navigator.userAgent contains iPhone, iPad, or iPod
  if (typeof window !== 'undefined' && window.navigator) {
    return /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !(window as any).MSStream;
  }
  return false;
}

/**
 * Detect if running in a web browser (not in a Capacitor native app)
 * @returns true if running in a regular web browser
 */
function detectWeb(): boolean {
  // If not Android and not iOS, we assume it's web
  return !detectAndroid() && !detectIOS();
}