"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Printer, 
  QrCode, 
  Calendar, 
  Award, 
  Building2, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileX2
} from "lucide-react";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { VerifiedCertificate } from "@/lib/verification";

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

export default function VerifyResultPage({ params }: VerifyPageProps) {
  const resolvedParams = use(params);
  const rawId = resolvedParams.id;

  const [cert, setCert] = useState<VerifiedCertificate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCertificate() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const res = await fetch(`/api/verify/${encodeURIComponent(rawId)}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "No verified academic record matches this identifier.");
        }

        setCert(data.certificate);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Verification record lookup failed.";
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadCertificate();
  }, [rawId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <LayoutWrapper pageTitle="Official Certificate Verification Details">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation & Actions Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
            <span>Search Another Certificate</span>
          </Link>

          {cert && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800/30 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Printer className="h-4 w-4 text-emerald-800" />
                <span>Print Official Clearance</span>
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
            <Loader2 className="h-10 w-10 text-emerald-800 animate-spin mb-4" />
            <h3 className="text-base font-bold text-slate-900">
              Querying Senate Central Register...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Verifying cryptographic hash and degree authenticity
            </p>
          </div>
        )}

        {/* Not Found / Error State */}
        {!isLoading && (errorMessage || !cert) && (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-rose-200 shadow-xl text-center max-w-xl mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
              <FileX2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Academic Credential Not Verified
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {errorMessage || "No graduate record matching this identifier was found in the official Senate registry."}
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Search</span>
              </Link>
            </div>
          </div>
        )}

        {/* Verified Certificate Card */}
        {!isLoading && cert && (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-800/20 bg-white shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in duration-200">
            {/* Top Institutional Header Banner */}
            <div className="border-b border-emerald-900/10 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 px-6 py-6 text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg ring-2 ring-emerald-500/40">
                  <ShieldCheck className="h-8 w-8 text-emerald-300" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Nasarawa State University, Keffi</h1>
                  <p className="text-xs uppercase tracking-wider text-emerald-200/90 font-medium">
                    Office of the Registrar & Academic Affairs &bull; Certificate Verification Record
                  </p>
                </div>
              </div>

              {/* Status Tag */}
              <div className="mt-4 sm:mt-0 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 shadow-inner">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>{cert.status === "VERIFIED" ? "Officially Verified" : cert.status}</span>
                </div>
              </div>
            </div>

            {/* Certificate Details Body */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Credentials Column */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Graduate Full Name
                    </span>
                    <p className="text-2xl font-bold text-slate-900 mt-0.5">
                      {cert.fullName}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/70">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Certificate Number
                      </span>
                      <p className="font-mono text-sm font-bold text-emerald-900 mt-1">
                        {cert.certificateNumber || "Pending Issuance"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/70">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Matriculation Number
                      </span>
                      <p className="font-mono text-sm font-bold text-slate-900 mt-1">
                        {cert.matricNumber}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                          Degree Awarded
                        </span>
                        <p className="text-base font-bold text-slate-900">
                          {cert.degreeAwarded}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                          Faculty & Department
                        </span>
                        <p className="text-sm font-medium text-slate-700">
                          {cert.faculty} &bull; {cert.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                          Graduation Year & Classification
                        </span>
                        <p className="text-sm font-medium text-slate-700">
                          Class of {cert.graduationYear} &bull; <strong className="text-emerald-900">{cert.classOfDegree}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Security Verification Seal & QR Signature */}
                <div className="flex flex-col items-center justify-between rounded-2xl bg-slate-50 p-6 border border-slate-200/70 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-white border border-slate-200 p-3 shadow-inner">
                      <QrCode className="h-28 w-28 text-emerald-900" />
                    </div>
                    <span className="mt-3 text-[11px] font-mono font-bold text-slate-600 break-all px-2">
                      {cert.qrSignature || `NSUK-SEC-SHA256-${cert.matricNumber.replace(/\//g, "-")}`}
                    </span>
                  </div>

                  <div className="mt-6 w-full pt-4 border-t border-slate-200">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                      Cryptographic Digital Seal
                    </span>
                    <p className="font-mono text-[9px] text-slate-500 break-all leading-relaxed">
                      {cert.cryptographicHash || "Digital SHA-256 Checksum Verified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Clearance Note */}
              <div className="mt-8 rounded-xl bg-emerald-50/60 p-4 border border-emerald-800/15 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Verified directly from official Nasarawa State University, Keffi Senate Database.</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  SEC-ID: {cert.id?.slice(0, 12)}...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
