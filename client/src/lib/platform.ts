/**
 * Platform detection utilities
 * 
 * Used to determine if we're running on Android, iOS, or web
 */

let cachedPlatformChecks: Record<string, boolean> = {};

/**
 * Detects if we're running on a specific platform
 * 
 * @param platform The platform to check for ('android', 'ios', 'capacitor', 'web')
 * @returns boolean indicating if we're on that platform
 */
export function isPlatform(platform: string): boolean {
  // Use cached result if available
  if (cachedPlatformChecks[platform] !== undefined) {
    return cachedPlatformChecks[platform];
  }
  
  // Android detection
  if (platform === 'android') {
    const isAndroid = 
      typeof window !== 'undefined' && 
      // Check for Android in the user agent
      /android/i.test(window.navigator.userAgent) ||
      // Check for Capacitor's Android platform flag
      !!(window as any).Capacitor && 
      (window as any).Capacitor.getPlatform() === 'android';
      
    cachedPlatformChecks[platform] = isAndroid;
    return isAndroid;
  }
  
  // iOS detection
  if (platform === 'ios') {
    const isIOS = 
      typeof window !== 'undefined' && 
      // Check for iOS/iPadOS in the user agent 
      (/iPad|iPhone|iPod/.test(window.navigator.userAgent) || 
       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) ||
      // Check for Capacitor's iOS platform flag
      !!(window as any).Capacitor && 
      (window as any).Capacitor.getPlatform() === 'ios';
      
    cachedPlatformChecks[platform] = isIOS;
    return isIOS;
  }
  
  // Capacitor detection (any native platform)
  if (platform === 'capacitor') {
    const isCapacitor = 
      typeof window !== 'undefined' && 
      !!(window as any).Capacitor;
      
    cachedPlatformChecks[platform] = isCapacitor;
    return isCapacitor;
  }
  
  // Web detection (not a native platform)
  if (platform === 'web') {
    const isWeb = 
      typeof window !== 'undefined' && 
      (!(window as any).Capacitor || 
       (window as any).Capacitor.getPlatform() === 'web');
       
    cachedPlatformChecks[platform] = isWeb;
    return isWeb;
  }
  
  // Default to false for unknown platforms
  cachedPlatformChecks[platform] = false;
  return false;
}

/**
 * Gets the current platform name
 * 
 * @returns string platform name ('android', 'ios', 'web')
 */
export function getPlatform(): string {
  if (isPlatform('android')) return 'android';
  if (isPlatform('ios')) return 'ios';
  return 'web';
}

/**
 * Runs a platform-specific function
 * 
 * @param platformMap Map of platform-specific implementations
 * @returns The result of the platform-specific function
 */
export function runForPlatform<T>(platformMap: Record<string, () => T>): T | undefined {
  const platform = getPlatform();
  
  // Run the function for the current platform
  if (platformMap[platform]) {
    return platformMap[platform]();
  }
  
  // Fallback to web if the platform-specific function doesn't exist
  if (platform !== 'web' && platformMap['web']) {
    return platformMap['web']();
  }
  
  // Fallback to default if it exists
  if (platformMap['default']) {
    return platformMap['default']();
  }
  
  // No implementation found
  return undefined;
}