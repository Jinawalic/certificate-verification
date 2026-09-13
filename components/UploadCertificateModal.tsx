"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  FileCheck,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from "lucide-react";

export interface UploadCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (certificateId: string) => void;
}

export const UploadCertificateModal: React.FC<UploadCertificateModalProps> = ({
  isOpen,
  onClose,
  onVerified,
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [progressStage, setProgressStage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);

    // Validate format
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please upload a valid PDF document or image file (PNG, JPG, JPEG, WebP).");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("The uploaded file exceeds the 5MB limit. Please upload a smaller file.");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExecuteVerification = (certId = "NSUK-SR-FT-2023-2024-2543") => {
    if (!selectedFile) {
      setErrorMessage("Please select or drop a certificate document first.");
      return;
    }

    setIsVerifying(true);
    setProgressStage("Extracting optical watermark and digital seals...");

    setTimeout(() => {
      setProgressStage("Cross-referencing NSUK Senate graduation register...");
    }, 800);

    setTimeout(() => {
      setProgressStage("Verifying SHA-256 cryptographic authenticity...");
    }, 1500);

    setTimeout(() => {
      setIsVerifying(false);
      if (onVerified) {
        onVerified(certId);
      }
      onClose();
      router.push(`/verify/${encodeURIComponent(certId)}`);
    }, 2200);
  };

  const handleUseSampleDocument = (fileName: string, certId: string) => {
    // Simulate a mock uploaded file
    const mockFile = new File(["NSUK Official Certificate Sample Document"], fileName, {
      type: fileName.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
    });
    setSelectedFile(mockFile);
    setPreviewUrl(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 ring-1 ring-emerald-700 text-white shadow-xs">
              <FileCheck className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Verify Certificate Document</h3>
              <p className="text-xs text-emerald-200/80">
                Upload scanned PDF or certificate image for instant verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isVerifying}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Upload Drop Zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${dragActive
                ? "border-emerald-700 bg-emerald-50/70 scale-[0.99]"
                : "border-slate-300 bg-slate-50/60 hover:border-emerald-700 hover:bg-emerald-50/30"
                }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mb-3 shadow-xs">
                <Upload className="h-7 w-7" />
              </div>

              <h4 className="text-sm font-bold text-slate-800">
                Click to browse or drag and drop certificate
              </h4>
              <p className="mt-1 text-xs text-slate-500 max-w-xs">
                Supports official NSUK certificates in PDF, PNG, JPG, or JPEG format (Up to 5MB)
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors">
                <FileText className="h-4 w-4" />
                <span>Select Document</span>
              </div>
            </div>
          ) : (
            /* Selected File Preview Box */
            <div className="rounded-2xl border border-emerald-800/20 bg-emerald-50/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-xs">
                    {selectedFile.type === "application/pdf" ? (
                      <FileText className="h-6 w-6 text-emerald-200" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-emerald-200" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull;{" "}
                      {selectedFile.type === "application/pdf" ? "PDF Document" : "Certificate Image"}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                      Document ready for verification
                    </span>
                  </div>
                </div>

                {!isVerifying && (
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Image Preview if applicable */}
              {previewUrl && (
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 max-h-40 bg-white flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Certificate preview"
                    className="max-h-40 object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Verification in Progress Banner */}
          {isVerifying && (
            <div className="mt-4 rounded-xl bg-emerald-950 p-4 text-white animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Verifying with Senate Records
                  </p>
                  <p className="text-xs text-emerald-100/90 mt-0.5">{progressStage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Error */}
          {errorMessage && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Security & Action Bar */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isVerifying}
                className="flex-1 sm:flex-initial rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile || isVerifying}
                onClick={() => handleExecuteVerification()}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Verify</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
