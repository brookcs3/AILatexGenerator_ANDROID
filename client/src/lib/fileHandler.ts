import { isPlatform } from './platform';
import { initializeCapacitor } from './capacitorAdapter';

/**
 * Platform-aware file downloading function
 * 
 * For web: Creates a download via browser's download API
 * For Android: Uses Capacitor's Filesystem API to save to Documents folder
 * 
 * @param filename Filename to save as
 * @param content Base64 content of the file
 */
export async function downloadFile(filename: string, content: string): Promise<void> {
  console.log(`PDF download initiated with filename: ${filename}`);
  
  try {
    // Remove data URL prefix if present
    const base64Data = content.startsWith('data:') 
      ? content.split(',')[1] 
      : content;
      
    if (isPlatform('android')) {
      // Android implementation using Capacitor
      const { Filesystem } = await initializeCapacitor();
      
      if (!Filesystem) {
        throw new Error('Filesystem plugin not available');
      }
      
      console.log('Using Capacitor Filesystem for Android download');
      
      // Ensure the content is properly formatted
      const cleanBase64 = base64Data.replace(/\s/g, '');
      
      try {
        // Save to Documents directory which is accessible to the user
        const result = await Filesystem.writeFile({
          path: filename,
          data: cleanBase64,
          directory: 'DOCUMENTS',
          recursive: true
        });
        
        console.log('File written successfully:', result.uri);
        return;
      } catch (fsError) {
        console.error('Filesystem write error:', fsError);
        throw fsError;
      }
    } else {
      // Web implementation using browser download
      console.log('Using browser download for web');
      
      // Create download link
      const link = document.createElement('a');
      link.href = content.startsWith('data:') ? content : `data:application/pdf;base64,${base64Data}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}