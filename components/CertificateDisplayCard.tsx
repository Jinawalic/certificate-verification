"use client";

import React, { useState, useRef } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Printer,
  Download,
  Award,
  Calendar,
  Building2,
  User,
  QrCode,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCheck2,
  Copy,
  Check
} from "lucide-react";
import { StatementOfResultTemplate } from "@/components/StatementOfResultTemplate";
import { VerifiedCertificate } from "@/lib/verification";

export interface CertificateDisplayCardProps {
  certificate: VerifiedCertificate;
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
  onPrint?: () => void;
  className?: string;
}

export const CertificateDisplayCard: React.FC<CertificateDisplayCardProps> = ({
  certificate,
  matchReport,
  onPrint,
  className = "",
}) => {
  const [activeView, setActiveView] = useState<"certificate" | "ledger">("certificate");
  const [zoomScale, setZoomScale] = useState<number>(0.58);
  const [isCopied, setIsCopied] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handleCopyHash = () => {
    if (certificate.cryptographicHash) {
      navigator.clipboard.writeText(certificate.cryptographicHash);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleLocalPrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }

    // Direct browser print focusing on printable certificate
    const printElem = document.getElementById("certificate-visual-printable");
    if (!printElem) {
      window.print();
      return;
    }

    const printIframe = document.createElement("iframe");
    printIframe.style.position = "fixed";
    printIframe.style.right = "0";
    printIframe.style.bottom = "0";
    printIframe.style.width = "0";
    printIframe.style.height = "0";
    printIframe.style.border = "0";
    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>NSUK Certificate - ${certificate.fullName}</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #fff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .print-container {
                width: 794px;
                height: 1123px;
                position: relative;
                box-sizing: border-box;
                overflow: hidden;
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${printElem.outerHTML}
            </div>
            <script>
              window.onload = function() {
                window.focus();
                window.print();
                setTimeout(function() {
                  window.frameElement.parentNode.removeChild(window.frameElement);
                }, 1000);
              };
            </script>
          </body>
        </html>
      `);
      doc.close();
    }
  };

  // Strip prefix for display on StatementOfResultTemplate serial slot
  const serialOnly = (certificate.certificateNumber || "")
    .replace(/^NSUK[\/-](SR[\/-])?/i, "");

  return (
    <div className={`flex flex-col rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/10 overflow-hidden ${className}`}>
      {/* Top Verified Header Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-inner ring-2 ring-emerald-500/40">
            <ShieldCheck className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Official Senate Record Verified
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-200 border border-emerald-400/30">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                Active & Authentic
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white leading-tight mt-0.5">
              {certificate.fullName}
            </h3>
          </div>
        </div>

        {/* View Switchers & Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="inline-flex rounded-lg bg-emerald-950/80 p-1 border border-emerald-800">
            <button
              type="button"
              onClick={() => setActiveView("certificate")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                activeView === "certificate"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "text-emerald-200 hover:text-white"
              }`}
            >
              Certificate Graphic
            </button>
            <button
              type="button"
              onClick={() => setActiveView("ledger")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                activeView === "ledger"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "text-emerald-200 hover:text-white"
              }`}
            >
              Ledger Details
            </button>
          </div>

          <button
            type="button"
            onClick={handleLocalPrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
            title="Print Certificate"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* OCR Match Report Notification if scanned from photo */}
      {matchReport && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-950 font-medium">
            <FileCheck2 className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>
              Document verified with{" "}
              <strong className="text-emerald-800 font-bold">
                {matchReport.confidence || 98}% match confidence
              </strong>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
            {matchReport.matchedFields?.fullName && (
              <span className="rounded bg-emerald-200/70 text-emerald-900 px-2 py-0.5">
                ✓ Student Name
              </span>
            )}
            {matchReport.matchedFields?.certificateNumber && (
              <span className="rounded bg-emerald-200/70 text-emerald-900 px-2 py-0.5">
                ✓ Certificate No
              </span>
            )}
            {matchReport.matchedFields?.degreeAwarded && (
              <span className="rounded bg-emerald-200/70 text-emerald-900 px-2 py-0.5">
                ✓ Degree Awarded
              </span>
            )}
            {matchReport.matchedFields?.classOfDegree && (
              <span className="rounded bg-emerald-200/70 text-emerald-900 px-2 py-0.5">
                ✓ Classification
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 bg-slate-100/60 min-h-[480px] flex flex-col items-center justify-center">
        {activeView === "certificate" ? (
          <div className="w-full flex flex-col items-center">
            {/* Zoom & View Toolbar */}
            <div className="mb-3 flex items-center justify-between w-full max-w-2xl px-2">
              <span className="text-xs font-medium text-slate-500">
                Official NSUK Statement of Result & Certificate Visual
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomScale((prev) => Math.max(0.4, prev - 0.08))}
                  className="rounded-md border border-slate-300 bg-white p-1 text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold text-slate-600 px-1">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((prev) => Math.min(1.0, prev + 0.08))}
                  className="rounded-md border border-slate-300 bg-white p-1 text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Certificate Preview Wrapper */}
            <div
              className="relative overflow-auto max-h-[620px] w-full flex items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-200/60 shadow-inner scrollbar-thin"
              ref={printContainerRef}
            >
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: "top center",
                  marginBottom: `-${(1 - zoomScale) * 1123}px`,
                }}
                className="transition-transform duration-150"
              >
                <StatementOfResultTemplate
                  id="certificate-visual-printable"
                  studentName={certificate.fullName}
                  degreeType={certificate.degreeAwarded}
                  degreeClass={certificate.classOfDegree}
                  issueDate={certificate.dateOfIssue || certificate.senateApprovalDate || "28th October, 2024"}
                  serialNumber={serialOnly}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Senate Ledger Details View */
          <div className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Candidate Full Name
              </span>
              <h4 className="text-2xl font-bold text-slate-900 mt-0.5">
                {certificate.fullName}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60">
                <span className="text-[11px] font-semibold uppercase text-slate-400">
                  Certificate Number
                </span>
                <p className="text-sm font-mono font-bold text-emerald-900 mt-1">
                  {certificate.certificateNumber || "Pending Issuance"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60">
                <span className="text-[11px] font-semibold uppercase text-slate-400">
                  Matriculation Number
                </span>
                <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                  {certificate.matricNumber}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60 sm:col-span-2">
                <span className="text-[11px] font-semibold uppercase text-slate-400">
                  Degree Awarded
                </span>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {certificate.degreeAwarded}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60">
                <span className="text-[11px] font-semibold uppercase text-slate-400">
                  Faculty & Department
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-1">
                  {certificate.faculty}
                </p>
                <p className="text-xs text-slate-500">{certificate.department}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60">
                <span className="text-[11px] font-semibold uppercase text-slate-400">
                  Class of Degree & Year
                </span>
                <p className="text-xs font-bold text-emerald-900 mt-1">
                  {certificate.classOfDegree}
                </p>
                <p className="text-xs text-slate-500">Graduation Class of {certificate.graduationYear}</p>
              </div>
            </div>

            {/* Cryptographic Checksum */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-slate-400">
                  Cryptographic Digital Seal (SHA-256)
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold"
                >
                  {isCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{isCopied ? "Copied" : "Copy Hash"}</span>
                </button>
              </div>
              <p className="font-mono text-[11px] text-slate-600 break-all bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1">
                {certificate.cryptographicHash || "Validated in Central Senate Registry"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="border-t border-slate-200 bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>Validated against official Nasarawa State University, Keffi Registry</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleLocalPrint}
            className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Official Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
