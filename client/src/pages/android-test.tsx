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
        <h1 className="text-2xl font-bold mb-4">Android Capacitor Test Page</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This page tests Android-specific features of the AI LaTeX Generator app using Capacitor.
        </p>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-5 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-300">Capacitor Status</h2>
          <div className="flex items-center mb-4">
            <div className={`w-3 h-3 rounded-full mr-2 ${isCapacitorReady ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            <span className="font-medium">
              {isCapacitorReady ? 'Capacitor modules loaded' : 'Initializing Capacitor...'}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isPlatform('android') 
              ? 'Running on Android - native features available' 
              : 'Running in web browser - limited functionality'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-md font-medium mb-3">Platform Detection</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Detects if app is running on Android, iOS or web
            </p>
            <Button 
              onClick={handleTestPlatform} 
              className="w-full"
              variant="outline"
              size="sm"
            >
              Test Platform
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-md font-medium mb-3">File System Write</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Creates a test file in Android Documents folder
            </p>
            <Button 
              onClick={handleTestFileWrite} 
              className="w-full"
              disabled={isLoading || !isCapacitorReady}
              size="sm"
            >
              Write Test File
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-md font-medium mb-3">Documents Directory</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Lists all files in Android Documents directory
            </p>
            <Button 
              onClick={handleListFiles} 
              className="w-full"
              disabled={isLoading || !isCapacitorReady}
              variant="secondary"
              size="sm"
            >
              List Files
            </Button>
          </div>
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            <span className="ml-2 text-blue-700 dark:text-blue-300 font-medium">Processing...</span>
          </div>
        )}
        
        {result && (
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-2 text-purple-700 dark:text-purple-300">Test Result:</h2>
            <pre className="whitespace-pre-wrap overflow-x-auto text-sm bg-white dark:bg-gray-900 p-3 rounded border">
              {result}
            </pre>
          </div>
        )}
        
        <div className="mt-8 p-5 border rounded-lg bg-amber-50 dark:bg-amber-900/20 shadow-sm">
          <h2 className="text-lg font-semibold mb-2 text-amber-700 dark:text-amber-300">Information</h2>
          <p className="mb-2">
            This page tests Capacitor's functionality in the Android app. When running on a native
            Android device, these tests should succeed in writing and reading files.
          </p>
          <p className="mb-2">
            When using the file operations on Android, files are saved to the app's Documents directory,
            which is private to the app. PDF exports in the main app use this same system.
          </p>
          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
            <h3 className="text-sm font-semibold mb-2">Platform Features</h3>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Platform detection for Android, iOS, and web</li>
              <li>File system access with permission handling</li>
              <li>PDF document saving to private storage</li>
              <li>In-app purchase integration (RevenueCat)</li>
              <li>Error handling for platform-specific features</li>
            </ul>
          </div>
          <p>
            In a web browser, some functions may be limited or unavailable due to browser
            security restrictions.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}