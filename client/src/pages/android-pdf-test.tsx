import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadFile, shareFile } from '@/lib/fileHandler';
import { initializeCapacitor } from '@/lib/capacitorAdapter';
import { isPlatform } from '@/lib/platform';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample PDF content (tiny minimal PDF)
const samplePdfBase64 = `
JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURl
Y29kZSA+PgpzdHJlYW0KeAFFjjEOAEEIA+9bMaVCofD/VyvOZJO74rKVcOdoIAjP/JqqmqpQXKWQgm3bQM21
DS+LZ1THqb0/+5TSVW5DS38bZ+C3Vcx6fmfYTsaY3Ar5JKPtCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago4
OQplbmRvYmoKMiAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDMgMCBSIC9SZXNvdXJjZXMgNiAwIFIg
L0NvbnRlbnRzIDQgMCBSIC9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCj4+CmVuZG9iago2IDAgb2JqCjw8IC9Q
cm9jU2V0IFsgL1BERiAvVGV4dCBdIC9Db2xvclNwYWNlIDw8IC9DczEgNyAwIFIgPj4gL0ZvbnQgPDwgL1Ru
MSA4IDAgUgo+PiA+PgplbmRvYmoKOSAwIG9iago8PCAvTGVuZ3RoIDEwIDAgUiAvTiAxIC9BbHRlcm5hdGUg
L0RldmljZUdyYXkgL0ZpbHRlciAvRmxhdGVEZWNvZGUgPj4Kc3RyZWFtCngBjY8xDoJAEEX3nsKYAsMSMBZs
NhaW9haewAXYFSPGwsrE2D2QS3kkC2vtrJ2db968f5Mo5jQiCZrbTmEmeWJy3WnLNAfHsWGeDR95dI+Y+cyw
1JYrXpvDQ9xSvsM2GJLRPeP35EYGDx4T2Z54n0M8Ou/mOzpnrSm5CapSl3p7b9ggZmFxxQoXnWsz3VoO8MC/
KZYsUOCfmtcFTWzigGo/yCmvKScrFW6D5lTMtNQSlTxFJUeRcfAhZTjvWP4vixoI9UqSl15aiDXvNTT2XgFD
jzRXCmVuZHN0cmVhbQplbmRvYmoKMTAgMCBvYmoKMjA4CmVuZG9iago3IDAgb2JqClsgL0lDQ0Jhc2VkIDkg
MCBSIF0KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9NZWRpYUJveCBbMCAwIDU5NSA4NDJdIC9D
b3VudCAxIC9LaWRzIFsgMiAwIFIgXSA+PgplbmRvYmoKMTEgMCBvYmoKPDwgL1R5cGUgL0NhdGFsb2cgL1Bh
Z2VzIDMgMCBSID4+CmVuZG9iagoxMiAwIG9iagooTWFjIE9TIFggMTAuMTAuNSBRdWFydHogUERGQ29udGV4
dCkKZW5kb2JqCjEzIDAgb2JqCihEOjIwMTcwNzI4MjE1MDU3WjAwJzAwJykKZW5kb2JqCjEgMCBvYmoKPDwg
L1Byb2R1Y2VyIDEyIDAgUiAvQ3JlYXRpb25EYXRlIDEzIDAgUiAvTW9kRGF0ZSAxMyAwIFIgPj4KZW5kb2Jq
CjggMCBvYmoKPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhIC9F
bmNvZGluZyAvTWFjUm9tYW5FbmNvZGluZwo+PgplbmRvYmoKeHJlZgowIDE0CjAwMDAwMDAwMDAgNjU1MzUg
ZiAKMDAwMDAwMDg0OSAwMDAwMCBuIAowMDAwMDAwMTk0IDAwMDAwIG4gCjAwMDAwMDA2MzYgMDAwMDAgbiAK
MDAwMDAwMDAyMiAwMDAwMCBuIAowMDAwMDAwMTczIDAwMDAwIG4gCjAwMDAwMDAyOTEgMDAwMDAgbiAKMDAw
MDAwMDYwMSAwMDAwMCBuIAowMDAwMDAwOTI4IDAwMDAwIG4gCjAwMDAwMDAzODkgMDAwMDAgbiAKMDAwMDAw
MDU4MSAwMDAwMCBuIAowMDAwMDAwNzE1IDAwMDAwIG4gCjAwMDAwMDA3NjUgMDAwMDAgbiAKMDAwMDAwMDgx
OCAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDE0IC9Sb290IDExIDAgUiAvSW5mbyAxIDAgUiAvSUQgWyA8
YmQ2ODAxNTM1MmJlNDIxNmVhZDQxZDdiM2UyOWE0Y2Q+CjxiZDY4MDE1MzUyYmU0MjE2ZWFkNDFkN2IzZTI5
YTRjZD4gXSA+PgpzdGFydHhyZWYKMTAyNwolJUVPRgo=
`;

export default function AndroidPdfTest() {
  const [status, setStatus] = useState<string>('');
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [pluginStatus, setPluginStatus] = useState<{[key: string]: boolean}>({});
  
  // Check available plugins
  const checkPlugins = async () => {
    try {
      setStatus('Checking Capacitor plugins...');
      const capacitor = await initializeCapacitor();
      
      setPluginStatus({
        Filesystem: !!capacitor.Filesystem,
        FileOpener: !!capacitor.FileOpener,
        Share: !!capacitor.Share,
        AppLauncher: !!capacitor.AppLauncher,
      });
      
      setIsAndroid(isPlatform('android'));
      setStatus('Platform and plugin check complete');
    } catch (error) {
      setStatus(`Error checking plugins: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle PDF download
  const handleDownload = async () => {
    try {
      setStatus('Downloading PDF...');
      const result = await downloadFile('test-file.pdf', samplePdfBase64);
      setStatus(`PDF downloaded: ${result}`);
    } catch (error) {
      setStatus(`Download error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle PDF sharing
  const handleShare = async () => {
    try {
      setStatus('Sharing PDF...');
      await shareFile(
        'test-file.pdf',
        samplePdfBase64,
        'Test PDF file',
        'This is a test PDF file from AI LaTeX Generator'
      );
      setStatus('PDF shared successfully');
    } catch (error) {
      setStatus(`Share error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Android PDF Handler Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Platform Information</CardTitle>
          <CardDescription>Test platform-specific features</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={checkPlugins} className="mb-4">Check Platform & Plugins</Button>
          
          <div className="text-sm mb-2">
            Platform: <span className="font-mono">{isAndroid ? 'Android' : 'Web/Other'}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(pluginStatus).map(([plugin, available]) => (
              <div key={plugin} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${available ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{plugin}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="download" className="mb-6">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="download">Download</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>
        
        <TabsContent value="download">
          <Card>
            <CardHeader>
              <CardTitle>Download PDF Test</CardTitle>
              <CardDescription>Test the PDF download and open functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                This will generate a test PDF file, save it to the device, and attempt to open it.
                On Android, it will use the FileOpener plugin.
              </p>
              <Button onClick={handleDownload} className="w-full">Download & Open PDF</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle>Share PDF Test</CardTitle>
              <CardDescription>Test the PDF sharing functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                This will generate a test PDF file and open the native share sheet.
                On Android, it uses the Share plugin from Capacitor.
              </p>
              <Button onClick={handleShare} className="w-full">Share PDF</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Status Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm whitespace-pre-wrap">
            {status || 'No operations performed yet'}
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-gray-500">
        <p>Note: The actual PDF functionality needs to be tested on an Android device.</p>
        <p>This test page will show whether the required plugins are available but actual file operations will only work correctly on Android.</p>
      </div>
    </div>
  );
}