/**
 * CapacitorAdapter - Safely initializes Capacitor plugins
 * 
 * This adapter prevents browser environments from crashing when trying to use
 * Capacitor plugins, which are only available in native environments.
 * 
 * It provides a safe abstraction layer that gracefully falls back when
 * running in web browsers instead of native apps.
 */

// Simple type for plugin interfaces
interface CapacitorPlugins {
  Filesystem?: any;
  AppLauncher?: any;
  Share?: any;
  FileOpener?: any;
}

// Mock implementations for web fallbacks
const mockFilesystem = {
  writeFile: async () => ({ uri: 'mock://file-not-available-in-browser' }),
  readFile: async () => ({ data: '' }),
  readdir: async () => ({ files: [] }),
  getUri: async () => ({ uri: 'mock://file-not-available-in-browser' })
};

const mockAppLauncher = {
  openUrl: async ({ url }: { url: string }) => {
    // In web, just open in a new tab
    window.open(url, '_blank');
    return { completed: true };
  }
};

const mockShare = {
  share: async ({ title, text, url, files }: { title?: string, text?: string, url?: string, files?: string[] }) => {
    // In web, just use the Web Share API if available, otherwise fall back to copying to clipboard
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        console.log('Shared via Web Share API');
        return { value: true };
      } catch (error) {
        console.warn('Web Share API error:', error);
      }
    }
    
    // Fallback to clipboard + alert
    let shareText = '';
    if (title) shareText += `${title}\n\n`;
    if (text) shareText += text;
    if (url) shareText += `\n\n${url}`;
    
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        alert('Content copied to clipboard since sharing is not available in this browser');
      } else {
        alert('Sharing is not available in this browser');
      }
    } catch (error) {
      console.error('Clipboard error:', error);
      alert('Could not share content in this browser');
    }
    
    return { value: false };
  }
};

const mockFileOpener = {
  open: async ({ filePath, contentType }: { filePath: string; contentType: string }) => {
    console.log(`[mockFileOpener] Would open ${filePath} as ${contentType}`);
    alert(`PDF download complete: ${filePath}`);
    return { value: true };
  }
};

// Cache for initialized plugins
let initializedPlugins: CapacitorPlugins | null = null;

/**
 * Safely provides Capacitor plugins
 * Will use real plugins on native platforms and fallbacks on web
 */
export async function initializeCapacitor(): Promise<CapacitorPlugins> {
  // Return cached plugins if already initialized
  if (initializedPlugins) {
    return initializedPlugins;
  }
  
  // Initialize plugins object
  initializedPlugins = {};
  
  try {
    // Check if we're in a Capacitor app environment
    const isCapacitorNative = typeof (window as any).Capacitor !== 'undefined' && 
      (window as any).Capacitor.isNative === true;
    
    console.log(`Capacitor environment detected: ${isCapacitorNative ? 'Native' : 'Web'}`);
    
    if (isCapacitorNative) {
      // We're in a native environment, try to load real plugins
      
      // Load Filesystem
      try {
        // Use global reference instead of direct import to prevent build issues
        const cap = (window as any).Capacitor;
        const plugins = cap.Plugins;
        
        if (plugins && plugins.Filesystem) {
          initializedPlugins.Filesystem = plugins.Filesystem;
          console.log('Capacitor Filesystem plugin initialized from global');
        } else {
          // Fallback to direct import if not in global plugins
          const dynamicImport = new Function('return import("@capacitor/filesystem")')();
          const fsModule = await dynamicImport;
          initializedPlugins.Filesystem = fsModule.Filesystem;
          console.log('Capacitor Filesystem plugin initialized from import');
        }
      } catch (error) {
        console.warn('Capacitor Filesystem not available, using mock:', error);
        initializedPlugins.Filesystem = mockFilesystem;
      }
      
      // Load AppLauncher
      try {
        // Use global reference instead of direct import to prevent build issues
        const cap = (window as any).Capacitor;
        const plugins = cap.Plugins;
        
        if (plugins && plugins.AppLauncher) {
          initializedPlugins.AppLauncher = plugins.AppLauncher;
          console.log('Capacitor AppLauncher plugin initialized from global');
        } else {
          // Fallback to direct import if not in global plugins
          const dynamicImport = new Function('return import("@capacitor/app-launcher")')();
          const launcherModule = await dynamicImport;
          initializedPlugins.AppLauncher = launcherModule.AppLauncher;
          console.log('Capacitor AppLauncher plugin initialized from import');
        }
      } catch (error) {
        console.warn('Capacitor AppLauncher not available, using mock:', error);
        initializedPlugins.AppLauncher = mockAppLauncher;
      }
      
      // Load Share
      try {
        // Use global reference instead of direct import to prevent build issues
        const cap = (window as any).Capacitor;
        const plugins = cap.Plugins;
        
        if (plugins && plugins.Share) {
          initializedPlugins.Share = plugins.Share;
          console.log('Capacitor Share plugin initialized from global');
        } else {
          try {
            // Fallback to direct import if not in global plugins
            const dynamicImport = new Function('return import("@capacitor/share")')();
            const shareModule = await dynamicImport;
            initializedPlugins.Share = shareModule.Share;
            console.log('Capacitor Share plugin initialized from import');
          } catch (importError) {
            console.warn('Capacitor Share import failed, trying legacy path:', importError);
            // Some versions might be under different package
            const legacyImport = new Function('return import("@capacitor/core").then(m => m.Plugins.Share)')();
            const legacyShare = await legacyImport;
            if (legacyShare) {
              initializedPlugins.Share = legacyShare;
              console.log('Capacitor Share plugin initialized from legacy path');
            } else {
              throw new Error('Share plugin not found in any location');
            }
          }
        }
      } catch (error) {
        console.warn('Capacitor Share not available, using mock:', error);
        initializedPlugins.Share = mockShare;
      }
      
      // Load FileOpener
      try {
        // Use global reference instead of direct import to prevent build issues
        const cap = (window as any).Capacitor;
        const plugins = cap.Plugins;

        if (plugins && plugins.FileOpener) {
          initializedPlugins.FileOpener = plugins.FileOpener;
          console.log('Capacitor FileOpener plugin initialized from global');
        } else {
          // Fallback to direct import if not in global plugins
          const dynamicImport = new Function('return import("@capacitor-community/file-opener")')();
          const fileOpenerModule = await dynamicImport;
          initializedPlugins.FileOpener = fileOpenerModule.FileOpener;
          console.log('Capacitor FileOpener plugin initialized from import');
        }
      } catch (error) {
        console.warn('Capacitor FileOpener not available, using mock:', error);
        initializedPlugins.FileOpener = mockFileOpener;
      }
    } else {
      // We're in a web environment, use mocks
      console.log('Using web mocks for Capacitor plugins');
      initializedPlugins.Filesystem = mockFilesystem;
      initializedPlugins.AppLauncher = mockAppLauncher;
      initializedPlugins.Share = mockShare;
      initializedPlugins.FileOpener = mockFileOpener;
    }
    
    return initializedPlugins;
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
    // Return mocks as a fallback
    return {
      Filesystem: mockFilesystem,
      AppLauncher: mockAppLauncher,
      Share: mockShare,
      FileOpener: mockFileOpener
    };
  }
}

// Export constants for use in platform-aware components
export const Directory = {
  Documents: 'DOCUMENTS',
  Data: 'DATA',
  Cache: 'CACHE',
  External: 'EXTERNAL',
  ExternalStorage: 'EXTERNAL_STORAGE'
};