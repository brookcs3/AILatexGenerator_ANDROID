/**
 * Platform-aware file handling utilities
 * 
 * This module provides file operations that work consistently across
 * web and Android/iOS platforms by using the appropriate APIs
 * for each platform.
 */

import { isPlatform } from '@/lib/platform';
import { initializeCapacitor, Directory } from '@/lib/capacitorAdapter';

/**
 * Downloads or saves a file with platform-specific implementation
 * On web: Uses browser download API
 * On mobile: Uses Capacitor Filesystem and external viewer
 * 
 * @param filename Name of the file to save
 * @param content Content of the file (base64 data or data URL)
 * @returns Promise resolving to the file location
 */
export async function downloadFile(filename: string, content: string): Promise<string> {
  // Make sure we have valid inputs
  if (!filename || !content) {
    throw new Error('Invalid filename or content for download');
  }
  
  // Clean the filename for safety
  const safeFilename = filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
  
  // For Android, use Capacitor Filesystem
  if (isPlatform('android')) {
    try {
      console.log(`[fileHandler] Downloading file on Android: ${safeFilename}`);
      
      // Get Capacitor plugins 
      const capacitor = await initializeCapacitor();
      
      // Make sure we have the filesystem plugin
      if (!capacitor.Filesystem) {
        throw new Error('Filesystem plugin not available');
      }
      
      // For data URLs, extract the base64 content
      const base64Data = content.startsWith('data:') 
        ? content.split(',')[1] 
        : content;
      
      // Clean the base64 data
      const cleanBase64 = base64Data.replace(/[\r\n\s]/g, '');
      
      // Write to file system
      const result = await capacitor.Filesystem.writeFile({
        path: safeFilename,
        data: cleanBase64,
        directory: Directory.Documents,
        recursive: true
      });
      
      console.log(`[fileHandler] File saved to: ${result.uri}`);
      
      // If app launcher is available, open the file
      if (capacitor.AppLauncher) {
        try {
          // Get the real file URI
          const fileInfo = await capacitor.Filesystem.getUri({
            path: safeFilename,
            directory: Directory.Documents
          });
          
          console.log(`[fileHandler] Opening file with external viewer: ${fileInfo.uri}`);
          await capacitor.AppLauncher.openUrl({ url: fileInfo.uri });
        } catch (openError) {
          console.error('[fileHandler] Error opening file:', openError);
          // Don't throw here, the file was saved successfully even if we can't open it
        }
      }
      
      return result.uri;
    } catch (error) {
      console.error('[fileHandler] Android file download error:', error);
      throw error;
    }
  } 
  // For web platform, use browser download API
  else {
    try {
      console.log(`[fileHandler] Downloading file on web: ${safeFilename}`);
      
      // Make sure we're working with a data URL
      const dataUrl = content.startsWith('data:') 
        ? content 
        : `data:application/octet-stream;base64,${content}`;
      
      // Create an anchor and trigger download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = safeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return 'browser-download';
    } catch (error) {
      console.error('[fileHandler] Web file download error:', error);
      throw error;
    }
  }
}

/**
 * Shares a file using the device's native share dialog
 * Only available on mobile platforms
 * 
 * @param filename Name of the file to share
 * @param content Content of the file (base64 data or data URL)
 */
export async function shareFile(filename: string, content: string): Promise<void> {
  // This is a stub for future implementation
  // Would use Capacitor Share plugin
  throw new Error('Share functionality not yet implemented');
}