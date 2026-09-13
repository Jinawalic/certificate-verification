"use client";

import React, { useState } from "react";
import { QrCode, Camera, Upload, X, Check, AlertCircle } from "lucide-react";

export interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCertificateDetected: (certificateId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onCertificateDetected,
}) => {
  const [mode, setMode] = useState<"camera" | "upload" | "presets">("camera");
  const [simulatedScanning, setSimulatedScanning] = useState(false);

  if (!isOpen) return null;

  const sampleCertificates = [
    { id: "NSUK/2023/BSC/1049", student: "Amina Ibrahim Danladi", degree: "B.Sc. Computer Science (First Class Hons)" },
    { id: "NSUK/2022/LLB/0412", student: "Chukwudi Emmanuel Eze", degree: "LL.B. Common & Islamic Law (Second Class Upper)" },
    { id: "NSUK/2021/MSC/0083", student: "Fatima Mohammed Bello", degree: "M.Sc. Business Administration" },
  ];

  const handleSimulateScan = (certId: string) => {
    setSimulatedScanning(true);
    setTimeout(() => {
      setSimulatedScanning(false);
      onCertificateDetected(certId);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-800 ring-1 ring-emerald-700">
              <QrCode className="h-5 w-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">Scan Certificate QR Code</h3>
              <p className="text-xs text-emerald-200/80">NSUK Anti-Tamper Holographic Verification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 mb-5">
            <button
              type="button"
              onClick={() => setMode("camera")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                mode === "camera"
                  ? "bg-white text-emerald-900 shadow-xs font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Camera Scanner</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                mode === "upload"
                  ? "bg-white text-emerald-900 shadow-xs font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          {mode === "camera" && (
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-emerald-800/30 bg-slate-950 p-8 text-center text-white min-h-[220px]">
              {/* Animated Laser Scanning Line */}
              <div className="absolute inset-x-8 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-900/60 border border-emerald-500/30 mb-3">
                  <Camera className="h-8 w-8 text-emerald-300 animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-slate-100">
                  Align NSUK Certificate QR Code within camera
                </p>
                <p className="mt-1 text-xs text-slate-400 max-w-xs">
                  Position the official watermark QR code printed on the bottom-right of your certificate.
                </p>
              </div>

              {/* Instant Test Bar */}
              <div className="mt-5 w-full border-t border-slate-800 pt-3">
                <p className="text-[11px] font-medium text-emerald-400 mb-2">
                  Or test with verified NSUK sample data:
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {sampleCertificates.map((cert) => (
                    <button
                      key={cert.id}
                      type="button"
                      disabled={simulatedScanning}
                      onClick={() => handleSimulateScan(cert.id)}
                      className="rounded-md bg-emerald-950/80 border border-emerald-600/40 px-2.5 py-1 text-[11px] font-mono text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors"
                    >
                      {cert.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === "upload" && (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <Upload className="h-10 w-10 text-emerald-800 mb-2" />
              <p className="text-sm font-semibold text-slate-800">
                Drag & Drop certificate image or PDF
              </p>
              <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, or PDF up to 10MB</p>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900 transition-colors">
                <span>Browse Files</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={() => handleSimulateScan(sampleCertificates[0].id)}
                />
              </label>
            </div>
          )}

          {/* Quick Notice */}
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200/60">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              All QR codes on Nasarawa State University certificates contain a SHA-256 digital signature traceable to the University Registry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
