"use client";

import React from "react";
import { ShieldCheck, X, AlertCircle, FileX2, Loader2, ArrowLeft } from "lucide-react";
import { CertificateDisplayCard } from "./CertificateDisplayCard";
import { VerifiedCertificate } from "@/lib/verification";

export interface SearchVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateNumber: string;
  certificate?: VerifiedCertificate | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  matchReport?: {
    confidence?: number;
    matchedFields?: {
      certificateNumber?: boolean;
      matricNumber?: boolean;
      fullName?: boolean;
      degreeAwarded?: boolean;
      classOfDegree?: boolean;
    };
    source?: "search" | "upload" | "camera";
  };
  onSearchAnother?: () => void;
}

export const SearchVerificationModal: React.FC<SearchVerificationModalProps> = ({
  isOpen,
  onClose,
  certificateNumber,
  certificate,
  isLoading = false,
  errorMessage = null,
  matchReport,
  onSearchAnother,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Institutional Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/10 bg-emerald-950 px-5 py-3.5 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 ring-1 ring-emerald-700 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">NSUK Certificate Verification</h3>
              <p className="text-[11px] text-emerald-200/80">
                Official Senate Central Register &bull; Academic Affairs Division
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Container with Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* 1. Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 mb-4 shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Querying Senate Registry...
              </h4>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm">
                Verifying academic record for{" "}
                <span className="font-mono font-bold text-emerald-900">
                  {certificateNumber}
                </span>
              </p>
            </div>
          )}

          {/* 2. Error / Not Found State */}
          {!isLoading && (errorMessage || !certificate) && (
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4 shadow-xs">
                <FileX2 className="h-8 w-8 text-rose-600" />
              </div>

              <h4 className="text-xl font-bold text-slate-900">
                Academic Credential Not Found
              </h4>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
                {errorMessage ||
                  `No graduate record matching "${certificateNumber}" was found in the Senate Central Register.`}
              </p>

              <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-[11px] text-amber-900 max-w-md text-left">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                  Verification Advice:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800/90 pl-1">
                  <li>Confirm the certificate number is typed without typos.</li>
                  <li>You can search by matriculation number (e.g. NSUK/NAS/CSC/20/0912).</li>
                  <li>Or upload a clear photograph of the certificate for OCR validation.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onSearchAnother) onSearchAnother();
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 transition-colors cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Try Another Search</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* 3. Verified Certificate Found State */}
          {!isLoading && certificate && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <CertificateDisplayCard
                certificate={certificate}
                matchReport={matchReport}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
