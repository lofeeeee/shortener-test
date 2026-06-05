"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrCodeModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  slug: string;
}

export default function QrCodeModal({ open, onClose, url, slug }: QrCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 256,
      margin: 2,
      color: { dark: "#0f766e", light: "#ffffff" },
    });
  }, [open, url]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${slug}.png`;
    a.click();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center gap-4 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full">
          <p className="text-sm font-semibold text-teal-900">QR Code</p>
          <button onClick={onClose} className="text-teal-400 hover:text-teal-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <canvas ref={canvasRef} className="rounded-lg" />

        <p className="text-xs text-teal-600 font-mono text-center break-all">/{slug}</p>

        <Button
          onClick={download}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>
    </div>
  );
}
