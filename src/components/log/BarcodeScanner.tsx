"use client";
import { useEffect, useRef, useState, useCallback, Component, type ReactNode } from "react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

// Error boundary to catch any unexpected throws from html5-qrcode
class ScannerErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function ScannerInner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  // Stable callback ref to avoid re-triggering the effect
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    async function startScanner() {
      // html5-qrcode accesses window/document — guard against SSR
      if (typeof window === "undefined") return;

      // Pre-check camera permission before loading the library.
      // When permanently denied, html5-qrcode can throw uncaught errors
      // internally that crash the page.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        // Permission granted — release the stream so the library can claim it
        stream.getTracks().forEach((t) => t.stop());
      } catch (err: any) {
        if (cancelled || !mountedRef.current) return;
        const msg = err?.name || err?.message || "";
        if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
          setError("Camera permission denied. Please allow camera access in your browser settings, or enter the barcode manually below.");
        } else if (msg.includes("NotFoundError")) {
          setError("No camera found. Enter barcode manually below.");
        } else if (msg.includes("NotReadableError")) {
          setError("Camera is in use by another app. Enter barcode manually below.");
        } else {
          setError("Camera not available. Enter barcode manually below.");
        }
        return;
      }

      if (cancelled || !mountedRef.current) return;

      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        // Ensure DOM element exists before init
        const el = document.getElementById("barcode-reader");
        if (!el) {
          if (mountedRef.current) setError("Scanner could not load. Enter barcode manually below.");
          return;
        }

        const scanner = new Html5Qrcode("barcode-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText: string) => {
            scanner.stop().catch(() => {});
            scannerRef.current = null;
            onScanRef.current(decodedText);
          },
          () => {} // ignore scan failures (no barcode in frame)
        );
      } catch (err: any) {
        if (cancelled || !mountedRef.current) return;
        setError("Camera not available. Enter barcode manually below.");
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []); // no dependencies — runs once on mount

  const handleManualSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanRef.current(manualCode.trim());
    }
  }, [manualCode]);

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

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [boundaryError, setBoundaryError] = useState(false);

  if (boundaryError) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl p-4 w-full max-w-sm mx-4 text-center">
          <p className="text-sm text-gray-700 mb-3">
            Barcode scanner failed to load. This can happen on some browsers.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <ScannerErrorBoundary onError={() => setBoundaryError(true)}>
      <ScannerInner onScan={onScan} onClose={onClose} />
    </ScannerErrorBoundary>
  );
}
