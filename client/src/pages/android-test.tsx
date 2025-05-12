import { useState, useEffect } from 'react';
import { isPlatform, getPlatform } from '@/lib/platform';
import { downloadFile } from '@/lib/fileHandler';
import { initializeCapacitor } from '@/lib/capacitorAdapter';

export default function AndroidTestPage() {
  const [platform, setPlatform] = useState<string>('detecting...');
  const [fileTestResult, setFileTestResult] = useState<string>('');
  const [fileListResult, setFileListResult] = useState<string>('');
  const [pdfTestResult, setPdfTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setPlatform(getPlatform());
  }, []);

  const testPlatform = () => {
    setPlatform(getPlatform());
    alert(`Current platform: ${getPlatform()}`);
  };

  const testFileWrite = async () => {
    setIsLoading(true);
    setFileTestResult('Testing file write...');

    try {
      const testContent = 'Hello from AILatexGenerator Android Test';
      const filename = 'test-file.txt';
      
      // Convert to base64
      const base64Content = btoa(testContent);
      
      await downloadFile(filename, base64Content);
      
      setFileTestResult('✅ File write test successful');
    } catch (error) {
      console.error('File write test failed:', error);
      setFileTestResult(`❌ File write test failed: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const listFiles = async () => {
    setIsLoading(true);
    setFileListResult('Listing files...');

    try {
      // Only works on Android
      if (!isPlatform('android')) {
        setFileListResult('This feature only works on Android');
        setIsLoading(false);
        return;
      }

      const { Filesystem } = await initializeCapacitor();
      
      if (!Filesystem) {
        throw new Error('Filesystem plugin not available');
      }
      
      // List files in the Documents directory
      const result = await Filesystem.readdir({
        path: '',
        directory: 'DOCUMENTS'
      });
      
      if (result && result.files && result.files.length > 0) {
        setFileListResult(`📁 Found ${result.files.length} files:\n${result.files.join('\n')}`);
      } else {
        setFileListResult('📁 No files found in Documents directory');
      }
    } catch (error) {
      console.error('List files failed:', error);
      setFileListResult(`❌ List files failed: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectPdf = async () => {
    setIsLoading(true);
    setPdfTestResult('Testing direct PDF download...');

    try {
      // Generate a simple PDF (just simple enough to test the download)
      // This is a minimal PDF structure
      const minimalPdf = `
JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PCAvTGVuZ3RoIDEwNCAvRmlsdGVyIC9GbGF0ZURlY29k
ZSA+PgpzdHJlYW0KeJxFjTEOgDAMBPc8xY0FdXwwj6H/a6iRoLR5f2AFkS5Z5jy0UwpDMBDPFjGR
ZYV3KvIdYcqMYVH7VO0Cd0rZ+gndQPzx2+W51m1PF6KtK7F+D/AFNhEg8gplbmRzdHJlYW0KZW5k
b2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAzIDAgUiAvUmVzb3VyY2VzIDQgMCBS
IC9Db250ZW50cyA1IDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKNCAwIG9i
ago8PCAvUHJvY1NldCBbIC9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUkgXSAvQ29s
b3JTcGFjZSA8PCAvQ3MxIDYgMCBSCj4+IC9Gb250IDw8IC9UVDIgOCAwIFIgPj4gPj4KZW5kb2Jq
CjkgMCBvYmoKPDwgL0xlbmd0aCAyNTAgL0ZpbHRlciAvRmxhdGVEZWNvZGUgPj4Kc3RyZWFtCnic
XZBBboQwDEX3OUVWnUVoKlSJiyAhzaZVD5AYQ6QJICIswu2rgXakmZX9/f2f7URXP/cD+YzR+4kW
mqONNIfdEWmgNfrgjILVhjDlVbTREwdKsb/MKedjIsfCcLoRzTm6ha7XovgVX0w0x5QeoZ68pyv2
J9PnMTI+U0qP6ChGctRMdr5J3YfuCbGQa+y97XHwKfaXvP9SAr+Tv10pVNbLg5uRbSQtRbJaKUXs
jvtb5MGOT40FfQWrp3RJ2qZs8rYsyY9seTU+Z3t1GZ/Z7kryxcQbVi/IHi/rP9hmdPKV6wd25F9w
CmVuZHN0cmVhbQplbmRvYmoKOCAwIG9iago8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHJ1ZVR5
cGUgL0Jhc2VGb250IC9BQUFBQUErTGliZXJhdGlvblNhbnMKL0ZvbnREZXNjcmlwdG9yIDcgMCBS
IC9Ub1VuaWNvZGUgOSAwIFIgL0ZpcnN0Q2hhciAzMyAvTGFzdENoYXIgNDYKL1dpZHRocyBbIDY2
NyAyNzcgNTU2IDIyMiA4MzMgNTU2IDI3NyA1NTYgMjc3IDU1NiAyMjIgNTU2IF0gPj4KZW5kb2Jq
CjcgMCBvYmoKPDwgL1R5cGUgL0ZvbnREZXNjcmlwdG9yIC9Gb250TmFtZSAvQUFBQUFBK0xpYmVy
YXRpb25TYW5zIC9GbGFncyA0IC9Gb250QkJveApbLTU0MyAtMzAzIDEzMDEgOTgwXSAvSXRhbGlj
QW5nbGUgMCAvQXNjZW50IDkwNSAvRGVzY2VudCAtMjExIC9DYXBIZWlnaHQKOTAxIC9TdGVtViA3
OCAvWEhlaWdodCA0MjMgL1N0ZW1IIDc4IC9BdmdXaWR0aCA0MDQgL01heFdpZHRoIDEzMDQgL0Zv
bnRGaWxlMgoxMCAwIFIgPj4KZW5kb2JqCjYgMCBvYmoKWyAvSUNDQmFzZWQgMTEgMCBSIF0KZW5k
b2JqCjExIDAgb2JqCjw8IC9MZW5ndGggMjY3MyAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJl
YW0KeJydlndUU9kWh8+9N71QkhCKlNBraFICSA29SJEuKjEJEErAkAAiNkRUcERRkaYIMijggKND
kbEiioUBUbHrBBlE1HFwFBuWSWStGd+8ee/Nm98f935rn73P3Wfvfda6AJD8gwXCTFgJgAyhWBTh
58WIjYtnYAcBDPAAA2wA4HCzs0IW+EYCmQJ82IxsmRP4F726DiD5+yrTP4zBAP+flLlZIjEAUJiM
5/L42VwZF8k4PVecJbdPyZi2NE3OMErOIlmCMlaTc/IsW3z2mWUPOfMyhDwZy3PO4mXw5Nwn4405
Er6MkWAZF+cI+LkyviZjg3RJhkDGb+SxGXxONgAoktwu5nNTZGwtY5IoMoIt43kA4EjJX/DSL1jM
zxPLD8XOzFouEiSniBkmXFOGjZMTi+HPz03ni8XMMA43jSPiMdiZGVkc4XIAZs/8WRR5bRmyIjvY
ODk4MG0tbb4o1H9d/JuS93aWXoR/7hlEH/jD9ld+mQ0AsKZltdn6h21pFQBd6wFQu/2HzWAvAIqy
vwXGcI+DNXNsHViRBeQPkcxW8vlIMzKg8QXXaRZvx8TZNGXadSxzhOoIrwDcxZp3cjrXWUKLw9QP
vQcWk6bx/iM8MD3rivX/jvIPyJ+YAZSAUGTAU2Fdf+7yHp3I3jjGvR5BihIogkM2BcryQEEJwLR2
xz2QXBwuDvhJF2ZR0KEOEt0xPcFAxah07rXDT2Ni0ZsMHHvN5zYAaT1mqpM2QiNZvLM02/oOt01D
kbmk/R+f1WmvdW1/pdDnE0mRlE0kyLpC9PT2PPsYGZGpHQm32YPYfnzp+wLSqE9eIoEQaCRmPn6G
56dM46Gfad+f7e9TRMrJnPF8+bk77yl+DBt3n77B97JcRs7wfPGHgrUL7bncUDQBrPengbCHBCiU
CEt2HaXpSA+pwnDGbXkjTBLCnDqBbVkfuUASRKYeZc0Qn5EAAtNLgJfKOQV6JF//XpiDXhKwiAxy
Dv3Nl4PmjYH+Tiv5zKzs7PpM5yZsaIf/ucIJYO48rQBGIZTsA5i9YjuUSh6FdIr9vJi8fycgBGdx
ggM9ueLnRGOzoqlQRqjpqpKLXECBrqskrO/QTZrlgxf+E5W7rnxVWPnL/wjWZs6T3fTI7raJz9Pc
pf0SHXxpnOJefL+4/XefD5wfjzK/f8FRvc/+B3XewvsS+JQSNIs1faGa0Ze55nrmifOYjPdA08y7
R5LcY1q3Mq9xDGkkBLC9M8Jue6tXGwEJGSQZodNK8v1TFIGs3i1ndvvi2+8WVPHLhzMxt5/d3Ds/
HJ/Q+v4/IVS/W/On3q/unrb1TGFTA+/h7+fcj5Mv6ix1qXDIUgSoTa3W5jyE/R68VezI/2gnNWYXZ
K6c+6wULcSOgBCnuUJT1fjJQnJWnvebbXxVDRn0kVW3h+upBnrIjJzlGXR3z6JG3VJL0F/rjIzN+X
oi9RVCPLBSW8a2+qaaq8mHNr96znXwC2r+8U2jVxeiB1bG8vYHN3PcDz3MHXt4NSZuFLMA+yy2LVX
JO4RQWBXt923f2nGQV+57d0GTfNLXucU978mdnVFU2ZWU2T041boLSu99yXFNTk+PNm/q6kjNjf2b
3AB6f76iP38tQswxS61N2j0va/zjQ8vHa8VU1LaODlJt6S5H+jy4+3XO2bWKfaa0ebLWnIebbduYK
rMrki01X670slKt9nqpzpDRhfJUFLMz3TWP+8Ysd3xX7eaV1vrz8+GdmlrNvZ5TndXdXtV9fgbIXr
/AA/x7o+ydnQfYfmZpGvpKTKa6nneQaTDV1L97pJCVfZHSFcX+8fZmm95957tFP5y+nDT65PnXwM+
Bdwz8Cn99bcern/KmnPz70x/fs/3gOVHsvHR88fn9dd8L2mtPPjp/+H7tz78kPrzzomBVVfHyuuTn
9R+vPVex7dVzPz9fHJoKS88srHYbmx3vrbqwYGRgdmh5pWK5pLifubq0um31xe/3VbqWlNZ/VLa5e
c/nNm9+dPft9b+TiG/P2z37zt7//9nDpj8CDAAA=
`;

      // Download the PDF
      const today = new Date().toISOString().split('T')[0];
      await downloadFile(`android-test-${today}.pdf`, minimalPdf);
      
      setPdfTestResult('✅ Direct PDF test successful. Check your downloads or Documents folder.');
    } catch (error) {
      console.error('Direct PDF test failed:', error);
      setPdfTestResult(`❌ Direct PDF test failed: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Android Testing Page</h1>
      
      <div className="mb-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Platform Detection</h2>
        <p className="mb-4">Current Platform: <span className="font-mono">{platform}</span></p>
        <button 
          onClick={testPlatform}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          disabled={isLoading}
        >
          Test Platform
        </button>
      </div>
      
      <div className="mb-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">File Operations</h2>
        <button 
          onClick={testFileWrite}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mr-2 mb-2"
          disabled={isLoading}
        >
          Test File Write
        </button>
        <button 
          onClick={listFiles}
          className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded mb-2"
          disabled={isLoading}
        >
          List Files
        </button>
        {fileTestResult && (
          <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded">
            <pre className="whitespace-pre-wrap">{fileTestResult}</pre>
          </div>
        )}
        {fileListResult && (
          <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded">
            <pre className="whitespace-pre-wrap">{fileListResult}</pre>
          </div>
        )}
      </div>
      
      <div className="mb-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">PDF Testing</h2>
        <button 
          onClick={testDirectPdf}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
          disabled={isLoading}
        >
          Direct PDF Test
        </button>
        {pdfTestResult && (
          <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded">
            <pre className="whitespace-pre-wrap">{pdfTestResult}</pre>
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-center mt-2">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}