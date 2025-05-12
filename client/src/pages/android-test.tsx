import { useState, useEffect } from "react";
import SiteLayout from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { isPlatform } from "@/lib/platform";

// Instead of direct imports, we'll use dynamic imports or access these via a wrapper
// This prevents build issues with Capacitor modules
type FilesystemType = {
  writeFile: (options: any) => Promise<any>;
  readdir: (options: any) => Promise<any>;
};

// Use type for Directory enum
type DirectoryType = {
  Documents: string;
};

// These will be populated at runtime
let Filesystem: FilesystemType | null = null;
let Directory: DirectoryType | null = null;

export default function AndroidTest() {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCapacitorReady, setIsCapacitorReady] = useState(false);

  // Initialize Capacitor modules at runtime
  useEffect(() => {
    const initCapacitor = async () => {
      try {
        // Only attempt to load if we're on Android
        if (isPlatform('android')) {
          // Dynamic import of Capacitor modules
          try {
            // Using dynamic import to prevent build-time issues
            const filesystemModule = await import('@capacitor/filesystem');
            Filesystem = filesystemModule.Filesystem;
            Directory = filesystemModule.Directory;
            
            setIsCapacitorReady(true);
            setResult("✅ Successfully loaded Capacitor modules!");
          } catch (importError) {
            console.error("Failed to load Capacitor modules:", importError);
            setResult(`❌ Error loading Capacitor modules: ${importError instanceof Error ? importError.message : String(importError)}`);
          }
        } else {
          // On web, we'll use mock implementations
          setResult("Running in web browser - Capacitor functionality will be limited");
          
          // Create a simple mock for testing in browser
          Filesystem = {
            writeFile: async () => ({ uri: "mock://file.txt" }),
            readdir: async () => ({ files: [{ name: "mock-file-1.txt" }, { name: "mock-file-2.txt" }] })
          };
          
          Directory = { Documents: "DOCUMENTS" };
          setIsCapacitorReady(true);
        }
      } catch (error) {
        console.error("Error initializing Capacitor:", error);
        setResult(`❌ Error initializing: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    initCapacitor();
  }, []);

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
      if (!Filesystem || !Directory) {
        setResult("Capacitor Filesystem not initialized yet!");
        return;
      }
      
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
      if (!Filesystem || !Directory) {
        setResult("Capacitor Filesystem not initialized yet!");
        return;
      }
      
      const listResult = await Filesystem.readdir({
        path: "",
        directory: Directory.Documents
      });
      
      setResult(
        `Files in Documents directory:
        ${listResult.files.map((file: { name: string }) => `- ${file.name}`).join('\n')}
        
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