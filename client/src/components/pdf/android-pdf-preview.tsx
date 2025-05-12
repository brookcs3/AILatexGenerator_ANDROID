import { useState, useEffect } from 'react';
import { isPlatform } from '@/lib/platform';
import { initializeCapacitor } from '@/lib/capacitorAdapter';

interface AndroidPDFPreviewProps {
  pdfContent: string;
  title: string;
  timestamp: string;
  onDownload: () => void;
}

/**
 * A PDF preview component specifically for Android
 * This component shows metadata and a download button, without trying to render the PDF
 * (which is problematic on Android WebView)
 */
export default function AndroidPDFPreview({ pdfContent, title, timestamp, onDownload }: AndroidPDFPreviewProps) {
  const [isAndroid, setIsAndroid] = useState(false);
  
  useEffect(() => {
    // Initialize platform detection
    setIsAndroid(isPlatform('android'));
    
    // Initialize Capacitor if on Android
    if (isPlatform('android')) {
      initializeCapacitor().catch(console.error);
    }
  }, []);
  
  // If not on Android, don't render this component
  if (!isAndroid) return null;
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-center">
      <div className="flex flex-col items-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
        <div className="mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-red-500"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M9 15v-2" />
            <path d="M12 15v-4" />
            <path d="M15 15v-6" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{timestamp}</p>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
          PDF Preview is not available on Android, but you can save the document to view it in your PDF reader.
        </p>
        
        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF
        </button>
      </div>
    </div>
  );
}