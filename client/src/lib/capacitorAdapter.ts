/**
 * Adapter for Capacitor plugins to avoid build issues with direct imports
 * This file provides "empty shell" implementations that will be swapped at runtime
 */

// Empty implementations for Filesystem API
export const Filesystem = {
  writeFile: async () => ({ uri: "" }),
  readFile: async () => ({ data: "" }),
  readdir: async () => ({ files: [] }),
  mkdir: async () => ({}),
  rmdir: async () => ({}),
  stat: async () => ({ type: "", size: 0, ctime: 0, mtime: 0, uri: "" })
};

// Directory constants
export const Directory = {
  Documents: "DOCUMENTS",
  Data: "DATA",
  Cache: "CACHE",
  External: "EXTERNAL",
  ExternalStorage: "EXTERNAL_STORAGE"
};

// Flag to track if real plugins have been loaded
let capacitorInitialized = false;

/**
 * Loads the actual Capacitor plugins at runtime
 * This avoids build issues with direct imports
 */
export async function initializeCapacitor(): Promise<boolean> {
  // Only initialize once
  if (capacitorInitialized) {
    return true;
  }
  
  try {
    // Dynamically load the Filesystem module
    const filesystemModule = await import('@capacitor/filesystem');
    
    // Replace our empty implementations with the real ones
    Object.assign(Filesystem, filesystemModule.Filesystem);
    Object.assign(Directory, filesystemModule.Directory);
    
    capacitorInitialized = true;
    console.log('Capacitor plugins initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Capacitor plugins:', error);
    return false;
  }
}

/**
 * Checks if Capacitor plugins have been initialized
 */
export function isCapacitorInitialized(): boolean {
  return capacitorInitialized;
}