'use client'
import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onError: (error: Error) => void;
}

const BarcodeScanner = ({ onScan, onError }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Verificar se está no cliente
    if (typeof window !== 'undefined') {
      import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
        const scanner = new Html5QrcodeScanner(
          'barcode-scanner-container',
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            rememberLastUsedCamera: true,
            supportedScanTypes: [1] // 1 = código de barras
          },
          false
        );

        scannerRef.current = scanner;

        const successCallback = (decodedText: string) => {
          onScan(decodedText);
          scanner.clear().catch(error => {
            console.error('Failed to clear scanner', error);
          });
        };

        // Adaptação para o tipo de erro esperado
        const errorCallback = (errorMessage: string, error: unknown) => {
          const errorObj = error instanceof Error ? error : new Error(errorMessage);
          onError(errorObj);
        };

        scanner.render(successCallback, errorCallback);

        return () => {
          if (scannerRef.current) {
            scannerRef.current.clear().catch(error => {
              console.error('Failed to clear scanner', error);
            });
          }
        };
      });
    }
  }, [onScan, onError]);

  return <div id="barcode-scanner-container" className="w-full h-64" />;
};

export default BarcodeScanner;