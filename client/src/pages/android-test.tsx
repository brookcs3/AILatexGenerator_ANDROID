import { useState } from "react";
import SiteLayout from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { isPlatform } from "@/lib/platform";

export default function AndroidTest() {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Test platform detection
  const handleTestPlatform = () => {
    const isAndroid = isPlatform('android');
    const isIOS = isPlatform('ios');
    const isWeb = isPlatform('web');

    setResult(
      `Platform Detection Results:
      - Is Android: ${isAndroid}
      - Is iOS: ${isIOS}
      - Is Web: ${isWeb}
      
      User Agent: ${navigator.userAgent}`
    );
  };

  // Test file writing
  const handleTestFileWrite = async () => {
    setIsLoading(true);
    try {
      // Generate a test file with current timestamp
      const testData = `Test file created at ${new Date().toISOString()}`;
      const filename = `test-file-${Date.now()}.txt`;
      
      // Convert to base64
      const base64Data = btoa(testData);
      
      // Write file
      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });
      
      setResult(
        `File successfully written!
        - Path: ${writeResult.uri}
        - Filename: ${filename}
        
        File contains: "${testData}"`
      );
    } catch (error) {
      console.error("Error writing test file:", error);
      setResult(`Error writing test file: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test file listing
  const handleListFiles = async () => {
    setIsLoading(true);
    try {
      const listResult = await Filesystem.readdir({
        path: "",
        directory: Directory.Documents
      });
      
      setResult(
        `Files in Documents directory:
        ${listResult.files.map(file => `- ${file.name}`).join('\n')}
        
        Total files: ${listResult.files.length}`
      );
    } catch (error) {
      console.error("Error listing files:", error);
      setResult(`Error listing files: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Android Capacitor Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button 
            onClick={handleTestPlatform} 
            className="w-full"
            variant="outline"
          >
            Test Platform Detection
          </Button>
          
          <Button 
            onClick={handleTestFileWrite} 
            className="w-full"
            disabled={isLoading}
          >
            Test File Write
          </Button>
          
          <Button 
            onClick={handleListFiles} 
            className="w-full"
            disabled={isLoading}
            variant="secondary"
          >
            List Files in Documents
          </Button>
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2">Processing...</span>
          </div>
        )}
        
        {result && (
          <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-2">Test Result:</h2>
            <pre className="whitespace-pre-wrap overflow-x-auto text-sm">
              {result}
            </pre>
          </div>
        )}
        
        <div className="mt-8 p-4 border rounded-md bg-blue-50 dark:bg-blue-900/20">
          <h2 className="text-lg font-semibold mb-2">Information</h2>
          <p className="mb-2">
            This page tests Capacitor's functionality in the Android app. When running on a native
            Android device, these tests should succeed in writing and reading files.
          </p>
          <p>
            In a web browser, some functions may be limited or unavailable due to browser
            security restrictions.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}