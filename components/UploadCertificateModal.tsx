"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
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
  Camera,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { CertificateDisplayCard } from "./CertificateDisplayCard";
import { VerifiedCertificate } from "@/lib/verification";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [progressStage, setProgressStage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [verifiedCertificate, setVerifiedCertificate] = useState<VerifiedCertificate | null>(null);
  const [matchReport, setMatchReport] = useState<{
    confidence?: number;
    matchedFields?: {
      certificateNumber?: boolean;
      matricNumber?: boolean;
      fullName?: boolean;
      degreeAwarded?: boolean;
      classOfDegree?: boolean;
    };
    source?: "upload" | "camera";
  } | null>(null);

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
    setVerifiedCertificate(null);
    setMatchReport(null);

    // Validate format
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please upload a valid PDF document or certificate image (PNG, JPG, JPEG, WebP).");
      return;
    }

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("The uploaded file exceeds the 8MB limit. Please upload a smaller photo.");
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
    setVerifiedCertificate(null);
    setMatchReport(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleClose = () => {
    setIsVerifying(false);
    handleClearFile();
    onClose();
  };

  const handleExecuteVerification = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select or snap a certificate file first.");
      return;
    }

    setErrorMessage(null);
    setIsVerifying(true);
    setProgressStage("Reading certificate & performing OCR text scan...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Transition stages for pleasant UX
      const stageTimer = setTimeout(() => {
        setProgressStage("Cross-referencing details against Senate Central Register...");
      }, 1500);

      const res = await fetch("/api/verify/document", {
        method: "POST",
        body: formData,
      });

      clearTimeout(stageTimer);
      const data = await res.json();

      if (!res.ok || !data.success || !data.certificate) {
        throw new Error(
          data.error ||
            "The certificate details could not be verified against the official university records."
        );
      }

      setVerifiedCertificate(data.certificate);
      setMatchReport({
        confidence: data.confidence || 98,
        matchedFields: data.matchedFields,
        source: "upload",
      });

      if (onVerified && data.certificate.id) {
        onVerified(data.certificate.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Document verification failed.";
      setErrorMessage(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div
        className={`relative w-full rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden my-auto flex flex-col transition-all ${
          verifiedCertificate ? "max-w-3xl max-h-[92vh]" : "max-w-xl"
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/10 bg-emerald-950 px-6 py-4 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 ring-1 ring-emerald-700 text-white shadow-xs">
              <FileCheck className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Verify Certificate Document or Photo</h3>
              <p className="text-xs text-emerald-200/80">
                Automatic OCR & Senate Central Register Cross-Verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isVerifying}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {verifiedCertificate ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Verification Result
                </span>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-800 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Verify Another Document</span>
                </button>
              </div>

              <CertificateDisplayCard
                certificate={verifiedCertificate}
                matchReport={matchReport || undefined}
              />
            </div>
          ) : (
            <>
              {/* File Inputs (Standard File Browse & Direct Camera Capture) */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />

              {!selectedFile ? (
                <div className="space-y-3">
                  {/* Upload Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                      dragActive
                        ? "border-emerald-700 bg-emerald-50/70 scale-[0.99]"
                        : "border-slate-300 bg-slate-50/60 hover:border-emerald-700 hover:bg-emerald-50/30"
                    }`}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mb-3 shadow-xs">
                      <Upload className="h-7 w-7" />
                    </div>

                    <h4 className="text-sm font-bold text-slate-800">
                      Click to browse or drag & drop certificate
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 max-w-xs">
                      Supports official NSUK certificates in PDF, PNG, JPG, or JPEG format (Up to 8MB)
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors">
                      <FileText className="h-4 w-4" />
                      <span>Browse Files</span>
                    </div>
                  </div>

                  {/* Camera Snap Option */}
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">or</span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-emerald-800/30 bg-emerald-50/80 hover:bg-emerald-100/70 p-3.5 text-xs font-bold text-emerald-950 transition-all cursor-pointer shadow-xs"
                  >
                    <Camera className="h-4 w-4 text-emerald-800" />
                    <span>Snap Certificate Photo with Camera</span>
                  </button>
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
                          Ready for OCR scan & Senate cross-check
                        </span>
                      </div>
                    </div>

                    {!isVerifying && (
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Image Preview if applicable */}
                  {previewUrl && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 max-h-48 bg-white flex items-center justify-center p-2 shadow-inner">
                      <img
                        src={previewUrl}
                        alt="Certificate preview"
                        className="max-h-44 object-contain rounded"
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

              {/* Validation Error Banner */}
              {errorMessage && (
                <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-800 border border-rose-200 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Verification Inconclusive</p>
                    <p className="text-[11px] leading-relaxed text-rose-700">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Security & Action Bar */}
              <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isVerifying}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isVerifying || !selectedFile}
                  onClick={handleExecuteVerification}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Document</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
