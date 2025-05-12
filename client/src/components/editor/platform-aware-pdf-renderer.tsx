import { useState, useEffect } from 'react';
import { isPlatform } from '@/lib/platform';
import { downloadFile } from '@/lib/fileHandler';
import { AppLauncher } from '@capacitor/app-launcher';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface PlatformAwarePDFRendererProps {
  pdfData: string;             // PDF data (base64 encoded)
  title: string;               // Document title
  timestamp: string;           // Timestamp string
  formattedData: string | null; // Formatted data for web viewer
  iframeKey: number;           // Key for iframe refreshing
  onError: (error: Error) => void;  // Error callback
  onLoad: () => void;          // Load callback
}

/**
 * A platform-aware PDF renderer that provides different implementations for
 * web and Android platforms.
 */
export default function PlatformAwarePDFRenderer({
  pdfData,
  title,
  timestamp,
  formattedData,
  iframeKey,
  onError,
  onLoad
}: PlatformAwarePDFRendererProps) {
  const [platform, setPlatform] = useState<'web' | 'android'>('web');
  
  useEffect(() => {
    // Detect platform
    setPlatform(isPlatform('android') ? 'android' : 'web');
  }, []);

  // Function to handle Android PDF download and view
  const handleAndroidDownload = async () => {
    try {
      if (!pdfData) {
        throw new Error('No PDF data available');
      }

      // Generate safe filename
      const safeName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${safeName}_${Date.now()}.pdf`;
      
      // For data URLs, extract the base64 content
      const base64Data = pdfData.startsWith('data:') 
        ? pdfData.split(',')[1] 
        : pdfData;
      
      // Clean the base64 data
      const cleanBase64 = base64Data.replace(/[\r\n\s]/g, '');
      
      // Write to file system
      console.log(`[Android PDF] Writing PDF to filesystem: ${filename}`);
      const result = await Filesystem.writeFile({
        path: filename,
        data: cleanBase64,
        directory: Directory.Cache,
        recursive: true
      });
      
      console.log(`[Android PDF] File written successfully at: ${result.uri}`);
      
      // Get the real file URI
      const fileInfo = await Filesystem.getUri({
        path: filename,
        directory: Directory.Cache
      });
      
      // Launch the PDF viewer
      console.log(`[Android PDF] Opening PDF with AppLauncher: ${fileInfo.uri}`);
      await AppLauncher.openUrl({ url: fileInfo.uri });
      
      // Signal successful load
      onLoad();
    } catch (error) {
      console.error('[Android PDF] Error in handleAndroidDownload:', error);
      onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  };
  
  // Download function for web
  const handleWebDownload = async () => {
    try {
      const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      await downloadFile(filename, pdfData);
    } catch (error) {
      console.error('[Web PDF] Error downloading PDF:', error);
    }
  };
  
  // Render for Android platform
  if (platform === 'android') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6">
        <div className="p-6 bg-white rounded-lg shadow-md text-center max-w-md mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-red-500 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-4">{timestamp}</p>
          
          <p className="text-gray-600 mb-6">
            Android can't preview PDFs directly in the app. Tap the button below to open this PDF in your device's PDF viewer.
          </p>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleAndroidDownload}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Open in PDF Viewer
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render for web platform (standard iframe approach)
  return (
    <iframe 
      key={`pdf-frame-${iframeKey}`}
      src={formattedData || "about:blank"}
      className="w-full h-full border-0"
      title="PDF Preview"
      onError={(e) => {
        console.error("PDF iframe load error:", e);
        onError(new Error("Failed to load PDF in iframe"));
      }}
      onLoad={() => {
        console.log("PDF iframe loaded successfully");
        onLoad();
      }}
    />
  );
}