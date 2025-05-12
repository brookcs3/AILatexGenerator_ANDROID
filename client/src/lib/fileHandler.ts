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
      
      // Determine file type from extension for MIME type handling
      const fileExtension = safeFilename.split('.').pop()?.toLowerCase() || '';
      
      // For data URLs, extract the base64 content
      let base64Data = '';
      if (content.startsWith('data:')) {
        // Extract the base64 part after the comma
        const parts = content.split(',');
        if (parts.length > 1) {
          base64Data = parts[1];
        } else {
          throw new Error('Invalid data URL format');
        }
      } else {
        // Already base64, just use it
        base64Data = content;
      }
      
      // Clean the base64 data
      const cleanBase64 = base64Data.replace(/[\r\n\s]/g, '');
      
      console.log(`[fileHandler] Writing ${fileExtension} file, base64 length: ${cleanBase64.length}`);
      
      // Write to file system
      const result = await capacitor.Filesystem.writeFile({
        path: safeFilename,
        data: cleanBase64,
        directory: Directory.Documents,
        recursive: true
      });
      
      console.log(`[fileHandler] File saved to: ${result.uri}`);
      
      // For PDFs, handle special viewing case
      if (fileExtension === 'pdf' && capacitor.AppLauncher) {
        try {
          // Get the real file URI
          const fileInfo = await capacitor.Filesystem.getUri({
            path: safeFilename,
            directory: Directory.Documents
          });
          
          console.log(`[fileHandler] Opening PDF with external viewer: ${fileInfo.uri}`);
          
          // Try to open with AppLauncher - this will use Android's default app launcher
          await capacitor.AppLauncher.openUrl({ url: fileInfo.uri });
          console.log('[fileHandler] PDF opened successfully with external viewer');
        } catch (openError) {
          console.error('[fileHandler] Error opening PDF:', openError);
          // Don't throw here, the file was saved successfully even if we can't open it
          // Let the user know they need to manually open the file
          alert('PDF file saved in Documents folder. Please open it manually.');
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
      
      // Determine the correct MIME type based on filename
      let mimeType = 'application/octet-stream';
      const fileExtension = safeFilename.split('.').pop()?.toLowerCase() || '';
      
      switch (fileExtension) {
        case 'pdf':
          mimeType = 'application/pdf';
          break;
        case 'txt':
          mimeType = 'text/plain';
          break;
        case 'html':
        case 'htm':
          mimeType = 'text/html';
          break;
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        case 'tex':
          mimeType = 'application/x-tex';
          break;
        default:
          mimeType = 'application/octet-stream';
      }
      
      console.log(`[fileHandler] Detected MIME type: ${mimeType} for file: ${safeFilename}`);
      
      // Process the base64 content properly
      let base64Data = '';
      if (content.startsWith('data:')) {
        // Extract the base64 part after the comma
        const parts = content.split(',');
        if (parts.length > 1) {
          base64Data = parts[1];
        } else {
          throw new Error('Invalid data URL format');
        }
      } else {
        // Already base64, just use it
        base64Data = content;
      }
      
      // Clean the base64 data
      const cleanBase64 = base64Data.replace(/[\r\n\s]/g, '');
      
      // Create a data URL with the proper MIME type
      const dataUrl = `data:${mimeType};base64,${cleanBase64}`;
      
      try {
        // Try the Blob method first (more reliable)
        const byteString = atob(cleanBase64);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([arrayBuffer], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        
        // Create an anchor and trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = safeFilename;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // Trigger the download
        link.click();
        
        // Clean up
        setTimeout(() => {
          if (link.parentNode) {
            document.body.removeChild(link);
          }
          URL.revokeObjectURL(blobUrl);
        }, 200);
        
        console.log('[fileHandler] File downloaded using Blob method');
      } catch (blobError) {
        console.error('[fileHandler] Blob download method failed, falling back to data URL:', blobError);
        
        // Fallback to direct data URL method
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = safeFilename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          if (link.parentNode) {
            document.body.removeChild(link);
          }
        }, 200);
        
        console.log('[fileHandler] File downloaded using data URL fallback method');
      }
      
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