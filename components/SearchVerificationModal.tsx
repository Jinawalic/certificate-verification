"use client";

import React from "react";
import { ShieldCheck, X, CheckCircle2 } from "lucide-react";

export interface SearchVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateNumber: string;
  onSearchAnother?: () => void;
}

export const SearchVerificationModal: React.FC<SearchVerificationModalProps> = ({
  isOpen,
  onClose,
  certificateNumber,
  onSearchAnother,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden">
        {/* Modal Header matching UploadCertificateModal */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 ring-1 ring-emerald-700 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Certificate Verification</h3>
              <p className="text-xs text-emerald-200/80">
                Official NSUK Senate & Academic Registry Verification
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

        {/* Modal Body */}
        <div className="p-6">
          <div className="py-6 px-4 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Emerald Checkmark Badge */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mb-4 shadow-xs">
              <CheckCircle2 className="h-8 w-8 text-emerald-700" />
            </div>

            {/* Main Headline */}
            <h4 className="text-xl font-bold text-slate-900">
              Verified certificate will appear here
            </h4>

            {/* Certificate Details */}
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm">
              Certificate Number:{" "}
              <span className="font-semibold text-emerald-900 font-mono">
                {certificateNumber}
              </span>
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (onSearchAnother) onSearchAnother();
                  onClose();
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
              >
                Search Another
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
