import { useState, useEffect } from 'react';
import { isPlatform } from '@/lib/platform';
import AndroidPDFPreview from './android-pdf-preview';
import { downloadFile } from '@/lib/fileHandler';

interface PlatformAwarePDFPreviewProps {
  pdfContent: string; // Base64 encoded PDF content
  title: string;      // Document title
  timestamp: string;  // Timestamp for display
}

/**
 * A platform-aware PDF preview component
 * Uses standard embedded PDF preview for web and a custom preview for Android
 */
export default function PlatformAwarePDFPreview({ 
  pdfContent, 
  title, 
  timestamp 
}: PlatformAwarePDFPreviewProps) {
  const [platform, setPlatform] = useState<'web' | 'android'>('web');
  
  useEffect(() => {
    // Detect platform on mount
    setPlatform(isPlatform('android') ? 'android' : 'web');
  }, []);
  
  // Handle PDF download
  const handleDownload = async () => {
    try {
      // Generate safe filename
      const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      
      // Use our platform-aware file handler
      await downloadFile(filename, pdfContent);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };
  
  // For Android, use our special preview component
  if (platform === 'android') {
    return (
      <AndroidPDFPreview
        pdfContent={pdfContent}
        title={title}
        timestamp={timestamp}
        onDownload={handleDownload}
      />
    );
  }
  
  // For web, render standard PDF preview with iframe
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{timestamp}</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
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
          Download
        </button>
      </div>
      
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-b-lg overflow-hidden">
        {pdfContent && (
          <iframe
            src={`data:application/pdf;base64,${pdfContent.startsWith('data:') ? pdfContent.split(',')[1] : pdfContent}`}
            className="w-full h-full border-0"
            title={title}
          />
        )}
      </div>
    </div>
  );
}