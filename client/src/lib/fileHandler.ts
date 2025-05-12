/**
 * File handling utilities for cross-platform support (Android and web)
 */

import { isPlatform } from './platform';
import { Filesystem, Directory, initializeCapacitor } from './capacitorAdapter';

/**
 * Download or save a file, with platform-specific handling
 * @param filename The name to save the file as
 * @param content The content of the file (PDF data, etc.)
 * @param mimeType The MIME type of the file
 * @returns Promise resolving to the file URI or void
 */
export async function downloadFile(
  filename: string,
  content: string,
  mimeType: string = 'application/pdf'
): Promise<string | void> {
  try {
    // Android-specific handling
    if (isPlatform('android')) {
      return await saveFileOnAndroid(filename, content);
    }
    
    // Default web handling
    return saveFileOnWeb(filename, content, mimeType);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

/**
 * Save a file on Android using Capacitor's Filesystem plugin
 * @param filename The name to save the file as
 * @param content The content of the file (typically base64 encoded)
 * @returns Promise resolving to the file URI
 */
async function saveFileOnAndroid(filename: string, content: string): Promise<string> {
  try {
    console.log('[Android] Starting file save process for', filename);
    
    // Initialize Capacitor if not already initialized
    await initializeCapacitor();
    console.log('[Android] Capacitor initialized:', isCapacitorInitialized());
    
    // Make sure we have a proper extension
    if (!filename.includes('.')) {
      filename = filename + '.pdf';
      console.log('[Android] Added extension, filename is now:', filename);
    }
    
    // Log content info for debugging
    console.log('[Android] Content format check - isBase64:', isBase64(content), 
                'starts with data:', content.startsWith('data:'),
                'content length:', content.length);

    // Ensure content is properly formatted for saving
    // If content is not base64 encoded, encode it
    if (!content.startsWith('data:') && !isBase64(content)) {
      console.log('[Android] Content is not base64, converting...');
      content = btoa(content);
    }
    
    // Extract base64 data if in data URL format
    if (content.startsWith('data:')) {
      console.log('[Android] Content is a data URL, extracting base64 part...');
      content = content.split(',')[1];
    }
    
    console.log('[Android] About to write file with length:', content.length);
    
    // Write the file to the Documents directory
    const result = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Documents,
      recursive: true
    }).catch(e => {
      console.error('[Android] Filesystem.writeFile error details:', JSON.stringify(e));
      throw e;
    });
    
    console.log('[Android] File saved successfully:', result.uri);
    
    // On Android, we also need to make a notification to the user
    if (isPlatform('android')) {
      alert(`PDF saved to Documents folder as "${filename}"`);
    }
    
    return result.uri;
  } catch (error) {
    console.error('[Android] Error saving file:', error);
    
    // Show more detailed error to user
    if (isPlatform('android')) {
      alert(`Could not save PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    throw error;
  }
}

/**
 * Save a file in a web browser using the download attribute
 * @param filename The name to save the file as
 * @param content The content of the file
 * @param mimeType The MIME type of the file
 */
function saveFileOnWeb(filename: string, content: string, mimeType: string): void {
  try {
    // Create a Blob with the file content
    let blob: Blob;
    
    // If content is base64 encoded
    if (isBase64(content) || content.startsWith('data:')) {
      // Handle data URI
      if (content.startsWith('data:')) {
        // Extract the base64 part from the data URI
        const base64Data = content.split(',')[1];
        blob = base64ToBlob(base64Data, mimeType);
      } else {
        // Direct base64 content
        blob = base64ToBlob(content, mimeType);
      }
    } else {
      // Plain text content
      blob = new Blob([content], { type: mimeType });
    }
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element for downloading
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    // Add to DOM, trigger click, then clean up
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error saving file on web:', error);
    throw error;
  }
}

/**
 * Check if a string is base64 encoded
 * @param str The string to check
 * @returns true if the string is base64 encoded
 */
function isBase64(str: string): boolean {
  try {
    // Check if string is valid base64
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

/**
 * Convert a base64 string to a Blob
 * @param base64 The base64 string
 * @param mimeType The MIME type of the resulting blob
 * @returns A Blob containing the decoded data
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
}