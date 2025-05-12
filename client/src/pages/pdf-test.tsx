import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadPdf } from '@/lib/utils';
import { TEST_PDF_BASE64 } from '@/lib/testPdf';

export default function PdfTestPage() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const testDownload = async () => {
    setIsLoading(true);
    setResult('Testing PDF download...');
    
    try {
      // Generate a filename with current date/time
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-');
      const filename = `test-pdf-${timestamp}`;
      
      console.log('Starting PDF download test with base64 length:', TEST_PDF_BASE64.length);
      
      // Use our downloadPdf utility
      await downloadPdf(TEST_PDF_BASE64, filename);
      
      setResult('✅ PDF download successful! Check your downloads folder.');
    } catch (error) {
      console.error('PDF download test failed:', error);
      setResult(`❌ PDF download failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>PDF Download Test</CardTitle>
          <CardDescription>
            Test the PDF download functionality in a web environment.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="mb-4 text-sm">
            This page tests the PDF download functionality by generating a sample PDF file and 
            downloading it using the same mechanism as the main application.
          </p>
          
          {result && (
            <div className={`mb-4 p-3 rounded text-sm ${
              result.startsWith('✅') ? 'bg-green-100 text-green-800' : 
              result.startsWith('❌') ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {result}
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={testDownload}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing Download...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Test PDF Download
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}