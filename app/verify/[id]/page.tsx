"use client";

import React, { use } from "react";
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
  Share2,
  FileCheck
} from "lucide-react";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { lookupCertificate, normalizeCertificateId } from "@/lib/verification";

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

export default function VerifyResultPage({ params }: VerifyPageProps) {
  const resolvedParams = use(params);
  const rawId = resolvedParams.id;
  const cert = lookupCertificate(rawId);

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

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800/30 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 transition-colors"
            >
              <Printer className="h-4 w-4 text-emerald-800" />
              <span>Print Official Clearance</span>
            </button>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-800/20 bg-white shadow-2xl ring-1 ring-slate-900/5">
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
                <span>Officially Verified</span>
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
                      {cert.certificateNumber}
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
                    <Award className="h-5 w-5 text-emerald-800 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-slate-500">Degree & Specialization</span>
                      <p className="text-base font-semibold text-slate-900">{cert.degreeAwarded}</p>
                      <p className="text-xs font-medium text-emerald-800">{cert.classOfDegree}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-emerald-800 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-slate-500">Faculty & Department</span>
                      <p className="text-sm font-medium text-slate-800">{cert.faculty}</p>
                      <p className="text-xs text-slate-500">{cert.department}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-emerald-800 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-slate-500">Senate Approval & Issue Date</span>
                      <p className="text-sm font-medium text-slate-800">
                        Conferred: {cert.graduationYear} &bull; Issued: {cert.dateOfIssue}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cryptographic Security Box & Seal */}
              <div className="flex flex-col justify-between rounded-xl bg-emerald-50/50 p-5 border border-emerald-800/20 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-emerald-800/20 p-2">
                    <QrCode className="h-14 w-14 text-emerald-900" />
                  </div>
                  <span className="mt-3 text-xs font-bold uppercase tracking-wider text-emerald-950">
                    NSUK Cryptographic Seal
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Authentic Senate Hash
                  </span>
                </div>

                <div className="mt-4 rounded-lg bg-white p-2.5 text-left border border-emerald-800/10">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                    SHA-256 Checksum
                  </span>
                  <p className="font-mono text-[9px] text-slate-600 break-all leading-tight mt-1">
                    {cert.cryptographicHash}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-800/20 text-[11px] text-emerald-900 font-medium">
                  Verified by NSUK Central Academic Records Database
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Footer Seal */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>Official digital verification record valid for institutional clearance.</span>
            <span className="font-semibold text-emerald-900">Motto: Knowledge for Development</span>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
