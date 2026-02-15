"use client";
import { useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    let scanner: any = null;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        scanner = new Html5Qrcode("barcode-reader");
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText: string) => {
            scanner.stop().catch(() => {});
            onScan(decodedText);
          },
          () => {}
        );
      } catch {
        setError("Camera not available. Enter barcode manually below.");
      }
    }

    startScanner();

    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
      }
    };
  }, [onScan]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
      <div className="bg-white rounded-2xl p-4 w-full max-w-sm mx-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Scan Barcode</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <div
          id="barcode-reader"
          ref={scannerRef}
          className="w-full rounded-xl overflow-hidden mb-3"
          style={{ minHeight: 200 }}
        />

        {error && (
          <p className="text-sm text-amber-600 mb-3">{error}</p>
        )}

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Or enter barcode manually"
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!manualCode.trim()}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            Look Up
          </button>
        </form>
      </div>
    </div>
  );
}
