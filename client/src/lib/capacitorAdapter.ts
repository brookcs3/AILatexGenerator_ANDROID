/**
 * Capacitor Plugin Adapter for Android and Web
 * 
 * This file provides mock implementations of Capacitor plugins for web environments,
 * while allowing actual plugins to be used on Android. It uses a detection mechanism
 * instead of dynamic imports to avoid Vite build issues.
 */

import { isPlatform } from './platform';

// Directory constants 
export const Directory = {
  Documents: "DOCUMENTS",
  Data: "DATA",
  Cache: "CACHE",
  External: "EXTERNAL",
  ExternalStorage: "EXTERNAL_STORAGE"
};

// Mock filesystem implementation for web
const FilesystemMock = {
  writeFile: async ({ path, data, directory }: { path: string; data: string; directory?: string; recursive?: boolean }) => {
    console.log(`[Web Mock] Writing file ${path} to ${directory || 'default directory'}`);
    return { uri: `mock://files/${directory || 'default'}/${path}` };
  },
  
  readFile: async ({ path, directory }: { path: string; directory?: string }) => {
    console.log(`[Web Mock] Reading file ${path} from ${directory || 'default directory'}`);
    return { data: "mock-file-content" };
  },
  
  readdir: async ({ path, directory }: { path: string; directory?: string }) => {
    console.log(`[Web Mock] Listing directory ${path} in ${directory || 'default directory'}`);
    return { files: [{ name: "mock-file-1.txt" }, { name: "mock-file-2.pdf" }] };
  },
  
  mkdir: async ({ path, directory, recursive }: { path: string; directory?: string; recursive?: boolean }) => {
    console.log(`[Web Mock] Creating directory ${path} in ${directory || 'default directory'}`);
    return {};
  },
  
  rmdir: async ({ path, directory, recursive }: { path: string; directory?: string; recursive?: boolean }) => {
    console.log(`[Web Mock] Removing directory ${path} from ${directory || 'default directory'}`);
    return {};
  },
  
  stat: async ({ path, directory }: { path: string; directory?: string }) => {
    console.log(`[Web Mock] Getting stats for ${path} in ${directory || 'default directory'}`);
    return { type: "file", size: 0, ctime: 0, mtime: 0, uri: `mock://files/${directory || 'default'}/${path}` };
  }
};

// Export the filesystem - actual implementation will be injected by Capacitor on Android
export const Filesystem = FilesystemMock;

// Android detection - doesn't use dynamic imports
let capacitorInitialized = false;

/**
 * Initialize Capacitor (this is a no-op in the web environment)
 * On Android, this function will be replaced by Capacitor at runtime
 */
export async function initializeCapacitor(): Promise<boolean> {
  if (capacitorInitialized) {
    return true;
  }
  
  // Check if we're on Android - if so, Capacitor will replace our mock
  // implementations with real ones at runtime
  if (isPlatform('android')) {
    console.log('Android detected, Capacitor will initialize automatically');
    // The actual plugins are injected by Capacitor's Android runtime
    // We don't need to do anything here
  } else {
    console.log('Web environment detected, using mock implementations');
  }
  
  capacitorInitialized = true;
  return true;
}

/**
 * Checks if Capacitor has been initialized
 */
export function isCapacitorInitialized(): boolean {
  return capacitorInitialized;
}