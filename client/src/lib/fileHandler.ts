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
      if (fileExtension === 'pdf') {
        try {
          // Get the real file URI
          const fileInfo = await capacitor.Filesystem.getUri({
            path: safeFilename,
            directory: Directory.Documents
          });
          
          console.log(`[fileHandler] Opening PDF with external viewer: ${fileInfo.uri}`);
          
          // First check if we have FileOpener (preferred method for PDFs on Android)
          if (capacitor.FileOpener) {
            try {
              // Use the FileOpener plugin with the content URI
              console.log(`[fileHandler] Using FileOpener with URI: ${fileInfo.uri}`);
              
              // Open PDF with FileOpener specifying content type
              await capacitor.FileOpener.open({
                filePath: fileInfo.uri,
                contentType: 'application/pdf',
                openWithDefault: true
              });
              
              console.log('[fileHandler] PDF opened successfully using FileOpener');
              return result.uri;
            } catch (fileOpenerError) {
              console.error('[fileHandler] FileOpener failed:', fileOpenerError);
              // Continue to fallback methods if FileOpener fails
            }
          } else {
            console.warn('[fileHandler] FileOpener plugin not available, trying fallbacks');
          }
          
          // Fallback to AppLauncher if FileOpener is not available or failed
          if (capacitor.AppLauncher) {
            try {
              // Use content:// URI pattern which is more reliable on modern Android
              const androidUri = fileInfo.uri;
              console.log(`[fileHandler] Fallback: Using AppLauncher URI: ${androidUri}`);
              
              // Try to open with AppLauncher - this will use Android's default app launcher
              await capacitor.AppLauncher.openUrl({ url: androidUri });
              console.log('[fileHandler] PDF opened successfully with AppLauncher');
              return result.uri;
            } catch (launcherError) {
              console.error('[fileHandler] AppLauncher failed, trying browser fallback:', launcherError);
              
              // If AppLauncher fails, try browser intent as fallback
              // This uses Android's ACTION_VIEW intent with a content:// URI
              if ((window as any).open) {
                // Try to open with browser intent
                (window as any).open(fileInfo.uri, '_system');
                console.log('[fileHandler] Attempted browser-based system open');
                return result.uri;
              }
            }
          } else {
            console.warn('[fileHandler] AppLauncher not available');
          }
          
          // If we reached here, both methods failed
          console.error('[fileHandler] All PDF opening methods failed');
          alert('PDF file saved in Documents folder. Please check your downloads or open it manually.');
        } catch (openError) {
          console.error('[fileHandler] Error opening PDF:', openError);
          // Don't throw here, the file was saved successfully even if we can't open it
          alert('PDF file saved but could not be opened automatically. Please check your Documents folder.');
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
 * @param title Optional title for the share dialog
 * @param text Optional text for the share dialog
 * @returns Promise resolving to true if sharing was successful
 */
export async function shareFile(
  filename: string, 
  content: string, 
  title?: string, 
  text?: string
): Promise<boolean> {
  try {
    // Make sure we have valid inputs
    if (!filename || !content) {
      throw new Error('Invalid filename or content for sharing');
    }
    
    // Clean the filename for safety
    const safeFilename = filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    
    // Check if we're on a platform that supports sharing
    if (isPlatform('android') || isPlatform('ios')) {
      console.log(`[fileHandler] Sharing file on mobile: ${safeFilename}`);
      
      // Get Capacitor plugins
      const capacitor = await initializeCapacitor();
      
      // For PDFs and other files, we need to save first then share the file
      try {
        // First, save the file to a temporary location
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
        
        // Make sure Filesystem plugin is available
        if (!capacitor.Filesystem) {
          throw new Error('Filesystem plugin not available');
        }
        
        console.log(`[fileHandler] Writing ${fileExtension} file for sharing, base64 length: ${cleanBase64.length}`);
        
        // Write to file system
        const result = await capacitor.Filesystem.writeFile({
          path: safeFilename,
          data: cleanBase64,
          directory: Directory.Cache, // Use cache directory for temporary files
          recursive: true
        });
        
        console.log(`[fileHandler] File saved for sharing at: ${result.uri}`);
        
        // Get the real file URI
        const fileInfo = await capacitor.Filesystem.getUri({
          path: safeFilename,
          directory: Directory.Cache
        });
        
        // Make sure Share plugin is available
        if (!capacitor.Share) {
          throw new Error('Share plugin not available');
        }
        
        // Share the file
        console.log(`[fileHandler] Sharing file from: ${fileInfo.uri}`);
        
        // We can share using either files or url approach
        // Files array works better for documents, while URL works better for media
        const shareResult = await capacitor.Share.share({
          title: title || `Share ${safeFilename}`,
          text: text || `Check out this ${fileExtension.toUpperCase()} file`,
          url: fileInfo.uri,
          files: [fileInfo.uri], // Some apps use the files array instead
        });
        
        console.log(`[fileHandler] Share result:`, shareResult);
        return true;
      } catch (error) {
        console.error('[fileHandler] Error sharing file:', error);
        
        // If file sharing fails, try sharing a text link/message as fallback
        if (capacitor.Share) {
          try {
            console.log('[fileHandler] Trying fallback text sharing');
            
            await capacitor.Share.share({
              title: title || `Share ${safeFilename}`,
              text: text || `Sorry, I couldn't share the actual file. Please try another method.`,
            });
            
            return true;
          } catch (fallbackError) {
            console.error('[fileHandler] Fallback sharing also failed:', fallbackError);
            throw fallbackError;
          }
        } else {
          throw error;
        }
      }
    } else {
      // On web, use the Web Share API if available
      console.log(`[fileHandler] Sharing file on web: ${safeFilename}`);
      
      if (navigator.share) {
        // Convert base64 to a Blob for web sharing
        let blob: Blob;
        
        // Handle data URLs vs raw base64
        if (content.startsWith('data:')) {
          // We have a data URL, can fetch directly
          const res = await fetch(content);
          blob = await res.blob();
        } else {
          // We have raw base64, need to decode and create blob
          const byteString = atob(content);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          
          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
          }
          
          // Determine MIME type from filename
          let mimeType = 'application/octet-stream';
          const fileExtension = safeFilename.split('.').pop()?.toLowerCase() || '';
          
          switch (fileExtension) {
            case 'pdf': mimeType = 'application/pdf'; break;
            case 'txt': mimeType = 'text/plain'; break;
            case 'jpg': case 'jpeg': mimeType = 'image/jpeg'; break;
            case 'png': mimeType = 'image/png'; break;
            case 'tex': mimeType = 'application/x-tex'; break;
            default: mimeType = 'application/octet-stream';
          }
          
          blob = new Blob([uint8Array], { type: mimeType });
        }
        
        // Create a File object from the Blob
        const file = new File([blob], safeFilename, { 
          type: blob.type,
          lastModified: new Date().getTime()
        });
        
        try {
          // Try to share the file
          await navigator.share({
            title: title || `Share ${safeFilename}`,
            text: text || `Check out this file`,
            files: [file]
          });
          
          console.log('[fileHandler] Web share successful');
          return true;
        } catch (error) {
          console.error('[fileHandler] Web share error:', error);
          
          // Try share without file if sharing file is not supported
          if (error instanceof TypeError && error.message.includes('files')) {
            try {
              await navigator.share({
                title: title || `Share ${safeFilename}`,
                text: text || `Check out this file`,
              });
              console.log('[fileHandler] Text-only web share successful');
              return true;
            } catch (fallbackError) {
              console.error('[fileHandler] Text-only web share failed:', fallbackError);
              throw fallbackError;
            }
          }
          
          throw error;
        }
      } else {
        // Web Share API not available, fallback to download
        console.log('[fileHandler] Web Share API not available, falling back to download');
        await downloadFile(safeFilename, content);
        alert('Sharing not available in this browser. File has been downloaded instead.');
        return false;
      }
    }
  } catch (error) {
    console.error('[fileHandler] Share error:', error);
    throw error;
  }
}