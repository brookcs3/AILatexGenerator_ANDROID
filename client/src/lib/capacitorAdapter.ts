/**
 * CapacitorAdapter - Safely imports and initializes Capacitor plugins
 * 
 * This adapter prevents browser environments from crashing when 
 * importing Capacitor plugins, which are only available in native
 * environments like Android/iOS.
 */

// Define types for the plugins we use
interface CapacitorPlugins {
  Filesystem?: any;
  App?: any;
  Device?: any;
}

// Cache for initialized plugins
let initializedPlugins: CapacitorPlugins | null = null;

/**
 * Safely initializes Capacitor plugins for use in the app
 * Returns an object with all available plugins
 */
export async function initializeCapacitor(): Promise<CapacitorPlugins> {
  // Return cached plugins if already initialized
  if (initializedPlugins) {
    return initializedPlugins;
  }
  
  // Initialize plugins object
  initializedPlugins = {};
  
  try {
    // Try to import Capacitor plugins
    // These will fail in a browser environment but work in native apps
    
    // Filesystem for file operations
    try {
      const { Filesystem } = await import('@capacitor/filesystem');
      initializedPlugins.Filesystem = Filesystem;
      console.log('Capacitor Filesystem plugin initialized');
    } catch (error) {
      console.warn('Capacitor Filesystem not available:', error);
    }
    
    // App for app information and events
    try {
      const { App } = await import('@capacitor/app');
      initializedPlugins.App = App;
      console.log('Capacitor App plugin initialized');
    } catch (error) {
      console.warn('Capacitor App not available:', error);
    }
    
    // Device for device information
    try {
      const { Device } = await import('@capacitor/device');
      initializedPlugins.Device = Device;
      console.log('Capacitor Device plugin initialized');
    } catch (error) {
      console.warn('Capacitor Device not available:', error);
    }
    
    return initializedPlugins;
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
    return {};
  }
}