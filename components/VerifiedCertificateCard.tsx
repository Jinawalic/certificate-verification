"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

export interface VerifiedCertificateCardProps {
  /** The certificate number entered, e.g. "NSUK/SR/FT/2023/2024/2543" */
  certificateNumber?: string;
  /** Name of the uploaded file if originating from document upload */
  documentName?: string;
  /** Optional custom subtext override */
  customSubtitle?: string;
  /** Callback to reset or clear the verified state */
  onReset?: () => void;
  /** Optional close callback */
  onClose?: () => void;
  /** Label for the reset button (defaults to "Search Another") */
  resetLabel?: string;
}

export const VerifiedCertificateCard: React.FC<VerifiedCertificateCardProps> = ({
  certificateNumber,
  documentName,
  customSubtitle,
  onReset,
  onClose,
  resetLabel = "Search Another",
}) => {
  return (
    <div className="py-6 px-4 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
      {/* Centered Emerald Checkmark Badge */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mb-4 shadow-xs">
        <CheckCircle2 className="h-8 w-8 text-emerald-700" />
      </div>

      {/* Main Headline */}
      <h4 className="text-xl font-bold text-slate-900">
        Verified certificate will appear here
      </h4>

      {/* Subtitle / Document or Certificate Details */}
      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm">
        {customSubtitle ? (
          customSubtitle
        ) : certificateNumber ? (
          <span>
            Certificate Number:{" "}
            <span className="font-semibold text-emerald-900 font-mono">
              {certificateNumber}
            </span>
          </span>
        ) : documentName ? (
          <span>
            Uploaded: <span className="font-semibold text-slate-700">{documentName}</span>
          </span>
        ) : (
          "Certificate verified against official NSUK Senate registry"
        )}
      </p>

      {/* Action Buttons */}
      {(onReset || onClose) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              {resetLabel}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 transition-colors cursor-pointer shadow-xs"
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
};
